'use client';

import { useEffect, useState } from 'react';
import { Layout, Menu, Card, Statistic, Row, Col, Table, Button, Badge, Tabs, Tag, Modal, Input, Select, message, Drawer, Space } from 'antd';
import './styles.css';
import {
  DashboardOutlined,
  ProjectOutlined,
  FormOutlined,
  ApartmentOutlined,
  ProfileOutlined,
  SendOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  FileTextOutlined,
  LogoutOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';

const { Header, Sider, Content } = Layout;
const { TextArea } = Input;
const { Option } = Select;
const { TabPane } = Tabs;

type TabKey = 'pending' | 'started' | 'approved' | 'cc' | 'templates';

export default function WorkbenchPage() {
  const { isAuthenticated, loading, logout, user } = useAuth();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState<TabKey>('pending');
  const [pendingTasks, setPendingTasks] = useState<any[]>([]);
  const [startedProcesses, setStartedProcesses] = useState<any[]>([]);
  const [approvedProcesses, setApprovedProcesses] = useState<any[]>([]);
  const [templates, setTemplates] = useState<any[]>([]);
  const [detailVisible, setDetailVisible] = useState(false);
  const [selectedProcess, setSelectedProcess] = useState<any>(null);
  const [approvalComment, setApprovalComment] = useState('');
  const [approvalAction, setApprovalAction] = useState('');

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, loading, router]);

  useEffect(() => {
    if (isAuthenticated) {
      loadData();
    }
  }, [activeTab, isAuthenticated]);

  const loadData = async () => {
    try {
      switch (activeTab) {
        case 'pending':
          const tasksRes = await api.get('/workflows/tasks/my');
          setPendingTasks(tasksRes.data.data || []);
          break;
        case 'started':
          const startedRes = await api.get('/workflows/process/my');
          setStartedProcesses(startedRes.data.data || []);
          break;
        case 'approved':
          const approvedRes = await api.get('/workflows/approvals/my');
          setApprovedProcesses(approvedRes.data.data || []);
          break;
        case 'templates':
          const templatesRes = await api.get('/workflows/templates');
          if (!templatesRes.data.data || templatesRes.data.data.length === 0) {
            await api.post('/workflows/templates/init');
            const newRes = await api.get('/workflows/templates');
            setTemplates(newRes.data.data || []);
          } else {
            setTemplates(templatesRes.data.data || []);
          }
          break;
      }
    } catch (error) {
      console.error('加载数据失败', error);
    }
  };

  const handleMenuClick = ({ key }: { key: string }) => {
    switch (key) {
      case 'workbench':
        router.push('/workbench');
        break;
      case 'flow-designer':
        router.push('/flow-designer');
        break;
      case 'form-designer':
        router.push('/form-designer');
        break;
      case 'organization':
        router.push('/organization');
        break;
      case 'logout':
        logout();
        break;
    }
  };

  const handleApproval = async (task: any, action: string) => {
    try {
      await api.post(`/workflows/process/${task.processInstanceId}/tasks/${task.id}/approve`, {
        action,
        comment: approvalComment,
      });
      message.success('操作成功');
      setApprovalComment('');
      setApprovalAction('');
      loadData();
    } catch (error: any) {
      message.error(error.response?.data?.error || '操作失败');
    }
  };

  const handleEnableTemplate = async (template: any) => {
    try {
      await api.post(`/workflows/templates/${template.id}/enable`, {
        name: template.name,
        code: template.code + '_' + Date.now(),
      });
      message.success('模板启用成功！已创建对应的流程和表单');
    } catch (error: any) {
      message.error(error.response?.data?.error || '启用失败');
    }
  };

  const viewProcessDetail = async (process: any) => {
    try {
      const res = await api.get(`/workflows/process/${process.processInstanceId || process.id}`);
      setSelectedProcess(res.data.data);
      setDetailVisible(true);
    } catch (error) {
      message.error('加载详情失败');
    }
  };

  const menuItems = [
    {
      key: 'workbench',
      icon: <DashboardOutlined />,
      label: '审批工作台',
    },
    {
      key: 'flow-designer',
      icon: <ProjectOutlined />,
      label: '流程设计器',
    },
    {
      key: 'form-designer',
      icon: <FormOutlined />,
      label: '表单设计器',
    },
    {
      key: 'organization',
      icon: <ApartmentOutlined />,
      label: '组织架构',
    },
    {
      type: 'divider' as const,
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
    },
  ];

  const getStatusTag = (status: string) => {
    const statusMap: Record<string, { color: string; text: string }> = {
      RUNNING: { color: 'processing', text: '处理中' },
      COMPLETED: { color: 'success', text: '已完成' },
      REJECTED: { color: 'error', text: '已驳回' },
      PENDING: { color: 'warning', text: '待处理' },
    };
    const s = statusMap[status] || { color: 'default', text: status };
    return <Tag color={s.color}>{s.text}</Tag>;
  };

  const pendingColumns = [
    {
      title: '流程标题',
      dataIndex: ['processInstance', 'title'],
      key: 'title',
    },
    {
      title: '发起人',
      dataIndex: ['processInstance', 'startedBy', 'name'],
      key: 'starter',
    },
    {
      title: '节点名称',
      dataIndex: 'nodeName',
      key: 'nodeName',
    },
    {
      title: '发起时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => new Date(date).toLocaleDateString('zh-CN'),
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: any) => (
        <Space>
          <Button
            type="primary"
            size="small"
            onClick={() => {
              setSelectedProcess(record);
              setApprovalAction('APPROVE');
            }}
          >
            同意
          </Button>
          <Button
            danger
            size="small"
            onClick={() => {
              setSelectedProcess(record);
              setApprovalAction('REJECT');
            }}
          >
            驳回
          </Button>
          <Button size="small" onClick={() => viewProcessDetail(record.processInstance)}>
            详情
          </Button>
        </Space>
      ),
    },
  ];

  const processColumns = [
    {
      title: '流程标题',
      dataIndex: 'title',
      key: 'title',
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => getStatusTag(status),
    },
    {
      title: '发起时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => new Date(date).toLocaleDateString('zh-CN'),
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: any) => (
        <Button size="small" onClick={() => viewProcessDetail(record)}>
          详情
        </Button>
      ),
    },
  ];

  const templateIcons: Record<string, string> = {
    STUDENT_LEAVE: '📅',
    COURSE_ADJUST: '📚',
    EXPENSE_REIMBURSE: '💰',
    CAMPUS_REPAIR: '🔧',
  };

  if (loading || !isAuthenticated) {
    return <div className="workbench-loading">加载中...</div>;
  }

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider collapsible collapsed={collapsed} onCollapse={setCollapsed}>
        <div className="workbench-logo">
          {collapsed ? 'OA' : '高校审批系统'}
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={['workbench']}
          items={menuItems}
          onClick={handleMenuClick}
        />
      </Sider>
      <Layout>
        <Header className="workbench-header">
          <h1 className="workbench-header-title">审批工作台</h1>
          <div className="workbench-header-user">
            <UserOutlined />
            <span>{user?.name || user?.email}</span>
          </div>
        </Header>
        <Content className="workbench-content">
          <Row gutter={16} className="workbench-stats-row">
            <Col span={6}>
              <Card>
                <Statistic
                  title="待办审批"
                  value={pendingTasks.length}
                  prefix={<ClockCircleOutlined />}
                  valueStyle={{ color: '#1890ff' }}
                />
              </Card>
            </Col>
            <Col span={6}>
              <Card>
                <Statistic
                  title="我发起的"
                  value={startedProcesses.length}
                  prefix={<SendOutlined />}
                  valueStyle={{ color: '#52c41a' }}
                />
              </Card>
            </Col>
            <Col span={6}>
              <Card>
                <Statistic
                  title="我审批的"
                  value={approvedProcesses.length}
                  prefix={<CheckCircleOutlined />}
                  valueStyle={{ color: '#722ed1' }}
                />
              </Card>
            </Col>
            <Col span={6}>
              <Card>
                <Statistic
                  title="可用模板"
                  value={templates.length}
                  prefix={<FileTextOutlined />}
                  valueStyle={{ color: '#fa8c16' }}
                />
              </Card>
            </Col>
          </Row>

          <Card>
            <Tabs activeKey={activeTab} onChange={(key) => setActiveTab(key as TabKey)}>
              <TabPane
                tab={
                  <span>
                    <ClockCircleOutlined />
                    待办审批 <Badge count={pendingTasks.length} size="small" />
                  </span>
                }
                key="pending"
              >
                <Table
                  columns={pendingColumns}
                  dataSource={pendingTasks}
                  rowKey="id"
                  pagination={{ pageSize: 10 }}
                  locale={{ emptyText: '暂无待办事项' }}
                />
              </TabPane>
              <TabPane
                tab={
                  <span>
                    <SendOutlined />
                    我发起的
                  </span>
                }
                key="started"
              >
                <Table
                  columns={processColumns}
                  dataSource={startedProcesses}
                  rowKey="id"
                  pagination={{ pageSize: 10 }}
                  locale={{ emptyText: '暂无发起的流程' }}
                />
              </TabPane>
              <TabPane
                tab={
                  <span>
                    <CheckCircleOutlined />
                    我审批的
                  </span>
                }
                key="approved"
              >
                <Table
                  columns={[
                    { title: '流程标题', dataIndex: ['processInstance', 'title'], key: 'title' },
                    { title: '操作', dataIndex: 'action', key: 'action', render: (a: string) => (a === 'APPROVE' ? '同意' : a === 'REJECT' ? '驳回' : a) },
                    { title: '审批时间', dataIndex: 'approvedAt', key: 'approvedAt', render: (d: string) => d ? new Date(d).toLocaleDateString('zh-CN') : '-' },
                  ]}
                  dataSource={approvedProcesses}
                  rowKey="id"
                  pagination={{ pageSize: 10 }}
                  locale={{ emptyText: '暂无审批记录' }}
                />
              </TabPane>
              <TabPane
                tab={
                  <span>
                    <ProfileOutlined />
                    流程模板库
                  </span>
                }
                key="templates"
              >
                <Row gutter={[16, 16]}>
                  {templates.map((template: any) => (
                    <Col span={6} key={template.id}>
                      <Card className="workbench-template-card">
                        <div className="workbench-template-icon">
                          <div className="workbench-template-icon-size">
                            {templateIcons[template.code] || '📄'}
                          </div>
                          <h3 className="workbench-template-name">{template.name}</h3>
                          <Tag className="mb-3">{template.category}</Tag>
                          <p className="workbench-template-desc">
                            {template.description}
                          </p>
                          <Button
                            type="primary"
                            block
                            onClick={() => handleEnableTemplate(template)}
                          >
                            一键启用
                          </Button>
                        </div>
                      </Card>
                    </Col>
                  ))}
                </Row>
              </TabPane>
            </Tabs>
          </Card>
        </Content>
      </Layout>

      <Modal
        title={`确认${approvalAction === 'APPROVE' ? '同意' : '驳回'}`}
        open={!!approvalAction}
        onOk={() => handleApproval(selectedProcess, approvalAction)}
        onCancel={() => {
          setApprovalAction('');
          setApprovalComment('');
        }}
      >
        <TextArea
          rows={4}
          placeholder="请输入审批意见（可选）"
          value={approvalComment}
          onChange={(e) => setApprovalComment(e.target.value)}
        />
      </Modal>

      <Drawer
        title="流程详情"
        placement="right"
        width={600}
        open={detailVisible}
        onClose={() => setDetailVisible(false)}
      >
        {selectedProcess && (
          <div>
            <h3 className="workbench-detail-title">{selectedProcess.title}</h3>
            <p style={{ marginBottom: '16px' }}>状态：{getStatusTag(selectedProcess.status)}</p>
            <Card title="表单数据" size="small" style={{ marginBottom: '16px' }}>
              <pre className="workbench-detail-formdata">
                {JSON.stringify(selectedProcess.formData || {}, null, 2)}
              </pre>
            </Card>
            <Card title="审批时间线" size="small">
              {(selectedProcess.approvals || []).map((approval: any, index: number) => (
                <div key={index} className="workbench-log-item">
                  <div className="workbench-log-header">
                    <span className="workbench-log-user">
                      {approval.approver?.name || approval.approver?.email}
                    </span>
                    <span className="workbench-log-time">
                      {new Date(approval.approvedAt || approval.createdAt).toLocaleString('zh-CN')}
                    </span>
                  </div>
                  <Tag color={approval.action === 'APPROVE' ? 'green' : 'red'}>
                    {approval.action === 'APPROVE' ? '同意' : approval.action === 'REJECT' ? '驳回' : approval.action}
                  </Tag>
                  {approval.comment && <p className="workbench-log-comment">{approval.comment}</p>}
                </div>
              ))}
              {(selectedProcess.approvals || []).length === 0 && (
                <p className="workbench-log-empty">暂无审批记录</p>
              )}
            </Card>
          </div>
        )}
      </Drawer>
    </Layout>
  );
}
