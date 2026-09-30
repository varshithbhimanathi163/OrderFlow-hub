import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  getDocFromServer,
  type Firestore,
} from 'firebase/firestore';
import type { OrderSubmission, DashboardStats, ApiKey } from '../src/types.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const isVercel = Boolean(process.env.VERCEL);
const DATA_DIR = isVercel
  ? path.join('/tmp', 'orderflow-data')
  : path.resolve(__dirname, '../data');
const DB_FILE = path.join(DATA_DIR, 'orders.json');
const KEYS_FILE = path.join(DATA_DIR, 'api_keys.json');

// Memory cache + mutex queue to ensure atomic sequential operations
let inMemoryOrders: OrderSubmission[] = [];
let inMemoryKeys: ApiKey[] = [];
let isReady = false;
let writeQueue: Promise<void> = Promise.resolve();
let keysWriteQueue: Promise<void> = Promise.resolve();

// ---------------------------------------------------------------------------
// Firebase Firestore Setup
// ---------------------------------------------------------------------------
let firestoreDb: Firestore | null = null;
let initPromise: Promise<void> | null = null;

function loadFirebaseConfig(): any {
  const configPath = path.resolve(__dirname, '../firebase-applet-config.json');
  if (fs.existsSync(configPath)) {
    try {
      const raw = fs.readFileSync(configPath, 'utf-8');
      return JSON.parse(raw);
    } catch (err) {
      console.error('Failed to parse firebase-applet-config.json:', err);
    }
  }
  return null;
}

function initFirebase(): Firestore | null {
  if (firestoreDb) return firestoreDb;

  const config = loadFirebaseConfig();
  if (!config || !config.apiKey || !config.projectId) {
    console.warn('Firebase config not found or invalid; running in local fallback mode.');
    return null;
  }

  try {
    const app = getApps().length === 0 ? initializeApp(config) : getApp();
    const databaseId = config.firestoreDatabaseId || 'orderflow-hub';
    firestoreDb = getFirestore(app, databaseId);
    console.log(`[Firebase] Initialized Firestore connected to database: "${databaseId}"`);
    return firestoreDb;
  } catch (err) {
    console.error('[Firebase] Failed to initialize Firestore:', err);
    return null;
  }
}

function formatFirestoreError(operation: string, collectionName: string, error: any): Error {
  const errorInfo = {
    error: error?.message || 'Unknown Firestore error',
    operation,
    collection: collectionName,
    code: error?.code || 'unknown',
    database: 'orderflow-hub',
    timestamp: new Date().toISOString(),
  };
  return new Error(JSON.stringify(errorInfo));
}

function ensureDataDir(): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function formatDateDisplay(isoString: string): string {
  try {
    const d = new Date(isoString);
    return d.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    });
  } catch {
    return isoString;
  }
}

function saveDatabaseSync(): void {
  try {
    ensureDataDir();
    const tmpFile = `${DB_FILE}.tmp.${Date.now()}`;
    const data = JSON.stringify(inMemoryOrders, null, 2);
    fs.writeFileSync(tmpFile, data, 'utf-8');
    fs.renameSync(tmpFile, DB_FILE);
  } catch (err) {
    console.warn('Local database sync warning:', err);
  }
}

function saveKeysDatabaseSync(): void {
  try {
    ensureDataDir();
    const tmpFile = `${KEYS_FILE}.tmp.${Date.now()}`;
    const data = JSON.stringify(inMemoryKeys, null, 2);
    fs.writeFileSync(tmpFile, data, 'utf-8');
    fs.renameSync(tmpFile, KEYS_FILE);
  } catch (err) {
    console.warn('Local keys database sync warning:', err);
  }
}

function queueWrite(): Promise<void> {
  writeQueue = writeQueue.then(async () => {
    saveDatabaseSync();
  }).catch((err) => {
    console.error('Database write error:', err);
  });
  return writeQueue;
}

function queueKeysWrite(): Promise<void> {
  keysWriteQueue = keysWriteQueue.then(async () => {
    saveKeysDatabaseSync();
  }).catch((err) => {
    console.error('Keys database write error:', err);
  });
  return keysWriteQueue;
}

// ---------------------------------------------------------------------------
// Reliable Firestore-First Initialization & Realtime Synchronization
// ---------------------------------------------------------------------------

async function initAndSyncFirestore(): Promise<void> {
  ensureDataDir();

  // 1. First, check if a local cache file exists to populate baseline while querying
  if (fs.existsSync(DB_FILE)) {
    try {
      const raw = fs.readFileSync(DB_FILE, 'utf-8');
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        inMemoryOrders = parsed;
      }
    } catch (_) {}
  }

  if (fs.existsSync(KEYS_FILE)) {
    try {
      const raw = fs.readFileSync(KEYS_FILE, 'utf-8');
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        inMemoryKeys = parsed;
      }
    } catch (_) {}
  }

  const db = initFirebase();
  if (!db) {
    isReady = true;
    return;
  }

  try {
    console.log('[Firebase] Hydrating single source of truth from Firestore database "orderflow-hub"...');

    // 1. Fetch all Orders from Firestore
    const ordersCol = collection(db, 'orders');
    const ordersSnap = await getDocs(ordersCol);

    const remoteOrders: OrderSubmission[] = [];
    ordersSnap.forEach((docSnap) => {
      const data = docSnap.data() as OrderSubmission;
      remoteOrders.push(data);
    });

    // Sort newest first
    remoteOrders.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    // Overwrite in-memory state with the verified Firestore state
    inMemoryOrders = remoteOrders;
    saveDatabaseSync();
    console.log(`[Firebase] Successfully loaded ${inMemoryOrders.length} orders from Firestore.`);

    // 2. Fetch all API keys from Firestore
    const keysCol = collection(db, 'api_keys');
    const keysSnap = await getDocs(keysCol);

    const remoteKeys: ApiKey[] = [];
    keysSnap.forEach((docSnap) => {
      remoteKeys.push(docSnap.data() as ApiKey);
    });

    remoteKeys.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    inMemoryKeys = remoteKeys;
    saveKeysDatabaseSync();
    console.log(`[Firebase] Successfully loaded ${inMemoryKeys.length} API keys from Firestore.`);

    // 3. Establish persistent real-time Firestore listeners
    onSnapshot(ordersCol, (snapshot) => {
      const updated: OrderSubmission[] = [];
      snapshot.forEach((d) => {
        updated.push(d.data() as OrderSubmission);
      });
      updated.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      inMemoryOrders = updated;
      saveDatabaseSync();
    }, (err) => {
      console.warn('[Firebase] Orders realtime sync warning:', err.message);
    });

    onSnapshot(keysCol, (snapshot) => {
      const updatedKeys: ApiKey[] = [];
      snapshot.forEach((d) => {
        updatedKeys.push(d.data() as ApiKey);
      });
      updatedKeys.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      inMemoryKeys = updatedKeys;
      saveKeysDatabaseSync();
    }, (err) => {
      console.warn('[Firebase] Keys realtime sync warning:', err.message);
    });

    isReady = true;
  } catch (err) {
    console.error('[Firebase] Failed to query Firestore on startup:', err);
    // Even if initial network read fails, mark as ready so requests don't hang
    isReady = true;
  }
}

/**
 * Guarantees that Firestore data has finished hydration before any read/write executes.
 * Completely eliminates race conditions on page refresh.
 */
export async function ensureDatabaseReady(): Promise<void> {
  if (isReady) return;
  if (!initPromise) {
    initPromise = initAndSyncFirestore();
  }
  await initPromise;
}

// Start hydration immediately upon process startup
ensureDatabaseReady().catch((err) => {
  console.error('[Firebase] Startup hydration error:', err);
});

// ---------------------------------------------------------------------------
// Order ID Generation & CRUD
// ---------------------------------------------------------------------------

export async function generateNextOrderId(): Promise<string> {
  await ensureDatabaseReady();
  const now = new Date();
  const yyyy = now.getUTCFullYear();
  const mm = String(now.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(now.getUTCDate()).padStart(2, '0');
  const datePrefix = `${yyyy}${mm}${dd}`;

  const pattern = new RegExp(`^ORD-${datePrefix}-(\\d+)$`);
  let maxSeq = 0;

  for (const order of inMemoryOrders) {
    const match = order.id.match(pattern);
    if (match && match[1]) {
      const num = parseInt(match[1], 10);
      if (!isNaN(num) && num > maxSeq) {
        maxSeq = num;
      }
    }
  }

  let nextSeq = maxSeq + 1;
  let candidate = `ORD-${datePrefix}-${String(nextSeq).padStart(6, '0')}`;

  const existingIds = new Set(inMemoryOrders.map((o) => o.id));
  while (existingIds.has(candidate)) {
    nextSeq += 1;
    candidate = `ORD-${datePrefix}-${String(nextSeq).padStart(6, '0')}`;
  }

  return candidate;
}

export async function createOrder(data: {
  id?: string;
  name: string;
  mobile: string;
  address: string;
  notes?: string;
  ip?: string;
  sourceUrl?: string;
  userAgent?: string;
}): Promise<OrderSubmission> {
  await ensureDatabaseReady();

  let id = await generateNextOrderId();
  if (data.id && typeof data.id === 'string' && /^ORD-\d{8}-\d{6}$/i.test(data.id.trim())) {
    const requestedId = data.id.trim().toUpperCase();
    const existing = inMemoryOrders.find((o) => o.id === requestedId);
    if (!existing) {
      id = requestedId;
    }
  }

  const now = new Date().toISOString();

  const newOrder: OrderSubmission = {
    id,
    name: data.name.trim(),
    mobile: data.mobile.trim(),
    address: data.address.trim(),
    createdAt: now,
    createdAtFormatted: formatDateDisplay(now),
    status: 'new',
    notes: data.notes || '',
    ip: data.ip,
    sourceUrl: data.sourceUrl,
    userAgent: data.userAgent,
  };

  // 1. Insert into in-memory cache
  inMemoryOrders.unshift(newOrder);
  await queueWrite();

  // 2. Persist to Firebase Firestore as single source of truth
  const db = initFirebase();
  if (db) {
    try {
      const orderDoc = doc(db, 'orders', newOrder.id);
      await setDoc(orderDoc, newOrder);
      console.log(`[Firebase Firestore] Created order "${newOrder.id}" in database "orderflow-hub".`);
    } catch (err) {
      console.error('[Firebase Firestore] Error writing order to Firestore:', err);
      throw formatFirestoreError('createOrder', 'orders', err);
    }
  }

  return newOrder;
}

export async function getAllOrders(params?: {
  search?: string;
  status?: string;
  sortBy?: 'date' | 'id' | 'name';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  pageSize?: number;
}): Promise<{
  submissions: OrderSubmission[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}> {
  await ensureDatabaseReady();

  let filtered = [...inMemoryOrders];

  if (params?.search && params.search.trim()) {
    const query = params.search.toLowerCase().trim();
    filtered = filtered.filter((order) => {
      return (
        order.id.toLowerCase().includes(query) ||
        order.name.toLowerCase().includes(query) ||
        order.mobile.toLowerCase().includes(query) ||
        order.address.toLowerCase().includes(query)
      );
    });
  }

  if (params?.status && params.status !== 'all') {
    filtered = filtered.filter((order) => order.status === params.status);
  }

  const sortBy = params?.sortBy || 'date';
  const sortOrder = params?.sortOrder || 'desc';

  filtered.sort((a, b) => {
    let comp = 0;
    if (sortBy === 'date') {
      comp = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    } else if (sortBy === 'id') {
      comp = a.id.localeCompare(b.id);
    } else if (sortBy === 'name') {
      comp = a.name.localeCompare(b.name);
    }
    return sortOrder === 'desc' ? -comp : comp;
  });

  const total = filtered.length;
  const page = Math.max(1, params?.page || 1);
  const pageSize = Math.max(1, params?.pageSize || 10);
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const startIndex = (page - 1) * pageSize;
  const paginated = filtered.slice(startIndex, startIndex + pageSize);

  return {
    submissions: paginated,
    total,
    page,
    pageSize,
    totalPages,
  };
}

export async function getOrderById(id: string): Promise<OrderSubmission | null> {
  await ensureDatabaseReady();
  return inMemoryOrders.find((o) => o.id === id) || null;
}

export async function updateOrderStatus(
  id: string,
  status: OrderSubmission['status'],
  notes?: string
): Promise<OrderSubmission | null> {
  await ensureDatabaseReady();
  const order = inMemoryOrders.find((o) => o.id === id);
  if (!order) return null;

  order.status = status;
  if (notes !== undefined) {
    order.notes = notes;
  }

  await queueWrite();

  const db = initFirebase();
  if (db) {
    try {
      const orderDoc = doc(db, 'orders', id);
      const updatePayload: Record<string, any> = { status };
      if (notes !== undefined) {
        updatePayload.notes = notes;
      }
      await updateDoc(orderDoc, updatePayload);
      console.log(`[Firebase Firestore] Updated order "${id}" to status "${status}".`);
    } catch (err) {
      console.error('[Firebase Firestore] Error updating order in Firestore:', err);
      throw formatFirestoreError('updateOrderStatus', 'orders', err);
    }
  }

  return order;
}

export async function deleteOrder(id: string): Promise<boolean> {
  await ensureDatabaseReady();
  const index = inMemoryOrders.findIndex((o) => o.id === id);
  if (index === -1) return false;

  inMemoryOrders.splice(index, 1);
  await queueWrite();

  const db = initFirebase();
  if (db) {
    try {
      const orderDoc = doc(db, 'orders', id);
      await deleteDoc(orderDoc);
      console.log(`[Firebase Firestore] Deleted order "${id}" from Firestore.`);
    } catch (err) {
      console.error('[Firebase Firestore] Error deleting order from Firestore:', err);
      throw formatFirestoreError('deleteOrder', 'orders', err);
    }
  }

  return true;
}

export async function getStats(): Promise<DashboardStats> {
  await ensureDatabaseReady();
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();

  let todayCount = 0;
  const breakdown: DashboardStats['statusBreakdown'] = {
    new: 0,
    contacted: 0,
    processing: 0,
    completed: 0,
    cancelled: 0,
  };

  for (const order of inMemoryOrders) {
    const t = new Date(order.createdAt).getTime();
    if (t >= startOfDay) {
      todayCount += 1;
    }
    if (order.status in breakdown) {
      breakdown[order.status] += 1;
    }
  }

  const lastOrder = inMemoryOrders.length > 0 ? inMemoryOrders[0].id : null;

  return {
    total: inMemoryOrders.length,
    todayCount,
    lastOrderId: lastOrder,
    statusBreakdown: breakdown,
  };
}

export async function exportOrdersCsv(): Promise<string> {
  await ensureDatabaseReady();

  const headers = ['Order ID', 'Name', 'Mobile Number', 'Address', 'Status', 'Submitted Date & Time', 'Notes'];

  const rows = inMemoryOrders.map((o) => {
    const escapeCsv = (val: string | undefined) => {
      if (!val) return '""';
      const clean = val.replace(/"/g, '""');
      return `"${clean}"`;
    };

    return [
      escapeCsv(o.id),
      escapeCsv(o.name),
      escapeCsv(o.mobile),
      escapeCsv(o.address),
      escapeCsv(o.status),
      escapeCsv(o.createdAtFormatted),
      escapeCsv(o.notes || ''),
    ].join(',');
  });

  return [headers.join(','), ...rows].join('\n');
}

// ---------------------------------------------------------------------------
// API Keys & Sync Engine with Firebase Firestore
// ---------------------------------------------------------------------------

export async function createApiKey(
  name: string,
  role: 'read' | 'read_write' | 'admin' = 'read_write'
): Promise<ApiKey> {
  await ensureDatabaseReady();

  const token = 'of_live_' + crypto.randomBytes(24).toString('hex');
  const now = new Date().toISOString();
  const id = 'key_' + crypto.randomBytes(8).toString('hex');

  const newKey: ApiKey = {
    id,
    name: (name || 'API Sync Key').trim(),
    key: token,
    keyPrefix: token.slice(0, 16) + '...',
    role,
    createdAt: now,
    createdAtFormatted: formatDateDisplay(now),
    lastUsedAt: null,
    status: 'active',
  };

  inMemoryKeys.unshift(newKey);
  await queueKeysWrite();

  const db = initFirebase();
  if (db) {
    try {
      const keyDoc = doc(db, 'api_keys', newKey.id);
      await setDoc(keyDoc, newKey);
      console.log(`[Firebase Firestore] Created API Key "${newKey.id}" in database "orderflow-hub".`);
    } catch (err) {
      console.error('[Firebase Firestore] Error creating API key in Firestore:', err);
      throw formatFirestoreError('createApiKey', 'api_keys', err);
    }
  }

  return newKey;
}

export async function getAllApiKeys(revealKeys = false): Promise<ApiKey[]> {
  await ensureDatabaseReady();
  return inMemoryKeys.map((k) => ({
    id: k.id,
    name: k.name,
    key: revealKeys ? k.key : undefined,
    keyPrefix: k.key ? `${k.key.slice(0, 14)}...` : k.keyPrefix,
    role: k.role,
    createdAt: k.createdAt,
    createdAtFormatted: k.createdAtFormatted,
    lastUsedAt: k.lastUsedAt,
    status: k.status,
  }));
}

export async function validateApiKey(
  rawKey: string,
  requiredRole?: 'read' | 'read_write' | 'admin'
): Promise<{ valid: boolean; key?: ApiKey; error?: string }> {
  await ensureDatabaseReady();

  if (!rawKey || typeof rawKey !== 'string') {
    return { valid: false, error: 'API key is required in Authorization or x-api-key header.' };
  }

  const cleanKey = rawKey.trim().replace(/^Bearer\s+/i, '');
  const matched = inMemoryKeys.find((k) => k.key === cleanKey);

  if (!matched) {
    return { valid: false, error: 'Invalid or unknown API key.' };
  }

  if (matched.status !== 'active') {
    return { valid: false, error: 'This API key has been revoked.' };
  }

  if (requiredRole === 'admin' && matched.role !== 'admin') {
    return { valid: false, error: 'Insufficient permissions. Requires admin role.' };
  }
  if (requiredRole === 'read_write' && matched.role === 'read') {
    return { valid: false, error: 'Insufficient permissions. Requires read_write role.' };
  }

  const now = new Date().toISOString();
  matched.lastUsedAt = now;
  queueKeysWrite();

  const db = initFirebase();
  if (db) {
    updateDoc(doc(db, 'api_keys', matched.id), { lastUsedAt: now }).catch((err) => {
      console.warn('[Firebase] Non-fatal lastUsedAt update warning:', err.message);
    });
  }

  return { valid: true, key: matched };
}

export async function revokeApiKey(id: string): Promise<boolean> {
  await ensureDatabaseReady();
  const key = inMemoryKeys.find((k) => k.id === id);
  if (!key) return false;
  key.status = 'revoked';
  await queueKeysWrite();

  const db = initFirebase();
  if (db) {
    try {
      await updateDoc(doc(db, 'api_keys', id), { status: 'revoked' });
      console.log(`[Firebase Firestore] Revoked API key "${id}" in Firestore.`);
    } catch (err) {
      console.error('[Firebase Firestore] Error revoking key in Firestore:', err);
      throw formatFirestoreError('revokeApiKey', 'api_keys', err);
    }
  }

  return true;
}

export async function deleteApiKey(id: string): Promise<boolean> {
  await ensureDatabaseReady();
  const initialLength = inMemoryKeys.length;
  inMemoryKeys = inMemoryKeys.filter((k) => k.id !== id);
  if (inMemoryKeys.length !== initialLength) {
    await queueKeysWrite();

    const db = initFirebase();
    if (db) {
      try {
        await deleteDoc(doc(db, 'api_keys', id));
        console.log(`[Firebase Firestore] Deleted API key "${id}" from Firestore.`);
      } catch (err) {
        console.error('[Firebase Firestore] Error deleting key from Firestore:', err);
        throw formatFirestoreError('deleteApiKey', 'api_keys', err);
      }
    }

    return true;
  }
  return false;
}

export async function syncOrders(params: {
  since?: string;
  limit?: number;
  status?: string;
}): Promise<{
  submissions: OrderSubmission[];
  count: number;
  totalAvailable: number;
  lastSyncTimestamp: string;
  hasMore: boolean;
}> {
  await ensureDatabaseReady();

  const limit = Math.min(Math.max(params.limit || 50, 1), 500);
  let filtered = [...inMemoryOrders];

  if (params.since) {
    const sinceTime = new Date(params.since).getTime();
    if (!isNaN(sinceTime)) {
      filtered = filtered.filter((o) => new Date(o.createdAt).getTime() > sinceTime);
    }
  }

  if (params.status && params.status !== 'all') {
    filtered = filtered.filter((o) => o.status === params.status);
  }

  filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const sliced = filtered.slice(0, limit);
  const now = new Date().toISOString();

  return {
    submissions: sliced,
    count: sliced.length,
    totalAvailable: filtered.length,
    lastSyncTimestamp: now,
    hasMore: filtered.length > limit,
  };
}
