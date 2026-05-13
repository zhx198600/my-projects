package com.lianhuabao.customer.controller;

import com.lianhuabao.customer.common.Result;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/test")
@Tag(name = "测试接口", description = "系统连通性测试接口")
public class TestController {

    @GetMapping("/hello")
    @Operation(summary = "测试接口", description = "前后端连通性测试")
    public Result<Map<String, Object>> hello() {
        Map<String, Object> data = new HashMap<>();
        data.put("message", "欢迎使用联华保险客户档案管理系统");
        data.put("timestamp", System.currentTimeMillis());
        return Result.success(data);
    }
}
