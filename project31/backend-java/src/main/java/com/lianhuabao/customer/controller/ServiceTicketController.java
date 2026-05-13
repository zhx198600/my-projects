package com.lianhuabao.customer.controller;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.lianhuabao.customer.annotation.OperationLog;
import com.lianhuabao.customer.common.Result;
import com.lianhuabao.customer.entity.ServiceTicket;
import com.lianhuabao.customer.entity.ServiceTicketEvaluation;
import com.lianhuabao.customer.entity.ServiceTicketRecord;
import com.lianhuabao.customer.service.ServiceTicketService;
import com.lianhuabao.customer.utils.JwtUtil;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Tag(name = "服务工单管理")
@RestController
@RequestMapping("/api/service/ticket")
public class ServiceTicketController {

    @Autowired
    private ServiceTicketService ticketService;

    @Autowired
    private JwtUtil jwtUtil;

    @Operation(summary = "分页查询工单列表")
    @GetMapping("/list")
    public Result<IPage<ServiceTicket>> list(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) Integer ticketType,
            @RequestParam(required = false) Integer status,
            @RequestParam(required = false) Long assigneeId,
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate) {
        return Result.success(ticketService.searchTicket(page, size, keyword, ticketType, status, assigneeId, startDate, endDate));
    }

    @Operation(summary = "获取工单详情")
    @GetMapping("/{id}")
    public Result<Map<String, Object>> detail(@PathVariable Long id) {
        Map<String, Object> result = new HashMap<>();
        result.put("ticket", ticketService.getById(id));
        result.put("records", ticketService.getTicketRecords(id));
        result.put("evaluation", ticketService.getTicketEvaluation(id));
        return Result.success(result);
    }

    @Operation(summary = "创建工单")
    @OperationLog("创建工单")
    @PostMapping("/create")
    public Result<Void> create(@RequestBody ServiceTicket ticket, HttpServletRequest request) {
        Long userId = jwtUtil.getUserIdFromToken(request);
        String userName = jwtUtil.getUsernameFromToken(request);
        ticketService.createTicket(ticket, userId, userName);
        return Result.success();
    }

    @Operation(summary = "手动分配工单")
    @OperationLog("手动分配工单")
    @PostMapping("/assign")
    public Result<Void> assign(@RequestParam Long ticketId, @RequestParam Long assigneeId, HttpServletRequest request) {
        Long userId = jwtUtil.getUserIdFromToken(request);
        String userName = jwtUtil.getUsernameFromToken(request);
        ticketService.assignTicket(ticketId, assigneeId, userId, userName, false);
        return Result.success();
    }

    @Operation(summary = "自动分配工单")
    @OperationLog("自动分配工单")
    @PostMapping("/autoAssign")
    public Result<Void> autoAssign(@RequestParam Long ticketId, HttpServletRequest request) {
        Long userId = jwtUtil.getUserIdFromToken(request);
        String userName = jwtUtil.getUsernameFromToken(request);
        ticketService.autoAssign(ticketId, userId, userName);
        return Result.success();
    }

    @Operation(summary = "处理工单（更新状态、添加处理记录）")
    @OperationLog("处理工单")
    @PostMapping("/process")
    public Result<Void> process(
            @RequestParam Long ticketId,
            @RequestParam Integer status,
            @RequestParam String content,
            HttpServletRequest request) {
        Long userId = jwtUtil.getUserIdFromToken(request);
        String userName = jwtUtil.getUsernameFromToken(request);
        ticketService.processTicket(ticketId, status, content, userId, userName);
        return Result.success();
    }

    @Operation(summary = "添加工单备注")
    @OperationLog("添加工单备注")
    @PostMapping("/remark")
    public Result<Void> remark(
            @RequestParam Long ticketId,
            @RequestParam String content,
            HttpServletRequest request) {
        Long userId = jwtUtil.getUserIdFromToken(request);
        String userName = jwtUtil.getUsernameFromToken(request);
        ticketService.addRemark(ticketId, content, userId, userName);
        return Result.success();
    }

    @Operation(summary = "客户评价工单")
    @OperationLog("客户评价工单")
    @PostMapping("/evaluate")
    public Result<Void> evaluate(
            @RequestParam Long ticketId,
            @RequestParam Integer satisfaction,
            @RequestParam(required = false) String content,
            HttpServletRequest request) {
        Long userId = jwtUtil.getUserIdFromToken(request);
        String userName = jwtUtil.getUsernameFromToken(request);
        ticketService.evaluateTicket(ticketId, satisfaction, content, userId, userName);
        return Result.success();
    }

    @Operation(summary = "获取工单处理记录")
    @GetMapping("/records/{ticketId}")
    public Result<List<ServiceTicketRecord>> getRecords(@PathVariable Long ticketId) {
        return Result.success(ticketService.getTicketRecords(ticketId));
    }

    @Operation(summary = "导出Excel")
    @OperationLog("导出行单Excel")
    @GetMapping("/export/excel")
    public void exportExcel(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) Integer ticketType,
            @RequestParam(required = false) Integer status,
            @RequestParam(required = false) Long assigneeId,
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate,
            HttpServletResponse response) throws Exception {
        ticketService.exportExcel(response, keyword, ticketType, status, assigneeId, startDate, endDate);
    }

    @Operation(summary = "导出工单详情PDF")
    @OperationLog("导出工单PDF")
    @GetMapping("/export/pdf")
    public void exportPdf(@RequestParam Long ticketId, HttpServletResponse response) throws Exception {
        ticketService.exportPdf(response, ticketId);
    }

    @Operation(summary = "更新工单")
    @OperationLog("更新工单")
    @PutMapping("/{id}")
    public Result<Void> update(@PathVariable Long id, @RequestBody ServiceTicket ticket) {
        ticket.setId(id);
        ticketService.updateById(ticket);
        return Result.success();
    }

    @Operation(summary = "删除工单")
    @OperationLog("删除工单")
    @DeleteMapping("/{id}")
    public Result<Void> delete(@PathVariable Long id) {
        ticketService.removeById(id);
        return Result.success();
    }
}
