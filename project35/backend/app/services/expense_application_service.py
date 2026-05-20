from typing import List, Optional
from sqlalchemy import and_
from sqlalchemy.orm import Session
from decimal import Decimal
from datetime import datetime

from app.models import (
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
    ExpenseApplicationCreate,
    ExpenseApplicationUpdate,
    ExpenseApplicationWithRelations,
    BudgetBalanceResponse,
)


class ExpenseApplicationService:
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
    def _get_special_approvers(db: Session, department_id: Optional[int] = None) -> List[int]:
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
    def get_budget_balance(
        db: Session,
        department_id: int,
        subject_id: int,
        period_id: int,
    ) -> BudgetBalanceResponse:
        budget_items = db.query(BudgetData).filter(
            BudgetData.department_id == department_id,
            BudgetData.subject_id == subject_id,
            BudgetData.period_id == period_id,
            BudgetData.status == "approved",
        ).all()

        total_budget = sum((item.budget_amount or Decimal(0)) for item in budget_items)
        total_used = sum((item.used_amount or Decimal(0)) for item in budget_items)
        total_occupied = sum((item.occupied_amount or Decimal(0)) for item in budget_items)

        available_balance = total_budget - total_used - total_occupied

        return BudgetBalanceResponse(
            budget_amount=total_budget,
            used_amount=total_used,
            occupied_amount=total_occupied,
            available_balance=available_balance,
            is_sufficient=available_balance > 0,
        )

    @staticmethod
    def check_budget_sufficiency(
        db: Session,
        department_id: int,
        subject_id: int,
        period_id: int,
        amount: Decimal,
    ) -> tuple[bool, BudgetBalanceResponse]:
        balance = ExpenseApplicationService.get_budget_balance(
            db, department_id, subject_id, period_id
        )
        is_sufficient = balance.available_balance >= amount
        return is_sufficient, balance

    @staticmethod
    def occupy_budget(
        db: Session,
        department_id: int,
        subject_id: int,
        period_id: int,
        amount: Decimal,
    ) -> bool:
        budget_items = db.query(BudgetData).filter(
            BudgetData.department_id == department_id,
            BudgetData.subject_id == subject_id,
            BudgetData.period_id == period_id,
            BudgetData.status == "approved",
        ).all()

        if not budget_items:
            return False

        remaining_amount = amount

        for budget_item in budget_items:
            available = budget_item.budget_amount - budget_item.used_amount - budget_item.occupied_amount
            if available <= 0:
                continue

            occupy_amount = min(available, remaining_amount)
            budget_item.occupied_amount = (budget_item.occupied_amount or Decimal(0)) + occupy_amount
            remaining_amount -= occupy_amount

            if remaining_amount <= 0:
                break

        db.commit()
        return remaining_amount <= 0

    @staticmethod
    def release_budget(
        db: Session,
        department_id: int,
        subject_id: int,
        period_id: int,
        amount: Decimal,
    ) -> bool:
        budget_items = db.query(BudgetData).filter(
            BudgetData.department_id == department_id,
            BudgetData.subject_id == subject_id,
            BudgetData.period_id == period_id,
            BudgetData.status == "approved",
            BudgetData.occupied_amount > 0,
        ).order_by(BudgetData.id.desc()).all()

        if not budget_items:
            return False

        remaining_amount = amount

        for budget_item in budget_items:
            release_amount = min(budget_item.occupied_amount or Decimal(0), remaining_amount)
            budget_item.occupied_amount = (budget_item.occupied_amount or Decimal(0)) - release_amount
            remaining_amount -= release_amount

            if remaining_amount <= 0:
                break

        db.commit()
        return remaining_amount <= 0

    @staticmethod
    def generate_application_no(db: Session) -> str:
        today = datetime.now()
        prefix = f"EA{today.strftime('%Y%m%d')}"

        last_application = db.query(ExpenseApplication).filter(
            ExpenseApplication.application_no.like(f"{prefix}%")
        ).order_by(ExpenseApplication.application_no.desc()).first()

        if last_application:
            sequence = int(last_application.application_no[-4:]) + 1
        else:
            sequence = 1

        return f"{prefix}{sequence:04d}"

    @staticmethod
    def create_application(
        db: Session,
        application_data: ExpenseApplicationCreate,
        applicant_id: Optional[int] = None,
        auto_submit: bool = False,
    ) -> tuple[ExpenseApplication, Optional[str]]:
        is_sufficient, balance = ExpenseApplicationService.check_budget_sufficiency(
            db,
            application_data.department_id,
            application_data.subject_id,
            application_data.period_id,
            application_data.amount,
        )

        status = "pending" if auto_submit else "draft"

        application = ExpenseApplication(
            application_no=ExpenseApplicationService.generate_application_no(db),
            title=application_data.title,
            applicant_id=applicant_id,
            department_id=application_data.department_id,
            subject_id=application_data.subject_id,
            period_id=application_data.period_id,
            amount=application_data.amount,
            reason=application_data.reason,
            status=status,
            is_over_budget=0 if is_sufficient else 1,
        )

        db.add(application)
        db.commit()
        db.refresh(application)

        if auto_submit:
            if is_sufficient:
                success = ExpenseApplicationService.occupy_budget(
                    db,
                    application_data.department_id,
                    application_data.subject_id,
                    application_data.period_id,
                    application_data.amount,
                )
                if not success:
                    return application, "预算占用失败"
            else:
                ExpenseApplicationService._handle_over_budget_submit(db, application)

        return application, None

    @staticmethod
    def _handle_over_budget_submit(db: Session, application: ExpenseApplication):
        applicant_name = application.applicant.full_name if application.applicant else "未知用户"
        department_name = application.department.name if application.department else "未知部门"
        
        notification_title = f"超预算申请预警 - {application.application_no}"
        notification_content = (
            f"申请人：{applicant_name}\n"
            f"部门：{department_name}\n"
            f"申请金额：¥{application.amount}\n"
            f"申请事由：{application.reason or '无'}\n"
            f"该申请已超出预算余额，请及时审批！"
        )

        approver_ids = ExpenseApplicationService._get_special_approvers(db, application.department_id)
        for approver_id in approver_ids:
            ExpenseApplicationService._send_notification(
                db,
                user_id=approver_id,
                title=notification_title,
                content=notification_content,
                notification_type="warning",
                business_type="expense_application",
                business_id=application.id,
            )

        if application.applicant_id:
            ExpenseApplicationService._send_notification(
                db,
                user_id=application.applicant_id,
                title=f"申请已提交 - {application.application_no}",
                content="您的费用申请已提交，因超出预算需特殊审批，请耐心等待。",
                notification_type="info",
                business_type="expense_application",
                business_id=application.id,
            )

    @staticmethod
    def submit_application(
        db: Session,
        application_id: int,
    ) -> tuple[Optional[ExpenseApplication], Optional[str]]:
        application = db.query(ExpenseApplication).filter(
            ExpenseApplication.id == application_id
        ).first()

        if not application:
            return None, "费用申请不存在"

        if application.status != "draft":
            return None, "只有草稿状态的申请才能提交"

        is_sufficient, balance = ExpenseApplicationService.check_budget_sufficiency(
            db,
            application.department_id,
            application.subject_id,
            application.period_id,
            application.amount,
        )

        if not is_sufficient:
            application.status = "pending"
            application.is_over_budget = 1
            db.commit()
            db.refresh(application)
            ExpenseApplicationService._handle_over_budget_submit(db, application)
            return application, "预算不足，申请已提交等待特殊审批"

        success = ExpenseApplicationService.occupy_budget(
            db,
            application.department_id,
            application.subject_id,
            application.period_id,
            application.amount,
        )

        if not success:
            return None, "预算占用失败"

        application.status = "pending"
        application.is_over_budget = 0
        db.commit()
        db.refresh(application)

        return application, None

    @staticmethod
    def approve_over_budget_application(
        db: Session,
        application_id: int,
        approver_id: int,
        comment: Optional[str] = None,
    ) -> tuple[Optional[ExpenseApplication], Optional[str]]:
        application = db.query(ExpenseApplication).filter(
            ExpenseApplication.id == application_id
        ).first()

        if not application:
            return None, "费用申请不存在"

        if application.status != "pending" or application.is_over_budget != 1:
            return None, "只有超预算待审批的申请才能进行特殊审批"

        success = ExpenseApplicationService.occupy_budget(
            db,
            application.department_id,
            application.subject_id,
            application.period_id,
            application.amount,
        )

        if not success:
            return None, "预算占用失败"

        approval_record = ApprovalRecord(
            business_type="expense_application",
            business_id=application.id,
            approver_id=approver_id,
            status="approved",
            comment=comment,
            approval_order=1,
        )
        db.add(approval_record)

        application.status = "approved"
        db.commit()
        db.refresh(application)

        if application.applicant_id:
            ExpenseApplicationService._send_notification(
                db,
                user_id=application.applicant_id,
                title=f"申请已批准 - {application.application_no}",
                content="您的超预算费用申请已通过特殊审批，预算已占用。",
                notification_type="success",
                business_type="expense_application",
                business_id=application.id,
            )

        return application, None

    @staticmethod
    def reject_over_budget_application(
        db: Session,
        application_id: int,
        approver_id: int,
        comment: str,
    ) -> tuple[Optional[ExpenseApplication], Optional[str]]:
        application = db.query(ExpenseApplication).filter(
            ExpenseApplication.id == application_id
        ).first()

        if not application:
            return None, "费用申请不存在"

        if application.status != "pending" or application.is_over_budget != 1:
            return None, "只有超预算待审批的申请才能进行特殊审批"

        approval_record = ApprovalRecord(
            business_type="expense_application",
            business_id=application.id,
            approver_id=approver_id,
            status="rejected",
            comment=comment,
            approval_order=1,
        )
        db.add(approval_record)

        application.status = "rejected"
        db.commit()
        db.refresh(application)

        if application.applicant_id:
            ExpenseApplicationService._send_notification(
                db,
                user_id=application.applicant_id,
                title=f"申请已驳回 - {application.application_no}",
                content=f"您的超预算费用申请已被驳回，驳回原因：{comment}",
                notification_type="error",
                business_type="expense_application",
                business_id=application.id,
            )

        return application, None

    @staticmethod
    def update_application_status(
        db: Session,
        application_id: int,
        new_status: str,
    ) -> tuple[Optional[ExpenseApplication], Optional[str]]:
        application = db.query(ExpenseApplication).filter(
            ExpenseApplication.id == application_id
        ).first()

        if not application:
            return None, "费用申请不存在"

        if new_status == "rejected" and application.status in ["pending", "approved"]:
            ExpenseApplicationService.release_budget(
                db,
                application.department_id,
                application.subject_id,
                application.period_id,
                application.amount,
            )

        if new_status == "reimbursed" and application.status == "approved":
            budget_items = db.query(BudgetData).filter(
                BudgetData.department_id == application.department_id,
                BudgetData.subject_id == application.subject_id,
                BudgetData.period_id == application.period_id,
                BudgetData.status == "approved",
            ).all()

            remaining_amount = application.amount
            for budget_item in budget_items:
                if remaining_amount <= 0:
                    break
                transfer_amount = min(budget_item.occupied_amount or Decimal(0), remaining_amount)
                budget_item.occupied_amount = (budget_item.occupied_amount or Decimal(0)) - transfer_amount
                budget_item.used_amount = (budget_item.used_amount or Decimal(0)) + transfer_amount
                remaining_amount -= transfer_amount

            db.commit()

        application.status = new_status
        db.commit()
        db.refresh(application)

        return application, None

    @staticmethod
    def get_approval_records(
        db: Session,
        application_id: int,
    ) -> List[ApprovalRecord]:
        return db.query(ApprovalRecord).filter(
            ApprovalRecord.business_type == "expense_application",
            ApprovalRecord.business_id == application_id
        ).order_by(ApprovalRecord.created_at.desc()).all()

    @staticmethod
    def get_applications(
        db: Session,
        status: Optional[str] = None,
        department_id: Optional[int] = None,
        period_id: Optional[int] = None,
        subject_id: Optional[int] = None,
        applicant_id: Optional[int] = None,
        skip: int = 0,
        limit: int = 100,
    ) -> tuple[int, List[ExpenseApplication]]:
        query = db.query(ExpenseApplication)

        if status:
            query = query.filter(ExpenseApplication.status == status)
        if department_id:
            query = query.filter(ExpenseApplication.department_id == department_id)
        if period_id:
            query = query.filter(ExpenseApplication.period_id == period_id)
        if subject_id:
            query = query.filter(ExpenseApplication.subject_id == subject_id)
        if applicant_id:
            query = query.filter(ExpenseApplication.applicant_id == applicant_id)

        total = query.count()
        applications = query.order_by(ExpenseApplication.id.desc()).offset(skip).limit(limit).all()

        return total, applications

    @staticmethod
    def get_application_by_id(
        db: Session,
        application_id: int,
    ) -> Optional[ExpenseApplication]:
        return db.query(ExpenseApplication).filter(
            ExpenseApplication.id == application_id
        ).first()

    @staticmethod
    def add_relations_to_application(
        db: Session,
        application: ExpenseApplication,
    ) -> ExpenseApplicationWithRelations:
        result = ExpenseApplicationWithRelations.model_validate(application)

        if application.applicant:
            result.applicant_name = application.applicant.full_name or application.applicant.username
        if application.department:
            result.department_name = application.department.name
        if application.subject:
            result.subject_name = application.subject.name
        if application.period:
            result.period_name = application.period.name

        return result
