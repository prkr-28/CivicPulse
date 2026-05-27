import React, { useState, useEffect, useRef } from 'react';
import axiosInstance from '../api/axiosInstance';

const parseMessageContent = (text) => {
  if (!text) return [];
  const cleaned = text
    .replace(/\*\*/g, '')
    .replace(/\*/g, '')
    .replace(/__/g, '')
    .replace(/_/g, '')
    .replace(/#{1,6}\s?/g, '');

  return cleaned
    .split('\n')
    .map(l => l.trim())
    .map(line => {
      if (!line) return { type: 'spacer' };

      if (/^\d+\.\s/.test(line)) {
        return { type: 'numbered', text: line };
      }

      if (/^[-•]\s/.test(line)) {
        return { type: 'bullet', text: line.replace(/^[-•]\s/, '') };
      }
      const colonIdx = line.indexOf(':');
      if (
        colonIdx > 0 &&
        colonIdx <= 35 &&
        colonIdx < line.length - 1 &&
        !line.startsWith('http')
      ) {
        return {
          type: 'row',
          label: line.substring(0, colonIdx).trim(),
          value: line.substring(colonIdx + 1).trim(),
        };
      }

      return { type: 'text', text: line };
    });
};

const renderParsedLines = (lines, isMobile) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
    {lines.map((line, idx) => {
      switch (line.type) {
        case 'spacer':
          return <div key={idx} style={{ height: '3px' }} />;

        case 'text':
          return (
            <div key={idx} style={{ fontSize: isMobile ? '13px' : '14px', lineHeight: '1.6', color: '#1f2937' }}>
              {line.text}
            </div>
          );

        case 'row':
          return (
            <div key={idx} style={{ display: 'flex', gap: '6px', fontSize: isMobile ? '13px' : '14px', lineHeight: '1.5' }}>
              <span style={{ fontWeight: 600, color: '#374151', whiteSpace: 'nowrap' }}>
                {line.label}:
              </span>
              <span style={{ color: '#1f2937' }}>{line.value}</span>
            </div>
          );

        case 'bullet':
          return (
            <div key={idx} style={{ display: 'flex', gap: '8px', fontSize: isMobile ? '13px' : '14px', lineHeight: '1.5' }}>
              <span style={{ color: '#6b7280', flexShrink: 0, marginTop: '2px' }}>•</span>
              <span style={{ color: '#1f2937' }}>{line.text}</span>
            </div>
          );

        case 'numbered':
          return (
            <div key={idx} style={{ marginLeft: '4px', fontSize: isMobile ? '13px' : '14px', lineHeight: '1.5', color: '#1f2937' }}>
              {line.text}
            </div>
          );

        default:
          return null;
      }
    })}
  </div>
);

function AiChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "Hi! I'm CivicPulse Support. Ask me anything about reporting issues, tracking status, upvoting, or how our admin process works!"
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputText.trim()) return;

    const userMessage = { role: 'user', content: inputText };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInputText('');
    setIsLoading(true);
    setError('');

    try {
      const response = await axiosInstance.post('/ai/chat', { messages: updatedMessages });

      if (response.data.success && response.data.message) {
        setMessages(prev => [
          ...prev,
          { role: 'assistant', content: response.data.message }
        ]);
      } else {
        setError(response.data.error || 'Failed to get response. Please try again.');
      }
    } catch (err) {
      console.error('Chat error:', err);
      setError(err.message || 'Connection error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const isMobile = window.innerWidth < 768;
  const chatWidth = isMobile ? 'calc(100vw - 40px)' : '400px';
  const chatHeight = isMobile ? 'calc(100vh - 120px)' : '600px';
  const buttonSize = isMobile ? '56px' : '60px';
  const buttonBottom = isMobile ? '10px' : '20px';
  const buttonRight = isMobile ? '10px' : '20px';

  return (
    <div style={{ position: 'fixed', bottom: buttonBottom, right: buttonRight, zIndex: 1000 }}>

      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          style={{
            width: buttonSize,
            height: buttonSize,
            borderRadius: '50%',
            backgroundColor: '#1D9E75',
            color: 'white',
            border: 'none',
            cursor: 'pointer',
            fontSize: isMobile ? '20px' : '24px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'transform 0.2s',
            padding: 0
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
          aria-label="Open CivicPulse Support Chat"
        >
          💬
        </button>
      )}

      {isOpen && (
        <div
          style={{
            width: chatWidth,
            maxWidth: '100vw',
            height: chatHeight,
            maxHeight: '100vh',
            backgroundColor: 'white',
            borderRadius: isMobile ? '8px' : '12px',
            boxShadow: '0 5px 40px rgba(0,0,0,0.16)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            animation: 'slideUp 0.3s ease',
            position: isMobile ? 'fixed' : 'relative',
            bottom: isMobile ? '50%' : 'auto',
            left: isMobile ? '50%' : 'auto',
            right: isMobile ? 'auto' : 'auto',
            transform: isMobile ? 'translate(-50%, 50%)' : 'none',
            borderBottomLeftRadius: isMobile ? '8px' : '12px',
            borderBottomRightRadius: isMobile ? '8px' : '12px'
          }}
        >
          <div
            style={{
              backgroundColor: '#1D9E75',
              color: 'white',
              padding: isMobile ? '12px 14px' : '16px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexShrink: 0
            }}
          >
            <h3 style={{ margin: 0, fontSize: isMobile ? '14px' : '16px', fontWeight: 600 }}>
              CivicPulse Support 🤖
            </h3>
            <button
              onClick={() => setIsOpen(false)}
              style={{
                background: 'none',
                border: 'none',
                color: 'white',
                cursor: 'pointer',
                fontSize: '20px',
                padding: 0,
                width: '28px',
                height: '28px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '50%',
                transition: 'background 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
              aria-label="Close chat"
            >
              ✕
            </button>
          </div>

          <div
            style={{
              flex: 1,
              overflowY: 'auto',
              padding: isMobile ? '12px' : '16px',
              display: 'flex',
              flexDirection: 'column',
              gap: isMobile ? '10px' : '12px',
              backgroundColor: '#f9fafb'
            }}
          >
            {messages.map((msg, idx) => (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start'
                }}
              >
                <div
                  style={{
                    maxWidth: '82%',
                    padding: '10px 14px',
                    borderRadius: msg.role === 'user' ? '12px 12px 2px 12px' : '12px 12px 12px 2px',
                    backgroundColor: msg.role === 'user' ? '#1D9E75' : '#ffffff',
                    color: msg.role === 'user' ? 'white' : '#1f2937',
                    fontSize: isMobile ? '13px' : '14px',
                    lineHeight: '1.6',
                    wordBreak: 'break-word',
                    boxShadow: msg.role === 'user'
                      ? 'none'
                      : '0 1px 3px rgba(0,0,0,0.08)',
                    border: msg.role === 'user' ? 'none' : '1px solid #e5e7eb'
                  }}
                >
                  {msg.role === 'assistant'
                    ? renderParsedLines(parseMessageContent(msg.content), isMobile)
                    : <span style={{ fontSize: isMobile ? '13px' : '14px' }}>{msg.content}</span>
                  }
                </div>
              </div>
            ))}

            {isLoading && (
              <div style={{ display: 'flex' }}>
                <div
                  style={{
                    padding: '12px 16px',
                    borderRadius: '12px 12px 12px 2px',
                    backgroundColor: '#ffffff',
                    border: '1px solid #e5e7eb',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
                    display: 'flex',
                    gap: '5px',
                    alignItems: 'center'
                  }}
                >
                  {[0, 0.2, 0.4].map((delay, i) => (
                    <span
                      key={i}
                      style={{
                        width: '7px',
                        height: '7px',
                        borderRadius: '50%',
                        backgroundColor: '#9ca3af',
                        display: 'inline-block',
                        animation: `bounce 1.2s ease-in-out ${delay}s infinite`
                      }}
                    />
                  ))}
                </div>
              </div>
            )}

            {error && (
              <div
                style={{
                  padding: '10px 14px',
                  borderRadius: '10px',
                  backgroundColor: '#fee2e2',
                  color: '#991b1b',
                  fontSize: '13px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <span>⚠️ {error}</span>
                <button
                  onClick={() => setError('')}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#991b1b',
                    cursor: 'pointer',
                    fontSize: '16px',
                    padding: 0,
                    flexShrink: 0
                  }}
                  aria-label="Dismiss error"
                >
                  ✕
                </button>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          <div
            style={{
              padding: isMobile ? '10px' : '12px 14px',
              borderTop: '1px solid #e5e7eb',
              display: 'flex',
              gap: isMobile ? '6px' : '8px',
              backgroundColor: 'white',
              flexShrink: 0
            }}
          >
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={isMobile ? 'Ask anything...' : 'Ask me anything...'}
              disabled={isLoading}
              style={{
                flex: 1,
                padding: isMobile ? '9px 11px' : '10px 12px',
                border: '1.5px solid #d1d5db',
                borderRadius: '8px',
                fontSize: isMobile ? '13px' : '14px',
                fontFamily: 'inherit',
                outline: 'none',
                opacity: isLoading ? 0.6 : 1,
                cursor: isLoading ? 'not-allowed' : 'text',
                transition: 'border-color 0.2s'
              }}
              onFocus={(e) => e.currentTarget.style.borderColor = '#1D9E75'}
              onBlur={(e) => e.currentTarget.style.borderColor = '#d1d5db'}
            />
            <button
              onClick={handleSendMessage}
              disabled={isLoading || !inputText.trim()}
              style={{
                padding: isMobile ? '9px 13px' : '10px 16px',
                backgroundColor: isLoading || !inputText.trim() ? '#d1d5db' : '#1D9E75',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: isLoading || !inputText.trim() ? 'not-allowed' : 'pointer',
                fontSize: isMobile ? '13px' : '14px',
                fontWeight: 600,
                transition: 'background-color 0.2s, transform 0.1s',
                minWidth: isMobile ? '44px' : 'auto',
                flexShrink: 0
              }}
              onMouseEnter={(e) => {
                if (!isLoading && inputText.trim()) {
                  e.currentTarget.style.backgroundColor = '#178a63';
                }
              }}
              onMouseLeave={(e) => {
                if (!isLoading && inputText.trim()) {
                  e.currentTarget.style.backgroundColor = '#1D9E75';
                }
              }}
              aria-label="Send message"
            >
              {isMobile ? '↑' : 'Send'}
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0);    }
        }
        @keyframes bounce {
          0%, 60%, 100% { transform: translateY(0);    }
          30%            { transform: translateY(-6px); }
        }
      `}</style>
    </div>
  );
}

export default AiChatWidget;