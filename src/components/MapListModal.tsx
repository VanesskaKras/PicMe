import React, { useState } from 'react';
import { Search, Clock, MapPin, ChevronRight } from 'lucide-react';
import { DublinOpportunity, DublinPlace, NearbyDublinUser } from '../types';
import { GraphicIcon } from './GraphicIcon';
import { useI18n } from '../i18n';
import {
  PeopleFilter,
  PlacesFilter,
  OppsFilter,
  PEOPLE_FILTER_OPTIONS,
  PLACES_FILTER_OPTIONS,
  OPPS_FILTER_OPTIONS,
} from './mapFilters';

type ListTab = 'all' | 'people' | 'places' | 'opportunities';

type ListItem =
  | { kind: 'person'; id: string; distanceKm: number; data: NearbyDublinUser }
  | { kind: 'place'; id: string; distanceKm: number; data: DublinPlace }
  | { kind: 'opportunity'; id: string; distanceKm: number; data: DublinOpportunity };

interface MapListModalProps {
  isOpen: boolean;
  onClose: () => void;
  // Already filtered by the map's layers & filters, so the list mirrors what's on the map
  people: NearbyDublinUser[];
  places: DublinPlace[];
  opportunities: DublinOpportunity[];
  myLocation: { lat: number; lng: number };
  // Sub-category filters are the map's own filters, so changing them here updates the map too
  peopleFilter: PeopleFilter;
  placesFilter: PlacesFilter;
  oppsFilter: OppsFilter;
  onPeopleFilterChange: (f: PeopleFilter) => void;
  onPlacesFilterChange: (f: PlacesFilter) => void;
  onOppsFilterChange: (f: OppsFilter) => void;
  onSelectUser: (user: NearbyDublinUser) => void;
  onSelectPlace: (place: DublinPlace) => void;
  onSelectOpportunity: (opp: DublinOpportunity) => void;
}

function distanceKm(a: { lat: number; lng: number }, b: { lat: number; lng: number }): number {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((a.lat * Math.PI) / 180) * Math.cos((b.lat * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

export const MapListModal: React.FC<MapListModalProps> = ({
  isOpen,
  onClose,
  people,
  places,
  opportunities,
  myLocation,
  peopleFilter,
  placesFilter,
  oppsFilter,
  onPeopleFilterChange,
  onPlacesFilterChange,
  onOppsFilterChange,
  onSelectUser,
  onSelectPlace,
  onSelectOpportunity,
}) => {
  const { t } = useI18n();
  const [activeTab, setActiveTab] = useState<ListTab>('all');
  const [searchQuery, setSearchQuery] = useState('');

  if (!isOpen) return null;

  const q = searchQuery.trim().toLowerCase();
  const matches = (...fields: string[]) =>
    !q || fields.some((f) => f.toLowerCase().includes(q) || t(f).toLowerCase().includes(q));

  const items: ListItem[] = [
    ...(activeTab === 'all' || activeTab === 'people'
      ? people
          .filter((u) => matches(u.name, u.handle, u.district, u.status, ...u.interests, u.mood?.text ?? ''))
          .map((u) => ({ kind: 'person' as const, id: `u-${u.id}`, distanceKm: distanceKm(myLocation, u), data: u }))
      : []),
    ...(activeTab === 'all' || activeTab === 'places'
      ? places
          .filter((p) => matches(p.name, p.district, p.category, p.liveContext, ...p.tags))
          .map((p) => ({ kind: 'place' as const, id: `p-${p.id}`, distanceKm: distanceKm(myLocation, p), data: p }))
      : []),
    ...(activeTab === 'all' || activeTab === 'opportunities'
      ? opportunities
          .filter((o) => matches(o.title, o.district, o.categoryTag, o.description))
          .map((o) => ({ kind: 'opportunity' as const, id: `o-${o.id}`, distanceKm: distanceKm(myLocation, o), data: o }))
      : []),
  ].sort((a, b) => a.distanceKm - b.distanceKm);

  const formatDistance = (km: number) =>
    km < 1 ? t('{n} m', { n: Math.round(km * 1000 / 10) * 10 }) : t('{n} km', { n: km.toFixed(1) });

  const tabs: { id: ListTab; label: string; count: number; active: string }[] = [
    { id: 'all', label: 'All', count: people.length + places.length + opportunities.length, active: 'bg-ink text-white' },
    { id: 'people', label: 'People', count: people.length, active: 'bg-people text-ink-strong' },
    { id: 'places', label: 'Places', count: places.length, active: 'bg-place text-ink-strong' },
    { id: 'opportunities', label: 'Opportunities', count: opportunities.length, active: 'bg-opp text-ink-strong' },
  ];

  const subFilters = {
    all: null,
    people: { options: PEOPLE_FILTER_OPTIONS, value: peopleFilter, set: onPeopleFilterChange as (v: string) => void, active: 'bg-people border-people' },
    places: { options: PLACES_FILTER_OPTIONS, value: placesFilter, set: onPlacesFilterChange as (v: string) => void, active: 'bg-place border-place' },
    opportunities: { options: OPPS_FILTER_OPTIONS, value: oppsFilter, set: onOppsFilterChange as (v: string) => void, active: 'bg-opp border-opp' },
  }[activeTab];
  const anyFilterActive = peopleFilter !== 'all' || placesFilter !== 'all' || oppsFilter !== 'all';

  return (
    <div className="absolute inset-0 z-30 bg-white flex flex-col">
      <div className="relative w-full flex-1 min-h-0 bg-white overflow-hidden flex flex-col">
        {/* Search & Tabs */}
        <div className="p-4 border-b border-line bg-card/60 space-y-3">
          <div className="relative">
            <Search className="w-4 h-4 text-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('Search people, places, opportunities...')}
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-card/90 border border-line text-xs text-ink-strong placeholder-subtle focus:outline-none focus:border-ink"
            />
          </div>

          <div className="flex items-center gap-1 p-1 bg-card rounded-xl border border-line">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 py-1.5 rounded-lg text-[11px] font-semibold transition-all ${
                  activeTab === tab.id ? `${tab.active} font-bold shadow-sm` : 'text-muted hover:text-ink-strong'
                }`}
              >
                {t(tab.label)} <span className="opacity-70">{tab.count}</span>
              </button>
            ))}
          </div>

          {/* Sub-categories of the selected layer (shared with the map filters) */}
          {subFilters && (
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
              {subFilters.options.map(([value, text]) => (
                <button
                  key={value}
                  onClick={() => subFilters.set(value)}
                  className={`shrink-0 px-3 py-1.5 rounded-xl text-[11px] border transition-all ${
                    subFilters.value === value
                      ? `${subFilters.active} text-ink-strong font-bold`
                      : 'bg-card border-line text-muted hover:text-ink-strong font-medium'
                  }`}
                >
                  {t(text)}
                </button>
              ))}
            </div>
          )}

          {!subFilters && anyFilterActive && (
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-muted">{t('Map filters are applied')}</span>
              <button
                onClick={() => {
                  onPeopleFilterChange('all');
                  onPlacesFilterChange('all');
                  onOppsFilterChange('all');
                }}
                className="text-ink hover:underline font-semibold"
              >
                {t('Reset all filters')}
              </button>
            </div>
          )}
        </div>

        {/* List Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
          {items.length > 0 ? (
            items.map((item) => {
              const distance = (
                <span className="flex items-center gap-1 text-muted">
                  <MapPin className="w-3.5 h-3.5" />
                  {formatDistance(item.distanceKm)} · {item.data.district}
                </span>
              );

              if (item.kind === 'person') {
                const u = item.data;
                return (
                  <button
                    key={item.id}
                    onClick={() => onSelectUser(u)}
                    className="w-full text-left p-3 rounded-2xl bg-card border border-line hover:border-people cursor-pointer transition-all flex items-center gap-3 group"
                  >
                    <img src={u.avatarUrl} alt="" className="w-11 h-11 rounded-full object-cover ring-2 ring-people shrink-0" />
                    <div className="flex-1 min-w-0 space-y-0.5">
                      <div className="flex items-center justify-between gap-2">
                        <h4 className="text-sm font-bold text-ink-strong truncate">{u.name}</h4>
                        <span className="shrink-0 text-[10px] font-mono font-bold text-people-strong px-1.5 py-0.5 rounded-md bg-people-soft">
                          {u.mutualScore}%
                        </span>
                      </div>
                      <p className="text-xs text-muted truncate">
                        {u.mood ? `${u.mood.emoji} ${t(u.mood.text)}` : t(u.status)}
                      </p>
                      <div className="text-[11px]">{distance}</div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-people-strong shrink-0" />
                  </button>
                );
              }

              if (item.kind === 'place') {
                const p = item.data;
                return (
                  <button
                    key={item.id}
                    onClick={() => onSelectPlace(p)}
                    className="w-full text-left p-3 rounded-2xl bg-card border border-line hover:border-place cursor-pointer transition-all flex items-center gap-3 group"
                  >
                    <span className="w-11 h-11 rounded-xl bg-place-soft flex items-center justify-center shrink-0">
                      <GraphicIcon nameOrEmoji={p.category} size="sm" className="text-place-strong" />
                    </span>
                    <div className="flex-1 min-w-0 space-y-0.5">
                      <h4 className="text-sm font-bold text-ink-strong truncate">{p.name}</h4>
                      <p className="text-xs text-muted truncate">{t(p.liveContext)}</p>
                      <div className="text-[11px]">{distance}</div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-place-strong shrink-0" />
                  </button>
                );
              }

              const o = item.data;
              return (
                <button
                  key={item.id}
                  onClick={() => onSelectOpportunity(o)}
                  className="w-full text-left p-3 rounded-2xl bg-card border border-line hover:border-opp cursor-pointer transition-all flex items-center gap-3 group"
                >
                  <span className="w-11 h-11 rounded-xl bg-opp-soft flex items-center justify-center shrink-0">
                    <GraphicIcon nameOrEmoji={o.type} size="sm" className="text-opp-strong" />
                  </span>
                  <div className="flex-1 min-w-0 space-y-0.5">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="text-sm font-bold text-ink-strong truncate">{o.title}</h4>
                      <span className="shrink-0 font-mono font-bold text-[10px] text-opp-strong px-1.5 py-0.5 rounded-md bg-opp-soft">
                        {o.rateOrPrice}
                      </span>
                    </div>
                    <p className="text-xs text-muted truncate">{t(o.categoryTag)}</p>
                    <div className="text-[11px] flex items-center justify-between gap-2">
                      {distance}
                      <span className="flex items-center gap-1 text-warning font-mono text-[10px] shrink-0">
                        <Clock className="w-3 h-3" />
                        {t('{n}d left', { n: o.expiresInDays })}
                      </span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-opp-strong shrink-0" />
                </button>
              );
            })
          ) : (
            <div className="py-12 text-center text-subtle space-y-1">
              <p className="text-sm font-semibold">{t('Nothing here yet')}</p>
              <p className="text-xs">{t('Try another tab, clear the search or change map filters')}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
