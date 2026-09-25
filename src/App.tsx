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
  Zap
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
import { ProfileModal } from './components/ProfileModal';
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

  // Layers Toggles
  const [layers, setLayers] = useState({
    people: true,
    places: true,
    opportunities: true,
  });

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
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isOpportunitiesOpen, setIsOpportunitiesOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
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
      'AIzaSyC1nRfB-YlvDvbWDXWRcYJTFT4aij_neu4'
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
    setChatThreads((prev) => prev.filter((t) => t.id !== threadId));
    showToast('Contact muted. Your Aura remains fully protected.');
  };

  // Toggle Layer
  const toggleLayer = (key: 'people' | 'places' | 'opportunities') => {
    setLayers((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // Switch Bottom Tab
  const handleTabChange = (tab: 'map' | 'opportunities' | 'chat' | 'profile') => {
    setActiveTab(tab);
    if (tab === 'opportunities') setIsOpportunitiesOpen(true);
    if (tab === 'chat') setIsChatOpen(true);
    if (tab === 'profile') setIsProfileOpen(true);
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
    <div className="h-screen w-full bg-[#050814] text-slate-100 flex flex-col items-center justify-center relative font-sans overflow-hidden select-none">
      {/* GLOBAL TOAST */}
      {toastMessage && (
        <div className="fixed top-4 z-[9999] px-4 py-2.5 rounded-2xl bg-gradient-to-r from-pink-500/90 to-cyan-500/90 backdrop-blur-md text-slate-950 font-bold text-xs shadow-2xl flex items-center gap-2 animate-bounce">
          <Sparkles className="w-4 h-4 text-slate-950" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* MOBILE APPLICATION CONTAINER */}
      <div className="relative w-full max-w-[430px] h-full sm:h-[94vh] sm:max-h-[890px] sm:rounded-[40px] sm:border-[8px] sm:border-[#131b34] sm:shadow-[0_0_60px_rgba(0,0,0,0.85)] bg-[#070b19] overflow-hidden flex flex-col">
        {/* TOP MOBILE STATUS BAR */}
        <div className="h-10 px-6 pt-2 bg-[#070b19]/90 backdrop-blur-md flex items-center justify-between text-[11px] text-slate-300 z-30 shrink-0 select-none">
          <span className="font-semibold font-mono">9:41</span>
          {/* Dynamic Island pill */}
          <div className="w-24 h-4 bg-black rounded-full border border-slate-800/80 shadow-inner flex items-center justify-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
            <span className="text-[9px] text-cyan-300 font-mono">Dublin Active</span>
          </div>
          <div className="flex items-center gap-1 font-mono text-[10px]">
            <span>5G</span>
            <span className="w-4 h-2 rounded-sm border border-slate-400 p-[1px] inline-flex items-center">
              <span className="w-2.5 h-full bg-emerald-400 rounded-2xs" />
            </span>
          </div>
        </div>

        {/* 3 LAYER TOGGLES BAR WITH SLIDERS SETTINGS ICON AT THE END */}
        <div className="px-3 py-2 bg-[#080d1f]/95 border-b border-slate-800/80 z-20 shrink-0 relative">
          <div className="flex items-center gap-1.5">
            {/* Layer 1: People */}
            <button
              onClick={() => toggleLayer('people')}
              className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-semibold border flex items-center justify-center gap-1.5 transition-all ${
                layers.people
                  ? 'bg-pink-500/20 text-pink-200 border-pink-400 shadow-sm shadow-pink-500/20'
                  : 'bg-slate-900/60 text-slate-500 border-slate-800'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${layers.people ? 'bg-pink-400 animate-pulse' : 'bg-slate-600'}`} />
              <span>People</span>
            </button>

            {/* Layer 2: Places */}
            <button
              onClick={() => toggleLayer('places')}
              className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-semibold border flex items-center justify-center gap-1.5 transition-all ${
                layers.places
                  ? 'bg-cyan-500/20 text-cyan-200 border-cyan-400 shadow-sm shadow-cyan-500/20'
                  : 'bg-slate-900/60 text-slate-500 border-slate-800'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${layers.places ? 'bg-cyan-400 animate-pulse' : 'bg-slate-600'}`} />
              <span>Places</span>
            </button>

            {/* Layer 3: Opportunities */}
            <button
              onClick={() => toggleLayer('opportunities')}
              className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-semibold border flex items-center justify-center gap-1.5 transition-all ${
                layers.opportunities
                  ? 'bg-emerald-500/20 text-emerald-200 border-emerald-400 shadow-sm shadow-emerald-500/20'
                  : 'bg-slate-900/60 text-slate-500 border-slate-800'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${layers.opportunities ? 'bg-emerald-400 animate-pulse' : 'bg-slate-600'}`} />
              <span>Opportunities</span>
            </button>

            {/* Settings sliders button at the end of the row */}
            <button
              onClick={() => setIsFilterMenuOpen(!isFilterMenuOpen)}
              className={`p-2 rounded-xl border transition-all flex items-center justify-center relative shrink-0 ${
                isFilterMenuOpen || peopleFilter !== 'all' || placesFilter !== 'all' || oppsFilter !== 'all'
                  ? 'bg-cyan-500/25 text-cyan-300 border-cyan-400 shadow-[0_0_12px_rgba(0,240,255,0.3)]'
                  : 'bg-slate-900/80 text-slate-400 border-slate-800 hover:text-white hover:border-slate-700'
              }`}
              title="Category Filters"
            >
              <SlidersHorizontal className="w-4 h-4" />
              {(peopleFilter !== 'all' || placesFilter !== 'all' || oppsFilter !== 'all') && (
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-pink-500 ring-2 ring-slate-950" />
              )}
            </button>
          </div>

          {/* Hidden Settings / Category Filters Menu (Revealed when sliders icon is clicked) */}
          {isFilterMenuOpen && (
            <div className="mt-2 pt-2.5 border-t border-slate-800/80 space-y-2 animate-in fade-in slide-in-from-top-2 duration-150">
              {/* Row 1: People (Pink theme matching People category) */}
              <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
                <span className="text-[11px] font-bold text-pink-300 shrink-0 w-20">People:</span>
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => setPeopleFilter('all')}
                    className={`px-2.5 py-1 rounded-lg text-[11px] transition-all ${
                      peopleFilter === 'all'
                        ? 'bg-pink-500/20 text-pink-200 border border-pink-400 font-bold shadow-sm shadow-pink-500/20'
                        : 'bg-slate-900/80 text-slate-400 hover:text-white border border-slate-800 font-medium'
                    }`}
                  >
                    All Open
                  </button>
                  <button
                    onClick={() => setPeopleFilter('interests')}
                    className={`px-2.5 py-1 rounded-lg text-[11px] transition-all ${
                      peopleFilter === 'interests'
                        ? 'bg-pink-500/20 text-pink-200 border border-pink-400 font-bold shadow-sm shadow-pink-500/20'
                        : 'bg-slate-900/80 text-slate-400 hover:text-white border border-slate-800 font-medium'
                    }`}
                  >
                    Matching Interests
                  </button>
                  <button
                    onClick={() => setPeopleFilter('mood')}
                    className={`px-2.5 py-1 rounded-lg text-[11px] transition-all ${
                      peopleFilter === 'mood'
                        ? 'bg-pink-500/20 text-pink-200 border border-pink-400 font-bold shadow-sm shadow-pink-500/20'
                        : 'bg-slate-900/80 text-slate-400 hover:text-white border border-slate-800 font-medium'
                    }`}
                  >
                    Shared Mood
                  </button>
                </div>
              </div>

              {/* Row 2: Places (Cyan theme matching Places category) */}
              <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
                <span className="text-[11px] font-bold text-cyan-300 shrink-0 w-20">Places:</span>
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => setPlacesFilter('all')}
                    className={`px-2.5 py-1 rounded-lg text-[11px] transition-all ${
                      placesFilter === 'all'
                        ? 'bg-cyan-500/20 text-cyan-200 border border-cyan-400 font-bold shadow-sm shadow-cyan-500/20'
                        : 'bg-slate-900/80 text-slate-400 hover:text-white border border-slate-800 font-medium'
                    }`}
                  >
                    All
                  </button>
                  <button
                    onClick={() => setPlacesFilter('cafe')}
                    className={`px-2.5 py-1 rounded-lg text-[11px] transition-all ${
                      placesFilter === 'cafe'
                        ? 'bg-cyan-500/20 text-cyan-200 border border-cyan-400 font-bold shadow-sm shadow-cyan-500/20'
                        : 'bg-slate-900/80 text-slate-400 hover:text-white border border-slate-800 font-medium'
                    }`}
                  >
                    Coffee & Food
                  </button>
                  <button
                    onClick={() => setPlacesFilter('coworking')}
                    className={`px-2.5 py-1 rounded-lg text-[11px] transition-all ${
                      placesFilter === 'coworking'
                        ? 'bg-cyan-500/20 text-cyan-200 border border-cyan-400 font-bold shadow-sm shadow-cyan-500/20'
                        : 'bg-slate-900/80 text-slate-400 hover:text-white border border-slate-800 font-medium'
                    }`}
                  >
                    Coworking
                  </button>
                  <button
                    onClick={() => setPlacesFilter('sport')}
                    className={`px-2.5 py-1 rounded-lg text-[11px] transition-all ${
                      placesFilter === 'sport'
                        ? 'bg-cyan-500/20 text-cyan-200 border border-cyan-400 font-bold shadow-sm shadow-cyan-500/20'
                        : 'bg-slate-900/80 text-slate-400 hover:text-white border border-slate-800 font-medium'
                    }`}
                  >
                    Sports
                  </button>
                  <button
                    onClick={() => setPlacesFilter('culture')}
                    className={`px-2.5 py-1 rounded-lg text-[11px] transition-all ${
                      placesFilter === 'culture'
                        ? 'bg-cyan-500/20 text-cyan-200 border border-cyan-400 font-bold shadow-sm shadow-cyan-500/20'
                        : 'bg-slate-900/80 text-slate-400 hover:text-white border border-slate-800 font-medium'
                    }`}
                  >
                    Culture
                  </button>
                </div>
              </div>

              {/* Row 3: Opportunities (Emerald theme matching Opportunities category) */}
              <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
                <span className="text-[11px] font-bold text-emerald-300 shrink-0 w-20">Opportunities:</span>
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => setOppsFilter('all')}
                    className={`px-2.5 py-1 rounded-lg text-[11px] transition-all ${
                      oppsFilter === 'all'
                        ? 'bg-emerald-500/20 text-emerald-200 border border-emerald-400 font-bold shadow-sm shadow-emerald-500/20'
                        : 'bg-slate-900/80 text-slate-400 hover:text-white border border-slate-800 font-medium'
                    }`}
                  >
                    All
                  </button>
                  <button
                    onClick={() => setOppsFilter('housing')}
                    className={`px-2.5 py-1 rounded-lg text-[11px] transition-all ${
                      oppsFilter === 'housing'
                        ? 'bg-emerald-500/20 text-emerald-200 border border-emerald-400 font-bold shadow-sm shadow-emerald-500/20'
                        : 'bg-slate-900/80 text-slate-400 hover:text-white border border-slate-800 font-medium'
                    }`}
                  >
                    Housing (714)
                  </button>
                  <button
                    onClick={() => setOppsFilter('job')}
                    className={`px-2.5 py-1 rounded-lg text-[11px] transition-all ${
                      oppsFilter === 'job'
                        ? 'bg-emerald-500/20 text-emerald-200 border border-emerald-400 font-bold shadow-sm shadow-emerald-500/20'
                        : 'bg-slate-900/80 text-slate-400 hover:text-white border border-slate-800 font-medium'
                    }`}
                  >
                    Jobs (1154)
                  </button>
                  <button
                    onClick={() => setOppsFilter('collaboration')}
                    className={`px-2.5 py-1 rounded-lg text-[11px] transition-all ${
                      oppsFilter === 'collaboration'
                        ? 'bg-emerald-500/20 text-emerald-200 border border-emerald-400 font-bold shadow-sm shadow-emerald-500/20'
                        : 'bg-slate-900/80 text-slate-400 hover:text-white border border-slate-800 font-medium'
                    }`}
                  >
                    Collaborations
                  </button>
                  <button
                    onClick={() => setOppsFilter('activity')}
                    className={`px-2.5 py-1 rounded-lg text-[11px] transition-all ${
                      oppsFilter === 'activity'
                        ? 'bg-emerald-500/20 text-emerald-200 border border-emerald-400 font-bold shadow-sm shadow-emerald-500/20'
                        : 'bg-slate-900/80 text-slate-400 hover:text-white border border-slate-800 font-medium'
                    }`}
                  >
                    Activities
                  </button>
                </div>
              </div>

              {/* Reset shortcut */}
              {(peopleFilter !== 'all' || placesFilter !== 'all' || oppsFilter !== 'all') && (
                <div className="pt-1 flex justify-end">
                  <button
                    onClick={() => {
                      setPeopleFilter('all');
                      setPlacesFilter('all');
                      setOppsFilter('all');
                    }}
                    className="text-[11px] text-pink-400 hover:underline font-semibold"
                  >
                    Reset all filters
                  </button>
                </div>
              )}
            </div>
          )}
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

            {/* Quick Opportunities Drawer Trigger on Map */}
            <div className="absolute bottom-4 right-3 z-10">
              <button
                onClick={() => setIsOpportunitiesOpen(true)}
                className="px-3.5 py-2 rounded-2xl bg-emerald-500 text-slate-950 font-bold text-xs shadow-xl shadow-emerald-500/30 flex items-center gap-1.5 hover:scale-105 active:scale-95 transition-transform"
              >
                <Briefcase className="w-3.5 h-3.5" />
                <span>{opportunities.length} Leads</span>
              </button>
            </div>
          </div>

          {/* ITEM DETAIL DRAWER (WHEN A PLACE OR OPPORTUNITY IS SELECTED) */}
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

          {/* BOTTOM NAVIGATION TAB BAR (5 ITEMS: MAP, OPPORTUNITIES, +, SIGNALS, PROFILE) */}
          <nav className="h-16 px-2 bg-[#070b19]/95 backdrop-blur-md border-t border-slate-800/90 grid grid-cols-5 items-center z-20 shrink-0 select-none">
            {/* TAB 1: MAP */}
            <button
              onClick={() => handleTabChange('map')}
              className={`flex flex-col items-center justify-center transition-colors ${
                activeTab === 'map' ? 'text-pink-400' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              <Compass className="w-5 h-5" />
              <span className="text-[10px] font-semibold mt-1">Map</span>
            </button>

            {/* TAB 2: OPPORTUNITIES */}
            <button
              onClick={() => handleTabChange('opportunities')}
              className={`flex flex-col items-center justify-center transition-colors relative ${
                activeTab === 'opportunities' ? 'text-emerald-400' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              <Briefcase className="w-5 h-5" />
              <span className="text-[10px] font-semibold mt-1">Opportunities</span>
              <span className="absolute top-0 right-3 w-2 h-2 rounded-full bg-emerald-400" />
            </button>

            {/* TAB 3: PLUS ACTION BUTTON (+) */}
            <button
              onClick={() => setIsPlusActionOpen(true)}
              aria-label="Add or Broadcast"
              className="flex flex-col items-center justify-center group relative -top-1"
            >
              <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-pink-500 via-rose-500 to-cyan-400 flex items-center justify-center text-slate-950 font-bold shadow-lg shadow-pink-500/30 group-hover:scale-110 active:scale-95 transition-all">
                <Plus className="w-6 h-6 stroke-[2.5]" />
              </div>
            </button>

            {/* TAB 4: SIGNALS */}
            <button
              onClick={() => handleTabChange('chat')}
              className={`flex flex-col items-center justify-center transition-colors relative ${
                activeTab === 'chat' ? 'text-emerald-400' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              <Zap className="w-5 h-5" />
              <span className="text-[10px] font-semibold mt-1">Signals</span>
              {chatThreads.some((t) => t.stage === 'hidden_notification') && (
                <span className="absolute top-0 right-3 w-2 h-2 rounded-full bg-pink-500 animate-ping" />
              )}
            </button>

            {/* TAB 5: PROFILE */}
            <button
              onClick={() => handleTabChange('profile')}
              className={`flex flex-col items-center justify-center transition-colors ${
                activeTab === 'profile' ? 'text-white' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              <div className="w-5 h-5 rounded-full overflow-hidden border border-slate-700">
                <img src={userProfile.avatarUrl} alt="Me" className="w-full h-full object-cover" />
              </div>
              <span className="text-[10px] font-semibold mt-1">Profile</span>
            </button>
          </nav>
        </div>

      {/* MODALS & DRAWERS */}

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

      {/* 5. SIGNALS & RESONANCE (RESONANCE & REQUESTS) */}
      <ChatDrawer
        isOpen={isChatOpen}
        onClose={() => {
          setIsChatOpen(false);
          setActiveTab('map');
        }}
        threads={chatThreads}
        currentUser={userProfile}
        nearbyUsers={NEARBY_DUBLIN_USERS}
        dailySignalsRemaining={userProfile.dailySignalsLimit - userProfile.dailySignalsUsed}
        onSendSignal={handleSendSignal}
        onReplyThread={handleReplyThread}
        onPolitelyDecline={handlePolitelyDecline}
        onBlockReport={handleBlockReport}
        onOpenStatusMood={() => {
          setIsChatOpen(false);
          setIsStatusMoodOpen(true);
        }}
      />

      {/* 6. OPPORTUNITIES LIST */}
      <OpportunitiesListModal
        isOpen={isOpportunitiesOpen}
        onClose={() => {
          setIsOpportunitiesOpen(false);
          setActiveTab('map');
        }}
        opportunities={opportunities}
        onSelectOpportunity={(opp) => {
          setSelectedOpportunity(opp);
          setIsOpportunitiesOpen(false);
          setActiveTab('map');
        }}
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

      {/* 10. PROFILE & CATEGORIES MODAL */}
      <ProfileModal
        isOpen={isProfileOpen}
        onClose={() => {
          setIsProfileOpen(false);
          setActiveTab('map');
        }}
        user={userProfile}
        auraLogs={auraLogs}
        onUpdateVisibility={(level: VisibilityLevel) => {
          saveProfile({ visibility: level });
          showToast(`Visibility set to ${level}`);
        }}
        onOpenOnboardingEdit={() => {
          setIsProfileOpen(false);
          setIsOnboardingModalOpen(true);
        }}
        onOpenAura={() => {
          setIsProfileOpen(false);
          setIsAuraOpen(true);
        }}
      />
    </div>
  );
}
