import React from 'react';
import {
  X,
  MapPin,
  Clock,
  Sparkles,
  CheckCircle,
  Share2,
  Bookmark,
  Calendar,
  Building,
  Briefcase,
  Home,
  Navigation,
  ExternalLink,
  ShieldCheck
} from 'lucide-react';
import { DublinPlace, DublinOpportunity } from '../types';
import { GraphicIcon } from './GraphicIcon';

interface ItemDetailDrawerProps {
  place: DublinPlace | null;
  opportunity: DublinOpportunity | null;
  onClose: () => void;
  onBookmark?: (title: string) => void;
  onAction?: (msg: string) => void;
}

export const ItemDetailDrawer: React.FC<ItemDetailDrawerProps> = ({
  place,
  opportunity,
  onClose,
  onBookmark,
  onAction,
}) => {
  if (!place && !opportunity) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 p-3 sm:p-6 flex justify-center pointer-events-none">
      <div className="w-full max-w-lg bg-[#0a0f24]/95 backdrop-blur-xl border border-slate-800 rounded-3xl shadow-2xl overflow-hidden pointer-events-auto animate-slide-up">
        {/* DRAG HANDLE */}
        <div className="pt-3 pb-1 flex justify-center">
          <div className="w-10 h-1 bg-slate-700 rounded-full" />
        </div>

        {/* PLACE DETAIL */}
        {place && (
          <div className="p-5 pt-2 space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 border border-cyan-400/40 text-cyan-300 flex items-center justify-center shadow-[0_0_15px_rgba(0,240,255,0.3)]">
                  <GraphicIcon nameOrEmoji={place.category} size="md" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white tracking-tight">{place.name}</h3>
                  <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                    <span>{place.district}</span>
                    <span className="text-slate-600">·</span>
                    <span>{place.address}</span>
                  </p>
                </div>
              </div>

              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Live Context Banner */}
            <div className="p-3.5 rounded-2xl bg-[#0e1738] border border-cyan-500/30 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-cyan-300 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-cyan-400" />
                  Live Urban Pulse
                </span>
                {place.isQuietHour && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                    Quiet Focus Hour
                  </span>
                )}
                {place.hasLiveEvent && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-pink-500/20 text-pink-300 border border-pink-500/40 animate-pulse">
                    Live Event {place.eventTime}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">{place.liveContext}</p>
            </div>

            {/* Place Tags */}
            <div className="flex flex-wrap gap-1.5">
              {place.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-900 text-slate-300 border border-slate-800"
                >
                  {tag}
                </span>
              ))}
              <span className="px-2.5 py-1 rounded-lg text-xs font-mono font-semibold text-emerald-400 bg-emerald-950/40 border border-emerald-500/30 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-emerald-400" />
                {place.auraScore} Aura Trust
              </span>
            </div>

            {/* Actions */}
            <div className="pt-2 flex items-center gap-2">
              <button
                onClick={() => onAction?.(`Viewing walking route to ${place.name}`)}
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-cyan-500/20 hover:opacity-95"
              >
                <Navigation className="w-3.5 h-3.5" />
                Navigate in Dublin
              </button>
              <button
                onClick={() => onBookmark?.(place.name)}
                className="px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white flex items-center justify-center"
                title="Bookmark Place"
              >
                <Bookmark className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* OPPORTUNITY DETAIL */}
        {opportunity && (
          <div className="p-5 pt-2 space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 flex items-center justify-center shadow-[0_0_15px_rgba(16,185,129,0.3)]">
                  <GraphicIcon nameOrEmoji={opportunity.type} size="md" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-400 font-bold">
                      {opportunity.categoryTag}
                    </span>
                    <span className="text-[10px] text-slate-500">·</span>
                    <span className="text-[10px] text-amber-400 font-mono">
                      Expires in {opportunity.expiresInDays}d
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-white tracking-tight leading-snug">
                    {opportunity.title}
                  </h3>
                </div>
              </div>

              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Price & Location Banner */}
            <div className="p-3 rounded-2xl bg-[#08151f] border border-emerald-500/30 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-400 block">Rate / Price</span>
                <span className="text-base font-bold font-mono text-emerald-300">
                  {opportunity.rateOrPrice}
                </span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-400 block">Dublin Location</span>
                <span className="text-xs font-semibold text-slate-200">
                  {opportunity.district}
                </span>
              </div>
            </div>

            {/* Description */}
            <p className="text-xs text-slate-300 leading-relaxed">
              {opportunity.description}
            </p>

            {/* Organizer & Trust */}
            <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between text-xs">
              <span className="text-slate-400">Listed by <strong className="text-slate-200">{opportunity.organizer}</strong></span>
              {opportunity.verifiedByAura && (
                <span className="flex items-center gap-1 text-[11px] font-medium text-emerald-400">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Aura Verified
                </span>
              )}
            </div>

            {/* Actions */}
            <div className="pt-2 flex items-center gap-2">
              <button
                onClick={() => onAction?.(`Signal sent for ${opportunity.title}`)}
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-emerald-400 to-cyan-500 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-emerald-500/20 hover:opacity-95"
              >
                <Sparkles className="w-3.5 h-3.5" />
                {opportunity.type === 'housing' ? 'Contact Resident / Landlord' : opportunity.type === 'job' ? 'Apply via Dublin Network' : 'Join Activity Circle'}
              </button>
              <button
                onClick={() => onBookmark?.(opportunity.title)}
                className="px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white flex items-center justify-center"
                title="Save Opportunity"
              >
                <Bookmark className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
