from typing import List, Optional, Any
from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_user
from app.models import User, BudgetSummary
from app.services.export_service import ExportService
from app.services.budget_summary_service import BudgetSummaryService

router = APIRouter()


@router.get("/budget-summary/excel")
def export_budget_summary_excel(
    template_id: Optional[int] = None,
    period_id: Optional[int] = None,
    department_id: Optional[int] = None,
    subject_id: Optional[int] = None,
    month: Optional[int] = None,
    summary_type: Optional[str] = None,
    version: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        _, summaries = BudgetSummaryService.get_summaries(
            db=db,
            template_id=template_id,
            period_id=period_id,
            department_id=department_id,
            subject_id=subject_id,
            month=month,
            summary_type=summary_type,
            version=version,
            skip=0,
            limit=10000,
        )

        summary_data = []
        for s in summaries:
            s_with_relations = BudgetSummaryService.add_relations_to_summary(db, s)
            summary_data.append({
                "template_name": s_with_relations.template_name,
                "period_name": s_with_relations.period_name,
                "department_name": s_with_relations.department_name,
                "subject_name": s_with_relations.subject_name,
                "month": s_with_relations.month,
                "summary_type": s_with_relations.summary_type,
                "version": s_with_relations.version,
                "budget_amount": s_with_relations.budget_amount,
                "used_amount": s_with_relations.used_amount,
                "occupied_amount": s_with_relations.occupied_amount,
            })

        output = ExportService.export_budget_summary_to_excel(summary_data)
        filename = ExportService.generate_filename("预算汇总报表", "xlsx")

        return StreamingResponse(
            output,
            media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            headers={"Content-Disposition": f"attachment; filename*=UTF-8''{filename}"}
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"导出Excel失败: {str(e)}")


@router.get("/budget-summary/pdf")
def export_budget_summary_pdf(
    template_id: Optional[int] = None,
    period_id: Optional[int] = None,
    department_id: Optional[int] = None,
    subject_id: Optional[int] = None,
    month: Optional[int] = None,
    summary_type: Optional[str] = None,
    version: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        _, summaries = BudgetSummaryService.get_summaries(
            db=db,
            template_id=template_id,
            period_id=period_id,
            department_id=department_id,
            subject_id=subject_id,
            month=month,
            summary_type=summary_type,
            version=version,
            skip=0,
            limit=10000,
        )

        summary_data = []
        for s in summaries:
            s_with_relations = BudgetSummaryService.add_relations_to_summary(db, s)
            summary_data.append({
                "template_name": s_with_relations.template_name,
                "period_name": s_with_relations.period_name,
                "department_name": s_with_relations.department_name,
                "subject_name": s_with_relations.subject_name,
                "month": s_with_relations.month,
                "summary_type": s_with_relations.summary_type,
                "version": s_with_relations.version,
                "budget_amount": s_with_relations.budget_amount,
                "used_amount": s_with_relations.used_amount,
                "occupied_amount": s_with_relations.occupied_amount,
            })

        output = ExportService.export_budget_summary_to_pdf(summary_data)
        filename = ExportService.generate_filename("预算汇总报表", "pdf")

        return StreamingResponse(
            output,
            media_type="application/pdf",
            headers={"Content-Disposition": f"attachment; filename*=UTF-8''{filename}"}
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"导出PDF失败: {str(e)}")


@router.get("/budget-execution/excel")
def export_budget_execution_excel(
    period_id: Optional[int] = None,
    department_id: Optional[int] = None,
    subject_id: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        query = db.query(BudgetSummary).filter(BudgetSummary.summary_type == "detail")

        if period_id is not None:
            query = query.filter(BudgetSummary.period_id == period_id)
        if department_id is not None:
            query = query.filter(BudgetSummary.department_id == department_id)
        if subject_id is not None:
            query = query.filter(BudgetSummary.subject_id == subject_id)

        budget_summaries = query.order_by(
            BudgetSummary.period_id,
            BudgetSummary.department_id,
            BudgetSummary.subject_id
        ).limit(10000).all()

        execution_data = []
        for summary in budget_summaries:
            remaining_amount = summary.budget_amount - summary.used_amount - summary.occupied_amount
            execution_rate = (summary.used_amount / summary.budget_amount * 100) if summary.budget_amount > 0 else 0

            period_name = summary.period.name if summary.period else None
            department_name = summary.department.name if summary.department else None
            subject_name = summary.subject.name if summary.subject else None

            execution_data.append({
                "period_name": period_name,
                "department_name": department_name,
                "subject_name": subject_name,
                "budget_amount": float(summary.budget_amount),
                "used_amount": float(summary.used_amount),
                "occupied_amount": float(summary.occupied_amount),
                "remaining_amount": float(remaining_amount),
                "execution_rate": round(execution_rate, 2),
            })

        output = ExportService.export_budget_execution_to_excel(execution_data)
        filename = ExportService.generate_filename("预算执行报表", "xlsx")

        return StreamingResponse(
            output,
            media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            headers={"Content-Disposition": f"attachment; filename*=UTF-8''{filename}"}
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"导出Excel失败: {str(e)}")


@router.get("/budget-execution/pdf")
def export_budget_execution_pdf(
    period_id: Optional[int] = None,
    department_id: Optional[int] = None,
    subject_id: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        query = db.query(BudgetSummary).filter(BudgetSummary.summary_type == "detail")

        if period_id is not None:
            query = query.filter(BudgetSummary.period_id == period_id)
        if department_id is not None:
            query = query.filter(BudgetSummary.department_id == department_id)
        if subject_id is not None:
            query = query.filter(BudgetSummary.subject_id == subject_id)

        budget_summaries = query.order_by(
            BudgetSummary.period_id,
            BudgetSummary.department_id,
            BudgetSummary.subject_id
        ).limit(10000).all()

        execution_data = []
        for summary in budget_summaries:
            remaining_amount = summary.budget_amount - summary.used_amount - summary.occupied_amount
            execution_rate = (summary.used_amount / summary.budget_amount * 100) if summary.budget_amount > 0 else 0

            period_name = summary.period.name if summary.period else None
            department_name = summary.department.name if summary.department else None
            subject_name = summary.subject.name if summary.subject else None

            execution_data.append({
                "period_name": period_name,
                "department_name": department_name,
                "subject_name": subject_name,
                "budget_amount": float(summary.budget_amount),
                "used_amount": float(summary.used_amount),
                "occupied_amount": float(summary.occupied_amount),
                "remaining_amount": float(remaining_amount),
                "execution_rate": round(execution_rate, 2),
            })

        output = ExportService.export_budget_execution_to_pdf(execution_data)
        filename = ExportService.generate_filename("预算执行报表", "pdf")

        return StreamingResponse(
            output,
            media_type="application/pdf",
            headers={"Content-Disposition": f"attachment; filename*=UTF-8''{filename}"}
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"导出PDF失败: {str(e)}")


@router.post("/batch/excel")
def batch_export_excel(
    report_types: List[str] = Query(..., description="要导出的报表类型，如：budget_summary, budget_execution"),
    template_id: Optional[int] = None,
    period_id: Optional[int] = None,
    department_id: Optional[int] = None,
    subject_id: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        reports = []

        if "budget_summary" in report_types:
            _, summaries = BudgetSummaryService.get_summaries(
                db=db,
                template_id=template_id,
                period_id=period_id,
                department_id=department_id,
                subject_id=subject_id,
                skip=0,
                limit=10000,
            )

            summary_data = []
            for s in summaries:
                s_with_relations = BudgetSummaryService.add_relations_to_summary(db, s)
                summary_data.append({
                    "template_name": s_with_relations.template_name,
                    "period_name": s_with_relations.period_name,
                    "department_name": s_with_relations.department_name,
                    "subject_name": s_with_relations.subject_name,
                    "month": s_with_relations.month,
                    "summary_type": s_with_relations.summary_type,
                    "version": s_with_relations.version,
                    "budget_amount": s_with_relations.budget_amount,
                    "used_amount": s_with_relations.used_amount,
                    "occupied_amount": s_with_relations.occupied_amount,
                })

            reports.append({
                "type": "budget_summary",
                "data": summary_data,
                "sheet_name": "预算汇总"
            })

        if "budget_execution" in report_types:
            query = db.query(BudgetSummary).filter(BudgetSummary.summary_type == "detail")

            if period_id is not None:
                query = query.filter(BudgetSummary.period_id == period_id)
            if department_id is not None:
                query = query.filter(BudgetSummary.department_id == department_id)
            if subject_id is not None:
                query = query.filter(BudgetSummary.subject_id == subject_id)

            budget_summaries = query.order_by(
                BudgetSummary.period_id,
                BudgetSummary.department_id,
                BudgetSummary.subject_id
            ).limit(10000).all()

            execution_data = []
            for summary in budget_summaries:
                remaining_amount = summary.budget_amount - summary.used_amount - summary.occupied_amount
                execution_rate = (summary.used_amount / summary.budget_amount * 100) if summary.budget_amount > 0 else 0

                period_name = summary.period.name if summary.period else None
                department_name = summary.department.name if summary.department else None
                subject_name = summary.subject.name if summary.subject else None

                execution_data.append({
                    "period_name": period_name,
                    "department_name": department_name,
                    "subject_name": subject_name,
                    "budget_amount": float(summary.budget_amount),
                    "used_amount": float(summary.used_amount),
                    "occupied_amount": float(summary.occupied_amount),
                    "remaining_amount": float(remaining_amount),
                    "execution_rate": round(execution_rate, 2),
                })

            reports.append({
                "type": "budget_execution",
                "data": execution_data,
                "sheet_name": "预算执行"
            })

        if not reports:
            raise HTTPException(status_code=400, detail="请至少选择一种报表类型")

        output = ExportService.batch_export_to_excel(reports)
        filename = ExportService.generate_filename("批量导出报表", "xlsx")

        return StreamingResponse(
            output,
            media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            headers={"Content-Disposition": f"attachment; filename*=UTF-8''{filename}"}
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"批量导出失败: {str(e)}")
