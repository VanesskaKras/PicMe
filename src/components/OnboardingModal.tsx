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
import { useI18n } from '../i18n';

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
  const { t } = useI18n();
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
      name: name.trim() || t('Explorer'),
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
    <div className="absolute inset-0 z-50 flex items-center justify-center p-3 bg-ink-strong/40 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-lg bg-white border border-line rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-full">
        {/* Top Header */}
        <div className="px-6 pt-5 pb-4 border-b border-line bg-card/60 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-people via-opp to-place p-[1.5px] flex items-center justify-center shadow-lg shadow-people/20">
              <div className="w-full h-full bg-white rounded-[10px] flex items-center justify-center text-xs font-bold text-ink-strong">
                PM
              </div>
            </div>
            <div>
              <h2 className="text-base font-bold tracking-tight text-ink-strong flex items-center gap-1.5">
                PicMe
              </h2>
              <p className="text-[11px] text-muted">{t('Context Entry Pass')}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              {[0, 1, 2, 3, 4, 5, 6].map((s) => (
                <div
                  key={s}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    s === step
                      ? 'w-6 bg-opp'
                      : s < step
                      ? 'w-2 bg-opp/50'
                      : 'w-2 bg-line'
                  }`}
                />
              ))}
            </div>
            {onClosePreview && (
              <button
                onClick={onClosePreview}
                className="text-xs text-muted hover:text-ink-strong px-2 py-1 rounded-lg hover:bg-line"
              >
                {t('Inspect Map')}
              </button>
            )}
          </div>
        </div>

        {/* Scrollable Content Body */}
        <div className="p-6 overflow-y-auto overscroll-contain space-y-5 flex-1 min-h-0">
          {/* STEP 0: EXPLANATION OF WHY CONTEXT IS REQUIRED */}
          {step === 0 && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-card border border-line space-y-3">
                <div className="flex items-center gap-2 text-ink font-semibold text-sm">
                  <Info className="w-4 h-4 text-ink shrink-0" />
                  <span>{t('Why PicMe Requires Your Profile Context')}</span>
                </div>
                <p className="text-xs text-muted leading-relaxed">
                  {t('You are looking at the live map. However, until PicMe understands who you are and what you seek, it cannot calculate mutual resonance or display safe surrounding signals.')}
                </p>
                <div className="p-3 rounded-xl bg-white/60 border border-line text-[11px] text-muted space-y-2">
                  <div className="flex items-start gap-2">
                    <Check className="w-3.5 h-3.5 text-ink mt-0.5 shrink-0" />
                    <span><strong className="text-ink-strong">{t('Zero Random Spam:')}</strong> {t('We never broadcast you to strangers. Matching requires shared context and mutual openness.')}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="w-3.5 h-3.5 text-ink mt-0.5 shrink-0" />
                    <span><strong className="text-ink-strong">{t('Hyper-Local Layers:')}</strong> {t('Programmers see tech opportunities; artists see creative gigs; newcomers see rental leads.')}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="w-3.5 h-3.5 text-ink mt-0.5 shrink-0" />
                    <span><strong className="text-ink-strong">{t('Privacy by Geometry:')}</strong> {t('Raw coordinates never leave your device. You choose exact point, 500m blurred zone, or ghost mode.')}</span>
                  </div>
                </div>
              </div>

              {requiredReason && (
                <div className="p-3 rounded-xl bg-card border border-line text-xs text-ink">
                  {requiredReason}
                </div>
              )}

              <div className="space-y-3 pt-2">
                <label className="block text-xs font-semibold text-muted">{t('Choose your nickname & handle')}</label>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-[11px] text-muted block mb-1">{t('Display Name')}</span>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder={t('e.g. Alex')}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-card border border-line text-sm text-ink-strong focus:outline-none focus:border-ink"
                    />
                  </div>
                  <div>
                    <span className="text-[11px] text-muted block mb-1">{t('City Handle')}</span>
                    <input
                      type="text"
                      value={handle}
                      onChange={(e) => setHandle(e.target.value)}
                      placeholder="@alex_dublin"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-card border border-line text-sm text-ink font-mono focus:outline-none focus:border-ink"
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
                <span className="text-[10px] font-mono uppercase tracking-wider text-muted">{t('Step 1 of 5 · Identity')}</span>
                <h3 className="text-lg font-bold text-ink-strong mt-0.5">{t('Who are you?')}</h3>
                <p className="text-xs text-muted mt-1">{t('This sets your primary urban lens and baseline discovery weight.')}</p>
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
                          ? 'bg-people-soft border-people ring-2 ring-people/40'
                          : 'bg-card border-line hover:border-line'
                      }`}
                    >
                      <div className="flex items-center justify-between w-full mb-1">
                        <span className={`text-sm font-semibold ${isSelected ? 'text-people-strong' : 'text-ink-strong'}`}>
                          {t(opt.type)}
                        </span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-people-strong" />}
                      </div>
                      <span className="text-[11px] text-muted leading-snug">{t(opt.description)}</span>
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
                <span className="text-[10px] font-mono uppercase tracking-wider text-muted">{t('Step 2 of 5 · Activity')}</span>
                <h3 className="text-lg font-bold text-ink-strong mt-0.5">{t('What is your primary craft or sphere?')}</h3>
                <p className="text-xs text-muted mt-1">{t('Matches you with adjacent professionals and relevant opportunities.')}</p>
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
                          ? 'bg-people-soft border-people ring-2 ring-people/40'
                          : 'bg-card border-line hover:border-line'
                      }`}
                    >
                      <div className="flex items-center justify-between w-full mb-1">
                        <span className={`text-sm font-semibold ${isSelected ? 'text-people-strong' : 'text-ink-strong'}`}>
                          {t(opt.type)}
                        </span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-people-strong" />}
                      </div>
                      <span className="text-[11px] text-muted leading-snug">{t(opt.description)}</span>
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
                <span className="text-[10px] font-mono uppercase tracking-wider text-muted">{t('Step 3 of 5 · Interests')}</span>
                <h3 className="text-lg font-bold text-ink-strong mt-0.5">{t('What sparks you outside work?')}</h3>
                <p className="text-xs text-muted mt-1">{t('Select 2 to 6 tags. These form the fuel for nearby signal matches.')}</p>
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
                          ? 'bg-people-soft text-people-strong border-people shadow-sm shadow-people/30'
                          : 'bg-card text-muted border-line hover:border-line'
                      }`}
                    >
                      {t(item)}
                      {active && <Check className="w-3 h-3 text-people-strong" />}
                    </button>
                  );
                })}
              </div>
              <p className="text-[11px] text-subtle font-mono">{t('Selected: {n} / {max}', { n: selectedInterests.length, max: 6 })}</p>
            </div>
          )}

          {/* STEP 4: WHAT I'M SEEKING */}
          {step === 4 && (
            <div className="space-y-4">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-muted">{t('Step 4 of 5 · Seeking')}</span>
                <h3 className="text-lg font-bold text-ink-strong mt-0.5">{t('What are you looking for?')}</h3>
                <p className="text-xs text-muted mt-1">{t('Filters the Opportunity Layer (Housing, Gigs, Companionship) specifically for you.')}</p>
              </div>

              <div className="grid grid-cols-1 @md:grid-cols-2 gap-2">
                {LOOKING_FOR_OPTIONS.map((item) => {
                  const active = selectedLookingFor.includes(item);
                  return (
                    <button
                      key={item}
                      onClick={() => toggleLookingFor(item)}
                      className={`p-3 rounded-xl text-left text-xs font-medium border transition-colors flex items-center justify-between ${
                        active
                          ? 'bg-people-soft text-people-strong border-people'
                          : 'bg-card text-muted border-line hover:border-line'
                      }`}
                    >
                      <span>{t(item)}</span>
                      {active && <Check className="w-3.5 h-3.5 text-people-strong" />}
                    </button>
                  );
                })}
              </div>
              <p className="text-[11px] text-subtle font-mono">{t('Selected: {n} / {max}', { n: selectedLookingFor.length, max: 4 })}</p>
            </div>
          )}

          {/* STEP 5: WHAT I CAN OFFER */}
          {step === 5 && (
            <div className="space-y-4">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-muted">{t('Step 5 of 5 · Contribution')}</span>
                <h3 className="text-lg font-bold text-ink-strong mt-0.5">{t('What can you offer to the city?')}</h3>
                <p className="text-xs text-muted mt-1">{t('Turns you into a living contributor on the map, not just a consumer.')}</p>
              </div>

              <div className="grid grid-cols-1 @md:grid-cols-2 gap-2">
                {OFFERING_OPTIONS.map((item) => {
                  const active = selectedOffering.includes(item);
                  return (
                    <button
                      key={item}
                      onClick={() => toggleOffering(item)}
                      className={`p-3 rounded-xl text-left text-xs font-medium border transition-colors flex items-center justify-between ${
                        active
                          ? 'bg-people-soft text-people-strong border-people'
                          : 'bg-card text-muted border-line hover:border-line'
                      }`}
                    >
                      <span>{t(item)}</span>
                      {active && <Check className="w-3.5 h-3.5 text-people-strong" />}
                    </button>
                  );
                })}
              </div>
              <p className="text-[11px] text-subtle font-mono">{t('Selected: {n} / {max}', { n: selectedOffering.length, max: 4 })}</p>
            </div>
          )}

          {/* STEP 6: GEOLOCATION & VISIBILITY CONTROLS */}
          {step === 6 && (
            <div className="space-y-4">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-muted">{t('Final Step · Privacy Radar')}</span>
                <h3 className="text-lg font-bold text-ink-strong mt-0.5">{t('Choose your city visibility level')}</h3>
                <p className="text-xs text-muted mt-1">{t('You hold total control over how your presence appears to others.')}</p>
              </div>

              <div className="p-3 rounded-2xl bg-card border border-line flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-success-soft text-success flex items-center justify-center">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-ink-strong block">{t('Geolocation')}</span>
                    <span className="text-[11px] text-muted">{t('Required to localize surrounding layers')}</span>
                  </div>
                </div>
                <button
                  onClick={() => setLocationPermitted(!locationPermitted)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    locationPermitted ? 'bg-success-soft text-success border border-success/40' : 'bg-line text-muted'
                  }`}
                >
                  {locationPermitted ? t('Granted') : t('Simulated')}
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
                    desc: 'Coarse city quarter beacon (e.g. "Grand Canal Dock"). High privacy.',
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
                    desc: 'Explore places and opportunities. Nobody sees you on the map.',
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
                          ? 'bg-people-soft border-people ring-2 ring-people/40'
                          : 'bg-card border-line hover:border-line'
                      }`}
                    >
                      <div className="mt-0.5">
                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                          isSelected ? 'border-people bg-people' : 'border-line-strong'
                        }`}>
                          {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-semibold text-ink-strong">{t(item.title)}</span>
                          <span className="text-[10px] font-mono text-ink px-1.5 py-0.5 rounded bg-ink-soft border border-line">
                            {t(item.badge)}
                          </span>
                        </div>
                        <p className="text-[11px] text-muted leading-snug">{t(item.desc)}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Bottom Actions Bar */}
        <div className="px-6 py-4 border-t border-line bg-card/70 flex items-center justify-between">
          {step > 0 ? (
            <button
              onClick={() => setStep(step - 1)}
              className="px-3.5 py-2 rounded-xl text-xs font-medium text-muted hover:text-ink-strong hover:bg-line transition-colors flex items-center gap-1.5"
            >
              <ChevronLeft className="w-4 h-4" />
              {t('Back')}
            </button>
          ) : (
            <div className="text-[11px] text-subtle font-mono">{t('10 Free Daily Signals Included')}</div>
          )}

          {step < 6 ? (
            <button
              onClick={() => setStep(step + 1)}
              className="px-5 py-2.5 rounded-xl bg-opp hover:bg-opp-hover text-ink-strong font-semibold text-xs transition-all shadow-lg shadow-opp/30 flex items-center gap-2"
            >
              {step === 0 ? t('Create Context Pass') : t('Next Step')}
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              onClick={handleFinish}
              className="px-6 py-2.5 rounded-xl bg-opp hover:bg-opp-hover text-ink-strong font-bold text-xs transition-all shadow-lg shadow-opp/30 flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              {t('Enter PicMe')}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
