package com.lianhuabao.customer.controller;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.lianhuabao.customer.annotation.OperationLog;
import com.lianhuabao.customer.common.Result;
import com.lianhuabao.customer.entity.Customer;
import com.lianhuabao.customer.service.CustomerService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.annotation.Resource;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/customer")
@Tag(name = "客户信息管理")
public class CustomerController {

    @Resource
    private CustomerService customerService;

    @GetMapping("/page")
    @Operation(summary = "分页查询客户")
    public Result<Page<Customer>> getPage(
            @RequestParam(defaultValue = "1") Integer pageNum,
            @RequestParam(defaultValue = "10") Integer pageSize,
            @RequestParam(required = false) String keyword) {
        return Result.success(customerService.getPage(pageNum, pageSize, keyword));
    }

    @GetMapping("/list")
    @Operation(summary = "客户列表")
    public Result<List<Customer>> list() {
        return Result.success(customerService.list());
    }

    @GetMapping("/{id}")
    @Operation(summary = "客户详情")
    public Result<Customer> getById(@PathVariable Long id) {
        return Result.success(customerService.getById(id));
    }

    @PostMapping
    @Operation(summary = "新增客户")
    @OperationLog("新增客户")
    public Result<Void> add(@RequestBody Customer customer) {
        customerService.save(customer);
        return Result.success();
    }

    @PutMapping
    @Operation(summary = "修改客户")
    @OperationLog("修改客户")
    public Result<Void> update(@RequestBody Customer customer) {
        customerService.updateById(customer);
        return Result.success();
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "删除客户")
    @OperationLog("删除客户")
    public Result<Void> delete(@PathVariable Long id) {
        customerService.removeById(id);
        return Result.success();
    }

    @GetMapping("/export")
    @Operation(summary = "导出客户Excel")
    @OperationLog("导出客户Excel")
    public void exportExcel(HttpServletResponse response,
                            @RequestParam(required = false) String keyword) throws IOException {
        customerService.exportExcel(response, keyword);
    }
}
