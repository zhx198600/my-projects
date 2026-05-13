package com.lianhuabao.customer.controller;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.lianhuabao.customer.annotation.OperationLog;
import com.lianhuabao.customer.common.Result;
import com.lianhuabao.customer.entity.OpportunityStageHistory;
import com.lianhuabao.customer.entity.SalesOpportunity;
import com.lianhuabao.customer.service.SalesOpportunityService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/sales/opportunity")
@Tag(name = "销售商机管理")
public class SalesOpportunityController {

    private final SalesOpportunityService opportunityService;

    public SalesOpportunityController(SalesOpportunityService opportunityService) {
        this.opportunityService = opportunityService;
    }

    @GetMapping("/page")
    @Operation(summary = "分页查询销售商机")
    public Result<Page<SalesOpportunity>> getPage(
            @RequestParam(defaultValue = "1") Integer pageNum,
            @RequestParam(defaultValue = "10") Integer pageSize,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) Integer stage,
            @RequestParam(required = false) Long ownerUserId) {
        return Result.success(opportunityService.getPage(pageNum, pageSize, keyword, stage, ownerUserId));
    }

    @GetMapping("/{id}")
    @Operation(summary = "商机详情")
    public Result<SalesOpportunity> getById(@PathVariable Long id) {
        return Result.success(opportunityService.getById(id));
    }

    @PostMapping
    @Operation(summary = "新增销售商机")
    @OperationLog("新增销售商机")
    public Result<Void> add(@RequestBody SalesOpportunity opportunity) {
        opportunityService.save(opportunity);
        return Result.success();
    }

    @PutMapping
    @Operation(summary = "修改销售商机")
    @OperationLog("修改销售商机")
    public Result<Void> update(@RequestBody SalesOpportunity opportunity) {
        opportunityService.updateById(opportunity);
        return Result.success();
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "删除销售商机")
    @OperationLog("删除销售商机")
    public Result<Void> delete(@PathVariable Long id) {
        opportunityService.removeById(id);
        return Result.success();
    }

    @PostMapping("/convert/{leadId}")
    @Operation(summary = "从线索转化为商机")
    @OperationLog("线索转化为商机")
    public Result<Void> convertFromLead(@PathVariable Long leadId, @RequestBody SalesOpportunity opportunity) {
        opportunityService.convertFromLead(leadId, opportunity);
        return Result.success();
    }

    @PutMapping("/stage")
    @Operation(summary = "更新商机阶段")
    @OperationLog("更新商机阶段")
    public Result<Void> updateStage(@RequestBody Map<String, Object> params) {
        Long id = Long.valueOf(params.get("id").toString());
        Integer newStage = Integer.valueOf(params.get("newStage").toString());
        Long operateUserId = Long.valueOf(params.get("operateUserId").toString());
        String operateUserName = params.get("operateUserName").toString();
        String remark = params.get("remark") != null ? params.get("remark").toString() : "";
        opportunityService.updateStage(id, newStage, operateUserId, operateUserName, remark);
        return Result.success();
    }

    @GetMapping("/{id}/history")
    @Operation(summary = "获取阶段历史")
    public Result<List<OpportunityStageHistory>> getStageHistory(@PathVariable Long id) {
        return Result.success(opportunityService.getStageHistory(id));
    }

    @GetMapping("/export")
    @Operation(summary = "导出Excel")
    @OperationLog("导出销售商机Excel")
    public void exportExcel(HttpServletResponse response,
                            @RequestParam(required = false) String keyword) throws IOException {
        opportunityService.exportExcel(response, keyword);
    }
}
