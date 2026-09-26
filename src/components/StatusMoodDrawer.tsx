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
import { useI18n } from '../i18n';

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
  const { t } = useI18n();
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
    <div className="absolute inset-0 z-50 flex items-end @md:items-center justify-center p-0 @md:p-4 bg-ink-strong/40 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-lg bg-white border-t @md:border border-line rounded-t-3xl @md:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-full">
        {/* Header with Switcher Tabs */}
        <div className="p-4 px-6 border-b border-line bg-card/70 flex items-center justify-between">
          <div className="flex items-center gap-1.5 p-1 bg-card rounded-xl border border-line">
            <button
              onClick={() => setActiveTab('mood')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'mood'
                  ? 'bg-ink text-white shadow-sm shadow-ink/30'
                  : 'text-muted hover:text-ink-strong'
              }`}
            >
              {t('Current Mood (Instant)')}
            </button>
            <button
              onClick={() => setActiveTab('character')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'character'
                  ? 'bg-ink text-white font-bold shadow-sm shadow-ink/30'
                  : 'text-muted hover:text-ink-strong'
              }`}
            >
              {t('Character / Status (Stable)')}
            </button>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-card border border-line flex items-center justify-center text-muted hover:text-ink-strong"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {activeTab === 'mood' ? (
            /* MOOD TAB (EPHEMERAL MOMENT) */
            <div className="space-y-4">
              <div className="p-3.5 rounded-2xl bg-card border border-people/30 text-xs space-y-1">
                <div className="flex items-center gap-2 text-people-strong font-semibold">
                  <Sparkles className="w-4 h-4 text-people-strong shrink-0" />
                  <span>{t('Mood is a temporary impulse')}</span>
                </div>
                <p className="text-muted text-[11px] leading-relaxed">
                  {t('Unlike your stable Character, Mood highlights you right now for matching people nearby. It auto-expires and vanishes from the map once its lifetime runs out.')}
                </p>
              </div>

              {/* Preset Moods */}
              <div>
                <span className="text-[11px] font-semibold text-muted uppercase tracking-wider block mb-2">
                  {t('Select Quick Mood')}
                </span>
                <div className="grid grid-cols-1 @md:grid-cols-2 gap-2">
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
                            ? 'bg-people-soft border-people ring-2 ring-people/20 text-ink-strong'
                            : 'bg-card border-line text-muted hover:border-line'
                        }`}
                      >
                        <div className="w-10 h-10 rounded-xl bg-white/80 border border-line flex items-center justify-center shrink-0 shadow-inner">
                          <GraphicIcon nameOrEmoji={m.emoji} size={22} className="text-people-strong" />
                        </div>
                        <div className="flex-1">
                          <span className="text-xs font-semibold block">{t(m.text)}</span>
                          <span className="text-[10px] text-subtle">{t('Default: {n}h', { n: m.defaultHours })}</span>
                        </div>
                        {isSelected && <Check className="w-4 h-4 text-people-strong" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Duration selector */}
              <div>
                <span className="text-[11px] font-semibold text-muted uppercase tracking-wider block mb-2">
                  {t('Signal Lifetime (Auto-Expiration)')}
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
                          ? 'bg-people-soft border-people text-people-strong'
                          : 'bg-card border-line text-muted hover:text-ink-strong'
                      }`}
                    >
                      <span className="text-xs font-bold block">{t(dur.label)}</span>
                      <span className="text-[9px] text-subtle block">{t(dur.desc)}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Note with Warning */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-muted uppercase tracking-wider">
                    {t('Optional thought / note')}
                  </span>
                  <span className="text-[10px] text-subtle">{t('{n}/90 chars', { n: customNote.length })}</span>
                </div>
                <input
                  type="text"
                  maxLength={90}
                  value={customNote}
                  onChange={(e) => setCustomNote(e.target.value)}
                  placeholder={t("e.g. Reading at Ha'penny bridge bench, up for coffee")}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-card border border-line text-xs text-ink-strong focus:outline-none focus:border-people"
                />

                {/* Explicit Guidance Notice */}
                <div className="p-2.5 rounded-xl bg-warning-soft border border-warning/30 flex items-start gap-2 text-[11px] text-warning">
                  <AlertCircle className="w-3.5 h-3.5 text-warning shrink-0 mt-0.5" />
                  <p className="leading-tight">
                    <strong>{t('Mindful sharing reminder:')}</strong> {t('This is a small, connected city. Respect others and think carefully about what you publish.')}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            /* CHARACTER / STATUS TAB (STABLE ROLE) */
            <div className="space-y-4">
              <div className="p-3.5 rounded-2xl bg-card border border-people/30 text-xs space-y-1">
                <div className="flex items-center gap-2 text-people-strong font-semibold">
                  <span>{t('Character / Status is your persistent stance')}</span>
                </div>
                <p className="text-muted text-[11px] leading-relaxed">
                  {t('Status changes rarely. It determines your default presence category. "Open to Connect" increases your radar visibility, while "Busy / In Flow" mutes incoming signals.')}
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
                          ? 'bg-people-soft border-people ring-2 ring-people/20 text-ink-strong'
                          : 'bg-card border-line text-muted hover:border-line'
                      }`}
                    >
                      <div
                        className="w-3 h-3 rounded-full mt-1 shrink-0 shadow-sm ring-1 ring-people/40"
                        style={{ backgroundColor: st.color }}
                      />
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-0.5">
                          <span className="text-xs font-semibold text-ink-strong">{t(st.label)}</span>
                          <span className="text-[10px] font-mono text-people-strong uppercase">
                            {t(`${st.discoveryWeight} radar`)}
                          </span>
                        </div>
                        <p className="text-[11px] text-muted leading-snug">{t(st.description)}</p>
                      </div>
                      {isSelected && <Check className="w-4 h-4 text-people-strong shrink-0 mt-0.5" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-5 border-t border-line bg-card/70 flex items-center justify-between">
          {currentUser.mood && activeTab === 'mood' ? (
            <button
              onClick={clearMood}
              className="text-xs text-danger hover:underline px-2 py-1"
            >
              {t('Extinguish Mood')}
            </button>
          ) : (
            <div className="text-[11px] text-subtle font-mono flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span>{t('Real-time presence')}</span>
            </div>
          )}

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs text-muted hover:text-ink-strong"
            >
              {t('Cancel')}
            </button>
            <button
              onClick={handleSave}
              className="px-5 py-2.5 rounded-xl bg-ink hover:bg-ink-strong text-white font-bold text-xs transition-all shadow-lg shadow-ink/20"
            >
              {t('Update Presence')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
