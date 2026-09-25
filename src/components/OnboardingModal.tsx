import React, { useState } from 'react';
import {
  ShieldCheck,
  Check,
  ArrowRight,
  Sparkles,
  MapPin,
  Eye,
  Info,
  ChevronLeft
} from 'lucide-react';
import {
  IDENTITY_OPTIONS,
  ACTIVITY_OPTIONS,
  INTEREST_OPTIONS,
  LOOKING_FOR_OPTIONS,
  OFFERING_OPTIONS
} from '../data/dublinData';
import { IdentityType, ActivityType, VisibilityLevel, UserProfile } from '../types';

interface OnboardingModalProps {
  isOpen: boolean;
  onComplete: (profile: Partial<UserProfile>) => void;
  onClosePreview?: () => void;
  requiredReason?: string | null;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({
  isOpen,
  onComplete,
  onClosePreview,
  requiredReason,
}) => {
  const [step, setStep] = useState<number>(0);
  // Profile state
  const [name, setName] = useState<string>('Alex Brennan');
  const [handle, setHandle] = useState<string>('@alex_dublin');
  const [identity, setIdentity] = useState<IdentityType>('Newcomer');
  const [activity, setActivity] = useState<ActivityType>('IT & Tech');
  const [selectedInterests, setSelectedInterests] = useState<string[]>([
    'Specialty Coffee',
    'Canal Walks',
    'Tech Hackathons',
  ]);
  const [selectedLookingFor, setSelectedLookingFor] = useState<string[]>([
    'Canal/Sublet Housing',
    'Coffee & Spontaneous Chat',
  ]);
  const [selectedOffering, setSelectedOffering] = useState<string[]>([
    'Tech & Code Mentorship',
    'Specialty Coffee / Tea treat',
  ]);
  const [visibility, setVisibility] = useState<VisibilityLevel>('zone');
  const [locationPermitted, setLocationPermitted] = useState<boolean>(true);

  if (!isOpen) return null;

  const toggleInterest = (item: string) => {
    if (selectedInterests.includes(item)) {
      if (selectedInterests.length > 1) {
        setSelectedInterests(selectedInterests.filter((i) => i !== item));
      }
    } else {
      if (selectedInterests.length < 6) {
        setSelectedInterests([...selectedInterests, item]);
      }
    }
  };

  const toggleLookingFor = (item: string) => {
    if (selectedLookingFor.includes(item)) {
      if (selectedLookingFor.length > 1) {
        setSelectedLookingFor(selectedLookingFor.filter((i) => i !== item));
      }
    } else {
      if (selectedLookingFor.length < 4) {
        setSelectedLookingFor([...selectedLookingFor, item]);
      }
    }
  };

  const toggleOffering = (item: string) => {
    if (selectedOffering.includes(item)) {
      if (selectedOffering.length > 1) {
        setSelectedOffering(selectedOffering.filter((i) => i !== item));
      }
    } else {
      if (selectedOffering.length < 4) {
        setSelectedOffering([...selectedOffering, item]);
      }
    }
  };

  const handleFinish = () => {
    onComplete({
      name: name.trim() || 'Dublin Explorer',
      handle: handle.trim() || '@explorer',
      identity,
      activity,
      interests: selectedInterests,
      lookingFor: selectedLookingFor,
      offering: selectedOffering,
      visibility,
      isOnboarded: true,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-lg bg-[#0a0f24] border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Top Header */}
        <div className="px-6 pt-5 pb-4 border-b border-slate-800/80 bg-[#0d1430]/60 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-pink-500 via-cyan-400 to-emerald-400 p-[1.5px] flex items-center justify-center shadow-lg shadow-pink-500/20">
              <div className="w-full h-full bg-[#0a0f24] rounded-[10px] flex items-center justify-center text-xs font-bold text-slate-100">
                PM
              </div>
            </div>
            <div>
              <h2 className="text-base font-bold tracking-tight text-white flex items-center gap-1.5">
                PicMe <span className="text-xs text-cyan-400 font-mono font-normal">Dublin</span>
              </h2>
              <p className="text-[11px] text-slate-400">Context Entry Pass</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              {[0, 1, 2, 3, 4, 5, 6].map((s) => (
                <div
                  key={s}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    s === step
                      ? 'w-6 bg-cyan-400'
                      : s < step
                      ? 'w-2 bg-pink-500'
                      : 'w-2 bg-slate-800'
                  }`}
                />
              ))}
            </div>
            {onClosePreview && (
              <button
                onClick={onClosePreview}
                className="text-xs text-slate-400 hover:text-white px-2 py-1 rounded-lg hover:bg-slate-800"
              >
                Inspect Map
              </button>
            )}
          </div>
        </div>

        {/* Scrollable Content Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {/* STEP 0: EXPLANATION OF WHY CONTEXT IS REQUIRED */}
          {step === 0 && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-[#0e1738] border border-cyan-500/20 space-y-3">
                <div className="flex items-center gap-2 text-cyan-400 font-semibold text-sm">
                  <Info className="w-4 h-4 text-cyan-400 shrink-0" />
                  <span>Why PicMe Requires Your Profile Context</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  You are looking at the live Dublin map. However, until PicMe understands who you are and what you seek,
                  it cannot calculate mutual resonance or display safe surrounding signals.
                </p>
                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 text-[11px] text-slate-300 space-y-2">
                  <div className="flex items-start gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-400 mt-0.5 shrink-0" />
                    <span><strong className="text-white">Zero Random Spam:</strong> We never broadcast you to strangers. Matching requires shared context and mutual openness.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="w-3.5 h-3.5 text-cyan-400 mt-0.5 shrink-0" />
                    <span><strong className="text-white">Hyper-Local Layers:</strong> Programmers see tech opportunities; artists see creative gigs; newcomers see rental leads.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="w-3.5 h-3.5 text-pink-400 mt-0.5 shrink-0" />
                    <span><strong className="text-white">Privacy by Geometry:</strong> Raw coordinates never leave your device. You choose exact point, 500m blurred zone, or ghost mode.</span>
                  </div>
                </div>
              </div>

              {requiredReason && (
                <div className="p-3 rounded-xl bg-pink-950/30 border border-pink-500/30 text-xs text-pink-200">
                  {requiredReason}
                </div>
              )}

              <div className="space-y-3 pt-2">
                <label className="block text-xs font-semibold text-slate-300">Choose your Dublin nickname & handle</label>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-[11px] text-slate-400 block mb-1">Display Name</span>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Alex"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-sm text-white focus:outline-none focus:border-cyan-400"
                    />
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-400 block mb-1">City Handle</span>
                    <input
                      type="text"
                      value={handle}
                      onChange={(e) => setHandle(e.target.value)}
                      placeholder="@alex_dublin"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-sm text-cyan-300 font-mono focus:outline-none focus:border-cyan-400"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 1: IDENTITY (WHO YOU ARE) */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-pink-400">Step 1 of 5 · Identity</span>
                <h3 className="text-lg font-bold text-white mt-0.5">Who are you in Dublin?</h3>
                <p className="text-xs text-slate-400 mt-1">This sets your primary urban lens and baseline discovery weight.</p>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                {IDENTITY_OPTIONS.map((opt) => {
                  const isSelected = identity === opt.type;
                  return (
                    <button
                      key={opt.type}
                      onClick={() => setIdentity(opt.type)}
                      className={`p-3.5 rounded-2xl text-left border transition-all duration-200 flex flex-col justify-between ${
                        isSelected
                          ? 'bg-[#141e46] border-cyan-400 ring-2 ring-cyan-400/30'
                          : 'bg-[#0c1228] border-slate-800/90 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between w-full mb-1">
                        <span className={`text-sm font-semibold ${isSelected ? 'text-cyan-300' : 'text-slate-200'}`}>
                          {opt.type}
                        </span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-cyan-400" />}
                      </div>
                      <span className="text-[11px] text-slate-400 leading-snug">{opt.description}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 2: ACTIVITY (FIELD/INDUSTRY) */}
          {step === 2 && (
            <div className="space-y-4">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-cyan-400">Step 2 of 5 · Activity</span>
                <h3 className="text-lg font-bold text-white mt-0.5">What is your primary craft or sphere?</h3>
                <p className="text-xs text-slate-400 mt-1">Matches you with adjacent professionals and relevant Dublin opportunities.</p>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                {ACTIVITY_OPTIONS.map((opt) => {
                  const isSelected = activity === opt.type;
                  return (
                    <button
                      key={opt.type}
                      onClick={() => setActivity(opt.type)}
                      className={`p-3.5 rounded-2xl text-left border transition-all duration-200 flex flex-col justify-between ${
                        isSelected
                          ? 'bg-[#141e46] border-pink-400 ring-2 ring-pink-400/30'
                          : 'bg-[#0c1228] border-slate-800/90 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between w-full mb-1">
                        <span className={`text-sm font-semibold ${isSelected ? 'text-pink-300' : 'text-slate-200'}`}>
                          {opt.type}
                        </span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-pink-400" />}
                      </div>
                      <span className="text-[11px] text-slate-400 leading-snug">{opt.description}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 3: INTERESTS */}
          {step === 3 && (
            <div className="space-y-4">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-400">Step 3 of 5 · Interests</span>
                <h3 className="text-lg font-bold text-white mt-0.5">What sparks you outside work?</h3>
                <p className="text-xs text-slate-400 mt-1">Select 2 to 6 tags. These form the fuel for nearby signal matches.</p>
              </div>

              <div className="flex flex-wrap gap-2 pt-1">
                {INTEREST_OPTIONS.map((item) => {
                  const active = selectedInterests.includes(item);
                  return (
                    <button
                      key={item}
                      onClick={() => toggleInterest(item)}
                      className={`px-3.5 py-2 rounded-xl text-xs font-medium border transition-colors flex items-center gap-1.5 ${
                        active
                          ? 'bg-pink-500/20 text-pink-200 border-pink-400 shadow-sm shadow-pink-500/30'
                          : 'bg-[#0d1430] text-slate-300 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      {item}
                      {active && <Check className="w-3 h-3 text-pink-400" />}
                    </button>
                  );
                })}
              </div>
              <p className="text-[11px] text-slate-500 font-mono">Selected: {selectedInterests.length} / 6</p>
            </div>
          )}

          {/* STEP 4: WHAT I'M SEEKING */}
          {step === 4 && (
            <div className="space-y-4">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-cyan-400">Step 4 of 5 · Seeking</span>
                <h3 className="text-lg font-bold text-white mt-0.5">What are you looking for in Dublin?</h3>
                <p className="text-xs text-slate-400 mt-1">Filters the Opportunity Layer (Housing, Gigs, Companionship) specifically for you.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {LOOKING_FOR_OPTIONS.map((item) => {
                  const active = selectedLookingFor.includes(item);
                  return (
                    <button
                      key={item}
                      onClick={() => toggleLookingFor(item)}
                      className={`p-3 rounded-xl text-left text-xs font-medium border transition-colors flex items-center justify-between ${
                        active
                          ? 'bg-cyan-500/20 text-cyan-200 border-cyan-400'
                          : 'bg-[#0d1430] text-slate-300 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <span>{item}</span>
                      {active && <Check className="w-3.5 h-3.5 text-cyan-400" />}
                    </button>
                  );
                })}
              </div>
              <p className="text-[11px] text-slate-500 font-mono">Selected: {selectedLookingFor.length} / 4</p>
            </div>
          )}

          {/* STEP 5: WHAT I CAN OFFER */}
          {step === 5 && (
            <div className="space-y-4">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-400">Step 5 of 5 · Contribution</span>
                <h3 className="text-lg font-bold text-white mt-0.5">What can you offer to the city?</h3>
                <p className="text-xs text-slate-400 mt-1">Turns you into a living contributor on the map, not just a consumer.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {OFFERING_OPTIONS.map((item) => {
                  const active = selectedOffering.includes(item);
                  return (
                    <button
                      key={item}
                      onClick={() => toggleOffering(item)}
                      className={`p-3 rounded-xl text-left text-xs font-medium border transition-colors flex items-center justify-between ${
                        active
                          ? 'bg-emerald-500/20 text-emerald-200 border-emerald-400'
                          : 'bg-[#0d1430] text-slate-300 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <span>{item}</span>
                      {active && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                    </button>
                  );
                })}
              </div>
              <p className="text-[11px] text-slate-500 font-mono">Selected: {selectedOffering.length} / 4</p>
            </div>
          )}

          {/* STEP 6: GEOLOCATION & VISIBILITY CONTROLS */}
          {step === 6 && (
            <div className="space-y-4">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-pink-400">Final Step · Privacy Radar</span>
                <h3 className="text-lg font-bold text-white mt-0.5">Choose your city visibility level</h3>
                <p className="text-xs text-slate-400 mt-1">You hold total control over how your presence appears to others.</p>
              </div>

              <div className="p-3 rounded-2xl bg-[#0d1430] border border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-white block">Dublin Geolocation</span>
                    <span className="text-[11px] text-slate-400">Required to localize surrounding layers</span>
                  </div>
                </div>
                <button
                  onClick={() => setLocationPermitted(!locationPermitted)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    locationPermitted ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {locationPermitted ? 'Granted' : 'Simulated'}
                </button>
              </div>

              <div className="space-y-2">
                {[
                  {
                    level: 'zone' as VisibilityLevel,
                    title: 'Zone Blur (Recommended)',
                    desc: 'Shows an approximate 500m radius circle (e.g. Portobello canal). Raw coordinates NEVER leave your phone.',
                    badge: 'Safe & Active',
                  },
                  {
                    level: 'district' as VisibilityLevel,
                    title: 'District Level',
                    desc: 'Coarse city quarter beacon (e.g. "Dublin 2" or "Grand Canal Dock"). High privacy.',
                    badge: 'Coarse',
                  },
                  {
                    level: 'exact' as VisibilityLevel,
                    title: 'Exact Point',
                    desc: 'Pinpoint dot for trusted connections and immediate nearby meetups.',
                    badge: 'High Precision',
                  },
                  {
                    level: 'invisible' as VisibilityLevel,
                    title: 'Ghost / Invisible Mode',
                    desc: 'Explore Dublin places and opportunities. Nobody sees you on the map.',
                    badge: 'Stealth',
                  },
                ].map((item) => {
                  const isSelected = visibility === item.level;
                  return (
                    <button
                      key={item.level}
                      onClick={() => setVisibility(item.level)}
                      className={`w-full p-3.5 rounded-2xl text-left border transition-all flex items-start gap-3 ${
                        isSelected
                          ? 'bg-[#141e46] border-cyan-400 ring-2 ring-cyan-400/20'
                          : 'bg-[#0c1228] border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="mt-0.5">
                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                          isSelected ? 'border-cyan-400 bg-cyan-400' : 'border-slate-600'
                        }`}>
                          {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-slate-950" />}
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-semibold text-white">{item.title}</span>
                          <span className="text-[10px] font-mono text-cyan-300 px-1.5 py-0.5 rounded bg-cyan-950/60 border border-cyan-800/40">
                            {item.badge}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 leading-snug">{item.desc}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Bottom Actions Bar */}
        <div className="px-6 py-4 border-t border-slate-800 bg-[#0d1430]/70 flex items-center justify-between">
          {step > 0 ? (
            <button
              onClick={() => setStep(step - 1)}
              className="px-3.5 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition-colors flex items-center gap-1.5"
            >
              <ChevronLeft className="w-4 h-4" />
              Back
            </button>
          ) : (
            <div className="text-[11px] text-slate-500 font-mono">10 Free Daily Signals Included</div>
          )}

          {step < 6 ? (
            <button
              onClick={() => setStep(step + 1)}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-pink-500 to-cyan-500 hover:from-pink-600 hover:to-cyan-600 text-white font-semibold text-xs transition-all shadow-lg shadow-pink-500/20 flex items-center gap-2"
            >
              {step === 0 ? 'Create Dublin Context Pass' : 'Next Step'}
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              onClick={handleFinish}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-400 via-emerald-400 to-pink-500 hover:opacity-95 text-slate-950 font-bold text-xs transition-all shadow-lg shadow-cyan-400/20 flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              Enter PicMe Dublin
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
