import { useState } from 'react';
import { Link } from 'react-router-dom';
import { forgotPassword } from '../services/apiService';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle'); // idle, loading, success, error
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;

    setStatus('loading');
    setMessage('');

    try {
      const responseText = await forgotPassword(email);
      // Usually returns a success message from backend, or null if fallback
      setStatus('success');
      setMessage(responseText || 'If an account exists with this email, a reset link has been sent. (Check console for mock link if backend is offline)');
    } catch (err) {
      setStatus('error');
      setMessage(err.message || 'Failed to send reset link. Please try again.');
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-root)', padding: '20px' }}>
      <div style={{ width: '100%', maxWidth: '440px' }} className="glass-intense animate-fade-in-scale">
        <div style={{ padding: '48px 40px' }}>
          
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '18px', margin: '0 auto 20px', background: 'linear-gradient(135deg, rgba(124,58,237,0.3), rgba(6,182,212,0.2))', border: '1px solid rgba(124,58,237,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.8rem', boxShadow: '0 8px 24px rgba(124,58,237,0.25)' }}>
              🔑
            </div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: '800', marginBottom: '8px' }}>Reset Password</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              Enter your email address and we'll send you a link to reset your password.
            </p>
          </div>

          {status === 'error' && (
            <div className="animate-fade-in" style={{ background: 'var(--danger-soft)', border: '1px solid rgba(239,68,68,0.3)', color: '#fca5a5', padding: '12px 16px', borderRadius: 'var(--radius-sm)', marginBottom: '18px', fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              ⚠️ {message}
            </div>
          )}

          {status === 'success' ? (
            <div className="animate-fade-in" style={{ textAlign: 'center' }}>
              <div style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', color: '#34d399', padding: '16px', borderRadius: 'var(--radius-sm)', marginBottom: '24px', fontSize: '0.95rem' }}>
                ✅ {message}
              </div>
              <Link to="/login" className="btn btn-outline btn-full">Return to Login</Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '600', color: 'var(--text-muted)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Email Address</label>
                <input 
                  type="email" 
                  placeholder="name@company.com" 
                  className="input-field" 
                  value={email} 
                  onChange={e => setEmail(e.target.value)} 
                  required 
                  autoFocus 
                />
              </div>

              <button type="submit" className="btn btn-accent btn-full btn-lg" disabled={status === 'loading'}>
                {status === 'loading' ? 'Sending...' : 'Send Reset Link'}
              </button>
            </form>
          )}

          <div style={{ textAlign: 'center', marginTop: '24px' }}>
            <Link to="/login" style={{ color: 'var(--text-muted)', fontSize: '0.88rem', textDecoration: 'none', fontWeight: '500' }}>
              ← Back to login
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}
