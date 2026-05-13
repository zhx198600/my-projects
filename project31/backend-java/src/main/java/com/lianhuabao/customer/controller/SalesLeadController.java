package com.lianhuabao.customer.controller;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.lianhuabao.customer.annotation.OperationLog;
import com.lianhuabao.customer.common.Result;
import com.lianhuabao.customer.entity.SalesLead;
import com.lianhuabao.customer.entity.SalesLeadFollow;
import com.lianhuabao.customer.service.SalesLeadService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/sales/lead")
@Tag(name = "销售线索管理")
public class SalesLeadController {

    private final SalesLeadService salesLeadService;

    public SalesLeadController(SalesLeadService salesLeadService) {
        this.salesLeadService = salesLeadService;
    }

    @GetMapping("/page")
    @Operation(summary = "分页查询销售线索")
    public Result<Page<SalesLead>> getPage(
            @RequestParam(defaultValue = "1") Integer pageNum,
            @RequestParam(defaultValue = "10") Integer pageSize,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) Integer status,
            @RequestParam(required = false) Long assignedUserId) {
        return Result.success(salesLeadService.getPage(pageNum, pageSize, keyword, status, assignedUserId));
    }

    @GetMapping("/{id}")
    @Operation(summary = "线索详情")
    public Result<SalesLead> getById(@PathVariable Long id) {
        return Result.success(salesLeadService.getById(id));
    }

    @PostMapping
    @Operation(summary = "新增销售线索")
    @OperationLog("新增销售线索")
    public Result<Void> add(@RequestBody SalesLead lead) {
        salesLeadService.save(lead);
        return Result.success();
    }

    @PutMapping
    @Operation(summary = "修改销售线索")
    @OperationLog("修改销售线索")
    public Result<Void> update(@RequestBody SalesLead lead) {
        salesLeadService.updateById(lead);
        return Result.success();
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "删除销售线索")
    @OperationLog("删除销售线索")
    public Result<Void> delete(@PathVariable Long id) {
        salesLeadService.removeById(id);
        return Result.success();
    }

    @PutMapping("/assign")
    @Operation(summary = "分配线索给业务员")
    @OperationLog("分配销售线索")
    public Result<Void> assign(@RequestBody Map<String, Object> params) {
        Long id = Long.valueOf(params.get("id").toString());
        Long userId = Long.valueOf(params.get("userId").toString());
        String userName = params.get("userName").toString();
        salesLeadService.assignLead(id, userId, userName);
        return Result.success();
    }

    @PutMapping("/status")
    @Operation(summary = "更新线索状态")
    @OperationLog("更新线索状态")
    public Result<Void> updateStatus(@RequestBody Map<String, Object> params) {
        Long id = Long.valueOf(params.get("id").toString());
        Integer status = Integer.valueOf(params.get("status").toString());
        salesLeadService.updateStatus(id, status);
        return Result.success();
    }

    @GetMapping("/{id}/follows")
    @Operation(summary = "获取跟进记录")
    public Result<List<SalesLeadFollow>> getFollowRecords(@PathVariable Long id) {
        return Result.success(salesLeadService.getFollowRecords(id));
    }

    @PostMapping("/follow")
    @Operation(summary = "添加跟进记录")
    @OperationLog("添加线索跟进记录")
    public Result<Void> addFollow(@RequestBody SalesLeadFollow follow) {
        salesLeadService.addFollowRecord(follow);
        return Result.success();
    }

    @GetMapping("/export")
    @Operation(summary = "导出Excel")
    @OperationLog("导出销售线索Excel")
    public void exportExcel(HttpServletResponse response,
                            @RequestParam(required = false) String keyword) throws IOException {
        salesLeadService.exportExcel(response, keyword);
    }
}
