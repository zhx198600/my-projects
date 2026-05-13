package com.lianhuabao.customer.controller;

import com.lianhuabao.customer.common.Result;
import com.lianhuabao.customer.dto.LoginRequest;
import com.lianhuabao.customer.dto.LoginResponse;
import com.lianhuabao.customer.entity.SysUser;
import com.lianhuabao.customer.service.SysUserService;
import com.lianhuabao.customer.utils.JwtUtil;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    @Autowired
    private AuthenticationManager authenticationManager;
    @Autowired
    private JwtUtil jwtUtil;
    @Autowired
    private SysUserService userService;

    @PostMapping("/login")
    public Result<LoginResponse> login(@Valid @RequestBody LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword())
        );
        SysUser user = (SysUser) authentication.getPrincipal();
        String token = jwtUtil.generateToken(user.getUsername());
        List<String> permissions = userService.getUserPermissions(user.getId());
        LoginResponse response = new LoginResponse(token, user.getId(), user.getUsername(), user.getRealName(), permissions);
        return Result.success(response);
    }
}
