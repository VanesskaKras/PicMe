import React, { useEffect, useState } from 'react';
import {
  Award,
  Bell,
  Bookmark,
  Briefcase,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Eye,
  EyeOff,
  Globe,
  Layers,
  LogOut,
  MapPin,
  Megaphone,
  Pencil,
  Radio,
  Settings,
  User,
  X,
} from 'lucide-react';
import { UserProfile, VisibilityLevel, DublinPlace, DublinOpportunity } from '../types';
import { GraphicIcon } from './GraphicIcon';
import { useI18n, LANGUAGES, TFunction } from '../i18n';

export interface ProfileSettings {
  notifications: { signals: boolean; moodExpiring: boolean; opportunitiesNearby: boolean };
  defaultLayers: { people: boolean; places: boolean; opportunities: boolean };
}

export interface SavedItems {
  places: string[];
  opportunities: string[];
}

export const DEFAULT_PROFILE_SETTINGS: ProfileSettings = {
  notifications: { signals: true, moodExpiring: true, opportunitiesNearby: false },
  defaultLayers: { people: true, places: true, opportunities: true },
};

export function loadProfileSettings(): ProfileSettings {
  try {
    const saved = JSON.parse(localStorage.getItem('picme_settings') || 'null');
    if (saved) {
      return {
        notifications: { ...DEFAULT_PROFILE_SETTINGS.notifications, ...saved.notifications },
        defaultLayers: { ...DEFAULT_PROFILE_SETTINGS.defaultLayers, ...saved.defaultLayers },
      };
    }
  } catch (e) {
    // fall through to defaults
  }
  return DEFAULT_PROFILE_SETTINGS;
}

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
  places: DublinPlace[];
  opportunities: DublinOpportunity[];
  saved: SavedItems;
  onUpdateVisibility: (level: VisibilityLevel) => void;
  onOpenOnboardingEdit: () => void;
  onOpenAura: () => void;
  onExtendMood: () => void;
  onChangeMood: () => void;
  onShowPlace: (place: DublinPlace) => void;
  onShowOpportunity: (opp: DublinOpportunity) => void;
  onLogout: () => void;
}

const VISIBILITY_OPTIONS: { level: VisibilityLevel; label: string }[] = [
  { level: 'exact', label: 'Point' },
  { level: 'zone', label: 'Zone' },
  { level: 'district', label: 'District' },
  { level: 'invisible', label: 'Invisible' },
];

const DAY_MS = 24 * 60 * 60 * 1000;

function formatDuration(ms: number, t: TFunction): string {
  const mins = Math.ceil(ms / 60000);
  if (mins < 60) return t('{n} min', { n: mins });
  const hours = Math.floor(mins / 60);
  if (hours < 24) return mins % 60 ? t('{h} h {m} min', { h: hours, m: mins % 60 }) : t('{h} h', { h: hours });
  return t('{n} d', { n: Math.ceil(ms / DAY_MS) });
}

function formatTimeLeft(ms: number, t: TFunction): string {
  if (ms <= 0) return t('expired');
  return t('{time} left', { time: formatDuration(ms, t) });
}

// Filled = active right now, outlined = permanent / background
const chipOutline = 'px-3 py-1 rounded-full text-xs font-medium bg-white border';
const chipFilled = 'px-3 py-1 rounded-full text-xs font-semibold';
const btnBase = 'rounded-full font-semibold text-xs transition-colors';

const SectionTitle: React.FC<{ children: React.ReactNode; action?: React.ReactNode }> = ({ children, action }) => (
  <div className="flex items-center justify-between mb-2">
    <h4 className="text-[11px] font-bold uppercase tracking-wider text-muted">{children}</h4>
    {action}
  </div>
);

const Toggle: React.FC<{ checked: boolean; onChange: (v: boolean) => void; label: string }> = ({ checked, onChange, label }) => (
  <button
    role="switch"
    aria-checked={checked}
    aria-label={label}
    onClick={() => onChange(!checked)}
    className={`relative w-10 h-6 rounded-full transition-colors shrink-0 ${checked ? 'bg-ink' : 'bg-line'}`}
  >
    <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all ${checked ? 'left-[18px]' : 'left-0.5'}`} />
  </button>
);

export const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  user,
  places,
  opportunities,
  saved,
  onUpdateVisibility,
  onOpenOnboardingEdit,
  onOpenAura,
  onExtendMood,
  onChangeMood,
  onShowPlace,
  onShowOpportunity,
  onLogout,
}) => {
  const [view, setView] = useState<'profile' | 'settings'>('profile');
  const [dialog, setDialog] = useState<null | 'preview' | 'logout'>(null);
  const [settings, setSettings] = useState<ProfileSettings>(loadProfileSettings);
  const [now, setNow] = useState(Date.now());
  const { lang, setLang, t } = useI18n();

  // Keep mood / fade timers fresh
  useEffect(() => {
    if (!isOpen) return;
    setNow(Date.now());
    const t = setInterval(() => setNow(Date.now()), 30000);
    return () => clearInterval(t);
  }, [isOpen]);

  // Always land on the profile itself when the tab is reopened
  useEffect(() => {
    if (!isOpen) {
      setView('profile');
      setDialog(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const updateSettings = (next: ProfileSettings) => {
    setSettings(next);
    try {
      localStorage.setItem('picme_settings', JSON.stringify(next));
    } catch (e) {
      // settings still apply for this session
    }
  };

  const visibilityLabel = t(VISIBILITY_OPTIONS.find((o) => o.level === user.visibility)?.label ?? 'Zone');
  const signalsLeft = user.dailySignalsLimit - user.dailySignalsUsed;
  const moodMsLeft = user.mood ? user.mood.expiresAt - now : 0;
  const moodActive = !!user.mood && moodMsLeft > 0;

  // What I've put on the map myself and is still live
  const myOpps = opportunities
    .filter((o) => o.createdByMe)
    .map((o) => ({ opp: o, msLeft: (o.createdAt ?? now) + o.expiresInDays * DAY_MS - now }))
    .filter((o) => o.msLeft > 0);
  const myAnnouncements = myOpps.filter((o) => o.opp.type !== 'activity');
  const myEvents = myOpps.filter((o) => o.opp.type === 'activity');
  const myPlaces = places.filter((p) => p.createdByMe);
  const myPlaceEvents = myPlaces.filter((p) => p.hasLiveEvent);
  const presenceCount = myAnnouncements.length + myEvents.length + myPlaces.length;

  // Bookmarked items, newest first; IDs whose item no longer exists are skipped
  const savedOpps = saved.opportunities
    .map((id) => opportunities.find((o) => o.id === id))
    .filter((o): o is DublinOpportunity => !!o);
  const savedPlaces = saved.places
    .map((id) => places.find((p) => p.id === id))
    .filter((p): p is DublinPlace => !!p);

  const distanceLine: Record<VisibilityLevel, string> = {
    exact: t('≈ 120 m away · exact spot'),
    zone: t('Within a 500 m zone in {district}', { district: user.district }),
    district: t('Somewhere in {district}', { district: user.district }),
    invisible: '',
  };

  // ───────────────────────── SETTINGS VIEW ─────────────────────────
  const settingsView = (
    <div className="flex-1 min-h-0 flex flex-col">
      <div className="px-4 py-3 border-b border-line flex items-center gap-2 shrink-0">
        <button
          onClick={() => setView('profile')}
          className="w-9 h-9 rounded-full bg-card flex items-center justify-center text-ink-strong"
          aria-label={t('Back to profile')}
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h3 className="text-base font-bold text-ink-strong">{t('Settings')}</h3>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar p-4 space-y-5">
        {/* Account */}
        <section>
          <SectionTitle>{t('Account')}</SectionTitle>
          <div className="rounded-3xl bg-card border border-line divide-y divide-line">
            <div className="px-4 py-3 flex items-center gap-3">
              <User className="w-4 h-4 text-muted" />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-ink-strong truncate">{user.name}</div>
                <div className="text-[11px] text-muted truncate">{user.handle}</div>
              </div>
            </div>
            <button onClick={onOpenOnboardingEdit} className="w-full px-4 py-3 flex items-center gap-3 text-left">
              <Pencil className="w-4 h-4 text-muted" />
              <span className="flex-1 text-sm text-ink-strong">{t('Edit profile & tags')}</span>
              <ChevronRight className="w-4 h-4 text-muted" />
            </button>
          </div>
        </section>

        {/* Language */}
        <section>
          <SectionTitle>{t('Language')}</SectionTitle>
          <div className="grid grid-cols-2 p-1 rounded-full bg-card border border-line">
            {LANGUAGES.map((l) => (
              <button
                key={l.code}
                onClick={() => setLang(l.code)}
                aria-pressed={lang === l.code}
                className={`${btnBase} py-2 flex items-center justify-center gap-1.5 ${lang === l.code ? 'bg-ink text-white' : 'text-muted hover:text-ink-strong'}`}
              >
                <Globe className="w-3.5 h-3.5" />
                {l.label}
              </button>
            ))}
          </div>
        </section>

        {/* Notifications */}
        <section>
          <SectionTitle>{t('Notifications')}</SectionTitle>
          <div className="rounded-3xl bg-card border border-line divide-y divide-line">
            {([
              ['signals', 'New signals & replies'],
              ['moodExpiring', 'Mood about to expire'],
              ['opportunitiesNearby', 'New opportunities nearby'],
            ] as const).map(([key, label]) => (
              <div key={key} className="px-4 py-3 flex items-center gap-3">
                <Bell className="w-4 h-4 text-muted" />
                <span className="flex-1 text-sm text-ink-strong">{t(label)}</span>
                <Toggle
                  label={t(label)}
                  checked={settings.notifications[key]}
                  onChange={(v) => updateSettings({ ...settings, notifications: { ...settings.notifications, [key]: v } })}
                />
              </div>
            ))}
          </div>
        </section>

        {/* Default map layers */}
        <section>
          <SectionTitle>{t('Default map layers')}</SectionTitle>
          <div className="rounded-3xl bg-card border border-line divide-y divide-line">
            {([
              ['people', 'People', 'bg-people'],
              ['places', 'Places', 'bg-place'],
              ['opportunities', 'Opportunities', 'bg-opp'],
            ] as const).map(([key, label, dot]) => (
              <div key={key} className="px-4 py-3 flex items-center gap-3">
                <Layers className="w-4 h-4 text-muted" />
                <span className={`w-2 h-2 rounded-full ${dot}`} />
                <span className="flex-1 text-sm text-ink-strong">{t(label)}</span>
                <Toggle
                  label={t(label)}
                  checked={settings.defaultLayers[key]}
                  onChange={(v) => updateSettings({ ...settings, defaultLayers: { ...settings.defaultLayers, [key]: v } })}
                />
              </div>
            ))}
          </div>
          <p className="text-[11px] text-muted mt-1.5 px-1">{t('Applied the next time you open the map.')}</p>
        </section>

        {/* Log out */}
        <section className="pt-2 pb-4 flex flex-col items-start gap-3 px-1">
          <button onClick={() => setDialog('logout')} className="text-sm font-semibold text-danger flex items-center gap-2">
            <LogOut className="w-4 h-4" />
            {t('Log out')}
          </button>
        </section>
      </div>
    </div>
  );

  // ───────────────────────── PROFILE VIEW ─────────────────────────
  const profileView = (
    <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar">
      {/* Header */}
      <div className="px-5 pt-5 pb-4 flex items-center gap-4">
        <div className="relative shrink-0">
          <img src={user.avatarUrl} alt={user.name} className="w-16 h-16 rounded-full object-cover border-2 border-people" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline gap-2 flex-wrap">
            <h3 className="text-lg font-bold text-ink-strong tracking-tight">{user.name}</h3>
            <span className="text-xs text-muted">{user.handle}</span>
          </div>
          <p className="text-xs text-muted mt-0.5">
            {t(user.identity)} · {t(user.activity)}
          </p>
          <div className="flex items-center gap-1.5 mt-2 flex-wrap">
            <button onClick={onOpenAura} className={`${btnBase} px-2.5 py-1 bg-people hover:bg-people-hover text-ink-strong flex items-center gap-1`}>
              <Award className="w-3.5 h-3.5" />
              {user.auraScore} {t('Aura')}
            </button>
            <span className={`${chipOutline} !px-2.5 !py-0.5 border-people text-ink-strong flex items-center gap-1 text-[11px]`}>
              <Radio className="w-3 h-3" />
              {t('{n} signals left', { n: signalsLeft })}
            </span>
            <span className="text-[11px] text-muted flex items-center gap-1">
              {user.visibility === 'invisible' ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
              {t('Visible: {level}', { level: visibilityLabel.toLowerCase() })}
            </span>
          </div>
        </div>
      </div>

      <div className="px-4 pb-6 space-y-5">
        {/* Right now */}
        <section>
          <SectionTitle>{t('Right now')}</SectionTitle>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-muted w-16 shrink-0">{t('Character')}</span>
              <span className={`${chipOutline} border-people text-ink-strong`}>{t(user.status)}</span>
            </div>

            {moodActive && user.mood ? (
              <div className="rounded-3xl bg-people p-3.5 space-y-3">
                <div className="flex items-center gap-2.5">
                  <span className="w-9 h-9 rounded-full bg-white flex items-center justify-center shrink-0">
                    <GraphicIcon nameOrEmoji={user.mood.emoji} size={18} className="text-ink-strong" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-ink-strong/70">{t('Mood')}</div>
                    <div className="text-sm font-semibold text-ink-strong truncate">{t(user.mood.text)}</div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-white text-[11px] font-semibold text-ink-strong shrink-0">
                    {formatTimeLeft(moodMsLeft, t)}
                  </span>
                </div>
                <div className="flex gap-2">
                  <button onClick={onExtendMood} className={`${btnBase} flex-1 py-2 bg-ink text-white`}>
                    {t('Extend 1 h')}
                  </button>
                  <button onClick={onChangeMood} className={`${btnBase} flex-1 py-2 bg-white text-ink-strong`}>
                    {t('Change')}
                  </button>
                </div>
              </div>
            ) : (
              <div className="rounded-3xl border border-line bg-card p-3.5 flex items-center justify-between gap-3">
                <span className="text-xs text-muted">{t('No active mood')}</span>
                <button onClick={onChangeMood} className={`${btnBase} px-4 py-2 bg-people text-ink-strong`}>
                  {t('Set mood')}
                </button>
              </div>
            )}
          </div>
        </section>

        {/* Visibility */}
        <section>
          <SectionTitle>{t('Visibility')}</SectionTitle>
          <div className="grid grid-cols-4 p-1 rounded-full bg-card border border-line">
            {VISIBILITY_OPTIONS.map((o) => {
              const active = user.visibility === o.level;
              return (
                <button
                  key={o.level}
                  onClick={() => onUpdateVisibility(o.level)}
                  className={`${btnBase} py-2 ${active ? 'bg-ink text-white' : 'text-muted hover:text-ink-strong'}`}
                >
                  {t(o.label)}
                </button>
              );
            })}
          </div>
        </section>

        {/* About me */}
        <section>
          <SectionTitle
            action={
              <button onClick={onOpenOnboardingEdit} className="text-[11px] font-semibold text-ink flex items-center gap-1">
                <Pencil className="w-3 h-3" /> {t('Edit')}
              </button>
            }
          >
            {t('About me')}
          </SectionTitle>
          <div className="rounded-3xl bg-card border border-line p-3.5 space-y-3">
            <div>
              <span className="text-[11px] text-muted block mb-1.5">{t('Activity')}</span>
              <div className="flex flex-wrap gap-1.5">
                {[user.identity, user.activity].map((tag) => (
                  <span key={tag} className={`${chipOutline} border-line text-ink-strong`}>
                    {t(tag)}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <span className="text-[11px] text-muted block mb-1.5">{t('Interests')}</span>
              <div className="flex flex-wrap gap-1.5">
                {user.interests.map((tag) => (
                  <span key={tag} className={`${chipOutline} border-people text-ink-strong`}>
                    {t(tag)}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Looking for / Can offer */}
        <section>
          <SectionTitle>{t('Looking for / Can offer')}</SectionTitle>
          <div className="rounded-3xl bg-card border border-line p-3.5 space-y-3">
            <div>
              <span className="text-[11px] text-muted block mb-1.5">{t('Looking for')}</span>
              <div className="flex flex-wrap gap-1.5">
                {user.lookingFor.map((tag) => (
                  <span key={tag} className={`${chipOutline} border-opp text-ink-strong`}>
                    {t(tag)}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <span className="text-[11px] text-muted block mb-1.5">{t('Can offer')}</span>
              <div className="flex flex-wrap gap-1.5">
                {user.offering.map((tag) => (
                  <span key={tag} className={`${chipFilled} bg-opp text-ink-strong`}>
                    {t(tag)}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* My presence on the map */}
        <section>
          <SectionTitle>{t('My presence on the map')}</SectionTitle>
          {presenceCount === 0 ? (
            <div className="rounded-3xl bg-card border border-line p-4 text-xs text-muted">
              {t("Nothing live yet. Anything you post with the + button shows up here while it's on the map.")}
            </div>
          ) : (
            <div className="rounded-3xl bg-card border border-line divide-y divide-line">
              {myAnnouncements.map(({ opp, msLeft }) => (
                <button key={opp.id} onClick={() => onShowOpportunity(opp)} className="w-full px-3.5 py-3 flex items-center gap-3 text-left">
                  <span className="w-9 h-9 rounded-full bg-opp flex items-center justify-center shrink-0 text-ink-strong">
                    {opp.type === 'job' ? <Briefcase className="w-4 h-4" /> : <Megaphone className="w-4 h-4" />}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-semibold text-ink-strong truncate">{opp.title}</div>
                    <div className="text-[11px] text-muted">{t('Announcement · fades in {time}', { time: formatDuration(msLeft, t) })}</div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted shrink-0" />
                </button>
              ))}
              {myEvents.map(({ opp, msLeft }) => (
                <button key={opp.id} onClick={() => onShowOpportunity(opp)} className="w-full px-3.5 py-3 flex items-center gap-3 text-left">
                  <span className="w-9 h-9 rounded-full bg-opp flex items-center justify-center shrink-0 text-ink-strong">
                    <CalendarDays className="w-4 h-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-semibold text-ink-strong truncate">{opp.title}</div>
                    <div className="text-[11px] text-muted">{t('Event · fades in {time}', { time: formatDuration(msLeft, t) })}</div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted shrink-0" />
                </button>
              ))}
              {myPlaces.map((place) => (
                <button key={place.id} onClick={() => onShowPlace(place)} className="w-full px-3.5 py-3 flex items-center gap-3 text-left">
                  <span className="w-9 h-9 rounded-full bg-place flex items-center justify-center shrink-0 text-ink-strong">
                    {myPlaceEvents.includes(place) ? <CalendarDays className="w-4 h-4" /> : <MapPin className="w-4 h-4" />}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-semibold text-ink-strong truncate">{place.name}</div>
                    <div className="text-[11px] text-muted truncate">
                      {myPlaceEvents.includes(place) ? t('Place · event {time}', { time: place.eventTime ?? t('today') }) : t('Place · {district}', { district: place.district })}
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted shrink-0" />
                </button>
              ))}
            </div>
          )}
        </section>

        {/* Saved */}
        <section>
          <SectionTitle>{t('Saved')}</SectionTitle>
          {savedOpps.length + savedPlaces.length === 0 ? (
            <div className="rounded-3xl bg-card border border-line p-4 text-xs text-muted flex items-start gap-2">
              <Bookmark className="w-4 h-4 shrink-0" />
              {t('Nothing saved yet. Tap the bookmark on a place or event to keep it here.')}
            </div>
          ) : (
            <div className="rounded-3xl bg-card border border-line divide-y divide-line">
              {savedOpps.map((opp) => (
                <button key={opp.id} onClick={() => onShowOpportunity(opp)} className="w-full px-3.5 py-3 flex items-center gap-3 text-left">
                  <span className="w-9 h-9 rounded-full bg-opp flex items-center justify-center shrink-0 text-ink-strong">
                    {opp.type === 'activity' ? <CalendarDays className="w-4 h-4" /> : opp.type === 'job' ? <Briefcase className="w-4 h-4" /> : <Megaphone className="w-4 h-4" />}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-semibold text-ink-strong truncate">{opp.title}</div>
                    <div className="text-[11px] text-muted truncate">
                      {t(opp.categoryTag)} · {opp.district}
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted shrink-0" />
                </button>
              ))}
              {savedPlaces.map((place) => (
                <button key={place.id} onClick={() => onShowPlace(place)} className="w-full px-3.5 py-3 flex items-center gap-3 text-left">
                  <span className="w-9 h-9 rounded-full bg-place flex items-center justify-center shrink-0 text-ink-strong">
                    {place.hasLiveEvent ? <CalendarDays className="w-4 h-4" /> : <MapPin className="w-4 h-4" />}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-semibold text-ink-strong truncate">{place.name}</div>
                    <div className="text-[11px] text-muted truncate">
                      {place.hasLiveEvent ? t('Place · event {time}', { time: place.eventTime ?? t('today') }) : t('Place · {district}', { district: place.district })}
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted shrink-0" />
                </button>
              ))}
            </div>
          )}
        </section>

        {/* How others see me */}
        <button onClick={() => setDialog('preview')} className={`${btnBase} w-full py-3 bg-ink text-white text-sm flex items-center justify-center gap-2`}>
          <Eye className="w-4 h-4" />
          {t('How others see me')}
        </button>

        {/* Settings */}
        <button
          onClick={() => setView('settings')}
          className="w-full rounded-3xl bg-card border border-line px-4 py-3.5 flex items-center gap-3 text-left"
        >
          <Settings className="w-4 h-4 text-muted" />
          <span className="flex-1 text-sm font-semibold text-ink-strong">{t('Settings')}</span>
          <ChevronRight className="w-4 h-4 text-muted" />
        </button>
      </div>
    </div>
  );

  // ───────────────────────── DIALOGS ─────────────────────────
  const renderDialog = () => {
    if (!dialog) return null;

    let body: React.ReactNode = null;

    if (dialog === 'preview') {
      body = (
        <>
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-bold text-ink-strong">{t('How people nearby see you')}</h4>
            <button onClick={() => setDialog(null)} className="w-8 h-8 rounded-full bg-card flex items-center justify-center text-muted" aria-label={t('Close')}>
              <X className="w-4 h-4" />
            </button>
          </div>

          {user.visibility === 'invisible' ? (
            <div className="rounded-3xl bg-card border border-line p-5 text-center space-y-2">
              <EyeOff className="w-6 h-6 text-muted mx-auto" />
              <p className="text-sm font-semibold text-ink-strong">{t("You're invisible")}</p>
              <p className="text-xs text-muted">{t('Nobody nearby sees your card or your spot on the map.')}</p>
            </div>
          ) : (
            <div className="rounded-3xl border border-line bg-white p-4 space-y-3">
              <div className="flex items-center gap-3">
                <img src={user.avatarUrl} alt={user.name} className="w-12 h-12 rounded-full object-cover border-2 border-people" />
                <div className="min-w-0">
                  <div className="text-sm font-bold text-ink-strong">
                    {user.name} <span className="font-normal text-muted text-xs">{user.handle}</span>
                  </div>
                  <div className="text-[11px] text-muted">
                    {t(user.identity)} · {t(user.activity)}
                  </div>
                  <div className="text-[11px] text-muted flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3 h-3" />
                    {distanceLine[user.visibility]}
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap gap-1.5">
                <span className={`${chipOutline} border-people text-ink-strong`}>{t(user.status)}</span>
                {moodActive && user.mood && (
                  <span className={`${chipFilled} bg-people text-ink-strong flex items-center gap-1`}>
                    <GraphicIcon nameOrEmoji={user.mood.emoji} size={12} className="text-ink-strong" />
                    {t(user.mood.text)}
                  </span>
                )}
              </div>
              <div className="flex flex-wrap gap-1.5">
                {user.interests.map((tag) => (
                  <span key={tag} className={`${chipOutline} border-people text-ink-strong`}>
                    {t(tag)}
                  </span>
                ))}
              </div>
              <div className={`${btnBase} w-full py-2.5 bg-people text-ink-strong text-center`}>{t('Send signal')}</div>
            </div>
          )}
          <p className="text-[11px] text-muted mt-3 text-center">{t('Preview only — based on your current visibility ({level}).', { level: visibilityLabel.toLowerCase() })}</p>
        </>
      );
    }

    if (dialog === 'logout') {
      body = (
        <div className="space-y-4">
          <h4 className="text-base font-bold text-ink-strong">{t('Log out of your account?')}</h4>
          <div className="flex gap-2">
            <button onClick={onLogout} className={`${btnBase} flex-1 py-2.5 bg-danger text-white text-sm`}>
              {t('Log out')}
            </button>
            <button onClick={() => setDialog(null)} className={`${btnBase} flex-1 py-2.5 bg-card border border-line text-ink-strong text-sm`}>
              {t('Cancel')}
            </button>
          </div>
          <div className="rounded-3xl bg-card border border-line p-3.5 space-y-2.5">
            <p className="text-xs text-ink-strong">{t('Just want to disappear from the map? Turn on invisible mode.')}</p>
            <button
              onClick={() => {
                onUpdateVisibility('invisible');
                setDialog(null);
              }}
              className={`${btnBase} px-4 py-2 bg-ink text-white flex items-center gap-1.5`}
            >
              <EyeOff className="w-3.5 h-3.5" />
              {t('Go invisible')}
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="absolute inset-0 z-50 flex items-end justify-center bg-ink-strong/40 fade-in" onClick={() => setDialog(null)}>
        <div className="w-full bg-white rounded-t-3xl p-5 pb-6 slide-up-in max-h-full overflow-y-auto no-scrollbar" onClick={(e) => e.stopPropagation()}>
          {body}
        </div>
      </div>
    );
  };

  return (
    <div className="absolute inset-0 z-30 bg-white flex flex-col">
      {view === 'settings' ? settingsView : profileView}
      {renderDialog()}
    </div>
  );
};
