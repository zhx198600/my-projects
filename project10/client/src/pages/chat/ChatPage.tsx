import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import MessageBubble from '../../components/chat/MessageBubble';
import ChatInput from '../../components/chat/ChatInput';
import type { Message } from '../../types/chat';
import { useSocket } from '../../hooks/useSocket';
import type { ChatMessage as SocketChatMessage, JoinedEvent } from '../../hooks/useSocket';

const generateSessionId = (): string => {
  return 'session_' + Date.now() + '_' + Math.random().toString(36).substring(2, 10);
};

const formatTime = (date: Date): string => {
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
};

function ChatPage() {
  const [username, setUsername] = useState<string>('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isSending, setIsSending] = useState<boolean>(false);
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [sessionId] = useState<string>(generateSessionId());

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const handleMessage = useCallback((msg: SocketChatMessage) => {
    const newMessage: Message = {
      id: msg.id,
      content: msg.message,
      sender: msg.sender,
      timestamp: formatTime(new Date(msg.timestamp)),
    };
    setMessages((prev) => [...prev, newMessage]);
  }, []);

  const handleJoined = useCallback((event: JoinedEvent) => {
    const welcomeMsg: Message = {
      id: Date.now(),
      content: event.welcomeMessage,
      sender: 'bot',
      timestamp: formatTime(new Date()),
    };
    setMessages((prev) => [...prev, welcomeMsg]);
  }, []);

  const handleTyping = useCallback((isTyping: boolean) => {
    setIsTyping(isTyping);
  }, []);

  const { isConnected, join, sendMessage } = useSocket(
    handleMessage,
    handleJoined,
    handleTyping
  );

  useEffect(() => {
    const storedUsername = localStorage.getItem('chatUsername');
    if (!storedUsername) {
      navigate('/chat');
      return;
    }
    setUsername(storedUsername);
  }, [navigate]);

  useEffect(() => {
    if (isConnected && username) {
      join(sessionId, username);
    }
  }, [isConnected, username, sessionId, join]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSendMessage = (content: string) => {
    if (!content.trim()) return;

    const optimisticMessage: Message = {
      id: Date.now(),
      content: content,
      sender: 'user',
      timestamp: formatTime(new Date()),
    };

    setMessages((prev) => [...prev, optimisticMessage]);
    setIsSending(true);

    sendMessage(sessionId, content);

    setTimeout(() => {
      setIsSending(false);
    }, 300);
  };

  return (
    <div
      style={{
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        backgroundColor: '#f7fafc',
      }}
    >
      <header
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '14px 20px',
          backgroundColor: '#4a5568',
          color: '#fff',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '22px' }}>💬</span>
          <h2
            style={{
              margin: 0,
              fontSize: '18px',
              fontWeight: 600,
            }}
          >
            在线客服
          </h2>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: isConnected ? '#48bb78' : '#e53e3e',
              display: 'inline-block',
            }}
          />
          <span style={{ fontSize: '12px', opacity: 0.8 }}>
            {username} • {isConnected ? '已连接' : '未连接'}
          </span>
        </div>
      </header>

      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '16px 0',
          backgroundColor: '#f7fafc',
        }}
      >
        {messages.map((message) => (
          <MessageBubble key={message.id} message={message} />
        ))}

        {isTyping && (
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              padding: '0 16px',
              marginBottom: '12px',
            }}
          >
            <div
              style={{
                padding: '12px 16px',
                backgroundColor: '#e2e8f0',
                borderRadius: '18px 18px 18px 4px',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  gap: '4px',
                }}
              >
                <span
                  style={{
                    width: '8px',
                    height: '8px',
                    backgroundColor: '#718096',
                    borderRadius: '50%',
                    animation: 'typing 1.4s infinite ease-in-out both',
                    animationDelay: '0s',
                  }}
                />
                <span
                  style={{
                    width: '8px',
                    height: '8px',
                    backgroundColor: '#718096',
                    borderRadius: '50%',
                    animation: 'typing 1.4s infinite ease-in-out both',
                    animationDelay: '0.16s',
                  }}
                />
                <span
                  style={{
                    width: '8px',
                    height: '8px',
                    backgroundColor: '#718096',
                    borderRadius: '50%',
                    animation: 'typing 1.4s infinite ease-in-out both',
                    animationDelay: '0.32s',
                  }}
                />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <style>{`
        @keyframes typing {
          0%, 80%, 100% {
            transform: scale(0);
          }
          40% {
            transform: scale(1);
          }
        }
      `}</style>

      <ChatInput onSend={handleSendMessage} isSending={isSending} />
    </div>
  );
}

export default ChatPage;
