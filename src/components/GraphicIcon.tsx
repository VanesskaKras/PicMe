import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import {
  Beer,
  BookOpen,
  Briefcase,
  Coffee,
  Footprints,
  House,
  Laptop,
  LucideIcon,
  MapPin,
  Music,
  Sparkles,
  Trees,
  Zap,
} from 'lucide-react';

export type GraphicIconName =
  | 'coffee'
  | 'beer'
  | 'laptop'
  | 'walk'
  | 'advice'
  | 'music'
  | 'book'
  | 'sparkle'
  | 'housing'
  | 'job'
  | 'activity'
  | 'park';

/**
 * Normalizes any unicode emoji or key string to a known GraphicIconName
 */
export function normalizeGraphicKey(keyOrEmoji?: string): GraphicIconName {
  if (!keyOrEmoji) return 'sparkle';
  const val = keyOrEmoji.trim();

  // Direct emoji matches
  if (val.includes('☕')) return 'coffee';
  if (val.includes('🍺') || val.includes('🍻')) return 'beer';
  if (val.includes('💻') || val.includes('🖥️')) return 'laptop';
  if (val.includes('🚶') || val.includes('🏃') || val.includes('👣')) return 'walk';
  if (val.includes('📍') || val.includes('🗺️') || val.includes('🧭')) return 'advice';
  if (val.includes('🎶') || val.includes('🎵') || val.includes('🎧')) return 'music';
  if (val.includes('📖') || val.includes('📚')) return 'book';
  if (val.includes('✨') || val.includes('⭐') || val.includes('🌟')) return 'sparkle';
  if (val.includes('🏡') || val.includes('🏠')) return 'housing';
  if (val.includes('💼')) return 'job';
  if (val.includes('⚡')) return 'activity';
  if (val.includes('🛶') || val.includes('🌳') || val.includes('🌲') || val.includes('🌿')) return 'park';

  // String keyword matches
  const lower = val.toLowerCase();
  if (lower.includes('coffee') || lower.includes('cafe')) return 'coffee';
  if (lower.includes('pint') || lower.includes('beer') || lower.includes('pub')) return 'beer';
  if (lower.includes('work') || lower.includes('laptop') || lower.includes('code') || lower.includes('coworking')) return 'laptop';
  if (lower.includes('walk') || lower.includes('stroll') || lower.includes('canal')) return 'walk';
  if (lower.includes('advice') || lower.includes('pin') || lower.includes('guide')) return 'advice';
  if (lower.includes('music') || lower.includes('tunes') || lower.includes('live')) return 'music';
  if (lower.includes('book') || lower.includes('read') || lower.includes('culture') || lower.includes('quiet')) return 'book';
  if (lower.includes('housing') || lower.includes('house') || lower.includes('home')) return 'housing';
  if (lower.includes('job') || lower.includes('career')) return 'job';
  if (lower.includes('activity') || lower.includes('collab') || lower.includes('event')) return 'activity';
  if (lower.includes('park') || lower.includes('canoe') || lower.includes('nature')) return 'park';

  return 'sparkle';
}

interface GraphicIconProps {
  nameOrEmoji?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | number;
  className?: string;
  glow?: boolean;
}

const OUTLINE_ICONS: Record<GraphicIconName, LucideIcon> = {
  coffee: Coffee,
  beer: Beer,
  laptop: Laptop,
  walk: Footprints,
  advice: MapPin,
  music: Music,
  book: BookOpen,
  sparkle: Sparkles,
  housing: House,
  job: Briefcase,
  activity: Zap,
  park: Trees,
};

/**
 * Outline (stroke-only) icon. Colour is inherited from the surrounding layer context
 * (e.g. text-people-strong for moods, text-place-strong for place categories); pass a text-* class to set it.
 */
export const GraphicIcon: React.FC<GraphicIconProps> = ({
  nameOrEmoji = 'sparkle',
  size = 'md',
  className = '',
}) => {
  const iconType = normalizeGraphicKey(nameOrEmoji);
  const Icon = OUTLINE_ICONS[iconType];

  let dim = 24;
  if (typeof size === 'number') {
    dim = size;
  } else {
    dim = { xs: 12, sm: 16, md: 22, lg: 30, xl: 40 }[size];
  }

  return (
    <span className={`inline-flex items-center justify-center shrink-0 ${className}`} style={{ width: dim, height: dim }}>
      <Icon width={dim} height={dim} strokeWidth={1.75} />
    </span>
  );
};

/**
 * Returns raw SVG string for Leaflet / HTML injection
 */
export function getGraphicSvgString(nameOrEmoji?: string, size = 16): string {
  const Icon = OUTLINE_ICONS[normalizeGraphicKey(nameOrEmoji)];
  // Same outline icon as <GraphicIcon>; stroke is currentColor so the marker's text colour decides it
  return renderToStaticMarkup(
    <Icon width={size} height={size} strokeWidth={2} style={{ display: 'inline-block', verticalAlign: 'middle' }} />
  );
}

/**
 * Icon framed in a rounded badge, tinted by layer (people / place / opp) or neutral.
 */
export const GraphicBadge: React.FC<{
  nameOrEmoji?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  variant?: 'people' | 'place' | 'opp' | 'neutral';
  className?: string;
}> = ({ nameOrEmoji, size = 'sm', variant = 'neutral', className = '' }) => {
  const iconSize = size === 'xs' ? 12 : size === 'sm' ? 16 : size === 'md' ? 22 : 28;
  const boxDim = size === 'xs' ? 'w-5 h-5' : size === 'sm' ? 'w-7 h-7' : size === 'md' ? 'w-9 h-9' : 'w-12 h-12';

  const variantStyle = {
    people: 'border-people/40 bg-people-soft text-people-strong',
    place: 'border-place/30 bg-place-soft text-place-strong',
    opp: 'border-opp/40 bg-opp-soft text-opp-strong',
    neutral: 'border-line bg-card text-ink',
  }[variant];

  return (
    <div
      className={`relative inline-flex items-center justify-center rounded-xl border shrink-0 ${boxDim} ${variantStyle} ${className}`}
    >
      <GraphicIcon nameOrEmoji={nameOrEmoji} size={iconSize} />
    </div>
  );
};
