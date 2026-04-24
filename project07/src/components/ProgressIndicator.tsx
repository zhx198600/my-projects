import { useState, useEffect } from 'react';

interface ProgressIndicatorProps {
  messages?: string[];
  interval?: number;
}

const defaultMessages = [
  "正在分析你的创意...",
  "构思角色设定...",
  "构建故事框架...",
  "创作第一集内容...",
  "设计情节转折...",
  "润色对话细节...",
  "准备反转结局...",
  "即将完成...",
];

export default function ProgressIndicator({
  messages = defaultMessages,
  interval = 800,
}: ProgressIndicatorProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (messages.length === 0) return;

    const timer = setInterval(() => {
      setIsVisible(false);
      setTimeout(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % messages.length);
        setIsVisible(true);
      }, 150);
    }, interval);

    return () => {
      clearInterval(timer);
    };
  }, [messages, interval]);

  if (messages.length === 0) return null;

  return (
    <p
      className={`text-base text-center transition-opacity duration-150 ${
        isVisible ? 'opacity-100' : 'opacity-0'
      }`}
    >
      {messages[currentIndex]}
    </p>
  );
}
