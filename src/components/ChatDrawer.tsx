import React, { useState, useMemo } from 'react';
import {
  X,
  Zap,
  Radio,
  Clock,
  Shield,
  Send,
  Eye,
  CheckCircle,
  ThumbsDown,
  Lock,
  MessageSquareShare,
  Compass,
  Sparkles,
  MapPin,
  ArrowLeft,
  Coffee,
  Check
} from 'lucide-react';
import { ChatThreadItem, NearbyDublinUser, UserProfile } from '../types';
import { GraphicIcon } from './GraphicIcon';
import { useI18n, TFunction } from '../i18n';

interface ChatDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  threads: ChatThreadItem[];
  currentUser: UserProfile;
  nearbyUsers: NearbyDublinUser[];
  dailySignalsRemaining: number;
  onSendSignal: (targetUser: NearbyDublinUser, optionalNote?: string) => void;
  onReplyThread: (threadId: string, text: string) => void;
  onPolitelyDecline: (threadId: string) => void;
  onBlockReport: (threadId: string) => void;
  onOpenStatusMood?: () => void;
}

// Calculate approximate distance in meters
function getApproxDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
  t: TFunction
): string {
  const R = 6371e3; // Earth radius in meters
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
  const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const meters = Math.round(R * c);

  if (meters < 1000) return t('~{n}m away', { n: meters });
  return t('~{n}km away', { n: (meters / 1000).toFixed(1) });
}

export const ChatDrawer: React.FC<ChatDrawerProps> = ({
  isOpen,
  onClose,
  threads,
  currentUser,
  nearbyUsers,
  dailySignalsRemaining,
  onSendSignal,
  onReplyThread,
  onPolitelyDecline,
  onBlockReport,
  onOpenStatusMood,
}) => {
  // Main view tabs: ONLY 'resonance' and 'requests' (explicitly NO history tab)
  const { t } = useI18n();
  const [activeMainTab, setActiveMainTab] = useState<'resonance' | 'requests'>('resonance');

  // Resonance sub-filters
  const [resonanceFilter, setResonanceFilter] = useState<'all' | 'mood' | 'high_match' | 'nearby'>('all');

  // Requests sub-tabs: 'received' or 'sent'
  const [requestsSubTab, setRequestsSubTab] = useState<'received' | 'sent'>('received');

  // Active dialogue within Requests
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);
  const [replyInput, setReplyInput] = useState('');
  const [revealedSecrets, setRevealedSecrets] = useState<Record<string, boolean>>({});

  // Context modal for sending a signal from Resonance tab
  const [signalingUser, setSignalingUser] = useState<NearbyDublinUser | null>(null);
  const [presetNote, setPresetNote] = useState('Saw your vibe on the map · Up to connect!');
  const [signalSuccessMsg, setSignalSuccessMsg] = useState<string | null>(null);

  // user coordinates for Portobello reference
  const userLat = 53.3330;
  const userLng = -6.2655;

  // Threads categorized into received and sent
  const receivedThreads = useMemo(() => {
    return threads.filter((t) => {
      const firstMsg = t.history[0];
      return firstMsg ? firstMsg.sender === 'peer' : true;
    });
  }, [threads]);

  const sentThreads = useMemo(() => {
    return threads.filter((t) => {
      const firstMsg = t.history[0];
      return firstMsg ? firstMsg.sender === 'me' : false;
    });
  }, [threads]);

  // Set of user IDs to which a signal was already sent
  const sentUserIds = useMemo(() => {
    return new Set(threads.map((t) => t.peerId));
  }, [threads]);

  // Filtered resonant users
  const resonantUsers = useMemo(() => {
    return nearbyUsers.filter((u) => {
      if (resonanceFilter === 'mood') {
        return Boolean(u.mood);
      }
      if (resonanceFilter === 'high_match') {
        return u.mutualScore >= 80;
      }
      if (resonanceFilter === 'nearby') {
        // Distance roughly under 1.2km
        const dist = Math.hypot((u.lat - userLat) * 111000, (u.lng - userLng) * 65000);
        return dist <= 1200;
      }
      return true;
    });
  }, [nearbyUsers, resonanceFilter]);

  if (!isOpen) return null;

  const currentDialogueThread = threads.find((t) => t.id === activeThreadId);

  const handleReveal = (threadId: string) => {
    setRevealedSecrets((prev) => ({ ...prev, [threadId]: true }));
  };

  const handleSendReply = () => {
    if (!replyInput.trim() || !currentDialogueThread) return;
    onReplyThread(currentDialogueThread.id, replyInput.trim());
    setReplyInput('');
  };

  const handleInitiateSignal = (targetUser: NearbyDublinUser) => {
    setSignalingUser(targetUser);
  };

  const handleConfirmSignal = () => {
    if (!signalingUser) return;
    onSendSignal(signalingUser, t(presetNote));
    setSignalSuccessMsg(t('Signal radiated to {name}!', { name: signalingUser.name }));
    setTimeout(() => {
      setSignalSuccessMsg(null);
      setSignalingUser(null);
    }, 1500);
  };

  return (
    <div className="absolute inset-0 z-30 bg-white flex flex-col">
      <div className="relative w-full flex-1 min-h-0 bg-white overflow-hidden flex flex-col">
        {/* Glow Header */}
        <div className="relative p-4 @md:p-5 bg-gradient-to-b from-white to-white border-b border-line shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* Green Bolt Icon */}
              <div className="w-10 h-10 rounded-2xl bg-people-soft border border-people/40 flex items-center justify-center text-people-strong shadow-sm">
                <Zap className="w-5 h-5 fill-people" />
              </div>
              <div>
                <h3 className="text-base font-bold text-ink-strong tracking-tight flex items-center gap-2">
                  {t('Signals & Resonance')}
                </h3>
                <p className="text-xs text-muted">
                  {t('Intentional connection radar · Zero ghosting protocol')}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Daily Signals Pill */}
              <div className="px-3 py-1.5 rounded-xl bg-card/90 border border-people/30 text-people-strong font-mono text-xs flex items-center gap-1.5 shadow-sm">
                <Zap className="w-3.5 h-3.5 text-people-strong fill-people" />
                <span>{t('{n} / 10 left', { n: dailySignalsRemaining })}</span>
              </div>
            </div>
          </div>

          {/* TWO MAIN TABS (RESONANCE & REQUESTS) - EXPLICITLY NO HISTORY TAB */}
          <div className="grid grid-cols-2 gap-2 mt-4 p-1 rounded-2xl bg-card border border-line">
            {/* TAB 1: RESONANCE */}
            <button
              onClick={() => {
                setActiveMainTab('resonance');
                setActiveThreadId(null);
              }}
              className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                activeMainTab === 'resonance'
                  ? 'bg-ink-soft text-ink border border-ink/40'
                  : 'text-muted hover:text-ink-strong border border-transparent'
              }`}
            >
              <Zap className="w-4 h-4 text-current" />
              <span>{t('Resonance')}</span>
              <span className="px-1.5 py-0.5 rounded-full text-[10px] font-mono bg-people-soft text-people-strong border border-people/30">
                {nearbyUsers.length}
              </span>
            </button>

            {/* TAB 2: REQUESTS */}
            <button
              onClick={() => setActiveMainTab('requests')}
              className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                activeMainTab === 'requests'
                  ? 'bg-ink-soft text-ink border border-ink/40'
                  : 'text-muted hover:text-ink-strong border border-transparent'
              }`}
            >
              <Radio className="w-4 h-4 text-current" />
              <span>{t('Requests')}</span>
              {receivedThreads.length > 0 && (
                <span className="px-1.5 py-0.5 rounded-full text-[10px] font-mono bg-people-soft text-people-strong border border-people/30 animate-pulse">
                  {receivedThreads.length}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* BODY CONTENT AREA */}
        <div className="flex-1 overflow-y-auto p-4 @md:p-5">
          {/* ========================================================================= */}
          {/* TAB 1: RESONANCE VIEW                                                     */}
          {/* ========================================================================= */}
          {activeMainTab === 'resonance' && (
            <div className="space-y-4">
              {/* Sub-filter chips */}
              <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
                <span className="text-[11px] font-bold text-muted shrink-0">{t('Filter:')}</span>
                <button
                  onClick={() => setResonanceFilter('all')}
                  className={`px-3 py-1 rounded-xl text-[11px] font-medium transition-all shrink-0 ${
                    resonanceFilter === 'all'
                      ? 'bg-ink-soft text-ink border border-ink/40 font-bold shadow-sm'
                      : 'bg-card/80 text-muted hover:text-ink-strong border border-line'
                  }`}
                >
                  {t('All Resonant ({n})', { n: nearbyUsers.length })}
                </button>
                <button
                  onClick={() => setResonanceFilter('mood')}
                  className={`px-3 py-1 rounded-xl text-[11px] font-medium transition-all shrink-0 flex items-center gap-1 ${
                    resonanceFilter === 'mood'
                      ? 'bg-ink-soft text-ink border border-ink/40 font-bold shadow-sm'
                      : 'bg-card/80 text-muted hover:text-ink-strong border border-line'
                  }`}
                >
                  <span>{t('Shared Mood')}</span>
                  <Coffee className="w-3 h-3 text-current" />
                </button>
                <button
                  onClick={() => setResonanceFilter('high_match')}
                  className={`px-3 py-1 rounded-xl text-[11px] font-medium transition-all shrink-0 ${
                    resonanceFilter === 'high_match'
                      ? 'bg-ink-soft text-ink border border-ink/40 font-bold shadow-sm'
                      : 'bg-card/80 text-muted hover:text-ink-strong border border-line'
                  }`}
                >
                  {t('High Match (80%+)')}
                </button>
                <button
                  onClick={() => setResonanceFilter('nearby')}
                  className={`px-3 py-1 rounded-xl text-[11px] font-medium transition-all shrink-0 flex items-center gap-1 ${
                    resonanceFilter === 'nearby'
                      ? 'bg-ink-soft text-ink border border-ink/40 font-bold shadow-sm'
                      : 'bg-card/80 text-muted hover:text-ink-strong border border-line'
                  }`}
                >
                  <MapPin className="w-3 h-3 text-current" />
                  <span>{t('Nearby (<1.2km)')}</span>
                </button>
              </div>

              {/* Live Resonant Cards */}
              <div className="grid grid-cols-1 gap-3.5">
                {resonantUsers.map((user) => {
                  const isSignalSent = sentUserIds.has(user.id);
                  const distanceStr = getApproxDistance(userLat, userLng, user.lat, user.lng, t);

                  return (
                    <div
                      key={user.id}
                      className="p-4 rounded-2xl bg-card border border-line hover:border-line transition-all space-y-3 shadow-lg"
                    >
                      {/* Top User Info Row */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            <img
                              src={user.avatarUrl}
                              alt={user.name}
                              className="w-12 h-12 rounded-full object-cover border border-people/50 bg-card"
                            />
                            {user.mood && (
                              <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-white border border-people flex items-center justify-center shadow">
                                <GraphicIcon nameOrEmoji={user.mood.emoji} size="xs" className="text-people-strong" />
                              </span>
                            )}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="text-sm font-bold text-ink-strong">{user.name}</h4>
                              <span className="text-xs text-people-strong font-mono">{user.handle}</span>
                            </div>
                            <p className="text-xs text-muted">
                              {t(user.identity)} · {t(user.activity)}
                            </p>
                            <p className="text-[11px] text-subtle flex items-center gap-1 mt-0.5">
                              <MapPin className="w-3 h-3 text-muted" />
                              <span>{user.district} · {distanceStr}</span>
                            </p>
                          </div>
                        </div>

                        {/* Scores */}
                        <div className="text-right shrink-0">
                          <div className="inline-block px-2.5 py-1 rounded-xl bg-people-soft border border-people/30 text-people-strong font-mono text-xs font-bold shadow-sm">
                            {t('{n}% Resonance', { n: user.mutualScore })}
                          </div>
                          <div className="text-[10px] text-people-strong font-mono mt-1">
                            {user.auraScore} {t('Aura')}
                          </div>
                        </div>
                      </div>

                      {/* Resonance Reason Banner */}
                      <div className="p-2.5 rounded-xl bg-white/70 border border-line space-y-1 text-xs">
                        {user.mood ? (
                          <div className="flex items-start gap-2 text-people-strong">
                            <span className="shrink-0 mt-0.5">
                              <GraphicIcon nameOrEmoji={user.mood.emoji} size="sm" className="text-people-strong" />
                            </span>
                            <div className="min-w-0">
                              <span className="font-semibold text-ink-strong">{t(user.mood.text)}</span>
                              {user.mood.note && (
                                <p className="text-[11px] text-muted italic mt-0.5 truncate">
                                  "{user.mood.note}"
                                </p>
                              )}
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 text-muted">
                            <Sparkles className="w-3.5 h-3.5 text-people-strong shrink-0" />
                            <span>
                              {t('Status:')} <strong className="text-ink-strong">{t(user.status)}</strong>
                            </span>
                          </div>
                        )}

                        {/* Shared Tags */}
                        {user.mutualTags.length > 0 && (
                          <div className="flex items-center gap-1.5 pt-1 flex-wrap">
                            <span className="text-[10px] text-subtle uppercase tracking-wider">
                              {t('Shared:')}
                            </span>
                            {user.mutualTags.map((tag) => (
                              <span
                                key={tag}
                                className="px-2 py-0.5 rounded-md text-[10px] bg-people-soft text-people-strong border border-people/30"
                              >
                                {t(tag)}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Card Footer Action */}
                      <div className="flex items-center justify-between pt-1">
                        <span className="text-[11px] text-muted flex items-center gap-1">
                          <Compass className="w-3.5 h-3.5 text-people-strong" />
                          <span>{t('Status:')} <strong className="text-ink-strong">{t(user.status)}</strong></span>
                        </span>

                        {isSignalSent ? (
                          <span className="px-3 py-1.5 rounded-xl bg-card border border-people/30 text-people-strong text-xs font-semibold flex items-center gap-1.5">
                            <CheckCircle className="w-3.5 h-3.5" />
                            <span>{t('Signal Radiated')}</span>
                          </span>
                        ) : (
                          <button
                            onClick={() => handleInitiateSignal(user)}
                            disabled={dailySignalsRemaining <= 0}
                            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-md ${
                              dailySignalsRemaining > 0
                                ? 'bg-people text-ink-strong hover:opacity-95 shadow-people/20'
                                : 'bg-line text-subtle cursor-not-allowed'
                            }`}
                          >
                            <Zap className="w-3.5 h-3.5 fill-current" />
                            <span>{t('Send Signal')}</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}

                {resonantUsers.length === 0 && (
                  <div className="p-8 text-center bg-card border border-line rounded-3xl space-y-3">
                    <Compass className="w-10 h-10 text-subtle mx-auto" />
                    <h4 className="text-sm font-bold text-ink-strong">{t('No Resonant Signals for this Filter')}</h4>
                    <p className="text-xs text-muted max-w-sm mx-auto">
                      {t('Try switching to "All Resonant" or update your mood to match more people nearby.')}
                    </p>
                    <button
                      onClick={() => setResonanceFilter('all')}
                      className="px-4 py-2 rounded-xl bg-card border border-line text-ink text-xs font-semibold hover:border-ink/40"
                    >
                      {t('Show All Resonant ({n})', { n: nearbyUsers.length })}
                    </button>
                  </div>
                )}
              </div>

              {/* Resonance Tip Box */}
              <div className="p-3.5 rounded-2xl bg-card border border-line flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2.5">
                  <Sparkles className="w-4 h-4 text-people-strong shrink-0" />
                  <p className="text-[11px] text-muted leading-tight">
                    {t('Want higher resonance? Update your active mood and status to broadcast what you’re currently up for.')}
                  </p>
                </div>
                {onOpenStatusMood && (
                  <button
                    onClick={onOpenStatusMood}
                    className="px-3 py-1.5 rounded-xl bg-ink text-white text-[11px] font-bold shrink-0 hover:bg-ink-strong"
                  >
                    {t('Edit Mood')}
                  </button>
                )}
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 2: REQUESTS VIEW (Incoming Solicitations & Sent Signals)              */}
          {/* ========================================================================= */}
          {activeMainTab === 'requests' && (
            <div>
              {/* If an active dialogue thread is selected: Show Active Dialogue Window */}
              {currentDialogueThread ? (
                <div className="space-y-4">
                  {/* Top Bar with Back Button */}
                  <div className="p-3 rounded-2xl bg-card border border-line flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <button
                        onClick={() => setActiveThreadId(null)}
                        className="p-1.5 rounded-xl bg-card border border-line text-muted hover:text-ink-strong flex items-center gap-1 text-xs"
                      >
                        <ArrowLeft className="w-4 h-4" />
                        <span>{t('Requests')}</span>
                      </button>
                      <img
                        src={currentDialogueThread.peerAvatar}
                        alt={currentDialogueThread.peerName}
                        className="w-8 h-8 rounded-full object-cover border border-people/50"
                      />
                      <div>
                        <h4 className="text-xs font-bold text-ink-strong">
                          {currentDialogueThread.peerName}
                        </h4>
                        <span className="text-[10px] text-muted font-mono">
                          {t(currentDialogueThread.peerStatus)}
                        </span>
                      </div>
                    </div>

                    <div className="px-2.5 py-1 rounded-xl bg-warning-soft border border-warning/30 text-warning text-[10px] font-mono flex items-center gap-1">
                      <Clock className="w-3 h-3 text-warning" />
                      <span>{t('~{n}m window', { n: Math.round(currentDialogueThread.timerSecondsRemaining / 60) })}</span>
                    </div>
                  </div>

                  {/* Messages Flow Area */}
                  <div className="p-4 rounded-2xl bg-card border border-line min-h-[220px] max-h-[320px] overflow-y-auto space-y-3">
                    {currentDialogueThread.stage === 'hidden_notification' &&
                    !revealedSecrets[currentDialogueThread.id] ? (
                      <div className="p-5 rounded-2xl bg-card border border-people/30 text-center space-y-3 my-4">
                        <div className="w-10 h-10 rounded-full bg-people-soft border border-people/40 text-people-strong flex items-center justify-center mx-auto">
                          <Lock className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-ink-strong">{t('Protected Message Preview')}</h4>
                          <p className="text-[11px] text-muted max-w-sm mx-auto mt-1">
                            {t('In PicMe, message preview is shielded on initial notification so nobody reads in secret.')}
                          </p>
                        </div>
                        <button
                          onClick={() => handleReveal(currentDialogueThread.id)}
                          className="px-4 py-2 rounded-xl bg-ink hover:bg-ink-strong text-white font-bold text-xs shadow-md shadow-ink/20 inline-flex items-center gap-1.5"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>{t('Reveal Intent & Open Safe Dialogue')}</span>
                        </button>
                      </div>
                    ) : (
                      <>
                        <div className="p-2 rounded-xl bg-card border border-line text-[10px] text-muted flex items-center justify-between">
                          <span className="flex items-center gap-1 text-people-strong">
                            <Shield className="w-3 h-3" />
                            {t('Honest dialogue active')}
                          </span>
                          <span className="text-muted">
                            {t('Replying or declining keeps your Aura protected')}
                          </span>
                        </div>

                        {currentDialogueThread.history.map((msg, idx) => {
                          const isMe = msg.sender === 'me';
                          return (
                            <div
                              key={idx}
                              className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                            >
                              <div
                                className={`max-w-[85%] p-3 rounded-2xl text-xs leading-relaxed ${
                                  isMe
                                    ? 'bg-people text-ink-strong font-medium rounded-tr-none'
                                    : 'bg-card text-ink-strong border border-line rounded-tl-none'
                                }`}
                              >
                                {t(msg.text)}
                              </div>
                              <span className="text-[9px] text-subtle mt-1 px-1 font-mono">
                                {t(msg.time)}
                              </span>
                            </div>
                          );
                        })}
                      </>
                    )}
                  </div>

                  {/* Actions & Reply Bar */}
                  <div className="p-3 bg-card border border-line rounded-2xl space-y-2">
                    {/* Courteous closure options */}
                    <div className="flex items-center justify-between gap-2">
                      <button
                        onClick={() => {
                          onPolitelyDecline(currentDialogueThread.id);
                          setActiveThreadId(null);
                        }}
                        className="px-3 py-1 rounded-xl bg-card border border-line text-muted hover:text-ink-strong text-[11px] font-medium flex items-center gap-1"
                      >
                        <CheckCircle className="w-3 h-3 text-success" />
                        <span>{t('Politely Pass ("Not right now" · +5 Aura)')}</span>
                      </button>

                      <button
                        onClick={() => {
                          onBlockReport(currentDialogueThread.id);
                          setActiveThreadId(null);
                        }}
                        className="text-[10px] text-subtle hover:text-danger flex items-center gap-1"
                      >
                        <ThumbsDown className="w-3 h-3" />
                        <span>{t('Mute / Report')}</span>
                      </button>
                    </div>

                    {/* Quick input row */}
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={replyInput}
                        onChange={(e) => setReplyInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSendReply()}
                        placeholder={t('Type a respectful reply...')}
                        className="flex-1 px-3.5 py-2.5 rounded-xl bg-white border border-line text-xs text-ink-strong focus:outline-none focus:border-people"
                      />
                      <button
                        onClick={() => {
                          setReplyInput(t('Up for coffee at Kaph Drury St! My Telegram is @'));
                        }}
                        title={t('Template')}
                        className="p-2.5 rounded-xl bg-card border border-line text-muted hover:text-people-strong"
                      >
                        <MessageSquareShare className="w-4 h-4" />
                      </button>
                      <button
                        onClick={handleSendReply}
                        disabled={!replyInput.trim()}
                        className="px-4 py-2.5 rounded-xl bg-ink hover:bg-ink-strong text-white font-bold text-xs disabled:opacity-40 flex items-center gap-1.5"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>{t('Reply')}</span>
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                /* Sub-Tabs: Received vs Sent */
                <div className="space-y-4">
                  <div className="flex items-center gap-2 p-1 rounded-xl bg-card border border-line w-fit">
                    <button
                      onClick={() => setRequestsSubTab('received')}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                        requestsSubTab === 'received'
                          ? 'bg-ink-soft text-ink border border-ink/40 shadow-sm'
                          : 'text-muted hover:text-ink-strong'
                      }`}
                    >
                      {t('Received ({n})', { n: receivedThreads.length })}
                    </button>
                    <button
                      onClick={() => setRequestsSubTab('sent')}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                        requestsSubTab === 'sent'
                          ? 'bg-ink-soft text-ink border border-ink/40 shadow-sm'
                          : 'text-muted hover:text-ink-strong'
                      }`}
                    >
                      {t('Sent ({n})', { n: sentThreads.length })}
                    </button>
                  </div>

                  {/* RECEIVED REQUESTS LIST */}
                  {requestsSubTab === 'received' && (
                    <div className="space-y-3">
                      {receivedThreads.map((thread) => {
                        const isHidden =
                          thread.stage === 'hidden_notification' && !revealedSecrets[thread.id];

                        return (
                          <div
                            key={thread.id}
                            className="p-4 rounded-2xl bg-card border border-line space-y-3 shadow-lg"
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex items-center gap-3">
                                <div className="relative">
                                  <img
                                    src={thread.peerAvatar}
                                    alt={thread.peerName}
                                    className="w-11 h-11 rounded-full object-cover border border-people/40"
                                  />
                                  {isHidden ? (
                                    <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-people text-ink-strong flex items-center justify-center text-[9px]">
                                      <Lock className="w-2.5 h-2.5" />
                                    </span>
                                  ) : (
                                    <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-success border-2 border-white" />
                                  )}
                                </div>
                                <div>
                                  <div className="flex items-center gap-2">
                                    <h4 className="text-sm font-bold text-ink-strong">{thread.peerName}</h4>
                                    <span className="text-[10px] text-subtle font-mono">
                                      {t(thread.deliveredTime)}
                                    </span>
                                  </div>
                                  <p className="text-xs text-muted font-mono">
                                    {t(thread.peerStatus)}
                                  </p>
                                </div>
                              </div>

                              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-warning-soft border border-warning/30 text-warning text-[10px] font-mono">
                                <Clock className="w-3 h-3 text-warning" />
                                <span>{t('~{n}m left', { n: Math.round(thread.timerSecondsRemaining / 60) })}</span>
                              </div>
                            </div>

                            {/* Intent Message Box */}
                            <div className="p-3 rounded-xl bg-white/80 border border-line text-xs">
                              {isHidden ? (
                                <div className="flex items-center justify-between text-people-strong">
                                  <span className="flex items-center gap-1.5">
                                    <Lock className="w-3.5 h-3.5" />
                                    <span>{t('Protected Intent Message')}</span>
                                  </span>
                                  <button
                                    onClick={() => handleReveal(thread.id)}
                                    className="text-[11px] font-bold underline hover:text-people-strong"
                                  >
                                    {t('Reveal')}
                                  </button>
                                </div>
                              ) : (
                                <p className="text-ink-strong leading-relaxed">
                                  "{t(thread.fullMessage)}"
                                </p>
                              )}
                            </div>

                            {/* Actions */}
                            <div className="flex items-center justify-between pt-1">
                              <button
                                onClick={() => onPolitelyDecline(thread.id)}
                                className="px-3 py-1.5 rounded-xl bg-card border border-line text-muted hover:text-ink-strong text-xs font-medium flex items-center gap-1"
                              >
                                <CheckCircle className="w-3.5 h-3.5 text-subtle" />
                                <span>{t('Polite Pass')}</span>
                              </button>

                              <button
                                onClick={() => setActiveThreadId(thread.id)}
                                className="px-4 py-1.5 rounded-xl bg-ink hover:bg-ink-strong text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-ink/20"
                              >
                                <Send className="w-3.5 h-3.5" />
                                <span>{t('Accept & Chat')}</span>
                              </button>
                            </div>
                          </div>
                        );
                      })}

                      {receivedThreads.length === 0 && (
                        <div className="p-8 text-center bg-card border border-line rounded-3xl space-y-2">
                          <Radio className="w-8 h-8 text-subtle mx-auto" />
                          <h4 className="text-sm font-bold text-ink-strong">{t('No Pending Received Signals')}</h4>
                          <p className="text-xs text-muted max-w-sm mx-auto">
                            {t('When someone nearby radiates a connection signal to you, it will arrive here with a safe response window.')}
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* SENT REQUESTS LIST */}
                  {requestsSubTab === 'sent' && (
                    <div className="space-y-3">
                      {sentThreads.map((thread) => (
                        <div
                          key={thread.id}
                          className="p-4 rounded-2xl bg-card border border-line space-y-2 shadow-lg"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2.5">
                              <img
                                src={thread.peerAvatar}
                                alt={thread.peerName}
                                className="w-9 h-9 rounded-full object-cover border border-people/40"
                              />
                              <div>
                                <h4 className="text-xs font-bold text-ink-strong">{thread.peerName}</h4>
                                <span className="text-[10px] text-muted font-mono">
                                  {t(thread.deliveredTime)}
                                </span>
                              </div>
                            </div>

                            <span className="px-2.5 py-1 rounded-full text-[10px] font-mono bg-people-soft text-people-strong border border-people/30 flex items-center gap-1">
                              <Zap className="w-3 h-3 text-people-strong fill-people" />
                              <span>{t('Radiated')}</span>
                            </span>
                          </div>

                          <p className="text-xs text-muted bg-white/60 p-2.5 rounded-xl border border-line">
                            "{t(thread.fullMessage)}"
                          </p>

                          <div className="flex items-center justify-between text-[10px] text-subtle pt-1">
                            <span>{t('Awaiting polite reaction')}</span>
                            <span className="font-mono text-success">{t('2h safe window active')}</span>
                          </div>
                        </div>
                      ))}

                      {sentThreads.length === 0 && (
                        <div className="p-8 text-center bg-card border border-line rounded-3xl space-y-2">
                          <Zap className="w-8 h-8 text-subtle mx-auto" />
                          <h4 className="text-sm font-bold text-ink-strong">{t('No Signals Sent Yet Today')}</h4>
                          <p className="text-xs text-muted max-w-sm mx-auto">
                            {t('Switch to the Resonance tab to explore like-minded people and radiate your first signal!')}
                          </p>
                          <button
                            onClick={() => setActiveMainTab('resonance')}
                            className="px-4 py-2 rounded-xl bg-people text-ink-strong text-xs font-bold shadow-md shadow-people/20"
                          >
                            {t('Explore Resonance Radar')}
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* QUICK CONTEXT NOTE MODAL (WHEN RADIATING A SIGNAL FROM RESONANCE) */}
      {signalingUser && (
        <div className="absolute inset-0 z-60 flex items-center justify-center p-3 bg-ink-strong/40 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-md bg-white border border-line rounded-3xl p-5 space-y-4 shadow-2xl max-h-full overflow-y-auto no-scrollbar">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <img
                  src={signalingUser.avatarUrl}
                  alt={signalingUser.name}
                  className="w-10 h-10 rounded-full object-cover border border-people/50"
                />
                <div>
                  <h4 className="text-sm font-bold text-ink-strong">{signalingUser.name}</h4>
                  <p className="text-xs text-muted font-mono">{signalingUser.district}</p>
                </div>
              </div>
              <button
                onClick={() => setSignalingUser(null)}
                className="w-7 h-7 rounded-full bg-card text-muted hover:text-ink-strong flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2">
              <span className="text-[11px] font-semibold text-muted uppercase tracking-wider block">
                {t('Select Respectful Signal Context')}
              </span>
              {[
                'Saw your vibe on the map · Up to connect!',
                'Matching coffee & walk interest · Hello from nearby!',
                'Looking for co-working & focus partner · Open to wave!',
              ].map((note) => (
                <button
                  key={note}
                  onClick={() => setPresetNote(note)}
                  className={`w-full p-2.5 rounded-xl text-left text-xs border transition-colors ${
                    presetNote === note
                      ? 'bg-people-soft border-people text-people-strong font-medium'
                      : 'bg-card border-line text-muted hover:text-ink-strong'
                  }`}
                >
                  {t(note)}
                </button>
              ))}
            </div>

            <div className="p-3 rounded-xl bg-white border border-line text-[11px] text-muted space-y-1">
              <div className="flex items-center justify-between text-muted font-medium">
                <span className="flex items-center gap-1.5 text-people-strong">
                  <Shield className="w-3.5 h-3.5" />
                  {t('Intentional Signal Protection')}
                </span>
                <span className="font-mono text-people-strong">{t('{n} / 10 left', { n: dailySignalsRemaining })}</span>
              </div>
              <p className="text-[10px] text-subtle">
                {t('Radiating a signal rewards +10 Aura points and opens a gentle, spam-free 2-hour window.')}
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                onClick={() => setSignalingUser(null)}
                className="px-4 py-2 rounded-xl text-xs text-muted hover:text-ink-strong"
              >
                {t('Cancel')}
              </button>

              {signalSuccessMsg ? (
                <div className="px-5 py-2 rounded-xl bg-success text-white font-bold text-xs flex items-center gap-1.5 shadow-lg">
                  <Check className="w-4 h-4" />
                  <span>{signalSuccessMsg}</span>
                </div>
              ) : (
                <button
                  onClick={handleConfirmSignal}
                  className="px-5 py-2 rounded-xl bg-people text-ink-strong font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-people/20"
                >
                  <Zap className="w-4 h-4 fill-ink-strong" />
                  <span>{t('Radiate Signal (+10 Aura)')}</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
