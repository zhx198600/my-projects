from typing import List, Optional
from sqlalchemy import and_
from sqlalchemy.orm import Session
from decimal import Decimal
from datetime import datetime

from app.models import (
    Reimbursement,
    ExpenseApplication,
    BudgetData,
    Department,
    Subject,
    BudgetPeriod,
    User,
    Notification,
    ApprovalRecord,
)
from app.schemas import (
    ReimbursementCreate,
    ReimbursementUpdate,
    ReimbursementWithRelations,
    ReimbursementBudgetExecution,
)


class ReimbursementService:
    @staticmethod
    def _send_notification(
        db: Session,
        user_id: int,
        title: str,
        content: str,
        notification_type: str = "info",
        business_type: Optional[str] = None,
        business_id: Optional[int] = None,
    ):
        notification = Notification(
            user_id=user_id,
            title=title,
            content=content,
            notification_type=notification_type,
            business_type=business_type,
            business_id=business_id,
            is_read=False,
        )
        db.add(notification)
        db.commit()

    @staticmethod
    def _get_finance_approvers(db: Session) -> List[int]:
        approver_ids = []
        
        finance_role_users = db.query(User).join(User.roles).filter(
            User.roles.any(code="finance"),
            User.is_active == True
        ).all()
        approver_ids.extend([user.id for user in finance_role_users])
        
        admin_role_users = db.query(User).join(User.roles).filter(
            User.roles.any(code="admin"),
            User.is_active == True
        ).all()
        approver_ids.extend([user.id for user in admin_role_users])
        
        return list(set(approver_ids))

    @staticmethod
    def generate_reimbursement_no(db: Session) -> str:
        today = datetime.now()
        prefix = f"RM{today.strftime('%Y%m%d')}"

        last_reimbursement = db.query(Reimbursement).filter(
            Reimbursement.reimbursement_no.like(f"{prefix}%")
        ).order_by(Reimbursement.reimbursement_no.desc()).first()

        if last_reimbursement:
            sequence = int(last_reimbursement.reimbursement_no[-4:]) + 1
        else:
            sequence = 1

        return f"{prefix}{sequence:04d}"

    @staticmethod
    def convert_occupied_to_used(
        db: Session,
        department_id: int,
        subject_id: int,
        period_id: int,
        amount: Decimal,
    ) -> tuple[Optional[ReimbursementBudgetExecution], Optional[str]]:
        budget_items = db.query(BudgetData).filter(
            BudgetData.department_id == department_id,
            BudgetData.subject_id == subject_id,
            BudgetData.period_id == period_id,
            BudgetData.status == "approved",
        ).all()

        if not budget_items:
            return None, "未找到对应的预算数据"

        total_budget = sum((item.budget_amount or Decimal(0)) for item in budget_items)
        total_used_before = sum((item.used_amount or Decimal(0)) for item in budget_items)
        total_occupied_before = sum((item.occupied_amount or Decimal(0)) for item in budget_items)

        if total_occupied_before < amount:
            return None, f"预算占用金额不足，当前占用：{total_occupied_before}，需要：{amount}"

        remaining_amount = amount

        for budget_item in budget_items:
            if remaining_amount <= 0:
                break
            transfer_amount = min(budget_item.occupied_amount or Decimal(0), remaining_amount)
            budget_item.occupied_amount = (budget_item.occupied_amount or Decimal(0)) - transfer_amount
            budget_item.used_amount = (budget_item.used_amount or Decimal(0)) + transfer_amount
            remaining_amount -= transfer_amount

        db.commit()

        total_used_after = sum((item.used_amount or Decimal(0)) for item in budget_items)
        total_occupied_after = sum((item.occupied_amount or Decimal(0)) for item in budget_items)

        execution = ReimbursementBudgetExecution(
            budget_amount=total_budget,
            used_amount_before=total_used_before,
            occupied_amount_before=total_occupied_before,
            used_amount_after=total_used_after,
            occupied_amount_after=total_occupied_after,
            actual_amount=amount,
            difference_amount=amount,
        )

        return execution, None

    @staticmethod
    def handle_amount_difference(
        db: Session,
        department_id: int,
        subject_id: int,
        period_id: int,
        application_amount: Decimal,
        reimbursement_amount: Decimal,
    ) -> tuple[bool, Optional[str]]:
        difference = application_amount - reimbursement_amount

        if difference > 0:
            budget_items = db.query(BudgetData).filter(
                BudgetData.department_id == department_id,
                BudgetData.subject_id == subject_id,
                BudgetData.period_id == period_id,
                BudgetData.status == "approved",
                BudgetData.occupied_amount > 0,
            ).order_by(BudgetData.id.desc()).all()

            remaining_release = difference
            for budget_item in budget_items:
                if remaining_release <= 0:
                    break
                release_amount = min(budget_item.occupied_amount or Decimal(0), remaining_release)
                budget_item.occupied_amount = (budget_item.occupied_amount or Decimal(0)) - release_amount
                remaining_release -= release_amount

            db.commit()
            return True, None

        elif difference < 0:
            extra_amount = abs(difference)
            budget_items = db.query(BudgetData).filter(
                BudgetData.department_id == department_id,
                BudgetData.subject_id == subject_id,
                BudgetData.period_id == period_id,
                BudgetData.status == "approved",
            ).all()

            total_available = sum(
                (item.budget_amount or Decimal(0)) - (item.used_amount or Decimal(0)) - (item.occupied_amount or Decimal(0))
                for item in budget_items
            )

            if total_available < extra_amount:
                return False, f"超出预算，还需额外预算：{extra_amount}，可用余额：{total_available}"

            remaining_occupy = extra_amount
            for budget_item in budget_items:
                if remaining_occupy <= 0:
                    break
                available = (
                    (budget_item.budget_amount or Decimal(0))
                    - (budget_item.used_amount or Decimal(0))
                    - (budget_item.occupied_amount or Decimal(0))
                )
                if available <= 0:
                    continue
                occupy_amount = min(available, remaining_occupy)
                budget_item.occupied_amount = (budget_item.occupied_amount or Decimal(0)) + occupy_amount
                remaining_occupy -= occupy_amount

            db.commit()
            return True, None

        return True, None

    @staticmethod
    def create_reimbursement(
        db: Session,
        reimbursement_data: ReimbursementCreate,
        applicant_id: Optional[int] = None,
    ) -> tuple[Optional[Reimbursement], Optional[str]]:
        application = db.query(ExpenseApplication).filter(
            ExpenseApplication.id == reimbursement_data.application_id
        ).first()

        if not application:
            return None, "关联的费用申请不存在"

        if application.status not in ["approved", "reimbursed"]:
            return None, "只有已批准的费用申请才能创建报销单"

        existing_reimbursement = db.query(Reimbursement).filter(
            Reimbursement.application_id == reimbursement_data.application_id,
            Reimbursement.status.in_(["draft", "pending", "approved"]),
        ).first()

        if existing_reimbursement:
            return None, "该费用申请已有进行中的报销单"

        reimbursement = Reimbursement(
            reimbursement_no=ReimbursementService.generate_reimbursement_no(db),
            title=reimbursement_data.title,
            application_id=reimbursement_data.application_id,
            applicant_id=applicant_id,
            department_id=application.department_id,
            subject_id=application.subject_id,
            period_id=application.period_id,
            amount=reimbursement_data.amount,
            invoice_count=reimbursement_data.invoice_count or 0,
            description=reimbursement_data.description,
            status="draft",
        )

        db.add(reimbursement)
        db.commit()
        db.refresh(reimbursement)

        return reimbursement, None

    @staticmethod
    def submit_reimbursement(
        db: Session,
        reimbursement_id: int,
    ) -> tuple[Optional[Reimbursement], Optional[str]]:
        reimbursement = db.query(Reimbursement).filter(
            Reimbursement.id == reimbursement_id
        ).first()

        if not reimbursement:
            return None, "报销单不存在"

        if reimbursement.status != "draft":
            return None, "只有草稿状态的报销单才能提交"

        application = db.query(ExpenseApplication).filter(
            ExpenseApplication.id == reimbursement.application_id
        ).first()

        if application:
            difference = application.amount - reimbursement.amount
            if difference != 0:
                success, error = ReimbursementService.handle_amount_difference(
                    db,
                    reimbursement.department_id,
                    reimbursement.subject_id,
                    reimbursement.period_id,
                    application.amount,
                    reimbursement.amount,
                )
                if not success:
                    return None, error

        reimbursement.status = "pending"
        db.commit()
        db.refresh(reimbursement)

        approver_ids = ReimbursementService._get_finance_approvers(db)
        applicant_name = reimbursement.applicant.full_name if reimbursement.applicant else "未知用户"
        
        for approver_id in approver_ids:
            ReimbursementService._send_notification(
                db,
                user_id=approver_id,
                title=f"报销单待审核 - {reimbursement.reimbursement_no}",
                content=f"申请人：{applicant_name}\n报销金额：¥{reimbursement.amount}\n请及时审核！",
                notification_type="info",
                business_type="reimbursement",
                business_id=reimbursement.id,
            )

        return reimbursement, None

    @staticmethod
    def approve_reimbursement(
        db: Session,
        reimbursement_id: int,
        approver_id: int,
        comment: Optional[str] = None,
    ) -> tuple[Optional[Reimbursement], Optional[ReimbursementBudgetExecution], Optional[str]]:
        reimbursement = db.query(Reimbursement).filter(
            Reimbursement.id == reimbursement_id
        ).first()

        if not reimbursement:
            return None, None, "报销单不存在"

        if reimbursement.status != "pending":
            return None, None, "只有待审核状态的报销单才能批准"

        execution, error = ReimbursementService.convert_occupied_to_used(
            db,
            reimbursement.department_id,
            reimbursement.subject_id,
            reimbursement.period_id,
            reimbursement.amount,
        )

        if error:
            return None, None, error

        approval_record = ApprovalRecord(
            business_type="reimbursement",
            business_id=reimbursement.id,
            approver_id=approver_id,
            status="approved",
            comment=comment,
            approval_order=1,
        )
        db.add(approval_record)

        reimbursement.status = "approved"
        db.commit()
        db.refresh(reimbursement)

        application = db.query(ExpenseApplication).filter(
            ExpenseApplication.id == reimbursement.application_id
        ).first()
        
        if application:
            application.status = "reimbursed"
            db.commit()

        if reimbursement.applicant_id:
            ReimbursementService._send_notification(
                db,
                user_id=reimbursement.applicant_id,
                title=f"报销单已批准 - {reimbursement.reimbursement_no}",
                content=f"您的报销单已通过审核，报销金额：¥{reimbursement.amount}",
                notification_type="success",
                business_type="reimbursement",
                business_id=reimbursement.id,
            )

        return reimbursement, execution, None

    @staticmethod
    def reject_reimbursement(
        db: Session,
        reimbursement_id: int,
        approver_id: int,
        comment: str,
    ) -> tuple[Optional[Reimbursement], Optional[str]]:
        reimbursement = db.query(Reimbursement).filter(
            Reimbursement.id == reimbursement_id
        ).first()

        if not reimbursement:
            return None, "报销单不存在"

        if reimbursement.status != "pending":
            return None, "只有待审核状态的报销单才能驳回"

        approval_record = ApprovalRecord(
            business_type="reimbursement",
            business_id=reimbursement.id,
            approver_id=approver_id,
            status="rejected",
            comment=comment,
            approval_order=1,
        )
        db.add(approval_record)

        reimbursement.status = "rejected"
        db.commit()
        db.refresh(reimbursement)

        if reimbursement.applicant_id:
            ReimbursementService._send_notification(
                db,
                user_id=reimbursement.applicant_id,
                title=f"报销单已驳回 - {reimbursement.reimbursement_no}",
                content=f"您的报销单已被驳回，驳回原因：{comment}",
                notification_type="error",
                business_type="reimbursement",
                business_id=reimbursement.id,
            )

        return reimbursement, None

    @staticmethod
    def get_approval_records(
        db: Session,
        reimbursement_id: int,
    ) -> List[ApprovalRecord]:
        return db.query(ApprovalRecord).filter(
            ApprovalRecord.business_type == "reimbursement",
            ApprovalRecord.business_id == reimbursement_id
        ).order_by(ApprovalRecord.created_at.desc()).all()

    @staticmethod
    def get_reimbursements(
        db: Session,
        status: Optional[str] = None,
        department_id: Optional[int] = None,
        period_id: Optional[int] = None,
        subject_id: Optional[int] = None,
        applicant_id: Optional[int] = None,
        skip: int = 0,
        limit: int = 100,
    ) -> tuple[int, List[Reimbursement]]:
        query = db.query(Reimbursement)

        if status:
            query = query.filter(Reimbursement.status == status)
        if department_id:
            query = query.filter(Reimbursement.department_id == department_id)
        if period_id:
            query = query.filter(Reimbursement.period_id == period_id)
        if subject_id:
            query = query.filter(Reimbursement.subject_id == subject_id)
        if applicant_id:
            query = query.filter(Reimbursement.applicant_id == applicant_id)

        total = query.count()
        reimbursements = query.order_by(Reimbursement.id.desc()).offset(skip).limit(limit).all()

        return total, reimbursements

    @staticmethod
    def get_reimbursement_by_id(
        db: Session,
        reimbursement_id: int,
    ) -> Optional[Reimbursement]:
        return db.query(Reimbursement).filter(
            Reimbursement.id == reimbursement_id
        ).first()

    @staticmethod
    def add_relations_to_reimbursement(
        db: Session,
        reimbursement: Reimbursement,
    ) -> ReimbursementWithRelations:
        result = ReimbursementWithRelations.model_validate(reimbursement)

        if reimbursement.applicant:
            result.applicant_name = reimbursement.applicant.full_name or reimbursement.applicant.username
        if reimbursement.department:
            result.department_name = reimbursement.department.name
        if reimbursement.subject:
            result.subject_name = reimbursement.subject.name
        if reimbursement.period:
            result.period_name = reimbursement.period.name

        application = db.query(ExpenseApplication).filter(
            ExpenseApplication.id == reimbursement.application_id
        ).first()
        
        if application:
            result.application_amount = application.amount
            result.amount_diff = reimbursement.amount - application.amount

        return result

    @staticmethod
    def get_budget_execution_detail(
        db: Session,
        reimbursement_id: int,
    ) -> Optional[ReimbursementBudgetExecution]:
        reimbursement = db.query(Reimbursement).filter(
            Reimbursement.id == reimbursement_id
        ).first()

        if not reimbursement or reimbursement.status != "approved":
            return None

        budget_items = db.query(BudgetData).filter(
            BudgetData.department_id == reimbursement.department_id,
            BudgetData.subject_id == reimbursement.subject_id,
            BudgetData.period_id == reimbursement.period_id,
            BudgetData.status == "approved",
        ).all()

        if not budget_items:
            return None

        total_budget = sum((item.budget_amount or Decimal(0)) for item in budget_items)
        total_used = sum((item.used_amount or Decimal(0)) for item in budget_items)
        total_occupied = sum((item.occupied_amount or Decimal(0)) for item in budget_items)

        return ReimbursementBudgetExecution(
            budget_amount=total_budget,
            used_amount_before=total_used - reimbursement.amount,
            occupied_amount_before=total_occupied + reimbursement.amount,
            used_amount_after=total_used,
            occupied_amount_after=total_occupied,
            actual_amount=reimbursement.amount,
            difference_amount=reimbursement.amount,
        )
