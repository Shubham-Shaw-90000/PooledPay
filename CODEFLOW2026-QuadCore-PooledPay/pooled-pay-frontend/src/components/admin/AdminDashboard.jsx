import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8082';

/* ── Inline SVG Icons ──────────────────────────────────────────── */
const Icons = {
  Shield:   (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
  Refresh:  (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"/></svg>,
  Check:    (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>,
  Truck:    (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>,
  Package:  (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="16.5" y1="9.4" x2="7.5" y2="4.21"/><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 002 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>,
  LogOut:   (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>,
  Key:      (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/></svg>,
  List:     (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>,
};

function SI(C, size = 18, color) {
  return <C width={size} height={size} style={{ color, flexShrink: 0 }} />;
}

/* ── Status Badge ──────────────────────────────────────────────── */
const STATUS_STYLES = {
  PENDING:   { bg: 'rgba(245,158,11,0.12)',  c: '#fbbf24', border: 'rgba(245,158,11,0.3)',  emoji: '⏳' },
  APPROVED:  { bg: 'rgba(6,182,212,0.12)',   c: '#22d3ee', border: 'rgba(6,182,212,0.3)',   emoji: '✅' },
  SHIPPED:   { bg: 'rgba(124,58,237,0.12)',  c: '#a78bfa', border: 'rgba(124,58,237,0.3)',  emoji: '📦' },
  DELIVERED: { bg: 'rgba(16,185,129,0.12)',  c: '#34d399', border: 'rgba(16,185,129,0.3)',  emoji: '🎉' },
};

function StatusBadge({ status }) {
  const s = STATUS_STYLES[status] || STATUS_STYLES.PENDING;
  return (
    <span style={{
      background: s.bg, color: s.c, border: `1px solid ${s.border}`,
      padding: '3px 12px', borderRadius: '20px', fontSize: '0.72rem',
      fontWeight: '700', letterSpacing: '0.05em', textTransform: 'uppercase',
      display: 'inline-flex', alignItems: 'center', gap: '5px',
    }}>
      <span>{s.emoji}</span> {status || 'PENDING'}
    </span>
  );
}

/* ── Stat Card ─────────────────────────────────────────────────── */
function StatCard({ label, value, icon, color }) {
  return (
    <div style={{
      background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
      borderRadius: '16px', padding: '20px 22px', display: 'flex', alignItems: 'center', gap: '16px',
      backdropFilter: 'blur(10px)',
    }}>
      <div style={{
        width: '46px', height: '46px', borderRadius: '12px', display: 'flex',
        alignItems: 'center', justifyContent: 'center',
        background: `${color}22`, border: `1px solid ${color}44`,
      }}>
        {SI(icon, 22, color)}
      </div>
      <div>
        <div style={{ fontSize: '1.6rem', fontWeight: '800', color: '#f8fafc', lineHeight: 1 }}>{value}</div>
        <div style={{ fontSize: '0.74rem', color: '#94a3b8', marginTop: '3px', fontWeight: '500' }}>{label}</div>
      </div>
    </div>
  );
}

/* ── Delivery Verify Modal ─────────────────────────────────────── */
function VerifyModal({ order, onClose, onSuccess }) {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleVerify = async () => {
    if (!code.trim()) { setError('Please enter the delivery code.'); return; }
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_URL}/api/admin/verify-delivery/${order.id}?code=${encodeURIComponent(code)}`, {
        method: 'PUT',
      });
      if (res.ok) {
        const updated = await res.json();
        onSuccess(updated);
      } else {
        setError('❌ Invalid delivery code. Please try again.');
      }
    } catch {
      setError('Network error — is the backend running?');
    }
    setLoading(false);
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(6px)', padding: '20px' }}>
      <div style={{ background: 'rgba(15,20,40,0.95)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '20px', padding: '36px 32px', width: '100%', maxWidth: '420px' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '6px', color: '#f8fafc' }}>🔑 Verify Delivery</h3>
        <p style={{ fontSize: '0.82rem', color: '#94a3b8', marginBottom: '22px' }}>
          Order #{order.id} · Code sent to retailer upon approval: <strong style={{ color: '#22d3ee' }}>{order.deliveryCode || '(not yet approved)'}</strong>
        </p>

        <label style={{ fontSize: '0.78rem', color: '#94a3b8', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '6px' }}>
          Enter Delivery Code
        </label>
        <input
          type="text"
          value={code}
          onChange={e => setCode(e.target.value)}
          placeholder="e.g. PP-4821"
          style={{
            width: '100%', padding: '12px 14px', borderRadius: '10px',
            background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)',
            color: '#f8fafc', fontSize: '1rem', fontWeight: '700', letterSpacing: '0.08em',
            outline: 'none', boxSizing: 'border-box', marginBottom: '10px',
          }}
          onKeyDown={e => e.key === 'Enter' && handleVerify()}
        />

        {error && (
          <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '8px', padding: '10px 14px', color: '#f87171', fontSize: '0.82rem', marginBottom: '14px' }}>
            {error}
          </div>
        )}

        <div style={{ display: 'flex', gap: '10px', marginTop: '6px' }}>
          <button onClick={onClose} style={{ flex: 1, padding: '11px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)', background: 'transparent', color: '#94a3b8', cursor: 'pointer', fontWeight: '600' }}>
            Cancel
          </button>
          <button
            onClick={handleVerify}
            disabled={loading}
            style={{ flex: 2, padding: '11px', borderRadius: '10px', border: 'none', background: loading ? 'rgba(255,255,255,0.05)' : 'linear-gradient(135deg, #10b981, #34d399)', color: loading ? '#64748b' : '#000', cursor: loading ? 'not-allowed' : 'pointer', fontWeight: '700', fontSize: '0.95rem' }}
          >
            {loading ? '⏳ Verifying...' : '✅ Confirm Delivery'}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Order Card ────────────────────────────────────────────────── */
function OrderCard({ order, onApprove, onShip, onVerify, loading }) {
  const status = order.orderStatus || 'PENDING';
  const isLoading = loading === order.id;

  return (
    <div style={{
      background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)',
      borderRadius: '16px', padding: '20px 22px',
      transition: 'border-color 0.2s, transform 0.2s',
    }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(124,58,237,0.3)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)'; e.currentTarget.style.transform = 'translateY(0)'; }}
    >
      {/* Header row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
        <div>
          <div style={{ fontSize: '0.72rem', color: '#7c3aed', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '3px' }}>
            Order #{order.id}
          </div>
          <div style={{ fontSize: '1rem', fontWeight: '700', color: '#f8fafc' }}>
            Product #{order.productId}
          </div>
          <div style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: '2px' }}>
            📍 {order.location || 'N/A'} · 👥 {order.participantsCount || 0} participants · 📦 Qty: {order.currentQuantity || 0}
          </div>
        </div>
        <StatusBadge status={status} />
      </div>

      {/* Info grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '8px', marginBottom: '16px' }}>
        {[
          { label: 'Payment', value: order.paymentStatus || 'PENDING', color: order.paymentStatus === 'PAID' ? '#34d399' : '#fbbf24' },
          { label: 'Payment Released', value: order.paymentReleased ? 'Yes ✅' : 'No ❌', color: order.paymentReleased ? '#34d399' : '#f87171' },
          { label: 'Delivery Code', value: order.deliveryCode || '—', color: '#22d3ee' },
          { label: 'Delivered', value: order.delivered ? 'Yes 🎉' : 'No', color: order.delivered ? '#34d399' : '#94a3b8' },
          { label: 'Approved At', value: order.approvedAt ? new Date(order.approvedAt).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' }) : '—', color: '#94a3b8' },
          { label: 'Created At', value: order.createdAt ? new Date(order.createdAt).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' }) : '—', color: '#94a3b8' },
        ].map(({ label, value, color }) => (
          <div key={label} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '10px', padding: '10px 12px' }}>
            <div style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '3px' }}>{label}</div>
            <div style={{ fontSize: '0.85rem', fontWeight: '700', color }}>{value}</div>
          </div>
        ))}
      </div>

      {/* Action buttons */}
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        {status === 'PENDING' && (
          <button
            onClick={() => onApprove(order.id)}
            disabled={isLoading}
            style={{
              padding: '9px 18px', borderRadius: '10px', border: 'none',
              background: isLoading ? 'rgba(255,255,255,0.05)' : 'linear-gradient(135deg, #7c3aed, #a78bfa)',
              color: isLoading ? '#64748b' : '#fff', fontWeight: '700', fontSize: '0.84rem',
              cursor: isLoading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: '6px',
              transition: 'all 0.2s', boxShadow: isLoading ? 'none' : '0 4px 14px rgba(124,58,237,0.35)',
            }}
          >
            {SI(Icons.Check, 15, '#fff')} {isLoading ? 'Processing...' : 'Approve & Release Payment'}
          </button>
        )}

        {status === 'APPROVED' && (
          <button
            onClick={() => onShip(order.id)}
            disabled={isLoading}
            style={{
              padding: '9px 18px', borderRadius: '10px', border: 'none',
              background: isLoading ? 'rgba(255,255,255,0.05)' : 'linear-gradient(135deg, #0891b2, #22d3ee)',
              color: isLoading ? '#64748b' : '#000', fontWeight: '700', fontSize: '0.84rem',
              cursor: isLoading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: '6px',
              transition: 'all 0.2s', boxShadow: isLoading ? 'none' : '0 4px 14px rgba(6,182,212,0.35)',
            }}
          >
            {SI(Icons.Truck, 15, '#000')} {isLoading ? 'Processing...' : 'Mark as Shipped'}
          </button>
        )}

        {status === 'SHIPPED' && !order.delivered && (
          <button
            onClick={() => onVerify(order)}
            style={{
              padding: '9px 18px', borderRadius: '10px', border: 'none',
              background: 'linear-gradient(135deg, #10b981, #34d399)',
              color: '#000', fontWeight: '700', fontSize: '0.84rem',
              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px',
              boxShadow: '0 4px 14px rgba(16,185,129,0.35)', transition: 'all 0.2s',
            }}
          >
            {SI(Icons.Key, 15, '#000')} Verify Delivery
          </button>
        )}

        {status === 'DELIVERED' && (
          <div style={{ padding: '9px 18px', borderRadius: '10px', background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', color: '#34d399', fontWeight: '700', fontSize: '0.84rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
            🎉 Order Completed
          </div>
        )}
      </div>
    </div>
  );
}


/* ── Main Admin Dashboard ──────────────────────────────────────── */
export default function AdminDashboard() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);
  const [verifyOrder, setVerifyOrder] = useState(null);
  const [filter, setFilter] = useState('ALL');
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/api/admin/orders`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setOrders(data);
      } else {
        showToast('Failed to fetch orders from backend.', 'error');
      }
    } catch {
      showToast('Cannot reach backend. Is it running on port 8082?', 'error');
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const handleApprove = async (id) => {
    setActionLoading(id);
    try {
      const res = await fetch(`${API_URL}/api/admin/approve/${id}`, { method: 'PUT' });
      if (res.ok) {
        const updated = await res.json();
        setOrders(prev => prev.map(o => o.id === id ? updated : o));
        showToast(`✅ Order #${id} approved! Delivery code: ${updated.deliveryCode}`, 'success');
      } else {
        showToast('Failed to approve order.', 'error');
      }
    } catch {
      showToast('Network error.', 'error');
    }
    setActionLoading(null);
  };

  const handleShip = async (id) => {
    setActionLoading(id);
    try {
      const res = await fetch(`${API_URL}/api/admin/ship/${id}`, { method: 'PUT' });
      if (res.ok) {
        const updated = await res.json();
        setOrders(prev => prev.map(o => o.id === id ? updated : o));
        showToast(`📦 Order #${id} marked as Shipped!`, 'success');
      } else {
        showToast('Failed to ship order.', 'error');
      }
    } catch {
      showToast('Network error.', 'error');
    }
    setActionLoading(null);
  };

  const handleVerifySuccess = (updated) => {
    setOrders(prev => prev.map(o => o.id === updated.id ? updated : o));
    setVerifyOrder(null);
    showToast(`🎉 Delivery verified for Order #${updated.id}!`, 'success');
  };

  const filteredOrders = filter === 'ALL'
    ? orders
    : orders.filter(o => (o.orderStatus || 'PENDING') === filter);

  const counts = {
    ALL: orders.length,
    PENDING: orders.filter(o => !o.orderStatus || o.orderStatus === 'PENDING').length,
    APPROVED: orders.filter(o => o.orderStatus === 'APPROVED').length,
    SHIPPED: orders.filter(o => o.orderStatus === 'SHIPPED').length,
    DELIVERED: orders.filter(o => o.orderStatus === 'DELIVERED').length,
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0a0f1e 0%, #0f172a 40%, #1a0a2e 100%)',
      color: '#f8fafc',
      fontFamily: "'Inter', 'Segoe UI', sans-serif",
    }}>
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0px' }}>
      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed', top: '20px', right: '20px', zIndex: 9999,
          background: toast.type === 'success' ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)',
          border: `1px solid ${toast.type === 'success' ? 'rgba(16,185,129,0.4)' : 'rgba(239,68,68,0.4)'}`,
          color: toast.type === 'success' ? '#34d399' : '#f87171',
          padding: '12px 20px', borderRadius: '12px', fontWeight: '600', fontSize: '0.9rem',
          backdropFilter: 'blur(10px)', boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
          animation: 'fadeIn 0.3s ease',
          maxWidth: '380px',
        }}>
          {toast.msg}
        </div>
      )}

      {/* Verify Modal */}
      {verifyOrder && (
        <VerifyModal
          order={verifyOrder}
          onClose={() => setVerifyOrder(null)}
          onSuccess={handleVerifySuccess}
        />
      )}



        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px', marginBottom: '32px' }}>
          <StatCard label="Total Orders"    value={counts.ALL}       icon={Icons.List}    color="#a78bfa" />
          <StatCard label="Pending"         value={counts.PENDING}   icon={Icons.Package} color="#fbbf24" />
          <StatCard label="Approved"        value={counts.APPROVED}  icon={Icons.Check}   color="#22d3ee" />
          <StatCard label="Shipped"         value={counts.SHIPPED}   icon={Icons.Truck}   color="#818cf8" />
          <StatCard label="Delivered"       value={counts.DELIVERED} icon={Icons.Shield}  color="#34d399" />
        </div>

        {/* Filter tabs */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', flexWrap: 'wrap' }}>
          {['ALL', 'PENDING', 'APPROVED', 'SHIPPED', 'DELIVERED'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                padding: '8px 18px', borderRadius: '20px', border: `1px solid ${filter === f ? 'rgba(124,58,237,0.5)' : 'rgba(255,255,255,0.08)'}`,
                background: filter === f ? 'rgba(124,58,237,0.15)' : 'transparent',
                color: filter === f ? '#a78bfa' : '#64748b',
                fontWeight: '700', fontSize: '0.78rem', cursor: 'pointer',
                letterSpacing: '0.04em', textTransform: 'uppercase', transition: 'all 0.2s',
              }}
            >
              {f} ({f === 'ALL' ? counts.ALL : counts[f] ?? 0})
            </button>
          ))}
        </div>

        {/* Orders list */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '80px 0' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '16px', animation: 'spin 1s linear infinite', display: 'inline-block' }}>⟳</div>
            <div style={{ color: '#64748b', fontSize: '0.9rem' }}>Loading orders...</div>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div style={{
            textAlign: 'center', padding: '80px 40px',
            background: 'rgba(255,255,255,0.02)', border: '1px dashed rgba(255,255,255,0.08)', borderRadius: '20px',
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '16px' }}>📭</div>
            <div style={{ fontSize: '1.1rem', fontWeight: '700', color: '#475569', marginBottom: '8px' }}>No {filter !== 'ALL' ? filter.toLowerCase() : ''} orders found</div>
            <div style={{ fontSize: '0.84rem', color: '#334155' }}>
              {filter === 'ALL' ? 'Orders will appear here once retailers create pool orders.' : `No orders with status "${filter}" at the moment.`}
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {filteredOrders.map(order => (
              <OrderCard
                key={order.id}
                order={order}
                onApprove={handleApprove}
                onShip={handleShip}
                onVerify={setVerifyOrder}
                loading={actionLoading}
              />
            ))}
          </div>
        )}
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        @keyframes fadeIn { from { opacity:0; transform:translateY(-8px); } to { opacity:1; transform:translateY(0); } }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 6px; } ::-webkit-scrollbar-track { background: transparent; } ::-webkit-scrollbar-thumb { background: rgba(124,58,237,0.3); border-radius: 3px; }
      `}</style>
    </div>
  );
}
