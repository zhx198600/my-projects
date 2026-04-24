import { useState, useEffect, useRef } from 'react';
import { Card, Table, Tag, Spin, Empty, Typography, Alert, Button, Space, message } from 'antd';
import { MessageOutlined, ReloadOutlined, DownloadOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { sessionApi } from '../../services/api';
import type { Session, Message } from '../../services/api';

const { Text } = Typography;

const formatDateTime = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  } catch {
    return dateString;
  }
};

const formatTime = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  } catch {
    return dateString;
  }
};

interface TableSession extends Session {
  key: string;
}

const ConversationsPage = () => {
  const [sessions, setSessions] = useState<TableSession[]>([]);
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [messagesLoading, setMessagesLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [messagesError, setMessagesError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const fetchSessions = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await sessionApi.getList();
      const tableData: TableSession[] = data.map((session) => ({
        ...session,
        key: session.id,
      }));
      setSessions(tableData);
    } catch (err) {
      setError(err instanceof Error ? err.message : '获取会话列表失败');
      setSessions([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (sessionId: string) => {
    setMessagesLoading(true);
    setMessagesError(null);
    try {
      const data = await sessionApi.getMessages(sessionId);
      setMessages(data.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()));
    } catch (err) {
      setMessagesError(err instanceof Error ? err.message : '获取消息失败');
      setMessages([]);
    } finally {
      setMessagesLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  useEffect(() => {
    if (selectedSessionId) {
      fetchMessages(selectedSessionId);
    }
  }, [selectedSessionId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleRowClick = (record: TableSession) => {
    setSelectedSessionId(record.id);
  };

  const handleExport = () => {
    if (!selectedSessionId || messages.length === 0) {
      message.warning('没有可导出的消息');
      return;
    }

    const selectedSession = sessions.find((s) => s.id === selectedSessionId);
    const exportData = {
      sessionId: selectedSessionId,
      username: selectedSession?.username || '未知用户',
      createdAt: selectedSession?.created_at || '',
      status: selectedSession?.status || '',
      messageCount: messages.length,
      messages: messages.map((msg) => ({
        id: msg.id,
        sender: msg.sender === 'user' ? '用户' : '机器人',
        message: msg.message,
        timestamp: msg.timestamp,
      })),
    };

    const jsonContent = JSON.stringify(exportData, null, 2);
    const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `对话记录_${selectedSession?.username || '未知'}_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    message.success('导出成功');
  };

  const handleExportText = () => {
    if (!selectedSessionId || messages.length === 0) {
      message.warning('没有可导出的消息');
      return;
    }

    const selectedSession = sessions.find((s) => s.id === selectedSessionId);
    const separator = '========================================';
    let textContent = '\n' + separator + '\n';
    textContent += '          对话记录导出\n';
    textContent += separator + '\n\n';
    textContent += '会话ID: ' + selectedSessionId + '\n';
    textContent += '访客名称: ' + (selectedSession?.username || '未知用户') + '\n';
    textContent += '创建时间: ' + (selectedSession?.created_at || '') + '\n';
    textContent += '会话状态: ' + (selectedSession?.status === 'active' ? '进行中' : selectedSession?.status || '') + '\n';
    textContent += '消息数量: ' + messages.length + ' 条\n\n';
    textContent += separator + '\n';
    textContent += '          消息内容\n';
    textContent += separator + '\n\n';

    messages.forEach((msg) => {
      const sender = msg.sender === 'user' ? '【用户】' : '【机器人】';
      const time = formatDateTime(msg.timestamp);
      textContent += time + ' ' + sender + '\n';
      textContent += msg.message + '\n\n';
    });

    textContent += '\n' + separator + '\n';
    textContent += '          导出结束\n';
    textContent += separator + '\n';
    textContent += '导出时间: ' + new Date().toLocaleString('zh-CN') + '\n';

    const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `对话记录_${selectedSession?.username || '未知'}_${new Date().toISOString().slice(0, 10)}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    message.success('导出成功');
  };

  const columns: ColumnsType<TableSession> = [
    {
      title: '访客名称',
      dataIndex: 'username',
      key: 'username',
      width: 120,
      render: (name: string) => (
        <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <MessageOutlined />
          {name || '未知用户'}
        </span>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 80,
      render: (status: string) => {
        const colorMap: Record<string, string> = {
          active: 'green',
          '进行中': 'green',
          completed: 'default',
          '已结束': 'default',
          waiting: 'orange',
          '等待中': 'orange',
        };
        const labelMap: Record<string, string> = {
          active: '进行中',
          completed: '已结束',
          waiting: '等待中',
        };
        const displayStatus = labelMap[status] || status;
        return <Tag color={colorMap[status] || 'default'}>{displayStatus}</Tag>;
      },
    },
    {
      title: '消息数',
      dataIndex: 'message_count',
      key: 'message_count',
      width: 70,
      render: (count?: number) => count ?? '-',
    },
    {
      title: '创建时间',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 160,
      render: (time: string) => formatDateTime(time),
    },
  ];

  const selectedSession = sessions.find((s) => s.id === selectedSessionId);

  const renderMessageBubble = (message: Message) => {
    const isUser = message.sender === 'user';
    return (
      <div
        key={message.id}
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: isUser ? 'flex-end' : 'flex-start',
          marginBottom: '12px',
          padding: '0 16px',
        }}
      >
        <div
          style={{
            maxWidth: '75%',
            padding: '10px 14px',
            borderRadius: isUser ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
            backgroundColor: isUser ? '#4a5568' : '#e2e8f0',
            color: isUser ? '#fff' : '#1a202c',
            wordBreak: 'break-word',
            lineHeight: '1.4',
            fontSize: '14px',
            whiteSpace: 'pre-wrap',
          }}
        >
          {message.message}
        </div>
        <span
          style={{
            fontSize: '11px',
            color: '#9ca3af',
            marginTop: '4px',
          }}
        >
          {formatTime(message.timestamp)}
        </span>
      </div>
    );
  };

  return (
    <div
      className="conversations-page"
      style={{
        display: 'flex',
        gap: '16px',
        height: '100%',
        minHeight: '500px',
        backgroundColor: '#f0f2f5',
        padding: '16px',
        borderRadius: '8px',
      }}
    >
      <Card
        title="会话列表"
        style={{
          width: '420px',
          flexShrink: 0,
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: '#fff',
        }}
        styles={{
          body: {
            flex: 1,
            overflow: 'auto',
            padding: '12px',
          },
        }}
        extra={
          <ReloadOutlined
            onClick={fetchSessions}
            style={{ cursor: 'pointer', color: '#1890ff' }}
            title="刷新列表"
          />
        }
      >
        {error && (
          <Alert
            message="加载失败"
            description={error}
            type="error"
            showIcon
            style={{ marginBottom: '12px' }}
          />
        )}
        <Spin spinning={loading}>
          {sessions.length === 0 && !loading ? (
            <Empty description="暂无会话记录" />
          ) : (
            <Table
              columns={columns}
              dataSource={sessions}
              pagination={{ pageSize: 10, size: 'small' }}
              onRow={(record) => ({
                onClick: () => handleRowClick(record),
                style: { cursor: 'pointer' },
              })}
              rowKey="id"
              rowClassName={(record) =>
                record.id === selectedSessionId ? 'ant-table-row-selected' : ''
              }
              size="small"
            />
          )}
        </Spin>
      </Card>

      <Card
        title={
          selectedSession ? (
            <span>
              对话详情 - {selectedSession.username || '未知用户'}
              <Tag
                color={
                  selectedSession.status === 'active' || selectedSession.status === '进行中'
                    ? 'green'
                    : 'default'
                }
                style={{ marginLeft: '8px' }}
              >
                {selectedSession.status === 'active'
                  ? '进行中'
                  : selectedSession.status === 'completed'
                  ? '已结束'
                  : selectedSession.status}
              </Tag>
            </span>
          ) : (
            '对话详情'
          )
        }
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          minWidth: '400px',
          backgroundColor: '#fff',
        }}
        styles={{
          body: {
            flex: 1,
            overflow: 'auto',
            padding: '12px 0',
          },
        }}
        extra={
          selectedSessionId && messages.length > 0 ? (
            <Space>
              <Button
                type="text"
                icon={<DownloadOutlined />}
                onClick={handleExportText}
                style={{ color: '#1890ff' }}
              >
                导出文本
              </Button>
              <Button
                type="text"
                icon={<DownloadOutlined />}
                onClick={handleExport}
                style={{ color: '#1890ff' }}
              >
                导出JSON
              </Button>
            </Space>
          ) : null
        }
      >
        {!selectedSessionId ? (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              color: '#999',
            }}
          >
            <MessageOutlined style={{ fontSize: '48px', marginBottom: '16px', color: '#d9d9d9' }} />
            <Text type="secondary">请从左侧选择一个会话查看详情</Text>
          </div>
        ) : (
          <Spin spinning={messagesLoading}>
            {messagesError && (
              <Alert
                message="加载消息失败"
                description={messagesError}
                type="error"
                showIcon
                style={{ margin: '12px' }}
              />
            )}
            {messages.length === 0 && !messagesLoading ? (
              <Empty description="暂无消息记录" style={{ marginTop: '60px' }} />
            ) : (
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  minHeight: '100%',
                  paddingTop: '8px',
                  backgroundColor: '#f9f9f9',
                  borderRadius: '4px',
                }}
              >
                {messages.map(renderMessageBubble)}
                <div ref={messagesEndRef} />
              </div>
            )}
          </Spin>
        )}
      </Card>
    </div>
  );
};

export default ConversationsPage;
