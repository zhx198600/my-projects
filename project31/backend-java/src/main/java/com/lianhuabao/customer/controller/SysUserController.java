package com.lianhuabao.customer.controller;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.lianhuabao.customer.annotation.OperationLog;
import com.lianhuabao.customer.common.Result;
import com.lianhuabao.customer.entity.SysUser;
import com.lianhuabao.customer.service.SysUserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/user")
public class SysUserController {
    @Autowired
    private SysUserService userService;

    @GetMapping("/list")
    @PreAuthorize("hasAuthority('system:user:list')")
    public Result<Page<SysUser>> list(
            @RequestParam(defaultValue = "1") int pageNum,
            @RequestParam(defaultValue = "10") int pageSize,
            @RequestParam(required = false) String username,
            @RequestParam(required = false) Integer status) {
        return Result.success(userService.getUserPage(pageNum, pageSize, username, status));
    }

    @PostMapping
    @PreAuthorize("hasAuthority('system:user:add')")
    @OperationLog("新增用户")
    public Result<Void> add(@RequestBody SysUser user) {
        userService.addUser(user);
        return Result.success();
    }

    @PutMapping
    @PreAuthorize("hasAuthority('system:user:edit')")
    @OperationLog("编辑用户")
    public Result<Void> update(@RequestBody SysUser user) {
        userService.updateUser(user);
        return Result.success();
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('system:user:delete')")
    @OperationLog("删除用户")
    public Result<Void> delete(@PathVariable Long id) {
        userService.removeById(id);
        return Result.success();
    }

    @PutMapping("/{id}/reset-password")
    @PreAuthorize("hasAuthority('system:user:reset')")
    @OperationLog("重置密码")
    public Result<Void> resetPassword(@PathVariable Long id, @RequestBody Map<String, String> map) {
        userService.resetPassword(id, map.get("password"));
        return Result.success();
    }

    @PutMapping("/{id}/toggle-status")
    @OperationLog("切换用户状态")
    public Result<Void> toggleStatus(@PathVariable Long id) {
        userService.toggleStatus(id);
        return Result.success();
    }

    @GetMapping("/{id}")
    public Result<SysUser> getById(@PathVariable Long id) {
        return Result.success(userService.getById(id));
    }
}
