/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  Users,
  Compass,
  Sparkles,
  MapPin,
  Radio,
  Award,
  Layers,
  MessageSquare,
  Home,
  Briefcase,
  Clock,
  ShieldCheck,
  Filter,
  Check,
  ChevronUp,
  AlertCircle,
  SlidersHorizontal,
  Plus,
  Store,
  Zap,
  UserRound
} from 'lucide-react';

import {
  UserProfile,
  NearbyDublinUser,
  DublinPlace,
  DublinOpportunity,
  ChatThreadItem,
  AuraLog,
  VisibilityLevel,
  UserMood
} from './types';

import {
  DUBLIN_CENTER,
  DUBLIN_PLACES,
  DUBLIN_OPPORTUNITIES,
  NEARBY_DUBLIN_USERS,
  INITIAL_CHAT_THREADS,
  INITIAL_AURA_LOGS,
  INTEREST_OPTIONS
} from './data/dublinData';

import { GoogleDublinMap } from './components/GoogleDublinMap';
import { OnboardingModal } from './components/OnboardingModal';
import { SignalModal } from './components/SignalModal';
import { StatusMoodDrawer } from './components/StatusMoodDrawer';
import { AuraModal } from './components/AuraModal';
import { ChatDrawer } from './components/ChatDrawer';
import { ItemDetailDrawer } from './components/ItemDetailDrawer';
import { OpportunitiesListModal } from './components/OpportunitiesListModal';
import { ProfileModal, BlockedPerson, loadProfileSettings } from './components/ProfileModal';
import { PlusActionDrawer } from './components/PlusActionDrawer';
import { AddPlaceModal } from './components/AddPlaceModal';
import { AddOpportunityModal } from './components/AddOpportunityModal';

export default function App() {
  // Check localStorage for onboarding state
  const [isOnboarded, setIsOnboarded] = useState<boolean>(() => {
    return localStorage.getItem('picme_onboarded') === 'true';
  });

  const [onboardingReason, setOnboardingReason] = useState<string | null>(null);
  const [isOnboardingModalOpen, setIsOnboardingModalOpen] = useState<boolean>(() => {
    return localStorage.getItem('picme_onboarded') !== 'true';
  });

  // User Profile
  const [userProfile, setUserProfile] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('picme_profile');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.auraScore === 820) {
          parsed.auraScore = 135;
        }
        return parsed;
      } catch (e) {
        // fallback
      }
    }
    return {
      name: 'Alex Brennan',
      handle: '@alex_dublin',
      avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      identity: 'Newcomer',
      activity: 'IT & Tech',
      interests: ['Specialty Coffee', 'Canal Walks', 'Tech Hackathons'],
      lookingFor: ['Canal/Sublet Housing', 'Coffee & Spontaneous Chat'],
      offering: ['Tech & Code Mentorship', 'Specialty Coffee / Tea treat'],
      status: 'Open to Connect',
      mood: {
        id: 'mood-init',
        text: 'Craving specialty coffee',
        emoji: '☕',
        expiresAt: Date.now() + 45 * 60 * 1000,
        durationHours: 1,
        note: 'Strolling down Portobello canal towpath'
      },
      visibility: 'zone',
      district: 'Portobello',
      auraScore: 135,
      dailySignalsUsed: 2,
      dailySignalsLimit: 10,
      isOnboarded: false,
    };
  });

  // Map layers: defaults come from Profile > Settings > Default map layers
  const [layers] = useState(() => loadProfileSettings().defaultLayers);

  // People the user blocked from Signals (managed in Profile > Settings)
  const [blockedPeople, setBlockedPeople] = useState<BlockedPerson[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('picme_blocked') || '[]');
    } catch (e) {
      return [];
    }
  });
  const saveBlocked = (list: BlockedPerson[]) => {
    setBlockedPeople(list);
    localStorage.setItem('picme_blocked', JSON.stringify(list));
  };

  // Places & Opportunities (persisted with initial Dublin defaults)
  const [places, setPlaces] = useState<DublinPlace[]>(() => {
    const saved = localStorage.getItem('picme_places');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return DUBLIN_PLACES;
  });

  const [opportunities, setOpportunities] = useState<DublinOpportunity[]>(() => {
    const saved = localStorage.getItem('picme_opportunities');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return DUBLIN_OPPORTUNITIES;
  });

  // Category Tag Filter & Sliders Menu State
  const [activeTagFilter, setActiveTagFilter] = useState<string>('all');
  const [isFilterMenuOpen, setIsFilterMenuOpen] = useState<boolean>(false);

  // Sub-category filters matching user specification
  const [peopleFilter, setPeopleFilter] = useState<'all' | 'interests' | 'mood'>('all');
  const [placesFilter, setPlacesFilter] = useState<'all' | 'cafe' | 'coworking' | 'sport' | 'culture'>('all');
  const [oppsFilter, setOppsFilter] = useState<'all' | 'housing' | 'job' | 'collaboration' | 'activity'>('all');

  // Filtered People based on peopleFilter
  const filteredPeople = React.useMemo(() => {
    if (!layers.people) return [];
    if (peopleFilter === 'interests') {
      return NEARBY_DUBLIN_USERS.filter((u) =>
        u.interests.some((i) => userProfile.interests.includes(i)) || u.mutualScore >= 80
      );
    }
    if (peopleFilter === 'mood') {
      return NEARBY_DUBLIN_USERS.filter((u) => Boolean(u.mood));
    }
    return NEARBY_DUBLIN_USERS;
  }, [layers.people, peopleFilter, userProfile.interests]);

  // Filtered Places based on placesFilter
  const filteredPlaces = React.useMemo(() => {
    if (!layers.places) return [];
    if (placesFilter === 'cafe') {
      return places.filter((p) => p.category === 'cafe' || p.category === 'pub');
    }
    if (placesFilter === 'coworking') {
      return places.filter((p) => p.category === 'coworking');
    }
    if (placesFilter === 'sport') {
      return places.filter((p) => p.category === 'park');
    }
    if (placesFilter === 'culture') {
      return places.filter((p) => p.category === 'culture');
    }
    return places;
  }, [layers.places, placesFilter, places]);

  // Filtered Opportunities based on oppsFilter
  const filteredOpportunities = React.useMemo(() => {
    if (!layers.opportunities) return [];
    if (oppsFilter === 'housing') {
      return opportunities.filter((o) => o.type === 'housing');
    }
    if (oppsFilter === 'job') {
      return opportunities.filter((o) => o.type === 'job');
    }
    if (oppsFilter === 'collaboration') {
      return opportunities.filter((o) =>
        o.categoryTag.toLowerCase().includes('co-founder') ||
        o.categoryTag.toLowerCase().includes('collaborat') ||
        o.relevantFields.some((f) => f.includes('Tech') || f.includes('Creative'))
      );
    }
    if (oppsFilter === 'activity') {
      return opportunities.filter((o) => o.type === 'activity');
    }
    return opportunities;
  }, [layers.opportunities, oppsFilter, opportunities]);

  // Selected Entities
  const [selectedUser, setSelectedUser] = useState<NearbyDublinUser | null>(null);
  const [selectedPlace, setSelectedPlace] = useState<DublinPlace | null>(null);
  const [selectedOpportunity, setSelectedOpportunity] = useState<DublinOpportunity | null>(null);

  // Modals & Drawers
  const [isSignalOpen, setIsSignalOpen] = useState(false);
  const [isStatusMoodOpen, setIsStatusMoodOpen] = useState(false);
  const [isAuraOpen, setIsAuraOpen] = useState(false);
  const [isPlusActionOpen, setIsPlusActionOpen] = useState(false);
  const [isAddPlaceOpen, setIsAddPlaceOpen] = useState(false);
  const [isAddOpportunityOpen, setIsAddOpportunityOpen] = useState(false);

  // Notifications Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Active Bottom Tab for Mobile Flow
  const [activeTab, setActiveTab] = useState<'map' | 'opportunities' | 'chat' | 'profile'>('map');

  // API Key config: baked in internally
  const [apiKey] = useState<string>(() => {
    return (
      (import.meta as any).env?.VITE_GOOGLE_MAPS_API_KEY ||
      localStorage.getItem('picme_map_key') ||
      ''
    );
  });

  // Chats & Aura logs
  const [chatThreads, setChatThreads] = useState<ChatThreadItem[]>(INITIAL_CHAT_THREADS);
  const [auraLogs, setAuraLogs] = useState<AuraLog[]>(INITIAL_AURA_LOGS);

  // Save profile changes
  const saveProfile = (updated: Partial<UserProfile>) => {
    setUserProfile((prev) => {
      const merged = { ...prev, ...updated };
      localStorage.setItem('picme_profile', JSON.stringify(merged));
      return merged;
    });
  };

  // Trigger Toast Notification
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Handle Onboarding Completion
  const handleOnboardingComplete = (data: Partial<UserProfile>) => {
    setIsOnboarded(true);
    localStorage.setItem('picme_onboarded', 'true');
    saveProfile({
      ...data,
      isOnboarded: true,
    });
    setIsOnboardingModalOpen(false);
    setOnboardingReason(null);
    showToast('✨ Welcome to PicMe Dublin! Your urban resonance radar is now active.');
  };

  // Require Onboarding Prompt
  const handleRequireOnboarding = (reason: string) => {
    setOnboardingReason(reason);
    setIsOnboardingModalOpen(true);
  };

  // Handle Sending Signal
  const handleSendSignal = (targetUser: NearbyDublinUser, note?: string) => {
    if (userProfile.dailySignalsUsed >= userProfile.dailySignalsLimit) {
      showToast('Daily signal limit reached (10/10). Resets tomorrow morning.');
      return;
    }

    saveProfile({
      dailySignalsUsed: userProfile.dailySignalsUsed + 1,
      auraScore: userProfile.auraScore + 10,
    });

    const newLog: AuraLog = {
      id: `log-${Date.now()}`,
      action: `Radiated intentional connection signal to ${targetUser.name}`,
      delta: +10,
      timestamp: 'Just now',
      type: 'gain',
    };
    setAuraLogs((prev) => [newLog, ...prev]);

    // Also add to chat threads
    const newThread: ChatThreadItem = {
      id: `thread-${Date.now()}`,
      peerId: targetUser.id,
      peerName: targetUser.name,
      peerAvatar: targetUser.avatarUrl,
      peerStatus: targetUser.status,
      stage: 'delivered',
      deliveredTime: 'Just now',
      previewSecretText: 'New Intentional Signal Radiated',
      fullMessage: note || 'Saw your vibe on Dublin map · Up to connect!',
      timerSecondsRemaining: 7200,
      history: [
        {
          sender: 'me',
          text: note || 'Saw your vibe on Dublin map · Up to connect!',
          time: 'Just now',
        },
      ],
    };
    setChatThreads((prev) => [newThread, ...prev]);
    showToast(`Signal radiated to ${targetUser.name}! Opening polite mutual window.`);
  };

  // Handle Chat Reply
  const handleReplyThread = (threadId: string, text: string) => {
    setChatThreads((prev) =>
      prev.map((t) => {
        if (t.id === threadId) {
          return {
            ...t,
            stage: 'replied',
            history: [...t.history, { sender: 'me', text, time: 'Just now' }],
          };
        }
        return t;
      })
    );

    saveProfile({ auraScore: userProfile.auraScore + 20 });
    setAuraLogs((prev) => [
      {
        id: `log-${Date.now()}`,
        action: 'Promptly responded to Dublin connection dialogue',
        delta: +20,
        timestamp: 'Just now',
        type: 'gain',
      },
      ...prev,
    ]);

    showToast('Reply sent! +20 Aura awarded for prompt Dublin communication.');
  };

  // Handle Polite Pass / Decline
  const handlePolitelyDecline = (threadId: string) => {
    setChatThreads((prev) => prev.filter((t) => t.id !== threadId));
    saveProfile({ auraScore: userProfile.auraScore + 5 });
    setAuraLogs((prev) => [
      {
        id: `log-${Date.now()}`,
        action: 'Politely closed dialogue without ghosting ("Not right now")',
        delta: +5,
        timestamp: 'Just now',
        type: 'gain',
      },
      ...prev,
    ]);
    showToast('Dialogue respectfully closed. +5 Aura awarded for courtesy.');
  };

  // Handle Block / Report
  const handleBlockReport = (threadId: string) => {
    const thread = chatThreads.find((t) => t.id === threadId);
    if (thread && !blockedPeople.some((b) => b.id === thread.peerId)) {
      saveBlocked([...blockedPeople, { id: thread.peerId, name: thread.peerName, avatar: thread.peerAvatar }]);
    }
    setChatThreads((prev) => prev.filter((t) => t.id !== threadId));
    showToast('Contact muted. Your Aura remains fully protected.');
  };

  // Switch Bottom Tab
  const handleTabChange = (tab: 'map' | 'opportunities' | 'chat' | 'profile') => {
    setActiveTab(tab);
    setIsFilterMenuOpen(false);
  };

  // Add Place to live radar
  const handleAddPlace = (newPlace: DublinPlace) => {
    setPlaces((prev) => {
      const updated = [newPlace, ...prev];
      localStorage.setItem('picme_places', JSON.stringify(updated));
      return updated;
    });

    saveProfile({ auraScore: userProfile.auraScore + 15 });
    setAuraLogs((prev) => [
      {
        id: `log-${Date.now()}`,
        action: `Broadcasted new spot "${newPlace.name}" to Dublin radar`,
        delta: +15,
        timestamp: 'Just now',
        type: 'gain',
      },
      ...prev,
    ]);

    setSelectedPlace(newPlace);
    setSelectedOpportunity(null);
    setSelectedUser(null);
    setActiveTab('map');
    showToast(`📍 "${newPlace.name}" placed on Dublin radar! (+15 Aura)`);
  };

  // Add Opportunity to live radar
  const handleAddOpportunity = (newOpp: DublinOpportunity) => {
    setOpportunities((prev) => {
      const updated = [newOpp, ...prev];
      localStorage.setItem('picme_opportunities', JSON.stringify(updated));
      return updated;
    });

    saveProfile({ auraScore: userProfile.auraScore + 25 });
    setAuraLogs((prev) => [
      {
        id: `log-${Date.now()}`,
        action: `Published Dublin opportunity "${newOpp.title}"`,
        delta: +25,
        timestamp: 'Just now',
        type: 'gain',
      },
      ...prev,
    ]);

    setSelectedOpportunity(newOpp);
    setSelectedPlace(null);
    setSelectedUser(null);
    setActiveTab('map');
    showToast(`⚡ Opportunity "${newOpp.title}" published! (+25 Aura)`);
  };

  return (
    <div className="h-[100dvh] w-full bg-canvas text-ink-strong flex flex-col items-center justify-center relative font-sans overflow-hidden select-none">
      {/* GLOBAL TOAST */}
      {toastMessage && (
        <div className="fixed top-4 z-[9999] px-4 py-2.5 rounded-2xl bg-ink/95 backdrop-blur-md text-white font-bold text-xs shadow-2xl flex items-center gap-2 animate-bounce">
          <Sparkles className="w-4 h-4 text-opp" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* MOBILE APPLICATION CONTAINER */}
      <div className="relative w-full max-w-[430px] h-full sm:h-[94vh] sm:max-h-[890px] sm:rounded-[40px] sm:border-[8px] sm:border-ink-strong sm:shadow-[0_20px_60px_rgba(31,42,16,0.35)] bg-canvas overflow-hidden flex flex-col @container">
        {/* TOP MOBILE STATUS BAR */}
        <div className="h-10 px-6 pt-2 bg-white/90 backdrop-blur-md flex items-center justify-between text-[11px] text-ink-strong z-30 shrink-0 select-none">
          <span className="font-semibold font-mono">9:41</span>
          {/* Dynamic Island pill */}
          <div className="w-24 h-4 bg-ink-strong rounded-full shadow-inner flex items-center justify-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-opp animate-ping" />
            <span className="text-[9px] text-opp font-mono">Dublin Active</span>
          </div>
          <div className="flex items-center gap-1 font-mono text-[10px]">
            <span>5G</span>
            <span className="w-4 h-2 rounded-sm border border-line-strong p-[1px] inline-flex items-center">
              <span className="w-2.5 h-full bg-success rounded-2xs" />
            </span>
          </div>
        </div>

          {/* MAP CANVAS AREA */}
          <div className="relative flex-1 w-full overflow-hidden">
            <GoogleDublinMap
              apiKey={apiKey}
              center={DUBLIN_CENTER}
              zoom={14}
              layers={layers}
              filterCategory={activeTagFilter}
              people={filteredPeople}
              places={filteredPlaces}
              opportunities={filteredOpportunities}
              selectedUser={selectedUser}
              selectedPlace={selectedPlace}
              selectedOpportunity={selectedOpportunity}
              onSelectUser={(u) => {
                setSelectedUser(u);
                setSelectedPlace(null);
                setSelectedOpportunity(null);
                setIsSignalOpen(true);
              }}
              onSelectPlace={(p) => {
                setSelectedPlace(p);
                setSelectedUser(null);
                setSelectedOpportunity(null);
              }}
              onSelectOpportunity={(o) => {
                setSelectedOpportunity(o);
                setSelectedUser(null);
                setSelectedPlace(null);
              }}
              myVisibility={userProfile.visibility}
              myLocation={{ lat: 53.3330, lng: -6.2655 }}
              isOnboarded={isOnboarded}
              onRequireOnboarding={handleRequireOnboarding}
            />

            {/* FLOATING SLIDERS SETTINGS BUTTON OVER THE MAP (layer toggles + filters live in the top sheet) */}
            <button
              onClick={() => setIsFilterMenuOpen(true)}
              className="absolute top-3 right-3 z-20 w-10 h-10 rounded-full bg-white text-ink shadow-lg shadow-ink-strong/15 flex items-center justify-center hover:scale-105 active:scale-95 transition-transform"
              title="Layers & Filters"
            >
              <SlidersHorizontal className="w-4 h-4" />
              {(peopleFilter !== 'all' || placesFilter !== 'all' || oppsFilter !== 'all') && (
                <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-ink ring-2 ring-white" />
              )}
            </button>

            {/* TOP SHEET: layer toggles + category filters. Each row takes its layer colour: people = pink, places = forest, opportunities = leaf */}
            {isFilterMenuOpen && (
              <>
                <div className="absolute inset-0 z-30 bg-black/30 fade-in" onClick={() => setIsFilterMenuOpen(false)} />
                <div className="absolute top-0 inset-x-0 z-40 bg-white rounded-b-3xl shadow-2xl shadow-black/30 px-4 pt-3 pb-4 space-y-3 slide-down-in">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-ink-strong">Layers & Filters</span>
                    <button
                      onClick={() => setIsFilterMenuOpen(false)}
                      className="w-10 h-10 rounded-full bg-card text-ink flex items-center justify-center"
                      title="Close"
                    >
                      <SlidersHorizontal className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Category filter rows */}
                  {[
                    {
                      label: 'People',
                      dot: 'bg-people',
                      active: 'bg-people border-people text-ink-strong font-bold',
                      value: peopleFilter,
                      set: setPeopleFilter as (v: string) => void,
                      options: [
                        ['all', 'All Open'],
                        ['interests', 'Matching Interests'],
                        ['mood', 'Shared Mood'],
                      ],
                    },
                    {
                      label: 'Places',
                      dot: 'bg-place',
                      active: 'bg-place border-place text-ink-strong font-bold',
                      value: placesFilter,
                      set: setPlacesFilter as (v: string) => void,
                      options: [
                        ['all', 'All'],
                        ['cafe', 'Coffee & Food'],
                        ['coworking', 'Coworking'],
                        ['sport', 'Sports'],
                        ['culture', 'Culture'],
                      ],
                    },
                    {
                      label: 'Opportunities',
                      dot: 'bg-opp',
                      active: 'bg-opp border-opp text-ink-strong font-bold',
                      value: oppsFilter,
                      set: setOppsFilter as (v: string) => void,
                      options: [
                        ['all', 'All'],
                        ['housing', 'Housing (714)'],
                        ['job', 'Jobs (1154)'],
                        ['collaboration', 'Collaborations'],
                        ['activity', 'Activities'],
                      ],
                    },
                  ].map((row) => (
                    <div key={row.label} className="space-y-1.5">
                      <span className="text-[11px] font-bold text-muted flex items-center gap-1.5">
                        <span className={`w-1.5 h-1.5 rounded-full ${row.dot}`} />
                        {row.label}
                      </span>
                      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                        {row.options.map(([value, text]) => (
                          <button
                            key={value}
                            onClick={() => row.set(value)}
                            className={`shrink-0 px-3 py-1.5 rounded-xl text-[11px] border transition-all ${
                              row.value === value
                                ? row.active
                                : 'bg-card border-line text-muted hover:text-ink-strong font-medium'
                            }`}
                          >
                            {text}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}

                  {/* Reset shortcut */}
                  {(peopleFilter !== 'all' || placesFilter !== 'all' || oppsFilter !== 'all') && (
                    <div className="flex justify-end">
                      <button
                        onClick={() => {
                          setPeopleFilter('all');
                          setPlacesFilter('all');
                          setOppsFilter('all');
                        }}
                        className="text-[11px] text-ink hover:underline font-semibold"
                      >
                        Reset all filters
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}

            {/* ITEM DETAIL BOTTOM SHEET (WHEN A PLACE OR OPPORTUNITY IS SELECTED), inside the map screen */}
            <ItemDetailDrawer
              place={selectedPlace}
              opportunity={selectedOpportunity}
              onClose={() => {
                setSelectedPlace(null);
                setSelectedOpportunity(null);
              }}
              onBookmark={(title) => showToast(`Saved "${title}" to your Dublin collection.`)}
              onAction={(msg) => showToast(msg)}
            />

            {/* SIGNALS SCREEN (RESONANCE & REQUESTS) */}
            <ChatDrawer
              isOpen={activeTab === 'chat'}
              onClose={() => setActiveTab('map')}
              threads={chatThreads}
              currentUser={userProfile}
              nearbyUsers={NEARBY_DUBLIN_USERS}
              dailySignalsRemaining={userProfile.dailySignalsLimit - userProfile.dailySignalsUsed}
              onSendSignal={handleSendSignal}
              onReplyThread={handleReplyThread}
              onPolitelyDecline={handlePolitelyDecline}
              onBlockReport={handleBlockReport}
              onOpenStatusMood={() => setIsStatusMoodOpen(true)}
            />

            {/* OPPORTUNITIES SCREEN */}
            <OpportunitiesListModal
              isOpen={activeTab === 'opportunities'}
              onClose={() => setActiveTab('map')}
              opportunities={opportunities}
              onSelectOpportunity={(opp) => {
                setSelectedOpportunity(opp);
                setActiveTab('map');
              }}
            />

            {/* PROFILE SCREEN */}
            <ProfileModal
              isOpen={activeTab === 'profile'}
              onClose={() => setActiveTab('map')}
              user={userProfile}
              places={places}
              opportunities={opportunities}
              blockedPeople={blockedPeople}
              onUpdateVisibility={(level: VisibilityLevel) => {
                saveProfile({ visibility: level });
                showToast(`Visibility set to ${level}`);
              }}
              onOpenOnboardingEdit={() => setIsOnboardingModalOpen(true)}
              onOpenAura={() => setIsAuraOpen(true)}
              onExtendMood={() => {
                if (!userProfile.mood) return;
                const base = Math.max(Date.now(), userProfile.mood.expiresAt);
                saveProfile({ mood: { ...userProfile.mood, expiresAt: base + 60 * 60 * 1000 } });
                showToast('Mood extended by 1 hour');
              }}
              onChangeMood={() => setIsStatusMoodOpen(true)}
              onShowPlace={(place) => {
                setSelectedPlace(place);
                setSelectedOpportunity(null);
                setActiveTab('map');
              }}
              onShowOpportunity={(opp) => {
                setSelectedOpportunity(opp);
                setSelectedPlace(null);
                setActiveTab('map');
              }}
              onUnblock={(id) => saveBlocked(blockedPeople.filter((b) => b.id !== id))}
              onLogout={() => {
                localStorage.removeItem('picme_onboarded');
                window.location.reload();
              }}
              onDeleteAccount={() => {
                Object.keys(localStorage)
                  .filter((k) => k.startsWith('picme_'))
                  .forEach((k) => localStorage.removeItem(k));
                window.location.reload();
              }}
            />
          </div>

          {/* BOTTOM NAVIGATION TAB BAR (5 ITEMS: MAP, OPPORTUNITIES, +, SIGNALS, PROFILE) */}
          {/* Active tab takes its layer colour (map/profile = ink, opportunities = opp, signals = people). Inactive: subtle. */}
          <nav className="h-16 px-2 bg-white border-t border-line shadow-[0_-4px_12px_rgba(31,42,16,0.06)] grid grid-cols-5 items-center z-20 shrink-0 select-none">
            {/* TAB 1: MAP */}
            <button
              onClick={() => handleTabChange('map')}
              className="flex flex-col items-center justify-center transition-colors group"
            >
              <Compass className={`w-5 h-5 ${activeTab === 'map' ? 'text-ink' : 'text-subtle group-hover:text-muted'}`} />
              <span className={`text-[11px] mt-1 ${activeTab === 'map' ? 'text-ink-strong font-bold' : 'text-subtle font-semibold group-hover:text-muted'}`}>Map</span>
            </button>

            {/* TAB 2: OPPORTUNITIES */}
            <button
              onClick={() => handleTabChange('opportunities')}
              className="flex flex-col items-center justify-center transition-colors group"
            >
              <span className="relative">
                <Briefcase className={`w-5 h-5 ${activeTab === 'opportunities' ? 'text-opp-strong' : 'text-subtle group-hover:text-muted'}`} />
                <span className="absolute -top-1 -right-2.5 w-2 h-2 rounded-full bg-opp" />
              </span>
              <span className={`text-[11px] mt-1 ${activeTab === 'opportunities' ? 'text-ink-strong font-bold' : 'text-subtle font-semibold group-hover:text-muted'}`}>Opportunities</span>
            </button>

            {/* TAB 3: PLUS ACTION BUTTON (+) */}
            <button
              onClick={() => setIsPlusActionOpen(true)}
              aria-label="Add or Broadcast"
              className="flex flex-col items-center justify-center group relative -top-1"
            >
              <div className="w-12 h-12 rounded-full bg-people hover:bg-people-hover flex items-center justify-center text-white shadow-lg shadow-people/40 group-hover:scale-110 active:scale-95 transition-all">
                <Plus className="w-6 h-6 stroke-[2.5]" />
              </div>
            </button>

            {/* TAB 4: SIGNALS */}
            <button
              onClick={() => handleTabChange('chat')}
              className="flex flex-col items-center justify-center transition-colors group"
            >
              <span className="relative">
                <Zap className={`w-5 h-5 ${activeTab === 'chat' ? 'text-people-strong' : 'text-subtle group-hover:text-muted'}`} />
                {chatThreads.some((t) => t.stage === 'hidden_notification') && (
                  <span className="absolute -top-1 -right-2.5 w-2 h-2 rounded-full bg-people animate-ping" />
                )}
              </span>
              <span className={`text-[11px] mt-1 ${activeTab === 'chat' ? 'text-ink-strong font-bold' : 'text-subtle font-semibold group-hover:text-muted'}`}>Signals</span>
            </button>

            {/* TAB 5: PROFILE */}
            <button
              onClick={() => handleTabChange('profile')}
              className="flex flex-col items-center justify-center transition-colors group"
            >
              <UserRound className={`w-5 h-5 ${activeTab === 'profile' ? 'text-ink' : 'text-subtle group-hover:text-muted'}`} />
              <span className={`text-[11px] mt-1 ${activeTab === 'profile' ? 'text-ink-strong font-bold' : 'text-subtle font-semibold group-hover:text-muted'}`}>Profile</span>
            </button>
          </nav>

          {/* MODALS & DRAWERS (rendered inside the phone frame) */}

          {/* 1. ONBOARDING & CONTEXT CREATION */}
          <OnboardingModal
            isOpen={isOnboardingModalOpen}
            onComplete={handleOnboardingComplete}
            onClosePreview={isOnboarded ? () => setIsOnboardingModalOpen(false) : undefined}
            requiredReason={onboardingReason}
          />

          {/* 2. WANT TO CONNECT SIGNAL MODAL */}
          <SignalModal
            user={selectedUser}
            currentUser={userProfile}
            isOpen={isSignalOpen}
            onClose={() => {
              setIsSignalOpen(false);
              setSelectedUser(null);
            }}
            onSendSignal={handleSendSignal}
            dailySignalsRemaining={userProfile.dailySignalsLimit - userProfile.dailySignalsUsed}
          />

          {/* 3. STATUS & MOOD EDITOR (WINDOW) */}
          <StatusMoodDrawer
            currentUser={userProfile}
            isOpen={isStatusMoodOpen}
            onClose={() => setIsStatusMoodOpen(false)}
            onUpdateStatusMood={(status, mood) => {
              saveProfile({ status, mood });
              showToast('Updated your Dublin presence status.');
            }}
          />

          {/* 4. AURA SCORE BREAKDOWN */}
          <AuraModal
            isOpen={isAuraOpen}
            onClose={() => setIsAuraOpen(false)}
            currentUser={userProfile}
            auraLogs={auraLogs}
          />

          {/* 7. PLUS (+) ACTION DRAWER: STATUS & MOOD, NEW PLACE, NEW OPPORTUNITY */}
          <PlusActionDrawer
            isOpen={isPlusActionOpen}
            onClose={() => setIsPlusActionOpen(false)}
            currentUser={userProfile}
            onOpenStatusMood={() => setIsStatusMoodOpen(true)}
            onOpenNewPlace={() => setIsAddPlaceOpen(true)}
            onOpenNewOpportunity={() => setIsAddOpportunityOpen(true)}
          />

          {/* 8. ADD NEW PLACE MODAL */}
          <AddPlaceModal
            isOpen={isAddPlaceOpen}
            onClose={() => setIsAddPlaceOpen(false)}
            onAddPlace={handleAddPlace}
            userDistrict={userProfile.district}
          />

          {/* 9. ADD NEW OPPORTUNITY MODAL */}
          <AddOpportunityModal
            isOpen={isAddOpportunityOpen}
            onClose={() => setIsAddOpportunityOpen(false)}
            onAddOpportunity={handleAddOpportunity}
            userName={userProfile.name}
            userDistrict={`${userProfile.district}, Dublin`}
          />
        </div>
    </div>
  );
}
