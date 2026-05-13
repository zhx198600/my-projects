package com.lianhuabao.customer.controller;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.lianhuabao.customer.annotation.OperationLog;
import com.lianhuabao.customer.common.Result;
import com.lianhuabao.customer.entity.HealthRecord;
import com.lianhuabao.customer.service.HealthRecordService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.annotation.Resource;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/health")
@Tag(name = "健康档案管理")
public class HealthRecordController {

    @Resource
    private HealthRecordService healthRecordService;

    @GetMapping("/page")
    @Operation(summary = "分页查询健康档案")
    public Result<Page<HealthRecord>> getPage(
            @RequestParam(defaultValue = "1") Integer pageNum,
            @RequestParam(defaultValue = "10") Integer pageSize,
            @RequestParam(required = false) String keyword) {
        return Result.success(healthRecordService.getPage(pageNum, pageSize, keyword));
    }

    @GetMapping("/customer/{customerId}")
    @Operation(summary = "根据客户查询健康档案")
    public Result<List<HealthRecord>> getByCustomerId(@PathVariable Long customerId) {
        return Result.success(healthRecordService.getByCustomerId(customerId));
    }

    @GetMapping("/{id}")
    @Operation(summary = "健康档案详情")
    public Result<HealthRecord> getById(@PathVariable Long id) {
        return Result.success(healthRecordService.getById(id));
    }

    @PostMapping
    @Operation(summary = "新增健康档案")
    @OperationLog("新增健康档案")
    public Result<Void> add(@RequestBody HealthRecord record) {
        healthRecordService.save(record);
        return Result.success();
    }

    @PutMapping
    @Operation(summary = "修改健康档案")
    @OperationLog("修改健康档案")
    public Result<Void> update(@RequestBody HealthRecord record) {
        healthRecordService.updateById(record);
        return Result.success();
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "删除健康档案")
    @OperationLog("删除健康档案")
    public Result<Void> delete(@PathVariable Long id) {
        healthRecordService.removeById(id);
        return Result.success();
    }
}
