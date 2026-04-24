import { useState, useEffect, useRef, type KeyboardEvent } from 'react';

interface ChatInputProps {
  onSend: (content: string) => void;
  isSending: boolean;
}

function ChatInput({ onSend, isSending }: ChatInputProps) {
  const [inputValue, setInputValue] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + 'px';
    }
  }, [inputValue]);

  const handleSend = () => {
    const trimmedValue = inputValue.trim();
    if (trimmedValue && !isSending) {
      onSend(trimmedValue);
      setInputValue('');
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        gap: '12px',
        padding: '16px',
        borderTop: '1px solid #e5e7eb',
        backgroundColor: '#fff',
      }}
    >
      <textarea
        ref={textareaRef}
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="输入消息..."
        disabled={isSending}
        rows={1}
        style={{
          flex: 1,
          padding: '10px 14px',
          borderRadius: '20px',
          border: '1px solid #d1d5db',
          outline: 'none',
          fontSize: '14px',
          resize: 'none',
          maxHeight: '120px',
          fontFamily: 'inherit',
          backgroundColor: isSending ? '#f3f4f6' : '#fff',
        }}
      />
      <button
        onClick={handleSend}
        disabled={isSending || !inputValue.trim()}
        style={{
          padding: '10px 20px',
          borderRadius: '20px',
          border: 'none',
          backgroundColor: isSending || !inputValue.trim() ? '#9ca3af' : '#4a5568',
          color: '#fff',
          fontSize: '14px',
          fontWeight: 500,
          cursor: isSending || !inputValue.trim() ? 'not-allowed' : 'pointer',
          minWidth: '80px',
          transition: 'background-color 0.2s',
        }}
      >
        {isSending ? '发送中...' : '发送'}
      </button>
    </div>
  );
}

export default ChatInput;
