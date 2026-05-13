package com.lianhuabao.customer.controller;

import com.lianhuabao.customer.annotation.OperationLog;
import com.lianhuabao.customer.common.Result;
import com.lianhuabao.customer.entity.SysMenu;
import com.lianhuabao.customer.entity.SysUser;
import com.lianhuabao.customer.service.SysMenuService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/menu")
public class SysMenuController {
    @Autowired
    private SysMenuService menuService;

    @GetMapping("/user-tree")
    public Result<List<SysMenu>> getUserMenuTree(Authentication authentication) {
        SysUser user = (SysUser) authentication.getPrincipal();
        return Result.success(menuService.getUserMenuTree(user.getId()));
    }

    @GetMapping("/tree")
    @PreAuthorize("hasAuthority('system:menu:list')")
    public Result<List<SysMenu>> getMenuTree() {
        return Result.success(menuService.getAllMenuTree());
    }

    @GetMapping("/list")
    @PreAuthorize("hasAuthority('system:menu:list')")
    public Result<List<SysMenu>> list(
            @RequestParam(required = false) String menuName,
            @RequestParam(required = false) Integer status) {
        return Result.success(menuService.getMenuList(menuName, status));
    }

    @PostMapping
    @PreAuthorize("hasAuthority('system:menu:add')")
    @OperationLog("新增菜单")
    public Result<Void> add(@RequestBody SysMenu menu) {
        menuService.save(menu);
        return Result.success();
    }

    @PutMapping
    @PreAuthorize("hasAuthority('system:menu:edit')")
    @OperationLog("编辑菜单")
    public Result<Void> update(@RequestBody SysMenu menu) {
        menuService.updateById(menu);
        return Result.success();
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('system:menu:delete')")
    @OperationLog("删除菜单")
    public Result<Void> delete(@PathVariable Long id) {
        menuService.removeById(id);
        return Result.success();
    }

    @GetMapping("/{id}")
    public Result<SysMenu> getById(@PathVariable Long id) {
        return Result.success(menuService.getById(id));
    }
}
