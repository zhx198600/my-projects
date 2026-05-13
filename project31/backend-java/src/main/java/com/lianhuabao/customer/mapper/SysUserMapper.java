package com.lianhuabao.customer.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.lianhuabao.customer.entity.SysUser;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.util.List;

@Mapper
public interface SysUserMapper extends BaseMapper<SysUser> {
    @Select("SELECT DISTINCT m.perms FROM sys_user u " +
            "LEFT JOIN sys_user_role ur ON u.id = ur.user_id " +
            "LEFT JOIN sys_role_menu rm ON ur.role_id = rm.role_id " +
            "LEFT JOIN sys_menu m ON rm.menu_id = m.id " +
            "WHERE u.id = #{userId} AND m.perms IS NOT NULL AND m.perms != ''")
    List<String> getUserPermissions(@Param("userId") Long userId);
}
