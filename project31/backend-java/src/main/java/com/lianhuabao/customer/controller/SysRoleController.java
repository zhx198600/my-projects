package com.lianhuabao.customer.controller;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.lianhuabao.customer.annotation.OperationLog;
import com.lianhuabao.customer.common.Result;
import com.lianhuabao.customer.entity.SysRole;
import com.lianhuabao.customer.service.SysRoleService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/role")
public class SysRoleController {
    @Autowired
    private SysRoleService roleService;

    @GetMapping("/list")
    @PreAuthorize("hasAuthority('system:role:list')")
    public Result<Page<SysRole>> list(
            @RequestParam(defaultValue = "1") int pageNum,
            @RequestParam(defaultValue = "10") int pageSize,
            @RequestParam(required = false) String roleName) {
        return Result.success(roleService.getRolePage(pageNum, pageSize, roleName));
    }

    @GetMapping("/all")
    public Result<List<SysRole>> getAll() {
        return Result.success(roleService.getAllRoles());
    }

    @PostMapping
    @PreAuthorize("hasAuthority('system:role:add')")
    @OperationLog("新增角色")
    public Result<Void> add(@RequestBody SysRole role) {
        roleService.saveRole(role);
        return Result.success();
    }

    @PutMapping
    @PreAuthorize("hasAuthority('system:role:edit')")
    @OperationLog("编辑角色")
    public Result<Void> update(@RequestBody SysRole role) {
        roleService.updateRole(role);
        return Result.success();
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('system:role:delete')")
    @OperationLog("删除角色")
    public Result<Void> delete(@PathVariable Long id) {
        roleService.removeById(id);
        return Result.success();
    }

    @GetMapping("/{id}/menu-ids")
    public Result<List<Long>> getRoleMenuIds(@PathVariable Long id) {
        return Result.success(roleService.getRoleMenuIds(id));
    }

    @PostMapping("/{id}/allocate-menus")
    @PreAuthorize("hasAuthority('system:role:edit')")
    @OperationLog("分配菜单权限")
    public Result<Void> allocateMenus(@PathVariable Long id, @RequestBody Map<String, List<Long>> map) {
        roleService.allocateMenus(id, map.get("menuIds"));
        return Result.success();
    }

    @GetMapping("/{id}")
    public Result<SysRole> getById(@PathVariable Long id) {
        return Result.success(roleService.getById(id));
    }
}
