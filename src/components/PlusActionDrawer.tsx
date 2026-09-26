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
    <div className="absolute inset-0 z-50 flex items-end @md:items-center justify-center p-0 @md:p-4 bg-ink-strong/40 backdrop-blur-md animate-fade-in select-none">
      <div className="relative w-full max-w-md bg-white border-t @md:border border-line rounded-t-3xl @md:rounded-3xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 px-6 border-b border-line bg-card/80 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-ink flex items-center justify-center text-white font-bold shadow-md shadow-ink/30">
              <Plus className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h3 className="font-bold text-base text-ink-strong">Create & Broadcast</h3>
              <p className="text-[11px] text-muted">Share presence, spots & opportunities</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-card border border-line flex items-center justify-center text-muted hover:text-ink-strong transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content list */}
        <div className="p-4 @md:p-5 space-y-3">
          {/* 1. STATUS & MOOD CARD & WINDOW ("плашка і віконце") */}
          <div
            onClick={() => {
              onClose();
              onOpenStatusMood();
            }}
            role="button"
            tabIndex={0}
            className="w-full text-left p-3.5 rounded-2xl bg-gradient-to-br from-white via-white to-white border border-people/30 hover:border-people/60 shadow-lg shadow-people/5 transition-all group cursor-pointer relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-people-soft rounded-full blur-2xl pointer-events-none" />

            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-people-soft border border-people/30 flex items-center justify-center">
                  <GraphicIcon nameOrEmoji={currentUser.mood?.emoji || '✨'} size="xs" className="text-people-strong" />
                </span>
                <span className="text-xs font-bold text-ink-strong uppercase tracking-wider">
                  Status & Mood
                </span>
              </div>
              <span className="text-[10px] font-semibold text-people-strong bg-people-soft border border-people/30 px-2 py-0.5 rounded-full flex items-center gap-1 group-hover:bg-people group-hover:text-ink-strong transition-colors">
                <Sparkles className="w-3 h-3" />
                <span>Update</span>
              </span>
            </div>

            {/* Current Active Status & Mood display */}
            <div className="bg-card/80 rounded-xl p-2.5 border border-line flex items-center justify-between">
              <div className="flex items-center gap-2.5 truncate">
                <div className="w-9 h-9 rounded-xl bg-white border border-people/30 flex items-center justify-center shrink-0 shadow-sm">
                  <GraphicIcon nameOrEmoji={currentUser.mood?.emoji || '☕'} size={20} className="text-people-strong" />
                </div>
                <div className="truncate">
                  <div className="text-xs font-semibold text-ink-strong truncate flex items-center gap-1.5">
                    <span>{currentUser.mood?.text || 'Craving specialty coffee'}</span>
                  </div>
                  <div className="text-[10px] text-muted truncate flex items-center gap-2 mt-0.5">
                    <span className="text-people-strong font-medium">{currentUser.status || 'Open to Connect'}</span>
                    {currentUser.mood?.note && (
                      <>
                        <span>•</span>
                        <span className="truncate italic">"{currentUser.mood.note}"</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-subtle group-hover:text-people-strong group-hover:translate-x-0.5 transition-all shrink-0 ml-2" />
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
            className="w-full text-left p-3.5 rounded-2xl bg-gradient-to-br from-white via-white to-white border border-line hover:border-place/50 shadow-md transition-all group cursor-pointer flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-place-soft border border-place/30 flex items-center justify-center text-place-strong group-hover:scale-105 group-hover:bg-place group-hover:text-ink-strong transition-all shadow-md">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h4 className="text-xs font-bold text-ink-strong">New Place</h4>
                  <span className="text-[9px] px-1.5 py-0.2 rounded bg-place-soft text-place-strong font-semibold border border-place/20">
                    +15 Aura
                  </span>
                </div>
                <p className="text-[11px] text-muted mt-0.5">
                  Add a cafe, pub, park, or coworking spot to the map
                </p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-subtle group-hover:text-place-strong group-hover:translate-x-0.5 transition-all shrink-0 ml-2" />
          </div>

          {/* 3. OPPORTUNITY CARD */}
          <div
            onClick={() => {
              onClose();
              onOpenNewOpportunity();
            }}
            role="button"
            tabIndex={0}
            className="w-full text-left p-3.5 rounded-2xl bg-gradient-to-br from-white via-white to-white border border-line hover:border-opp/50 shadow-md transition-all group cursor-pointer flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-opp-soft border border-opp/30 flex items-center justify-center text-opp-strong group-hover:scale-105 group-hover:bg-opp group-hover:text-ink-strong transition-all shadow-md">
                <Briefcase className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h4 className="text-xs font-bold text-ink-strong">Opportunity</h4>
                  <span className="text-[9px] px-1.5 py-0.2 rounded bg-opp-soft text-opp-strong font-semibold border border-opp/20">
                    +25 Aura
                  </span>
                </div>
                <p className="text-[11px] text-muted mt-0.5">
                  Post housing sublet, tech job, or community meetup
                </p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-subtle group-hover:text-opp-strong group-hover:translate-x-0.5 transition-all shrink-0 ml-2" />
          </div>
        </div>

        {/* Bottom Tip */}
        <div className="p-3 px-6 bg-card border-t border-line text-center">
          <p className="text-[10px] text-subtle font-medium">
            Active in Dublin · Contributions build your verified Urban Aura
          </p>
        </div>
      </div>
    </div>
  );
};
