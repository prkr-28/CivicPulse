import React, { useState } from 'react';
import axiosInstance from '../api/axiosInstance';

const stripMarkdown = (text) => {
  if (!text) return '';
  return text
    .replace(/\*\*/g, '')
    .replace(/\*/g, '')
    .replace(/__/g, '')
    .replace(/_/g, '')
    .replace(/#{1,6}\s?/g, '')
    .trim();
};

function AiDescriptionImprover({ description, category, onAccept }) {
  const [showResult, setShowResult] = useState(false);
  const [improved, setImproved] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

  const handleImprove = async () => {
    setError('');
    setShowResult(false);

    if (description.trim().length < 5) {
      setError('Description must be at least 5 characters to improve.');
      return;
    }

    setIsLoading(true);

    try {
      const response = await axiosInstance.post('/ai/improve', {
        description: description.trim(),
        category: category || 'Other'
      });

      if (response.data.success && response.data.improved) {
        setImproved(stripMarkdown(response.data.improved));
        setShowResult(true);
      } else {
        setError('Could not improve description. Please try again.');
      }
    } catch (err) {
      console.error('Improver error:', err);
      setError(err.message || 'Connection error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAccept = () => {
    onAccept(improved);
    setShowResult(false);
    setImproved('');
  };

  const handleDismiss = () => {
    setShowResult(false);
    setImproved('');
  };

  return (
    <div style={{ marginTop: '12px' }}>

      <button
        type="button"
        onClick={handleImprove}
        disabled={isLoading}
        style={{
          padding: isMobile ? '12px 14px' : '10px 16px',
          backgroundColor: isLoading ? '#d1d5db' : '#E1F5EE',
          color: isLoading ? '#6b7280' : '#0F6E56',
          border: `2px solid ${isLoading ? '#d1d5db' : '#5DCAA5'}`,
          borderRadius: '8px',
          fontSize: isMobile ? '13px' : '14px',
          fontWeight: 600,
          cursor: isLoading ? 'not-allowed' : 'pointer',
          transition: 'all 0.2s',
          marginBottom: '8px',
          width: '100%'
        }}
        onMouseEnter={(e) => {
          if (!isLoading) e.currentTarget.style.backgroundColor = '#C8E6E0';
        }}
        onMouseLeave={(e) => {
          if (!isLoading) e.currentTarget.style.backgroundColor = '#E1F5EE';
        }}
      >
        {isLoading ? '⏳ Improving...' : 'Improve with AI ✨'}
      </button>

      {error && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '8px',
            color: '#dc2626',
            backgroundColor: '#fee2e2',
            border: '1px solid #fca5a5',
            borderRadius: '6px',
            fontSize: '13px',
            padding: '8px 12px',
            marginTop: '6px',
            marginBottom: '8px'
          }}
        >
          <span>⚠️ {error}</span>
          <button
            type="button"
            onClick={() => setError('')}
            style={{
              background: 'none',
              border: 'none',
              color: '#dc2626',
              cursor: 'pointer',
              fontSize: '15px',
              padding: 0,
              flexShrink: 0
            }}
            aria-label="Dismiss error"
          >
            ✕
          </button>
        </div>
      )}

      {showResult && improved && (
        <div
          style={{
            marginTop: '16px',
            padding: '16px',
            backgroundColor: '#f9fafb',
            border: '1px solid #e5e7eb',
            borderRadius: '10px',
            animation: 'fadeIn 0.25s ease'
          }}
        >
          <h4
            style={{
              margin: '0 0 14px 0',
              fontSize: '14px',
              fontWeight: 700,
              color: '#1f2937',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            ✨ AI Improved Description
          </h4>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
              gap: isMobile ? '10px' : '14px',
              marginBottom: '16px'
            }}
          >
            <div>
              <p
                style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  color: '#9ca3af',
                  marginBottom: '6px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em'
                }}
              >
                Your Version
              </p>
              <div
                style={{
                  padding: '12px',
                  backgroundColor: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '13px',
                  color: '#6b7280',
                  fontStyle: 'italic',
                  lineHeight: '1.6',
                  minHeight: '80px',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word'
                }}
              >
                {description}
              </div>
            </div>

            <div>
              <p
                style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  color: '#0F6E56',
                  marginBottom: '6px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em'
                }}
              >
                AI Version
              </p>
              <div
                style={{
                  padding: '12px',
                  backgroundColor: 'white',
                  border: '1.5px solid #5DCAA5',
                  borderRadius: '8px',
                  fontSize: '13px',
                  color: '#1f2937',
                  lineHeight: '1.6',
                  minHeight: '80px',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word'
                }}
              >
                {improved}
              </div>
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              gap: '10px',
              justifyContent: isMobile ? 'space-between' : 'flex-end'
            }}
          >
            <button
              type="button"
              onClick={handleDismiss}
              style={{
                padding: isMobile ? '10px 12px' : '8px 18px',
                backgroundColor: 'white',
                color: '#0F6E56',
                border: '1.5px solid #5DCAA5',
                borderRadius: '6px',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'background-color 0.2s',
                flex: isMobile ? 1 : 'auto'
              }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#f0fdf9'; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'white'; }}
            >
              Keep Mine
            </button>

            <button
              type="button"
              onClick={handleAccept}
              style={{
                padding: isMobile ? '10px 12px' : '8px 18px',
                backgroundColor: '#1D9E75',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'background-color 0.2s',
                flex: isMobile ? 1 : 'auto'
              }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#0F6E56'; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#1D9E75'; }}
            >
              Use This ✓
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0);   }
        }
      `}</style>
    </div>
  );
}

export default AiDescriptionImprover;