import { useMemo } from 'react';
import { Shield, Zap, Globe, ArrowLeft } from 'lucide-react';
import { PayPalButton } from './PayPalButton';
import { ALL_PRODUCTS } from '../data/pricing';


interface CheckoutPageProps {
  productId: string;
  onNavigate: (view: string) => void;
}

export const CheckoutPage: React.FC<CheckoutPageProps> = ({ productId, onNavigate }) => {
  const product = useMemo(() => ALL_PRODUCTS.find(p => p.id === productId), [productId]);

  if (!product) {
    return (
      <div className="flex-grow bg-slate-950 text-white flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Product Not Found</h1>
          <p className="text-slate-400 mb-6">The product you're looking for doesn't exist.</p>
          <button onClick={() => onNavigate('home')} className="px-6 py-3 bg-amber-500 text-black font-bold rounded-lg hover:bg-amber-400 transition">
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  const pillarIcons: Record<string, any> = {
    'api-feed': Zap,
    'services-hub': Shield,
    'placement': Globe,
  };

  const pillarLabels: Record<string, string> = {
    'api-feed': 'XML/API Feed Subscription',
    'services-hub': 'Services Hub Subscription',
    'placement': 'Advertising Placement',
  };

  const handlePaymentSuccess = (orderId: string) => {
    console.log('Payment successful:', orderId, product.id);
  };

  return (
    <div className="flex-grow bg-slate-950 text-white min-h-screen">
      {/* Header */}
      <div className="relative bg-slate-900 border-b border-slate-800 py-10">
        <div className="mx-auto max-w-2xl px-4 sm:px-6">
          <button
            onClick={() => onNavigate('home')}
            className="text-slate-400 hover:text-white text-sm flex items-center gap-1 mb-6 transition"
          >
            <ArrowLeft className="h-3 w-3" />
            Back
          </button>
          <div className="flex items-center gap-3 mb-3">
            {(() => {
              const Icon = pillarIcons[product.pillar] || Globe;
              return <Icon className="h-5 w-5 text-amber-500" />;
            })()}
            <span className="text-amber-500 text-sm font-semibold uppercase tracking-wider">
              {pillarLabels[product.pillar]}
            </span>
          </div>
          <h1 className="text-3xl font-extrabold text-white">{product.name}</h1>
          <p className="text-slate-400 mt-2">{product.description}</p>
        </div>
      </div>

      {/* Checkout Card */}
      <div className="mx-auto max-w-2xl px-4 sm:px-6 py-12">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-8">
          {/* Price */}
          <div className="text-center mb-8">
            <div className="text-5xl font-extrabold text-white">
              £{product.price.toLocaleString()}
            </div>
            <div className="text-slate-400 mt-1">per {product.interval}</div>
          </div>

          {/* Features */}
          <div className="space-y-3 mb-8">
            <div className="flex items-start gap-3">
              <span className="text-amber-500 mt-0.5">✓</span>
              <span className="text-slate-300 text-sm">Immediate activation after payment</span>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-amber-500 mt-0.5">✓</span>
              <span className="text-slate-300 text-sm">Cancel anytime — no long-term commitment</span>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-amber-500 mt-0.5">✓</span>
              <span className="text-slate-300 text-sm">Secure payment via PayPal</span>
            </div>
          </div>

          {/* PayPal Button */}
          <PayPalButton
            amount={product.price}
            currency={product.currency}
            productName={product.name}
            productId={product.id}
            onSuccess={handlePaymentSuccess}
          />

          {/* Footer note */}
          <p className="text-xs text-slate-600 text-center mt-4">
            All prices exclude VAT. By completing payment you agree to LondonFlat's terms of service.
          </p>
        </div>
      </div>
    </div>
  );
};
