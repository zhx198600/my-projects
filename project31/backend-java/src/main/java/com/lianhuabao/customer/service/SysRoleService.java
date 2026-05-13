package com.lianhuabao.customer.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.lianhuabao.customer.entity.SysRole;
import com.lianhuabao.customer.mapper.SysRoleMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.List;

@Service
public class SysRoleService extends ServiceImpl<SysRoleMapper, SysRole> {
    public Page<SysRole> getRolePage(int pageNum, int pageSize, String roleName) {
        Page<SysRole> page = new Page<>(pageNum, pageSize);
        LambdaQueryWrapper<SysRole> wrapper = new LambdaQueryWrapper<>();
        if (StringUtils.hasText(roleName)) {
            wrapper.like(SysRole::getRoleName, roleName);
        }
        wrapper.orderByDesc(SysRole::getCreateTime);
        return page(page, wrapper);
    }

    public List<SysRole> getAllRoles() {
        return list(new LambdaQueryWrapper<SysRole>().eq(SysRole::getStatus, 1));
    }

    @Transactional
    public boolean saveRole(SysRole role) {
        return save(role);
    }

    @Transactional
    public boolean updateRole(SysRole role) {
        return updateById(role);
    }

    @Transactional
    public boolean allocateMenus(Long roleId, List<Long> menuIds) {
        baseMapper.deleteRoleMenus(roleId);
        if (menuIds != null && !menuIds.isEmpty()) {
            baseMapper.insertRoleMenus(roleId, menuIds);
        }
        return true;
    }

    public List<Long> getRoleMenuIds(Long roleId) {
        return baseMapper.getRoleMenuIds(roleId);
    }
}
