'use client';

import { useEffect, useState } from 'react';
import { Tree, Button, Space, Typography, message } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, ReloadOutlined } from '@ant-design/icons';
import { organizationApi } from '@/lib/api';
import { OrganizationTree as OrganizationTreeType } from '@project33/shared';

const { Title } = Typography;

interface OrganizationTreeProps {
  onSelectOrg: (org: OrganizationTreeType) => void;
  onAdd: (parentId?: string) => void;
  onEdit: (org: OrganizationTreeType) => void;
  onDelete: (org: OrganizationTreeType) => void;
}

export default function OrganizationTreeComponent({ onSelectOrg, onAdd, onEdit, onDelete }: OrganizationTreeProps) {
  const [treeData, setTreeData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);
  const [selectedOrg, setSelectedOrg] = useState<OrganizationTreeType | null>(null);

  const loadTreeData = async () => {
    setLoading(true);
    try {
      const response = await organizationApi.findTree();
      const data = response.data.data || [];
      setTreeData(convertToTreeData(data as OrganizationTreeType[]));
    } catch (error) {
      message.error('加载组织架构失败');
    } finally {
      setLoading(false);
    }
  };

  const convertToTreeData = (orgs: OrganizationTreeType[]): any[] => {
    return orgs.map((org) => ({
      key: org.id,
      title: (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', paddingRight: 8 }}>
          <span>{org.name}</span>
          <Space>
            <Button
              type="text"
              size="small"
              icon={<PlusOutlined />}
              onClick={(e) => {
                e.stopPropagation();
                onAdd(org.id);
              }}
            />
            <Button
              type="text"
              size="small"
              icon={<EditOutlined />}
              onClick={(e) => {
                e.stopPropagation();
                onEdit(org);
              }}
            />
            <Button
              type="text"
              size="small"
              danger
              icon={<DeleteOutlined />}
              onClick={(e) => {
                e.stopPropagation();
                onDelete(org);
              }}
            />
          </Space>
        </div>
      ),
      children: org.children && org.children.length > 0 ? convertToTreeData(org.children) : undefined,
    }));
  };

  useEffect(() => {
    loadTreeData();
  }, []);

  const handleSelect = (selectedKeysValue: React.Key[], info: any) => {
    setSelectedKeys(selectedKeysValue as string[]);
    if (info.node) {
      setSelectedOrg(info.node as OrganizationTreeType);
      onSelectOrg(info.node as OrganizationTreeType);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Title level={5} style={{ margin: 0 }}>组织架构</Title>
        <Space>
          <Button icon={<ReloadOutlined />} onClick={loadTreeData} loading={loading}>刷新</Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => onAdd()}>添加根部门</Button>
        </Space>
      </div>
      <Tree
        showLine
        expandedKeys={treeData.map((item) => item.key as string)}
        selectedKeys={selectedKeys}
        onSelect={handleSelect}
        treeData={treeData}
      />
    </div>
  );
}
