from typing import List, Optional, Dict, Any
from sqlalchemy import func, and_
from sqlalchemy.orm import Session
from decimal import Decimal
from datetime import datetime

from app.models import (
    BudgetData,
    BudgetSummary,
    BudgetVersion,
    BudgetAdjustmentRecord,
    Department,
    Subject,
    BudgetPeriod,
    BudgetTemplate,
    User,
)
from app.schemas import (
    BudgetSummaryCreate,
    BudgetSummaryWithRelations,
    BudgetVersionCreate,
    BudgetVersionWithRelations,
    BudgetVersionDiffResponse,
    BudgetVersionDiffItem,
    BudgetAdjustmentCreate,
    BudgetAdjustmentResponse,
    BudgetAdjustmentRecordWithRelations,
)


class BudgetSummaryService:
    @staticmethod
    def generate_summary(
        db: Session,
        template_id: int,
        period_id: int,
        department_id: Optional[int] = None,
        version: int = 1,
    ) -> List[BudgetSummary]:
        db.query(BudgetSummary).filter(
            BudgetSummary.template_id == template_id,
            BudgetSummary.period_id == period_id,
            BudgetSummary.version == version,
        ).delete()

        query = db.query(BudgetData).filter(
            BudgetData.template_id == template_id,
            BudgetData.period_id == period_id,
            BudgetData.status == "approved",
            BudgetData.version == version,
        )

        if department_id:
            query = query.filter(BudgetData.department_id == department_id)

        budget_items = query.all()

        summaries = []

        for item in budget_items:
            summary = BudgetSummary(
                template_id=template_id,
                period_id=period_id,
                department_id=item.department_id,
                subject_id=item.subject_id,
                month=item.month,
                budget_amount=item.budget_amount,
                used_amount=item.used_amount or 0,
                occupied_amount=item.occupied_amount or 0,
                summary_type="detail",
                version=version,
            )
            summaries.append(summary)

        BudgetSummaryService._generate_aggregate_summaries(
            db, summaries, template_id, period_id, version
        )

        for summary in summaries:
            db.add(summary)
        db.commit()

        return summaries

    @staticmethod
    def _generate_aggregate_summaries(
        db: Session,
        summaries: List[BudgetSummary],
        template_id: int,
        period_id: int,
        version: int,
    ):
        dept_subject_totals: Dict[tuple, Dict[str, Decimal]] = {}
        dept_totals: Dict[tuple, Dict[str, Decimal]] = {}
        subject_totals: Dict[tuple, Dict[str, Decimal]] = {}
        grand_totals: Dict[str, Decimal] = {
            "budget_amount": Decimal(0),
            "used_amount": Decimal(0),
            "occupied_amount": Decimal(0),
        }

        for item in summaries:
            key = (item.department_id, item.subject_id, item.month)
            if key not in dept_subject_totals:
                dept_subject_totals[key] = {
                    "budget_amount": Decimal(0),
                    "used_amount": Decimal(0),
                    "occupied_amount": Decimal(0),
                }
            dept_subject_totals[key]["budget_amount"] += item.budget_amount or Decimal(0)
            dept_subject_totals[key]["used_amount"] += item.used_amount or Decimal(0)
            dept_subject_totals[key]["occupied_amount"] += item.occupied_amount or Decimal(0)

            dept_key = (item.department_id, item.month)
            if dept_key not in dept_totals:
                dept_totals[dept_key] = {
                    "budget_amount": Decimal(0),
                    "used_amount": Decimal(0),
                    "occupied_amount": Decimal(0),
                }
            dept_totals[dept_key]["budget_amount"] += item.budget_amount or Decimal(0)
            dept_totals[dept_key]["used_amount"] += item.used_amount or Decimal(0)
            dept_totals[dept_key]["occupied_amount"] += item.occupied_amount or Decimal(0)

            subject_key = (item.subject_id, item.month)
            if subject_key not in subject_totals:
                subject_totals[subject_key] = {
                    "budget_amount": Decimal(0),
                    "used_amount": Decimal(0),
                    "occupied_amount": Decimal(0),
                }
            subject_totals[subject_key]["budget_amount"] += item.budget_amount or Decimal(0)
            subject_totals[subject_key]["used_amount"] += item.used_amount or Decimal(0)
            subject_totals[subject_key]["occupied_amount"] += item.occupied_amount or Decimal(0)

            grand_totals["budget_amount"] += item.budget_amount or Decimal(0)
            grand_totals["used_amount"] += item.used_amount or Decimal(0)
            grand_totals["occupied_amount"] += item.occupied_amount or Decimal(0)

        for (dept_id, month), totals in dept_totals.items():
            summaries.append(
                BudgetSummary(
                    template_id=template_id,
                    period_id=period_id,
                    department_id=dept_id,
                    subject_id=None,
                    month=month,
                    budget_amount=totals["budget_amount"],
                    used_amount=totals["used_amount"],
                    occupied_amount=totals["occupied_amount"],
                    summary_type="department_total",
                    version=version,
                )
            )

        for (subject_id, month), totals in subject_totals.items():
            summaries.append(
                BudgetSummary(
                    template_id=template_id,
                    period_id=period_id,
                    department_id=None,
                    subject_id=subject_id,
                    month=month,
                    budget_amount=totals["budget_amount"],
                    used_amount=totals["used_amount"],
                    occupied_amount=totals["occupied_amount"],
                    summary_type="subject_total",
                    version=version,
                )
            )

        summaries.append(
            BudgetSummary(
                template_id=template_id,
                period_id=period_id,
                department_id=None,
                subject_id=None,
                month=None,
                budget_amount=grand_totals["budget_amount"],
                used_amount=grand_totals["used_amount"],
                occupied_amount=grand_totals["occupied_amount"],
                summary_type="grand_total",
                version=version,
            )
        )

    @staticmethod
    def get_summaries(
        db: Session,
        template_id: Optional[int] = None,
        period_id: Optional[int] = None,
        department_id: Optional[int] = None,
        subject_id: Optional[int] = None,
        month: Optional[int] = None,
        summary_type: Optional[str] = None,
        version: Optional[int] = None,
        skip: int = 0,
        limit: int = 100,
    ) -> tuple[int, List[BudgetSummary]]:
        query = db.query(BudgetSummary)

        if template_id:
            query = query.filter(BudgetSummary.template_id == template_id)
        if period_id:
            query = query.filter(BudgetSummary.period_id == period_id)
        if department_id:
            query = query.filter(BudgetSummary.department_id == department_id)
        if subject_id:
            query = query.filter(BudgetSummary.subject_id == subject_id)
        if month:
            query = query.filter(BudgetSummary.month == month)
        if summary_type:
            query = query.filter(BudgetSummary.summary_type == summary_type)
        if version:
            query = query.filter(BudgetSummary.version == version)

        total = query.count()
        summaries = query.order_by(BudgetSummary.id.desc()).offset(skip).limit(limit).all()

        return total, summaries

    @staticmethod
    def add_relations_to_summary(
        db: Session, summary: BudgetSummary
    ) -> BudgetSummaryWithRelations:
        result = BudgetSummaryWithRelations.model_validate(summary)
        if summary.template:
            result.template_name = summary.template.name
        if summary.period:
            result.period_name = summary.period.name
        if summary.department:
            result.department_name = summary.department.name
        if summary.subject:
            result.subject_name = summary.subject.name
        return result

    @staticmethod
    def create_new_version(
        db: Session,
        template_id: int,
        period_id: int,
        department_id: Optional[int],
        version_name: str,
        description: str,
        created_by: int,
    ) -> BudgetVersion:
        max_version = (
            db.query(func.max(BudgetVersion.version_number))
            .filter(
                BudgetVersion.template_id == template_id,
                BudgetVersion.period_id == period_id,
                BudgetVersion.department_id == department_id,
            )
            .scalar()
            or 0
        )

        new_version = BudgetVersion(
            template_id=template_id,
            period_id=period_id,
            department_id=department_id,
            version_number=max_version + 1,
            version_name=version_name,
            description=description,
            created_by=created_by,
            is_active="Y",
        )

        db.add(new_version)
        db.commit()
        db.refresh(new_version)

        return new_version

    @staticmethod
    def get_versions(
        db: Session,
        template_id: Optional[int] = None,
        period_id: Optional[int] = None,
        department_id: Optional[int] = None,
        is_active: Optional[str] = None,
        skip: int = 0,
        limit: int = 100,
    ) -> tuple[int, List[BudgetVersion]]:
        query = db.query(BudgetVersion)

        if template_id:
            query = query.filter(BudgetVersion.template_id == template_id)
        if period_id:
            query = query.filter(BudgetVersion.period_id == period_id)
        if department_id:
            query = query.filter(BudgetVersion.department_id == department_id)
        if is_active:
            query = query.filter(BudgetVersion.is_active == is_active)

        total = query.count()
        versions = query.order_by(BudgetVersion.version_number.desc()).offset(skip).limit(limit).all()

        return total, versions

    @staticmethod
    def add_relations_to_version(
        db: Session, version: BudgetVersion
    ) -> BudgetVersionWithRelations:
        result = BudgetVersionWithRelations.model_validate(version)
        if version.template:
            result.template_name = version.template.name
        if version.period:
            result.period_name = version.period.name
        if version.department:
            result.department_name = version.department.name
        if version.creator:
            result.creator_name = version.creator.full_name or version.creator.username
        return result

    @staticmethod
    def compare_versions(
        db: Session,
        template_id: int,
        period_id: int,
        version1: int,
        version2: int,
        department_id: Optional[int] = None,
    ) -> BudgetVersionDiffResponse:
        v1_query = db.query(BudgetData).filter(
            BudgetData.template_id == template_id,
            BudgetData.period_id == period_id,
            BudgetData.version == version1,
            BudgetData.status == "approved",
        )
        v2_query = db.query(BudgetData).filter(
            BudgetData.template_id == template_id,
            BudgetData.period_id == period_id,
            BudgetData.version == version2,
            BudgetData.status == "approved",
        )

        if department_id:
            v1_query = v1_query.filter(BudgetData.department_id == department_id)
            v2_query = v2_query.filter(BudgetData.department_id == department_id)

        v1_data = v1_query.all()
        v2_data = v2_query.all()

        v1_dict = {
            (item.department_id, item.subject_id, item.month): item for item in v1_data
        }
        v2_dict = {
            (item.department_id, item.subject_id, item.month): item for item in v2_data
        }

        all_keys = set(v1_dict.keys()) | set(v2_dict.keys())

        diff_items = []
        changed_count = 0
        unchanged_count = 0

        departments = {d.id: d.name for d in db.query(Department).all()}
        subjects = {s.id: s.name for s in db.query(Subject).all()}

        for key in all_keys:
            dept_id, subject_id, month = key
            v1_item = v1_dict.get(key)
            v2_item = v2_dict.get(key)

            v1_amount = v1_item.budget_amount if v1_item else Decimal(0)
            v2_amount = v2_item.budget_amount if v2_item else Decimal(0)

            difference = v2_amount - v1_amount

            if v1_item and v2_item:
                if v1_amount != v2_amount:
                    change_type = "modified"
                    changed_count += 1
                else:
                    change_type = "unchanged"
                    unchanged_count += 1
            elif v2_item and not v1_item:
                change_type = "added"
                changed_count += 1
            else:
                change_type = "removed"
                changed_count += 1

            diff_items.append(
                BudgetVersionDiffItem(
                    department_id=dept_id,
                    department_name=departments.get(dept_id) if dept_id else None,
                    subject_id=subject_id,
                    subject_name=subjects.get(subject_id) if subject_id else None,
                    month=month,
                    old_amount=v1_amount if v1_item else None,
                    new_amount=v2_amount if v2_item else None,
                    difference=difference,
                    change_type=change_type,
                )
            )

        return BudgetVersionDiffResponse(
            version1=version1,
            version2=version2,
            total_items=len(all_keys),
            changed_items=changed_count,
            unchanged_items=unchanged_count,
            diff_items=diff_items,
        )

    @staticmethod
    def adjust_budget(
        db: Session,
        adjustment_data: BudgetAdjustmentCreate,
        adjusted_by: int,
    ) -> BudgetAdjustmentResponse:
        budget_data = db.query(BudgetData).filter(BudgetData.id == adjustment_data.budget_data_id).first()
        if not budget_data:
            return BudgetAdjustmentResponse(
                success=False,
                message="预算数据不存在",
                new_version=0,
            )

        if budget_data.status != "approved":
            return BudgetAdjustmentResponse(
                success=False,
                message="只有已批准的预算才能调整",
                new_version=0,
            )

        old_version = budget_data.version
        old_amount = budget_data.budget_amount

        new_version = old_version + 1

        new_budget_data = BudgetData(
            template_id=budget_data.template_id,
            period_id=budget_data.period_id,
            department_id=budget_data.department_id,
            subject_id=budget_data.subject_id,
            month=budget_data.month,
            budget_amount=adjustment_data.new_amount,
            used_amount=budget_data.used_amount,
            occupied_amount=budget_data.occupied_amount,
            status="approved",
            version=new_version,
            created_by=adjusted_by,
        )

        db.add(new_budget_data)

        adjustment_record = BudgetAdjustmentRecord(
            budget_data_id=budget_data.id,
            old_version=old_version,
            new_version=new_version,
            old_amount=old_amount,
            new_amount=adjustment_data.new_amount,
            adjustment_reason=adjustment_data.adjustment_reason,
            adjusted_by=adjusted_by,
        )
        db.add(adjustment_record)
        db.commit()
        db.refresh(adjustment_record)

        record_with_relations = BudgetAdjustmentRecordWithRelations.model_validate(adjustment_record)
        if budget_data.template:
            record_with_relations.template_name = budget_data.template.name
        if budget_data.period:
            record_with_relations.period_name = budget_data.period.name
        if budget_data.department:
            record_with_relations.department_name = budget_data.department.name
        if budget_data.subject:
            record_with_relations.subject_name = budget_data.subject.name

        return BudgetAdjustmentResponse(
            success=True,
            message="预算调整成功",
            new_version=new_version,
            adjustment_record=record_with_relations,
        )
