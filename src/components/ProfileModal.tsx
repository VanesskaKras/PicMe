import React, { useEffect, useState } from 'react';
import {
  Award,
  Bell,
  Briefcase,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Eye,
  EyeOff,
  Layers,
  LogOut,
  MapPin,
  Megaphone,
  Pencil,
  Radio,
  Settings,
  Trash2,
  User,
  UserX,
  X,
} from 'lucide-react';
import { UserProfile, VisibilityLevel, DublinPlace, DublinOpportunity } from '../types';
import { GraphicIcon } from './GraphicIcon';

export interface BlockedPerson {
  id: string;
  name: string;
  avatar: string;
}

export interface ProfileSettings {
  notifications: { signals: boolean; moodExpiring: boolean; opportunitiesNearby: boolean };
  defaultLayers: { people: boolean; places: boolean; opportunities: boolean };
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
  blockedPeople: BlockedPerson[];
  onUpdateVisibility: (level: VisibilityLevel) => void;
  onOpenOnboardingEdit: () => void;
  onOpenAura: () => void;
  onExtendMood: () => void;
  onChangeMood: () => void;
  onShowPlace: (place: DublinPlace) => void;
  onShowOpportunity: (opp: DublinOpportunity) => void;
  onUnblock: (id: string) => void;
  onLogout: () => void;
  onDeleteAccount: () => void;
}

const VISIBILITY_OPTIONS: { level: VisibilityLevel; label: string }[] = [
  { level: 'exact', label: 'Point' },
  { level: 'zone', label: 'Zone' },
  { level: 'district', label: 'District' },
  { level: 'invisible', label: 'Invisible' },
];

const DAY_MS = 24 * 60 * 60 * 1000;

function formatTimeLeft(ms: number): string {
  if (ms <= 0) return 'expired';
  const mins = Math.ceil(ms / 60000);
  if (mins < 60) return `${mins} min left`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} h ${mins % 60 ? `${mins % 60} min ` : ''}left`;
  return `${Math.ceil(ms / DAY_MS)} d left`;
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
  blockedPeople,
  onUpdateVisibility,
  onOpenOnboardingEdit,
  onOpenAura,
  onExtendMood,
  onChangeMood,
  onShowPlace,
  onShowOpportunity,
  onUnblock,
  onLogout,
  onDeleteAccount,
}) => {
  const [view, setView] = useState<'profile' | 'settings'>('profile');
  const [dialog, setDialog] = useState<null | 'preview' | 'logout' | 'delete'>(null);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [settings, setSettings] = useState<ProfileSettings>(loadProfileSettings);
  const [now, setNow] = useState(Date.now());

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

  const visibilityLabel = VISIBILITY_OPTIONS.find((o) => o.level === user.visibility)?.label ?? 'Zone';
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

  const distanceLine: Record<VisibilityLevel, string> = {
    exact: `≈ 120 m away · exact spot`,
    zone: `Within a 500 m zone in ${user.district}`,
    district: `Somewhere in ${user.district}`,
    invisible: '',
  };

  // ───────────────────────── SETTINGS VIEW ─────────────────────────
  const settingsView = (
    <div className="flex-1 min-h-0 flex flex-col">
      <div className="px-4 py-3 border-b border-line flex items-center gap-2 shrink-0">
        <button
          onClick={() => setView('profile')}
          className="w-9 h-9 rounded-full bg-card flex items-center justify-center text-ink-strong"
          aria-label="Back to profile"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h3 className="text-base font-bold text-ink-strong">Settings</h3>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar p-4 space-y-5">
        {/* Account */}
        <section>
          <SectionTitle>Account</SectionTitle>
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
              <span className="flex-1 text-sm text-ink-strong">Edit profile & tags</span>
              <ChevronRight className="w-4 h-4 text-muted" />
            </button>
          </div>
        </section>

        {/* Notifications */}
        <section>
          <SectionTitle>Notifications</SectionTitle>
          <div className="rounded-3xl bg-card border border-line divide-y divide-line">
            {([
              ['signals', 'New signals & replies'],
              ['moodExpiring', 'Mood about to expire'],
              ['opportunitiesNearby', 'New opportunities nearby'],
            ] as const).map(([key, label]) => (
              <div key={key} className="px-4 py-3 flex items-center gap-3">
                <Bell className="w-4 h-4 text-muted" />
                <span className="flex-1 text-sm text-ink-strong">{label}</span>
                <Toggle
                  label={label}
                  checked={settings.notifications[key]}
                  onChange={(v) => updateSettings({ ...settings, notifications: { ...settings.notifications, [key]: v } })}
                />
              </div>
            ))}
          </div>
        </section>

        {/* Default map layers */}
        <section>
          <SectionTitle>Default map layers</SectionTitle>
          <div className="rounded-3xl bg-card border border-line divide-y divide-line">
            {([
              ['people', 'People', 'bg-people'],
              ['places', 'Places', 'bg-place'],
              ['opportunities', 'Opportunities', 'bg-opp'],
            ] as const).map(([key, label, dot]) => (
              <div key={key} className="px-4 py-3 flex items-center gap-3">
                <Layers className="w-4 h-4 text-muted" />
                <span className={`w-2 h-2 rounded-full ${dot}`} />
                <span className="flex-1 text-sm text-ink-strong">{label}</span>
                <Toggle
                  label={label}
                  checked={settings.defaultLayers[key]}
                  onChange={(v) => updateSettings({ ...settings, defaultLayers: { ...settings.defaultLayers, [key]: v } })}
                />
              </div>
            ))}
          </div>
          <p className="text-[11px] text-muted mt-1.5 px-1">Applied the next time you open the map.</p>
        </section>

        {/* Blocked people */}
        <section>
          <SectionTitle>Blocked people</SectionTitle>
          <div className="rounded-3xl bg-card border border-line divide-y divide-line">
            {blockedPeople.length === 0 ? (
              <div className="px-4 py-4 flex items-center gap-3 text-sm text-muted">
                <UserX className="w-4 h-4" />
                Nobody blocked
              </div>
            ) : (
              blockedPeople.map((p) => (
                <div key={p.id} className="px-4 py-3 flex items-center gap-3">
                  <img src={p.avatar} alt={p.name} className="w-8 h-8 rounded-full object-cover" />
                  <span className="flex-1 text-sm text-ink-strong truncate">{p.name}</span>
                  <button onClick={() => onUnblock(p.id)} className={`${btnBase} px-3 py-1.5 bg-ink text-white`}>
                    Unblock
                  </button>
                </div>
              ))
            )}
          </div>
        </section>

        {/* Log out / delete */}
        <section className="pt-2 pb-4 flex flex-col items-start gap-3 px-1">
          <button onClick={() => setDialog('logout')} className="text-sm font-semibold text-danger flex items-center gap-2">
            <LogOut className="w-4 h-4" />
            Log out
          </button>
          <button
            onClick={() => {
              setDeleteConfirmText('');
              setDialog('delete');
            }}
            className="text-sm font-semibold text-danger flex items-center gap-2"
          >
            <Trash2 className="w-4 h-4" />
            Delete account
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
            {user.identity} · {user.activity}
          </p>
          <div className="flex items-center gap-1.5 mt-2 flex-wrap">
            <button onClick={onOpenAura} className={`${btnBase} px-2.5 py-1 bg-people hover:bg-people-hover text-ink-strong flex items-center gap-1`}>
              <Award className="w-3.5 h-3.5" />
              {user.auraScore} Aura
            </button>
            <span className={`${chipOutline} !px-2.5 !py-0.5 border-people text-ink-strong flex items-center gap-1 text-[11px]`}>
              <Radio className="w-3 h-3" />
              {signalsLeft} signals left
            </span>
            <span className="text-[11px] text-muted flex items-center gap-1">
              {user.visibility === 'invisible' ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
              Visible: {visibilityLabel.toLowerCase()}
            </span>
          </div>
        </div>
      </div>

      <div className="px-4 pb-6 space-y-5">
        {/* Right now */}
        <section>
          <SectionTitle>Right now</SectionTitle>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-muted w-16 shrink-0">Character</span>
              <span className={`${chipOutline} border-people text-ink-strong`}>{user.status}</span>
            </div>

            {moodActive && user.mood ? (
              <div className="rounded-3xl bg-people p-3.5 space-y-3">
                <div className="flex items-center gap-2.5">
                  <span className="w-9 h-9 rounded-full bg-white flex items-center justify-center shrink-0">
                    <GraphicIcon nameOrEmoji={user.mood.emoji} size={18} className="text-ink-strong" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-ink-strong/70">Mood</div>
                    <div className="text-sm font-semibold text-ink-strong truncate">{user.mood.text}</div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-white text-[11px] font-semibold text-ink-strong shrink-0">
                    {formatTimeLeft(moodMsLeft)}
                  </span>
                </div>
                <div className="flex gap-2">
                  <button onClick={onExtendMood} className={`${btnBase} flex-1 py-2 bg-ink text-white`}>
                    Extend 1 h
                  </button>
                  <button onClick={onChangeMood} className={`${btnBase} flex-1 py-2 bg-white text-ink-strong`}>
                    Change
                  </button>
                </div>
              </div>
            ) : (
              <div className="rounded-3xl border border-line bg-card p-3.5 flex items-center justify-between gap-3">
                <span className="text-xs text-muted">No active mood</span>
                <button onClick={onChangeMood} className={`${btnBase} px-4 py-2 bg-people text-ink-strong`}>
                  Set mood
                </button>
              </div>
            )}
          </div>
        </section>

        {/* Visibility */}
        <section>
          <SectionTitle>Visibility</SectionTitle>
          <div className="grid grid-cols-4 p-1 rounded-full bg-card border border-line">
            {VISIBILITY_OPTIONS.map((o) => {
              const active = user.visibility === o.level;
              return (
                <button
                  key={o.level}
                  onClick={() => onUpdateVisibility(o.level)}
                  className={`${btnBase} py-2 ${active ? 'bg-ink text-white' : 'text-muted hover:text-ink-strong'}`}
                >
                  {o.label}
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
                <Pencil className="w-3 h-3" /> Edit
              </button>
            }
          >
            About me
          </SectionTitle>
          <div className="rounded-3xl bg-card border border-line p-3.5 space-y-3">
            <div>
              <span className="text-[11px] text-muted block mb-1.5">Activity</span>
              <div className="flex flex-wrap gap-1.5">
                {[user.identity, user.activity].map((t) => (
                  <span key={t} className={`${chipOutline} border-line text-ink-strong`}>
                    {t}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <span className="text-[11px] text-muted block mb-1.5">Interests</span>
              <div className="flex flex-wrap gap-1.5">
                {user.interests.map((t) => (
                  <span key={t} className={`${chipOutline} border-people text-ink-strong`}>
                    {t}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Looking for / Can offer */}
        <section>
          <SectionTitle>Looking for / Can offer</SectionTitle>
          <div className="rounded-3xl bg-card border border-line p-3.5 space-y-3">
            <div>
              <span className="text-[11px] text-muted block mb-1.5">Looking for</span>
              <div className="flex flex-wrap gap-1.5">
                {user.lookingFor.map((t) => (
                  <span key={t} className={`${chipOutline} border-opp text-ink-strong`}>
                    {t}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <span className="text-[11px] text-muted block mb-1.5">Can offer</span>
              <div className="flex flex-wrap gap-1.5">
                {user.offering.map((t) => (
                  <span key={t} className={`${chipFilled} bg-opp text-ink-strong`}>
                    {t}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* My presence on the map */}
        <section>
          <SectionTitle>My presence on the map</SectionTitle>
          {presenceCount === 0 ? (
            <div className="rounded-3xl bg-card border border-line p-4 text-xs text-muted">
              Nothing live yet. Anything you post with the + button shows up here while it's on the map.
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
                    <div className="text-[11px] text-muted">Announcement · fades in {formatTimeLeft(msLeft).replace(' left', '')}</div>
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
                    <div className="text-[11px] text-muted">Event · fades in {formatTimeLeft(msLeft).replace(' left', '')}</div>
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
                      {myPlaceEvents.includes(place) ? `Place · event ${place.eventTime ?? 'today'}` : `Place · ${place.district}`}
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
          How others see me
        </button>

        {/* Settings */}
        <button
          onClick={() => setView('settings')}
          className="w-full rounded-3xl bg-card border border-line px-4 py-3.5 flex items-center gap-3 text-left"
        >
          <Settings className="w-4 h-4 text-muted" />
          <span className="flex-1 text-sm font-semibold text-ink-strong">Settings</span>
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
            <h4 className="text-sm font-bold text-ink-strong">How people nearby see you</h4>
            <button onClick={() => setDialog(null)} className="w-8 h-8 rounded-full bg-card flex items-center justify-center text-muted" aria-label="Close">
              <X className="w-4 h-4" />
            </button>
          </div>

          {user.visibility === 'invisible' ? (
            <div className="rounded-3xl bg-card border border-line p-5 text-center space-y-2">
              <EyeOff className="w-6 h-6 text-muted mx-auto" />
              <p className="text-sm font-semibold text-ink-strong">You're invisible</p>
              <p className="text-xs text-muted">Nobody nearby sees your card or your spot on the map.</p>
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
                    {user.identity} · {user.activity}
                  </div>
                  <div className="text-[11px] text-muted flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3 h-3" />
                    {distanceLine[user.visibility]}
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap gap-1.5">
                <span className={`${chipOutline} border-people text-ink-strong`}>{user.status}</span>
                {moodActive && user.mood && (
                  <span className={`${chipFilled} bg-people text-ink-strong flex items-center gap-1`}>
                    <GraphicIcon nameOrEmoji={user.mood.emoji} size={12} className="text-ink-strong" />
                    {user.mood.text}
                  </span>
                )}
              </div>
              <div className="flex flex-wrap gap-1.5">
                {user.interests.map((t) => (
                  <span key={t} className={`${chipOutline} border-people text-ink-strong`}>
                    {t}
                  </span>
                ))}
              </div>
              <div className={`${btnBase} w-full py-2.5 bg-people text-ink-strong text-center`}>Send signal</div>
            </div>
          )}
          <p className="text-[11px] text-muted mt-3 text-center">Preview only — based on your current visibility ({visibilityLabel.toLowerCase()}).</p>
        </>
      );
    }

    if (dialog === 'logout') {
      body = (
        <div className="space-y-4">
          <h4 className="text-base font-bold text-ink-strong">Log out of your account?</h4>
          <div className="flex gap-2">
            <button onClick={onLogout} className={`${btnBase} flex-1 py-2.5 bg-danger text-white text-sm`}>
              Log out
            </button>
            <button onClick={() => setDialog(null)} className={`${btnBase} flex-1 py-2.5 bg-card border border-line text-ink-strong text-sm`}>
              Cancel
            </button>
          </div>
          <div className="rounded-3xl bg-card border border-line p-3.5 space-y-2.5">
            <p className="text-xs text-ink-strong">Just want to disappear from the map? Turn on invisible mode.</p>
            <button
              onClick={() => {
                onUpdateVisibility('invisible');
                setDialog(null);
              }}
              className={`${btnBase} px-4 py-2 bg-ink text-white flex items-center gap-1.5`}
            >
              <EyeOff className="w-3.5 h-3.5" />
              Go invisible
            </button>
          </div>
        </div>
      );
    }

    if (dialog === 'delete') {
      const canDelete = deleteConfirmText.trim().toUpperCase() === 'DELETE';
      body = (
        <div className="space-y-3.5">
          <h4 className="text-base font-bold text-danger">Delete your account for good?</h4>
          <p className="text-xs text-ink-strong">
            Your profile, Aura, signals, and everything you've added to the map will be permanently removed. This can't be undone.
          </p>
          <label className="block">
            <span className="text-[11px] text-muted">Type DELETE to confirm</span>
            <input
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
              className="mt-1 w-full px-3.5 py-2.5 rounded-2xl bg-card border border-line text-sm text-ink-strong outline-none focus:border-danger"
              placeholder="DELETE"
            />
          </label>
          <div className="flex gap-2">
            <button
              onClick={onDeleteAccount}
              disabled={!canDelete}
              className={`${btnBase} flex-1 py-2.5 text-sm ${canDelete ? 'bg-danger text-white' : 'bg-line text-muted cursor-not-allowed'}`}
            >
              Delete account
            </button>
            <button onClick={() => setDialog(null)} className={`${btnBase} flex-1 py-2.5 bg-card border border-line text-ink-strong text-sm`}>
              Cancel
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
