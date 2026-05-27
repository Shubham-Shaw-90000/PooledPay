import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { resetPassword } from '../services/apiService';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [status, setStatus] = useState('idle'); // idle, loading, success, error
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('Invalid or missing reset token.');
    }
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token) return;
    
    if (password !== confirmPassword) {
      setStatus('error');
      setMessage('Passwords do not match.');
      return;
    }

    if (password.length < 6) {
      setStatus('error');
      setMessage('Password must be at least 6 characters long.');
      return;
    }

    setStatus('loading');
    setMessage('');

    try {
      const responseText = await resetPassword(token, password);
      setStatus('success');
      setMessage(responseText || 'Password successfully reset. You can now log in.');
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err) {
      setStatus('error');
      setMessage(err.message || 'Failed to reset password. The link may have expired.');
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-root)', padding: '20px' }}>
      <div style={{ width: '100%', maxWidth: '440px' }} className="glass-intense animate-fade-in-scale">
        <div style={{ padding: '48px 40px' }}>
          
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '18px', margin: '0 auto 20px', background: 'linear-gradient(135deg, rgba(16,185,129,0.3), rgba(6,182,212,0.2))', border: '1px solid rgba(16,185,129,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.8rem', boxShadow: '0 8px 24px rgba(16,185,129,0.25)' }}>
              🔒
            </div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: '800', marginBottom: '8px' }}>Set New Password</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              Please enter your new password below.
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
                <br /><br />
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Redirecting to login...</span>
              </div>
            </div>
          ) : !token ? (
             <div style={{ textAlign: 'center', marginTop: '24px' }}>
               <Link to="/forgot-password" style={{ color: 'var(--accent)', fontSize: '0.88rem', textDecoration: 'none', fontWeight: '600' }}>
                 Request a new reset link
               </Link>
             </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '600', color: 'var(--text-muted)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>New Password</label>
                <input 
                  type="password" 
                  placeholder="••••••••" 
                  className="input-field" 
                  value={password} 
                  onChange={e => setPassword(e.target.value)} 
                  required 
                  autoFocus 
                  minLength={6}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '600', color: 'var(--text-muted)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Confirm Password</label>
                <input 
                  type="password" 
                  placeholder="••••••••" 
                  className="input-field" 
                  value={confirmPassword} 
                  onChange={e => setConfirmPassword(e.target.value)} 
                  required 
                  minLength={6}
                />
              </div>

              <button type="submit" className="btn btn-accent btn-full btn-lg" disabled={status === 'loading'}>
                {status === 'loading' ? 'Saving...' : 'Reset Password'}
              </button>
            </form>
          )}

        </div>
      </div>
    </div>
  );
}
