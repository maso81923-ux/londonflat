import { useEffect, useRef, useState } from 'react';

const PAYPAL_CLIENT_ID = 'BAAA5WLF9BRAD9gkGs0VYJ-NhZmcmYewuvhZiZQ5DF4hzgOmSFngZwWKWAn749FISsqi7X4kFSknWXacmQ';
const PAYPAL_BUSINESS_EMAIL = 'kuldijamahmut75@gmail.com';

interface PayPalButtonProps {
  amount: number;
  currency?: string;
  productName: string;
  productId: string;
  onSuccess?: (orderId: string) => void;
  onError?: (error: Error) => void;
  className?: string;
}

declare global {
  interface Window {
    paypal?: any;
  }
}

export const PayPalButton: React.FC<PayPalButtonProps> = ({
  amount,
  currency = 'GBP',
  productName,
  productId,
  onSuccess,
  onError,
  className,
}) => {
  const buttonRef = useRef<HTMLDivElement>(null);
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load PayPal SDK
  useEffect(() => {
    // Skip if placeholder
    if (PAYPAL_CLIENT_ID === 'PAYPAL_CLIENT_ID_PLACEHOLDER') {
      setError('PayPal Client ID not configured. Add your Client ID to PayPalButton.tsx.');
      return;
    }

    if (window.paypal) {
      setIsScriptLoaded(true);
      return;
    }

    const script = document.createElement('script');
    script.src = `https://www.paypal.com/sdk/js?client-id=${PAYPAL_CLIENT_ID}&currency=${currency}`;
    script.async = true;
    script.onload = () => setIsScriptLoaded(true);
    script.onerror = () => setError('Failed to load PayPal SDK.');
    document.head.appendChild(script);

    return () => {
      // Don't remove script on unmount — it may be used by other buttons
    };
  }, [currency]);

  // Render PayPal button
  useEffect(() => {
    if (!isScriptLoaded || !buttonRef.current || !window.paypal) return;

    // Clear previous button
    buttonRef.current.innerHTML = '';

    window.paypal.Buttons({
      style: {
        layout: 'vertical',
        color: 'gold',
        shape: 'rect',
        label: 'paypal',
      },
      createOrder: (_data: any, actions: any) => {
        return actions.order.create({
          intent: 'CAPTURE',
          purchase_units: [
            {
              description: `${productName} — Monthly Subscription`,
              amount: {
                currency_code: currency,
                value: amount.toString(),
              },
              reference_id: productId,
            },
          ],
        });
      },
      onApprove: async (_data: any, actions: any) => {
        const order = await actions.order.capture();
        if (onSuccess) onSuccess(order.id);
      },
      onError: (err: any) => {
        console.error('PayPal error:', err);
        if (onError) onError(err);
      },
    }).render(buttonRef.current);
  }, [isScriptLoaded, amount, currency, productName, productId, onSuccess, onError]);

  // Show payment link fallback until Client ID is set
  if (PAYPAL_CLIENT_ID === 'PAYPAL_CLIENT_ID_PLACEHOLDER') {
    const paypalLink = `https://www.paypal.com/cgi-bin/webscr?cmd=_xclick&business=${PAYPAL_BUSINESS_EMAIL}&item_name=${encodeURIComponent(productName + ' — Monthly Subscription')}&amount=${amount}&currency_code=${currency}&no_shipping=1`;
    return (
      <div className={className}>
        <a
          href={paypalLink}
          target="_blank"
          rel="noopener noreferrer"
          className="block w-full px-6 py-4 bg-[#FFC439] hover:bg-[#F2BA36] text-[#003087] font-bold rounded-lg text-center transition shadow-md"
        >
          Pay with PayPal — £{amount.toLocaleString()}/{currency === 'GBP' ? 'mo' : ''}
        </a>
        <p className="text-xs text-slate-500 mt-2 text-center">
          You will be redirected to PayPal to complete payment. Your subscription activates immediately after payment.
        </p>
      </div>
    );
  }

  return (
    <div className={className}>
      {error && (
        <div className="mb-3 px-4 py-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
          {error}
        </div>
      )}
      <div ref={buttonRef} />
    </div>
  );
};
