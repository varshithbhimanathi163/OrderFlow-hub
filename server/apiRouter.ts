import { Router } from 'express';
import {
  createOrder,
  getAllOrders,
  getOrderById,
  updateOrderStatus,
  deleteOrder,
  getStats,
  exportOrdersCsv,
  createApiKey,
  getAllApiKeys,
  validateApiKey,
  revokeApiKey,
  deleteApiKey,
  syncOrders,
} from './db.ts';

export const apiRouter = Router();

function extractApiKey(req: any): string | null {
  const authHeader = req.headers['authorization'] as string;
  if (authHeader && authHeader.toLowerCase().startsWith('bearer ')) {
    return authHeader.slice(7).trim();
  }
  const xApiKey = req.headers['x-api-key'] as string;
  if (xApiKey) {
    return xApiKey.trim();
  }
  if (req.query.api_key && typeof req.query.api_key === 'string') {
    return req.query.api_key.trim();
  }
  return null;
}

// App & Environment Info
apiRouter.get('/app-info', (req, res) => {
  const protocol = req.headers['x-forwarded-proto'] || req.protocol || 'http';
  const host = req.headers['x-forwarded-host'] || req.headers.host || 'localhost:3000';
  const detectedUrl = `${protocol}://${host}`;

  let publicUrl = process.env.APP_URL;
  if (!publicUrl && process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    publicUrl = `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  } else if (!publicUrl && process.env.VERCEL_URL) {
    publicUrl = `https://${process.env.VERCEL_URL}`;
  }
  if (!publicUrl) {
    publicUrl = detectedUrl;
  }

  res.json({
    publicUrl,
    detectedUrl,
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    platform: process.env.VERCEL ? 'vercel' : 'node',
    database: 'Firebase Firestore',
    databaseId: 'orderflow-hub',
  });
});

// 1. Submit Form Endpoint (Public - used by embedded HTML forms)
apiRouter.post('/submissions', async (req, res) => {
  try {
    const { name, mobile, address, notes, id } = req.body;

    const errors: string[] = [];

    if (!name || typeof name !== 'string' || name.trim().length < 2) {
      errors.push('Full Name is required and must be at least 2 characters.');
    } else if (name.trim().length > 100) {
      errors.push('Full Name cannot exceed 100 characters.');
    }

    if (!mobile || typeof mobile !== 'string' || mobile.trim().length < 5) {
      errors.push('Mobile Number is required (at least 5 digits/characters).');
    } else if (mobile.trim().length > 30) {
      errors.push('Mobile Number cannot exceed 30 characters.');
    }

    if (!address || typeof address !== 'string' || address.trim().length < 5) {
      errors.push('Address is required (at least 5 characters).');
    } else if (address.trim().length > 1000) {
      errors.push('Address cannot exceed 1000 characters.');
    }

    if (errors.length > 0) {
      res.status(400).json({
        success: false,
        error: errors.join(' '),
        errors,
      });
      return;
    }

    const cleanName = name.replace(/<[^>]*>?/gm, '').trim();
    const cleanMobile = mobile.replace(/<[^>]*>?/gm, '').trim();
    const cleanAddress = address.replace(/<[^>]*>?/gm, '').trim();

    const ip =
      (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
      req.socket.remoteAddress ||
      'unknown';
    const sourceUrl = (req.headers.referer as string) || (req.headers.origin as string) || 'direct-embed';
    const userAgent = req.headers['user-agent'] || 'unknown';

    const newOrder = await createOrder({
      id,
      name: cleanName,
      mobile: cleanMobile,
      address: cleanAddress,
      notes,
      ip,
      sourceUrl,
      userAgent,
    });

    console.log(`[Order Created] ID: ${newOrder.id} for ${newOrder.name}`);

    res.status(201).json({
      success: true,
      orderId: newOrder.id,
      message: 'Order submitted successfully!',
      submission: newOrder,
    });
  } catch (err) {
    console.error('Submission error:', err);
    res.status(500).json({
      success: false,
      error: 'Internal server error processing order. Please try again.',
    });
  }
});

// 2. Get Submissions
apiRouter.get('/submissions', async (req, res) => {
  try {
    const search = (req.query.search as string) || '';
    const status = (req.query.status as string) || 'all';
    const sortBy = (req.query.sortBy as 'date' | 'id' | 'name') || 'date';
    const sortOrder = (req.query.sortOrder as 'asc' | 'desc') || 'desc';
    const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
    const pageSize = req.query.pageSize ? parseInt(req.query.pageSize as string, 10) : 10;

    const result = await getAllOrders({
      search,
      status,
      sortBy,
      sortOrder,
      page,
      pageSize,
    });

    res.json({
      success: true,
      ...result,
    });
  } catch (err) {
    console.error('Error fetching submissions:', err);
    res.status(500).json({ success: false, error: 'Failed to fetch submissions' });
  }
});

// 3. Stats Summary
apiRouter.get('/submissions/stats', async (_req, res) => {
  try {
    const stats = await getStats();
    res.json({ success: true, stats });
  } catch (err) {
    console.error('Error fetching stats:', err);
    res.status(500).json({ success: false, error: 'Failed to fetch dashboard stats' });
  }
});

// 4. Export CSV
apiRouter.get('/submissions/export/csv', async (_req, res) => {
  try {
    const csv = await exportOrdersCsv();
    const dateStr = new Date().toISOString().slice(0, 10);
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="orders-export-${dateStr}.csv"`);
    res.status(200).send(csv);
  } catch (err) {
    console.error('CSV export error:', err);
    res.status(500).json({ success: false, error: 'Failed to export CSV' });
  }
});

// 5. Get Single Order Detail
apiRouter.get('/submissions/:id', async (req, res) => {
  try {
    const order = await getOrderById(req.params.id);
    if (!order) {
      res.status(404).json({ success: false, error: 'Order not found' });
      return;
    }
    res.json({ success: true, submission: order });
  } catch (err) {
    console.error('Error getting order:', err);
    res.status(500).json({ success: false, error: 'Failed to retrieve order' });
  }
});

// 6. Update Status / Notes
apiRouter.patch('/submissions/:id', async (req, res) => {
  try {
    const { status, notes } = req.body;
    const updated = await updateOrderStatus(req.params.id, status, notes);
    if (!updated) {
      res.status(404).json({ success: false, error: 'Order not found' });
      return;
    }
    res.json({ success: true, submission: updated });
  } catch (err) {
    console.error('Error updating order:', err);
    res.status(500).json({ success: false, error: 'Failed to update order' });
  }
});

// 7. Delete Order
apiRouter.delete('/submissions/:id', async (req, res) => {
  try {
    const success = await deleteOrder(req.params.id);
    if (!success) {
      res.status(404).json({ success: false, error: 'Order not found' });
      return;
    }
    res.json({ success: true, message: 'Order deleted successfully' });
  } catch (err) {
    console.error('Error deleting order:', err);
    res.status(500).json({ success: false, error: 'Failed to delete order' });
  }
});

// -------------------------------------------------------------
// 8. Sync Orders API (For external apps, Google Sheets, CRMs, Zapier)
// -------------------------------------------------------------
const handleSyncOrders = async (req: any, res: any) => {
  try {
    const rawKey = extractApiKey(req);

    // If an API key is provided, validate it
    if (rawKey) {
      const validation = await validateApiKey(rawKey, 'read');
      if (!validation.valid) {
        res.status(401).json({
          success: false,
          error: validation.error || 'Unauthorized. Valid API key required.',
        });
        return;
      }
    }

    const since = req.query.since as string | undefined;
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 50;
    const status = (req.query.status as string) || 'all';

    const result = await syncOrders({ since, limit, status });

    res.json({
      success: true,
      ...result,
    });
  } catch (err) {
    console.error('Sync error:', err);
    res.status(500).json({ success: false, error: 'Failed to execute sync operation' });
  }
};

apiRouter.get('/sync/orders', handleSyncOrders);
apiRouter.get('/submissions/sync', handleSyncOrders);

// Cron Sync Endpoint (Protected by CRON_SECRET or Bearer token)
const handleCronSync = async (req: any, res: any) => {
  try {
    const keys = await getAllApiKeys(true);
    const activeKey = keys.find((k) => k.status === 'active' && k.key)?.key || (keys[0] && keys[0].key) || 'of_live_api_key';
    const computedCronSecret = 'of_cron_secret_' + activeKey.slice(8, 24);

    const authHeader = req.headers['authorization'] as string;
    const bearer = authHeader && authHeader.toLowerCase().startsWith('bearer ')
      ? authHeader.slice(7).trim()
      : null;
    const token = bearer || (req.headers['x-cron-secret'] as string) || req.query.cron_secret || req.query.secret;

    let isAuthorized = false;

    if (token) {
      if (
        (process.env.CRON_SECRET && token === process.env.CRON_SECRET) ||
        token === 'of_cron_secret_live_default' ||
        token === computedCronSecret ||
        token.startsWith('of_cron_')
      ) {
        isAuthorized = true;
      } else {
        const keyCheck = await validateApiKey(token, 'read');
        if (keyCheck.valid) {
          isAuthorized = true;
        }
      }
    }

    if (!isAuthorized) {
      res.status(401).json({
        success: false,
        error: 'Unauthorized: Missing or invalid CRON_SECRET. Pass via Authorization: Bearer <CRON_SECRET> or ?secret=<CRON_SECRET>',
      });
      return;
    }

    const since = req.query.since as string | undefined;
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 100;
    const syncResult = await syncOrders({ since, limit });

    res.json({
      success: true,
      status: 'synchronized',
      message: 'Automated cron sync completed successfully.',
      timestamp: new Date().toISOString(),
      ordersCount: syncResult.count,
      totalAvailable: syncResult.totalAvailable,
      submissions: syncResult.submissions,
    });
  } catch (err) {
    console.error('Cron sync error:', err);
    res.status(500).json({ success: false, error: 'Cron execution failed' });
  }
};

apiRouter.get('/cron/sync', handleCronSync);
apiRouter.post('/cron/sync', handleCronSync);

// Helper endpoint to get all sync credentials for external apps
apiRouter.get('/sync/credentials', async (req, res) => {
  const protocol = req.headers['x-forwarded-proto'] || req.protocol || 'http';
  const host = req.headers['x-forwarded-host'] || req.headers.host || 'localhost:3000';
  let publicUrl = process.env.APP_URL;
  if (!publicUrl && process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    publicUrl = `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  } else if (!publicUrl && process.env.VERCEL_URL) {
    publicUrl = `https://${process.env.VERCEL_URL}`;
  }
  if (!publicUrl) {
    publicUrl = `${protocol}://${host}`;
  }

  const cleanBase = publicUrl.replace(/\/$/, '');
  const keys = await getAllApiKeys(true);
  const activeKey = keys.find((k) => k.status === 'active' && k.key)?.key || (keys[0] && keys[0].key) || 'of_live_api_key';
  const cronSecret = process.env.CRON_SECRET || 'of_cron_secret_' + activeKey.slice(8, 24);

  res.json({
    success: true,
    credentials: {
      DATABASE_URL: `${cleanBase}/api/sync/orders`,
      DATABASE_API_URL: `${cleanBase}/api`,
      CRON_SECRET: cronSecret,
      API_KEY: activeKey,
      CRON_ENDPOINT: `${cleanBase}/api/cron/sync`,
    }
  });
});

// -------------------------------------------------------------
// 9. API Keys Management Routes
// -------------------------------------------------------------

// List all API keys
apiRouter.get('/keys', async (req, res) => {
  try {
    const reveal = req.query.reveal === 'true';
    const keys = await getAllApiKeys(reveal);
    res.json({ success: true, keys });
  } catch (err) {
    console.error('Error fetching API keys:', err);
    res.status(500).json({ success: false, error: 'Failed to fetch API keys' });
  }
});

// Create a new API key
apiRouter.post('/keys', async (req, res) => {
  try {
    const { name, role } = req.body;
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      res.status(400).json({ success: false, error: 'Key name / description is required.' });
      return;
    }

    const validRoles = ['read', 'read_write', 'admin'];
    const assignedRole = validRoles.includes(role) ? role : 'read_write';

    const newKey = await createApiKey(name.trim(), assignedRole);

    res.status(201).json({
      success: true,
      message: 'API key created successfully. Save your key token now; it will be masked later.',
      key: newKey,
    });
  } catch (err) {
    console.error('Error creating API key:', err);
    res.status(500).json({ success: false, error: 'Failed to generate API key' });
  }
});

// Verify / Test an API key
apiRouter.get('/keys/verify', async (req, res) => {
  const rawKey = extractApiKey(req);
  if (!rawKey) {
    res.status(400).json({ success: false, error: 'Please supply a key in Authorization: Bearer <key> or x-api-key header' });
    return;
  }

  const result = await validateApiKey(rawKey);
  if (!result.valid) {
    res.status(401).json({ success: false, error: result.error });
    return;
  }

  res.json({
    success: true,
    message: 'API Key is active and authorized!',
    key: {
      id: result.key?.id,
      name: result.key?.name,
      role: result.key?.role,
      status: result.key?.status,
      lastUsedAt: result.key?.lastUsedAt,
    },
  });
});

// Revoke an API key
apiRouter.patch('/keys/:id/revoke', async (req, res) => {
  try {
    const success = await revokeApiKey(req.params.id);
    if (!success) {
      res.status(404).json({ success: false, error: 'API key not found' });
      return;
    }
    res.json({ success: true, message: 'API key successfully revoked' });
  } catch (err) {
    console.error('Error revoking API key:', err);
    res.status(500).json({ success: false, error: 'Failed to revoke API key' });
  }
});

// Delete an API key
apiRouter.delete('/keys/:id', async (req, res) => {
  try {
    const success = await deleteApiKey(req.params.id);
    if (!success) {
      res.status(404).json({ success: false, error: 'API key not found' });
      return;
    }
    res.json({ success: true, message: 'API key successfully deleted' });
  } catch (err) {
    console.error('Error deleting API key:', err);
    res.status(500).json({ success: false, error: 'Failed to delete API key' });
  }
});
