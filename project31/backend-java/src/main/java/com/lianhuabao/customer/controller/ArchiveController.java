package com.lianhuabao.customer.controller;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.lianhuabao.customer.annotation.OperationLog;
import com.lianhuabao.customer.common.Result;
import com.lianhuabao.customer.entity.Archive;
import com.lianhuabao.customer.entity.ArchiveFile;
import com.lianhuabao.customer.entity.ArchiveStatusHistory;
import com.lianhuabao.customer.entity.SysUser;
import com.lianhuabao.customer.service.ArchiveFileService;
import com.lianhuabao.customer.service.ArchiveService;
import com.lianhuabao.customer.service.SysUserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.annotation.Resource;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/archive")
@Tag(name = "档案管理")
public class ArchiveController {

    @Resource
    private ArchiveService archiveService;

    @Resource
    private ArchiveFileService archiveFileService;

    @Resource
    private SysUserService sysUserService;

    private SysUser getCurrentUser() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return sysUserService.getByUsername(username);
    }

    @GetMapping("/page")
    @Operation(summary = "分页查询档案")
    public Result<Page<Archive>> getPage(
            @RequestParam(defaultValue = "1") Integer pageNum,
            @RequestParam(defaultValue = "10") Integer pageSize,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) Integer status,
            @RequestParam(required = false) String category) {
        return Result.success(archiveService.getPage(pageNum, pageSize, keyword, status, category));
    }

    @GetMapping("/{id}")
    @Operation(summary = "档案详情")
    public Result<Archive> getById(@PathVariable Long id) {
        return Result.success(archiveService.getById(id));
    }

    @PostMapping
    @Operation(summary = "创建档案")
    @OperationLog("创建档案")
    public Result<Archive> createArchive(
            @RequestPart Archive archive,
            @RequestPart(required = false) MultipartFile[] files) {
        SysUser user = getCurrentUser();
        return Result.success(archiveService.createArchive(archive, files, user.getId(), user.getNickname()));
    }

    @PutMapping
    @Operation(summary = "修改档案")
    @OperationLog("修改档案")
    public Result<Void> update(@RequestBody Archive archive) {
        archiveService.updateById(archive);
        return Result.success();
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "删除档案")
    @OperationLog("删除档案")
    public Result<Void> delete(@PathVariable Long id) {
        archiveService.removeById(id);
        return Result.success();
    }

    @GetMapping("/{id}/files")
    @Operation(summary = "获取档案文件列表")
    public Result<List<ArchiveFile>> getFiles(@PathVariable Long id) {
        return Result.success(archiveFileService.getFilesByArchiveId(id));
    }

    @GetMapping("/file/{id}/url")
    @Operation(summary = "获取文件预览URL")
    public Result<String> getFileUrl(@PathVariable Long id) {
        ArchiveFile file = archiveFileService.getById(id);
        return Result.success(archiveFileService.getFileUrl(file.getObjectName()));
    }

    @GetMapping("/{id}/history")
    @Operation(summary = "获取状态变更历史")
    public Result<List<ArchiveStatusHistory>> getStatusHistory(@PathVariable Long id) {
        return Result.success(archiveService.getStatusHistory(id));
    }

    @GetMapping("/export")
    @Operation(summary = "导出档案Excel")
    @OperationLog("导出档案Excel")
    public void exportExcel(HttpServletResponse response,
                            @RequestParam(required = false) String keyword,
                            @RequestParam(required = false) Integer status,
                            @RequestParam(required = false) String category) throws IOException {
        archiveService.exportExcel(response, keyword, status, category);
    }
}
