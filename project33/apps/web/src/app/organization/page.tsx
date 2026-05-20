'use client';

import { useEffect, useState } from 'react';
import { Layout, Row, Col, Card, Form, Input, Select, Button, Modal, message, Table, Space, Typography, Divider, Tabs } from 'antd';
import { OrgType, OrganizationTree as OrganizationTreeType, CreateOrganizationDto, UpdateOrganizationDto, CreatePositionDto, Position, AssignUserPositionDto, UserPosition, User } from '@project33/shared';
import OrganizationTreeComponent from '@/components/OrganizationTree';
import UserSelector from '@/components/UserSelector';
import { organizationApi, positionApi, userPositionApi } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

const { Content, Sider } = Layout;
const { Title } = Typography;
const { Option } = Select;

export default function OrganizationPage() {
  const { isAuthenticated, loading, logout } = useAuth();
  const router = useRouter();
  const [form] = Form.useForm();
  const [positionForm] = Form.useForm();
  const [assignForm] = Form.useForm();
  const [supervisorForm] = Form.useForm();

  const [selectedOrg, setSelectedOrg] = useState<OrganizationTreeType | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [positionModalVisible, setPositionModalVisible] = useState(false);
  const [assignModalVisible, setAssignModalVisible] = useState(false);
  const [supervisorModalVisible, setSupervisorModalVisible] = useState(false);
  const [editingOrg, setEditingOrg] = useState<OrganizationTreeType | null>(null);
  const [parentOrgId, setParentOrgId] = useState<string | undefined>(undefined);
  const [positions, setPositions] = useState<Position[]>([]);
  const [userPositions, setUserPositions] = useState<UserPosition[]>([]);
  const [activeTab, setActiveTab] = useState('info');

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, loading, router]);

  useEffect(() => {
    if (selectedOrg) {
      loadPositions(selectedOrg.id);
      loadUserPositions(selectedOrg.id);
    }
  }, [selectedOrg]);

  const loadPositions = async (orgId: string) => {
    try {
      const response = await positionApi.findAll(orgId);
      setPositions(response.data.data || []);
    } catch (error) {
      message.error('加载岗位失败');
    }
  };

  const loadUserPositions = async (orgId: string) => {
    try {
      const response = await userPositionApi.findByOrganization(orgId);
      setUserPositions(response.data.data || []);
    } catch (error) {
      message.error('加载用户岗位失败');
    }
  };

  const handleAddOrg = (parentId?: string) => {
    setEditingOrg(null);
    setParentOrgId(parentId);
    form.resetFields();
    if (parentId) {
      form.setFieldsValue({ parentId });
    }
    setModalVisible(true);
  };

  const handleEditOrg = (org: OrganizationTreeType) => {
    setEditingOrg(org);
    form.setFieldsValue(org);
    setModalVisible(true);
  };

  const handleDeleteOrg = async (org: OrganizationTreeType) => {
    Modal.confirm({
      title: '确认删除',
      content: `确定要删除部门 "${org.name}" 吗？`,
      onOk: async () => {
        try {
          await organizationApi.remove(org.id);
          message.success('删除成功');
          setSelectedOrg(null);
        } catch (error: any) {
          message.error(error.response?.data?.error || '删除失败');
        }
      },
    });
  };

  const handleSaveOrg = async (values: CreateOrganizationDto & UpdateOrganizationDto) => {
    try {
      if (editingOrg) {
        await organizationApi.update(editingOrg.id, values);
        message.success('更新成功');
      } else {
        await organizationApi.create(values);
        message.success('创建成功');
      }
      setModalVisible(false);
    } catch (error: any) {
      message.error(error.response?.data?.error || '保存失败');
    }
  };

  const handleAddPosition = () => {
    positionForm.resetFields();
    if (selectedOrg) {
      positionForm.setFieldsValue({ organizationId: selectedOrg.id });
    }
    setPositionModalVisible(true);
  };

  const handleSavePosition = async (values: CreatePositionDto) => {
    try {
      await positionApi.create(values);
      message.success('创建成功');
      setPositionModalVisible(false);
      if (selectedOrg) {
        loadPositions(selectedOrg.id);
      }
    } catch (error: any) {
      message.error(error.response?.data?.error || '保存失败');
    }
  };

  const handleDeletePosition = async (id: string) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除该岗位吗？',
      onOk: async () => {
        try {
          await positionApi.remove(id);
          message.success('删除成功');
          if (selectedOrg) {
            loadPositions(selectedOrg.id);
          }
        } catch (error: any) {
          message.error(error.response?.data?.error || '删除失败');
        }
      },
    });
  };

  const handleAssignUser = () => {
    assignForm.resetFields();
    if (selectedOrg) {
      assignForm.setFieldsValue({ organizationId: selectedOrg.id, isPrimary: true });
    }
    setAssignModalVisible(true);
  };

  const handleSaveAssign = async (values: AssignUserPositionDto) => {
    try {
      await userPositionApi.assign(values);
      message.success('分配成功');
      setAssignModalVisible(false);
      if (selectedOrg) {
        loadUserPositions(selectedOrg.id);
      }
    } catch (error: any) {
      message.error(error.response?.data?.error || '分配失败');
    }
  };

  const handleRemoveUserPosition = async (id: string) => {
    Modal.confirm({
      title: '确认移除',
      content: '确定要移除该用户的岗位吗？',
      onOk: async () => {
        try {
          await userPositionApi.remove(id);
          message.success('移除成功');
          if (selectedOrg) {
            loadUserPositions(selectedOrg.id);
          }
        } catch (error: any) {
          message.error(error.response?.data?.error || '移除失败');
        }
      },
    });
  };

  const handleSaveSupervisor = async (values: { userId: string; supervisorId: string }) => {
    try {
      await userPositionApi.updateSupervisor(values);
      message.success('设置上级成功');
      setSupervisorModalVisible(false);
    } catch (error: any) {
      message.error(error.response?.data?.error || '设置失败');
    }
  };

  const positionColumns = [
    { title: '岗位名称', dataIndex: 'name', key: 'name' },
    { title: '岗位编码', dataIndex: 'code', key: 'code' },
    { title: '级别', dataIndex: 'level', key: 'level' },
    { title: '排序', dataIndex: 'sort', key: 'sort' },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: Position) => (
        <Button type="link" danger onClick={() => handleDeletePosition(record.id)}>删除</Button>
      ),
    },
  ];

  const userColumns = [
    { title: '用户', dataIndex: ['user', 'name'], key: 'userName', render: (name: string, record: any) => name || record.user?.email },
    { title: '岗位', dataIndex: ['position', 'name'], key: 'positionName' },
    { title: '主岗位', dataIndex: 'isPrimary', key: 'isPrimary', render: (isPrimary: boolean) => isPrimary ? '是' : '否' },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: UserPosition) => (
        <Button type="link" danger onClick={() => handleRemoveUserPosition(record.id)}>移除</Button>
      ),
    },
  ];

  if (loading) {
    return <div style={{ padding: 50, textAlign: 'center' }}>加载中...</div>;
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Layout.Header style={{ background: '#fff', padding: '0 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
        <Title level={4} style={{ margin: 0 }}>组织架构管理</Title>
        <Button onClick={logout}>退出登录</Button>
      </Layout.Header>
      <Layout>
        <Sider width={350} style={{ background: '#fff', padding: 16, borderRight: '1px solid #f0f0f0' }}>
          <OrganizationTreeComponent
            onSelectOrg={setSelectedOrg}
            onAdd={handleAddOrg}
            onEdit={handleEditOrg}
            onDelete={handleDeleteOrg}
          />
        </Sider>
        <Content style={{ padding: 24, background: '#f0f2f5' }}>
          {selectedOrg ? (
            <Card title={selectedOrg.name}>
              <Tabs activeKey={activeTab} onChange={setActiveTab}>
                <Tabs.TabPane tab="部门信息" key="info">
                  <Row gutter={16}>
                    <Col span={12}>
                      <p><strong>编码：</strong>{selectedOrg.code}</p>
                      <p><strong>类型：</strong>{selectedOrg.type}</p>
                      <p><strong>层级：</strong>{selectedOrg.level}</p>
                    </Col>
                    <Col span={12}>
                      <p><strong>排序：</strong>{selectedOrg.sort}</p>
                      <p><strong>ID：</strong>{selectedOrg.id}</p>
                    </Col>
                  </Row>
                  <Space style={{ marginTop: 16 }}>
                    <Button type="primary" onClick={() => handleEditOrg(selectedOrg)}>编辑部门</Button>
                  </Space>
                </Tabs.TabPane>

                <Tabs.TabPane tab="岗位管理" key="positions">
                  <div style={{ marginBottom: 16 }}>
                    <Button type="primary" onClick={handleAddPosition}>添加岗位</Button>
                  </div>
                  <Table
                    columns={positionColumns}
                    dataSource={positions}
                    rowKey="id"
                    pagination={false}
                  />
                </Tabs.TabPane>

                <Tabs.TabPane tab="用户分配" key="users">
                  <div style={{ marginBottom: 16 }}>
                    <Space>
                      <Button type="primary" onClick={handleAssignUser}>分配用户</Button>
                      <Button onClick={() => setSupervisorModalVisible(true)}>设置上级</Button>
                    </Space>
                  </div>
                  <Table
                    columns={userColumns}
                    dataSource={userPositions}
                    rowKey="id"
                    pagination={false}
                  />
                </Tabs.TabPane>
              </Tabs>
            </Card>
          ) : (
            <Card>
              <div style={{ textAlign: 'center', color: '#999', padding: 50 }}>
                请从左侧选择一个部门
              </div>
            </Card>
          )}
        </Content>
      </Layout>

      <Modal
        title={editingOrg ? '编辑部门' : '添加部门'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        onOk={() => form.submit()}
      >
        <Form form={form} layout="vertical" onFinish={handleSaveOrg}>
          <Form.Item name="name" label="部门名称" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="code" label="部门编码" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="type" label="部门类型" rules={[{ required: true }]}>
            <Select>
              {Object.values(OrgType).map((type) => (
                <Option key={type} value={type}>{type}</Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="parentId" label="上级部门">
            <Input disabled />
          </Form.Item>
          <Form.Item name="sort" label="排序">
            <Input type="number" />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="添加岗位"
        open={positionModalVisible}
        onCancel={() => setPositionModalVisible(false)}
        onOk={() => positionForm.submit()}
      >
        <Form form={positionForm} layout="vertical" onFinish={handleSavePosition}>
          <Form.Item name="name" label="岗位名称" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="code" label="岗位编码" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="organizationId" label="所属部门" hidden>
            <Input />
          </Form.Item>
          <Form.Item name="level" label="级别">
            <Input type="number" />
          </Form.Item>
          <Form.Item name="sort" label="排序">
            <Input type="number" />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="分配用户岗位"
        open={assignModalVisible}
        onCancel={() => setAssignModalVisible(false)}
        onOk={() => assignForm.submit()}
      >
        <Form form={assignForm} layout="vertical" onFinish={handleSaveAssign}>
          <Form.Item name="userId" label="选择用户" rules={[{ required: true }]}>
            <UserSelector />
          </Form.Item>
          <Form.Item name="organizationId" label="所属部门" hidden>
            <Input />
          </Form.Item>
          <Form.Item name="positionId" label="岗位">
            <Select>
              {positions.map((pos) => (
                <Option key={pos.id} value={pos.id}>{pos.name}</Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="isPrimary" label="是否为主岗位" valuePropName="checked">
            <Input type="checkbox" />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="设置用户上级"
        open={supervisorModalVisible}
        onCancel={() => setSupervisorModalVisible(false)}
        onOk={() => supervisorForm.submit()}
      >
        <Form form={supervisorForm} layout="vertical" onFinish={handleSaveSupervisor}>
          <Form.Item name="userId" label="选择用户" rules={[{ required: true }]}>
            <UserSelector placeholder="选择要设置上级的用户" />
          </Form.Item>
          <Form.Item name="supervisorId" label="选择上级" rules={[{ required: true }]}>
            <UserSelector placeholder="选择上级用户" />
          </Form.Item>
        </Form>
      </Modal>
    </Layout>
  );
}
