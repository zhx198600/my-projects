package com.lianhuabao.customer.service;

import com.alibaba.excel.EasyExcel;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.itextpdf.text.*;
import com.itextpdf.text.pdf.PdfPCell;
import com.itextpdf.text.pdf.PdfPTable;
import com.itextpdf.text.pdf.PdfWriter;
import com.lianhuabao.customer.dto.ServiceTicketExcelDTO;
import com.lianhuabao.customer.entity.*;
import com.lianhuabao.customer.mapper.ServiceTicketEvaluationMapper;
import com.lianhuabao.customer.mapper.ServiceTicketMapper;
import com.lianhuabao.customer.mapper.ServiceTicketRecordMapper;
import com.lianhuabao.customer.mapper.SysUserMapper;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.List;

@Service
public class ServiceTicketService extends ServiceImpl<ServiceTicketMapper, ServiceTicket> {

    @Autowired
    private ServiceTicketRecordMapper recordMapper;

    @Autowired
    private ServiceTicketEvaluationMapper evaluationMapper;

    @Autowired
    private SysUserMapper userMapper;

    private static final String[] TICKET_TYPE_MAP = {"", "客户投诉", "咨询", "理赔申请"};
    private static final String[] PRIORITY_MAP = {"", "紧急", "普通", "低"};
    private static final String[] STATUS_MAP = {"", "待处理", "处理中", "已解决", "已关闭"};

    private String generateTicketNo() {
        return "WD" + System.currentTimeMillis();
    }

    private void addRecord(Long ticketId, Integer type, String content, Long operatorId, String operatorName) {
        ServiceTicketRecord record = new ServiceTicketRecord();
        record.setTicketId(ticketId);
        record.setRecordType(type);
        record.setContent(content);
        record.setOperatorId(operatorId);
        record.setOperatorName(operatorName);
        recordMapper.insert(record);
    }

    @Transactional
    public void createTicket(ServiceTicket ticket, Long userId, String userName) {
        ticket.setTicketNo(generateTicketNo());
        ticket.setStatus(1);
        ticket.setCreateBy(userId);
        save(ticket);
        addRecord(ticket.getId(), 1, "创建工单，状态变更为：待处理", userId, userName);
    }

    @Transactional
    public void assignTicket(Long ticketId, Long assigneeId, Long operatorId, String operatorName, boolean auto) {
        ServiceTicket ticket = getById(ticketId);
        if (ticket == null) {
            throw new RuntimeException("工单不存在");
        }
        SysUser user = userMapper.selectById(assigneeId);
        if (user == null) {
            throw new RuntimeException("处理人不存在");
        }
        ticket.setAssigneeId(assigneeId);
        ticket.setAssigneeName(user.getRealName());
        updateById(ticket);
        String type = auto ? "自动" : "手动";
        addRecord(ticketId, 1, type + "分配工单给：" + user.getRealName(), operatorId, operatorName);
    }

    @Transactional
    public void autoAssign(Long ticketId, Long operatorId, String operatorName) {
        LambdaQueryWrapper<SysUser> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(SysUser::getStatus, 1);
        List<SysUser> users = userMapper.selectList(wrapper);
        if (users.isEmpty()) {
            throw new RuntimeException("没有可用的客服人员");
        }
        Random random = new Random();
        SysUser assignee = users.get(random.nextInt(users.size()));
        assignTicket(ticketId, assignee.getId(), operatorId, operatorName, true);
    }

    @Transactional
    public void processTicket(Long ticketId, Integer status, String content, Long operatorId, String operatorName) {
        ServiceTicket ticket = getById(ticketId);
        if (ticket == null) {
            throw new RuntimeException("工单不存在");
        }
        if (ticket.getFirstResponseTime() == null && status >= 2) {
            ticket.setFirstResponseTime(LocalDateTime.now());
            Duration duration = Duration.between(ticket.getCreateTime(), ticket.getFirstResponseTime());
            ticket.setSlaFirstResponse((int) duration.toMinutes());
        }
        if (status == 3 && ticket.getResolvedTime() == null) {
            ticket.setResolvedTime(LocalDateTime.now());
            Duration duration = Duration.between(ticket.getCreateTime(), ticket.getResolvedTime());
            ticket.setSlaResolve((int) duration.toMinutes());
        }
        if (status == 4) {
            ticket.setClosedTime(LocalDateTime.now());
        }
        ticket.setStatus(status);
        updateById(ticket);
        addRecord(ticketId, 2, content, operatorId, operatorName);
        if (!Objects.equals(ticket.getStatus(), status)) {
            addRecord(ticketId, 1, "状态变更为：" + STATUS_MAP[status], operatorId, operatorName);
        }
    }

    public void addRemark(Long ticketId, String content, Long operatorId, String operatorName) {
        addRecord(ticketId, 3, content, operatorId, operatorName);
    }

    @Transactional
    public void evaluateTicket(Long ticketId, Integer satisfaction, String content, Long reviewerId, String reviewerName) {
        ServiceTicket ticket = getById(ticketId);
        if (ticket == null) {
            throw new RuntimeException("工单不存在");
        }
        if (ticket.getStatus() < 3) {
            throw new RuntimeException("工单未解决，不能评价");
        }
        ServiceTicketEvaluation evaluation = new ServiceTicketEvaluation();
        evaluation.setTicketId(ticketId);
        evaluation.setSatisfaction(satisfaction);
        evaluation.setContent(content);
        evaluation.setReviewerId(reviewerId);
        evaluation.setReviewerName(reviewerName);
        evaluationMapper.insert(evaluation);
    }

    public IPage<ServiceTicket> searchTicket(int page, int size, String keyword, Integer ticketType, Integer status,
                                            Long assigneeId, String startDate, String endDate) {
        LambdaQueryWrapper<ServiceTicket> wrapper = new LambdaQueryWrapper<>();
        if (StringUtils.hasText(keyword)) {
            wrapper.and(w -> w.like(ServiceTicket::getTitle, keyword)
                    .or().like(ServiceTicket::getTicketNo, keyword)
                    .or().like(ServiceTicket::getCustomerName, keyword)
                    .or().like(ServiceTicket::getContent, keyword));
        }
        if (ticketType != null) {
            wrapper.eq(ServiceTicket::getTicketType, ticketType);
        }
        if (status != null) {
            wrapper.eq(ServiceTicket::getStatus, status);
        }
        if (assigneeId != null) {
            wrapper.eq(ServiceTicket::getAssigneeId, assigneeId);
        }
        if (StringUtils.hasText(startDate)) {
            wrapper.ge(ServiceTicket::getCreateTime, startDate);
        }
        if (StringUtils.hasText(endDate)) {
            wrapper.le(ServiceTicket::getCreateTime, endDate + " 23:59:59");
        }
        wrapper.orderByDesc(ServiceTicket::getCreateTime);
        return page(new Page<>(page, size), wrapper);
    }

    public List<ServiceTicketRecord> getTicketRecords(Long ticketId) {
        LambdaQueryWrapper<ServiceTicketRecord> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(ServiceTicketRecord::getTicketId, ticketId);
        wrapper.orderByAsc(ServiceTicketRecord::getCreateTime);
        return recordMapper.selectList(wrapper);
    }

    public ServiceTicketEvaluation getTicketEvaluation(Long ticketId) {
        LambdaQueryWrapper<ServiceTicketEvaluation> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(ServiceTicketEvaluation::getTicketId, ticketId);
        return evaluationMapper.selectOne(wrapper);
    }

    public void exportExcel(HttpServletResponse response, String keyword, Integer ticketType, Integer status,
                            Long assigneeId, String startDate, String endDate) throws IOException {
        List<ServiceTicket> list = searchTicket(1, 10000, keyword, ticketType, status, assigneeId, startDate, endDate).getRecords();
        List<ServiceTicketExcelDTO> excelList = list.stream().map(ticket -> {
            ServiceTicketExcelDTO dto = new ServiceTicketExcelDTO();
            dto.setTicketNo(ticket.getTicketNo());
            dto.setTicketType(TICKET_TYPE_MAP[ticket.getTicketType()]);
            dto.setTitle(ticket.getTitle());
            dto.setCustomerName(ticket.getCustomerName());
            dto.setCustomerPhone(ticket.getCustomerPhone());
            dto.setPriority(PRIORITY_MAP[ticket.getPriority()]);
            dto.setStatus(STATUS_MAP[ticket.getStatus()]);
            dto.setAssigneeName(ticket.getAssigneeName());
            dto.setSlaFirstResponse(ticket.getSlaFirstResponse());
            dto.setSlaResolve(ticket.getSlaResolve());
            dto.setCreateTime(ticket.getCreateTime() != null ? ticket.getCreateTime().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")) : "");
            return dto;
        }).toList();

        response.setContentType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
        response.setCharacterEncoding("utf-8");
        String fileName = URLEncoder.encode("服务工单", StandardCharsets.UTF_8).replaceAll("\\+", "%20");
        response.setHeader("Content-disposition", "attachment;filename*=utf-8''" + fileName + ".xlsx");
        EasyExcel.write(response.getOutputStream(), ServiceTicketExcelDTO.class).sheet("工单列表").doWrite(excelList);
    }

    public void exportPdf(HttpServletResponse response, Long ticketId) throws IOException, DocumentException {
        ServiceTicket ticket = getById(ticketId);
        List<ServiceTicketRecord> records = getTicketRecords(ticketId);
        ServiceTicketEvaluation evaluation = getTicketEvaluation(ticketId);

        response.setContentType("application/pdf");
        response.setHeader("Content-Disposition", "attachment; filename=ticket_" + ticket.getTicketNo() + ".pdf");

        Document document = new Document();
        PdfWriter.getInstance(document, response.getOutputStream());
        document.open();

        Font titleFont = new Font(Font.FontFamily.HELVETICA, 18, Font.BOLD);
        Font headerFont = new Font(Font.FontFamily.HELVETICA, 12, Font.BOLD);
        Font normalFont = new Font(Font.FontFamily.HELVETICA, 10, Font.NORMAL);

        Paragraph title = new Paragraph("服务工单详情", titleFont);
        title.setAlignment(Element.ALIGN_CENTER);
        title.setSpacingAfter(20);
        document.add(title);

        PdfPTable table = new PdfPTable(2);
        table.setWidthPercentage(100);
        table.setSpacingAfter(20);

        addTableCell(table, "工单编号:", ticket.getTicketNo(), headerFont, normalFont);
        addTableCell(table, "工单类型:", TICKET_TYPE_MAP[ticket.getTicketType()], headerFont, normalFont);
        addTableCell(table, "工单标题:", ticket.getTitle(), headerFont, normalFont);
        addTableCell(table, "客户姓名:", ticket.getCustomerName(), headerFont, normalFont);
        addTableCell(table, "客户电话:", ticket.getCustomerPhone(), headerFont, normalFont);
        addTableCell(table, "优先级:", PRIORITY_MAP[ticket.getPriority()], headerFont, normalFont);
        addTableCell(table, "状态:", STATUS_MAP[ticket.getStatus()], headerFont, normalFont);
        addTableCell(table, "处理人:", ticket.getAssigneeName(), headerFont, normalFont);
        addTableCell(table, "首次响应时长(分钟):", ticket.getSlaFirstResponse() != null ? ticket.getSlaFirstResponse().toString() : "-", headerFont, normalFont);
        addTableCell(table, "解决时长(分钟):", ticket.getSlaResolve() != null ? ticket.getSlaResolve().toString() : "-", headerFont, normalFont);

        document.add(table);

        Paragraph recordTitle = new Paragraph("处理记录", headerFont);
        recordTitle.setSpacingAfter(10);
        document.add(recordTitle);

        PdfPTable recordTable = new PdfPTable(3);
        recordTable.setWidthPercentage(100);
        recordTable.setWidths(new float[]{2, 2, 6});

        recordTable.addCell(new Phrase("时间", headerFont));
        recordTable.addCell(new Phrase("操作人", headerFont));
        recordTable.addCell(new Phrase("内容", headerFont));

        for (ServiceTicketRecord record : records) {
            recordTable.addCell(new Phrase(record.getCreateTime().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm")), normalFont));
            recordTable.addCell(new Phrase(record.getOperatorName(), normalFont));
            recordTable.addCell(new Phrase(record.getContent(), normalFont));
        }
        document.add(recordTable);

        if (evaluation != null) {
            Paragraph evalTitle = new Paragraph("客户评价", headerFont);
            evalTitle.setSpacingBefore(20);
            evalTitle.setSpacingAfter(10);
            document.add(evalTitle);

            PdfPTable evalTable = new PdfPTable(2);
            evalTable.setWidthPercentage(100);
            addTableCell(evalTable, "满意度:", evaluation.getSatisfaction() + "星", headerFont, normalFont);
            addTableCell(evalTable, "评价内容:", evaluation.getContent(), headerFont, normalFont);
            document.add(evalTable);
        }

        document.close();
    }

    private void addTableCell(PdfPTable table, String label, String value, Font labelFont, Font valueFont) {
        PdfPCell labelCell = new PdfPCell(new Phrase(label, labelFont));
        labelCell.setBorder(Rectangle.NO_BORDER);
        labelCell.setPadding(5);
        table.addCell(labelCell);
        PdfPCell valueCell = new PdfPCell(new Phrase(value, valueFont));
        valueCell.setBorder(Rectangle.NO_BORDER);
        valueCell.setPadding(5);
        table.addCell(valueCell);
    }
}
