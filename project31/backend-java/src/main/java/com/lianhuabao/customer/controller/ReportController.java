package com.lianhuabao.customer.controller;

import com.lianhuabao.customer.common.Result;
import com.lianhuabao.customer.dto.report.*;
import com.lianhuabao.customer.service.ReportService;
import com.lianhuabao.customer.utils.PdfExportUtil;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.Arrays;
import java.util.List;

@RestController
@RequestMapping("/api/report")
@RequiredArgsConstructor
@Tag(name = "报表统计", description = "数据分析与报表统计接口")
public class ReportController {

    private final ReportService reportService;

    @GetMapping("/customer/trend")
    @Operation(summary = "客户新增趋势")
    public Result<ChartDataDTO> getCustomerTrend(@RequestParam(defaultValue = "month") String timeRange) {
        return Result.success(reportService.getCustomerTrend(timeRange));
    }

    @GetMapping("/customer/profile")
    @Operation(summary = "客户画像")
    public Result<PieChartDataDTO> getCustomerProfile() {
        return Result.success(reportService.getCustomerProfile());
    }

    @GetMapping("/customer/region")
    @Operation(summary = "客户地区分布")
    public Result<ChartDataDTO> getCustomerRegion() {
        return Result.success(reportService.getCustomerRegion());
    }

    @GetMapping("/sales/ranking")
    @Operation(summary = "销售排名")
    public Result<ChartDataDTO> getSalesRanking() {
        return Result.success(reportService.getSalesRanking());
    }

    @GetMapping("/sales/performance")
    @Operation(summary = "业绩趋势")
    public Result<ChartDataDTO> getPerformanceTrend(@RequestParam(defaultValue = "month") String timeRange) {
        return Result.success(reportService.getPerformanceTrend(timeRange));
    }

    @GetMapping("/sales/conversion")
    @Operation(summary = "转化率漏斗")
    public Result<FunnelChartDataDTO> getConversionFunnel() {
        return Result.success(reportService.getConversionFunnel());
    }

    @GetMapping("/service/response")
    @Operation(summary = "工单响应时间趋势")
    public Result<ChartDataDTO> getTicketResponseTrend(@RequestParam(defaultValue = "month") String timeRange) {
        return Result.success(reportService.getTicketResponseTrend(timeRange));
    }

    @GetMapping("/service/resolve-rate")
    @Operation(summary = "工单解决率")
    public Result<PieChartDataDTO> getTicketResolveRate() {
        return Result.success(reportService.getTicketResolveRate());
    }

    @GetMapping("/service/satisfaction")
    @Operation(summary = "满意度分布")
    public Result<PieChartDataDTO> getSatisfactionDistribution() {
        return Result.success(reportService.getSatisfactionDistribution());
    }

    @GetMapping("/archive/trend")
    @Operation(summary = "档案数量趋势")
    public Result<ChartDataDTO> getArchiveTrend(@RequestParam(defaultValue = "month") String timeRange) {
        return Result.success(reportService.getArchiveTrend(timeRange));
    }

    @GetMapping("/archive/borrow-rate")
    @Operation(summary = "档案借阅率")
    public Result<PieChartDataDTO> getBorrowRate() {
        return Result.success(reportService.getBorrowRate());
    }

    @GetMapping("/archive/destroy")
    @Operation(summary = "档案销毁统计")
    public Result<ChartDataDTO> getDestroyStatistics(@RequestParam(defaultValue = "month") String timeRange) {
        return Result.success(reportService.getDestroyStatistics(timeRange));
    }

    @GetMapping("/export/pdf")
    @Operation(summary = "导出报表PDF")
    public void exportReportPdf(HttpServletResponse response,
                                @RequestParam(defaultValue = "month") String timeRange,
                                @RequestParam(defaultValue = "all") String reportType) throws IOException {
        response.setContentType("application/pdf");
        String fileName = "报表_" + LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMMdd")) + ".pdf";
        response.setHeader("Content-Disposition", "attachment; filename=\"" + fileName + "\"");

        List<String> sections = switch (reportType) {
            case "customer" -> Arrays.asList("客户统计分析");
            case "sales" -> Arrays.asList("销售业绩分析");
            case "service" -> Arrays.asList("服务质量分析");
            case "archive" -> Arrays.asList("档案统计分析");
            default -> Arrays.asList("客户统计分析", "销售业绩分析", "服务质量分析", "档案统计分析");
        };

        PdfExportUtil.exportReport(response.getOutputStream(), sections, timeRange, reportService);
    }
}
