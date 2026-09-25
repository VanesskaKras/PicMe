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
        opp.description.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-xl bg-[#0a0f24] border border-emerald-500/30 rounded-3xl shadow-2xl overflow-hidden flex flex-col h-[88vh] max-h-[680px]">
        {/* Header */}
        <div className="p-5 bg-gradient-to-b from-[#0e1d2c] to-[#0a0f24] border-b border-slate-800 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <h3 className="text-base font-bold text-white tracking-tight">
                Dublin Opportunities Layer
              </h3>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Live Dublin housing leases, verified PubJobs, and peer activities
            </p>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search & Tabs */}
        <div className="p-4 border-b border-slate-800/80 bg-[#0d1430]/60 space-y-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search Dublin rentals (e.g. Portobello), tech jobs, runs..."
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-900/90 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-400"
            />
          </div>

          <div className="flex items-center gap-1.5 p-1 bg-slate-900 rounded-xl border border-slate-800">
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
                    ? 'bg-emerald-500 text-slate-950 font-bold shadow-sm shadow-emerald-500/20'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {tab.label}
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
                className="p-4 rounded-2xl bg-[#0c132c] border border-slate-800 hover:border-emerald-400/50 cursor-pointer transition-all duration-200 space-y-2.5 group"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-8 h-8 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center shadow">
                      <GraphicIcon nameOrEmoji={opp.type} size="sm" />
                    </span>
                    <div>
                      <span className="text-[10px] font-mono uppercase text-emerald-400 font-bold">
                        {opp.categoryTag}
                      </span>
                      <h4 className="text-sm font-bold text-white group-hover:text-emerald-300 transition-colors">
                        {opp.title}
                      </h4>
                    </div>
                  </div>

                  <span className="font-mono font-bold text-xs text-emerald-300 px-2 py-0.5 rounded-lg bg-emerald-950/60 border border-emerald-500/30">
                    {opp.rateOrPrice}
                  </span>
                </div>

                <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                  {opp.description}
                </p>

                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500">
                  <span className="flex items-center gap-1 text-slate-400">
                    <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                    {opp.district}
                  </span>

                  <div className="flex items-center gap-2">
                    <span className="flex items-center gap-1 text-amber-400 font-mono text-[10px]">
                      <Clock className="w-3 h-3" />
                      {opp.expiresInDays}d left
                    </span>
                    <span className="text-slate-400 group-hover:translate-x-0.5 transition-transform">
                      <ChevronRight className="w-4 h-4 text-emerald-400" />
                    </span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="py-12 text-center text-slate-500 space-y-1">
              <p className="text-sm font-semibold">No opportunities matching query</p>
              <p className="text-xs">Try switching tabs or clearing filters</p>
            </div>
          )}
        </div>

        {/* Footer info note */}
        <div className="p-3 bg-[#060a17] border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-500">
          <span>Sourced from Dublin verified peer networks & Daft community listings</span>
          <span className="font-mono text-emerald-400">{filtered.length} active opportunities</span>
        </div>
      </div>
    </div>
  );
};
