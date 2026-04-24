import { useState, useEffect, useCallback } from 'react';
import { Card, Button, Table, Space, Modal, Form, Input, Popconfirm, message, Spin, Tag } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { knowledgeApi } from '../../services/api';
import type { Knowledge, CreateKnowledgeRequest } from '../../services/api';

const KnowledgePage = () => {
  const [data, setData] = useState<Knowledge[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [debouncedSearchText, setDebouncedSearchText] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState<Knowledge | null>(null);
  const [form] = Form.useForm();

  const fetchData = useCallback(async (search?: string) => {
    setLoading(true);
    try {
      const result = await knowledgeApi.getList(search);
      setData(result);
    } catch (error) {
      message.error('获取数据失败，请稍后重试');
      console.error('Failed to fetch knowledge list:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchText(searchText);
    }, 300);

    return () => {
      clearTimeout(timer);
    };
  }, [searchText]);

  useEffect(() => {
    fetchData(debouncedSearchText || undefined);
  }, [debouncedSearchText, fetchData]);

  const handleAdd = () => {
    setEditingItem(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (record: Knowledge) => {
    setEditingItem(record);
    form.setFieldsValue({
      question: record.question,
      keywords: record.keywords,
      answer: record.answer,
    });
    setModalVisible(true);
  };

  const handleDelete = async (id: number) => {
    try {
      await knowledgeApi.delete(id);
      message.success('删除成功');
      fetchData(debouncedSearchText || undefined);
    } catch (error) {
      message.error('删除失败，请稍后重试');
      console.error('Failed to delete knowledge:', error);
    }
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      const requestData: CreateKnowledgeRequest = {
        question: values.question,
        keywords: values.keywords || '',
        answer: values.answer,
      };

      if (editingItem) {
        await knowledgeApi.update(editingItem.id, requestData);
        message.success('更新成功');
      } else {
        await knowledgeApi.create(requestData);
        message.success('创建成功');
      }

      setModalVisible(false);
      fetchData(debouncedSearchText || undefined);
    } catch (error) {
      console.error('Form validation failed:', error);
    }
  };

  const handleModalCancel = () => {
    setModalVisible(false);
    form.resetFields();
  };

  const truncateText = (text: string, maxLength: number = 50) => {
    if (text.length <= maxLength) {
      return text;
    }
    return text.substring(0, maxLength) + '...';
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const columns: ColumnsType<Knowledge> = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
    },
    {
      title: '问题',
      dataIndex: 'question',
      key: 'question',
      width: 200,
      ellipsis: true,
    },
    {
      title: '关键词',
      dataIndex: 'keywords',
      key: 'keywords',
      width: 180,
      render: (keywords: string) => (
        <Space wrap size={4}>
          {keywords
            .split(',')
            .map((keyword, index) => (
              <Tag key={index} color="blue" style={{ margin: 2 }}>
                {keyword.trim()}
              </Tag>
            ))}
        </Space>
      ),
    },
    {
      title: '回复预览',
      dataIndex: 'answer',
      key: 'answer',
      render: (answer: string) => truncateText(answer, 80),
    },
    {
      title: '更新时间',
      dataIndex: 'updated_at',
      key: 'updated_at',
      width: 180,
      render: (date: string) => formatDate(date),
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      render: (_, record) => (
        <Space size="middle">
          <Button
            type="link"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            编辑
          </Button>
          <Popconfirm
            title="确认删除"
            description="确定要删除这条知识库记录吗？此操作不可恢复。"
            onConfirm={() => handleDelete(record.id)}
            okText="确认"
            cancelText="取消"
            okButtonProps={{ danger: true }}
          >
            <Button type="link" size="small" danger icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Card
        title="知识库管理"
        extra={
          <Space>
            <Input
              placeholder="搜索问题、关键词或回复内容..."
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              style={{ width: 300 }}
              allowClear
            />
            <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
              添加知识
            </Button>
          </Space>
        }
      >
        <Spin spinning={loading}>
          <Table
            columns={columns}
            dataSource={data}
            rowKey="id"
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showTotal: (total) => `共 ${total} 条记录`,
            }}
          />
        </Spin>
      </Card>

      <Modal
        title={editingItem ? '编辑知识' : '添加知识'}
        open={modalVisible}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
        okText="确定"
        cancelText="取消"
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{
            question: '',
            keywords: '',
            answer: '',
          }}
        >
          <Form.Item
            name="question"
            label="问题"
            rules={[
              { required: true, message: '请输入问题' },
              { max: 500, message: '问题不能超过500个字符' },
            ]}
          >
            <Input placeholder="请输入问题，如：营业时间是什么时候？" />
          </Form.Item>

          <Form.Item
            name="keywords"
            label="关键词"
            extra="多个关键词用逗号分隔，如：营业时间,时间,几点"
            rules={[{ max: 200, message: '关键词不能超过200个字符' }]}
          >
            <Input placeholder="请输入关键词，多个用逗号分隔" />
          </Form.Item>

          <Form.Item
            name="answer"
            label="回复内容"
            rules={[
              { required: true, message: '请输入回复内容' },
              { max: 2000, message: '回复内容不能超过2000个字符' },
            ]}
          >
            <Input.TextArea
              placeholder="请输入回复内容"
              rows={6}
              showCount
              maxLength={2000}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default KnowledgePage;
