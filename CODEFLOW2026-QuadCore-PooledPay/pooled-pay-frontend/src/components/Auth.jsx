import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8082';

// ── Mock demo accounts ───────────────────────────────────────────
const DEMO_ACCOUNTS = {
  'retailer': { password: 'demo123', role: 'RETAILER' },
  'supplier': { password: 'demo123', role: 'SUPPLIER' },
  'admin':    { password: 'demo123', role: 'ADMIN' },
};

function makeMockJwt(username, role) {
  const header  = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const payload = btoa(JSON.stringify({ sub: username, role, iat: Date.now() }));
  return `${header}.${payload}.mock-signature`;
}

function FloatingOrbs() {
  return (
    <div style={{ position: 'fixed', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 0 }}>
      <div style={{ position: 'absolute', width: '500px', height: '500px', borderRadius: '50%', top: '-150px', left: '-150px', background: 'radial-gradient(circle, rgba(124,58,237,0.15) 0%, transparent 70%)', animation: 'float 8s ease-in-out infinite' }} />
      <div style={{ position: 'absolute', width: '600px', height: '600px', borderRadius: '50%', bottom: '-200px', right: '-200px', background: 'radial-gradient(circle, rgba(6,182,212,0.12) 0%, transparent 70%)', animation: 'float 10s ease-in-out infinite reverse' }} />
      <div style={{ position: 'absolute', width: '300px', height: '300px', borderRadius: '50%', top: '40%', left: '60%', background: 'radial-gradient(circle, rgba(16,185,129,0.08) 0%, transparent 70%)', animation: 'float 7s ease-in-out infinite' }} />
    </div>
  );
}

export default function Auth({ type }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole]         = useState('RETAILER');
  const [location, setLocation] = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);
  const [success, setSuccess]   = useState('');
  const navigate = useNavigate();

  const isLogin = type === 'login';

  // Persist session info clearly
  const saveSession = (token, userRole, userName, userId, userLocation) => {
    localStorage.setItem('token', token);
    localStorage.setItem('userRole', userRole);
    localStorage.setItem('username', userName);
    localStorage.setItem('userId', userId || '1');
    localStorage.setItem('userLocation', userLocation || 'Mumbai');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const url  = isLogin
        ? `${API_URL}/api/auth/login`
        : `${API_URL}/api/auth/signup`;
      const body = isLogin
        ? { username, password }
        : { username, password, role, location: location || 'Mumbai' };

      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(4000),
      });

      if (res.ok) {
        if (isLogin) {
          const data = await res.json();
          saveSession(data.token, data.role, data.username, data.userId, data.location || 'Mumbai');
          navigate('/dashboard');
        } else {
          // After signup, auto-login immediately
          const loginRes = await fetch(`${API_URL}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password }),
            signal: AbortSignal.timeout(4000),
          });
          if (loginRes.ok) {
            const data = await loginRes.json();
            saveSession(data.token, data.role, data.username, data.userId, location || 'Mumbai');
            navigate('/dashboard');
          } else {
            setSuccess('✅ Account created! Please sign in.');
            setTimeout(() => navigate('/login'), 1500);
          }
        }
        return;
      }
      const msg = await res.text();
      throw new Error(msg || 'Something went wrong');

    } catch (err) {
      // Demo fallback (backend offline)
      if (err.name === 'TimeoutError' || err.message.includes('fetch') || err.name === 'TypeError') {
        if (isLogin) {
          const acc = DEMO_ACCOUNTS[username.toLowerCase()];
          if (acc && acc.password === password) {
            saveSession(makeMockJwt(username, acc.role), acc.role, username, '1', 'Mumbai');
            navigate('/dashboard');
          } else {
            // Any user → use RETAILER as demo fallback
            saveSession(makeMockJwt(username || 'Demo', 'RETAILER'), 'RETAILER', username || 'Demo', '1', 'Mumbai');
            navigate('/dashboard');
          }
        } else {
          setSuccess('✅ Account saved (demo mode)! Logging you in...');
          setTimeout(() => {
            saveSession(makeMockJwt(username, role), role, username, '1', location || 'Mumbai');
            navigate('/dashboard');
          }, 1200);
        }
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const quickLogin = (demoRole) => {
    const name = demoRole.charAt(0) + demoRole.slice(1).toLowerCase();
    saveSession(makeMockJwt(name, demoRole), demoRole, name, '1', 'Mumbai');
    navigate('/dashboard');
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-root)', position: 'relative', padding: '20px' }}>
      <FloatingOrbs />

      {/* Brand */}
      <div style={{ position: 'absolute', top: '32px', left: '40px', display: 'flex', alignItems: 'center', gap: '10px', zIndex: 2 }}>
        <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'linear-gradient(135deg, var(--primary), var(--accent))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '1.1rem', color: '#fff', boxShadow: '0 4px 14px rgba(124,58,237,0.4)' }}>P</div>
        <span style={{ fontWeight: '700', fontSize: '1.1rem', color: 'var(--text-main)' }}>Pooled Pay</span>
      </div>

      <div style={{ position: 'relative', zIndex: 2, width: '100%', maxWidth: '440px' }}>
        <div className="glass-intense animate-fade-in-scale" style={{ padding: '48px 40px' }}>

          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '18px', margin: '0 auto 20px', background: 'linear-gradient(135deg, rgba(124,58,237,0.3), rgba(6,182,212,0.2))', border: '1px solid rgba(124,58,237,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.8rem', boxShadow: '0 8px 24px rgba(124,58,237,0.25)' }}>
              {isLogin ? '🔐' : '🚀'}
            </div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: '800', marginBottom: '8px' }}>
              {isLogin ? <span>Welcome <span className="gradient-text">back</span></span> : <span>Join <span className="gradient-text">Pooled Pay</span></span>}
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              {isLogin ? 'Sign in to your portal and start saving.' : 'Create your account and unlock group pricing.'}
            </p>
          </div>

          {/* Alerts */}
          {error && (
            <div className="animate-fade-in" style={{ background: 'var(--danger-soft)', border: '1px solid rgba(239,68,68,0.3)', color: '#fca5a5', padding: '12px 16px', borderRadius: 'var(--radius-sm)', marginBottom: '18px', fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              ⚠️ {error}
            </div>
          )}
          {success && (
            <div className="animate-fade-in" style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', color: '#34d399', padding: '12px 16px', borderRadius: 'var(--radius-sm)', marginBottom: '18px', fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              {success}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '600', color: 'var(--text-muted)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Username</label>
              <input type="text" placeholder="e.g. john_pharma" className="input-field" value={username} onChange={e => setUsername(e.target.value)} required autoFocus />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '600', color: 'var(--text-muted)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Password</label>
              <input type="password" placeholder="••••••••" className="input-field" value={password} onChange={e => setPassword(e.target.value)} required />
            </div>

            {!isLogin && (
              <>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '600', color: 'var(--text-muted)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>I am a...</label>
                  <select className="input-field" value={role} onChange={e => setRole(e.target.value)}>
                    <option value="RETAILER">🏪 Retailer — Buy in pools, save big</option>
                    <option value="SUPPLIER">🚚 Supplier — List products, fulfill orders</option>
                    <option value="ADMIN">🛡️ Admin — Manage the platform</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '600', color: 'var(--text-muted)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>City / Area</label>
                  <input type="text" placeholder="e.g. Mumbai, Andheri West" className="input-field" value={location} onChange={e => setLocation(e.target.value)} />
                </div>
              </>
            )}

            <button type="submit" className="btn btn-accent btn-full btn-lg" style={{ marginTop: '8px' }} disabled={loading}>
              {loading
                ? <><span style={{ display: 'inline-block', width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} /> Processing...</>
                : isLogin ? '→ Sign In' : '→ Create Account'}
            </button>
          </form>

          {/* Quick demo */}
          {isLogin && (
            <div style={{ marginTop: '28px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
                <div className="divider" />
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', fontWeight: '600', letterSpacing: '0.06em' }}>DEMO QUICK ACCESS</span>
                <div className="divider" />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
                {[
                  { label: '🏪 Retailer', role: 'RETAILER' },
                  { label: '🚚 Supplier', role: 'SUPPLIER' },
                  { label: '🛡️ Admin',    role: 'ADMIN' },
                ].map(({ label, role: r }) => (
                  <button key={r} onClick={() => quickLogin(r)} className="btn btn-outline"
                    style={{ fontSize: '0.78rem', padding: '8px 10px', textAlign: 'center', height: 'auto' }}>
                    {label}
                  </button>
                ))}
              </div>
              <p style={{ textAlign: 'center', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '10px' }}>No backend needed — instant demo mode</p>
            </div>
          )}

          <p style={{ textAlign: 'center', marginTop: '24px', fontSize: '0.88rem', color: 'var(--text-muted)' }}>
            {isLogin
              ? <><>New here?{' '}</><Link to="/signup" style={{ color: 'var(--accent)', fontWeight: '600', textDecoration: 'none' }}>Create an account →</Link></>
              : <><>Already registered?{' '}</><Link to="/login" style={{ color: 'var(--accent)', fontWeight: '600', textDecoration: 'none' }}>Sign in →</Link></>}
          </p>
        </div>
        <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          🔒 JWT-secured · Spring Boot backend · MySQL persistence
        </div>
      </div>
    </div>
  );
}
