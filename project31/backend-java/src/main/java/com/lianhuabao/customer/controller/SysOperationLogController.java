package com.lianhuabao.customer.controller;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.lianhuabao.customer.common.Result;
import com.lianhuabao.customer.entity.SysOperationLog;
import com.lianhuabao.customer.service.SysOperationLogService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/log")
public class SysOperationLogController {
    @Autowired
    private SysOperationLogService logService;

    @GetMapping("/list")
    @PreAuthorize("hasAuthority('system:log:list')")
    public Result<Page<SysOperationLog>> list(
            @RequestParam(defaultValue = "1") int pageNum,
            @RequestParam(defaultValue = "10") int pageSize,
            @RequestParam(required = false) String username,
            @RequestParam(required = false) String operation) {
        return Result.success(logService.getLogPage(pageNum, pageSize, username, operation));
    }
}
