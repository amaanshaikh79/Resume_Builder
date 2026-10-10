import React from 'react';
import { Link } from 'react-router-dom';

// Simple fallback home page without complex CSS
const SimpleHome: React.FC = () => {
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div style={{
        maxWidth: '800px',
        background: 'white',
        borderRadius: '20px',
        padding: '60px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
        textAlign: 'center'
      }}>
        <h1 style={{
          fontSize: '48px',
          fontWeight: 'bold',
          marginBottom: '20px',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>
          🚀 AI Resume Builder
        </h1>
        
        <p style={{
          fontSize: '20px',
          color: '#666',
          marginBottom: '40px',
          lineHeight: '1.6'
        }}>
          Create professional, ATS-optimized resumes with AI-powered insights
        </p>

        <div style={{
          display: 'flex',
          gap: '20px',
          justifyContent: 'center',
          marginBottom: '40px'
        }}>
          <Link 
            to="/register"
            style={{
              padding: '15px 40px',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              textDecoration: 'none',
              borderRadius: '10px',
              fontWeight: 'bold',
              fontSize: '18px',
              boxShadow: '0 10px 30px rgba(102, 126, 234, 0.4)'
            }}
          >
            Get Started Free
          </Link>
          
          <Link 
            to="/login"
            style={{
              padding: '15px 40px',
              background: 'white',
              color: '#667eea',
              textDecoration: 'none',
              borderRadius: '10px',
              fontWeight: 'bold',
              fontSize: '18px',
              border: '2px solid #667eea'
            }}
          >
            Sign In
          </Link>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '30px',
          marginTop: '50px'
        }}>
          <div>
            <div style={{ fontSize: '40px', marginBottom: '10px' }}>🤖</div>
            <h3 style={{ fontSize: '18px', marginBottom: '10px' }}>AI-Powered</h3>
            <p style={{ fontSize: '14px', color: '#666' }}>Smart suggestions</p>
          </div>
          
          <div>
            <div style={{ fontSize: '40px', marginBottom: '10px' }}>⚡</div>
            <h3 style={{ fontSize: '18px', marginBottom: '10px' }}>Fast & Easy</h3>
            <p style={{ fontSize: '14px', color: '#666' }}>Ready in minutes</p>
          </div>
          
          <div>
            <div style={{ fontSize: '40px', marginBottom: '10px' }}>🎯</div>
            <h3 style={{ fontSize: '18px', marginBottom: '10px' }}>ATS Optimized</h3>
            <p style={{ fontSize: '14px', color: '#666' }}>Get past filters</p>
          </div>
        </div>

        <div style={{
          marginTop: '50px',
          padding: '20px',
          background: '#f8f9fa',
          borderRadius: '10px'
        }}>
          <p style={{ fontSize: '14px', color: '#666', margin: 0 }}>
            ✅ Frontend is working!<br/>
            Check browser console (F12) for any errors
          </p>
        </div>
      </div>
    </div>
  );
};

export default SimpleHome;
