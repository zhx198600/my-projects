package com.lianhuabao.customer.controller;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.lianhuabao.customer.annotation.OperationLog;
import com.lianhuabao.customer.common.Result;
import com.lianhuabao.customer.entity.Contact;
import com.lianhuabao.customer.service.ContactService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.annotation.Resource;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/contact")
@Tag(name = "联系人管理")
public class ContactController {

    @Resource
    private ContactService contactService;

    @GetMapping("/page")
    @Operation(summary = "分页查询联系人")
    public Result<Page<Contact>> getPage(
            @RequestParam(defaultValue = "1") Integer pageNum,
            @RequestParam(defaultValue = "10") Integer pageSize,
            @RequestParam(required = false) String keyword) {
        return Result.success(contactService.getPage(pageNum, pageSize, keyword));
    }

    @GetMapping("/customer/{customerId}")
    @Operation(summary = "根据客户查询联系人")
    public Result<List<Contact>> getByCustomerId(@PathVariable Long customerId) {
        return Result.success(contactService.getByCustomerId(customerId));
    }

    @GetMapping("/customer/{customerId}/type/{contactType}")
    @Operation(summary = "根据客户和联系人类型查询")
    public Result<List<Contact>> getByCustomerIdAndType(@PathVariable Long customerId,
                                                        @PathVariable Integer contactType) {
        return Result.success(contactService.getByCustomerIdAndType(customerId, contactType));
    }

    @GetMapping("/{id}")
    @Operation(summary = "联系人详情")
    public Result<Contact> getById(@PathVariable Long id) {
        return Result.success(contactService.getById(id));
    }

    @PostMapping
    @Operation(summary = "新增联系人")
    @OperationLog("新增联系人")
    public Result<Void> add(@RequestBody Contact contact) {
        contactService.save(contact);
        return Result.success();
    }

    @PutMapping
    @Operation(summary = "修改联系人")
    @OperationLog("修改联系人")
    public Result<Void> update(@RequestBody Contact contact) {
        contactService.updateById(contact);
        return Result.success();
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "删除联系人")
    @OperationLog("删除联系人")
    public Result<Void> delete(@PathVariable Long id) {
        contactService.removeById(id);
        return Result.success();
    }
}
