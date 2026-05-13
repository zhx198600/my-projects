package com.lianhuabao.customer.controller;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.lianhuabao.customer.annotation.OperationLog;
import com.lianhuabao.customer.common.Result;
import com.lianhuabao.customer.entity.ArchiveDestroy;
import com.lianhuabao.customer.entity.SysUser;
import com.lianhuabao.customer.service.ArchiveDestroyService;
import com.lianhuabao.customer.service.SysUserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.annotation.Resource;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/archive-destroy")
@Tag(name = "档案销毁管理")
public class ArchiveDestroyController {

    @Resource
    private ArchiveDestroyService archiveDestroyService;

    @Resource
    private SysUserService sysUserService;

    private SysUser getCurrentUser() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return sysUserService.getByUsername(username);
    }

    @GetMapping("/page")
    @Operation(summary = "分页查询销毁申请")
    public Result<Page<ArchiveDestroy>> getPage(
            @RequestParam(defaultValue = "1") Integer pageNum,
            @RequestParam(defaultValue = "10") Integer pageSize,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) Integer status) {
        return Result.success(archiveDestroyService.getPage(pageNum, pageSize, keyword, status));
    }

    @PostMapping("/apply")
    @Operation(summary = "提交销毁申请")
    @OperationLog("提交销毁申请")
    public Result<Void> applyDestroy(@RequestBody ArchiveDestroy destroy) {
        SysUser user = getCurrentUser();
        archiveDestroyService.applyDestroy(destroy, user.getId(), user.getNickname());
        return Result.success();
    }

    @PostMapping("/approve")
    @Operation(summary = "审核销毁申请")
    @OperationLog("审核销毁申请")
    public Result<Void> approveDestroy(
            @RequestParam Long id,
            @RequestParam Integer status,
            @RequestParam(required = false) String opinion) {
        SysUser user = getCurrentUser();
        archiveDestroyService.approveDestroy(id, status, opinion, user.getId(), user.getNickname());
        return Result.success();
    }

    @PostMapping("/execute/{id}")
    @Operation(summary = "执行销毁")
    @OperationLog("执行档案销毁")
    public Result<Void> executeDestroy(@PathVariable Long id) {
        SysUser user = getCurrentUser();
        archiveDestroyService.executeDestroy(id, user.getId(), user.getNickname());
        return Result.success();
    }
}
