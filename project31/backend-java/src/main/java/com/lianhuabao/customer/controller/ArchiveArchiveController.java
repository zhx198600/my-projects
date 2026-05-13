package com.lianhuabao.customer.controller;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.lianhuabao.customer.annotation.OperationLog;
import com.lianhuabao.customer.common.Result;
import com.lianhuabao.customer.entity.ArchiveArchive;
import com.lianhuabao.customer.entity.SysUser;
import com.lianhuabao.customer.service.ArchiveArchiveService;
import com.lianhuabao.customer.service.SysUserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.annotation.Resource;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/archive-archive")
@Tag(name = "档案归档管理")
public class ArchiveArchiveController {

    @Resource
    private ArchiveArchiveService archiveArchiveService;

    @Resource
    private SysUserService sysUserService;

    private SysUser getCurrentUser() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return sysUserService.getByUsername(username);
    }

    @GetMapping("/page")
    @Operation(summary = "分页查询归档申请")
    public Result<Page<ArchiveArchive>> getPage(
            @RequestParam(defaultValue = "1") Integer pageNum,
            @RequestParam(defaultValue = "10") Integer pageSize,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) Integer status) {
        return Result.success(archiveArchiveService.getPage(pageNum, pageSize, keyword, status));
    }

    @PostMapping("/apply")
    @Operation(summary = "提交归档申请")
    @OperationLog("提交归档申请")
    public Result<Void> applyArchive(@RequestBody ArchiveArchive archiveArchive) {
        SysUser user = getCurrentUser();
        archiveArchiveService.applyArchive(archiveArchive, user.getId(), user.getNickname());
        return Result.success();
    }

    @PostMapping("/approve")
    @Operation(summary = "审核归档申请")
    @OperationLog("审核归档申请")
    public Result<Void> approveArchive(
            @RequestParam Long id,
            @RequestParam Integer status,
            @RequestParam(required = false) String opinion) {
        SysUser user = getCurrentUser();
        archiveArchiveService.approveArchive(id, status, opinion, user.getId(), user.getNickname());
        return Result.success();
    }
}
