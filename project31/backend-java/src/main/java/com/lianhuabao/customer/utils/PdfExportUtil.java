package com.lianhuabao.customer.utils;

import com.itextpdf.text.*;
import com.itextpdf.text.pdf.BaseFont;
import com.itextpdf.text.pdf.PdfPCell;
import com.itextpdf.text.pdf.PdfPTable;
import com.itextpdf.text.pdf.PdfWriter;
import com.lianhuabao.customer.dto.report.ChartDataDTO;
import com.lianhuabao.customer.dto.report.FunnelChartDataDTO;
import com.lianhuabao.customer.dto.report.PieChartDataDTO;
import com.lianhuabao.customer.service.ReportService;
import jakarta.servlet.http.HttpServletResponse;

import java.io.IOException;
import java.io.OutputStream;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;

public class PdfExportUtil {

    private static BaseFont getChineseFont() throws DocumentException, IOException {
        return BaseFont.createFont("STSong-Light", "UniGB-UCS2-H", BaseFont.NOT_EMBEDDED);
    }

    private static Font getTitleFont() throws DocumentException, IOException {
        return new Font(getChineseFont(), 18, Font.BOLD);
    }

    private static Font getHeaderFont() throws DocumentException, IOException {
        return new Font(getChineseFont(), 14, Font.BOLD);
    }

    private static Font getSubHeaderFont() throws DocumentException, IOException {
        return new Font(getChineseFont(), 12, Font.BOLD);
    }

    private static Font getContentFont() throws DocumentException, IOException {
        return new Font(getChineseFont(), 10);
    }

    public static void exportTable(HttpServletResponse response, String title, String[] headers, List<String[]> data) throws Exception {
        response.setContentType("application/pdf");
        response.setCharacterEncoding("utf-8");
        String fileName = URLEncoder.encode(title, StandardCharsets.UTF_8).replaceAll("\\+", "%20");
        response.setHeader("Content-disposition", "attachment;filename*=utf-8''" + fileName + ".pdf");

        Document document = new Document(PageSize.A4, 30, 30, 30, 30);
        PdfWriter.getInstance(document, response.getOutputStream());
        document.open();

        Paragraph titleParagraph = new Paragraph(title, getTitleFont());
        titleParagraph.setAlignment(Element.ALIGN_CENTER);
        titleParagraph.setSpacingAfter(20);
        document.add(titleParagraph);

        PdfPTable table = new PdfPTable(headers.length);
        table.setWidthPercentage(100);

        for (String header : headers) {
            PdfPCell cell = new PdfPCell(new Phrase(header, getHeaderFont()));
            cell.setHorizontalAlignment(Element.ALIGN_CENTER);
            cell.setVerticalAlignment(Element.ALIGN_MIDDLE);
            cell.setBackgroundColor(BaseColor.LIGHT_GRAY);
            cell.setPadding(8);
            table.addCell(cell);
        }

        for (String[] row : data) {
            for (String cellValue : row) {
                PdfPCell cell = new PdfPCell(new Phrase(cellValue != null ? cellValue : "", getContentFont()));
                cell.setHorizontalAlignment(Element.ALIGN_CENTER);
                cell.setVerticalAlignment(Element.ALIGN_MIDDLE);
                cell.setPadding(5);
                table.addCell(cell);
            }
        }

        document.add(table);
        document.close();
    }

    public static void exportReport(OutputStream outputStream, List<String> sections, String timeRange, ReportService reportService) throws Exception {
        Document document = new Document(PageSize.A4, 30, 30, 30, 30);
        PdfWriter.getInstance(document, outputStream);
        document.open();

        Paragraph mainTitle = new Paragraph("数据分析报表", getTitleFont());
        mainTitle.setAlignment(Element.ALIGN_CENTER);
        mainTitle.setSpacingAfter(10);
        document.add(mainTitle);

        Paragraph dateInfo = new Paragraph("生成时间: " + LocalDate.now().format(DateTimeFormatter.ofPattern("yyyy年MM月dd日")), getContentFont());
        dateInfo.setAlignment(Element.ALIGN_RIGHT);
        dateInfo.setSpacingAfter(20);
        document.add(dateInfo);

        for (String section : sections) {
            Paragraph sectionTitle = new Paragraph(section, getHeaderFont());
            sectionTitle.setSpacingBefore(20);
            sectionTitle.setSpacingAfter(15);
            document.add(sectionTitle);

            switch (section) {
                case "客户统计分析" -> exportCustomerSection(document, timeRange, reportService);
                case "销售业绩分析" -> exportSalesSection(document, timeRange, reportService);
                case "服务质量分析" -> exportServiceSection(document, timeRange, reportService);
                case "档案统计分析" -> exportArchiveSection(document, timeRange, reportService);
            }
        }

        document.close();
    }

    private static void exportCustomerSection(Document document, String timeRange, ReportService reportService) throws Exception {
        Paragraph subTitle = new Paragraph("1. 客户地区分布TOP10", getSubHeaderFont());
        subTitle.setSpacingAfter(10);
        document.add(subTitle);

        ChartDataDTO regionData = reportService.getCustomerRegion();
        PdfPTable regionTable = createDataTable(regionData.getXAxis(), regionData.getSeries().get(0).getData());
        document.add(regionTable);

        Paragraph subTitle2 = new Paragraph("2. 客户画像分布", getSubHeaderFont());
        subTitle2.setSpacingBefore(15);
        subTitle2.setSpacingAfter(10);
        document.add(subTitle2);

        PieChartDataDTO profileData = reportService.getCustomerProfile();
        PdfPTable profileTable = createPieTable(profileData.getSeries());
        document.add(profileTable);
    }

    private static void exportSalesSection(Document document, String timeRange, ReportService reportService) throws Exception {
        Paragraph subTitle = new Paragraph("1. 销售排名TOP10", getSubHeaderFont());
        subTitle.setSpacingAfter(10);
        document.add(subTitle);

        ChartDataDTO rankingData = reportService.getSalesRanking();
        PdfPTable rankingTable = createDataTable(rankingData.getXAxis(), rankingData.getSeries().get(0).getData());
        document.add(rankingTable);

        Paragraph subTitle2 = new Paragraph("2. 转化率漏斗", getSubHeaderFont());
        subTitle2.setSpacingBefore(15);
        subTitle2.setSpacingAfter(10);
        document.add(subTitle2);

        FunnelChartDataDTO funnelData = reportService.getConversionFunnel();
        PdfPTable funnelTable = createFunnelTable(funnelData.getData());
        document.add(funnelTable);
    }

    private static void exportServiceSection(Document document, String timeRange, ReportService reportService) throws Exception {
        Paragraph subTitle = new Paragraph("1. 工单解决率", getSubHeaderFont());
        subTitle.setSpacingAfter(10);
        document.add(subTitle);

        PieChartDataDTO resolveData = reportService.getTicketResolveRate();
        PdfPTable resolveTable = createPieTable(resolveData.getSeries());
        document.add(resolveTable);

        Paragraph subTitle2 = new Paragraph("2. 满意度分布", getSubHeaderFont());
        subTitle2.setSpacingBefore(15);
        subTitle2.setSpacingAfter(10);
        document.add(subTitle2);

        PieChartDataDTO satisfactionData = reportService.getSatisfactionDistribution();
        PdfPTable satisfactionTable = createPieTable(satisfactionData.getSeries());
        document.add(satisfactionTable);
    }

    private static void exportArchiveSection(Document document, String timeRange, ReportService reportService) throws Exception {
        Paragraph subTitle = new Paragraph("1. 档案借阅率", getSubHeaderFont());
        subTitle.setSpacingAfter(10);
        document.add(subTitle);

        PieChartDataDTO borrowData = reportService.getBorrowRate();
        PdfPTable borrowTable = createPieTable(borrowData.getSeries());
        document.add(borrowTable);

        Paragraph subTitle2 = new Paragraph("2. 档案销毁统计", getSubHeaderFont());
        subTitle2.setSpacingBefore(15);
        subTitle2.setSpacingAfter(10);
        document.add(subTitle2);

        ChartDataDTO destroyData = reportService.getDestroyStatistics(timeRange);
        if (!destroyData.getXAxis().isEmpty()) {
            PdfPTable destroyTable = createDataTable(destroyData.getXAxis(), destroyData.getSeries().get(0).getData());
            document.add(destroyTable);
        }
    }

    private static PdfPTable createDataTable(List<String> labels, List<Object> values) throws Exception {
        PdfPTable table = new PdfPTable(2);
        table.setWidthPercentage(80);
        table.setWidths(new int[]{1, 1});

        addTableHeader(table, "项目", "数值");

        for (int i = 0; i < labels.size(); i++) {
            addTableCell(table, labels.get(i));
            addTableCell(table, String.valueOf(values.get(i)));
        }

        return table;
    }

    private static PdfPTable createPieTable(List<PieChartDataDTO.PieItem> items) throws Exception {
        PdfPTable table = new PdfPTable(2);
        table.setWidthPercentage(80);
        table.setWidths(new int[]{1, 1});

        addTableHeader(table, "分类", "数量");

        for (PieChartDataDTO.PieItem item : items) {
            addTableCell(table, item.getName());
            addTableCell(table, String.valueOf(item.getValue()));
        }

        return table;
    }

    private static PdfPTable createFunnelTable(List<FunnelChartDataDTO.FunnelItem> items) throws Exception {
        PdfPTable table = new PdfPTable(3);
        table.setWidthPercentage(100);
        table.setWidths(new int[]{1, 1, 1});

        addTableHeader(table, "阶段", "数量", "转化率");

        for (int i = 0; i < items.size(); i++) {
            FunnelChartDataDTO.FunnelItem item = items.get(i);
            addTableCell(table, item.getName());
            addTableCell(table, String.valueOf(item.getValue()));
            String rate = i == 0 ? "100%" :
                    String.format("%.2f%%", (item.getValue() * 100.0 / items.get(0).getValue()));
            addTableCell(table, rate);
        }

        return table;
    }

    private static void addTableHeader(PdfPTable table, String... headers) throws Exception {
        for (String header : headers) {
            PdfPCell cell = new PdfPCell(new Phrase(header, getHeaderFont()));
            cell.setHorizontalAlignment(Element.ALIGN_CENTER);
            cell.setVerticalAlignment(Element.ALIGN_MIDDLE);
            cell.setBackgroundColor(BaseColor.LIGHT_GRAY);
            cell.setPadding(8);
            table.addCell(cell);
        }
    }

    private static void addTableCell(PdfPTable table, String value) throws Exception {
        PdfPCell cell = new PdfPCell(new Phrase(value, getContentFont()));
        cell.setHorizontalAlignment(Element.ALIGN_CENTER);
        cell.setVerticalAlignment(Element.ALIGN_MIDDLE);
        cell.setPadding(5);
        table.addCell(cell);
    }
}
