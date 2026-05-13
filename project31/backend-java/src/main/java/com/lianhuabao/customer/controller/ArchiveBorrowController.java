package com.lianhuabao.customer.controller;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.lianhuabao.customer.annotation.OperationLog;
import com.lianhuabao.customer.common.Result;
import com.lianhuabao.customer.entity.ArchiveBorrow;
import com.lianhuabao.customer.entity.SysUser;
import com.lianhuabao.customer.service.ArchiveBorrowService;
import com.lianhuabao.customer.service.SysUserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.annotation.Resource;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/archive-borrow")
@Tag(name = "档案借阅管理")
public class ArchiveBorrowController {

    @Resource
    private ArchiveBorrowService archiveBorrowService;

    @Resource
    private SysUserService sysUserService;

    private SysUser getCurrentUser() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return sysUserService.getByUsername(username);
    }

    @GetMapping("/page")
    @Operation(summary = "分页查询借阅申请")
    public Result<Page<ArchiveBorrow>> getPage(
            @RequestParam(defaultValue = "1") Integer pageNum,
            @RequestParam(defaultValue = "10") Integer pageSize,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) Integer status) {
        return Result.success(archiveBorrowService.getPage(pageNum, pageSize, keyword, status));
    }

    @GetMapping("/expiring")
    @Operation(summary = "获取即将到期的借阅")
    public Result<List<ArchiveBorrow>> getExpiringBorrows() {
        return Result.success(archiveBorrowService.getExpiringBorrows());
    }

    @PostMapping("/apply")
    @Operation(summary = "提交借阅申请")
    @OperationLog("提交借阅申请")
    public Result<Void> applyBorrow(@RequestBody ArchiveBorrow borrow) {
        SysUser user = getCurrentUser();
        archiveBorrowService.applyBorrow(borrow, user.getId(), user.getNickname());
        return Result.success();
    }

    @PostMapping("/approve")
    @Operation(summary = "审核借阅申请")
    @OperationLog("审核借阅申请")
    public Result<Void> approveBorrow(
            @RequestParam Long id,
            @RequestParam Integer status,
            @RequestParam(required = false) String opinion) {
        SysUser user = getCurrentUser();
        archiveBorrowService.approveBorrow(id, status, opinion, user.getId(), user.getNickname());
        return Result.success();
    }

    @PostMapping("/return/{id}")
    @Operation(summary = "归还档案")
    @OperationLog("归还档案")
    public Result<Void> returnArchive(@PathVariable Long id) {
        SysUser user = getCurrentUser();
        archiveBorrowService.returnArchive(id, user.getId(), user.getNickname());
        return Result.success();
    }
}
