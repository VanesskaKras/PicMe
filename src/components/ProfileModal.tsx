import React from 'react';
import {
  X,
  ShieldCheck,
  MapPin,
  Sparkles,
  Check,
  Radio,
  Eye,
  Sliders,
  Award
} from 'lucide-react';
import { UserProfile, VisibilityLevel, AuraLog } from '../types';
import { GraphicIcon } from './GraphicIcon';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
  auraLogs?: AuraLog[];
  onUpdateVisibility: (level: VisibilityLevel) => void;
  onOpenOnboardingEdit: () => void;
  onOpenAura: () => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  onClose,
  user,
  auraLogs,
  onUpdateVisibility,
  onOpenOnboardingEdit,
  onOpenAura,
}) => {
  if (!isOpen) return null;

  // Level & milestone calculations
  const getLevelInfo = (score: number) => {
    if (score < 180) {
      return {
        levelName: 'Reliable Citizen',
        nextLevelPts: Math.max(0, 180 - score),
        progressPercent: Math.min(100, Math.max(12, (score / 180) * 100)),
      };
    } else if (score < 300) {
      return {
        levelName: 'Trusted Resident',
        nextLevelPts: Math.max(0, 300 - score),
        progressPercent: Math.min(100, (score / 300) * 100),
      };
    } else {
      return {
        levelName: 'Map Moderator',
        nextLevelPts: 0,
        progressPercent: 100,
      };
    }
  };

  const levelInfo = getLevelInfo(user.auraScore);

  const defaultActions = [
    { text: 'Added new place: Specialty Cafe Kaph...', delta: '+15' },
    { text: 'Timely response to signal request (prompt reply)...', delta: '+10' },
    { text: 'Mutual connection confirmed in real life...', delta: '+10' },
  ];

  const recentActions = (auraLogs && auraLogs.length > 0)
    ? auraLogs.slice(0, 3).map((log) => ({
        text: log.action.length > 46 ? `${log.action.slice(0, 43)}...` : log.action,
        delta: log.delta > 0 ? `+${log.delta}` : `${log.delta}`,
      }))
    : defaultActions;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-lg bg-[#0a0f24] border border-cyan-500/30 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="relative p-6 pb-4 bg-gradient-to-b from-[#101b44] to-[#0a0f24] border-b border-slate-800">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-16 h-16 rounded-full p-0.5 bg-gradient-to-tr from-cyan-400 via-pink-500 to-emerald-400 shadow-[0_0_20px_rgba(0,240,255,0.4)]">
                <img
                  src={user.avatarUrl}
                  alt={user.name}
                  className="w-full h-full object-cover rounded-full bg-slate-900"
                />
              </div>
              {user.mood && (
                <span className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-slate-950 border border-pink-400 flex items-center justify-center shadow-md">
                  <GraphicIcon nameOrEmoji={user.mood.emoji} size="xs" />
                </span>
              )}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-white tracking-tight">{user.name}</h3>
                <span className="text-xs text-cyan-400 font-mono">{user.handle}</span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                {user.identity} · {user.activity}
              </p>
              <div className="flex items-center gap-2 mt-1.5">
                <button
                  onClick={onOpenAura}
                  className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 hover:bg-cyan-500/30 transition-colors flex items-center gap-1"
                >
                  <Award className="w-3.5 h-3.5 text-cyan-400" />
                  {user.auraScore} Aura
                </button>
                <span className="text-xs text-slate-500">·</span>
                <span className="text-[11px] font-mono text-emerald-400">
                  {user.dailySignalsLimit - user.dailySignalsUsed} signals left
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {/* Current Status & Mood Highlight */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-3 rounded-2xl bg-[#0c142e] border border-cyan-500/20">
              <span className="text-[10px] text-slate-500 block mb-0.5">Character / Status</span>
              <span className="font-semibold text-cyan-300 truncate block">{user.status}</span>
            </div>
            <div className="p-3 rounded-2xl bg-[#141028] border border-pink-500/20">
              <span className="text-[10px] text-slate-500 block mb-0.5">Active Mood</span>
              <span className="font-semibold text-pink-300 truncate flex items-center gap-1.5">
                {user.mood ? (
                  <>
                    <GraphicIcon nameOrEmoji={user.mood.emoji} size="xs" />
                    <span className="truncate">{user.mood.text}</span>
                  </>
                ) : (
                  'No active mood'
                )}
              </span>
            </div>
          </div>

          {/* AURA OF TRUST & CONTRIBUTION CARD (FAITHFUL TO USER SPECIFICATION) */}
          <div className="p-4 sm:p-5 rounded-3xl bg-[#080e22] border border-slate-800/90 shadow-2xl relative overflow-hidden space-y-4">
            {/* Subtle emerald ambient aura glow */}
            <div className="absolute top-0 right-0 w-36 h-36 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

            {/* Top row: Title, Subtitle and Big Score */}
            <div className="flex items-start justify-between gap-3 relative z-10">
              <div className="flex items-start gap-2.5">
                <div className="mt-0.5 text-emerald-400 shrink-0">
                  <svg
                    className="w-5 h-5 text-emerald-400"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="12" cy="8" r="6" />
                    <path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11" />
                  </svg>
                </div>
                <div>
                  <h4 className="text-sm sm:text-base font-bold text-white tracking-tight leading-snug">
                    Aura of Trust & Contribution
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Objective meter of deeds, not likes
                  </p>
                </div>
              </div>

              <div className="text-right shrink-0">
                <div className="text-2xl sm:text-3xl font-extrabold font-mono text-emerald-400 leading-none">
                  {user.auraScore}
                </div>
                <div className="text-[10px] sm:text-[11px] text-slate-400 mt-1 font-medium">
                  reputation points
                </div>
              </div>
            </div>

            {/* Level and Next level row */}
            <div className="space-y-2 relative z-10">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-300">
                  Level: <strong className="text-white font-bold">{levelInfo.levelName}</strong>
                </span>
                <span className="text-slate-400 text-[11px] font-mono">
                  Next level: {levelInfo.nextLevelPts} pts
                </span>
              </div>

              {/* Progress bar */}
              <div className="w-full h-2 bg-slate-800/90 rounded-full overflow-hidden p-[1px]">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full shadow-[0_0_10px_rgba(52,211,153,0.6)] transition-all duration-500"
                  style={{ width: `${levelInfo.progressPercent}%` }}
                />
              </div>

              {/* Moderator unlock milestone notice */}
              <div className="text-[11px] text-slate-300 flex items-center gap-1.5 pt-0.5">
                <Award className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>Reach 300 points to unlock Map Moderator status.</span>
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-slate-800/80 my-1" />

            {/* Recent Actions Section */}
            <div className="space-y-2 relative z-10">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                RECENT ACTIONS THAT CHANGED AURA:
              </span>

              <div className="space-y-1.5">
                {recentActions.map((action, idx) => (
                  <div
                    key={idx}
                    className="px-3.5 py-2.5 rounded-2xl bg-[#070b19] border border-slate-800/80 flex items-center justify-between gap-3 text-xs"
                  >
                    <span className="text-slate-200 truncate font-medium text-[11px] sm:text-xs">
                      {action.text}
                    </span>
                    <span className="font-mono font-bold text-emerald-400 text-xs shrink-0">
                      {action.delta}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 5 Category Summary */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Dublin Profile Context
              </span>
              <button
                onClick={onOpenOnboardingEdit}
                className="text-xs text-cyan-400 hover:underline flex items-center gap-1 font-medium"
              >
                <Sliders className="w-3 h-3" />
                Edit Categories
              </button>
            </div>

            {/* Interests */}
            <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1.5">
              <span className="text-[11px] text-slate-400 font-semibold block">Interests & Fuel</span>
              <div className="flex flex-wrap gap-1.5">
                {user.interests.map((i) => (
                  <span
                    key={i}
                    className="px-2.5 py-1 rounded-lg text-xs font-medium bg-pink-500/15 text-pink-300 border border-pink-500/30"
                  >
                    {i}
                  </span>
                ))}
              </div>
            </div>

            {/* Seeking */}
            <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1.5">
              <span className="text-[11px] text-slate-400 font-semibold block">Seeking in Dublin</span>
              <div className="flex flex-wrap gap-1.5">
                {user.lookingFor.map((i) => (
                  <span
                    key={i}
                    className="px-2.5 py-1 rounded-lg text-xs font-medium bg-cyan-500/15 text-cyan-300 border border-cyan-500/30"
                  >
                    {i}
                  </span>
                ))}
              </div>
            </div>

            {/* Offering */}
            <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1.5">
              <span className="text-[11px] text-slate-400 font-semibold block">What I Offer to Dublin</span>
              <div className="flex flex-wrap gap-1.5">
                {user.offering.map((i) => (
                  <span
                    key={i}
                    className="px-2.5 py-1 rounded-lg text-xs font-medium bg-emerald-500/15 text-emerald-300 border border-emerald-500/30"
                  >
                    {i}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Visibility Controls */}
          <div className="space-y-2.5 pt-2 border-t border-slate-800">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
              Active Geolocation Privacy
            </span>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {[
                { level: 'zone' as VisibilityLevel, label: '500m Zone', desc: 'Blurred circle' },
                { level: 'district' as VisibilityLevel, label: 'District', desc: 'Neighborhood' },
                { level: 'exact' as VisibilityLevel, label: 'Exact Point', desc: 'Precise dot' },
                { level: 'invisible' as VisibilityLevel, label: 'Ghost Mode', desc: 'Invisible to all' },
              ].map((item) => {
                const isSelected = user.visibility === item.level;
                return (
                  <button
                    key={item.level}
                    onClick={() => onUpdateVisibility(item.level)}
                    className={`p-3 rounded-2xl text-left border transition-all ${
                      isSelected
                        ? 'bg-cyan-500/20 border-cyan-400 text-white ring-2 ring-cyan-400/20'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-xs">{item.label}</span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-cyan-400" />}
                    </div>
                    <span className="text-[10px] text-slate-500 block mt-0.5">{item.desc}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-[#0d1430]/70 flex items-center justify-between">
          <span className="text-[11px] text-slate-500 font-mono">PicMe Dublin Citizen Profile</span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
