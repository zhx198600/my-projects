import type { Message } from '../../types/chat';

interface MessageBubbleProps {
  message: Message;
}

function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.sender === 'user';

  return (
    <div
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
        }}
      >
        {message.content}
      </div>
      <span
        style={{
          fontSize: '11px',
          color: '#9ca3af',
          marginTop: '4px',
        }}
      >
        {message.timestamp}
      </span>
    </div>
  );
}

export default MessageBubble;
