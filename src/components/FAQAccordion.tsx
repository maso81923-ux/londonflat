import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import faqData from '../data/faqs.json';

interface FAQAccordionProps {
  category: string | null;
  categoryLabel?: string;
}

export const FAQAccordion: React.FC<FAQAccordionProps> = ({ category, categoryLabel }) => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  if (!category) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-500 text-sm">Select a category above to see frequently asked questions.</p>
      </div>
    );
  }

  const categoryData = (faqData as any).categories[category];
  if (!categoryData || !categoryData.faqs || categoryData.faqs.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-slate-500 text-sm">No FAQs available for this category yet.</p>
      </div>
    );
  }

  const label = categoryLabel || categoryData.categoryLabel || category;

  return (
    <div className="max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold text-white mb-6">
        Frequently Asked Questions — <span className="text-amber-500">{label}</span>
      </h2>
      <div className="space-y-3">
        {categoryData.faqs.map((faq: any, i: number) => {
          const isOpen = openIndex === i;
          return (
            <div
              key={i}
              className="rounded-xl border border-slate-800 bg-slate-900/30 overflow-hidden"
            >
              <button
                onClick={() => setOpenIndex(isOpen ? null : i)}
                className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-slate-900/50 transition"
              >
                <span className="text-white font-medium text-sm pr-4">{faq.q}</span>
                <ChevronDown
                  className={`h-4 w-4 text-slate-500 shrink-0 transition-transform duration-200 ${
                    isOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>
              {isOpen && (
                <div className="px-5 pb-4">
                  <p className="text-slate-400 text-sm leading-relaxed">{faq.a}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
