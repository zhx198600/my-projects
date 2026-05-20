'use client';

import { useEffect, useState } from 'react';
import { Select, Space, Tag, Button, Card, Radio } from 'antd';
import { UserOutlined, TeamOutlined, ApartmentOutlined, CrownOutlined, UsergroupDeleteOutlined } from '@ant-design/icons';
import { userApi, organizationApi, roleApi, positionApi } from '@/lib/api';
import { User, Organization, Role, Position, ApproverType, ApproverConfig } from '@project33/shared';

interface ApproverSelectorProps {
  value?: ApproverConfig[];
  onChange?: (approvers: ApproverConfig[]) => void;
}

const approverTypeLabels: Record<ApproverType, { label: string; icon: React.ReactNode }> = {
  [ApproverType.USER]: { label: '指定人员', icon: <UserOutlined /> },
  [ApproverType.ROLE]: { label: '指定角色', icon: <TeamOutlined /> },
  [ApproverType.DEPARTMENT]: { label: '指定部门', icon: <ApartmentOutlined /> },
  [ApproverType.POSITION]: { label: '指定岗位', icon: <CrownOutlined /> },
  [ApproverType.DIRECT_SUPERVISOR]: { label: '直属领导', icon: <UsergroupDeleteOutlined /> },
};

export default function ApproverSelector({ value = [], onChange }: ApproverSelectorProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [positions, setPositions] = useState<Position[]>([]);
  const [selectedType, setSelectedType] = useState<ApproverType>(ApproverType.USER);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [usersRes, orgsRes, rolesRes, positionsRes] = await Promise.all([
        userApi.findAll(),
        organizationApi.findAll(),
        roleApi.findAll(),
        positionApi.findAll(),
      ]);
      setUsers(usersRes.data.data || []);
      setOrganizations(orgsRes.data.data || []);
      setRoles(rolesRes.data.data || []);
      setPositions(positionsRes.data.data || []);
    } catch (error) {
      console.error('加载数据失败', error);
    }
  };

  const handleAddApprover = (type: ApproverType, itemValue?: string, itemLabel?: string) => {
    if (type === ApproverType.DIRECT_SUPERVISOR) {
      const exists = value.some((v) => v.type === ApproverType.DIRECT_SUPERVISOR);
      if (exists) return;
    }

    const newApprover: ApproverConfig = {
      type,
      value: itemValue,
      label: itemLabel || approverTypeLabels[type].label,
    };

    const newValue = [...value, newApprover];
    onChange?.(newValue);
  };

  const handleRemoveApprover = (index: number) => {
    const newValue = [...value];
    newValue.splice(index, 1);
    onChange?.(newValue);
  };

  const renderSelector = () => {
    switch (selectedType) {
      case ApproverType.USER:
        return (
          <Select
            style={{ flex: 1 }}
            placeholder="选择用户"
            showSearch
            filterOption={(input, option) =>
              (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
            }
            onChange={(val, option) => {
              const opt = Array.isArray(option) ? option[0] : option;
              handleAddApprover(ApproverType.USER, val, opt?.label);
            }}
            options={users.map((user) => ({
              label: user.name || user.email,
              value: user.id,
            }))}
          />
        );
      case ApproverType.ROLE:
        return (
          <Select
            style={{ flex: 1 }}
            placeholder="选择角色"
            onChange={(val, option) => {
              const opt = Array.isArray(option) ? option[0] : option;
              handleAddApprover(ApproverType.ROLE, val, opt?.label);
            }}
            options={roles.map((role) => ({
              label: role.name,
              value: role.id,
            }))}
          />
        );
      case ApproverType.DEPARTMENT:
        return (
          <Select
            style={{ flex: 1 }}
            placeholder="选择部门"
            onChange={(val, option) => {
              const opt = Array.isArray(option) ? option[0] : option;
              handleAddApprover(ApproverType.DEPARTMENT, val, opt?.label);
            }}
            options={organizations.map((org) => ({
              label: org.name,
              value: org.id,
            }))}
          />
        );
      case ApproverType.POSITION:
        return (
          <Select
            style={{ flex: 1 }}
            placeholder="选择岗位"
            onChange={(val, option) => {
              const opt = Array.isArray(option) ? option[0] : option;
              handleAddApprover(ApproverType.POSITION, val, opt?.label);
            }}
            options={positions.map((pos) => ({
              label: pos.name,
              value: pos.id,
            }))}
          />
        );
      case ApproverType.DIRECT_SUPERVISOR:
        return (
          <Button
            type="primary"
            onClick={() => handleAddApprover(ApproverType.DIRECT_SUPERVISOR)}
            disabled={value.some((v) => v.type === ApproverType.DIRECT_SUPERVISOR)}
          >
            添加直属领导作为审批人
          </Button>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-4">
      <Card size="small" title="审批人配置">
        <div className="space-y-3">
          <div>
            <Radio.Group
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              optionType="button"
              buttonStyle="solid"
              size="small"
            >
              {Object.entries(approverTypeLabels).map(([type, config]) => (
                <Radio.Button key={type} value={type}>
                  <Space size="small">
                    {config.icon}
                    <span className="hidden sm:inline">{config.label}</span>
                  </Space>
                </Radio.Button>
              ))}
            </Radio.Group>
          </div>

          <div className="flex items-center gap-2">
            {renderSelector()}
          </div>
        </div>
      </Card>

      <div className="space-y-2">
        <div className="text-sm text-gray-600 font-medium">已选择的审批人：</div>
        {value.length === 0 ? (
          <div className="text-gray-400 text-sm">暂未配置审批人</div>
        ) : (
          <Space wrap>
            {value.map((approver, index) => (
              <Tag
                key={index}
                color={getApproverColor(approver.type)}
                closable
                onClose={() => handleRemoveApprover(index)}
              >
                <Space size="small">
                  {approverTypeLabels[approver.type].icon}
                  <span>{approverTypeLabels[approver.type].label}</span>
                  {approver.label && approver.type !== ApproverType.DIRECT_SUPERVISOR && approver.label !== approverTypeLabels[approver.type].label && (
                    <span className="font-medium">: {approver.label}</span>
                  )}
                </Space>
              </Tag>
            ))}
          </Space>
        )}
      </div>
    </div>
  );
}

function getApproverColor(type: ApproverType): string {
  switch (type) {
    case ApproverType.USER:
      return 'blue';
    case ApproverType.ROLE:
      return 'green';
    case ApproverType.DEPARTMENT:
      return 'purple';
    case ApproverType.POSITION:
      return 'orange';
    case ApproverType.DIRECT_SUPERVISOR:
      return 'cyan';
    default:
      return 'default';
  }
}
