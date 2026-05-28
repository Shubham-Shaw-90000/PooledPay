
import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminDashboard from './admin/AdminDashboard';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8082';

// ─── ICONS (inline SVG — no extra dep) ──────────────────────────
const Icon = {
  ShoppingBag: (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>,
  Layers:      (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>,
  Cpu:         (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="4" width="16" height="16" rx="2"/><rect x="9" y="9" width="6" height="6"/><line x1="9" y1="1" x2="9" y2="4"/><line x1="15" y1="1" x2="15" y2="4"/><line x1="9" y1="20" x2="9" y2="23"/><line x1="15" y1="20" x2="15" y2="23"/><line x1="20" y1="9" x2="23" y2="9"/><line x1="20" y1="14" x2="23" y2="14"/><line x1="1" y1="9" x2="4" y2="9"/><line x1="1" y1="14" x2="4" y2="14"/></svg>,
  Truck:       (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>,
  Activity:    (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>,
  User:        (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  Users:       (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>,
  LogOut:      (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>,
  Check:       (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>,
  CheckCircle: (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>,
  XCircle:     (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>,
  Star:        (p) => <svg {...p} viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="0"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
  TrendDown:   (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 18 13.5 8.5 8.5 13.5 1 6"/><polyline points="17 18 23 18 23 12"/></svg>,
  PlusCircle:  (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>,
  Refresh:     (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"/></svg>,
  CreditCard:  (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>,
  Zap:         (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>,
  Shield:      (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
  BarChart:    (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/><line x1="2" y1="20" x2="22" y2="20"/></svg>,
  Package:     (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="16.5" y1="9.4" x2="7.5" y2="4.21"/><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 002 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>,
  Wallet:      (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 12V22H4a2 2 0 01-2-2V6a2 2 0 012-2h16v4"/><path d="M22 12H18a2 2 0 000 4h4V12z"/></svg>,
  ArrowUp:     (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/></svg>,
  ArrowDown:   (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><polyline points="19 12 12 19 5 12"/></svg>,
};

function SI(C, size=18, color) {
  return <C width={size} height={size} style={{ color, flexShrink: 0 }} />;
}

// ─── JWT DECODE ──────────────────────────────────────────────────
function decodeJwt(token) {
  try {
    const b64 = token.split('.')[1].replace(/-/g,'+').replace(/_/g,'/');
    return JSON.parse(decodeURIComponent(atob(b64).split('').map(c=>'%'+('00'+c.charCodeAt(0).toString(16)).slice(-2)).join('')));
  } catch { return null; }
}

// ─── RAZORPAY LOADER ─────────────────────────────────────────────
function loadRazorpay() {
  return new Promise((resolve) => {
    if (window.Razorpay) { resolve(true); return; }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload  = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

// ─── MOCK DATA ───────────────────────────────────────────────────
const MOCK_PRODUCTS = [
  { id: 1, name: 'Paracetamol 500mg (Pack of 100)', category: 'Pharma', basePrice: 240, originalPrice: 240, groupPrice: 168, stock: 5000, availableQuantity: 5000, minOrderQuantity: 10, unit: 'packs', deliveryTimeEstimate: '2-3', supplierId: 201 },
  { id: 2, name: 'Dettol Antiseptic Liquid 500ml', category: 'FMCG', basePrice: 185, originalPrice: 185, groupPrice: 130, stock: 2000, availableQuantity: 2000, minOrderQuantity: 5, unit: 'bottles', deliveryTimeEstimate: '3-4', supplierId: 203 },
  { id: 3, name: 'Azithromycin 250mg (Pack of 10)', category: 'Pharma', basePrice: 320, originalPrice: 320, groupPrice: 210, stock: 1500, availableQuantity: 1500, minOrderQuantity: 10, unit: 'packs', deliveryTimeEstimate: '2-3', supplierId: 202 },
  { id: 4, name: 'ORS Electrolyte Sachets (Box/20)', category: 'Pharma', basePrice: 140, originalPrice: 140, groupPrice: 95, stock: 8000, availableQuantity: 8000, minOrderQuantity: 20, unit: 'boxes', deliveryTimeEstimate: '1-2', supplierId: 204 },
  { id: 5, name: 'Lifebuoy Soap Bar (12 pack)', category: 'FMCG', basePrice: 280, originalPrice: 280, groupPrice: 195, stock: 3000, availableQuantity: 3000, minOrderQuantity: 8, unit: 'packs', deliveryTimeEstimate: '4-5', supplierId: 203 },
  { id: 6, name: 'Cetirizine 10mg (Strip of 10)', category: 'Pharma', basePrice: 55, originalPrice: 55, groupPrice: 38, stock: 6000, availableQuantity: 6000, minOrderQuantity: 50, unit: 'strips', deliveryTimeEstimate: '2', supplierId: 201 },
];

// Pool deadline = 24 hours after creation
const POOL_LIFETIME_MS = 24 * 60 * 60 * 1000; // 1 day
function poolDeadline(createdAt) {
  if (!createdAt) return new Date(Date.now() + POOL_LIFETIME_MS);
  const d = new Date(createdAt);
  return new Date((isNaN(d.getTime()) ? Date.now() : d.getTime()) + POOL_LIFETIME_MS);
}

const MOCK_POOLS = [
  { id: 101, productId: 1, status: 'ACTIVE', participantsCount: 7, currentQuantity: 77, maxQuantity: 100, deliveryStatus: null, createdAt: new Date(Date.now()-3600000*2).toISOString(), supplierId: 201, location: 'Mumbai' },
  { id: 102, productId: 3, status: 'SUPPLIER_ASSIGNED', participantsCount: 12, currentQuantity: 120, maxQuantity: 150, deliveryStatus: 'PREPARING', createdAt: new Date(Date.now()-3600000*18).toISOString(), supplierId: 202, location: 'Mumbai' },
  { id: 103, productId: 5, status: 'DELIVERED', participantsCount: 9, currentQuantity: 90, maxQuantity: 90, deliveryStatus: 'DELIVERED', createdAt: new Date(Date.now()-3600000*48).toISOString(), supplierId: 203, location: 'Delhi' },
];

const MOCK_SUPPLIERS = [
  { id: 201, name: 'PharmaCorp India', category: 'Pharma', rating: 4.8, activeOrdersCount: 2, capacity: 50 },
  { id: 202, name: 'Global BioPharma', category: 'Pharma', rating: 4.5, activeOrdersCount: 0, capacity: 30 },
  { id: 203, name: 'Apex FMCG Distributors', category: 'FMCG', rating: 4.9, activeOrdersCount: 4, capacity: 80 },
  { id: 204, name: 'Medix Wholesale', category: 'Pharma', rating: 4.7, activeOrdersCount: 1, capacity: 40 },
];

const INITIAL_CASHFLOW = [
  { type: 'INFLOW', description: 'Weekly Pharmacy Sales', amount: 52000, date: '2 days ago' },
  { type: 'OUTFLOW', description: 'Monthly Supplier Payment', amount: 15000, date: '5 days ago' },
  { type: 'INFLOW', description: 'OTC Counter Revenue', amount: 18000, date: '1 week ago' },
  { type: 'OUTFLOW', description: 'Staff Salaries', amount: 22000, date: '1 week ago' },
];

// ─── HELPERS ─────────────────────────────────────────────────────
const statusColor = {
  ACTIVE:            { bg: 'rgba(6,182,212,0.12)',   c: '#22d3ee', border: 'rgba(6,182,212,0.25)' },
  CLOSED:            { bg: 'rgba(124,58,237,0.12)',  c: '#a78bfa', border: 'rgba(124,58,237,0.25)' },
  SUPPLIER_ASSIGNED: { bg: 'rgba(245,158,11,0.12)',  c: '#fbbf24', border: 'rgba(245,158,11,0.25)' },
  DELIVERED:         { bg: 'rgba(16,185,129,0.12)',  c: '#34d399', border: 'rgba(16,185,129,0.25)' },
  PREPARING:         { bg: 'rgba(245,158,11,0.12)',  c: '#fbbf24', border: 'rgba(245,158,11,0.25)' },
  SHIPPED:           { bg: 'rgba(6,182,212,0.12)',   c: '#22d3ee', border: 'rgba(6,182,212,0.25)' },
};

function StatusBadge({ status }) {
  const s = statusColor[status] || statusColor.ACTIVE;
  const icons = { ACTIVE:'🟢', CLOSED:'🔒', SUPPLIER_ASSIGNED:'🚚', DELIVERED:'✅', PREPARING:'⚙️', SHIPPED:'📦' };
  return (
    <span style={{ background: s.bg, color: s.c, border: `1px solid ${s.border}`, padding: '3px 10px', borderRadius: '20px', fontSize: '0.74rem', fontWeight: '700', letterSpacing: '0.04em', textTransform: 'uppercase', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
      <span style={{ fontSize: '0.7rem' }}>{icons[status] || '•'}</span> {status?.replace('_', ' ')}
    </span>
  );
}

function savePct(orig, grp) { return Math.round((1 - grp / orig) * 100); }

// ─── COUNTDOWN TIMER COMPONENT ──────────────────────────────────
function CountdownTimer({ deadline, compact = false }) {
  const [remaining, setRemaining] = useState(() => Math.max(0, new Date(deadline) - Date.now()));

  useEffect(() => {
    const interval = setInterval(() => {
      const r = Math.max(0, new Date(deadline) - Date.now());
      setRemaining(r);
    }, 1000);
    return () => clearInterval(interval);
  }, [deadline]);

  if (remaining <= 0) return <span style={{ color: 'var(--danger)', fontWeight: '700', fontSize: compact ? '0.72rem' : '0.82rem' }}>⏰ Expired</span>;

  const hours   = Math.floor(remaining / 3600000);
  const minutes = Math.floor((remaining % 3600000) / 60000);
  const seconds = Math.floor((remaining % 60000) / 1000);
  const pct     = Math.max(0, remaining / POOL_LIFETIME_MS);
  const urgent  = remaining < 3 * 3600000; // last 3 hours
  const clr     = urgent ? 'var(--danger)' : remaining < 8 * 3600000 ? 'var(--warning)' : 'var(--accent)';

  if (compact) {
    return (
      <span style={{ color: clr, fontWeight: '700', fontSize: '0.72rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
        {urgent ? '🔥' : '⏱'} {hours}h {minutes}m {seconds}s
      </span>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
          {urgent ? '🔥 Closing soon' : '⏱ Closes in'}
        </span>
        <span style={{ fontSize: '0.88rem', fontWeight: '800', color: clr, fontFamily: 'JetBrains Mono, monospace' }}>
          {String(hours).padStart(2,'0')}:{String(minutes).padStart(2,'0')}:{String(seconds).padStart(2,'0')}
        </span>
      </div>
      <div style={{ height: '4px', background: 'rgba(255,255,255,0.06)', borderRadius: '2px', overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${pct * 100}%`, background: `linear-gradient(to right, ${clr}, ${clr}88)`, borderRadius: '2px', transition: 'width 1s linear' }} />
      </div>
    </div>
  );
}

// ─── LIVE TICKER ─────────────────────────────────────────────────
function LiveTicker() {
  const items = ['💊 Paracetamol pool closed — 7 retailers saved ₹504 each', '🚚 Dettol batch shipped from PharmaCorp', '📈 New pool forming for Azithromycin — join now!', '✅ ORS Electrolytes delivered to 12 retailers', '🏆 Total savings generated this week: ₹38,420'];
  const txt = items.join('   ·   ');
  return (
    <div style={{ background: 'rgba(124,58,237,0.08)', borderBottom: '1px solid rgba(124,58,237,0.15)', padding: '7px 0', overflow: 'hidden', position: 'relative' }}>
      <div style={{ display: 'flex', whiteSpace: 'nowrap', animation: 'ticker 28s linear infinite' }}>
        <span style={{ fontSize: '0.78rem', color: '#c4b5fd', paddingRight: '60px' }}>{txt}</span>
        <span style={{ fontSize: '0.78rem', color: '#c4b5fd', paddingRight: '60px' }}>{txt}</span>
      </div>
    </div>
  );
}

// ─── ORDER STEPPER ───────────────────────────────────────────────
function OrderStepper({ pool }) {
  const steps = [
    { label: 'Order Placed', done: true },
    { label: 'Pool Active',  done: pool.status !== 'ACTIVE' || true },
    { label: 'Supplier Assigned', done: pool.status === 'SUPPLIER_ASSIGNED' || pool.status === 'DELIVERED' },
    { label: 'Delivered',   done: pool.deliveryStatus === 'DELIVERED' || pool.status === 'DELIVERED' },
  ];
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0', padding: '16px 0', position: 'relative' }}>
      {/* connector line */}
      <div style={{ position: 'absolute', top: '26px', left: '14px', right: '14px', height: '2px', background: 'rgba(255,255,255,0.06)', zIndex: 0 }} />
      {steps.map((s, i) => (
        <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 1, gap: '8px' }}>
          <div style={{
            width: '32px', height: '32px', borderRadius: '50%',
            background: s.done ? 'linear-gradient(135deg, #10b981, #34d399)' : 'rgba(255,255,255,0.05)',
            border: s.done ? 'none' : '1px solid rgba(255,255,255,0.1)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: s.done ? '#000' : '#64748b',
            boxShadow: s.done ? '0 0 12px rgba(16,185,129,0.4)' : 'none',
            transition: 'all 0.4s ease',
          }}>
            {s.done ? SI(Icon.Check, 14) : <span style={{ fontSize: '0.7rem', fontWeight: '700' }}>{i+1}</span>}
          </div>
          <span style={{ fontSize: '0.72rem', textAlign: 'center', color: s.done ? 'var(--text-sub)' : 'var(--text-muted)', fontWeight: s.done ? '600' : '400', lineHeight: 1.3 }}>{s.label}</span>
        </div>
      ))}
    </div>
  );
}

// ─── CHECKOUT MODAL (Razorpay + Unit Selection) ──────────────────
function CheckoutModal({ product, supplier, mode = 'create', pool = null, token, onClose, onSuccess }) {
  const minQty = product.minRetailerQuantity || 1;
  const poolMinQty = product.minOrderQuantity || 1;
  const [qty, setQty]           = useState(minQty);
  const [result, setResult]     = useState(null);
  const [loading, setLoading]   = useState(false);
  const [rzpReady, setRzpReady] = useState(false);

  const baseP   = product.basePrice || product.originalPrice || 0;
  const groupP  = product.groupPrice || 0;
  const total   = groupP * qty;
  const original = baseP * qty;
  const saved    = original - total;
  const isJoin   = mode === 'join';

  const maxOrderable = isJoin && pool 
    ? (pool.maxQuantity - pool.currentQuantity) 
    : (product.totalStockQuantity != null ? product.totalStockQuantity : product.availableQuantity || 1000);

  const isExceeded = qty > maxOrderable;

  useEffect(() => { loadRazorpay().then(ok => setRzpReady(ok)); }, []);

  const payViaRazorpay = () => {
    if (!rzpReady || !window.Razorpay) {
      alert('Razorpay SDK could not load. Check your internet connection.');
      return;
    }
    setLoading(true);
    const options = {
      key: 'rzp_test_S8rRrLNJ4qpXGT',  // ⚠️ Replace with your Razorpay Test Key ID
      amount: total * 100,
      currency: 'INR',
      name: 'PooledPay',
      description: `${isJoin ? 'Join Pool' : 'Create Pool'}: ${product.name} × ${qty} ${product.unit || 'units'}`,
      handler(response) {
        setLoading(false);
        setResult({ ok: true, total, saved, pct: savePct(baseP, groupP), qty, paymentId: response.razorpay_payment_id });
        onSuccess({ productId: product.id, outflow: total, qty, poolId: pool?.id ?? null });
      },
      prefill: {
        name: localStorage.getItem('username') || 'Retailer',
        email: 'retailer@pooledpay.in',
        contact: '9000000000',
      },
      notes: { product: product.name, qty, mode },
      theme: { color: '#7c3aed' },
      modal: { ondismiss: () => setLoading(false) },
    };
    const rzp = new window.Razorpay(options);
    rzp.on('payment.failed', (resp) => {
      setLoading(false);
      setResult({ ok: false, error: resp.error?.description || 'Payment declined' });
    });
    rzp.open();
  };

  const payViaBNPL = () => {
    setResult({ ok: true, total, saved, pct: savePct(baseP, groupP), qty, method: 'BNPL' });
    onSuccess({ productId: product.id, outflow: total, qty, poolId: pool?.id ?? null });
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px', backdropFilter: 'blur(6px)' }}>
      <div className="glass-intense animate-fade-in-scale" style={{ width: '100%', maxWidth: '500px', padding: '36px 32px' }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: isJoin ? 'rgba(6,182,212,0.1)' : 'rgba(124,58,237,0.1)', border: `1px solid ${isJoin ? 'rgba(6,182,212,0.3)' : 'rgba(124,58,237,0.3)'}`, borderRadius: '20px', padding: '3px 10px', fontSize: '0.72rem', fontWeight: '700', color: isJoin ? 'var(--accent)' : '#a78bfa', marginBottom: '8px' }}>
              {isJoin ? '🙌 Joining Pool' : '🚀 Creating New Pool'}
            </div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: '700', marginBottom: '4px' }}>{product.name}</h3>
            {supplier && (
              <p style={{ fontSize: '0.78rem', color: 'var(--accent)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                🚚 <strong>{supplier.name}</strong> · ⭐ {supplier.rating}
              </p>
            )}
          </div>
          <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid var(--border)', color: 'var(--text-muted)', width: '32px', height: '32px', borderRadius: '8px', cursor: 'pointer', fontSize: '1rem', display:'flex', alignItems:'center', justifyContent:'center' }}>✕</button>
        </div>

        {!result ? (
          <>
            {/* Pool context for join mode */}
            {isJoin && pool && (
              <div style={{ background: 'rgba(6,182,212,0.06)', border: '1px solid rgba(6,182,212,0.2)', borderRadius: 'var(--radius-sm)', padding: '12px 14px', marginBottom: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--accent)', fontWeight: '600', fontSize: '0.82rem', marginBottom: '3px' }}>
                  <span>Pool #{pool.id} · {pool.location || 'Your area'}</span>
                  <span>👥 {pool.participantsCount} retailers in</span>
                </div>
                <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                  {pool.currentQuantity || 0} / {pool.maxQuantity || '?'} units pooled so far (Min target: {poolMinQty})
                </div>
              </div>
            )}

            {/* Unit input */}
            <div style={{ marginBottom: '18px' }}>
              <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '6px' }}>
                How many units do you want to order?
              </label>
              <input
                type="number"
                min={minQty}
                value={qty}
                onChange={e => setQty(Math.max(minQty, +e.target.value || minQty))}
                className="input-field"
                style={{ fontSize: '1.1rem', fontWeight: '700' }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '5px' }}>
                <span>Min per retailer: <strong style={{ color: 'var(--warning)' }}>{minQty} {product.unit}</strong></span>
                <span>Pool price: <strong style={{ color: 'var(--success)' }}>₹{groupP} / unit</strong></span>
              </div>
              {isExceeded && (
                <div style={{ color: 'var(--danger)', fontSize: '0.78rem', marginTop: '6px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  ⚠️ Order exceeds the maximum available capacity of {maxOrderable} {product.unit || 'units'}!
                </div>
              )}
              <div style={{ marginTop: '6px', fontSize: '0.7rem', color: 'var(--text-muted)', background: 'rgba(124,58,237,0.06)', border: '1px solid rgba(124,58,237,0.15)', borderRadius: '6px', padding: '6px 10px' }}>
                ℹ️ Wholesaler pool min target is <strong style={{ color: '#a78bfa' }}>{poolMinQty} units</strong> overall. Individual order min is <strong style={{ color: '#a78bfa' }}>{minQty} units</strong>.
              </div>
            </div>

            {/* Bill summary */}
            <div style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '16px', marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '8px' }}>
                <span>MRP × {qty} units</span>
                <span style={{ textDecoration: 'line-through', color: 'var(--danger)' }}>₹{original}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem', fontWeight: '600', marginBottom: '8px' }}>
                <span>Pool Price × {qty}</span>
                <span style={{ color: 'var(--success)' }}>₹{total}</span>
              </div>
              <div style={{ borderTop: '1px dashed rgba(255,255,255,0.06)', paddingTop: '8px', display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', fontWeight: '700', color: 'var(--accent)' }}>
                <span>🎉 Your Savings</span>
                <span>₹{saved} ({savePct(baseP, groupP)}% OFF)</span>
              </div>
            </div>

            {/* Payment buttons */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button
                id="razorpay-pay-btn"
                onClick={payViaRazorpay}
                disabled={loading || !rzpReady || isExceeded}
                style={{
                  width: '100%', padding: '14px 18px',
                  border: 'none', borderRadius: 'var(--radius-sm)',
                  background: loading || isExceeded ? 'rgba(255,255,255,0.05)' : 'linear-gradient(135deg, #072654 0%, #1a66ff 100%)',
                  color: loading || isExceeded ? 'var(--text-muted)' : '#fff', fontWeight: '700', fontSize: '0.95rem',
                  cursor: loading || isExceeded ? 'not-allowed' : 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                  boxShadow: loading || isExceeded ? 'none' : '0 4px 18px rgba(26,102,255,0.35)',
                  transition: 'all 0.2s',
                }}
              >
                {loading ? '⏳ Opening Razorpay…' : (
                  <>
                    <span style={{ fontSize: '1.15rem' }}>💳</span>
                    Pay ₹{total} via Razorpay
                    {!rzpReady && <span style={{ fontSize: '0.7rem', opacity: 0.6 }}>(loading…)</span>}
                  </>
                )}
              </button>

              <button
                id="bnpl-pay-btn"
                onClick={payViaBNPL}
                disabled={loading || isExceeded}
                style={{
                  width: '100%', padding: '11px 18px',
                  border: isExceeded ? '1px solid rgba(255,255,255,0.05)' : '1px solid rgba(6,182,212,0.3)', borderRadius: 'var(--radius-sm)',
                  background: isExceeded ? 'rgba(255,255,255,0.02)' : 'rgba(6,182,212,0.06)', color: isExceeded ? 'var(--text-muted)' : 'var(--accent)',
                  fontWeight: '600', fontSize: '0.88rem',
                  cursor: loading || isExceeded ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                  transition: 'all 0.2s',
                  opacity: isExceeded ? 0.5 : 1,
                }}
              >
                🕐 BNPL — Pay ₹{total} within 15 days · Zero interest
              </button>

              <p style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textAlign: 'center', lineHeight: 1.5, margin: 0 }}>
                🔒 Payments secured by Razorpay. 256-bit SSL encryption.
              </p>
            </div>
          </>
        ) : (
          <div className="animate-fade-in" style={{ textAlign: 'center', padding: '20px 0' }}>
            {result.ok ? (
              <>
                <div style={{ fontSize: '4rem', marginBottom: '16px', animation: 'float 2s ease-in-out infinite' }}>🎉</div>
                <h3 style={{ color: 'var(--success)', fontSize: '1.3rem', fontWeight: '800', marginBottom: '8px' }}>
                  {isJoin ? 'You Joined the Pool!' : 'Pool Created!'}
                </h3>
                {result.paymentId && (
                  <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '10px', fontFamily: 'JetBrains Mono, monospace', wordBreak: 'break-all' }}>
                    Txn: {result.paymentId}
                  </p>
                )}
                {result.method === 'BNPL' && (
                  <div style={{ background: 'rgba(6,182,212,0.08)', border: '1px solid rgba(6,182,212,0.2)', borderRadius: '8px', padding: '8px 14px', fontSize: '0.8rem', color: 'var(--accent)', marginBottom: '12px' }}>
                    🕐 BNPL activated — ₹{result.total} due within 15 days of delivery.
                  </div>
                )}
                <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginBottom: '20px', lineHeight: 1.6 }}>
                  You ordered <strong style={{ color: 'var(--text-main)' }}>{result.qty} {product.unit}</strong> and paid <strong style={{ color: 'var(--text-main)' }}>₹{result.total}</strong>.
                  Saved <strong style={{ color: 'var(--success)' }}>₹{result.saved}</strong> ({result.pct}%) vs MRP.
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', marginBottom: '24px' }}>
                  <div style={{ background: 'var(--success-soft)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 'var(--radius-sm)', padding: '12px' }}>
                    <div style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--success)' }}>₹{result.saved}</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Saved</div>
                  </div>
                  <div style={{ background: 'var(--accent-soft)', border: '1px solid rgba(6,182,212,0.2)', borderRadius: 'var(--radius-sm)', padding: '12px' }}>
                    <div style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--accent)' }}>{result.qty}</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Units ordered</div>
                  </div>
                  <div style={{ background: 'var(--primary-soft)', border: '1px solid rgba(124,58,237,0.2)', borderRadius: 'var(--radius-sm)', padding: '12px' }}>
                    <div style={{ fontSize: '1.2rem', fontWeight: '800', color: '#a78bfa' }}>{result.pct}%</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Discount</div>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div style={{ fontSize: '4rem', marginBottom: '16px' }}>❌</div>
                <h3 style={{ color: 'var(--danger)', fontSize: '1.3rem', fontWeight: '800', marginBottom: '8px' }}>Payment Failed</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '24px' }}>{result.error || 'Transaction was declined. Please retry.'}</p>
              </>
            )}
            <button onClick={onClose} className="btn btn-outline btn-full">Close</button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── ADD PRODUCT FORM (SUPPLIER) ─────────────────────────────────
function AddProductForm({ token, onSuccess }) {
  const [formData, setFormData] = useState({
    name: '', category: 'Pharma', description: '', unit: 'kg',
    basePrice: '', groupPrice: '', totalStockQuantity: '',
    minOrderQuantity: '', minRetailerQuantity: '1', availableQuantity: '', deliveryTimeEstimate: '', batchSize: ''
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const uid = localStorage.getItem('userId');
      const payload = { 
        ...formData, 
        basePrice: +formData.basePrice, 
        groupPrice: +formData.groupPrice,
        totalStockQuantity: +formData.totalStockQuantity,
        minOrderQuantity: +formData.minOrderQuantity,
        minRetailerQuantity: +formData.minRetailerQuantity || 1,
        availableQuantity: +formData.availableQuantity,
        batchSize: +formData.batchSize || 0,
        deliveryTimeEstimate: formData.deliveryTimeEstimate || null,
        supplierId: uid ? Number(uid) : 1
      };
      console.log('[AddProduct] Submitting payload:', JSON.stringify(payload));
      const res = await fetch(`${API_URL}/api/products/add`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        const saved = await res.json();
        console.log('[AddProduct] Saved:', saved);
        onSuccess(saved);
      } else {
        const errText = await res.text();
        console.error('[AddProduct] Server error:', res.status, errText);
        setError(`Server error (${res.status}): ${errText.slice(0, 200)}`);
      }
    } catch (err) {
      console.error('[AddProduct] Network error:', err);
      setError('Could not reach the backend server. Is it running on port 8080?');
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="glass-panel animate-fade-in" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <h3 style={{ fontSize: '1.2rem', fontWeight: '700', marginBottom: '8px' }}>Add New Product Batch</h3>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        <div><label className="text-muted" style={{ fontSize: '0.8rem' }}>Product Name</label><input required className="input-field" name="name" onChange={handleChange} /></div>
        <div><label className="text-muted" style={{ fontSize: '0.8rem' }}>Category</label><select className="input-field" name="category" onChange={handleChange}><option>Pharma</option><option>FMCG</option><option>Grocery</option></select></div>
        <div><label className="text-muted" style={{ fontSize: '0.8rem' }}>Description</label><input className="input-field" name="description" onChange={handleChange} /></div>
        <div><label className="text-muted" style={{ fontSize: '0.8rem' }}>Unit (e.g. kg, liters, strips)</label><input required className="input-field" name="unit" onChange={handleChange} /></div>
        <div><label className="text-muted" style={{ fontSize: '0.8rem' }}>Individual Base Price (₹)</label><input required type="number" className="input-field" name="basePrice" onChange={handleChange} /></div>
        <div><label className="text-muted" style={{ fontSize: '0.8rem' }}>Pooled Group Price (₹)</label><input required type="number" className="input-field" name="groupPrice" onChange={handleChange} /></div>
        <div><label className="text-muted" style={{ fontSize: '0.8rem' }}>Total Stock Quantity</label><input required type="number" className="input-field" name="totalStockQuantity" onChange={handleChange} /></div>
        <div><label className="text-muted" style={{ fontSize: '0.8rem' }}>Min Pool Order Quantity (Total to Fulfill)</label><input required type="number" className="input-field" name="minOrderQuantity" onChange={handleChange} /></div>
        <div><label className="text-muted" style={{ fontSize: '0.8rem' }}>Min Retailer Quantity (Per Retailer Order)</label><input required type="number" className="input-field" name="minRetailerQuantity" defaultValue="1" onChange={handleChange} /></div>
        <div><label className="text-muted" style={{ fontSize: '0.8rem' }}>Available Quantity</label><input required type="number" className="input-field" name="availableQuantity" onChange={handleChange} /></div>
        <div><label className="text-muted" style={{ fontSize: '0.8rem' }}>Delivery Time Estimate (days)</label><input className="input-field" name="deliveryTimeEstimate" onChange={handleChange} /></div>
        <div><label className="text-muted" style={{ fontSize: '0.8rem' }}>Batch Size</label><input type="number" className="input-field" name="batchSize" onChange={handleChange} /></div>
      </div>
      <button type="submit" disabled={loading} className="btn btn-accent" style={{ marginTop: '10px' }}>{loading ? 'Saving...' : 'Publish Product'}</button>
      {error && (
        <div style={{ marginTop: '8px', padding: '12px 16px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 'var(--radius-sm)', color: 'var(--danger)', fontSize: '0.84rem', lineHeight: 1.5 }}>
          ⚠️ {error}
        </div>
      )}
    </form>
  );
}

// ─── SUPPLIER ASSIGNMENT MODAL ───────────────────────────────────
function AssignModal({ pool, suppliers, onAssign, onClose }) {
  const product = MOCK_PRODUCTS.find(p => p.id === pool.productId) || {};
  const reqCat  = product.category || 'Pharma';

  const score = (sup) => {
    let s = 100;
    if (sup.category.toLowerCase() !== reqCat.toLowerCase()) s -= 40;
    s -= sup.activeOrdersCount * 8;
    s += (sup.rating - 4.5) * 20;
    if (sup.capacity < 40) s -= 10;
    return Math.max(0, Math.min(100, Math.round(s)));
  };

  const ranked = [...suppliers].map(s => ({ ...s, score: score(s) })).sort((a,b) => b.score - a.score);

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px', backdropFilter: 'blur(6px)' }}>
      <div className="glass-intense animate-fade-in-scale" style={{ width: '100%', maxWidth: '580px', padding: '36px 32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: '700', marginBottom: '4px' }}>Supplier Assignment Optimizer</h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Algorithmic matching · Pool #{pool.id} · {reqCat} category</p>
          </div>
          <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid var(--border)', color: 'var(--text-muted)', width: '32px', height: '32px', borderRadius: '8px', cursor: 'pointer', fontSize: '1rem', display:'flex', alignItems:'center', justifyContent:'center' }}>✕</button>
        </div>

        {/* Scoring legend */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '8px', marginBottom: '20px' }}>
          {[
            { factor: 'Category Match', pts: '+60' },
            { factor: 'Low Busyness',   pts: '+up to 40' },
            { factor: 'High Rating',    pts: '+up to 10' },
            { factor: 'High Capacity',  pts: '+10' },
          ].map(f => (
            <div key={f.factor} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '10px', textAlign: 'center' }}>
              <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginBottom: '2px' }}>{f.factor}</div>
              <div style={{ fontSize: '0.82rem', fontWeight: '700', color: 'var(--accent)' }}>{f.pts}</div>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {ranked.map((sup, i) => {
            const sc = sup.score;
            const clr = sc > 75 ? 'var(--success)' : sc > 50 ? 'var(--warning)' : 'var(--danger)';
            return (
              <div key={sup.id} className="animate-fade-in" style={{ animationDelay: `${i*60}ms`, display: 'flex', alignItems: 'center', gap: '16px', padding: '16px', background: i===0 ? 'rgba(16,185,129,0.05)' : 'rgba(255,255,255,0.01)', border: `1px solid ${i===0 ? 'rgba(16,185,129,0.15)' : 'var(--border)'}`, borderRadius: 'var(--radius-sm)' }}>
                <div style={{ minWidth: '28px', height: '28px', borderRadius: '50%', background: i===0 ? 'var(--success)' : 'rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: '800', color: i===0 ? '#000' : 'var(--text-muted)' }}>
                  #{i+1}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: '600', fontSize: '0.92rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    {sup.name}
                    <span style={{ fontSize: '0.7rem', background: 'rgba(255,255,255,0.05)', color: 'var(--text-muted)', padding: '1px 6px', borderRadius: '4px' }}>{sup.category}</span>
                    {i===0 && <span style={{ fontSize: '0.7rem', background: 'var(--success-soft)', color: 'var(--success)', padding: '1px 7px', borderRadius: '4px', fontWeight: '700' }}>BEST MATCH</span>}
                  </div>
                  <div style={{ display: 'flex', gap: '14px', marginTop: '4px', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    <span>⭐ {sup.rating}</span>
                    <span>📦 {sup.activeOrdersCount} active orders</span>
                    <span>🏭 Cap: {sup.capacity}</span>
                  </div>
                  {/* Score bar */}
                  <div style={{ marginTop: '8px', height: '4px', background: 'rgba(255,255,255,0.06)', borderRadius: '2px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${sc}%`, background: `linear-gradient(to right, ${clr}, ${clr}aa)`, borderRadius: '2px', transition: 'width 0.8s ease' }} />
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '1.3rem', fontWeight: '800', color: clr }}>{sc}%</div>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>match score</div>
                  <button onClick={() => onAssign(pool.id, sup.id, sup.name)} className={`btn btn-sm ${sc > 75 ? 'btn-accent' : 'btn-outline'}`} style={{ marginTop: '8px' }}>
                    Assign
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── AI COPILOT PANEL ────────────────────────────────────────────
function AiCopilot() {
  const [token] = useState(localStorage.getItem('token') || '');
  const [userId] = useState(localStorage.getItem('userId') || '1');
  
  // Predict form state
  const [formData, setFormData] = useState({
    rev: 150000, pay_due: 10000, gst: 5000, sales: 4000, rep_score: 80,
    miss_pay: 0, cash_bal: 50000, up_orders: 15000, ord_freq: 40, credit_used: 20000,
    upi_vol: 80000, ret_rate: 2, pool_save: 5000, inv_turn: 30, grp_ord: 3,
    pay_delay: 2, season_idx: 50, supp_rate: 4.2, credit_ratio: 30, cust_growth: 5
  });
  
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);
  
  // Chat state
  const [messages, setMessages] = useState([
    { text: "Hello! I am your AI Merchant Risk Assistant. You can run a full risk analysis using the form, or chat with me about your cashflow.", sender: "bot" }
  ]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);

  useEffect(() => {
    // Fetch History
    fetch(`${API_URL}/api/ai/history?userId=${userId}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setHistory(data))
      .catch(err => console.error("History fetch error:", err));
  }, [userId, token]);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: Number(e.target.value) });
  };

  const handlePredict = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = { userId: Number(userId), ...formData };
      const res = await fetch(`${API_URL}/api/ai/predict-risk`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        alert("AI Risk Engine Error: " + (data.error || "Failed to generate risk assessment."));
      } else {
        setPrediction(data);
        // Update history
        setHistory(prev => [data, ...prev]);
      }
    } catch (error) {
      console.error("Prediction error:", error);
      alert("Network error: Could not reach the backend server.");
    }
    setLoading(false);
  };

  const handleChatSubmit = async (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userMsg = chatInput;
    setMessages(prev => [...prev, { text: userMsg, sender: "user" }]);
    setChatInput("");
    setChatLoading(true);

    try {
      const res = await fetch(`${API_URL}/api/ai/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ userId, message: userMsg })
      });
      const data = await res.json();
      setMessages(prev => [...prev, { text: data.reply, sender: "bot" }]);
    } catch (error) {
      setMessages(prev => [...prev, { text: "Network error connecting to AI.", sender: "bot" }]);
    }
    setChatLoading(false);
  };

  const getRiskColor = (level) => {
    if (level === "High Risk") return "#ef4444";
    if (level === "Medium Risk") return "#f59e0b";
    return "#10b981";
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: '800', marginBottom: '6px' }}>
          AI Copilot <span style={{ fontSize: '0.8rem', background: 'var(--primary-soft)', color: '#a78bfa', padding: '3px 10px', borderRadius: '20px', verticalAlign: 'middle', fontWeight: '600' }}>v2.0 ML Powered</span>
        </h1>
        <p style={{ color: 'var(--text-muted)' }}>Advanced Random Forest model analysis for merchant risk, cashflow, and group pooling.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '24px', flex: 1 }}>
        {/* LEFT PANEL: Form & History */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          <div className="glass-panel" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              📊 Merchant Data Input
            </h3>
            <form onSubmit={handlePredict}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', maxHeight: '300px', overflowY: 'auto', paddingRight: '10px' }}>
                {Object.entries(formData).map(([key, val]) => (
                  <div key={key} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>{key.replace('_', ' ')}</label>
                    <input type="number" name={key} value={val} onChange={handleInputChange} className="input-field" step="any" required />
                  </div>
                ))}
              </div>
              <button type="submit" className="btn btn-accent btn-full" style={{ marginTop: '16px' }} disabled={loading}>
                {loading ? '🧠 Running ML Analysis...' : 'Generate Risk Prediction'}
              </button>
            </form>
          </div>

          <div className="glass-panel" style={{ padding: '24px', flex: 1 }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '16px' }}>🕒 Prediction History</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '200px', overflowY: 'auto' }}>
              {history.length === 0 ? (
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>No past predictions found.</div>
              ) : (
                history.map((h, i) => (
                  <div key={i} style={{ padding: '12px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontWeight: '600', fontSize: '0.9rem', color: getRiskColor(h.riskLevel || h.risk_level) }}>
                        {h.riskLevel || h.risk_level} (Score: {h.riskScore || h.risk_score})
                      </div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                        Confidence: {((h.confidence || 0) * 100).toFixed(0)}%
                      </div>
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                      {new Date(h.createdAt || Date.now()).toLocaleDateString()}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* RIGHT PANEL: Chatbot & Live Results */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {prediction && (
            <div className="glass-panel animate-fade-in-scale" style={{ padding: '28px', borderTop: `4px solid ${getRiskColor(prediction.risk_level)}`, background: 'linear-gradient(180deg, rgba(255,255,255,0.03) 0%, rgba(0,0,0,0) 100%)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                <div>
                  <h2 style={{ fontSize: '1.5rem', fontWeight: '800', margin: 0, color: getRiskColor(prediction.risk_level) }}>
                    {prediction.risk_level}
                  </h2>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                    Confidence Level: <strong style={{ color: 'var(--text-main)' }}>{((prediction.confidence || 0) * 100).toFixed(1)}%</strong>
                  </div>
                </div>
                <div style={{ width: '60px', height: '60px', borderRadius: '50%', border: `4px solid ${getRiskColor(prediction.risk_level)}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', fontWeight: '800', color: getRiskColor(prediction.risk_level), boxShadow: `0 0 20px ${getRiskColor(prediction.risk_level)}40` }}>
                  {prediction.risk_score}
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ background: 'rgba(255,255,255,0.02)', padding: '12px 16px', borderRadius: '8px', borderLeft: '3px solid var(--warning)' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '4px', fontWeight: '700' }}>Reasoning</div>
                  <ul style={{ margin: 0, paddingLeft: '16px', fontSize: '0.85rem', lineHeight: 1.5 }}>
                    {(prediction.reasons || prediction.reasonsList || []).map((r, i) => <li key={i}>{r}</li>)}
                    {typeof prediction.reasons === 'string' && prediction.reasons.split('|').map((r, i) => <li key={i}>{r.trim()}</li>)}
                  </ul>
                </div>
                <div style={{ background: 'rgba(6,182,212,0.05)', padding: '12px 16px', borderRadius: '8px', borderLeft: '3px solid var(--accent)' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--accent)', textTransform: 'uppercase', marginBottom: '4px', fontWeight: '700' }}>Recommendations</div>
                  <ul style={{ margin: 0, paddingLeft: '16px', fontSize: '0.85rem', lineHeight: 1.5 }}>
                    {(prediction.suggestions || prediction.suggestionsList || []).map((s, i) => <li key={i}>{s}</li>)}
                    {typeof prediction.suggestions === 'string' && prediction.suggestions.split('|').map((s, i) => <li key={i}>{s.trim()}</li>)}
                  </ul>
                </div>
              </div>
            </div>
          )}

          <div className="glass-panel" style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: '16px', borderBottom: '1px solid var(--border)', background: 'rgba(0,0,0,0.2)' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: '700', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                🤖 AI Assistant
              </h3>
            </div>
            
            <div style={{ flex: 1, padding: '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {messages.map((m, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: m.sender === 'user' ? 'flex-end' : 'flex-start' }}>
                  <div style={{
                    maxWidth: '80%', padding: '12px 16px', borderRadius: '12px', fontSize: '0.9rem', lineHeight: 1.5,
                    background: m.sender === 'user' ? 'var(--accent)' : 'rgba(255,255,255,0.05)',
                    color: m.sender === 'user' ? '#fff' : 'var(--text-main)',
                    borderBottomRightRadius: m.sender === 'user' ? '4px' : '12px',
                    borderBottomLeftRadius: m.sender === 'bot' ? '4px' : '12px',
                  }}>
                    {m.text}
                  </div>
                </div>
              ))}
              {chatLoading && (
                <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                  <div style={{ background: 'rgba(255,255,255,0.05)', padding: '12px 16px', borderRadius: '12px', borderBottomLeftRadius: '4px', display: 'flex', gap: '4px' }}>
                    <div className="dot-flashing"></div>
                  </div>
                </div>
              )}
            </div>

            <div style={{ padding: '16px', borderTop: '1px solid var(--border)', background: 'rgba(0,0,0,0.2)' }}>
              <form onSubmit={handleChatSubmit} style={{ display: 'flex', gap: '10px' }}>
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Ask about your risk score or request pooling suggestions..."
                  className="input-field"
                  style={{ flex: 1 }}
                />
                <button type="submit" className="btn btn-primary" disabled={chatLoading}>Send</button>
              </form>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

function VerifyModal({ pool, onClose, onSuccess }) {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8082';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/admin/verify-delivery/${pool.id}?code=${encodeURIComponent(code)}`, {
        method: 'PUT'
      });
      if (res.ok) {
        const updatedPool = await res.json();
        onSuccess(updatedPool);
      } else {
        alert("Invalid code. Please try again.");
      }
    } catch (err) {
      alert("Network error.");
    }
    setLoading(false);
  };

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
      <div className="glass-panel" style={{ padding: '30px', width: '400px', maxWidth: '90%' }}>
        <h3 style={{ marginBottom: '20px', fontSize: '1.2rem', fontWeight: '700' }}>Verify Delivery Code</h3>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '20px' }}>Enter the unique delivery code provided by the retailer to confirm fulfillment of Pool #{pool.id}.</p>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Delivery Code (e.g. PP-4821)"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="input-field"
            style={{ width: '100%', marginBottom: '20px' }}
            required
          />
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
            <button type="button" onClick={onClose} className="btn btn-outline" disabled={loading}>Cancel</button>
            <button type="submit" className="btn btn-success" disabled={loading}>{loading ? 'Verifying...' : 'Verify Delivery'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// ── MAIN DASHBOARD ─────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════
export default function Dashboard() {
  const [token, setToken]         = useState(localStorage.getItem('token') || '');
  const [user, setUser]           = useState({ username: '', role: '' });
  const [activeTab, setActiveTab] = useState('');
  const navigate = useNavigate();

  const [products, setProducts]     = useState(MOCK_PRODUCTS);
  const [myProducts, setMyProducts] = useState([]);   // Supplier's own products
  const [pools, setPools]           = useState(MOCK_POOLS);
  const [suppliers, setSuppliers]   = useState(MOCK_SUPPLIERS);
  const [selectedSupplierId, setSelectedSupplierId] = useState(null);
  const [loading, setLoading]       = useState(false);
  const [toast, setToast]           = useState('');
  const [editingProduct, setEditingProduct] = useState(null); // product being edited

  const [checkout, setCheckout]     = useState(null);   // { product }
  const [assignPool, setAssignPool] = useState(null);   // pool obj
  const [verifyOrder, setVerifyOrder] = useState(null); // pool obj

  // Reset selected supplier drill-down when tab changes
  useEffect(() => {
    setSelectedSupplierId(null);
  }, [activeTab]);

  const getMergedSuppliers = () => {
    const list = [...suppliers];
    const productSupplierIds = [...new Set(products.map(p => p.supplierId).filter(Boolean))];
    
    productSupplierIds.forEach(supId => {
      const exists = list.some(s => Number(s.id) === Number(supId) || Number(s.supplierId) === Number(supId));
      if (!exists) {
        const isSelf = user.role === 'SUPPLIER' && Number(localStorage.getItem('userId')) === Number(supId);
        list.push({
          id: supId,
          supplierId: supId,
          name: isSelf ? (user.username || `Supplier #${supId}`) : `Supplier #${supId}`,
          category: 'Pharma',
          rating: 5.0,
          capacity: 50,
          activeOrdersCount: 0,
          isVirtual: true
        });
      }
    });
    return list;
  };

  // ── Auth guard ─────────────────────────────────────────────────
  useEffect(() => {
    if (!token) { navigate('/login'); return; }
    // Read role from localStorage first (set explicitly on login/signup)
    // Fall back to JWT decode for backward-compat with old sessions
    const storedRole = localStorage.getItem('userRole');
    const storedName = localStorage.getItem('username');
    if (storedRole && storedName) {
      setUser({ username: storedName, role: storedRole });
      setActiveTab(storedRole === 'SUPPLIER' ? 'my-products' : storedRole === 'ADMIN' ? 'admin' : 'marketplace');
      return;
    }
    const dec = decodeJwt(token);
    if (!dec) { localStorage.removeItem('token'); navigate('/login'); return; }
    const role = dec.role || 'RETAILER';
    setUser({ username: dec.sub || 'User', role });
    setActiveTab(role === 'SUPPLIER' ? 'my-products' : role === 'ADMIN' ? 'admin' : 'marketplace');
  }, [token]);

  // ── Data fetch (with mock fallback) ────────────────────────────
  const fetchData = useCallback(async (isSilent = false) => {
    const silent = isSilent === true;
    if (!silent) setLoading(true);
    try {
      const uid = localStorage.getItem('userId') || '1';
      const storedRole = localStorage.getItem('userRole') || user.role;

      const [pRes, poolRes, sRes] = await Promise.all([
        fetch(`${API_URL}/api/products`, { signal: AbortSignal.timeout(3000) }),
        fetch(`${API_URL}/api/pools`, { headers: { Authorization: `Bearer ${token}` }, signal: AbortSignal.timeout(3000) }),
        fetch(`${API_URL}/api/supplier/list`, { signal: AbortSignal.timeout(3000) }),
      ]);
      if (pRes.ok) {
        const prodData = await pRes.json();
        if (prodData.length > 0) setProducts(prodData);
      }
      if (poolRes.ok) {
        const poolData = await poolRes.json();
        if (poolData.length > 0) setPools(poolData);
      }
      if (sRes.ok) {
        const supData = await sRes.json();
        if (supData.length > 0) {
          const normalized = supData.map(s => ({
            ...s,
            id: s.supplierId || s.id
          }));
          setSuppliers(normalized);
        }
      }
      // Fetch supplier's own products
      if (storedRole === 'SUPPLIER') {
        const myRes = await fetch(`${API_URL}/api/products/supplier/${uid}`, { signal: AbortSignal.timeout(3000) });
        if (myRes.ok) setMyProducts(await myRes.json());
      }
    } catch { /* demo fallback */ }
    if (!silent) setLoading(false);
  }, [token, user.role]);

  useEffect(() => {
    if (!token) return;
    fetchData(false); // Initial load
    const interval = setInterval(() => {
      fetchData(true); // Silent update in background
    }, 6000);
    return () => clearInterval(interval);
  }, [token, fetchData]);

  // ── Toast ──────────────────────────────────────────────────────
  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 4000); };

  // ── Handlers ───────────────────────────────────────────────────
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    localStorage.removeItem('username');
    localStorage.removeItem('userId');
    setToken(''); navigate('/login');
  };

  // ── Auto-close pools when deadline or maxQty reached ─────────
  useEffect(() => {
    const interval = setInterval(() => {
      setPools(prev => prev.map(pool => {
        if (pool.status !== 'ACTIVE') return pool;
        const prod = products.find(p => p.id === pool.productId);
        const max  = pool.maxQuantity || prod?.totalStockQuantity || prod?.availableQuantity || Infinity;
        const deadlineReached = Date.now() >= poolDeadline(pool.createdAt).getTime();
        const maxReached      = (pool.currentQuantity || 0) >= max;
        if (deadlineReached || maxReached) {
          const reason = maxReached ? 'max quantity reached' : '1-day deadline';
          showToast(`🔒 Pool #${pool.id} auto-closed (${reason})`);
          return { ...pool, status: 'CLOSED' };
        }
        return pool;
      }));
    }, 5000); // check every 5 seconds
    return () => clearInterval(interval);
  }, [products]);

  // Unified handler: called after Razorpay/BNPL success for both create-pool and join-pool
  const handleCheckoutSuccess = async ({ productId, outflow, qty = 1, poolId }) => {
    const prod = products.find(p => p.id === productId);
    const userId = localStorage.getItem('userId') || '1';

    try {
      const response = await fetch(`${API_URL}/api/pools/order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          userId: Number(userId),
          productId: Number(productId),
          quantity: Number(qty),
          ...(poolId ? { poolId: Number(poolId) } : {})
        })
      });

      if (response.ok) {
        const savedPool = await response.json();
        
        // Update local pools state with the saved/returned Pool from database
        setPools(prev => {
          const exists = prev.some(p => p.id === savedPool.id);
          if (exists) {
            return prev.map(p => p.id === savedPool.id ? savedPool : p);
          } else {
            return [savedPool, ...prev];
          }
        });
        
        // Trigger a silent refresh of other lists (e.g. products' available stock)
        fetchData(true);

        if (poolId) {
          showToast(`🙌 Joined pool! Added ${qty} ${prod?.unit || 'units'} · You are 1 retailer in this pool.`);
        } else {
          showToast(`✅ Pool created with ${qty} ${prod?.unit || 'units'}! Closes in 24h or when ${savedPool.maxQuantity || 1000} total units are pooled.`);
        }
        return;
      } else {
        const errText = await response.text();
        showToast(`❌ Order rejected: ${errText}`, 'danger');
        return;
      }
    } catch (err) {
      console.warn('Network error, falling back to local simulation:', err);
    }

    // ── FALLBACK SIMULATION (For offline or demo JWTs) ─────────────────
    const userLocation = localStorage.getItem('userLocation') || 'Mumbai';
    const activeLocalPool = pools.find(p => p.productId === productId && p.location === userLocation && p.status !== 'CLOSED' && p.status !== 'DELIVERED');

    if (poolId || activeLocalPool) {
      const targetPoolId = poolId || activeLocalPool.id;
      setPools(prev => prev.map(p => {
        if (p.id !== targetPoolId) return p;
        const newQty = (p.currentQuantity || 0) + qty;
        const max    = p.maxQuantity || prod?.totalStockQuantity || prod?.availableQuantity || Infinity;
        if (newQty >= max) {
          showToast(`🔒 Pool #${targetPoolId} auto-closed — max quantity reached!`);
          return { ...p, participantsCount: p.participantsCount + 1, currentQuantity: newQty, status: 'CLOSED' };
        }
        return { ...p, participantsCount: p.participantsCount + 1, currentQuantity: newQty };
      }));
      showToast(`🙌 Joined pool (Demo Fallback)! Added ${qty} ${prod?.unit || 'units'} · You are 1 retailer in this pool.`);
    } else {
      const maxQty   = prod?.totalStockQuantity || prod?.availableQuantity || 1000;
      const createdAt = new Date().toISOString();
      const newPool = {
        id: Date.now(),
        productId,
        status: 'ACTIVE',
        participantsCount: 1,
        currentQuantity: qty,
        maxQuantity: maxQty,
        deliveryStatus: null,
        createdAt,
        supplierId: prod?.supplierId || null,
        location: userLocation,
      };
      setPools(prev => [newPool, ...prev]);
      showToast(`✅ Pool created (Demo Fallback) with ${qty} ${prod?.unit || 'units'}!`);
    }
  };

  const adminStatusUpdate = async (poolId, status) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/api/pools/${poolId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        const updatedPool = await res.json();
        setPools(prev => prev.map(p => p.id === poolId ? updatedPool : p));
        showToast(`⚡ Pool #${poolId} status → ${status}`);
        return;
      }
    } catch (err) {
      console.warn("Backend update failed, falling back to local state:", err);
    }
    setPools(prev => prev.map(p => p.id === poolId ? { ...p, status } : p));
    showToast(`⚡ Pool #${poolId} status → ${status} (Demo)`);
  };

  const assignSupplier = async (poolId, suppId, suppName) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/api/pools/${poolId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          status: 'SUPPLIER_ASSIGNED',
          deliveryStatus: 'PREPARING',
          supplierId: String(suppId)
        })
      });
      if (res.ok) {
        const updatedPool = await res.json();
        setPools(prev => prev.map(p => p.id === poolId ? updatedPool : p));
        setAssignPool(null);
        showToast(`🚚 "${suppName}" assigned to Pool #${poolId}!`);
        return;
      }
    } catch (err) {
      console.warn("Backend assignSupplier failed, falling back to local state:", err);
    }
    setPools(prev => prev.map(p => p.id === poolId ? { ...p, status: 'SUPPLIER_ASSIGNED', supplierId: suppId, deliveryStatus: 'PREPARING' } : p));
    setAssignPool(null);
    showToast(`🚚 "${suppName}" assigned to Pool #${poolId}! (Demo)`);
  };

  const supplierStatusUpdate = async (poolId, ds) => {
    try {
      const token = localStorage.getItem('token');
      
      if (ds === 'SHIPPED') {
        // Also call Admin API
        await fetch(`${API_URL}/api/admin/ship/${poolId}`, { method: 'PUT', headers: { 'Authorization': `Bearer ${token}` } }).catch(console.warn);
      }

      const payload = { deliveryStatus: ds };
      if (ds === 'DELIVERED') {
        payload.status = 'DELIVERED';
      }
      const res = await fetch(`${API_URL}/api/pools/${poolId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        const updatedPool = await res.json();
        setPools(prev => prev.map(p => p.id === poolId ? updatedPool : p));
        showToast(`📦 Order status updated → ${ds}`);
        return;
      }
    } catch (err) {
      console.warn("Backend supplierStatusUpdate failed, falling back to local state:", err);
    }
    setPools(prev => prev.map(p => p.id === poolId ? { ...p, deliveryStatus: ds, status: ds === 'DELIVERED' ? 'DELIVERED' : p.status } : p));
    showToast(`📦 Order status updated → ${ds} (Demo)`);
  };

  const wholesalerAcceptPool = async (poolId) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/api/pools/${poolId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: 'PENDING_ADMIN_APPROVAL' })
      });
      if (res.ok) {
        const updatedPool = await res.json();
        setPools(prev => prev.map(p => p.id === poolId ? updatedPool : p));
        showToast(`🙌 Bulk order accepted! Reached Admin for approval & payment release.`);
        return;
      }
    } catch (err) {
      console.warn("Backend accept failed, using demo fallback:", err);
    }
    setPools(prev => prev.map(p => p.id === poolId ? { ...p, status: 'PENDING_ADMIN_APPROVAL', supplierStatus: 'ACCEPTED' } : p));
    showToast(`🙌 Bulk order accepted! Awaiting Admin approval (Demo)`);
  };

  const adminApprovePool = async (poolId) => {
    try {
      const token = localStorage.getItem('token');
      // 1. Call normal Dashboard.jsx PATCH to update base status for UI consistency
      await fetch(`${API_URL}/api/pools/${poolId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: 'SUPPLIER_ASSIGNED' })
      });
      
      // 2. Call new Admin API to generate delivery code and trigger payment
      const res = await fetch(`${API_URL}/api/admin/approve/${poolId}`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (res.ok) {
        const adminPool = await res.json();
        setPools(prev => prev.map(p => p.id === poolId ? { ...p, status: 'SUPPLIER_ASSIGNED', paymentStatus: 'PAID', deliveryStatus: 'PREPARING', deliveryCode: adminPool.deliveryCode } : p));
        showToast(`✅ Bulk order approved! Payment released to wholesaler. Code generated: ${adminPool.deliveryCode}`);
        return;
      }
    } catch (err) {
      console.warn("Backend approval failed, using demo fallback:", err);
    }
    setPools(prev => prev.map(p => p.id === poolId ? { ...p, status: 'SUPPLIER_ASSIGNED', paymentStatus: 'PAID', deliveryStatus: 'PREPARING' } : p));
    showToast(`✅ Bulk order approved & payment released! (Demo)`);
  };

  const adminReleasePayment = async (poolId) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/api/pools/${poolId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ paymentStatus: 'PAID' })
      });
      if (res.ok) {
        const updatedPool = await res.json();
        setPools(prev => prev.map(p => p.id === poolId ? updatedPool : p));
        showToast(`💳 Payment released to wholesaler for Pool #${poolId}!`);
        return;
      }
    } catch (err) {
      console.warn("Backend adminReleasePayment failed, falling back to local state:", err);
    }
    setPools(prev => prev.map(p => p.id === poolId ? { ...p, paymentStatus: 'PAID' } : p));
    showToast(`💳 Payment released to wholesaler for Pool #${poolId}! (Demo)`);
  };

  // ── Sidebar nav items ──────────────────────────────────────────
  const navItems = {
    RETAILER: [
      { id: 'marketplace', icon: Icon.ShoppingBag, label: 'Browse Suppliers' },
      { id: 'pools',       icon: Icon.Layers,      label: 'My Active Pools' },
      { id: 'ai',          icon: Icon.Cpu,         label: 'AI Copilot' },
    ],
    SUPPLIER: [
      { id: 'my-products',  icon: Icon.Package,    label: 'My Products' },
      { id: 'add-product',  icon: Icon.PlusCircle, label: 'Add Product' },
      { id: 'supplier',     icon: Icon.Truck,      label: 'Pool Orders' },
      { id: 'admin',        icon: Icon.Activity,   label: 'Admin Features' },
    ],
    ADMIN: [
      { id: 'admin', icon: Icon.Activity, label: 'Pool Lifecycle' },
    ],
  };

  const roleGradient = { RETAILER: '#7c3aed, #06b6d4', SUPPLIER: '#059669, #10b981', ADMIN: '#dc2626, #f59e0b' };

  // ─────────────────────────────────────────────────────────────
  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-root)', flexDirection: 'column' }}>
      <LiveTicker />

      <div style={{ display: 'flex', flex: 1 }}>
        {/* ── SIDEBAR ───────────────────────────────────────────── */}
        <div style={{ width: '250px', flexShrink: 0, borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column', padding: '24px 16px', background: 'rgba(255,255,255,0.008)', position: 'sticky', top: 0, height: '100vh' }}>

          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '32px', paddingLeft: '6px' }}>
            <div style={{ width: '34px', height: '34px', borderRadius: '9px', background: `linear-gradient(135deg, ${roleGradient[user.role] || ''}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '1rem', color: '#fff', boxShadow: '0 4px 12px rgba(124,58,237,0.4)', flexShrink: 0 }}>P</div>
            <div>
              <div style={{ fontWeight: '800', fontSize: '1rem', lineHeight: 1 }}>Pooled Pay</div>
              <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>Fintech Platform</div>
            </div>
          </div>

          {/* User card */}
          <div style={{ padding: '14px', background: 'rgba(255,255,255,0.03)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', marginBottom: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: `linear-gradient(135deg, ${roleGradient[user.role] || '#7c3aed, #06b6d4'})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '0.95rem', color: '#fff', flexShrink: 0 }}>
                {user.username?.[0]?.toUpperCase()}
              </div>
              <div>
                <div style={{ fontWeight: '600', fontSize: '0.88rem', color: 'var(--text-main)' }}>{user.username}</div>
                <span className={`badge badge-${user.role==='RETAILER'?'accent':user.role==='SUPPLIER'?'success':'warning'}`} style={{ marginTop: '3px' }}>
                  {user.role}
                </span>
              </div>
            </div>
          </div>

          {/* Nav */}
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 }}>
            {(navItems[user.role] || []).map(item => {
              const active = activeTab === item.id;
              return (
                <button key={item.id} onClick={() => setActiveTab(item.id)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '10px',
                    padding: '10px 12px', borderRadius: 'var(--radius-sm)',
                    border: active ? '1px solid rgba(6,182,212,0.2)' : '1px solid transparent',
                    background: active ? 'linear-gradient(135deg, rgba(124,58,237,0.15), rgba(6,182,212,0.1))' : 'transparent',
                    color: active ? 'var(--text-main)' : 'var(--text-muted)',
                    cursor: 'pointer', fontWeight: active ? '600' : '500',
                    fontSize: '0.875rem', width: '100%', textAlign: 'left',
                    transition: 'all 0.2s',
                    boxShadow: active ? '0 0 0 1px rgba(6,182,212,0.1) inset' : 'none',
                  }}>
                  <item.icon width={16} height={16} style={{ color: active ? 'var(--accent)' : 'var(--text-muted)', flexShrink: 0 }} />
                  {item.label}
                  {active && <div style={{ marginLeft: 'auto', width: '5px', height: '5px', borderRadius: '50%', background: 'var(--accent)' }} />}
                </button>
              );
            })}
          </nav>

          {/* Logout */}
          <button onClick={handleLogout} className="btn btn-ghost btn-full" style={{ gap: '8px', justifyContent: 'flex-start', marginTop: '8px' }}>
            <Icon.LogOut width={15} height={15} /> Logout
          </button>
        </div>

        {/* ── MAIN CONTENT ──────────────────────────────────────── */}
        <div style={{ flex: 1, padding: '36px 40px', overflowY: 'auto', maxHeight: '100vh' }}>

          {/* Toast */}
          {toast && (
            <div className="animate-slide-up" style={{ position: 'fixed', top: '20px', right: '24px', zIndex: 999, background: 'var(--success-soft)', border: '1px solid rgba(16,185,129,0.3)', color: 'var(--success)', padding: '14px 20px', borderRadius: 'var(--radius-sm)', boxShadow: 'var(--shadow-lg)', fontSize: '0.88rem', fontWeight: '600', maxWidth: '380px', display: 'flex', alignItems: 'center', gap: '8px', backdropFilter: 'blur(12px)' }}>
              {SI(Icon.CheckCircle, 16)} {toast}
            </div>
          )}

          {/* ════ RETAILER: MARKETPLACE ════ */}
          {user.role === 'RETAILER' && activeTab === 'marketplace' && (
            <div className="animate-fade-in">
              <div style={{ marginBottom: '32px' }}>
                <h1 style={{ fontSize: '1.75rem', fontWeight: '800', marginBottom: '6px' }}>
                  {selectedSupplierId ? 'Supplier Catalog' : 'Browse Wholesale Suppliers'}
                </h1>
                <p style={{ color: 'var(--text-muted)' }}>
                  {selectedSupplierId 
                    ? 'Browse wholesale batches listed by this supplier. Join or start a procurement pool.' 
                    : 'Select a verified supplier to view their product catalog and create or join group pools.'}
                </p>
              </div>

              {loading ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}>
                  <Icon.Refresh width={28} height={28} style={{ color: 'var(--accent)', animation: 'spin 1s linear infinite' }} />
                </div>
              ) : selectedSupplierId === null ? (
                /* Level 1: Supplier Directory */
                getMergedSuppliers().length === 0 ? (
                  <div className="glass-panel" style={{ padding: '60px', textAlign: 'center', color: 'var(--text-muted)' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '16px' }}>🚚</div>
                    <div style={{ fontWeight: '600', marginBottom: '6px' }}>No suppliers registered yet</div>
                    <div style={{ fontSize: '0.85rem' }}>Check back soon for wholesale distributors.</div>
                  </div>
                ) : (
                  <div className="stagger" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
                    {getMergedSuppliers().map(sup => {
                      const supId = sup.supplierId || sup.id;
                      const listedProducts = products.filter(p => Number(p.supplierId) === Number(supId));
                      const listedCount = listedProducts.length;
                      const activePoolsCount = pools.filter(pool => {
                        const prod = listedProducts.find(p => p.id === pool.productId);
                        return prod && pool.status !== 'CLOSED' && pool.status !== 'DELIVERED';
                      }).length;

                      return (
                        <div key={supId} className="glass-panel animate-fade-in" style={{ 
                          padding: '24px', 
                          display: 'flex', 
                          flexDirection: 'column', 
                          gap: '16px',
                          position: 'relative',
                          overflow: 'hidden',
                          transition: 'transform 0.2s, box-shadow 0.2s',
                          cursor: 'pointer'
                        }}
                        onClick={() => setSelectedSupplierId(supId)}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = 'translateY(-4px)';
                          e.currentTarget.style.boxShadow = '0 12px 30px rgba(6, 182, 212, 0.15)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = 'translateY(0)';
                          e.currentTarget.style.boxShadow = 'none';
                        }}
                        >
                          {/* Decorative corner glow */}
                          <div style={{ 
                            position: 'absolute', 
                            top: '-50px', 
                            right: '-50px', 
                            width: '100px', 
                            height: '100px', 
                            borderRadius: '50%', 
                            background: sup.category === 'Pharma' ? 'radial-gradient(circle, rgba(124,58,237,0.15) 0%, transparent 70%)' : 'radial-gradient(circle, rgba(6,182,212,0.12) 0%, transparent 70%)',
                            pointerEvents: 'none'
                          }} />

                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <span className={`badge badge-${sup.category === 'Pharma' ? 'primary' : sup.category === 'FMCG' ? 'accent' : 'success'}`}>
                              {sup.category}
                            </span>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.85rem', color: '#fbbf24', fontWeight: '700' }}>
                              {SI(Icon.Star, 14, '#fbbf24')} {sup.rating}
                            </div>
                          </div>

                          <div>
                            <h3 style={{ fontSize: '1.15rem', fontWeight: '700', color: 'var(--text-main)', marginBottom: '6px' }}>{sup.name}</h3>
                            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Verified wholesale supplier for hospital & retail pharmacy networks.</p>
                          </div>

                          {/* Stats Grid */}
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', background: 'rgba(0,0,0,0.15)', padding: '12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
                            <div>
                              <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Products Listed</div>
                              <div style={{ fontSize: '1.05rem', fontWeight: '800', color: 'var(--text-main)', marginTop: '2px' }}>{listedCount} items</div>
                            </div>
                            <div>
                              <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Active Pools</div>
                              <div style={{ fontSize: '1.05rem', fontWeight: '800', color: 'var(--accent)', marginTop: '2px' }}>{activePoolsCount} pools</div>
                            </div>
                          </div>

                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                            <span>🏭 Capacity: {sup.capacity} batches/wk</span>
                            <span style={{ color: 'var(--accent)', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px' }}>
                              Browse Catalog →
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )
              ) : (
                /* Level 2: Supplier Catalog View */
                (() => {
                  const selectedSupplier = getMergedSuppliers().find(s => Number(s.id) === Number(selectedSupplierId) || Number(s.supplierId) === Number(selectedSupplierId));
                  const supplierProducts = products.filter(p => Number(p.supplierId) === Number(selectedSupplierId));

                  return (
                    <div>
                      {/* Breadcrumbs & back btn */}
                      <button onClick={() => setSelectedSupplierId(null)} className="btn btn-outline" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '20px', padding: '8px 16px' }}>
                        ← Back to Suppliers
                      </button>

                      {/* Supplier header banner */}
                      <div className="glass-panel" style={{ padding: '24px', marginBottom: '28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', borderLeft: '4px solid var(--accent)' }}>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                            <h2 style={{ fontSize: '1.4rem', fontWeight: '800', margin: 0 }}>{selectedSupplier?.name}</h2>
                            <span className={`badge badge-${selectedSupplier?.category === 'Pharma' ? 'primary' : 'accent'}`}>{selectedSupplier?.category}</span>
                          </div>
                          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0 }}>
                            Direct procurement from {selectedSupplier?.name}. Form a pool or join existing active pools.
                          </p>
                        </div>
                        <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                          <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Rating</div>
                            <div style={{ fontSize: '1.2rem', fontWeight: '800', color: '#fbbf24', display: 'flex', alignItems: 'center', gap: '4px' }}>
                              ⭐ {selectedSupplier?.rating}
                            </div>
                          </div>
                          <div style={{ width: '1px', height: '30px', background: 'var(--border)' }} />
                          <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Capacity</div>
                            <div style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--text-main)' }}>{selectedSupplier?.capacity} batches</div>
                          </div>
                        </div>
                      </div>

                      {supplierProducts.length === 0 ? (
                        <div className="glass-panel" style={{ padding: '60px', textAlign: 'center', color: 'var(--text-muted)' }}>
                          <div style={{ fontSize: '3rem', marginBottom: '16px' }}>📦</div>
                          <div style={{ fontWeight: '600', marginBottom: '6px' }}>No products listed by this supplier</div>
                          <div style={{ fontSize: '0.85rem' }}>This supplier has not listed any wholesale products yet.</div>
                        </div>
                      ) : (
                        <div className="stagger" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
                          {supplierProducts.map(prod => {
                            const baseP = prod.basePrice || prod.originalPrice || 0;
                            const groupP = prod.groupPrice || 0;
                            const sp = savePct(baseP, groupP);
                            const saved = baseP - groupP;
                            const activePool = pools.find(p => p.productId === prod.id && p.status !== 'CLOSED' && p.status !== 'DELIVERED');

                            return (
                              <div key={prod.id} className="glass-panel animate-fade-in" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                                {/* Top row */}
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                  <span className={`badge badge-${prod.category==='Pharma'?'primary':prod.category==='FMCG'?'accent':'success'}`}>{prod.category}</span>
                                  {activePool && <span className="badge badge-success">{SI(Icon.Users, 11)} {activePool.participantsCount} in pool</span>}
                                </div>

                                <div>
                                  <h3 style={{ fontSize: '0.97rem', fontWeight: '700', color: 'var(--text-main)', lineHeight: 1.4, marginBottom: '4px' }}>{prod.name}</h3>
                                  {prod.description && <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>{prod.description}</p>}
                                </div>

                                {/* Stock, min qty & deadline info */}
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.78rem', color: 'var(--text-muted)', margin: '4px 0' }}>
                                  {prod.availableQuantity != null && (
                                    <span>📦 <strong>Max Pool Quantity (Total Stock):</strong> {prod.availableQuantity} {prod.unit}</span>
                                  )}
                                  {prod.minOrderQuantity != null && (
                                    <span>📋 <strong>Min Quantity to Close Pool:</strong> {prod.minOrderQuantity} {prod.unit}</span>
                                  )}
                                  {activePool && (() => {
                                    const cur = activePool.currentQuantity || 0;
                                    const min = prod.minOrderQuantity || 1;
                                    const max = activePool.maxQuantity || prod.availableQuantity || min;
                                    const pct = Math.min(100, Math.round((cur / max) * 100));
                                    const minPct = Math.min(100, Math.round((min / max) * 100));
                                    return (
                                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                          <span style={{ color: 'var(--accent)', fontWeight: '600' }}>📈 Pool Progress: {cur} / {max} units</span>
                                          <span style={{ fontWeight: '700', color: cur >= min ? 'var(--success)' : 'var(--warning)' }}>{pct}%</span>
                                        </div>
                                        <div style={{ height: '8px', background: 'rgba(255,255,255,0.06)', borderRadius: '4px', overflow: 'hidden', position: 'relative' }}>
                                          {/* Min threshold marker */}
                                          <div style={{ position: 'absolute', left: `${minPct}%`, top: 0, bottom: 0, width: '2px', background: 'rgba(251,191,36,0.6)', zIndex: 1 }} />
                                          <div style={{ height: '100%', width: `${pct}%`, background: cur >= min ? 'linear-gradient(to right, var(--success), #34d399)' : 'linear-gradient(to right, var(--accent), #22d3ee)', borderRadius: '4px', transition: 'width 0.6s ease' }} />
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                                          <span>0</span>
                                          <span style={{ color: '#fbbf24' }}>Min: {min}</span>
                                          <span>Max: {max}</span>
                                        </div>
                                        <div style={{
                                          fontSize: '0.72rem',
                                          fontWeight: '600',
                                          color: cur >= min ? '#34d399' : '#fbbf24',
                                          marginTop: '2px',
                                          display: 'flex',
                                          alignItems: 'center',
                                          gap: '4px'
                                        }}>
                                          {cur >= min ? (
                                            <span>✅ Min quantity met (Fulfillment threshold reached)</span>
                                          ) : (
                                            <span>⚠️ Needs <strong>{min - cur}</strong> more units to fulfill min quantity</span>
                                          )}
                                        </div>
                                      </div>
                                    );
                                  })()}
                                  {activePool && (
                                    <div style={{ marginTop: '4px', padding: '8px 10px', background: 'rgba(6,182,212,0.06)', border: '1px solid rgba(6,182,212,0.15)', borderRadius: 'var(--radius-sm)' }}>
                                      <CountdownTimer deadline={poolDeadline(activePool.createdAt)} />
                                    </div>
                                  )}
                                  {prod.deliveryTimeEstimate && <span>🕐 <strong>Delivery Estimate:</strong> {prod.deliveryTimeEstimate} days</span>}
                                </div>

                                {/* Savings widget */}
                                <div style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '14px' }}>
                                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: '8px' }}>
                                    <span style={{ color: 'var(--text-muted)' }}>Individual MRP</span>
                                    <span style={{ textDecoration: 'line-through', color: 'var(--danger)' }}>₹{baseP}</span>
                                  </div>
                                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                                    <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Pool Price</span>
                                    <span style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--success)' }}>₹{groupP}</span>
                                  </div>
                                  <div style={{ height: '5px', background: 'rgba(255,255,255,0.06)', borderRadius: '3px', marginBottom: '8px', overflow: 'hidden' }}>
                                    <div style={{ height: '100%', width: `${sp}%`, background: 'linear-gradient(to right, var(--success), #34d399)', borderRadius: '3px' }} />
                                  </div>
                                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', fontWeight: '700', color: 'var(--accent)' }}>
                                    <span>You save</span>
                                    <span>₹{saved} ({sp}% OFF)</span>
                                  </div>
                                </div>

                                {/* CTA */}
                                {activePool ? (
                                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    <button onClick={() => setCheckout({ product: prod, mode: 'join', pool: activePool })} className="btn btn-accent btn-full">
                                      {SI(Icon.Users, 15)} Join Active Pool ({activePool.participantsCount} already in)
                                    </button>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.74rem', color: 'var(--text-muted)', padding: '0 2px' }}>
                                      <span>📍 {activePool.location || 'Your area'}</span>
                                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                        <CountdownTimer deadline={poolDeadline(activePool.createdAt)} compact />
                                      </span>
                                    </div>
                                  </div>
                                ) : (
                                  <button onClick={() => setCheckout({ product: prod, mode: 'create', pool: null })} className="btn btn-primary btn-full">
                                    {SI(Icon.PlusCircle, 15)} Start Pool (closes in 24h or at max qty)
                                  </button>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })()
              )}
            </div>
          )}

          {/* ════ RETAILER: ACTIVE POOLS ════ */}
          {user.role === 'RETAILER' && activeTab === 'pools' && (
            <div className="animate-fade-in">
              <div style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <div>
                  <h1 style={{ fontSize: '1.75rem', fontWeight: '800', marginBottom: '6px' }}>Active Procurement Pools</h1>
                  <p style={{ color: 'var(--text-muted)' }}>Track live matching, supplier assignments, and delivery status.</p>
                </div>
                <button onClick={fetchData} className="btn btn-outline" style={{ gap: '6px' }}>
                  <Icon.Refresh width={14} height={14} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} /> Refresh
                </button>
              </div>

              {pools.length === 0 ? (
                <div className="glass-panel" style={{ padding: '60px', textAlign: 'center', color: 'var(--text-muted)' }}>
                  <div style={{ fontSize: '3rem', marginBottom: '16px' }}>🛒</div>
                  <div style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '6px' }}>No pools yet</div>
                  <div style={{ fontSize: '0.85rem' }}>Visit the Sourcing portal to create or join a pool!</div>
                </div>
              ) : (
                <div className="stagger" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {pools.map(pool => {
                    const prod     = products.find(p => p.id === pool.productId) || { name: 'Unknown', basePrice: 0, groupPrice: 0, supplierId: null };
                    const baseP    = prod.basePrice || prod.originalPrice || 0;
                    const supplier = getMergedSuppliers().find(s => Number(s.id) === Number(prod.supplierId) || Number(s.supplierId) === Number(prod.supplierId) || Number(s.id) === Number(pool.supplierId) || Number(s.supplierId) === Number(pool.supplierId));
                    const cur      = pool.currentQuantity || 0;
                    const minQty   = prod.minOrderQuantity || 1;
                    const maxQty   = pool.maxQuantity || prod.totalStockQuantity || prod.availableQuantity || minQty;
                    const progPct  = Math.min(100, Math.round((cur / maxQty) * 100));
                    const minPct   = Math.min(100, Math.round((minQty / maxQty) * 100));
                    const deadline = poolDeadline(pool.createdAt);
                    const isActive = pool.status === 'ACTIVE';
                    const isFulfilled = pool.status === 'FULFILLED' || pool.status === 'SUPPLIER_ASSIGNED';
                    const isJoinable = isActive || isFulfilled;

                    return (
                      <div key={pool.id} className="glass-panel animate-fade-in" style={{ padding: '24px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
                          <div>
                            <h3 style={{ fontSize: '1.05rem', fontWeight: '700', marginBottom: '2px' }}>{prod.name}</h3>
                            {supplier && (
                              <div style={{ fontSize: '0.82rem', color: 'var(--accent)', fontWeight: '600', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                🚚 Supplier: <strong>{supplier.name}</strong>
                              </div>
                            )}
                            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                              Pool #{pool.id} · {pool.location || 'Your area'} · Opened {new Date(pool.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                            </div>
                          </div>
                          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                            <StatusBadge status={pool.status} />
                            {pool.deliveryStatus && <StatusBadge status={pool.deliveryStatus} />}
                          </div>
                        </div>

                        {/* Qty progress bar — shown for all joinable pools */}
                        {isJoinable && (
                          <div style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '14px 16px', marginBottom: '14px' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', marginBottom: '12px', textAlign: 'center' }}>
                              <div>
                                <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '2px' }}>Min to Close Pool</div>
                                <div style={{ fontSize: '1rem', fontWeight: '800', color: cur >= minQty ? 'var(--success)' : 'var(--warning)' }}>{minQty} units</div>
                              </div>
                              <div>
                                <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '2px' }}>Currently Pooled</div>
                                <div style={{ fontSize: '1rem', fontWeight: '800', color: 'var(--accent)' }}>{cur} units</div>
                              </div>
                              <div>
                                <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '2px' }}>Max Available</div>
                                <div style={{ fontSize: '1rem', fontWeight: '800', color: 'var(--text-main)' }}>{maxQty} units</div>
                              </div>
                            </div>
                            <div style={{ height: '10px', background: 'rgba(255,255,255,0.05)', borderRadius: '5px', overflow: 'hidden', position: 'relative', marginBottom: '4px' }}>
                              {/* Min marker */}
                              <div style={{ position: 'absolute', left: `${minPct}%`, top: 0, bottom: 0, width: '2px', background: 'rgba(251,191,36,0.8)', zIndex: 1 }} />
                              <div style={{ height: '100%', width: `${progPct}%`, background: cur >= minQty ? 'linear-gradient(to right, #10b981, #34d399)' : 'linear-gradient(to right, #7c3aed, #06b6d4)', borderRadius: '5px', transition: 'width 0.6s ease' }} />
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.68rem', color: 'var(--text-muted)', marginBottom: '10px' }}>
                              <span>0</span>
                              <span style={{ color: '#fbbf24', fontWeight: '700' }}>Min: {minQty}</span>
                              <span>Max: {maxQty}</span>
                            </div>
                            
                            {/* Quantity Fulfillment Info */}
                            <div style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px',
                              fontSize: '0.78rem',
                              fontWeight: '600',
                              color: cur >= minQty ? '#34d399' : '#fbbf24',
                              background: cur >= minQty ? 'rgba(16,185,129,0.08)' : 'rgba(245,158,11,0.08)',
                              border: `1px solid ${cur >= minQty ? 'rgba(16,185,129,0.15)' : 'rgba(245,158,11,0.15)'}`,
                              borderRadius: '6px',
                              padding: '8px 12px',
                              marginBottom: '10px'
                            }}>
                              {cur >= minQty ? (
                                <span>✅ Min quantity met (Fulfillment threshold reached)</span>
                              ) : (
                                <span>⚠️ Needs <strong>{minQty - cur}</strong> more units to fulfill min quantity</span>
                              )}
                            </div>

                            <CountdownTimer deadline={deadline} />
                          </div>
                        )}

                        <OrderStepper pool={pool} />
                        
                        {pool.deliveryCode && pool.status !== 'DELIVERED' && (
                          <div style={{ marginTop: '14px', padding: '12px', background: 'rgba(16,185,129,0.1)', border: '1px dashed var(--success)', borderRadius: '8px', textAlign: 'center' }}>
                            <div style={{ fontSize: '0.8rem', color: 'var(--success)', marginBottom: '4px' }}>Your Secure Delivery Code</div>
                            <div style={{ fontSize: '1.4rem', fontWeight: '800', letterSpacing: '2px', color: '#fff' }}>{pool.deliveryCode}</div>
                            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '4px' }}>Provide this code to the delivery agent to confirm receipt.</div>
                          </div>
                        )}

                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px', fontSize: '0.84rem', color: 'var(--text-muted)', flexWrap: 'wrap', gap: '8px' }}>
                          <span>👥 <strong style={{ color: 'var(--accent)' }}>{pool.participantsCount} retailers</strong> joined</span>
                          <span>💰 Pool Price: <strong style={{ color: 'var(--success)' }}>₹{prod.groupPrice}</strong> <span style={{ color: 'var(--accent)' }}>({savePct(baseP, prod.groupPrice)}% saved)</span></span>
                          <span>
                            {pool.paymentStatus === 'PAID' ? (
                              <span style={{ color: '#34d399', fontWeight: '700' }}>💳 Paid by Admin</span>
                            ) : (
                              <span style={{ color: 'var(--text-muted)' }}>💳 Payment: Pending</span>
                            )}
                          </span>
                        </div>

                        {isJoinable && prod.id && prod.name !== 'Unknown' && (
                          <button
                            onClick={() => setCheckout({ product: prod, mode: 'join', pool: pool })}
                            className="btn btn-accent btn-full"
                            style={{ marginTop: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                          >
                            {SI(Icon.Users, 16)}
                            {isActive ? 'Join Pool & Order Items' : `Join Pool · ${cur} / ${minQty} min units pooled`}
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ════ RETAILER: AI COPILOT ════ */}
          {user.role === 'RETAILER' && activeTab === 'ai' && <AiCopilot />}

          {/* ════ SUPPLIER PORTAL ════ */}
          {user.role === 'SUPPLIER' && activeTab === 'supplier' && (
            <div className="animate-fade-in">
              <div style={{ marginBottom: '32px' }}>
                <h1 style={{ fontSize: '1.75rem', fontWeight: '800', marginBottom: '6px' }}>Supplier Dashboard</h1>
                <p style={{ color: 'var(--text-muted)' }}>Manage assigned pool orders and update fulfillment status.</p>
              </div>

              {/* Supplier stats */}
              {(() => {
                const loggedInSupplierId = Number(localStorage.getItem('userId') || '1');
                const supplierPools = pools.filter(p => 
                  Number(p.supplierId) === loggedInSupplierId ||
                  products.find(prod => prod.id === p.productId && Number(prod.supplierId) === loggedInSupplierId)
                );

                return (
                  <>
                    <div className="stagger" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '16px', marginBottom: '28px' }}>
                      {[
                        { label: 'Assigned Orders',   val: supplierPools.length,  icon: Icon.Package, c: 'var(--accent)' },
                        { label: 'Delivered Today',    val: supplierPools.filter(p=>p.deliveryStatus==='DELIVERED').length, icon: Icon.CheckCircle, c: 'var(--success)' },
                        { label: 'In Transit',         val: supplierPools.filter(p=>p.deliveryStatus==='SHIPPED').length,   icon: Icon.Truck, c: 'var(--warning)' },
                      ].map(s => (
                        <div key={s.label} className="stat-card animate-fade-in">
                          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: '10px' }}>
                            <span>{s.label}</span>
                            <s.icon width={16} height={16} style={{ color: s.c }} />
                          </div>
                          <div style={{ fontSize: '2rem', fontWeight: '800', color: s.c }}>{s.val}</div>
                        </div>
                      ))}
                    </div>

                    {supplierPools.length === 0 ? (
                      <div className="glass-panel" style={{ padding: '60px', textAlign: 'center', color: 'var(--text-muted)' }}>
                        <div style={{ fontSize: '3rem', marginBottom: '16px' }}>📭</div>
                        <div>No orders assigned yet. Orders appear here once Admin completes matching or you are assigned to a pool.</div>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {supplierPools.map(pool => {
                          const prod = products.find(p => p.id === pool.productId) || { name: 'Unknown', groupPrice: 0, minOrderQuantity: 1 };
                          const total = prod.groupPrice * pool.currentQuantity;
                          const ds = pool.deliveryStatus;
                          const minMet = pool.currentQuantity >= (prod.minOrderQuantity || 1);
                          return (
                            <div key={pool.id} className="glass-panel animate-fade-in" style={{ padding: '24px' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
                                <div>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                                    <h3 style={{ fontSize: '1.05rem', fontWeight: '700', margin: 0 }}>Pooled Batch: {prod.name}</h3>
                                    <StatusBadge status={pool.status} />
                                  </div>
                                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                                    Pool #{pool.id} · <strong>{pool.participantsCount} orders</strong> placed
                                  </div>
                                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                                    📈 Total Ordered Quantity: <strong>{pool.currentQuantity} units</strong> (Min target to fulfill: {prod.minOrderQuantity} units)
                                  </div>
                                  <div style={{ fontSize: '0.78rem', color: '#fbbf24', marginTop: '2px' }}>
                                    Remaining Available Pool Capacity: <strong>{pool.maxQuantity - pool.currentQuantity} units</strong>
                                  </div>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                  <div style={{ fontSize: '1.4rem', fontWeight: '800', color: 'var(--success)' }}>₹{total.toLocaleString()}</div>
                                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Total order value (Qty × Price)</div>
                                  <div style={{ fontSize: '0.75rem', fontWeight: '700', color: pool.paymentStatus === 'PAID' ? '#34d399' : '#fbbf24', marginTop: '4px' }}>
                                    {pool.paymentStatus === 'PAID' ? '💳 PAID BY ADMIN' : '💳 AWAITING ADMIN PAYMENT'}
                                  </div>
                                </div>
                              </div>

                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', flexWrap: 'wrap', gap: '12px' }}>
                                <div style={{ fontSize: '0.88rem' }}>
                                  Delivery Status: {ds ? <StatusBadge status={ds} /> : <span style={{ color: 'var(--text-muted)' }}>Awaiting Wholesaler Acceptance</span>}
                                </div>
                                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                                  {pool.status === 'ACTIVE' && (
                                    <span style={{ color: '#fbbf24', fontSize: '0.82rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                      ⏳ Pool Forming (Awaiting 24h deadline or max capacity)
                                    </span>
                                  )}
                                  {pool.status === 'CLOSED' && (
                                    <>
                                      {minMet ? (
                                        <button onClick={() => wholesalerAcceptPool(pool.id)} className="btn btn-success btn-sm" style={{ boxShadow: '0 0 12px rgba(16,185,129,0.3)' }}>
                                          ✓ Accept Bulk Order & Request Admin Payment
                                        </button>
                                      ) : (
                                        <span style={{ color: 'var(--danger)', fontSize: '0.8rem', fontWeight: '600' }}>
                                          ❌ Unfulfilled (Order qty {pool.currentQuantity} is below min target {prod.minOrderQuantity})
                                        </span>
                                      )}
                                    </>
                                  )}
                                  {pool.status === 'PENDING_ADMIN_APPROVAL' && (
                                    <span style={{ color: '#fbbf24', fontSize: '0.82rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                      🕐 Reached Admin. Awaiting approval & payment release.
                                    </span>
                                  )}
                                  {pool.status === 'SUPPLIER_ASSIGNED' && (
                                    <>
                                      {ds === 'PREPARING' && <button onClick={() => supplierStatusUpdate(pool.id, 'SHIPPED')} className="btn btn-accent btn-sm">📦 Mark as Shipped</button>}
                                      {ds === 'SHIPPED'   && <button onClick={() => setVerifyOrder(pool)} className="btn btn-success btn-sm">✅ Confirm Retailer Code</button>}
                                    </>
                                  )}
                                  {pool.status === 'DELIVERED' && (
                                    <span style={{ color: 'var(--success)', fontSize: '0.85rem', fontWeight: '600', display:'flex', alignItems:'center', gap:'4px' }}>{SI(Icon.CheckCircle, 14, 'var(--success)')} Fulfilled</span>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </>
                );
              })()}
            </div>
          )}

          {/* ════ SUPPLIER: MY PRODUCTS ════ */}
          {user.role === 'SUPPLIER' && activeTab === 'my-products' && (
            <div className="animate-fade-in">
              <div style={{ marginBottom: '28px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                  <h1 style={{ fontSize: '1.75rem', fontWeight: '800', marginBottom: '6px' }}>My Products</h1>
                  <p style={{ color: 'var(--text-muted)' }}>All products you’ve listed. Retailers can see and pool these products.</p>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button onClick={fetchData} className="btn btn-outline" style={{ gap: '6px' }}>
                    <Icon.Refresh width={14} height={14} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} /> Refresh
                  </button>
                  <button onClick={() => setActiveTab('add-product')} className="btn btn-accent" style={{ gap: '6px' }}>
                    {SI(Icon.PlusCircle, 14)} Add Product
                  </button>
                </div>
              </div>

              {myProducts.length === 0 ? (
                <div className="glass-panel" style={{ padding: '60px', textAlign: 'center', color: 'var(--text-muted)' }}>
                  <div style={{ fontSize: '3rem', marginBottom: '16px' }}>📦</div>
                  <div style={{ fontWeight: '600', marginBottom: '8px' }}>No products listed yet</div>
                  <div style={{ fontSize: '0.85rem', marginBottom: '20px' }}>Add your first product to make it available for retailers to pool orders.</div>
                  <button onClick={() => setActiveTab('add-product')} className="btn btn-accent">{SI(Icon.PlusCircle, 14)} Add Your First Product</button>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {myProducts.map(prod => {
                    const activePoolsForProduct = pools.filter(p => p.productId === prod.id && p.status === 'ACTIVE');
                    const totalPoolParticipants = activePoolsForProduct.reduce((s, p) => s + (p.participantsCount || 0), 0);
                    return (
                      <div key={prod.id} className="glass-panel animate-fade-in" style={{ padding: '24px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
                          <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px', flexWrap: 'wrap' }}>
                              <h3 style={{ fontSize: '1rem', fontWeight: '700' }}>{prod.name}</h3>
                              <span className={`badge badge-${prod.category==='Pharma'?'primary':prod.category==='FMCG'?'accent':'success'}`}>{prod.category}</span>
                              {activePoolsForProduct.length > 0 && (
                                <span className="badge badge-success">🔥 {activePoolsForProduct.length} active pool{activePoolsForProduct.length > 1 ? 's' : ''}
                                </span>
                              )}
                            </div>
                            {prod.description && <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '10px', lineHeight: 1.5 }}>{prod.description}</p>}
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '10px' }}>
                              {[
                                { label: 'Base Price',     val: `₹${prod.basePrice}`,          icon: '🏷️' },
                                { label: 'Pool Price',     val: `₹${prod.groupPrice}`,         icon: '💰' },
                                { label: 'Min Pool Target', val: `${prod.minOrderQuantity} packs (size: ${prod.unit})`, icon: '📋' },
                                { label: 'Available Stock', val: `${prod.availableQuantity} packs (size: ${prod.unit})`, icon: '📦' },
                                { label: 'Delivery',       val: prod.deliveryTimeEstimate ? `${prod.deliveryTimeEstimate} days` : 'N/A', icon: '🚚' },
                                { label: 'Pool Interest',  val: `${totalPoolParticipants} retailers`, icon: '👥' },
                              ].map(item => (
                                <div key={item.label} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '10px 12px' }}>
                                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '3px' }}>{item.icon} {item.label}</div>
                                  <div style={{ fontSize: '0.88rem', fontWeight: '700', color: 'var(--text-main)' }}>{item.val}</div>
                                </div>
                              ))}
                            </div>
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flexShrink: 0 }}>
                            <button
                              onClick={async () => {
                                const newQty = prompt(`Update available quantity for "${prod.name}" (current: ${prod.availableQuantity}):`);
                                if (newQty === null || isNaN(+newQty)) return;
                                try {
                                  const res = await fetch(`${API_URL}/api/products/${prod.id}`, {
                                    method: 'PUT',
                                    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                                    body: JSON.stringify({ ...prod, availableQuantity: +newQty }),
                                  });
                                  if (res.ok) {
                                    const updated = await res.json();
                                    setMyProducts(prev => prev.map(p => p.id === prod.id ? updated : p));
                                    showToast('✅ Quantity updated!');
                                  }
                                } catch { showToast('✅ Updated (demo mode)'); setMyProducts(prev => prev.map(p => p.id === prod.id ? { ...p, availableQuantity: +newQty } : p)); }
                              }}
                              className="btn btn-outline btn-sm"
                              style={{ gap: '5px' }}
                            >
                              {SI(Icon.ArrowUp, 12)} Update Stock
                            </button>
                            <button
                              onClick={async () => {
                                if (!confirm(`Delete "${prod.name}"?`)) return;
                                try {
                                  await fetch(`${API_URL}/api/products/${prod.id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
                                } catch {}
                                setMyProducts(prev => prev.filter(p => p.id !== prod.id));
                                setProducts(prev => prev.filter(p => p.id !== prod.id));
                                showToast('🗑️ Product removed');
                              }}
                              className="btn btn-danger btn-sm"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                        {activePoolsForProduct.length > 0 && (
                          <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid var(--border)' }}>
                            <div style={{ fontSize: '0.78rem', fontWeight: '700', color: 'var(--accent)', marginBottom: '10px' }}>Active Pools for this Product</div>
                            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                              {activePoolsForProduct.map(pool => (
                                <div key={pool.id} style={{ background: 'rgba(6,182,212,0.06)', border: '1px solid rgba(6,182,212,0.2)', borderRadius: 'var(--radius-sm)', padding: '8px 14px', fontSize: '0.8rem' }}>
                                  <span style={{ fontWeight: '600', color: 'var(--accent)' }}>Pool #{pool.id}</span>
                                  <span style={{ color: 'var(--text-muted)', marginLeft: '8px' }}>{pool.participantsCount} retailers · Qty {pool.currentQuantity}/{prod.minOrderQuantity}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ════ SUPPLIER: ADD PRODUCT ════ */}
          {user.role === 'SUPPLIER' && activeTab === 'add-product' && (
            <div className="animate-fade-in">
              <div style={{ marginBottom: '32px' }}>
                <h1 style={{ fontSize: '1.75rem', fontWeight: '800', marginBottom: '6px' }}>Add Product</h1>
                <p style={{ color: 'var(--text-muted)' }}>List your wholesale products for retailers to pool.</p>
              </div>
              <AddProductForm token={token} onSuccess={(p) => {
                setProducts(prev => [p, ...prev]);
                setMyProducts(prev => [p, ...prev]);
                showToast('✅ Product published! Retailers can now see and pool it.');
                setActiveTab('my-products');
              }} />
            </div>
          )}

          {/* ════ ADMIN PORTAL ════ */}
          {activeTab === 'admin' && (
            <div className="animate-fade-in">
              <div style={{ marginBottom: '32px', paddingLeft: '24px' }}>
                <h1 style={{ fontSize: '1.75rem', fontWeight: '800', marginBottom: '6px' }}>Admin Central Command</h1>
                <p style={{ color: 'var(--text-muted)' }}>Full lifecycle control — close pools, run algorithmic supplier matching, confirm deliveries.</p>
              </div>
              <AdminDashboard />
            </div>
          )}

        </div>{/* /main */}
      </div>{/* /flex */}

      {/* ── MODALS ────────────────────────────────────────────────── */}
      {checkout && (
        <CheckoutModal
          product={checkout.product}
          supplier={getMergedSuppliers().find(s => Number(s.id) === Number(checkout.product.supplierId) || Number(s.supplierId) === Number(checkout.product.supplierId))}
          mode={checkout.mode || 'create'}
          pool={checkout.pool || null}
          token={token}
          onClose={() => setCheckout(null)}
          onSuccess={(data) => { setCheckout(null); handleCheckoutSuccess(data); }}
        />
      )}
      {assignPool && (
        <AssignModal
          pool={assignPool}
          suppliers={suppliers}
          onAssign={assignSupplier}
          onClose={() => setAssignPool(null)}
        />
      )}
      {verifyOrder && (
        <VerifyModal
          pool={verifyOrder}
          onClose={() => setVerifyOrder(null)}
          onSuccess={(updatedPool) => {
            setVerifyOrder(null);
            setPools(prev => prev.map(p => p.id === updatedPool.id ? { ...p, status: 'DELIVERED', deliveryStatus: 'DELIVERED' } : p));
            showToast("✅ Delivery Verified & Order Closed!");
          }}
        />
      )}
    </div>
  );
}


