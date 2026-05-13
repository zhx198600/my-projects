package com.lianhuabao.customer.controller;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.lianhuabao.customer.annotation.OperationLog;
import com.lianhuabao.customer.common.Result;
import com.lianhuabao.customer.entity.SalesContract;
import com.lianhuabao.customer.service.SalesContractService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.Map;

@RestController
@RequestMapping("/api/sales/contract")
@Tag(name = "销售合同管理")
public class SalesContractController {

    private final SalesContractService contractService;

    public SalesContractController(SalesContractService contractService) {
        this.contractService = contractService;
    }

    @GetMapping("/page")
    @Operation(summary = "分页查询销售合同")
    public Result<Page<SalesContract>> getPage(
            @RequestParam(defaultValue = "1") Integer pageNum,
            @RequestParam(defaultValue = "10") Integer pageSize,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) Integer status,
            @RequestParam(required = false) Long customerId) {
        return Result.success(contractService.getPage(pageNum, pageSize, keyword, status, customerId));
    }

    @GetMapping("/{id}")
    @Operation(summary = "合同详情")
    public Result<SalesContract> getById(@PathVariable Long id) {
        return Result.success(contractService.getById(id));
    }

    @PostMapping
    @Operation(summary = "创建销售合同")
    @OperationLog("创建销售合同")
    public Result<Void> add(@RequestBody SalesContract contract) {
        contractService.save(contract);
        return Result.success();
    }

    @PutMapping
    @Operation(summary = "修改销售合同")
    @OperationLog("修改销售合同")
    public Result<Void> update(@RequestBody SalesContract contract) {
        contractService.updateById(contract);
        return Result.success();
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "删除销售合同")
    @OperationLog("删除销售合同")
    public Result<Void> delete(@PathVariable Long id) {
        contractService.removeById(id);
        return Result.success();
    }

    @PutMapping("/audit")
    @Operation(summary = "审核合同")
    @OperationLog("审核销售合同")
    public Result<Void> audit(@RequestBody Map<String, Object> params) {
        Long id = Long.valueOf(params.get("id").toString());
        Long auditUserId = Long.valueOf(params.get("auditUserId").toString());
        String auditUserName = params.get("auditUserName").toString();
        Integer status = Integer.valueOf(params.get("status").toString());
        String remark = params.get("remark") != null ? params.get("remark").toString() : "";
        contractService.audit(id, auditUserId, auditUserName, status, remark);
        return Result.success();
    }

    @GetMapping("/export")
    @Operation(summary = "导出Excel")
    @OperationLog("导出销售合同Excel")
    public void exportExcel(HttpServletResponse response,
                            @RequestParam(required = false) String keyword) throws IOException {
        contractService.exportExcel(response, keyword);
    }
}
