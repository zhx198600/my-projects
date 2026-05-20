import {
  Input,
  InputNumber,
  DatePicker,
  Radio,
  Checkbox,
  Select,
  Upload,
  Button,
  Space,
  Typography,
} from 'antd';
import { UploadOutlined, EyeInvisibleOutlined, LockOutlined } from '@ant-design/icons';
import dynamic from 'next/dynamic';
import { FormField, FormFieldType, FieldPermissionType } from '@project33/shared';
import UserSelector from '../UserSelector';
import OrganizationTree from '../OrganizationTree';

const { TextArea } = Input;
const { Group: RadioGroup } = Radio;
const { Group: CheckboxGroup } = Checkbox;

const RichTextEditor = dynamic(() => import('./RichTextEditor'), { ssr: false });

interface FormFieldRendererProps {
  field: FormField;
  value?: any;
  onChange?: (value: any) => void;
  preview?: boolean;
  permission?: FieldPermissionType;
}

export default function FormFieldRenderer({
  field,
  value,
  onChange,
  preview = false,
  permission = FieldPermissionType.EDITABLE,
}: FormFieldRendererProps) {
  if (permission === FieldPermissionType.HIDDEN) {
    return null;
  }

  const isReadOnly = preview || permission === FieldPermissionType.READ_ONLY;

  const renderField = () => {
    switch (field.type) {
      case FormFieldType.TEXT:
        return (
          <Input
            placeholder={field.placeholder || '请输入'}
            value={value}
            onChange={(e) => onChange?.(e.target.value)}
            disabled={isReadOnly}
          />
        );

      case FormFieldType.NUMBER:
        return (
          <InputNumber
            placeholder={field.placeholder || '请输入数字'}
            value={value}
            onChange={(val) => onChange?.(val)}
            disabled={isReadOnly}
            className="w-full"
            min={field.validation?.min}
            max={field.validation?.max}
          />
        );

      case FormFieldType.DATE:
        return (
          <DatePicker
            placeholder={field.placeholder || '请选择日期'}
            value={value}
            onChange={(date) => onChange?.(date)}
            disabled={isReadOnly}
            className="w-full"
          />
        );

      case FormFieldType.RADIO:
        return (
          <RadioGroup value={value} onChange={(e) => onChange?.(e.target.value)}>
            <Space direction="vertical">
              {field.options?.map((opt) => (
                <Radio key={opt.value} value={opt.value} disabled={isReadOnly}>
                  {opt.label}
                </Radio>
              ))}
            </Space>
          </RadioGroup>
        );

      case FormFieldType.CHECKBOX:
        return (
          <CheckboxGroup value={value} onChange={(vals) => onChange?.(vals)}>
            <Space direction="vertical">
              {field.options?.map((opt) => (
                <Checkbox key={opt.value} value={opt.value} disabled={isReadOnly}>
                  {opt.label}
                </Checkbox>
              ))}
            </Space>
          </CheckboxGroup>
        );

      case FormFieldType.SELECT:
        return (
          <Select
            placeholder={field.placeholder || '请选择'}
            value={value}
            onChange={(val) => onChange?.(val)}
            disabled={isReadOnly}
            className="w-full"
            options={field.options}
          />
        );

      case FormFieldType.RICH_TEXT:
        return isReadOnly ? (
          <div className="border rounded p-2 min-h-24 text-gray-400">富文本内容</div>
        ) : (
          <RichTextEditor value={value} onChange={onChange} />
        );

      case FormFieldType.ATTACHMENT:
        return (
          <Upload disabled={isReadOnly}>
            <Button icon={<UploadOutlined />}>点击上传</Button>
          </Upload>
        );

      case FormFieldType.USER_SELECT:
        return isReadOnly ? (
          <Input placeholder="选择人员" disabled />
        ) : (
          <UserSelector value={value} onChange={onChange} multiple />
        );

      case FormFieldType.DEPARTMENT_SELECT:
        return isReadOnly ? (
          <Input placeholder="选择部门" disabled />
        ) : (
          <OrganizationTree
            value={value}
            onChange={onChange}
            placeholder="选择部门"
          />
        );

      default:
        return <Input disabled placeholder="未知字段类型" />;
    }
  };

  return (
    <div className="mb-4">
      <div className="flex items-center gap-2 mb-1">
        <Typography.Text strong>
          {field.label}
          {field.required && <span className="text-red-500 ml-1">*</span>}
        </Typography.Text>
        {permission === FieldPermissionType.READ_ONLY && (
          <LockOutlined className="text-yellow-500 text-xs" title="只读字段" />
        )}
      </div>
      <div className="mt-1">{renderField()}</div>
    </div>
  );
}
