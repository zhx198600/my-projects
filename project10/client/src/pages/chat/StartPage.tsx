import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function StartPage() {
  const [username, setUsername] = useState('');
  const navigate = useNavigate();

  const handleStart = () => {
    const trimmedUsername = username.trim();
    if (trimmedUsername) {
      localStorage.setItem('chatUsername', trimmedUsername);
      navigate('/chat/room');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleStart();
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        fontFamily: 'system-ui, -apple-system, sans-serif',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '420px',
          margin: '20px',
          padding: '40px 32px',
          backgroundColor: '#fff',
          borderRadius: '16px',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
        }}
      >
        <div
          style={{
            textAlign: 'center',
            marginBottom: '32px',
          }}
        >
          <div
            style={{
              width: '64px',
              height: '64px',
              margin: '0 auto 16px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '28px',
            }}
          >
            💬
          </div>
          <h1
            style={{
              margin: '0 0 8px',
              fontSize: '28px',
              fontWeight: 600,
              color: '#1a202c',
            }}
          >
            在线客服
          </h1>
          <p
            style={{
              margin: 0,
              fontSize: '14px',
              color: '#718096',
            }}
          >
            欢迎使用智能客服系统
          </p>
        </div>

        <div
          style={{
            marginBottom: '24px',
          }}
        >
          <label
            style={{
              display: 'block',
              marginBottom: '8px',
              fontSize: '14px',
              fontWeight: 500,
              color: '#4a5568',
            }}
          >
            您的昵称
          </label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="请输入您的昵称"
            style={{
              width: '100%',
              padding: '12px 16px',
              fontSize: '15px',
              borderRadius: '8px',
              border: '2px solid #e2e8f0',
              outline: 'none',
              transition: 'border-color 0.2s',
              boxSizing: 'border-box',
            }}
            onFocus={(e) => {
              e.target.style.borderColor = '#667eea';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = '#e2e8f0';
            }}
          />
        </div>

        <button
          onClick={handleStart}
          disabled={!username.trim()}
          style={{
            width: '100%',
            padding: '14px',
            fontSize: '16px',
            fontWeight: 500,
            color: '#fff',
            backgroundColor: username.trim() ? '#667eea' : '#cbd5e0',
            border: 'none',
            borderRadius: '8px',
            cursor: username.trim() ? 'pointer' : 'not-allowed',
            transition: 'background-color 0.2s',
          }}
        >
          开始聊天
        </button>

        <div
          style={{
            marginTop: '24px',
            paddingTop: '24px',
            borderTop: '1px solid #e2e8f0',
            textAlign: 'center',
          }}
        >
          <p
            style={{
              fontSize: '12px',
              color: '#a0aec0',
            }}
          >
            输入昵称即可开始与客服对话
          </p>
        </div>
      </div>
    </div>
  );
}

export default StartPage;
