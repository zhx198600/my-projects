package com.lianhuabao.customer.controller;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.lianhuabao.customer.annotation.OperationLog;
import com.lianhuabao.customer.common.Result;
import com.lianhuabao.customer.entity.InsurancePolicy;
import com.lianhuabao.customer.service.InsurancePolicyService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.annotation.Resource;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/insurance")
@Tag(name = "投保信息管理")
public class InsurancePolicyController {

    @Resource
    private InsurancePolicyService insurancePolicyService;

    @GetMapping("/page")
    @Operation(summary = "分页查询投保信息")
    public Result<Page<InsurancePolicy>> getPage(
            @RequestParam(defaultValue = "1") Integer pageNum,
            @RequestParam(defaultValue = "10") Integer pageSize,
            @RequestParam(required = false) String keyword) {
        return Result.success(insurancePolicyService.getPage(pageNum, pageSize, keyword));
    }

    @GetMapping("/customer/{customerId}")
    @Operation(summary = "根据客户查询投保信息")
    public Result<List<InsurancePolicy>> getByCustomerId(@PathVariable Long customerId) {
        return Result.success(insurancePolicyService.getByCustomerId(customerId));
    }

    @GetMapping("/{id}")
    @Operation(summary = "投保信息详情")
    public Result<InsurancePolicy> getById(@PathVariable Long id) {
        return Result.success(insurancePolicyService.getById(id));
    }

    @PostMapping
    @Operation(summary = "新增投保信息")
    @OperationLog("新增投保信息")
    public Result<Void> add(@RequestBody InsurancePolicy policy) {
        insurancePolicyService.save(policy);
        return Result.success();
    }

    @PutMapping
    @Operation(summary = "修改投保信息")
    @OperationLog("修改投保信息")
    public Result<Void> update(@RequestBody InsurancePolicy policy) {
        insurancePolicyService.updateById(policy);
        return Result.success();
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "删除投保信息")
    @OperationLog("删除投保信息")
    public Result<Void> delete(@PathVariable Long id) {
        insurancePolicyService.removeById(id);
        return Result.success();
    }
}
