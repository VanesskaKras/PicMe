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
    <div className="absolute inset-0 z-50 flex items-center justify-center p-3 bg-ink-strong/40 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-md bg-white border border-people/30 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-full">
        {/* Glow Header */}
        <div className="relative shrink-0 p-4 pb-3.5 bg-white border-b border-line">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-card/80 border border-line flex items-center justify-center text-muted hover:text-ink-strong"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-3.5">
            <div className="relative">
              <div className="w-14 h-14 rounded-full p-0.5 bg-people shadow-md shadow-people/40">
                <img
                  src={user.avatarUrl}
                  alt={user.name}
                  className="w-full h-full object-cover rounded-full bg-card"
                />
              </div>
              {user.mood && (
                <span className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-white border border-people flex items-center justify-center shadow-md">
                  <GraphicIcon nameOrEmoji={user.mood.emoji} size="xs" className="text-people-strong" />
                </span>
              )}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-ink-strong tracking-tight">{user.name}</h3>
                <span className="text-xs text-people-strong font-mono">{user.handle}</span>
              </div>
              <p className="text-xs text-muted">
                {user.identity} · {user.activity}
              </p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[11px] font-mono text-people-strong">
                  {user.mutualScore}% Resonance
                </span>
                <span className="text-[11px] text-subtle">·</span>
                <span className="text-[11px] text-people-strong font-mono">
                  {user.auraScore} Aura
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Body Content: scrolls when the card is taller than the screen */}
        <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar p-4 space-y-4">
          {/* Signal Conditions Check */}
          <div className="p-3.5 rounded-2xl bg-card border border-success/20 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5 text-success" />
                Signal Resonance
              </span>
              <span className="text-[11px] font-mono text-success">Conditions Met</span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
              <div className="p-2 rounded-xl bg-white/60 border border-line">
                <span className="text-muted block text-[10px]">Current Status</span>
                <span className="font-semibold text-ink-strong truncate block">{user.status}</span>
              </div>
              <div className="p-2 rounded-xl bg-white/60 border border-line">
                <span className="text-muted block text-[10px]">Active Mood</span>
                <span className="font-semibold text-people-strong truncate flex items-center gap-1.5 mt-0.5">
                  {user.mood ? (
                    <>
                      <GraphicIcon nameOrEmoji={user.mood.emoji} size="xs" className="text-people-strong" />
                      <span className="truncate">{user.mood.text}</span>
                    </>
                  ) : (
                    'Open vibe'
                  )}
                </span>
              </div>
            </div>

            {user.mood?.note && (
              <p className="text-xs text-muted italic bg-white/40 p-2.5 rounded-xl border border-line">
                "{user.mood.note}"
              </p>
            )}

            {user.mood && (
              <div className="flex items-center gap-1.5 text-[11px] text-warning font-mono pt-0.5">
                <Clock className="w-3 h-3" />
                <span>Mood active for next ~{user.mood.expiresMinutes} mins</span>
              </div>
            )}
          </div>

          {/* Shared Mutual Tags */}
          <div>
            <span className="text-[11px] font-semibold text-muted uppercase tracking-wider block mb-1.5">
              Mutual Dublin Tags
            </span>
            <div className="flex flex-wrap gap-1.5">
              {user.mutualTags.map((tag) => (
                <span
                  key={tag}
                  className="px-2.5 py-1 rounded-lg text-xs font-medium bg-people-soft text-people-strong border border-people/30"
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
                    className="px-2.5 py-1 rounded-lg text-xs text-muted bg-card border border-line"
                  >
                    {tag}
                  </span>
                ))}
            </div>
          </div>

          {/* Quick Respectful Prompt */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-semibold text-muted uppercase tracking-wider block">
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
                      ? 'bg-people-soft border-people text-people-strong'
                      : 'bg-card/80 border-line text-muted hover:text-ink-strong'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* Anti-Spam Philosophy Explanation */}
          <div className="p-3 rounded-xl bg-white border border-line text-[11px] text-muted space-y-1">
            <div className="flex items-center justify-between text-muted font-medium">
              <span className="flex items-center gap-1.5">
                <Radio className="w-3.5 h-3.5 text-people-strong" />
                Anti-Spam Respect Core
              </span>
              <span className="font-mono text-people-strong">{dailySignalsRemaining} / 10 left today</span>
            </div>
            <p className="text-[10px] text-subtle leading-tight">
              PicMe does not encourage blind swiping. Sending a signal opens a quiet, mutual door. The other person receives a subtle nudge without raw messaging clutter.
            </p>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="shrink-0 px-4 py-3 border-t border-line bg-card/60 flex items-center justify-between gap-2">
          <button
            onClick={onClose}
            className="shrink-0 px-3 py-2.5 rounded-xl text-xs text-muted hover:text-ink-strong"
          >
            Cancel
          </button>

          {signalSent ? (
            <div className="px-5 py-2.5 rounded-xl bg-success text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-success/20 animate-bounce">
              <CheckCircle className="w-4 h-4" />
              Signal Radiated!
            </div>
          ) : (
            <button
              onClick={handleSend}
              disabled={dailySignalsRemaining <= 0}
              className={`min-w-0 px-4 py-2.5 rounded-xl text-xs font-bold text-left transition-all shadow-lg flex items-center gap-2 ${
                dailySignalsRemaining > 0
                  ? 'bg-people hover:bg-people-hover text-ink-strong shadow-people/30'
                  : 'bg-line text-subtle cursor-not-allowed'
              }`}
            >
              <Radio className="w-4 h-4 shrink-0 animate-pulse" />
              Send "Want to Connect" Signal
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
