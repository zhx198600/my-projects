import { useState } from 'react';
import MarkdownRenderer from './MarkdownRenderer';

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
  disabled?: boolean;
  showPreview?: boolean;
}

const MarkdownEditor = ({
  value,
  onChange,
  placeholder = '支持 Markdown 语法...',
  rows = 6,
  disabled = false,
  showPreview = true,
}: MarkdownEditorProps) => {
  const [previewMode, setPreviewMode] = useState(false);

  const insertMarkdown = (prefix: string, suffix: string = '') => {
    const textarea = document.querySelector(
      '.markdown-editor-textarea',
    ) as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);
    const newText =
      value.substring(0, start) +
      prefix +
      selectedText +
      suffix +
      value.substring(end);

    onChange(newText);

    setTimeout(() => {
      textarea.focus();
      const cursorPos = start + prefix.length + selectedText.length;
      textarea.setSelectionRange(cursorPos, cursorPos + suffix.length);
    }, 0);
  };

  const toolbarButtons = [
    { label: 'B', title: '加粗', action: () => insertMarkdown('**', '**') },
    { label: 'I', title: '斜体', action: () => insertMarkdown('*', '*') },
    { label: 'S', title: '删除线', action: () => insertMarkdown('~~', '~~') },
    { label: 'H1', title: '一级标题', action: () => insertMarkdown('# ') },
    { label: 'H2', title: '二级标题', action: () => insertMarkdown('## ') },
    { label: 'H3', title: '三级标题', action: () => insertMarkdown('### ') },
    { label: '·', title: '无序列表', action: () => insertMarkdown('- ') },
    { label: '1.', title: '有序列表', action: () => insertMarkdown('1. ') },
    { label: '>', title: '引用', action: () => insertMarkdown('> ') },
    { label: '</>', title: '代码', action: () => insertMarkdown('`', '`') },
    { label: '🔗', title: '链接', action: () => insertMarkdown('[链接文本](', ')') },
  ];

  return (
    <div className="markdown-editor">
      <div className="markdown-editor-toolbar">
        {toolbarButtons.map((btn, index) => (
          <button
            key={index}
            type="button"
            className="toolbar-btn"
            onClick={btn.action}
            title={btn.title}
            disabled={disabled}
          >
            {btn.label}
          </button>
        ))}
        {showPreview && (
          <>
            <div className="toolbar-divider" />
            <button
              type="button"
              className={`toolbar-btn ${previewMode ? 'active' : ''}`}
              onClick={() => setPreviewMode(!previewMode)}
              title="切换预览"
            >
              {previewMode ? '编辑' : '预览'}
            </button>
          </>
        )}
      </div>

      {previewMode ? (
        <div className="markdown-preview">
          {value ? (
            <MarkdownRenderer content={value} />
          ) : (
            <span className="preview-placeholder">预览区域...</span>
          )}
        </div>
      ) : (
        <textarea
          className="markdown-editor-textarea"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={rows}
          disabled={disabled}
        />
      )}
    </div>
  );
};

export default MarkdownEditor;
