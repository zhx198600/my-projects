import { useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';

export interface ChatMessage {
  id: number;
  sessionId: string;
  message: string;
  sender: 'user' | 'bot';
  timestamp: string;
}

export interface JoinedEvent {
  sessionId: string;
  username: string;
  welcomeMessage: string;
}

export interface UseSocketReturn {
  socket: Socket | null;
  isConnected: boolean;
  join: (sessionId: string, username: string) => void;
  sendMessage: (sessionId: string, message: string) => void;
}

export const useSocket = (
  onMessage: (msg: ChatMessage) => void,
  onJoined: (event: JoinedEvent) => void,
  onTyping: (isTyping: boolean) => void
): UseSocketReturn => {
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  const onMessageRef = useRef(onMessage);
  const onJoinedRef = useRef(onJoined);
  const onTypingRef = useRef(onTyping);

  useEffect(() => {
    onMessageRef.current = onMessage;
    onJoinedRef.current = onJoined;
    onTypingRef.current = onTyping;
  }, [onMessage, onJoined, onTyping]);

  useEffect(() => {
    const socket = io({
      path: '/socket.io',
      transports: ['websocket', 'polling'],
    });

    socket.on('connect', () => {
      console.log('Connected to server');
      setIsConnected(true);
    });

    socket.on('disconnect', () => {
      console.log('Disconnected from server');
      setIsConnected(false);
    });

    socket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error);
    });

    socket.on('joined', (data: JoinedEvent) => {
      console.log('Joined event:', data);
      onJoinedRef.current(data);
    });

    socket.on('chat message', (data: ChatMessage) => {
      console.log('Received message:', data);
      onMessageRef.current(data);
    });

    socket.on('typing', (data: { isTyping: boolean }) => {
      onTypingRef.current(data.isTyping);
    });

    socketRef.current = socket;

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, []);

  const join = useCallback((sessionId: string, username: string) => {
    if (socketRef.current) {
      socketRef.current.emit('join', { sessionId, username });
    }
  }, []);

  const sendMessage = useCallback((sessionId: string, message: string) => {
    if (socketRef.current) {
      socketRef.current.emit('chat message', { sessionId, message });
    }
  }, []);

  return {
    socket: socketRef.current,
    isConnected,
    join,
    sendMessage,
  };
};
