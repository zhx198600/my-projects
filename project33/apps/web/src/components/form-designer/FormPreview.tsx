import { Form as AntForm, Button, Card, Typography, Space, message, Tag } from 'antd';
import { FormConfig, FieldPermissionType } from '@project33/shared';
import FormFieldRenderer from './FormFieldRenderer';

const { Title } = Typography;

interface FormPreviewProps {
  formConfig: FormConfig;
  formName?: string;
  nodeId?: string;
  fieldPermissions?: { fieldName: string; permission: FieldPermissionType }[];
}

export default function FormPreview({ formConfig, formName, fieldPermissions = [] }: FormPreviewProps) {
  const [form] = AntForm.useForm();

  const handleFinish = (values: any) => {
    console.log('表单数据:', values);
    message.success('表单验证通过，数据已打印到控制台');
  };

  const getFieldPermission = (fieldName: string): FieldPermissionType => {
    const perm = fieldPermissions.find(p => p.fieldName === fieldName);
    return perm?.permission || FieldPermissionType.EDITABLE;
  };

  const permissionStats = {
    editable: fieldPermissions.filter(p => p.permission === FieldPermissionType.EDITABLE).length,
    readOnly: fieldPermissions.filter(p => p.permission === FieldPermissionType.READ_ONLY).length,
    hidden: fieldPermissions.filter(p => p.permission === FieldPermissionType.HIDDEN).length,
  };

  return (
    <div>
      <Card>
        <div className="flex items-center justify-between mb-6">
          <Title level={4} className="!mb-0">
            {formName || '表单预览'}
          </Title>
          {fieldPermissions.length > 0 && (
            <Space size="small">
              <Tag color="green">可编辑: {permissionStats.editable}</Tag>
              <Tag color="gold">只读: {permissionStats.readOnly}</Tag>
              <Tag color="red">隐藏: {permissionStats.hidden}</Tag>
            </Space>
          )}
        </div>

        <AntForm
          form={form}
          layout="vertical"
          onFinish={handleFinish}
          initialValues={formConfig.fields.reduce((acc, field) => {
            if (field.defaultValue !== undefined) {
              acc[field.name] = field.defaultValue;
            }
            return acc;
          }, {} as Record<string, any>)}
        >
          {formConfig.fields.map((field) => (
            <AntForm.Item
              key={field.id}
              name={field.name}
              label={field.label}
              required={field.required && getFieldPermission(field.name) === FieldPermissionType.EDITABLE}
              rules={
                field.required && getFieldPermission(field.name) === FieldPermissionType.EDITABLE
                  ? [{ required: true, message: `${field.label}不能为空` }]
                  : []
              }
            >
              <FormFieldRenderer 
                field={field} 
                permission={getFieldPermission(field.name)}
              />
            </AntForm.Item>
          ))}

          <AntForm.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                提交验证
              </Button>
              <Button onClick={() => form.resetFields()}>重置</Button>
            </Space>
          </AntForm.Item>
        </AntForm>
      </Card>
    </div>
  );
}
