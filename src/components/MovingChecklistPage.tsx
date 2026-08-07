import { useState, useEffect, useCallback } from 'react';
import { CheckCircle, Circle, ChevronDown, ChevronUp, ArrowRight, RotateCcw } from 'lucide-react';
import checklistData from '../data/movingChecklist.json';

const STORAGE_KEY = 'londonflat-moving-checklist';

interface MovingChecklistPageProps {
  onNavigate: (view: string, listingId?: string, serviceCategory?: string) => void;
}

export const MovingChecklistPage: React.FC<MovingChecklistPageProps> = ({ onNavigate }) => {
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});

  // Load from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        setChecked(parsed.checked || {});
        setExpandedGroups(parsed.expanded || {});
      } else {
        // Default: all groups expanded
        const defaultExpanded: Record<string, boolean> = {};
        checklistData.groups.forEach(g => { defaultExpanded[g.id] = true; });
        setExpandedGroups(defaultExpanded);
      }
    } catch {}
  }, []);

  // Save to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ checked, expanded: expandedGroups }));
    } catch {}
  }, [checked, expandedGroups]);

  const toggleItem = useCallback((id: string) => {
    setChecked(prev => ({ ...prev, [id]: !prev[id] }));
  }, []);

  const toggleGroup = useCallback((id: string) => {
    setExpandedGroups(prev => ({ ...prev, [id]: !prev[id] }));
  }, []);

  const resetAll = useCallback(() => {
    setChecked({});
  }, []);

  const allItems = checklistData.groups.flatMap(g => g.items);
  const completedCount = allItems.filter(i => checked[i.id]).length;
  const totalCount = allItems.length;
  const progress = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const handleServiceCTA = (slug: string) => {
    onNavigate('services', undefined, slug);
  };

  return (
    <div className="flex-grow bg-slate-950 text-white min-h-screen">
      {/* Hero */}
      <div className="relative bg-slate-900 border-b border-slate-800 py-12 sm:py-20">
        <div className="absolute inset-0 overflow-hidden opacity-20 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-amber-500/20 rounded-full blur-[120px]" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-[120px]" />
        </div>
        <div className="relative mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white mb-4">
            Moving <span className="text-amber-500">Checklist</span>
          </h1>
          <p className="text-lg text-slate-400 mb-8">
            Everything you need to plan a smooth London move. Tick items off as you go — your progress is saved automatically.
          </p>
          {/* Progress bar */}
          <div className="max-w-md mx-auto">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-slate-400">{completedCount} of {totalCount} completed</span>
              <span className="text-amber-500 font-bold">{progress}%</span>
            </div>
            <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-amber-500 rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
          <button
            onClick={resetAll}
            className="mt-6 inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-300 transition"
          >
            <RotateCcw className="h-3 w-3" />
            Reset checklist
          </button>
        </div>
      </div>

      {/* Checklist groups */}
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-12 space-y-6">
        {checklistData.groups.map(group => {
          const groupItems = group.items;
          const groupCompleted = groupItems.filter(i => checked[i.id]).length;
          const isExpanded = expandedGroups[group.id] !== false;

          return (
            <div key={group.id} className="rounded-2xl border border-slate-800 bg-slate-900/50 overflow-hidden">
              <button
                onClick={() => toggleGroup(group.id)}
                className="w-full flex items-center justify-between px-6 py-4 hover:bg-slate-900 transition"
              >
                <div className="flex items-center gap-3">
                  {isExpanded ? (
                    <ChevronDown className="h-5 w-5 text-slate-500" />
                  ) : (
                    <ChevronUp className="h-5 w-5 text-slate-500" />
                  )}
                  <h2 className="text-lg font-bold text-white">{group.label}</h2>
                  <span className="text-sm text-slate-500">
                    {groupCompleted}/{groupItems.length}
                  </span>
                </div>
              </button>

              {isExpanded && (
                <div className="px-6 pb-4 space-y-1">
                  {groupItems.map(item => {
                    const isChecked = checked[item.id];
                    return (
                      <div key={item.id} className="border-t border-slate-800/50 py-3">
                        <div className="flex items-start gap-3">
                          <button
                            onClick={() => toggleItem(item.id)}
                            className="mt-0.5 shrink-0 text-slate-600 hover:text-amber-500 transition"
                          >
                            {isChecked ? (
                              <CheckCircle className="h-5 w-5 text-amber-500" />
                            ) : (
                              <Circle className="h-5 w-5" />
                            )}
                          </button>
                          <div className="flex-1 min-w-0">
                            <span className={`block text-sm ${isChecked ? 'text-slate-500 line-through' : 'text-white'}`}>
                              {item.label}
                            </span>
                            {item.tip && (
                              <span className="block text-xs text-slate-500 mt-1">{item.tip}</span>
                            )}
                            {item.serviceHubCategory && item.serviceHubSlug && (
                              <button
                                onClick={(e) => { e.stopPropagation(); handleServiceCTA(item.serviceHubSlug!); }}
                                className="mt-2 inline-flex items-center gap-1.5 text-xs font-medium text-amber-500 hover:text-amber-400 transition group"
                              >
                                Need help with this?
                                <span className="underline group-hover:no-underline">
                                  View {item.serviceHubCategory} providers
                                </span>
                                <ArrowRight className="h-3 w-3" />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
