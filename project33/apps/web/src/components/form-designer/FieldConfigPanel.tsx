import { useState, useEffect } from 'react';
import {
  Form,
  Input,
  Switch,
  Button,
  Space,
  Card,
  InputNumber,
  Divider,
  Typography,
  Row,
  Col,
  Select,
} from 'antd';
import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { FormField, FormFieldType, FormFieldOption } from '@project33/shared';

interface FieldConfigPanelProps {
  field: FormField;
  onUpdate: (field: FormField) => void;
  onDelete: () => void;
}

const { Text } = Typography;

export default function FieldConfigPanel({
  field,
  onUpdate,
  onDelete,
}: FieldConfigPanelProps) {
  const [form] = Form.useForm();
  const [options, setOptions] = useState<FormFieldOption[]>(field.options || []);

  useEffect(() => {
    form.setFieldsValue(field);
    setOptions(field.options || []);
  }, [field, form]);

  const handleValuesChange = (_: any, allValues: any) => {
    const updatedField = {
      ...field,
      ...allValues,
      options,
    };
    onUpdate(updatedField);
  };

  const handleAddOption = () => {
    const newOption: FormFieldOption = {
      label: `选项${options.length + 1}`,
      value: `option_${Date.now()}`,
    };
    const newOptions = [...options, newOption];
    setOptions(newOptions);
    onUpdate({ ...field, options: newOptions });
  };

  const handleUpdateOption = (index: number, key: 'label' | 'value', value: string) => {
    const newOptions = [...options];
    newOptions[index][key] = value;
    setOptions(newOptions);
    onUpdate({ ...field, options: newOptions });
  };

  const handleRemoveOption = (index: number) => {
    const newOptions = options.filter((_, i) => i !== index);
    setOptions(newOptions);
    onUpdate({ ...field, options: newOptions });
  };

  const isOptionField =
    field.type === FormFieldType.RADIO ||
    field.type === FormFieldType.CHECKBOX ||
    field.type === FormFieldType.SELECT;

  const hasValidation =
    field.type === FormFieldType.TEXT || field.type === FormFieldType.NUMBER;

  const getFieldTypeName = (type: FormFieldType): string => {
    const names: Record<FormFieldType, string> = {
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
    return names[type];
  };

  return (
    <div className="p-4">
      <Card size="small" title="基础配置" className="mb-4">
        <Form
          form={form}
          layout="vertical"
          initialValues={field}
          onValuesChange={handleValuesChange}
        >
          <div className="mb-4 p-2 bg-gray-50 rounded">
            <Text type="secondary">字段类型：</Text>
            <Text strong className="ml-2">
              {getFieldTypeName(field.type)}
            </Text>
          </div>

          <Form.Item label="字段标签" name="label" rules={[{ required: true }]}>
            <Input placeholder="请输入字段标签" />
          </Form.Item>

          <Form.Item label="字段名称" name="name" rules={[{ required: true }]}>
            <Input placeholder="请输入字段名称" />
          </Form.Item>

          <Form.Item label="占位提示" name="placeholder">
            <Input placeholder="请输入占位提示" />
          </Form.Item>

          <Form.Item label="默认值" name="defaultValue">
            <Input placeholder="请输入默认值" />
          </Form.Item>

          <Form.Item name="required" valuePropName="checked">
            <Switch checkedChildren="必填" unCheckedChildren="选填" />
          </Form.Item>
        </Form>
      </Card>

      {isOptionField && (
        <Card size="small" title="选项配置" className="mb-4">
          <div className="space-y-2 mb-4">
            {options.map((option, index) => (
              <Row key={index} gutter={8} align="middle">
                <Col span={10}>
                  <Input
                    size="small"
                    value={option.label}
                    placeholder="标签"
                    onChange={(e) => handleUpdateOption(index, 'label', e.target.value)}
                  />
                </Col>
                <Col span={10}>
                  <Input
                    size="small"
                    value={option.value}
                    placeholder="值"
                    onChange={(e) => handleUpdateOption(index, 'value', e.target.value)}
                  />
                </Col>
                <Col span={4}>
                  <Button
                    size="small"
                    danger
                    type="text"
                    icon={<DeleteOutlined />}
                    onClick={() => handleRemoveOption(index)}
                  />
                </Col>
              </Row>
            ))}
          </div>
          <Button
            type="dashed"
            block
            icon={<PlusOutlined />}
            onClick={handleAddOption}
          >
            添加选项
          </Button>
        </Card>
      )}

      {hasValidation && (
        <Card size="small" title="验证规则" className="mb-4">
          <Form form={form} layout="vertical" onValuesChange={handleValuesChange}>
            {field.type === FormFieldType.NUMBER && (
              <>
                <Form.Item label="最小值" name={['validation', 'min']}>
                  <InputNumber className="w-full" placeholder="最小值" />
                </Form.Item>
                <Form.Item label="最大值" name={['validation', 'max']}>
                  <InputNumber className="w-full" placeholder="最大值" />
                </Form.Item>
              </>
            )}
            {field.type === FormFieldType.TEXT && (
              <>
                <Form.Item label="最小长度" name={['validation', 'min']}>
                  <InputNumber className="w-full" placeholder="最小长度" />
                </Form.Item>
                <Form.Item label="最大长度" name={['validation', 'max']}>
                  <InputNumber className="w-full" placeholder="最大长度" />
                </Form.Item>
                <Form.Item label="正则表达式" name={['validation', 'pattern']}>
                  <Input placeholder="正则表达式" />
                </Form.Item>
              </>
            )}
          </Form>
        </Card>
      )}

      <Divider />

      <Button danger block icon={<DeleteOutlined />} onClick={onDelete}>
        删除此字段
      </Button>
    </div>
  );
}
