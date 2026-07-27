import React, { StrictMode, Component } from 'react';
import { createRoot } from 'react-dom/client';
import { PrivyProvider } from './context/PrivyContext.jsx';
import './index.css';
import App from './App.jsx';

class GlobalErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Global Error Boundary caught error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          padding: '40px 24px',
          background: '#090A0C',
          color: '#F0F2F5',
          fontFamily: 'Inter, sans-serif',
          textAlign: 'center',
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <div style={{
            width: '64px', height: '64px', borderRadius: '16px',
            background: 'rgba(212,175,55,0.12)', border: '1px solid #D4AF37',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.8rem', marginBottom: '16px'
          }}>
            ⚡
          </div>
          <h2 style={{ fontFamily: 'Outfit, sans-serif', color: '#E5C158', fontSize: '1.4rem', marginBottom: '8px' }}>
            ONYIS SYSTEM RECOVERY
          </h2>
          <p style={{ color: '#9DA6B4', marginBottom: '24px', maxWidth: '480px', fontSize: '0.88rem', lineHeight: 1.6 }}>
            {this.state.error?.toString() || 'A temporary display state occurred. Please click reload below.'}
          </p>
          <button
            onClick={() => window.location.reload()}
            style={{
              padding: '12px 24px',
              background: 'linear-gradient(135deg, #FFDF00 0%, #D4AF37 50%, #AA7C11 100%)',
              border: 'none',
              borderRadius: '8px',
              color: '#000',
              fontWeight: 800,
              fontSize: '0.9rem',
              cursor: 'pointer'
            }}
          >
            Reload ONYIS Platform
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <GlobalErrorBoundary>
      <PrivyProvider>
        <App />
      </PrivyProvider>
    </GlobalErrorBoundary>
  </StrictMode>
);
