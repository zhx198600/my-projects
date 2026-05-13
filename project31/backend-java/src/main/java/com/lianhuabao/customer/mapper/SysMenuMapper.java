package com.lianhuabao.customer.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.lianhuabao.customer.entity.SysMenu;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.util.List;

@Mapper
public interface SysMenuMapper extends BaseMapper<SysMenu> {
    @Select("SELECT DISTINCT m.* FROM sys_menu m " +
            "LEFT JOIN sys_role_menu rm ON m.id = rm.menu_id " +
            "LEFT JOIN sys_user_role ur ON rm.role_id = ur.role_id " +
            "WHERE ur.user_id = #{userId} AND m.menu_type IN (1,2) AND m.status = 1 " +
            "ORDER BY m.sort")
    List<SysMenu> getUserMenus(@Param("userId") Long userId);

    @Select("SELECT * FROM sys_menu WHERE status = 1 ORDER BY sort")
    List<SysMenu> getAllMenus();
}
