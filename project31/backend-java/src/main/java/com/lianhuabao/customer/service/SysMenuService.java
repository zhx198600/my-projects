package com.lianhuabao.customer.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.lianhuabao.customer.entity.SysMenu;
import com.lianhuabao.customer.mapper.SysMenuMapper;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class SysMenuService extends ServiceImpl<SysMenuMapper, SysMenu> {
    public List<SysMenu> getUserMenuTree(Long userId) {
        List<SysMenu> menus = baseMapper.getUserMenus(userId);
        return buildTree(menus);
    }

    public List<SysMenu> getAllMenuTree() {
        List<SysMenu> menus = baseMapper.getAllMenus();
        return buildTree(menus);
    }

    private List<SysMenu> buildTree(List<SysMenu> menus) {
        List<SysMenu> rootMenus = menus.stream()
                .filter(m -> m.getParentId() == 0)
                .collect(Collectors.toList());
        for (SysMenu menu : rootMenus) {
            setChildren(menu, menus);
        }
        return rootMenus;
    }

    private void setChildren(SysMenu parent, List<SysMenu> allMenus) {
        List<SysMenu> children = allMenus.stream()
                .filter(m -> m.getParentId().equals(parent.getId()))
                .collect(Collectors.toList());
        if (!children.isEmpty()) {
            parent.setChildren(children);
            for (SysMenu child : children) {
                setChildren(child, allMenus);
            }
        }
    }

    public List<SysMenu> getMenuList(String menuName, Integer status) {
        LambdaQueryWrapper<SysMenu> wrapper = new LambdaQueryWrapper<>();
        if (menuName != null && !menuName.isEmpty()) {
            wrapper.like(SysMenu::getMenuName, menuName);
        }
        if (status != null) {
            wrapper.eq(SysMenu::getStatus, status);
        }
        wrapper.orderByAsc(SysMenu::getSort);
        return list(wrapper);
    }
}
