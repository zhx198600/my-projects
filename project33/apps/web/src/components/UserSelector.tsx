'use client';

import { useEffect, useState } from 'react';
import { Select, Spin, Space, Tag } from 'antd';
import { userPositionApi, organizationApi } from '@/lib/api';
import { User, Organization, RoleCode } from '@project33/shared';

interface UserSelectorProps {
  value?: string | string[];
  onChange?: (userId: string | string[]) => void;
  placeholder?: string;
  style?: React.CSSProperties;
  multiple?: boolean;
}

export default function UserSelector({ value, onChange, placeholder = '选择用户', style, multiple = false }: UserSelectorProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    organizationId: undefined as string | undefined,
    roleCode: undefined as string | undefined,
  });

  useEffect(() => {
    loadOrganizations();
    loadUsers();
  }, []);

  useEffect(() => {
    loadUsers();
  }, [filters]);

  const loadOrganizations = async () => {
    try {
      const response = await organizationApi.findAll();
      setOrganizations(response.data.data || []);
    } catch (error) {
      console.error('加载组织失败');
    }
  };

  const loadUsers = async () => {
    setLoading(true);
    try {
      const response = await userPositionApi.getUsersByOrgAndRole(filters.organizationId, filters.roleCode);
      setUsers(response.data.data || []);
    } catch (error) {
      console.error('加载用户失败');
    } finally {
      setLoading(false);
    }
  };

  const roleOptions = Object.values(RoleCode).map((code) => ({
    label: code,
    value: code,
  }));

  return (
    <Select
      style={{ width: '100%', ...style }}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      mode={multiple ? 'multiple' : undefined}
      showSearch
      filterOption={(input, option) =>
        (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
      }
      dropdownRender={(menu) => (
        <div>
          <div style={{ padding: '8px', borderBottom: '1px solid #f0f0f0' }}>
            <Space wrap>
              <Select
                placeholder="按部门筛选"
                style={{ width: 150 }}
                allowClear
                size="small"
                value={filters.organizationId}
                onChange={(val) => setFilters({ ...filters, organizationId: val || undefined })}
                options={organizations.map((org) => ({ label: org.name, value: org.id }))}
              />
              <Select
                placeholder="按角色筛选"
                style={{ width: 150 }}
                allowClear
                size="small"
                value={filters.roleCode}
                onChange={(val) => setFilters({ ...filters, roleCode: val || undefined })}
                options={roleOptions}
              />
            </Space>
          </div>
          {loading ? (
            <div style={{ padding: '20px', textAlign: 'center' }}>
              <Spin />
            </div>
          ) : (
            menu
          )}
        </div>
      )}
      optionRender={(option) => {
        const user = users.find((u) => u.id === option.data.value);
        if (!user) return option.data.label;
        return (
          <Space>
            <span>{user.name || user.email}</span>
            {user.userRoles?.map((ur: any) => (
              <Tag key={ur.role.id} color="blue" size="small">
                {ur.role.name}
              </Tag>
            ))}
          </Space>
        );
      }}
      options={users.map((user) => ({
        label: user.name || user.email,
        value: user.id,
      }))}
    />
  );
}
