import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  onSnapshot,
  query,
  orderBy,
  type Unsubscribe,
  type Firestore,
} from 'firebase/firestore';
import type { OrderSubmission } from './types.ts';

// Client Firebase configuration loaded from firebase-applet-config.json
let cachedDb: Firestore | null = null;

export function getClientFirestore(): Firestore | null {
  if (cachedDb) return cachedDb;

  try {
    const config = {
      projectId: 'gen-lang-client-0849458070',
      appId: '1:965753804056:web:bac4c834707819e8a8ba6d',
      apiKey: 'AIzaSyDNwjQiU1RO5MpWQRYaa80cIGosX5rqUzw',
      authDomain: 'gen-lang-client-0849458070.firebaseapp.com',
      firestoreDatabaseId: 'orderflow-hub',
      storageBucket: 'gen-lang-client-0849458070.firebasestorage.app',
      messagingSenderId: '965753804056',
    };

    const app = getApps().length === 0 ? initializeApp(config) : getApp();
    const db = getFirestore(app, 'orderflow-hub');
    cachedDb = db;
    return db;
  } catch (err) {
    console.warn('[Client Firebase] Could not initialize client Firestore directly:', err);
    return null;
  }
}

/**
 * Real-time listener for orders collection in Firestore (orderflow-hub).
 * Guarantees the frontend stays in sync with Firestore as the single source of truth.
 */
export function subscribeToOrders(
  onOrdersUpdated: (orders: OrderSubmission[]) => void,
  onError?: (error: Error) => void
): Unsubscribe | null {
  const db = getClientFirestore();
  if (!db) return null;

  try {
    const ordersCol = collection(db, 'orders');
    return onSnapshot(
      ordersCol,
      (snapshot) => {
        const orders: OrderSubmission[] = [];
        snapshot.forEach((docSnap) => {
          orders.push(docSnap.data() as OrderSubmission);
        });
        // Sort newest orders first
        orders.sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        onOrdersUpdated(orders);
      },
      (error) => {
        console.warn('[Client Firebase] Realtime orders subscription warning:', error.message);
        if (onError) onError(error);
      }
    );
  } catch (err: any) {
    console.warn('[Client Firebase] Subscription initialization error:', err);
    if (onError) onError(err);
    return null;
  }
}
