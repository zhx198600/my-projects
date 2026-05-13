package com.lianhuabao.customer.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.lianhuabao.customer.entity.SysOperationLog;
import com.lianhuabao.customer.mapper.SysOperationLogMapper;
import jakarta.servlet.http.HttpServletRequest;
import org.aspectj.lang.ProceedingJoinPoint;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import java.time.LocalDateTime;

@Service
public class SysOperationLogService extends ServiceImpl<SysOperationLogMapper, SysOperationLog> {
    public Page<SysOperationLog> getLogPage(int pageNum, int pageSize, String username, String operation) {
        Page<SysOperationLog> page = new Page<>(pageNum, pageSize);
        LambdaQueryWrapper<SysOperationLog> wrapper = new LambdaQueryWrapper<>();
        if (StringUtils.hasText(username)) {
            wrapper.like(SysOperationLog::getUsername, username);
        }
        if (StringUtils.hasText(operation)) {
            wrapper.like(SysOperationLog::getOperation, operation);
        }
        wrapper.orderByDesc(SysOperationLog::getCreateTime);
        return page(page, wrapper);
    }

    public void saveLog(ProceedingJoinPoint joinPoint, String username, String operation, long time) {
        ServletRequestAttributes attributes = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
        HttpServletRequest request = attributes.getRequest();
        SysOperationLog log = new SysOperationLog();
        log.setUsername(username);
        log.setOperation(operation);
        log.setMethod(request.getMethod());
        log.setIp(getIpAddr(request));
        log.setTime(time);
        log.setCreateTime(LocalDateTime.now());
        save(log);
    }

    private String getIpAddr(HttpServletRequest request) {
        String ip = request.getHeader("X-Forwarded-For");
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getHeader("Proxy-Client-IP");
        }
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getHeader("WL-Proxy-Client-IP");
        }
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getRemoteAddr();
        }
        return ip;
    }
}
