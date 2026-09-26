import React from 'react';
import {
  X,
  MapPin,
  Clock,
  Sparkles,
  CheckCircle,
  Share2,
  Bookmark,
  Calendar,
  Building,
  Briefcase,
  Home,
  Navigation,
  ExternalLink,
  ShieldCheck
} from 'lucide-react';
import { DublinPlace, DublinOpportunity } from '../types';
import { GraphicIcon } from './GraphicIcon';
import { useI18n } from '../i18n';

interface ItemDetailDrawerProps {
  place: DublinPlace | null;
  opportunity: DublinOpportunity | null;
  onClose: () => void;
  isSaved?: boolean;
  onBookmark?: () => void;
  onAction?: (msg: string) => void;
}

export const ItemDetailDrawer: React.FC<ItemDetailDrawerProps> = ({
  place,
  opportunity,
  onClose,
  isSaved = false,
  onBookmark,
  onAction,
}) => {
  const { t } = useI18n();
  if (!place && !opportunity) return null;

  return (
    <div className="absolute inset-x-0 bottom-0 z-30 flex justify-center pointer-events-none">
      <div className="w-full max-h-[85%] overflow-y-auto no-scrollbar bg-white border-t border-line rounded-t-3xl shadow-[0_-8px_30px_rgba(31,42,16,0.18)] pointer-events-auto slide-up-in">
        {/* DRAG HANDLE */}
        <div className="pt-3 pb-1 flex justify-center">
          <div className="w-10 h-1 bg-line rounded-full" />
        </div>

        {/* PLACE DETAIL */}
        {place && (
          <div className="p-5 pt-2 space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-place-soft border border-place/40 text-place-strong flex items-center justify-center shadow-sm">
                  <GraphicIcon nameOrEmoji={place.category} size="md" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-ink-strong tracking-tight">{place.name}</h3>
                  <p className="text-xs text-muted flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3.5 h-3.5 text-place-strong" />
                    <span>{place.district}</span>
                    <span className="text-subtle">·</span>
                    <span>{place.address}</span>
                  </p>
                </div>
              </div>

              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-card border border-line flex items-center justify-center text-muted hover:text-ink-strong"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Live Context Banner */}
            <div className="p-3.5 rounded-2xl bg-card border border-place/30 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-place-strong flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-place-strong" />
                  {t('Live Urban Pulse')}
                </span>
                {place.isQuietHour && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-place-soft text-place-strong border border-place/40">
                    {t('Quiet Focus Hour')}
                  </span>
                )}
                {place.hasLiveEvent && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-people-soft text-people-strong border border-people/40 animate-pulse">
                    {t('Live Event')} {place.eventTime}
                  </span>
                )}
              </div>
              <p className="text-xs text-muted leading-relaxed">{place.liveContext}</p>
            </div>

            {/* Place Tags */}
            <div className="flex flex-wrap gap-1.5">
              {place.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-2.5 py-1 rounded-lg text-xs font-medium bg-card text-muted border border-line"
                >
                  {t(tag)}
                </span>
              ))}
              <span className="px-2.5 py-1 rounded-lg text-xs font-mono font-semibold text-success bg-success-soft border border-success/30 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-success" />
                {t('{n} Aura Trust', { n: place.auraScore })}
              </span>
            </div>

            {/* Actions */}
            <div className="pt-2 flex items-center gap-2">
              <button
                onClick={() => onAction?.(t('Viewing walking route to {name}', { name: place.name }))}
                className="flex-1 py-2.5 rounded-xl bg-place text-ink-strong font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-place/20 hover:opacity-95"
              >
                <Navigation className="w-3.5 h-3.5" />
                {t('Navigate')}
              </button>
              <button
                onClick={onBookmark}
                aria-pressed={isSaved}
                className={`px-3.5 py-2.5 rounded-xl border flex items-center justify-center ${isSaved ? 'bg-ink border-ink text-white' : 'bg-card border-line text-muted hover:text-ink-strong'}`}
                title={isSaved ? t('Remove from saved') : t('Bookmark Place')}
              >
                <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
              </button>
            </div>
          </div>
        )}

        {/* OPPORTUNITY DETAIL */}
        {opportunity && (
          <div className="p-5 pt-2 space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-opp-soft border border-opp/40 text-opp-strong flex items-center justify-center shadow-sm">
                  <GraphicIcon nameOrEmoji={opportunity.type} size="md" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-opp-strong font-bold">
                      {t(opportunity.categoryTag)}
                    </span>
                    <span className="text-[10px] text-subtle">·</span>
                    <span className="text-[10px] text-warning font-mono">
                      {t('Expires in {n}d', { n: opportunity.expiresInDays })}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-ink-strong tracking-tight leading-snug">
                    {opportunity.title}
                  </h3>
                </div>
              </div>

              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-card border border-line flex items-center justify-center text-muted hover:text-ink-strong"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Price & Location Banner */}
            <div className="p-3 rounded-2xl bg-card border border-opp/30 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-muted block">{t('Rate / Price')}</span>
                <span className="text-base font-bold font-mono text-opp-strong">
                  {opportunity.rateOrPrice}
                </span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-muted block">{t('Location')}</span>
                <span className="text-xs font-semibold text-ink-strong">
                  {opportunity.district}
                </span>
              </div>
            </div>

            {/* Description */}
            <p className="text-xs text-muted leading-relaxed">
              {opportunity.description}
            </p>

            {/* Organizer & Trust */}
            <div className="p-2.5 rounded-xl bg-card/60 border border-line flex items-center justify-between text-xs">
              <span className="text-muted">{t('Listed by')} <strong className="text-ink-strong">{opportunity.organizer}</strong></span>
              {opportunity.verifiedByAura && (
                <span className="flex items-center gap-1 text-[11px] font-medium text-success">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  {t('Aura Verified')}
                </span>
              )}
            </div>

            {/* Actions */}
            <div className="pt-2 flex items-center gap-2">
              <button
                onClick={() => onAction?.(t('Signal sent for {title}', { title: opportunity.title }))}
                className="flex-1 py-2.5 rounded-xl bg-opp text-ink-strong font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-opp/20 hover:opacity-95"
              >
                <Sparkles className="w-3.5 h-3.5" />
                {opportunity.type === 'housing' ? t('Contact Resident / Landlord') : opportunity.type === 'job' ? t('Apply via Network') : t('Join Activity Circle')}
              </button>
              <button
                onClick={onBookmark}
                aria-pressed={isSaved}
                className={`px-3.5 py-2.5 rounded-xl border flex items-center justify-center ${isSaved ? 'bg-ink border-ink text-white' : 'bg-card border-line text-muted hover:text-ink-strong'}`}
                title={isSaved ? t('Remove from saved') : t('Save Opportunity')}
              >
                <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
