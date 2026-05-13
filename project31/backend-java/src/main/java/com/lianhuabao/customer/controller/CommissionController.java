package com.lianhuabao.customer.controller;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.lianhuabao.customer.annotation.OperationLog;
import com.lianhuabao.customer.common.Result;
import com.lianhuabao.customer.entity.CommissionRule;
import com.lianhuabao.customer.entity.CommissionSettlement;
import com.lianhuabao.customer.service.CommissionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/sales/commission")
@Tag(name = "佣金管理")
public class CommissionController {

    private final CommissionService commissionService;

    public CommissionController(CommissionService commissionService) {
        this.commissionService = commissionService;
    }

    @GetMapping("/rule/page")
    @Operation(summary = "分页查询佣金规则")
    public Result<Page<CommissionRule>> getRulePage(
            @RequestParam(defaultValue = "1") Integer pageNum,
            @RequestParam(defaultValue = "10") Integer pageSize,
            @RequestParam(required = false) String keyword) {
        return Result.success(commissionService.getRulePage(pageNum, pageSize, keyword));
    }

    @GetMapping("/rule/list")
    @Operation(summary = "获取所有启用的佣金规则")
    public Result<List<CommissionRule>> getAllRules() {
        return Result.success(commissionService.getAllRules());
    }

    @PostMapping("/rule")
    @Operation(summary = "新增/修改佣金规则")
    @OperationLog("保存佣金规则")
    public Result<Void> saveRule(@RequestBody CommissionRule rule) {
        commissionService.saveRule(rule);
        return Result.success();
    }

    @GetMapping("/calculate")
    @Operation(summary = "计算佣金")
    public Result<BigDecimal> calculateCommission(@RequestParam BigDecimal amount) {
        return Result.success(commissionService.calculateCommission(amount));
    }

    @GetMapping("/settlement/page")
    @Operation(summary = "分页查询佣金结算")
    public Result<Page<CommissionSettlement>> getSettlementPage(
            @RequestParam(defaultValue = "1") Integer pageNum,
            @RequestParam(defaultValue = "10") Integer pageSize,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) Integer status,
            @RequestParam(required = false) Long salesUserId) {
        return Result.success(commissionService.getSettlementPage(pageNum, pageSize, keyword, status, salesUserId));
    }

    @PostMapping("/settlement/create/{contractId}")
    @Operation(summary = "创建佣金结算")
    @OperationLog("创建佣金结算")
    public Result<CommissionSettlement> createSettlement(@PathVariable Long contractId) {
        return Result.success(commissionService.createSettlement(contractId));
    }

    @PutMapping("/settlement/settle/{id}")
    @Operation(summary = "结算佣金")
    @OperationLog("结算佣金")
    public Result<Void> settle(@PathVariable Long id) {
        commissionService.settle(id);
        return Result.success();
    }

    @GetMapping("/settlement/export")
    @Operation(summary = "导出结算Excel")
    @OperationLog("导出佣金结算Excel")
    public void exportSettlementExcel(HttpServletResponse response,
                                      @RequestParam(required = false) String keyword) throws IOException {
        commissionService.exportSettlementExcel(response, keyword);
    }
}
