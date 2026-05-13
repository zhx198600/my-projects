package com.lianhuabao.customer.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.lianhuabao.customer.entity.SysUser;
import com.lianhuabao.customer.entity.SysUserRole;
import com.lianhuabao.customer.mapper.SysUserMapper;
import com.lianhuabao.customer.mapper.SysUserRoleMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.List;

@Service
public class SysUserService extends ServiceImpl<SysUserMapper, SysUser> {
    @Autowired
    private PasswordEncoder passwordEncoder;
    @Autowired
    private SysUserRoleMapper userRoleMapper;

    public Page<SysUser> getUserPage(int pageNum, int pageSize, String username, Integer status) {
        Page<SysUser> page = new Page<>(pageNum, pageSize);
        LambdaQueryWrapper<SysUser> wrapper = new LambdaQueryWrapper<>();
        if (StringUtils.hasText(username)) {
            wrapper.like(SysUser::getUsername, username);
        }
        if (status != null) {
            wrapper.eq(SysUser::getStatus, status);
        }
        wrapper.orderByDesc(SysUser::getCreateTime);
        return page(page, wrapper);
    }

    @Transactional
    public boolean addUser(SysUser user) {
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        boolean result = save(user);
        if (result && user.getRoleIds() != null && !user.getRoleIds().isEmpty()) {
            for (Long roleId : user.getRoleIds()) {
                SysUserRole userRole = new SysUserRole();
                userRole.setUserId(user.getId());
                userRole.setRoleId(roleId);
                userRoleMapper.insert(userRole);
            }
        }
        return result;
    }

    @Transactional
    public boolean updateUser(SysUser user) {
        userRoleMapper.deleteUserRoles(user.getId());
        if (user.getRoleIds() != null && !user.getRoleIds().isEmpty()) {
            for (Long roleId : user.getRoleIds()) {
                SysUserRole userRole = new SysUserRole();
                userRole.setUserId(user.getId());
                userRole.setRoleId(roleId);
                userRoleMapper.insert(userRole);
            }
        }
        return updateById(user);
    }

    public boolean resetPassword(Long userId, String newPassword) {
        SysUser user = new SysUser();
        user.setId(userId);
        user.setPassword(passwordEncoder.encode(newPassword));
        return updateById(user);
    }

    public boolean toggleStatus(Long userId) {
        SysUser user = getById(userId);
        user.setStatus(user.getStatus() == 1 ? 0 : 1);
        return updateById(user);
    }

    public List<String> getUserPermissions(Long userId) {
        return baseMapper.getUserPermissions(userId);
    }

    public SysUser getByUsername(String username) {
        return this.getOne(new LambdaQueryWrapper<SysUser>().eq(SysUser::getUsername, username));
    }
}
