import React, { useState } from 'react';
import {
  Radio,
  Clock,
  CheckCircle,
  X,
  Compass
} from 'lucide-react';
import { NearbyDublinUser, UserProfile } from '../types';
import { GraphicIcon } from './GraphicIcon';

interface SignalModalProps {
  user: NearbyDublinUser | null;
  currentUser: UserProfile;
  isOpen: boolean;
  onClose: () => void;
  onSendSignal: (targetUser: NearbyDublinUser, optionalNote?: string) => void;
  dailySignalsRemaining: number;
}

export const SignalModal: React.FC<SignalModalProps> = ({
  user,
  currentUser,
  isOpen,
  onClose,
  onSendSignal,
  dailySignalsRemaining,
}) => {
  const [signalSent, setSignalSent] = useState(false);
  const [presetNote, setPresetNote] = useState<string>('Saw your vibe on Dublin map · Up to connect!');

  if (!isOpen || !user) return null;

  const handleSend = () => {
    onSendSignal(user, presetNote);
    setSignalSent(true);
    setTimeout(() => {
      setSignalSent(false);
      onClose();
    }, 1800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-md bg-[#0a0f24] border border-pink-500/30 rounded-3xl shadow-2xl overflow-hidden flex flex-col">
        {/* Glow Header */}
        <div className="relative p-5 pb-4 bg-gradient-to-b from-[#14143a] to-[#0a0f24] border-b border-slate-800">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-900/80 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-3.5">
            <div className="relative">
              <div className="w-14 h-14 rounded-full p-0.5 bg-gradient-to-tr from-pink-500 to-cyan-400 shadow-[0_0_20px_rgba(255,42,133,0.5)]">
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
                <h3 className="text-base font-bold text-white tracking-tight">{user.name}</h3>
                <span className="text-xs text-pink-400 font-mono">{user.handle}</span>
              </div>
              <p className="text-xs text-slate-400">
                {user.identity} · {user.activity}
              </p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[11px] font-mono text-cyan-300">
                  {user.mutualScore}% Resonance
                </span>
                <span className="text-[11px] text-slate-500">·</span>
                <span className="text-[11px] text-emerald-400 font-mono">
                  {user.auraScore} Aura
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Body Content */}
        <div className="p-5 space-y-4">
          {/* Signal Conditions Check */}
          <div className="p-3.5 rounded-2xl bg-[#0e1635] border border-cyan-500/20 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400 flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5 text-cyan-400" />
                Signal Resonance
              </span>
              <span className="text-[11px] font-mono text-emerald-400">Conditions Met</span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
              <div className="p-2 rounded-xl bg-slate-950/60 border border-slate-800/80">
                <span className="text-slate-400 block text-[10px]">Current Status</span>
                <span className="font-semibold text-white truncate block">{user.status}</span>
              </div>
              <div className="p-2 rounded-xl bg-slate-950/60 border border-slate-800/80">
                <span className="text-slate-400 block text-[10px]">Active Mood</span>
                <span className="font-semibold text-pink-300 truncate flex items-center gap-1.5 mt-0.5">
                  {user.mood ? (
                    <>
                      <GraphicIcon nameOrEmoji={user.mood.emoji} size="xs" />
                      <span className="truncate">{user.mood.text}</span>
                    </>
                  ) : (
                    'Open vibe'
                  )}
                </span>
              </div>
            </div>

            {user.mood?.note && (
              <p className="text-xs text-slate-300 italic bg-slate-950/40 p-2.5 rounded-xl border border-slate-800/60">
                "{user.mood.note}"
              </p>
            )}

            {user.mood && (
              <div className="flex items-center gap-1.5 text-[11px] text-amber-400/90 font-mono pt-0.5">
                <Clock className="w-3 h-3" />
                <span>Mood active for next ~{user.mood.expiresMinutes} mins</span>
              </div>
            )}
          </div>

          {/* Shared Mutual Tags */}
          <div>
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">
              Mutual Dublin Tags
            </span>
            <div className="flex flex-wrap gap-1.5">
              {user.mutualTags.map((tag) => (
                <span
                  key={tag}
                  className="px-2.5 py-1 rounded-lg text-xs font-medium bg-pink-500/15 text-pink-300 border border-pink-500/30"
                >
                  {tag}
                </span>
              ))}
              {user.interests
                .filter((i) => !user.mutualTags.includes(i))
                .slice(0, 2)
                .map((tag) => (
                  <span
                    key={tag}
                    className="px-2.5 py-1 rounded-lg text-xs text-slate-400 bg-slate-900 border border-slate-800"
                  >
                    {tag}
                  </span>
                ))}
            </div>
          </div>

          {/* Quick Respectful Prompt */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              Signal Context
            </span>
            <div className="grid grid-cols-1 gap-1.5">
              {[
                'Saw your vibe on Dublin map · Up to connect!',
                'Matching coffee & walk interest · Hello from nearby!',
                'Looking for co-working & focus partner · Open to wave!',
              ].map((p) => (
                <button
                  key={p}
                  onClick={() => setPresetNote(p)}
                  className={`p-2 rounded-xl text-left text-xs border transition-colors ${
                    presetNote === p
                      ? 'bg-cyan-500/20 border-cyan-400 text-cyan-200'
                      : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* Anti-Spam Philosophy Explanation */}
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 text-[11px] text-slate-400 space-y-1">
            <div className="flex items-center justify-between text-slate-300 font-medium">
              <span className="flex items-center gap-1.5">
                <Radio className="w-3.5 h-3.5 text-pink-400" />
                Anti-Spam Respect Core
              </span>
              <span className="font-mono text-cyan-400">{dailySignalsRemaining} / 10 left today</span>
            </div>
            <p className="text-[10px] text-slate-500 leading-tight">
              PicMe does not encourage blind swiping. Sending a signal opens a quiet, mutual door. The other person receives a subtle nudge without raw messaging clutter.
            </p>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-5 pt-2 border-t border-slate-800/80 bg-[#0d1430]/60 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl text-xs text-slate-400 hover:text-white"
          >
            Cancel
          </button>

          {signalSent ? (
            <div className="px-5 py-2.5 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-emerald-500/20 animate-bounce">
              <CheckCircle className="w-4 h-4" />
              Signal Radiated!
            </div>
          ) : (
            <button
              onClick={handleSend}
              disabled={dailySignalsRemaining <= 0}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-lg flex items-center gap-2 ${
                dailySignalsRemaining > 0
                  ? 'bg-gradient-to-r from-pink-500 via-pink-600 to-cyan-500 text-white hover:opacity-95 shadow-pink-500/30'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed'
              }`}
            >
              <Radio className="w-4 h-4 text-cyan-200 animate-pulse" />
              Send "Want to Connect" Signal
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
