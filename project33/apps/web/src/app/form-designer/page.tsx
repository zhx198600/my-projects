'use client';

import { useState, useEffect } from 'react';
import {
  Layout,
  Card,
  Button,
  Input,
  Space,
  Typography,
  Modal,
  message,
  Tabs,
  List,
  Tooltip,
} from 'antd';
import './styles.css';
import {
  SaveOutlined,
  EyeOutlined,
  PlusOutlined,
  DeleteOutlined,
  SettingOutlined,
  AlignLeftOutlined,
  NumberOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  CheckSquareOutlined,
  UnorderedListOutlined,
  FileTextOutlined,
  PaperClipOutlined,
  UserOutlined,
  TeamOutlined,
  DragOutlined,
} from '@ant-design/icons';
import { FormField, FormFieldType, FormConfig } from '@project33/shared';
import { formApi } from '@/lib/api';
import FieldConfigPanel from '@/components/form-designer/FieldConfigPanel';
import FormPreview from '@/components/form-designer/FormPreview';
import FormFieldRenderer from '@/components/form-designer/FormFieldRenderer';

const { Header, Sider, Content } = Layout;
const { Title } = Typography;

const fieldComponents = [
  { type: FormFieldType.TEXT, label: '文本输入', icon: <AlignLeftOutlined /> },
  { type: FormFieldType.NUMBER, label: '数字输入', icon: <NumberOutlined /> },
  { type: FormFieldType.DATE, label: '日期选择', icon: <CalendarOutlined /> },
  { type: FormFieldType.RADIO, label: '单选框组', icon: <CheckCircleOutlined /> },
  { type: FormFieldType.CHECKBOX, label: '多选框组', icon: <CheckSquareOutlined /> },
  { type: FormFieldType.SELECT, label: '下拉选择', icon: <UnorderedListOutlined /> },
];

const advancedFieldComponents = [
  { type: FormFieldType.RICH_TEXT, label: '富文本', icon: <FileTextOutlined /> },
  { type: FormFieldType.ATTACHMENT, label: '附件上传', icon: <PaperClipOutlined /> },
  { type: FormFieldType.USER_SELECT, label: '人员选择', icon: <UserOutlined /> },
  { type: FormFieldType.DEPARTMENT_SELECT, label: '部门选择', icon: <TeamOutlined /> },
];

export default function FormDesignerPage() {
  const [formName, setFormName] = useState('新建表单');
  const [formDescription, setFormDescription] = useState('');
  const [formConfig, setFormConfig] = useState<FormConfig>({ fields: [] });
  const [selectedField, setSelectedField] = useState<FormField | null>(null);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [currentFormId, setCurrentFormId] = useState<string | null>(null);
  const [draggedType, setDraggedType] = useState<FormFieldType | null>(null);

  const generateFieldId = () => `field_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  const handleDragStart = (type: FormFieldType) => {
    setDraggedType(type);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (!draggedType) return;

    const newField: FormField = {
      id: generateFieldId(),
      type: draggedType,
      label: getDefaultLabel(draggedType),
      name: `field_${Date.now()}`,
      required: false,
      options:
        draggedType === FormFieldType.RADIO ||
        draggedType === FormFieldType.CHECKBOX ||
        draggedType === FormFieldType.SELECT
          ? [
              { label: '选项1', value: 'option1' },
              { label: '选项2', value: 'option2' },
            ]
          : undefined,
      sort: formConfig.fields.length,
    };

    setFormConfig({
      ...formConfig,
      fields: [...formConfig.fields, newField],
    });
    setSelectedField(newField);
    setDraggedType(null);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const getDefaultLabel = (type: FormFieldType): string => {
    const labels: Record<FormFieldType, string> = {
      [FormFieldType.TEXT]: '文本输入',
      [FormFieldType.NUMBER]: '数字输入',
      [FormFieldType.DATE]: '日期选择',
      [FormFieldType.RADIO]: '单选框组',
      [FormFieldType.CHECKBOX]: '多选框组',
      [FormFieldType.SELECT]: '下拉选择',
      [FormFieldType.RICH_TEXT]: '富文本编辑器',
      [FormFieldType.ATTACHMENT]: '附件上传',
      [FormFieldType.USER_SELECT]: '人员选择',
      [FormFieldType.DEPARTMENT_SELECT]: '部门选择',
    };
    return labels[type];
  };

  const handleSelectField = (field: FormField) => {
    setSelectedField(field);
  };

  const handleDeleteField = (fieldId: string) => {
    const newFields = formConfig.fields.filter((f) => f.id !== fieldId);
    setFormConfig({ ...formConfig, fields: newFields });
    if (selectedField?.id === fieldId) {
      setSelectedField(null);
    }
  };

  const handleUpdateField = (updatedField: FormField) => {
    const newFields = formConfig.fields.map((f) =>
      f.id === updatedField.id ? updatedField : f
    );
    setFormConfig({ ...formConfig, fields: newFields });
    setSelectedField(updatedField);
  };

  const handleMoveField = (fieldId: string, direction: 'up' | 'down') => {
    const index = formConfig.fields.findIndex((f) => f.id === fieldId);
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === formConfig.fields.length - 1)
    ) {
      return;
    }
    const newFields = [...formConfig.fields];
    const swapIndex = direction === 'up' ? index - 1 : index + 1;
    [newFields[index], newFields[swapIndex]] = [newFields[swapIndex], newFields[index]];
    newFields.forEach((f, i) => (f.sort = i));
    setFormConfig({ ...formConfig, fields: newFields });
  };

  const handleSave = async () => {
    try {
      if (currentFormId) {
        await formApi.update(currentFormId, {
          name: formName,
          description: formDescription,
          config: formConfig,
        });
        message.success('表单保存成功！');
      } else {
        const res = await formApi.create({
          name: formName,
          description: formDescription,
          config: formConfig,
        });
        setCurrentFormId(res.data.data!.id);
        message.success('表单创建成功！');
      }
    } catch (error) {
      message.error('保存失败，请重试');
    }
  };

  const handleFieldDragStart = (e: React.DragEvent, fieldId: string) => {
    e.dataTransfer.setData('fieldId', fieldId);
  };

  const handleFieldDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    const draggedFieldId = e.dataTransfer.getData('fieldId');
    if (!draggedFieldId) return;

    const draggedIndex = formConfig.fields.findIndex((f) => f.id === draggedFieldId);
    if (draggedIndex === -1 || draggedIndex === targetIndex) return;

    const newFields = [...formConfig.fields];
    const [draggedField] = newFields.splice(draggedIndex, 1);
    newFields.splice(targetIndex, 0, draggedField);
    newFields.forEach((f, i) => (f.sort = i));
    setFormConfig({ ...formConfig, fields: newFields });
  };

  return (
    <Layout className="form-designer-layout">
      <Header className="form-designer-header">
        <Space>
          <Title level={4} style={{ margin: 0 }}>表单设计器</Title>
          <Input
            value={formName}
            onChange={(e) => setFormName(e.target.value)}
            placeholder="表单名称"
            style={{ width: 200 }}
          />
          <Input
            value={formDescription}
            onChange={(e) => setFormDescription(e.target.value)}
            placeholder="表单描述"
            style={{ width: 300 }}
          />
        </Space>
        <Space>
          <Button icon={<EyeOutlined />} onClick={() => setPreviewVisible(true)}>
            预览
          </Button>
          <Button type="primary" icon={<SaveOutlined />} onClick={handleSave}>
            保存
          </Button>
        </Space>
      </Header>

      <Layout>
        <Sider width={280} className="form-designer-sider-left">
          <Tabs
            items={[
              {
                key: 'basic',
                label: '基础字段',
                children: (
                  <List
                    dataSource={fieldComponents}
                    renderItem={(item) => (
                      <List.Item
                        draggable
                        onDragStart={() => handleDragStart(item.type)}
                        style={{ cursor: 'move', padding: '8px 12px' }}
                        className="form-designer-field-item"
                      >
                        <Space>
                          {item.icon}
                          <span>{item.label}</span>
                        </Space>
                      </List.Item>
                    )}
                  />
                ),
              },
              {
                key: 'advanced',
                label: '高级字段',
                children: (
                  <List
                    dataSource={advancedFieldComponents}
                    renderItem={(item) => (
                      <List.Item
                        draggable
                        onDragStart={() => handleDragStart(item.type)}
                        style={{ cursor: 'move', padding: '8px 12px' }}
                        className="form-designer-field-item"
                      >
                        <Space>
                          {item.icon}
                          <span>{item.label}</span>
                        </Space>
                      </List.Item>
                    )}
                  />
                ),
              },
            ]}
          />
        </Sider>

        <Content
          className="form-designer-content"
          onDrop={handleDrop}
          onDragOver={handleDragOver}
        >
          <Card
            title="表单设计区域"
            extra={
              <Typography.Text type="secondary" className="form-designer-content-sm">
                从左侧拖拽字段到此处
              </Typography.Text>
            }
            className="form-designer-canvas-minh"
          >
            {formConfig.fields.length === 0 ? (
              <div className="form-designer-empty">
                <DragOutlined style={{ fontSize: 48, marginBottom: 16 }} />
                <p>拖拽左侧字段到此处开始设计表单</p>
              </div>
            ) : (
              <div className="form-designer-fields">
                {formConfig.fields.map((field, index) => (
                  <div
                    key={field.id}
                    draggable
                    onDragStart={(e) => handleFieldDragStart(e, field.id)}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => handleFieldDrop(e, index)}
                    onClick={() => handleSelectField(field)}
                    className={`form-designer-field-wrapper ${
                      selectedField?.id === field.id ? 'selected' : ''
                    }`}
                  >
                    <div className="form-designer-field-header">
                      <div className="form-designer-field-label">
                        <DragOutlined className="form-designer-field-drag" />
                        <FormFieldRenderer field={field} preview />
                      </div>
                      <Space>
                        <Tooltip title="上移">
                          <Button
                            size="small"
                            type="text"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleMoveField(field.id, 'up');
                            }}
                          >
                            ↑
                          </Button>
                        </Tooltip>
                        <Tooltip title="下移">
                          <Button
                            size="small"
                            type="text"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleMoveField(field.id, 'down');
                            }}
                          >
                            ↓
                          </Button>
                        </Tooltip>
                        <Tooltip title="配置">
                          <Button
                            size="small"
                            type="text"
                            icon={<SettingOutlined />}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSelectField(field);
                            }}
                          />
                        </Tooltip>
                        <Tooltip title="删除">
                          <Button
                            size="small"
                            type="text"
                            danger
                            icon={<DeleteOutlined />}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteField(field.id);
                            }}
                          />
                        </Tooltip>
                      </Space>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </Content>

        <Sider width={320} className="form-designer-sider-right">
          {selectedField ? (
            <FieldConfigPanel
              field={selectedField}
              onUpdate={handleUpdateField}
              onDelete={() => handleDeleteField(selectedField.id)}
            />
          ) : (
            <div className="form-designer-config-empty">
              <SettingOutlined style={{ fontSize: 32, marginBottom: 12 }} />
              <p>选择字段进行配置</p>
            </div>
          )}
        </Sider>
      </Layout>

      <Modal
        title="表单预览"
        open={previewVisible}
        onCancel={() => setPreviewVisible(false)}
        footer={null}
        width={800}
      >
        <FormPreview formConfig={formConfig} formName={formName} />
      </Modal>
    </Layout>
  );
}
