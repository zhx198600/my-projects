import { useRef, useEffect } from 'react';
import { Space, Button, Card } from 'antd';
import {
  BoldOutlined,
  ItalicOutlined,
  UnderlineOutlined,
  AlignLeftOutlined,
  AlignCenterOutlined,
  AlignRightOutlined,
  OrderedListOutlined,
  UnorderedListOutlined,
} from '@ant-design/icons';

interface RichTextEditorProps {
  value?: string;
  onChange?: (value: string) => void;
}

export default function RichTextEditor({ value = '', onChange }: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value;
    }
  }, [value]);

  const handleInput = () => {
    if (editorRef.current) {
      onChange?.(editorRef.current.innerHTML);
    }
  };

  const execCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
    handleInput();
  };

  return (
    <Card size="small" className="border rounded">
      <Space className="mb-3 pb-3 border-b" wrap>
        <Button size="small" icon={<BoldOutlined />} onClick={() => execCommand('bold')} />
        <Button size="small" icon={<ItalicOutlined />} onClick={() => execCommand('italic')} />
        <Button size="small" icon={<UnderlineOutlined />} onClick={() => execCommand('underline')} />
        <Button size="small" icon={<AlignLeftOutlined />} onClick={() => execCommand('justifyLeft')} />
        <Button size="small" icon={<AlignCenterOutlined />} onClick={() => execCommand('justifyCenter')} />
        <Button size="small" icon={<AlignRightOutlined />} onClick={() => execCommand('justifyRight')} />
        <Button size="small" icon={<OrderedListOutlined />} onClick={() => execCommand('insertOrderedList')} />
        <Button size="small" icon={<UnorderedListOutlined />} onClick={() => execCommand('insertUnorderedList')} />
      </Space>
      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        className="min-h-32 p-2 outline-none focus-ring-0"
        style={{ minHeight: '120px' }}
        suppressContentEditableWarning
      />
    </Card>
  );
}
