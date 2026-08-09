// @ts-nocheck — Node.js server-side utility
/**
 * Server-side push notification sender for LondonFlat.
 * Requires web-push and VAPID keys.
 * 
 * Usage:
 *   import { sendPushNotification, sendPushToAll } from './utils/sendPush';
 *   await sendPushToAll({ title: 'New Listing!', body: '2-bed in Westminster just listed', url: '/listings' });
 */

const webpush = require('web-push');
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY || 'YlDn8d1iPUDwz1gMdgGKbYxhGc2VgufYXhWEpf4BqhA';
const VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY || 'BN92bcv-IFZdSE8MbTAFyShtUj8c36hqpSwus3ZiRN0PeoQ91rnduyEwSdN8MF9GZbusHD13SHIMS0BTO1QBQzE';
const VAPID_SUBJECT = process.env.VAPID_SUBJECT || 'mailto:info@londonflat.uk';

webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);

interface PushPayload {
  title: string;
  body: string;
  url?: string;
  tag?: string;
}

export async function sendPushNotification(
  subscription: any,
  payload: PushPayload
): Promise<{ success: boolean; error?: string }> {
  try {
    await webpush.sendNotification(subscription, JSON.stringify(payload));
    return { success: true };
  } catch (err: any) {
    // 410 Gone — subscription expired, should be removed
    if (err.statusCode === 410) {
      return { success: false, error: 'expired' };
    }
    return { success: false, error: err.message };
  }
}

export async function sendPushToAll(
  subscriptions: any[],
  payload: PushPayload
): Promise<{ sent: number; failed: number; expired: number }> {
  let sent = 0;
  let failed = 0;
  let expired = 0;

  for (const sub of subscriptions) {
    const result = await sendPushNotification(sub, payload);
    if (result.success) {
      sent++;
    } else if (result.error === 'expired') {
      expired++;
    } else {
      failed++;
    }
  }

  return { sent, failed, expired };
}
