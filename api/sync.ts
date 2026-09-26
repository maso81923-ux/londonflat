/**
 * Sync Cron Endpoint — GET/POST /api/sync
 * Triggers the sync engine to poll all due feed URLs.
 *
 * Designed to be called by Vercel Cron Jobs:
 *   - Daily:   "0 3 * * *" (Standard tier — 1440 min interval)
 *   - Realtime: every 15 minutes (Premium tier — 15 min interval, ready)
 *
 * Authentication: `Authorization: Bearer <CRON_SECRET>` header.
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { syncAllDueFeeds } from '../server/feedIngestion/syncEngine';

const CRON_SECRET = process.env.CRON_SECRET || '';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Only allow GET (Vercel cron) or POST (manual trigger)
  if (req.method !== 'GET' && req.method !== 'POST') {
    res.setHeader('Allow', 'GET, POST');
    return res.status(405).json({ error: 'Method not allowed. Use GET or POST.' });
  }

  // Auth via CRON_SECRET
  const authHeader = req.headers['authorization'] || '';
  if (CRON_SECRET && authHeader !== `Bearer ${CRON_SECRET}`) {
    return res.status(401).json({ error: 'Invalid cron secret.' });
  }

  try {
    const { total, results } = await syncAllDueFeeds();
    return res.status(200).json({
      success: true,
      feedsSynced: total,
      results,
      timestamp: new Date().toISOString(),
    });
  } catch (e: any) {
    return res.status(500).json({ error: `Sync failed: ${e.message}` });
  }
}
