import React, { useState } from 'react';
import {
  Home,
  Briefcase,
  Sparkles,
  Search,
  Filter,
  ShieldCheck,
  Clock,
  MapPin,
  ChevronRight,
  X
} from 'lucide-react';
import { DublinOpportunity } from '../types';
import { GraphicIcon } from './GraphicIcon';
import { useI18n } from '../i18n';

interface OpportunitiesListModalProps {
  isOpen: boolean;
  onClose: () => void;
  opportunities: DublinOpportunity[];
  onSelectOpportunity: (opp: DublinOpportunity) => void;
}

export const OpportunitiesListModal: React.FC<OpportunitiesListModalProps> = ({
  isOpen,
  onClose,
  opportunities,
  onSelectOpportunity,
}) => {
  const { t } = useI18n();
  const [activeTab, setActiveTab] = useState<'all' | 'housing' | 'job' | 'activity'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  if (!isOpen) return null;

  const filtered = opportunities.filter((opp) => {
    if (activeTab !== 'all' && opp.type !== activeTab) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        opp.title.toLowerCase().includes(q) ||
        opp.district.toLowerCase().includes(q) ||
        opp.categoryTag.toLowerCase().includes(q) ||
        t(opp.categoryTag).toLowerCase().includes(q) ||
        opp.description.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="absolute inset-0 z-30 bg-white flex flex-col">
      <div className="relative w-full flex-1 min-h-0 bg-white overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-5 bg-gradient-to-b from-white to-white border-b border-line flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-opp animate-pulse" />
              <h3 className="text-base font-bold text-ink-strong tracking-tight">
                {t('Opportunities Layer')}
              </h3>
            </div>
            <p className="text-xs text-muted mt-0.5">
              {t('Live housing leases, verified PubJobs, and peer activities')}
            </p>
          </div>
        </div>

        {/* Search & Tabs */}
        <div className="p-4 border-b border-line bg-card/60 space-y-3">
          <div className="relative">
            <Search className="w-4 h-4 text-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('Search rentals (e.g. Portobello), tech jobs, runs...')}
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-card/90 border border-line text-xs text-ink-strong placeholder-subtle focus:outline-none focus:border-opp"
            />
          </div>

          <div className="flex items-center gap-1.5 p-1 bg-card rounded-xl border border-line">
            {[
              { id: 'all', label: 'All Opportunities' },
              { id: 'housing', label: 'Housing & Rentals' },
              { id: 'job', label: 'Pub & Tech Jobs' },
              { id: 'activity', label: 'Peer Activities' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === tab.id
                    ? 'bg-opp text-ink-strong font-bold shadow-sm shadow-opp/20'
                    : 'text-muted hover:text-ink-strong'
                }`}
              >
                {t(tab.label)}
              </button>
            ))}
          </div>
        </div>

        {/* List Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {filtered.length > 0 ? (
            filtered.map((opp) => (
              <div
                key={opp.id}
                onClick={() => {
                  onSelectOpportunity(opp);
                  onClose();
                }}
                className="p-4 rounded-2xl bg-card border border-line hover:border-opp/50 cursor-pointer transition-all duration-200 space-y-2.5 group"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-8 h-8 rounded-xl bg-card border border-line flex items-center justify-center shadow">
                      <GraphicIcon nameOrEmoji={opp.type} size="sm" className="text-opp-strong" />
                    </span>
                    <div>
                      <span className="text-[10px] font-mono uppercase text-opp-strong font-bold">
                        {t(opp.categoryTag)}
                      </span>
                      <h4 className="text-sm font-bold text-ink-strong group-hover:text-opp-strong transition-colors">
                        {opp.title}
                      </h4>
                    </div>
                  </div>

                  <span className="font-mono font-bold text-xs text-opp-strong px-2 py-0.5 rounded-lg bg-opp-soft border border-opp/40">
                    {opp.rateOrPrice}
                  </span>
                </div>

                <p className="text-xs text-muted line-clamp-2 leading-relaxed">
                  {opp.description}
                </p>

                <div className="pt-2 border-t border-line flex items-center justify-between text-[11px] text-subtle">
                  <span className="flex items-center gap-1 text-muted">
                    <MapPin className="w-3.5 h-3.5 text-opp-strong" />
                    {opp.district}
                  </span>

                  <div className="flex items-center gap-2">
                    <span className="flex items-center gap-1 text-warning font-mono text-[10px]">
                      <Clock className="w-3 h-3" />
                      {t('{n}d left', { n: opp.expiresInDays })}
                    </span>
                    <span className="text-muted group-hover:translate-x-0.5 transition-transform">
                      <ChevronRight className="w-4 h-4 text-opp-strong" />
                    </span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="py-12 text-center text-subtle space-y-1">
              <p className="text-sm font-semibold">{t('No opportunities matching query')}</p>
              <p className="text-xs">{t('Try switching tabs or clearing filters')}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
