import React, { useState } from 'react';
import {
  Sparkles,
  Clock,
  X,
  AlertCircle,
  Check
} from 'lucide-react';
import { STATUS_PRESETS, MOOD_PRESETS } from '../data/dublinData';
import { UserMood, UserProfile } from '../types';
import { GraphicIcon } from './GraphicIcon';

interface StatusMoodDrawerProps {
  currentUser: UserProfile;
  isOpen: boolean;
  onClose: () => void;
  onUpdateStatusMood: (status: string, mood?: UserMood) => void;
}

export const StatusMoodDrawer: React.FC<StatusMoodDrawerProps> = ({
  currentUser,
  isOpen,
  onClose,
  onUpdateStatusMood,
}) => {
  const [activeTab, setActiveTab] = useState<'character' | 'mood'>('mood');

  // Character/Status State
  const [selectedStatus, setSelectedStatus] = useState<string>(
    currentUser.status || 'Open to Connect'
  );

  // Mood State
  const [selectedMoodText, setSelectedMoodText] = useState<string>(
    currentUser.mood?.text || 'Craving specialty coffee'
  );
  const [selectedEmoji, setSelectedEmoji] = useState<string>(
    currentUser.mood?.emoji || '☕'
  );
  const [durationHours, setDurationHours] = useState<number>(
    currentUser.mood?.durationHours || 2
  );
  const [customNote, setCustomNote] = useState<string>(
    currentUser.mood?.note || ''
  );

  if (!isOpen) return null;

  const handleSave = () => {
    const updatedMood: UserMood = {
      id: `mood-${Date.now()}`,
      text: selectedMoodText,
      emoji: selectedEmoji,
      durationHours,
      expiresAt: Date.now() + durationHours * 3600 * 1000,
      note: customNote.trim() || undefined,
    };

    onUpdateStatusMood(selectedStatus, updatedMood);
    onClose();
  };

  const clearMood = () => {
    onUpdateStatusMood(selectedStatus, undefined);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-lg bg-[#0a0f24] border-t sm:border border-slate-800 rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header with Switcher Tabs */}
        <div className="p-4 px-6 border-b border-slate-800/80 bg-[#0d1430]/70 flex items-center justify-between">
          <div className="flex items-center gap-1.5 p-1 bg-slate-900 rounded-xl border border-slate-800">
            <button
              onClick={() => setActiveTab('mood')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'mood'
                  ? 'bg-pink-500 text-white shadow-sm shadow-pink-500/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Current Mood (Instant)
            </button>
            <button
              onClick={() => setActiveTab('character')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'character'
                  ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm shadow-cyan-500/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Character / Status (Stable)
            </button>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {activeTab === 'mood' ? (
            /* MOOD TAB (EPHEMERAL MOMENT) */
            <div className="space-y-4">
              <div className="p-3.5 rounded-2xl bg-[#14122d] border border-pink-500/30 text-xs space-y-1">
                <div className="flex items-center gap-2 text-pink-300 font-semibold">
                  <Sparkles className="w-4 h-4 text-pink-400 shrink-0" />
                  <span>Mood is a temporary impulse</span>
                </div>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  Unlike your stable Character, Mood highlights you right now for matching people nearby.
                  It auto-expires and vanishes from the map once its lifetime runs out.
                </p>
              </div>

              {/* Preset Moods */}
              <div>
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-2">
                  Select Quick Mood
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {MOOD_PRESETS.map((m) => {
                    const isSelected = selectedMoodText === m.text;
                    return (
                      <button
                        key={m.text}
                        onClick={() => {
                          setSelectedMoodText(m.text);
                          setSelectedEmoji(m.emoji);
                          setDurationHours(m.defaultHours);
                        }}
                        className={`p-3 rounded-2xl text-left border transition-all flex items-center gap-3 ${
                          isSelected
                            ? 'bg-[#20102b] border-pink-400 ring-2 ring-pink-400/20 text-white'
                            : 'bg-[#0c1228] border-slate-800 text-slate-300 hover:border-slate-700'
                        }`}
                      >
                        <div className="w-10 h-10 rounded-xl bg-slate-950/80 border border-slate-800/80 flex items-center justify-center shrink-0 shadow-inner">
                          <GraphicIcon nameOrEmoji={m.emoji} size={22} glow={isSelected} />
                        </div>
                        <div className="flex-1">
                          <span className="text-xs font-semibold block">{m.text}</span>
                          <span className="text-[10px] text-slate-500">Default: {m.defaultHours}h</span>
                        </div>
                        {isSelected && <Check className="w-4 h-4 text-pink-400" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Duration selector */}
              <div>
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-2">
                  Signal Lifetime (Auto-Expiration)
                </span>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { label: '1 hour', hours: 1, desc: 'Quick coffee' },
                    { label: '3 hours', hours: 3, desc: 'Afternoon' },
                    { label: '8 hours', hours: 8, desc: 'Workday' },
                    { label: '24 hours', hours: 24, desc: 'Weekend vibe' },
                  ].map((dur) => (
                    <button
                      key={dur.hours}
                      onClick={() => setDurationHours(dur.hours)}
                      className={`p-2.5 rounded-xl text-center border transition-all ${
                        durationHours === dur.hours
                          ? 'bg-pink-500/20 border-pink-400 text-pink-200'
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      <span className="text-xs font-bold block">{dur.label}</span>
                      <span className="text-[9px] text-slate-500 block">{dur.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Note with Warning */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    Optional thought / note
                  </span>
                  <span className="text-[10px] text-slate-500">{customNote.length}/90 chars</span>
                </div>
                <input
                  type="text"
                  maxLength={90}
                  value={customNote}
                  onChange={(e) => setCustomNote(e.target.value)}
                  placeholder="e.g. Reading at Ha'penny bridge bench, up for coffee"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-pink-400"
                />

                {/* Explicit Guidance Notice */}
                <div className="p-2.5 rounded-xl bg-amber-950/20 border border-amber-500/30 flex items-start gap-2 text-[11px] text-amber-300">
                  <AlertCircle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                  <p className="leading-tight">
                    <strong>Mindful sharing reminder:</strong> Dublin is a small, connected city. Respect others and think carefully about what you publish.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            /* CHARACTER / STATUS TAB (STABLE ROLE) */
            <div className="space-y-4">
              <div className="p-3.5 rounded-2xl bg-[#0c1836] border border-cyan-500/30 text-xs space-y-1">
                <div className="flex items-center gap-2 text-cyan-300 font-semibold">
                  <span>Character / Status is your persistent stance</span>
                </div>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  Status changes rarely. It determines your default presence category in Dublin. "Open to Connect"
                  increases your radar visibility, while "Busy / In Flow" mutes incoming signals.
                </p>
              </div>

              <div className="space-y-2">
                {STATUS_PRESETS.map((st) => {
                  const isSelected = selectedStatus === st.label;
                  return (
                    <button
                      key={st.id}
                      onClick={() => setSelectedStatus(st.label)}
                      className={`w-full p-3.5 rounded-2xl text-left border transition-all flex items-start gap-3 ${
                        isSelected
                          ? 'bg-[#12224d] border-cyan-400 ring-2 ring-cyan-400/20 text-white'
                          : 'bg-[#0c1228] border-slate-800 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      <div
                        className="w-3 h-3 rounded-full mt-1 shrink-0 shadow-sm"
                        style={{ backgroundColor: st.color }}
                      />
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-0.5">
                          <span className="text-xs font-semibold text-white">{st.label}</span>
                          <span className="text-[10px] font-mono text-cyan-300 uppercase">
                            {st.discoveryWeight} radar
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 leading-snug">{st.description}</p>
                      </div>
                      {isSelected && <Check className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-5 border-t border-slate-800 bg-[#0d1430]/70 flex items-center justify-between">
          {currentUser.mood && activeTab === 'mood' ? (
            <button
              onClick={clearMood}
              className="text-xs text-rose-400 hover:underline px-2 py-1"
            >
              Extinguish Mood
            </button>
          ) : (
            <div className="text-[11px] text-slate-500 font-mono flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span>Real-time presence</span>
            </div>
          )}

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-pink-500 via-cyan-500 to-emerald-500 hover:opacity-95 text-slate-950 font-bold text-xs transition-all shadow-lg shadow-pink-500/20"
            >
              Update Presence
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
