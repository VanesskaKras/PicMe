import React, { useState } from 'react';
import {
  Briefcase,
  Home,
  Zap,
  X,
  Sparkles,
  ShieldCheck,
  Check
} from 'lucide-react';
import { DublinOpportunity } from '../types';

interface AddOpportunityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddOpportunity: (newOpp: DublinOpportunity) => void;
  userName?: string;
  userDistrict?: string;
}

const TYPES: { id: DublinOpportunity['type']; label: string; icon: any; desc: string; color: string }[] = [
  { id: 'housing', label: 'Housing / Sublet', icon: Home, desc: 'Flatshare, spare room, canal sublet', color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30' },
  { id: 'job', label: 'Job / Project', icon: Briefcase, desc: 'Tech gig, co-founder, freelance contract', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' },
  { id: 'activity', label: 'Activity & Hangout', icon: Zap, desc: 'Photography walk, sports run, pub session', color: 'text-amber-400 bg-amber-500/10 border-amber-500/30' },
];

const DUBLIN_DISTRICTS = [
  'Portobello, Dublin 8',
  'Grand Canal Dock, D2',
  'Docklands / IFSC, D1',
  'Grafton Quarter, D2',
  'Temple Bar South, D2',
  'Camden St, D2',
  'Ranelagh, D6',
  'Smithfield, D7',
  'St. Stephen’s Green, D2',
  'The Liberties, D8'
];

export const AddOpportunityModal: React.FC<AddOpportunityModalProps> = ({
  isOpen,
  onClose,
  onAddOpportunity,
  userName = 'Alex Brennan',
  userDistrict = 'Portobello, Dublin 8'
}) => {
  const [type, setType] = useState<DublinOpportunity['type']>('housing');
  const [title, setTitle] = useState('');
  const [categoryTag, setCategoryTag] = useState('Flatshare / Rental');
  const [rateOrPrice, setRateOrPrice] = useState('€850 / month');
  const [district, setDistrict] = useState(userDistrict);
  const [description, setDescription] = useState('');
  const [expiresInDays, setExpiresInDays] = useState(5);
  const [tagsInput, setTagsInput] = useState('');

  if (!isOpen) return null;

  const handleTypeSelect = (selectedType: DublinOpportunity['type']) => {
    setType(selectedType);
    if (selectedType === 'housing') {
      setCategoryTag('Flatshare / Rental');
      setRateOrPrice('€850 / month');
    } else if (selectedType === 'job') {
      setCategoryTag('Co-Founder / Contract');
      setRateOrPrice('€40k - €60k / Competitive');
    } else {
      setCategoryTag('Social & Community');
      setRateOrPrice('Free / Bring Good Vibes');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;

    const baseLat = 53.3330;
    const baseLng = -6.2655;
    const offsetLat = (Math.random() - 0.5) * 0.015;
    const offsetLng = (Math.random() - 0.5) * 0.02;

    const relevantFields = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    if (relevantFields.length === 0) {
      if (type === 'housing') relevantFields.push('Newcomer', 'Local', 'Specialist');
      else if (type === 'job') relevantFields.push('IT & Tech', 'Design & Creative', 'Freelancer');
      else relevantFields.push('Open to Connect', 'Sports & Fitness', 'Creative');
    }

    const newOpportunity: DublinOpportunity = {
      id: `opp-${Date.now()}`,
      type,
      title: title.trim(),
      organizer: `${userName} (Verified Resident)`,
      categoryTag: categoryTag.trim() || 'Community Opportunity',
      rateOrPrice: rateOrPrice.trim() || 'Open to Discussion',
      district,
      lat: baseLat + offsetLat,
      lng: baseLng + offsetLng,
      description: description.trim(),
      expiresInDays,
      relevantFields,
      verifiedByAura: true,
    };

    onAddOpportunity(newOpportunity);
    setTitle('');
    setDescription('');
    setTagsInput('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-md animate-fade-in select-none">
      <div className="relative w-full max-w-lg bg-[#0a0f24] border-t sm:border border-slate-800 rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-4 px-6 border-b border-slate-800/80 bg-[#0d1430]/80 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <Briefcase className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">Post New Opportunity</h3>
              <p className="text-[11px] text-slate-400">Housing, tech co-founders, or Dublin community gigs</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4 text-xs">
          {/* Type Selector */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-300 mb-1.5">
              Opportunity Type *
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {TYPES.map((t) => {
                const Icon = t.icon;
                const isSelected = type === t.id;
                return (
                  <button
                    type="button"
                    key={t.id}
                    onClick={() => handleTypeSelect(t.id)}
                    className={`flex flex-col p-2.5 rounded-xl border text-left transition-all ${
                      isSelected
                        ? `${t.color} font-semibold ring-1 ring-emerald-500`
                        : 'bg-slate-900/90 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 mb-1">
                      <Icon className="w-4 h-4 shrink-0" />
                      <span className="font-semibold text-xs">{t.label}</span>
                    </div>
                    <span className="text-[10px] text-slate-500 leading-tight">{t.desc}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-300 mb-1.5">
              Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={
                type === 'housing'
                  ? 'e.g. Sunny Double Room near Grand Canal Towpath'
                  : type === 'job'
                  ? 'e.g. Senior Frontend Engineer (React/TypeScript)'
                  : 'e.g. Saturday Morning Canal Running Crew'
              }
              className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Category Tag & Rate / Price */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1.5">
                Category Tag
              </label>
              <input
                type="text"
                value={categoryTag}
                onChange={(e) => setCategoryTag(e.target.value)}
                placeholder="e.g. Flatshare, Co-Founder, Run Club"
                className="w-full px-3 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1.5">
                Rate / Compensation / Rent
              </label>
              <input
                type="text"
                value={rateOrPrice}
                onChange={(e) => setRateOrPrice(e.target.value)}
                placeholder="e.g. €850 / mo, Equity, Free"
                className="w-full px-3 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* District & Duration */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1.5">
                Dublin District
              </label>
              <select
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-emerald-500 text-xs"
              >
                {DUBLIN_DISTRICTS.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1.5">
                Listing Expiration
              </label>
              <select
                value={expiresInDays}
                onChange={(e) => setExpiresInDays(Number(e.target.value))}
                className="w-full px-3 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-emerald-500 text-xs"
              >
                <option value={3}>3 Days (Quick match)</option>
                <option value={7}>7 Days (Standard)</option>
                <option value={14}>14 Days (Extended)</option>
                <option value={30}>30 Days (Long-term)</option>
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-300 mb-1.5">
              Full Description & Requirements *
            </label>
            <textarea
              required
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the opportunity, key requirements, vibe, contact expectations, and what kind of Dublin collaborator you're looking for..."
              className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 text-xs resize-none"
            />
          </div>

          {/* Target Audience / Tags */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-300 mb-1.5">
              Target Audience / Relevant Tags (comma-separated)
            </label>
            <input
              type="text"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="Newcomer, IT & Tech, Specialty Coffee, Creative"
              className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 text-xs"
            />
          </div>

          {/* Aura Verification Notice */}
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-start gap-2.5 text-[11px] text-emerald-300">
            <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-400 mt-0.5" />
            <div>
              <span className="font-semibold block">Aura Verified Post</span>
              <span className="text-[10px] text-emerald-400/80">
                Your post will carry your verified Dublin resident badge. Earn +25 Aura upon publication.
              </span>
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/30 flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
            >
              <Sparkles className="w-4 h-4" />
              <span>Publish Opportunity (+25 Aura)</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
