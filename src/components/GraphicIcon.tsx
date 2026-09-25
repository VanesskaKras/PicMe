import React from 'react';

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

export const GraphicIcon: React.FC<GraphicIconProps> = ({
  nameOrEmoji = 'sparkle',
  size = 'md',
  className = '',
  glow = false,
}) => {
  const iconType = normalizeGraphicKey(nameOrEmoji);

  let dim = 24;
  if (typeof size === 'number') {
    dim = size;
  } else {
    switch (size) {
      case 'xs':
        dim = 12;
        break;
      case 'sm':
        dim = 16;
        break;
      case 'md':
        dim = 22;
        break;
      case 'lg':
        dim = 30;
        break;
      case 'xl':
        dim = 40;
        break;
    }
  }

  // Unique SVG IDs so multiple graphics don't collide
  const uid = React.useId().replace(/:/g, '_');

  const renderContent = () => {
    switch (iconType) {
      case 'coffee':
        return (
          <>
            <defs>
              <linearGradient id={`cg_${uid}`} x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#f59e0b" />
                <stop offset="100%" stopColor="#d97706" />
              </linearGradient>
              <linearGradient id={`cgb_${uid}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#b45309" />
                <stop offset="100%" stopColor="#78350f" />
              </linearGradient>
            </defs>
            {/* Saucer */}
            <path
              d="M4 20C4 20 6.5 21.5 12 21.5C17.5 21.5 20 20 20 20"
              stroke={`url(#cg_${uid})`}
              strokeWidth="2"
              strokeLinecap="round"
            />
            {/* Cup Body */}
            <path
              d="M5 9H17V14C17 17.5 14.5 19 11 19C7.5 19 5 17.5 5 14V9Z"
              fill={`url(#cgb_${uid})`}
              stroke={`url(#cg_${uid})`}
              strokeWidth="1.8"
              strokeLinejoin="round"
            />
            {/* Inner Coffee Surface */}
            <ellipse cx="11" cy="9.5" rx="5.5" ry="1.2" fill="#451a03" />
            {/* Handle */}
            <path
              d="M17 10.5H19C20.4 10.5 21.5 11.6 21.5 13C21.5 14.4 20.4 15.5 19 15.5H16.5"
              stroke={`url(#cg_${uid})`}
              strokeWidth="1.8"
              strokeLinecap="round"
            />
            {/* Aromatic Steam */}
            <path
              d="M8.5 6.5C8.5 5.5 9.5 5 9.5 4C9.5 3 8.5 2.5 8.5 2"
              stroke="#fbbf24"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
            <path
              d="M12 6C12 5 13 4.5 13 3.5C13 2.5 12 2 12 1.5"
              stroke="#f59e0b"
              strokeWidth="1.6"
              strokeLinecap="round"
            />
            <path
              d="M15 6.5C15 5.5 16 5 16 4C16 3 15 2.5 15 2"
              stroke="#fbbf24"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </>
        );

      case 'beer':
        return (
          <>
            <defs>
              <linearGradient id={`bg_${uid}`} x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#fbbf24" />
                <stop offset="100%" stopColor="#d97706" />
              </linearGradient>
              <linearGradient id={`bgb_${uid}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#f59e0b" />
                <stop offset="100%" stopColor="#92400e" />
              </linearGradient>
            </defs>
            {/* Glass body */}
            <path
              d="M6 7L7.2 19.2C7.3 20.2 8.2 21 9.2 21H14.8C15.8 21 16.7 20.2 16.8 19.2L18 7H6Z"
              fill={`url(#bgb_${uid})`}
              stroke={`url(#bg_${uid})`}
              strokeWidth="1.8"
              strokeLinejoin="round"
            />
            {/* Rich Foamy Head */}
            <path
              d="M5.5 7C5.5 5.2 7 4.5 8.5 5C9.2 3.8 10.8 3.5 12 4.2C13.2 3.5 14.8 3.8 15.5 5C17 4.5 18.5 5.2 18.5 7C18.5 7.6 18 8 17.5 8H6.5C6 8 5.5 7.6 5.5 7Z"
              fill="#fffbeb"
              stroke="#fef08a"
              strokeWidth="1.2"
            />
            {/* Glass Handle */}
            <path
              d="M17.5 9.5H19.5C21 9.5 22 10.7 22 12.2V15.5C22 17 21 18.2 19.5 18.2H16.8"
              stroke={`url(#bg_${uid})`}
              strokeWidth="1.8"
              strokeLinecap="round"
            />
            {/* Bubbles */}
            <circle cx="10" cy="14" r="1.1" fill="#fef08a" fillOpacity="0.85" />
            <circle cx="13" cy="16.5" r="1.3" fill="#fef08a" fillOpacity="0.85" />
            <circle cx="11.5" cy="11.5" r="0.9" fill="#fef08a" fillOpacity="0.85" />
          </>
        );

      case 'laptop':
        return (
          <>
            <defs>
              <linearGradient id={`lg_${uid}`} x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#38bdf8" />
                <stop offset="100%" stopColor="#0284c7" />
              </linearGradient>
              <linearGradient id={`ls_${uid}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#082f49" />
                <stop offset="100%" stopColor="#0c1830" />
              </linearGradient>
            </defs>
            {/* Screen */}
            <rect
              x="3.5"
              y="4.5"
              width="17"
              height="11.5"
              rx="2"
              fill={`url(#ls_${uid})`}
              stroke={`url(#lg_${uid})`}
              strokeWidth="1.8"
            />
            {/* Glowing screen content lines */}
            <line x1="7" y1="8" x2="13.5" y2="8" stroke="#38bdf8" strokeWidth="1.6" strokeLinecap="round" />
            <line x1="7" y1="11.5" x2="11" y2="11.5" stroke="#a855f7" strokeWidth="1.6" strokeLinecap="round" />
            <circle cx="16" cy="10" r="1.5" fill="#00f0ff" />
            {/* Keyboard base */}
            <path
              d="M2 19L3.5 16H20.5L22 19C22.2 19.6 21.7 20 21 20H3C2.3 20 1.8 19.6 2 19Z"
              fill="#0f172a"
              stroke={`url(#lg_${uid})`}
              strokeWidth="1.8"
              strokeLinejoin="round"
            />
            <path d="M10 17.5H14" stroke="#64748b" strokeWidth="1.4" strokeLinecap="round" />
          </>
        );

      case 'walk':
        return (
          <>
            <defs>
              <linearGradient id={`wg_${uid}`} x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#34d399" />
                <stop offset="100%" stopColor="#059669" />
              </linearGradient>
            </defs>
            {/* Head */}
            <circle cx="14" cy="4" r="2.2" fill="#34d399" stroke="#10b981" strokeWidth="1.2" />
            {/* Dynamic Walker */}
            <path
              d="M12.5 8.5L10 13L13 15.5L11 21"
              stroke={`url(#wg_${uid})`}
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M10 13L6.5 17.5"
              stroke="#10b981"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <path
              d="M12 7.8L15.5 10.5L18.5 9"
              stroke={`url(#wg_${uid})`}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M11 9L7.5 10.5"
              stroke="#059669"
              strokeWidth="2"
              strokeLinecap="round"
            />
            {/* Path ground line */}
            <path
              d="M4.5 21.5H19.5"
              stroke="#047857"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeDasharray="2 3"
            />
          </>
        );

      case 'advice':
        return (
          <>
            <defs>
              <linearGradient id={`pg_${uid}`} x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#ff2a85" />
                <stop offset="100%" stopColor="#f43f5e" />
              </linearGradient>
            </defs>
            {/* Beacon wave arcs */}
            <path
              d="M12 2C6.5 2 2 6.5 2 12"
              stroke="#ff2a85"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeDasharray="1.5 3"
              opacity="0.6"
            />
            <path
              d="M22 12C22 6.5 17.5 2 12 2"
              stroke="#00f0ff"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeDasharray="1.5 3"
              opacity="0.6"
            />
            {/* Dublin Pin */}
            <path
              d="M12 3C8.4 3 5.5 5.8 5.5 9.4C5.5 14.5 11.2 21 11.5 21.4C11.8 21.8 12.2 21.8 12.5 21.4C12.8 21 18.5 14.5 18.5 9.4C18.5 5.8 15.6 3 12 3Z"
              fill={`url(#pg_${uid})`}
              stroke="#fda4af"
              strokeWidth="1.6"
            />
            {/* Center Beacon */}
            <circle cx="12" cy="9.4" r="2.8" fill="#ffffff" stroke="#9f1239" strokeWidth="1.2" />
          </>
        );

      case 'music':
        return (
          <>
            <defs>
              <linearGradient id={`mg_${uid}`} x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#e879f9" />
                <stop offset="100%" stopColor="#c026d3" />
              </linearGradient>
            </defs>
            {/* Music Beams & Stems */}
            <path
              d="M8.5 13V5.5L19 3.5V11"
              stroke={`url(#mg_${uid})`}
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M8.5 7.8L19 5.8"
              stroke={`url(#mg_${uid})`}
              strokeWidth="2.2"
            />
            {/* Note Heads */}
            <ellipse
              cx="6.5"
              cy="15"
              rx="3"
              ry="2.4"
              transform="rotate(-15 6.5 15)"
              fill={`url(#mg_${uid})`}
              stroke="#f0abfc"
              strokeWidth="1.4"
            />
            <ellipse
              cx="16.5"
              cy="13"
              rx="3"
              ry="2.4"
              transform="rotate(-15 16.5 13)"
              fill={`url(#mg_${uid})`}
              stroke="#f0abfc"
              strokeWidth="1.4"
            />
            {/* Sound vibe ripples */}
            <path
              d="M21 7.5C22.2 9 22.2 10.5 21 12"
              stroke="#f472b6"
              strokeWidth="1.6"
              strokeLinecap="round"
            />
          </>
        );

      case 'book':
        return (
          <>
            <defs>
              <linearGradient id={`bkg_${uid}`} x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#38bdf8" />
                <stop offset="100%" stopColor="#0284c7" />
              </linearGradient>
              <linearGradient id={`bkp_${uid}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#0f172a" />
                <stop offset="100%" stopColor="#1e293b" />
              </linearGradient>
            </defs>
            {/* Open Book */}
            <path
              d="M12 6.5C10 5.2 6.5 5.2 3 6V19.5C6.5 18.8 10 18.8 12 20.2C14 18.8 17.5 18.8 21 19.5V6C17.5 5.2 14 5.2 12 6.5Z"
              fill={`url(#bkp_${uid})`}
              stroke={`url(#bkg_${uid})`}
              strokeWidth="1.8"
              strokeLinejoin="round"
            />
            {/* Spine */}
            <path d="M12 6.5V20.2" stroke={`url(#bkg_${uid})`} strokeWidth="1.8" />
            {/* Pages Lines */}
            <path d="M5.5 9.5C7.5 9.2 9.5 9.4 10.5 9.8" stroke="#38bdf8" strokeWidth="1.3" strokeLinecap="round" />
            <path d="M5.5 13C7.5 12.7 9.5 12.9 10.5 13.3" stroke="#38bdf8" strokeWidth="1.3" strokeLinecap="round" />
            <path d="M13.5 9.8C14.5 9.4 16.5 9.2 18.5 9.5" stroke="#38bdf8" strokeWidth="1.3" strokeLinecap="round" />
            <path d="M13.5 13.3C14.5 12.9 16.5 12.7 18.5 13" stroke="#38bdf8" strokeWidth="1.3" strokeLinecap="round" />
          </>
        );

      case 'housing':
        return (
          <>
            <defs>
              <linearGradient id={`hg_${uid}`} x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#34d399" />
                <stop offset="100%" stopColor="#059669" />
              </linearGradient>
            </defs>
            {/* House Outline */}
            <path
              d="M3 10.5L12 3L21 10.5V20C21 20.6 20.6 21 20 21H4C3.4 21 3 20.6 3 20V10.5Z"
              fill="#062e24"
              stroke={`url(#hg_${uid})`}
              strokeWidth="1.8"
              strokeLinejoin="round"
            />
            {/* Glowing Window */}
            <rect x="9.5" y="12" width="5" height="5" rx="1" fill="#fef08a" stroke="#10b981" strokeWidth="1.2" />
            <path d="M9.5 14.5H14.5" stroke="#047857" strokeWidth="1.1" />
            <path d="M12 12V17" stroke="#047857" strokeWidth="1.1" />
          </>
        );

      case 'job':
        return (
          <>
            <defs>
              <linearGradient id={`jg_${uid}`} x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#38bdf8" />
                <stop offset="100%" stopColor="#0284c7" />
              </linearGradient>
            </defs>
            {/* Briefcase */}
            <rect
              x="3"
              y="7"
              width="18"
              height="13"
              rx="2.5"
              fill="#082f49"
              stroke={`url(#jg_${uid})`}
              strokeWidth="1.8"
            />
            {/* Handle */}
            <path
              d="M8 7V5C8 3.9 8.9 3 10 3H14C15.1 3 16 3.9 16 5V7"
              stroke={`url(#jg_${uid})`}
              strokeWidth="1.8"
              strokeLinecap="round"
            />
            {/* Clasp & divider */}
            <line x1="3" y1="12" x2="21" y2="12" stroke="#0369a1" strokeWidth="1.5" />
            <rect x="10.5" y="10.5" width="3" height="3" rx="0.5" fill="#fef08a" stroke="#38bdf8" strokeWidth="1.2" />
          </>
        );

      case 'activity':
        return (
          <>
            <defs>
              <linearGradient id={`ag_${uid}`} x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#fde047" />
                <stop offset="100%" stopColor="#eab308" />
              </linearGradient>
            </defs>
            <path
              d="M13 2L4 13.5H11.5L10 22L20 9.5H12.5L13 2Z"
              fill={`url(#ag_${uid})`}
              stroke="#fef08a"
              strokeWidth="1.6"
              strokeLinejoin="round"
            />
          </>
        );

      case 'park':
        return (
          <>
            <defs>
              <linearGradient id={`trg_${uid}`} x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#34d399" />
                <stop offset="100%" stopColor="#059669" />
              </linearGradient>
            </defs>
            {/* Tree canopy */}
            <path
              d="M12 3C8.5 3 6 5.8 6 9C6 11.2 7.2 13.1 9 14.2V19C9 19.6 9.4 20 10 20H14C14.6 20 15 19.6 15 19V14.2C16.8 13.1 18 11.2 18 9C18 5.8 15.5 3 12 3Z"
              fill="#064e3b"
              stroke={`url(#trg_${uid})`}
              strokeWidth="1.8"
              strokeLinejoin="round"
            />
            <path d="M12 9V20" stroke="#10b981" strokeWidth="1.5" />
            <path d="M10 12L12 10L14 12" stroke="#34d399" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </>
        );

      case 'sparkle':
      default:
        return (
          <>
            <defs>
              <linearGradient id={`sg_${uid}`} x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#fde047" />
                <stop offset="100%" stopColor="#f59e0b" />
              </linearGradient>
            </defs>
            <path
              d="M12 2C12 7.5 7.5 12 2 12C7.5 12 12 16.5 12 22C12 16.5 16.5 12 22 12C16.5 12 12 7.5 12 2Z"
              fill={`url(#sg_${uid})`}
              stroke="#fef08a"
              strokeWidth="1.2"
            />
            <path
              d="M19 3C19 4.8 17.8 6 16 6C17.8 6 19 7.2 19 9C19 7.2 20.2 6 22 6C20.2 6 19 4.8 19 3Z"
              fill="#fde047"
            />
            <circle cx="5" cy="18" r="1.2" fill="#fef08a" />
          </>
        );
    }
  };

  return (
    <span
      className={`inline-flex items-center justify-center shrink-0 ${glow ? 'drop-shadow-[0_0_8px_rgba(255,255,255,0.4)]' : ''} ${className}`}
      style={{ width: dim, height: dim }}
    >
      <svg
        viewBox="0 0 24 24"
        width={dim}
        height={dim}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
      >
        {renderContent()}
      </svg>
    </span>
  );
};

/**
 * Returns raw SVG string for Leaflet / HTML injection
 */
export function getGraphicSvgString(nameOrEmoji?: string, size = 16): string {
  const iconType = normalizeGraphicKey(nameOrEmoji);
  const uid = Math.random().toString(36).substring(2, 7);

  let paths = '';
  switch (iconType) {
    case 'coffee':
      paths = `
        <defs>
          <linearGradient id="cgl_${uid}" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#f59e0b"/><stop offset="100%" stop-color="#d97706"/></linearGradient>
          <linearGradient id="cgbl_${uid}" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#b45309"/><stop offset="100%" stop-color="#78350f"/></linearGradient>
        </defs>
        <path d="M4 20C4 20 6.5 21.5 12 21.5C17.5 21.5 20 20 20 20" stroke="url(#cgl_${uid})" stroke-width="2" stroke-linecap="round"/>
        <path d="M5 9H17V14C17 17.5 14.5 19 11 19C7.5 19 5 17.5 5 14V9Z" fill="url(#cgbl_${uid})" stroke="url(#cgl_${uid})" stroke-width="1.8" stroke-linejoin="round"/>
        <ellipse cx="11" cy="9.5" rx="5.5" ry="1.2" fill="#451a03"/>
        <path d="M17 10.5H19C20.4 10.5 21.5 11.6 21.5 13C21.5 14.4 20.4 15.5 19 15.5H16.5" stroke="url(#cgl_${uid})" stroke-width="1.8" stroke-linecap="round"/>
        <path d="M8.5 6.5C8.5 5.5 9.5 5 9.5 4C9.5 3 8.5 2.5 8.5 2" stroke="#fbbf24" stroke-width="1.5" stroke-linecap="round"/>
        <path d="M12 6C12 5 13 4.5 13 3.5C13 2.5 12 2 12 1.5" stroke="#f59e0b" stroke-width="1.6" stroke-linecap="round"/>
        <path d="M15 6.5C15 5.5 16 5 16 4C16 3 15 2.5 15 2" stroke="#fbbf24" stroke-width="1.5" stroke-linecap="round"/>
      `;
      break;

    case 'beer':
      paths = `
        <defs>
          <linearGradient id="bgl_${uid}" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#fbbf24"/><stop offset="100%" stop-color="#d97706"/></linearGradient>
          <linearGradient id="bgbl_${uid}" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#f59e0b"/><stop offset="100%" stop-color="#92400e"/></linearGradient>
        </defs>
        <path d="M6 7L7.2 19.2C7.3 20.2 8.2 21 9.2 21H14.8C15.8 21 16.7 20.2 16.8 19.2L18 7H6Z" fill="url(#bgbl_${uid})" stroke="url(#bgl_${uid})" stroke-width="1.8" stroke-linejoin="round"/>
        <path d="M5.5 7C5.5 5.2 7 4.5 8.5 5C9.2 3.8 10.8 3.5 12 4.2C13.2 3.5 14.8 3.8 15.5 5C17 4.5 18.5 5.2 18.5 7C18.5 7.6 18 8 17.5 8H6.5C6 8 5.5 7.6 5.5 7Z" fill="#fffbeb" stroke="#fef08a" stroke-width="1.2"/>
        <path d="M17.5 9.5H19.5C21 9.5 22 10.7 22 12.2V15.5C22 17 21 18.2 19.5 18.2H16.8" stroke="url(#bgl_${uid})" stroke-width="1.8" stroke-linecap="round"/>
        <circle cx="10" cy="14" r="1.1" fill="#fef08a" fill-opacity="0.85"/>
        <circle cx="13" cy="16.5" r="1.3" fill="#fef08a" fill-opacity="0.85"/>
      `;
      break;

    case 'laptop':
      paths = `
        <defs>
          <linearGradient id="lgl_${uid}" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#38bdf8"/><stop offset="100%" stop-color="#0284c7"/></linearGradient>
          <linearGradient id="lsl_${uid}" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#082f49"/><stop offset="100%" stop-color="#0c1830"/></linearGradient>
        </defs>
        <rect x="3.5" y="4.5" width="17" height="11.5" rx="2" fill="url(#lsl_${uid})" stroke="url(#lgl_${uid})" stroke-width="1.8"/>
        <line x1="7" y1="8" x2="13.5" y2="8" stroke="#38bdf8" stroke-width="1.6" stroke-linecap="round"/>
        <line x1="7" y1="11.5" x2="11" y2="11.5" stroke="#a855f7" stroke-width="1.6" stroke-linecap="round"/>
        <circle cx="16" cy="10" r="1.5" fill="#00f0ff"/>
        <path d="M2 19L3.5 16H20.5L22 19C22.2 19.6 21.7 20 21 20H3C2.3 20 1.8 19.6 2 19Z" fill="#0f172a" stroke="url(#lgl_${uid})" stroke-width="1.8" stroke-linejoin="round"/>
      `;
      break;

    case 'walk':
      paths = `
        <defs>
          <linearGradient id="wgl_${uid}" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#34d399"/><stop offset="100%" stop-color="#059669"/></linearGradient>
        </defs>
        <circle cx="14" cy="4" r="2.2" fill="#34d399" stroke="#10b981" stroke-width="1.2"/>
        <path d="M12.5 8.5L10 13L13 15.5L11 21" stroke="url(#wgl_${uid})" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M10 13L6.5 17.5" stroke="#10b981" stroke-width="2" stroke-linecap="round"/>
        <path d="M12 7.8L15.5 10.5L18.5 9" stroke="url(#wgl_${uid})" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M4.5 21.5H19.5" stroke="#047857" stroke-width="1.6" stroke-linecap="round" stroke-dasharray="2 3"/>
      `;
      break;

    case 'advice':
      paths = `
        <defs>
          <linearGradient id="pgl_${uid}" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#ff2a85"/><stop offset="100%" stop-color="#f43f5e"/></linearGradient>
        </defs>
        <path d="M12 3C8.4 3 5.5 5.8 5.5 9.4C5.5 14.5 11.2 21 11.5 21.4C11.8 21.8 12.2 21.8 12.5 21.4C12.8 21 18.5 14.5 18.5 9.4C18.5 5.8 15.6 3 12 3Z" fill="url(#pgl_${uid})" stroke="#fda4af" stroke-width="1.6"/>
        <circle cx="12" cy="9.4" r="2.8" fill="#ffffff" stroke="#9f1239" stroke-width="1.2"/>
      `;
      break;

    case 'music':
      paths = `
        <defs>
          <linearGradient id="mgl_${uid}" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#e879f9"/><stop offset="100%" stop-color="#c026d3"/></linearGradient>
        </defs>
        <path d="M8.5 13V5.5L19 3.5V11" stroke="url(#mgl_${uid})" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M8.5 7.8L19 5.8" stroke="url(#mgl_${uid})" stroke-width="2.2"/>
        <ellipse cx="6.5" cy="15" rx="3" ry="2.4" transform="rotate(-15 6.5 15)" fill="url(#mgl_${uid})" stroke="#f0abfc" stroke-width="1.4"/>
        <ellipse cx="16.5" cy="13" rx="3" ry="2.4" transform="rotate(-15 16.5 13)" fill="url(#mgl_${uid})" stroke="#f0abfc" stroke-width="1.4"/>
      `;
      break;

    case 'book':
      paths = `
        <defs>
          <linearGradient id="bkgl_${uid}" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#38bdf8"/><stop offset="100%" stop-color="#0284c7"/></linearGradient>
          <linearGradient id="bkpl_${uid}" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#0f172a"/><stop offset="100%" stop-color="#1e293b"/></linearGradient>
        </defs>
        <path d="M12 6.5C10 5.2 6.5 5.2 3 6V19.5C6.5 18.8 10 18.8 12 20.2C14 18.8 17.5 18.8 21 19.5V6C17.5 5.2 14 5.2 12 6.5Z" fill="url(#bkpl_${uid})" stroke="url(#bkgl_${uid})" stroke-width="1.8" stroke-linejoin="round"/>
        <path d="M12 6.5V20.2" stroke="url(#bkgl_${uid})" stroke-width="1.8"/>
        <path d="M5.5 9.5C7.5 9.2 9.5 9.4 10.5 9.8" stroke="#38bdf8" stroke-width="1.3" stroke-linecap="round"/>
        <path d="M13.5 9.8C14.5 9.4 16.5 9.2 18.5 9.5" stroke="#38bdf8" stroke-width="1.3" stroke-linecap="round"/>
      `;
      break;

    case 'housing':
      paths = `
        <defs>
          <linearGradient id="hgl_${uid}" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#34d399"/><stop offset="100%" stop-color="#059669"/></linearGradient>
        </defs>
        <path d="M3 10.5L12 3L21 10.5V20C21 20.6 20.6 21 20 21H4C3.4 21 3 20.6 3 20V10.5Z" fill="#062e24" stroke="url(#hgl_${uid})" stroke-width="1.8" stroke-linejoin="round"/>
        <rect x="9.5" y="12" width="5" height="5" rx="1" fill="#fef08a" stroke="#10b981" stroke-width="1.2"/>
      `;
      break;

    case 'job':
      paths = `
        <defs>
          <linearGradient id="jgl_${uid}" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#38bdf8"/><stop offset="100%" stop-color="#0284c7"/></linearGradient>
        </defs>
        <rect x="3" y="7" width="18" height="13" rx="2.5" fill="#082f49" stroke="url(#jgl_${uid})" stroke-width="1.8"/>
        <path d="M8 7V5C8 3.9 8.9 3 10 3H14C15.1 3 16 3.9 16 5V7" stroke="url(#jgl_${uid})" stroke-width="1.8" stroke-linecap="round"/>
        <line x1="3" y1="12" x2="21" y2="12" stroke="#0369a1" stroke-width="1.5"/>
        <rect x="10.5" y="10.5" width="3" height="3" rx="0.5" fill="#fef08a" stroke="#38bdf8" stroke-width="1.2"/>
      `;
      break;

    case 'activity':
      paths = `
        <defs>
          <linearGradient id="agl_${uid}" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#fde047"/><stop offset="100%" stop-color="#eab308"/></linearGradient>
        </defs>
        <path d="M13 2L4 13.5H11.5L10 22L20 9.5H12.5L13 2Z" fill="url(#agl_${uid})" stroke="#fef08a" stroke-width="1.6" stroke-linejoin="round"/>
      `;
      break;

    case 'park':
      paths = `
        <defs>
          <linearGradient id="trgl_${uid}" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#34d399"/><stop offset="100%" stop-color="#059669"/></linearGradient>
        </defs>
        <path d="M12 3C8.5 3 6 5.8 6 9C6 11.2 7.2 13.1 9 14.2V19C9 19.6 9.4 20 10 20H14C14.6 20 15 19.6 15 19V14.2C16.8 13.1 18 11.2 18 9C18 5.8 15.5 3 12 3Z" fill="#064e3b" stroke="url(#trgl_${uid})" stroke-width="1.8" stroke-linejoin="round"/>
        <path d="M12 9V20" stroke="#10b981" stroke-width="1.5"/>
      `;
      break;

    case 'sparkle':
    default:
      paths = `
        <defs>
          <linearGradient id="sgl_${uid}" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#fde047"/><stop offset="100%" stop-color="#f59e0b"/></linearGradient>
        </defs>
        <path d="M12 2C12 7.5 7.5 12 2 12C7.5 12 12 16.5 12 22C12 16.5 16.5 12 22 12C16.5 12 12 7.5 12 2Z" fill="url(#sgl_${uid})" stroke="#fef08a" stroke-width="1.2"/>
        <path d="M19 3C19 4.8 17.8 6 16 6C17.8 6 19 7.2 19 9C19 7.2 20.2 6 22 6C20.2 6 19 4.8 19 3Z" fill="#fde047"/>
      `;
      break;
  }

  return `<svg viewBox="0 0 24 24" width="${size}" height="${size}" fill="none" xmlns="http://www.w3.org/2000/svg" style="display:inline-block;vertical-align:middle;">${paths}</svg>`;
}

/**
 * Convenience Badge component that frames the graphic nicely in a sleek circular/rounded badge
 */
export const GraphicBadge: React.FC<{
  nameOrEmoji?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  variant?: 'pink' | 'cyan' | 'amber' | 'emerald' | 'slate';
  className?: string;
}> = ({ nameOrEmoji, size = 'sm', variant = 'slate', className = '' }) => {
  const iconSize = size === 'xs' ? 12 : size === 'sm' ? 16 : size === 'md' ? 22 : 28;
  const boxDim = size === 'xs' ? 'w-5 h-5' : size === 'sm' ? 'w-7 h-7' : size === 'md' ? 'w-9 h-9' : 'w-12 h-12';

  let borderStyle = 'border-slate-800 bg-slate-950/80 shadow';
  if (variant === 'pink') borderStyle = 'border-pink-500/50 bg-[#160d22] shadow-[0_0_10px_rgba(255,42,133,0.25)]';
  if (variant === 'cyan') borderStyle = 'border-cyan-500/50 bg-[#0a162d] shadow-[0_0_10px_rgba(0,240,255,0.25)]';
  if (variant === 'emerald') borderStyle = 'border-emerald-500/50 bg-[#071c18] shadow-[0_0_10px_rgba(16,185,129,0.25)]';
  if (variant === 'amber') borderStyle = 'border-amber-500/50 bg-[#1f1707] shadow-[0_0_10px_rgba(245,158,11,0.25)]';

  return (
    <div
      className={`relative inline-flex items-center justify-center rounded-xl border shrink-0 ${boxDim} ${borderStyle} ${className}`}
    >
      <GraphicIcon nameOrEmoji={nameOrEmoji} size={iconSize} glow={false} />
    </div>
  );
};
