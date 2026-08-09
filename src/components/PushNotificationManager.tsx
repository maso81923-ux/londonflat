import { useState, useEffect, useCallback } from 'react';
import { Bell, BellOff } from 'lucide-react';
import { VAPID_PUBLIC_KEY, urlBase64ToUint8Array } from '../utils/pushConfig';

interface PushNotificationManagerProps {
  className?: string;
}

export const PushNotificationManager: React.FC<PushNotificationManagerProps> = ({ className }) => {
  const [subscription, setSubscription] = useState<PushSubscription | null>(null);
  const [isSupported, setIsSupported] = useState(false);
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Check support and existing subscription
  useEffect(() => {
    const check = async () => {
      if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
        setIsSupported(false);
        return;
      }

      setIsSupported(true);

      try {
        const reg = await navigator.serviceWorker.ready;
        const existing = await reg.pushManager.getSubscription();
        setSubscription(existing);
      } catch {
        // Not subscribed
      }
    };

    check();
  }, []);

  const subscribe = useCallback(async () => {
    setIsSubscribing(true);
    setStatusMessage(null);

    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY) as BufferSource,
      });

      setSubscription(sub);
      setStatusMessage('Notifications enabled!');

      // Store subscription in database
      try {
        const { db } = await import('../db');
        await db.savePushSubscription(sub.toJSON());
      } catch {
        // Non-critical — subscription still works locally
      }
    } catch (err: any) {
      if (err.name === 'NotAllowedError') {
        setStatusMessage('Notification permission denied. Enable in browser settings.');
      } else {
        setStatusMessage('Could not enable notifications. Try again.');
      }
    } finally {
      setIsSubscribing(false);

      // Clear status after 3 seconds
      setTimeout(() => setStatusMessage(null), 3000);
    }
  }, []);

  const unsubscribe = useCallback(async () => {
    if (subscription) {
      await subscription.unsubscribe();
      setSubscription(null);
      setStatusMessage('Notifications disabled.');
      setTimeout(() => setStatusMessage(null), 3000);
    }
  }, [subscription]);

  if (!isSupported) return null;

  return (
    <div className={className}>
      <div className="relative">
        {subscription ? (
          <button
            onClick={unsubscribe}
            className="relative p-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-500 hover:bg-amber-500/20 transition"
            title="Notifications enabled — click to disable"
          >
            <Bell className="h-5 w-5" />
            <span className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 bg-green-500 rounded-full border-2 border-slate-950" />
          </button>
        ) : (
          <button
            onClick={subscribe}
            disabled={isSubscribing}
            className="relative p-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-400 hover:text-amber-500 hover:border-amber-500/30 transition disabled:opacity-50"
            title="Enable push notifications"
          >
            {isSubscribing ? (
              <span className="h-5 w-5 block animate-pulse rounded-full border-2 border-slate-400 border-t-amber-500 animate-spin" />
            ) : (
              <BellOff className="h-5 w-5" />
            )}
          </button>
        )}
      </div>

      {/* Status toast */}
      {statusMessage && (
        <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 whitespace-nowrap px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-xs text-white shadow-lg z-50 animate-in fade-in slide-in-from-bottom-2">
          {statusMessage}
        </div>
      )}
    </div>
  );
};
