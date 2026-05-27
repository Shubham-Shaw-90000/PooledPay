// ═══════════════════════════════════════════════════════════════════
// apiService.js — Centralized API Layer for PooledPay Frontend
// ═══════════════════════════════════════════════════════════════════
// Every backend call goes through this module. If the Spring Boot
// server is unreachable (TypeError / timeout), it silently returns
// mock data so the demo never breaks.
// ═══════════════════════════════════════════════════════════════════

const BASE_URL = 'http://localhost:8080';
const TIMEOUT_MS = 3000;

// ─── MOCK DATA (demo fallback) ───────────────────────────────────
export const MOCK_PRODUCTS = [
  { id: 1, name: 'Paracetamol 500mg (Pack of 100)', category: 'Pharma', basePrice: 240, originalPrice: 240, groupPrice: 168, stock: 5000, availableQuantity: 5000, minOrderQuantity: 50, unit: 'strips' },
  { id: 2, name: 'Dettol Antiseptic Liquid 500ml', category: 'FMCG', basePrice: 185, originalPrice: 185, groupPrice: 130, stock: 2000, availableQuantity: 2000, minOrderQuantity: 100, unit: 'bottles' },
  { id: 3, name: 'Azithromycin 250mg (Pack of 10)', category: 'Pharma', basePrice: 320, originalPrice: 320, groupPrice: 210, stock: 1500, availableQuantity: 1500, minOrderQuantity: 30, unit: 'strips' },
  { id: 4, name: 'ORS Electrolyte Sachets (Box/20)', category: 'Pharma', basePrice: 140, originalPrice: 140, groupPrice: 95, stock: 8000, availableQuantity: 8000, minOrderQuantity: 200, unit: 'boxes' },
  { id: 5, name: 'Lifebuoy Soap Bar (12 pack)', category: 'FMCG', basePrice: 280, originalPrice: 280, groupPrice: 195, stock: 3000, availableQuantity: 3000, minOrderQuantity: 60, unit: 'packs' },
  { id: 6, name: 'Cetirizine 10mg (Strip of 10)', category: 'Pharma', basePrice: 55, originalPrice: 55, groupPrice: 38, stock: 6000, availableQuantity: 6000, minOrderQuantity: 100, unit: 'strips' },
];

export const MOCK_POOLS = [
  { id: 101, productId: 1, status: 'ACTIVE', participantsCount: 7, deliveryStatus: null, createdAt: new Date(Date.now() - 3600000 * 2).toISOString(), supplierId: null, currentQuantity: 35, location: 'Mumbai' },
  { id: 102, productId: 3, status: 'SUPPLIER_ASSIGNED', participantsCount: 12, deliveryStatus: 'PREPARING', createdAt: new Date(Date.now() - 3600000 * 18).toISOString(), supplierId: 201, currentQuantity: 120, location: 'Mumbai' },
  { id: 103, productId: 5, status: 'DELIVERED', participantsCount: 9, deliveryStatus: 'DELIVERED', createdAt: new Date(Date.now() - 3600000 * 48).toISOString(), supplierId: 203, currentQuantity: 90, location: 'Delhi' },
];

export const MOCK_SUPPLIERS = [
  { id: 201, name: 'PharmaCorp India', category: 'Pharma', rating: 4.8, activeOrdersCount: 2, capacity: 50 },
  { id: 202, name: 'Global BioPharma', category: 'Pharma', rating: 4.5, activeOrdersCount: 0, capacity: 30 },
  { id: 203, name: 'Apex FMCG Distributors', category: 'FMCG', rating: 4.9, activeOrdersCount: 4, capacity: 80 },
  { id: 204, name: 'Medix Wholesale', category: 'Pharma', rating: 4.7, activeOrdersCount: 1, capacity: 40 },
];

export const MOCK_CASHFLOW = [
  { type: 'INFLOW', description: 'Weekly Pharmacy Sales', amount: 52000, date: '2 days ago' },
  { type: 'OUTFLOW', description: 'Monthly Supplier Payment', amount: 15000, date: '5 days ago' },
  { type: 'INFLOW', description: 'OTC Counter Revenue', amount: 18000, date: '1 week ago' },
  { type: 'OUTFLOW', description: 'Staff Salaries', amount: 22000, date: '1 week ago' },
];

// ─── HELPERS ─────────────────────────────────────────────────────

/** Read JWT from localStorage */
function getToken() {
  return localStorage.getItem('token') || '';
}

/** Build standard headers (JSON + Bearer auth) */
function authHeaders(extraHeaders = {}) {
  const token = getToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...extraHeaders,
  };
}

/**
 * Core fetch wrapper. Attempts the real API call with a timeout.
 * On network failure / timeout, returns `fallback` instead of throwing.
 *
 * @param {string}      endpoint   - e.g. '/api/products'
 * @param {RequestInit}  options    - standard fetch options (method, body, etc.)
 * @param {*}            fallback   - value to return when the backend is unreachable
 * @param {number}       timeout    - ms before aborting (default 3000)
 * @returns {Promise<*>}           - parsed JSON or the fallback
 */
async function safeFetch(endpoint, options = {}, fallback = null, timeout = TIMEOUT_MS) {
  try {
    const res = await fetch(`${BASE_URL}${endpoint}`, {
      ...options,
      headers: authHeaders(options.headers),
      signal: AbortSignal.timeout(timeout),
    });

    if (!res.ok) {
      // Server responded with an error status — let caller decide
      const errText = await res.text().catch(() => '');
      const error = new Error(`API Error ${res.status}: ${errText.slice(0, 200)}`);
      error.status = res.status;
      throw error;
    }

    // Some endpoints return empty 200 (e.g. DELETE)
    const contentType = res.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return await res.json();
    }
    return await res.text();
  } catch (err) {
    // Network-level failures → silent fallback for demo resilience
    if (err.name === 'TimeoutError' || err.name === 'AbortError' || err instanceof TypeError) {
      console.warn(`[apiService] Backend unreachable for ${endpoint}, using fallback data.`);
      return fallback;
    }
    // Re-throw server-level errors (400, 404, 500) so the UI can handle them
    throw err;
  }
}


// ═══════════════════════════════════════════════════════════════════
// ── PUBLIC API METHODS ────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════

// ────────────────────── PRODUCTS ─────────────────────────────────

/** GET /api/products — all marketplace products */
export async function fetchProducts() {
  return safeFetch('/api/products', {}, MOCK_PRODUCTS);
}

/** GET /api/products/supplier/:id — products listed by a specific supplier */
export async function fetchSupplierProducts(supplierId) {
  return safeFetch(`/api/products/supplier/${supplierId}`, {}, []);
}

/** POST /api/products/add — supplier publishes a new product */
export async function addProduct(payload) {
  return safeFetch('/api/products/add', {
    method: 'POST',
    body: JSON.stringify(payload),
  }, null); // No silent fallback — surface errors to the supplier form
}

/** PUT /api/products/:id — update stock, price, etc. */
export async function updateProduct(productId, payload) {
  return safeFetch(`/api/products/${productId}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  }, null);
}

/** DELETE /api/products/:id */
export async function deleteProduct(productId) {
  return safeFetch(`/api/products/${productId}`, {
    method: 'DELETE',
  }, 'ok');
}

// ────────────────────── POOLS ────────────────────────────────────

/** GET /api/pools — all pool orders */
export async function fetchPools() {
  return safeFetch('/api/pools', {}, MOCK_POOLS);
}

/** GET /api/pools/product/:id — active pools for a specific product */
export async function fetchPoolsByProduct(productId) {
  return safeFetch(`/api/pools/product/${productId}`, {}, []);
}

/** GET /api/pools/supplier/:id — pools assigned to a supplier */
export async function fetchPoolsBySupplier(supplierId) {
  return safeFetch(`/api/pools/supplier/${supplierId}`, {}, []);
}

/** POST /api/pools/order — create or join a pool */
export async function placePoolOrder({ userId, productId, quantity }) {
  return safeFetch('/api/pools/order', {
    method: 'POST',
    body: JSON.stringify({ userId, productId, quantity }),
  }, null); // No silent fallback — checkout logic handles this
}

/** PATCH /api/pools/:id/status — admin updates pool lifecycle */
export async function updatePoolStatus(poolId, statusPayload) {
  return safeFetch(`/api/pools/${poolId}/status`, {
    method: 'PATCH',
    body: JSON.stringify(statusPayload),
  }, null);
}

// ────────────────────── SUPPLIERS ────────────────────────────────

/** GET /api/supplier/list — all registered supplier profiles */
export async function fetchSuppliers() {
  return safeFetch('/api/supplier/list', {}, MOCK_SUPPLIERS);
}

/** GET /api/supplier/orders/:id — orders assigned to a supplier */
export async function fetchSupplierOrders(supplierId) {
  return safeFetch(`/api/supplier/orders/${supplierId}`, {}, []);
}

/** POST /api/supplier/orders/:poolId/respond — accept/reject order */
export async function respondToOrder(poolId, response) {
  return safeFetch(`/api/supplier/orders/${poolId}/respond?response=${response}`, {
    method: 'POST',
  }, null);
}

/** POST /api/supplier/orders/:poolId/status — update delivery status */
export async function updateDeliveryStatus(poolId, status) {
  return safeFetch(`/api/supplier/orders/${poolId}/status?status=${status}`, {
    method: 'POST',
  }, null);
}

// ────────────────────── AI COPILOT ──────────────────────────────

/** GET /api/ai/copilot — cashflow risk assessment */
export async function fetchCopilotAssessment(userId, gstDue = 12000) {
  return safeFetch(`/api/ai/copilot?userId=${userId}&gstDue=${gstDue}`, {}, {
    risk: 'MEDIUM',
    reason: 'Demo mode — backend offline. Estimated outflows consume ~70% of inflows.',
    suggestion: 'Join the current Paracetamol pool order to save ₹350 per strip.',
    prediction: 'Cash flows remain tight but stable for next 10-12 days.',
    totalInflows: 70000,
    totalOutflows: 37000,
    gstDue,
  });
}

/** POST /api/ai/simulate-cashflow — add a simulated ledger event */
export async function simulateCashflowEvent(record) {
  return safeFetch('/api/ai/simulate-cashflow', {
    method: 'POST',
    body: JSON.stringify(record),
  }, { ...record, id: Date.now(), createdAt: new Date().toISOString() });
}

// ────────────────────── AUTH ─────────────────────────────────────

/** POST /api/auth/login */
export async function login(username, password) {
  return safeFetch('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  }, null); // Auth should NOT silently succeed — handled in Auth.jsx
}

/** POST /api/auth/signup */
export async function signup({ username, email, password, role, location }) {
  return safeFetch('/api/auth/signup', {
    method: 'POST',
    body: JSON.stringify({ username, email, password, role, location }),
  }, null);
}

/** POST /api/auth/forgot-password */
export async function forgotPassword(email) {
  return safeFetch('/api/auth/forgot-password', {
    method: 'POST',
    body: JSON.stringify({ email }),
  }, null);
}

/** POST /api/auth/reset-password */
export async function resetPassword(token, password) {
  return safeFetch('/api/auth/reset-password', {
    method: 'POST',
    body: JSON.stringify({ token, password }),
  }, null);
}
