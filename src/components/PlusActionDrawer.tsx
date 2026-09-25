import React from 'react';
import {
  X,
  MapPin,
  Briefcase,
  Sparkles,
  ChevronRight,
  Smile,
  Clock,
  Radio,
  Plus
} from 'lucide-react';
import { UserProfile } from '../types';
import { GraphicIcon } from './GraphicIcon';

interface PlusActionDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile;
  onOpenStatusMood: () => void;
  onOpenNewPlace: () => void;
  onOpenNewOpportunity: () => void;
}

export const PlusActionDrawer: React.FC<PlusActionDrawerProps> = ({
  isOpen,
  onClose,
  currentUser,
  onOpenStatusMood,
  onOpenNewPlace,
  onOpenNewOpportunity,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-md animate-fade-in select-none">
      <div className="relative w-full max-w-md bg-[#0a0f24] border-t sm:border border-slate-800 rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 px-6 border-b border-slate-800/80 bg-[#0d1430]/80 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-pink-500 to-cyan-400 flex items-center justify-center text-slate-950 font-bold shadow-md shadow-pink-500/20">
              <Plus className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">Create & Broadcast</h3>
              <p className="text-[11px] text-slate-400">Share presence, spots & opportunities</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content list */}
        <div className="p-4 sm:p-5 space-y-3">
          {/* 1. STATUS & MOOD CARD & WINDOW ("плашка і віконце") */}
          <div
            onClick={() => {
              onClose();
              onOpenStatusMood();
            }}
            role="button"
            tabIndex={0}
            className="w-full text-left p-3.5 rounded-2xl bg-gradient-to-br from-slate-900/90 via-[#101736] to-slate-900 border border-pink-500/30 hover:border-pink-500/60 shadow-lg shadow-pink-500/5 transition-all group cursor-pointer relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-pink-500/10 rounded-full blur-2xl pointer-events-none" />

            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-pink-500/20 border border-pink-500/30 flex items-center justify-center">
                  <GraphicIcon nameOrEmoji={currentUser.mood?.emoji || '✨'} size="xs" />
                </span>
                <span className="text-xs font-bold text-white uppercase tracking-wider">
                  Status & Mood
                </span>
              </div>
              <span className="text-[10px] font-semibold text-pink-400 bg-pink-500/10 border border-pink-500/30 px-2 py-0.5 rounded-full flex items-center gap-1 group-hover:bg-pink-500 group-hover:text-white transition-colors">
                <Sparkles className="w-3 h-3" />
                <span>Update</span>
              </span>
            </div>

            {/* Current Active Status & Mood display */}
            <div className="bg-[#070b19]/80 rounded-xl p-2.5 border border-slate-800/80 flex items-center justify-between">
              <div className="flex items-center gap-2.5 truncate">
                <div className="w-9 h-9 rounded-xl bg-slate-950 border border-pink-500/30 flex items-center justify-center shrink-0 shadow-sm">
                  <GraphicIcon nameOrEmoji={currentUser.mood?.emoji || '☕'} size={20} />
                </div>
                <div className="truncate">
                  <div className="text-xs font-semibold text-white truncate flex items-center gap-1.5">
                    <span>{currentUser.mood?.text || 'Craving specialty coffee'}</span>
                  </div>
                  <div className="text-[10px] text-slate-400 truncate flex items-center gap-2 mt-0.5">
                    <span className="text-cyan-400 font-medium">{currentUser.status || 'Open to Connect'}</span>
                    {currentUser.mood?.note && (
                      <>
                        <span>•</span>
                        <span className="truncate italic">"{currentUser.mood.note}"</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-pink-400 group-hover:translate-x-0.5 transition-all shrink-0 ml-2" />
            </div>
          </div>

          {/* 2. NEW PLACE CARD */}
          <div
            onClick={() => {
              onClose();
              onOpenNewPlace();
            }}
            role="button"
            tabIndex={0}
            className="w-full text-left p-3.5 rounded-2xl bg-gradient-to-br from-slate-900/90 via-[#0e1832] to-slate-900 border border-slate-800 hover:border-pink-400/50 shadow-md transition-all group cursor-pointer flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-pink-500/20 border border-pink-500/30 flex items-center justify-center text-pink-400 group-hover:scale-105 group-hover:bg-pink-500 group-hover:text-white transition-all shadow-md">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h4 className="text-xs font-bold text-white">New Place</h4>
                  <span className="text-[9px] px-1.5 py-0.2 rounded bg-pink-500/10 text-pink-300 font-semibold border border-pink-500/20">
                    +15 Aura
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Add a cafe, pub, park, or coworking spot to the map
                </p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-pink-400 group-hover:translate-x-0.5 transition-all shrink-0 ml-2" />
          </div>

          {/* 3. OPPORTUNITY CARD */}
          <div
            onClick={() => {
              onClose();
              onOpenNewOpportunity();
            }}
            role="button"
            tabIndex={0}
            className="w-full text-left p-3.5 rounded-2xl bg-gradient-to-br from-slate-900/90 via-[#0b1f2b] to-slate-900 border border-slate-800 hover:border-emerald-400/50 shadow-md transition-all group cursor-pointer flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 group-hover:scale-105 group-hover:bg-emerald-500 group-hover:text-slate-950 transition-all shadow-md">
                <Briefcase className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h4 className="text-xs font-bold text-white">Opportunity</h4>
                  <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-300 font-semibold border border-emerald-500/20">
                    +25 Aura
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Post housing sublet, tech job, or community meetup
                </p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-emerald-400 group-hover:translate-x-0.5 transition-all shrink-0 ml-2" />
          </div>
        </div>

        {/* Bottom Tip */}
        <div className="p-3 px-6 bg-[#070b19] border-t border-slate-800/60 text-center">
          <p className="text-[10px] text-slate-500 font-medium">
            Active in Dublin · Contributions build your verified Urban Aura
          </p>
        </div>
      </div>
    </div>
  );
};
