import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useMap } from '@vis.gl/react-google-maps';
import { Briefcase, House, Zap } from 'lucide-react';
import { DublinPlace, DublinOpportunity, NearbyDublinUser, VisibilityLevel } from '../types';
import { GraphicIcon } from './GraphicIcon';
import { COLORS } from '../theme';

type LatLng = { lat: number; lng: number };

const INK = COLORS.ink;
const WHITE = COLORS.white;
const SHADOW = '0 2px 6px rgba(20,28,8,0.25)';
const LABEL_MIN_ZOOM = 16;
const CLUSTER_RADIUS_PX = 46;
const LABEL_MAX_CHARS = 14;
// People with a mutual score this high count as a signal match: shown first, pulse once
const SIGNAL_MATCH_SCORE = 90;

// ───────────────────────── HTML overlay (works without a Cloud Map ID) ─────────────────────────

const HtmlOverlay: React.FC<{ position: LatLng; zIndex?: number; children: React.ReactNode }> = ({
  position,
  zIndex = 0,
  children,
}) => {
  const map = useMap();
  const [container] = useState(() => {
    const el = document.createElement('div');
    el.style.position = 'absolute';
    return el;
  });
  const positionRef = useRef(position);
  const overlayRef = useRef<google.maps.OverlayView | null>(null);

  useEffect(() => {
    if (!map) return;
    google.maps.OverlayView.preventMapHitsAndGesturesFrom(container);

    class Overlay extends google.maps.OverlayView {
      onAdd() {
        this.getPanes()?.overlayMouseTarget.appendChild(container);
      }
      draw() {
        const point = this.getProjection()?.fromLatLngToDivPixel(new google.maps.LatLng(positionRef.current));
        if (point) {
          container.style.left = `${point.x}px`;
          container.style.top = `${point.y}px`;
        }
      }
      onRemove() {
        container.remove();
      }
    }

    const overlay = new Overlay();
    overlay.setMap(map);
    overlayRef.current = overlay;
    return () => {
      overlay.setMap(null);
      overlayRef.current = null;
    };
  }, [map, container]);

  useEffect(() => {
    positionRef.current = position;
    overlayRef.current?.draw();
  }, [position.lat, position.lng]);

  useEffect(() => {
    container.style.zIndex = String(zIndex);
  }, [container, zIndex]);

  return createPortal(children, container);
};

// ───────────────────────── Helpers ─────────────────────────

function worldPx(p: LatLng, zoom: number) {
  const scale = 256 * 2 ** zoom;
  const sin = Math.min(Math.max(Math.sin((p.lat * Math.PI) / 180), -0.9999), 0.9999);
  return {
    x: ((p.lng + 180) / 360) * scale,
    y: (0.5 - Math.log((1 + sin) / (1 - sin)) / (4 * Math.PI)) * scale,
  };
}

const truncate = (s: string) => (s.length > LABEL_MAX_CHARS ? `${s.slice(0, LABEL_MAX_CHARS).trimEnd()}…` : s);

// "€880 / month" → "€880", "€65,000 - €80,000 / yr" → "€65k", "Free / Bring water" → "Free"
export function shortPrice(raw: string): string {
  const money = raw.match(/€\s?([\d,]+(?:\.\d+)?)/);
  if (money) {
    const value = parseFloat(money[1].replace(/,/g, ''));
    return value >= 10000 ? `€${Math.round(value / 1000)}k` : `€${money[1]}`;
  }
  if (/free/i.test(raw)) return 'Free';
  return raw.split(/[\s/]+/)[0].slice(0, 8);
}

// "8:00 PM Tonight" → "20:00"
function shortTime(raw?: string): string | null {
  if (!raw) return null;
  const m = raw.match(/(\d{1,2})(?::(\d{2}))?\s*(AM|PM)?/i);
  if (!m) return raw.slice(0, 6);
  let h = parseInt(m[1], 10);
  const ampm = m[3]?.toUpperCase();
  if (ampm === 'PM' && h < 12) h += 12;
  if (ampm === 'AM' && h === 12) h = 0;
  return `${String(h).padStart(2, '0')}:${m[2] ?? '00'}`;
}

// Places have no opening hours in the data yet: treat them as open during the day
const isPlaceOpenNow = () => {
  const h = new Date().getHours();
  return h >= 8 && h < 23;
};

// Fades towards 50% saturation as something is about to expire
const moodSaturation = (minutesLeft?: number) =>
  minutesLeft === undefined || minutesLeft >= 60 ? 1 : 0.5 + 0.5 * Math.max(0, minutesLeft) / 60;
const oppSaturation = (daysLeft: number) => (daysLeft >= 3 ? 1 : daysLeft === 2 ? 0.75 : 0.5);

const OPP_ICONS = { housing: House, job: Briefcase, activity: Zap } as const;

// ───────────────────────── Markers ─────────────────────────

const Label: React.FC<{ text: string; top: number }> = ({ text, top }) => (
  <div
    className="absolute left-0 -translate-x-1/2 px-2 py-0.5 rounded-full bg-white text-[12px] font-semibold whitespace-nowrap pointer-events-none"
    style={{ top, color: INK, boxShadow: SHADOW }}
  >
    {truncate(text)}
  </div>
);

const PersonMarker: React.FC<{ user: NearbyDublinUser; selected: boolean; isMatch: boolean; onClick: () => void }> = ({
  user,
  selected,
  isMatch,
  onClick,
}) => (
  <div
    onClick={onClick}
    className="absolute left-0 top-0 cursor-pointer transition-transform duration-200"
    style={{
      transform: `translate(-50%, -50%) scale(${selected ? 1.2 : 1})`,
      filter: `saturate(${moodSaturation(user.mood?.expiresMinutes)})`,
    }}
  >
    {isMatch && <span className="absolute inset-0 rounded-full marker-pulse-once pointer-events-none" />}
    <div className="rounded-full p-[2px]" style={{ background: selected ? INK : WHITE, boxShadow: SHADOW }}>
      <div className="rounded-full p-[3px] bg-people">
        <img src={user.avatarUrl} alt={user.name} className="w-11 h-11 rounded-full object-cover block" draggable={false} />
      </div>
    </div>
    {user.mood && (
      <span className="absolute -top-0.5 -right-0.5 w-[18px] h-[18px] rounded-full bg-people border-2 border-white flex items-center justify-center">
        <GraphicIcon nameOrEmoji={user.mood.emoji} size={10} className="text-ink" />
      </span>
    )}
    {selected && (
      <span
        className="absolute -top-6 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full bg-white text-[11px] font-bold whitespace-nowrap"
        style={{ color: INK, boxShadow: SHADOW }}
      >
        {user.mutualScore}% match
      </span>
    )}
  </div>
);

const PlaceMarker: React.FC<{ place: DublinPlace; selected: boolean; onClick: () => void }> = ({ place, selected, onClick }) => {
  const ring = selected ? INK : WHITE;
  const eventTime = place.hasLiveEvent ? shortTime(place.eventTime) : null;
  return (
    <div
      onClick={onClick}
      className="absolute left-0 top-0 cursor-pointer transition-transform duration-200"
      style={{ transform: `translate(-50%, -100%) scale(${selected ? 1.2 : 1})`, transformOrigin: '50% 100%' }}
    >
      <div className="relative flex flex-col items-center">
        <div
          className="w-9 h-9 rounded-xl bg-place flex items-center justify-center relative z-[1]"
          style={{ border: `2px solid ${ring}`, boxShadow: SHADOW }}
        >
          <GraphicIcon nameOrEmoji={place.category} size={18} className="text-ink-strong" />
        </div>
        {/* Pin tail */}
        <div
          className="w-3 h-3 bg-place rotate-45 -mt-[8px]"
          style={{ borderRight: `2px solid ${ring}`, borderBottom: `2px solid ${ring}`, boxShadow: '2px 2px 4px rgba(20,28,8,0.18)' }}
        />
        {isPlaceOpenNow() && (
          <span className="absolute -top-1 -right-1 z-[2] w-3 h-3 rounded-full bg-opp border-2 border-white" />
        )}
        {eventTime && (
          <span
            className="absolute -top-3 -left-4 z-[2] px-1.5 py-[1px] rounded-full bg-white text-[10px] font-bold"
            style={{ color: INK, boxShadow: SHADOW }}
          >
            {eventTime}
          </span>
        )}
      </div>
    </div>
  );
};

const OpportunityMarker: React.FC<{ opp: DublinOpportunity; selected: boolean; onClick: () => void }> = ({
  opp,
  selected,
  onClick,
}) => {
  const Icon = OPP_ICONS[opp.type];
  return (
    <div
      onClick={onClick}
      className="absolute left-0 top-0 cursor-pointer transition-transform duration-200 flex items-center gap-1 h-7 px-2.5 rounded-full bg-opp text-[12px] font-bold whitespace-nowrap"
      style={{
        transform: `translate(-50%, -50%) scale(${selected ? 1.2 : 1})`,
        border: `2px solid ${selected ? INK : WHITE}`,
        boxShadow: SHADOW,
        color: INK,
        filter: `saturate(${oppSaturation(opp.expiresInDays)})`,
      }}
    >
      <Icon className="w-3.5 h-3.5" strokeWidth={2.25} />
      {shortPrice(opp.rateOrPrice)}
    </div>
  );
};

const countByLayer = (members: Item[]) => ({
  people: members.filter((m) => m.kind === 'person').length,
  places: members.filter((m) => m.kind === 'place').length,
  opps: members.filter((m) => m.kind === 'opp').length,
});

// Ring split into layer colours in proportion to what's inside; `mini` sits beside a pinned marker
const ClusterMarker: React.FC<{ members: Item[]; onClick: () => void; mini?: boolean }> = ({ members, onClick, mini }) => {
  const counts = countByLayer(members);
  const total = members.length;
  const a = (counts.people / total) * 100;
  const b = a + (counts.places / total) * 100;
  const size = mini ? 28 : 40 + Math.min(12, total);
  return (
    <div
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      className={`absolute cursor-pointer rounded-full ${mini ? 'p-[3px]' : 'p-[5px]'}`}
      style={{
        width: size,
        height: size,
        left: mini ? 20 : 0,
        top: mini ? 8 : 0,
        transform: mini ? undefined : 'translate(-50%, -50%)',
        border: `2px solid ${WHITE}`,
        boxShadow: SHADOW,
        background: `conic-gradient(var(--color-people) 0 ${a}%, var(--color-place) ${a}% ${b}%, var(--color-opp) ${b}% 100%)`,
      }}
    >
      <div
        className={`w-full h-full rounded-full bg-white flex items-center justify-center font-bold ${mini ? 'text-[11px]' : 'text-[13px]'}`}
        style={{ color: INK }}
      >
        {mini ? `+${total}` : total}
      </div>
    </div>
  );
};

// ───────────────────────── Layer with clustering, priority and labels ─────────────────────────

type Item =
  | { kind: 'person'; key: string; pos: LatLng; priority: number; data: NearbyDublinUser }
  | { kind: 'place'; key: string; pos: LatLng; priority: number; data: DublinPlace }
  | { kind: 'opp'; key: string; pos: LatLng; priority: number; data: DublinOpportunity };

interface MarkersLayerProps {
  people: NearbyDublinUser[];
  places: DublinPlace[];
  opportunities: DublinOpportunity[];
  selectedKey: string | null;
  onSelectUser: (u: NearbyDublinUser) => void;
  onSelectPlace: (p: DublinPlace) => void;
  onSelectOpportunity: (o: DublinOpportunity) => void;
  myLocation: LatLng;
  myVisibility: VisibilityLevel;
  isOnboarded: boolean;
}

export const MarkersLayer: React.FC<MarkersLayerProps> = ({
  people,
  places,
  opportunities,
  selectedKey,
  onSelectUser,
  onSelectPlace,
  onSelectOpportunity,
  myLocation,
  myVisibility,
  isOnboarded,
}) => {
  const map = useMap();
  const [zoom, setZoom] = useState(14);

  useEffect(() => {
    if (!map) return;
    setZoom(map.getZoom() ?? 14);
    const listener = map.addListener('zoom_changed', () => setZoom(map.getZoom() ?? 14));
    return () => listener.remove();
  }, [map]);

  // Priority: signal-matched people → places → other people → opportunities
  const items: Item[] = useMemo(
    () => [
      ...people.map((u) => ({
        kind: 'person' as const,
        key: `person-${u.id}`,
        pos: { lat: u.lat, lng: u.lng },
        priority: u.mutualScore >= SIGNAL_MATCH_SCORE ? 0 : 2,
        data: u,
      })),
      ...places.map((p) => ({ kind: 'place' as const, key: `place-${p.id}`, pos: { lat: p.lat, lng: p.lng }, priority: 1, data: p })),
      ...opportunities.map((o) => ({ kind: 'opp' as const, key: `opp-${o.id}`, pos: { lat: o.lat, lng: o.lng }, priority: 3, data: o })),
    ],
    [people, places, opportunities]
  );

  const { singles, clusters, labelled } = useMemo(() => {
    const ordered = [...items].sort((x, y) => {
      const px = x.key === selectedKey ? -1 : x.priority;
      const py = y.key === selectedKey ? -1 : y.priority;
      return px - py;
    });

    // Signal matches and the selected marker always stay visible and lead their own group;
    // everything else groups greedily around the nearest higher-priority leader
    const singles: (Item & { px: { x: number; y: number }; hidden?: Item[] })[] = [];
    const pinnedGroups: { leader: Item; px: { x: number; y: number }; members: Item[] }[] = [];
    const groups: { leader: { x: number; y: number }; members: Item[] }[] = [];
    const near = (a: { x: number; y: number }, b: { x: number; y: number }) => Math.hypot(a.x - b.x, a.y - b.y) < CLUSTER_RADIUS_PX;
    for (const item of ordered) {
      const px = worldPx(item.pos, zoom);
      if (item.priority === 0 || item.key === selectedKey) {
        pinnedGroups.push({ leader: item, px, members: [] });
        continue;
      }
      const pinned = pinnedGroups.find((g) => near(g.px, px));
      if (pinned) {
        pinned.members.push(item);
        continue;
      }
      const group = groups.find((g) => near(g.leader, px));
      if (group) group.members.push(item);
      else groups.push({ leader: px, members: [item] });
    }

    for (const g of pinnedGroups) {
      singles.push({ ...g.leader, px: g.px, hidden: g.members.length ? g.members : undefined });
    }

    const clusters: { key: string; pos: LatLng; members: Item[] }[] = [];
    for (const g of groups) {
      if (g.members.length === 1) {
        singles.push({ ...g.members[0], px: g.leader });
      } else {
        const lat = g.members.reduce((s, m) => s + m.pos.lat, 0) / g.members.length;
        const lng = g.members.reduce((s, m) => s + m.pos.lng, 0) / g.members.length;
        clusters.push({ key: g.members.map((m) => m.key).join('|'), pos: { lat, lng }, members: g.members });
      }
    }

    // Labels only when zoomed in, and only where they don't collide with a higher-priority label
    const labelled = new Set<string>();
    if (zoom >= LABEL_MIN_ZOOM) {
      const taken: { x1: number; y1: number; x2: number; y2: number }[] = [];
      singles
        .filter((s) => s.kind !== 'opp')
        .sort((x, y) => x.priority - y.priority)
        .forEach((s) => {
          const text = truncate(s.kind === 'person' ? s.data.name.split(' ')[0] : s.data.name);
          const w = text.length * 6.6 + 18;
          const top = s.px.y + (s.kind === 'person' ? 30 : 4);
          const rect = { x1: s.px.x - w / 2, y1: top, x2: s.px.x + w / 2, y2: top + 20 };
          const hit = taken.some((r) => rect.x1 < r.x2 && rect.x2 > r.x1 && rect.y1 < r.y2 && rect.y2 > r.y1);
          if (!hit) {
            taken.push(rect);
            labelled.add(s.key);
          }
        });
    }

    return { singles, clusters, labelled };
  }, [items, zoom, selectedKey]);

  const zoomIntoCluster = (members: Item[]) => {
    if (!map) return;
    const bounds = new google.maps.LatLngBounds();
    members.forEach((m) => bounds.extend(m.pos));
    const before = map.getZoom() ?? zoom;
    map.fitBounds(bounds, 80);
    google.maps.event.addListenerOnce(map, 'idle', () => {
      if ((map.getZoom() ?? before) <= before) {
        map.setZoom(before + 2);
        map.panTo(bounds.getCenter());
      }
    });
  };

  return (
    <>
      {/* Current user */}
      {isOnboarded && myVisibility !== 'invisible' && (
        <HtmlOverlay position={myLocation} zIndex={5}>
          <div
            className="absolute left-0 top-0 -translate-x-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-ink border-[3px] border-white"
            style={{ boxShadow: SHADOW }}
          />
          {zoom >= LABEL_MIN_ZOOM && <Label text="You" top={14} />}
        </HtmlOverlay>
      )}

      {clusters.map((c) => (
        <HtmlOverlay key={c.key} position={c.pos} zIndex={4}>
          <ClusterMarker members={c.members} onClick={() => zoomIntoCluster(c.members)} />
        </HtmlOverlay>
      ))}

      {singles.map((s) => {
        const selected = s.key === selectedKey;
        const z = selected ? 10 : 4 - s.priority;
        const hiddenCluster = s.hidden && (
          <ClusterMarker mini members={s.hidden} onClick={() => zoomIntoCluster([s, ...s.hidden!])} />
        );
        if (s.kind === 'person') {
          return (
            <HtmlOverlay key={s.key} position={s.pos} zIndex={z}>
              <PersonMarker user={s.data} selected={selected} isMatch={s.priority === 0} onClick={() => onSelectUser(s.data)} />
              {hiddenCluster}
              {labelled.has(s.key) && <Label text={s.data.name.split(' ')[0]} top={30} />}
            </HtmlOverlay>
          );
        }
        if (s.kind === 'place') {
          return (
            <HtmlOverlay key={s.key} position={s.pos} zIndex={z}>
              <PlaceMarker place={s.data} selected={selected} onClick={() => onSelectPlace(s.data)} />
              {hiddenCluster}
              {labelled.has(s.key) && <Label text={s.data.name} top={4} />}
            </HtmlOverlay>
          );
        }
        return (
          <HtmlOverlay key={s.key} position={s.pos} zIndex={z}>
            <OpportunityMarker opp={s.data} selected={selected} onClick={() => onSelectOpportunity(s.data)} />
            {hiddenCluster}
          </HtmlOverlay>
        );
      })}
    </>
  );
};
