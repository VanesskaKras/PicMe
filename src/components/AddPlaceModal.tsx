import React, { useState } from 'react';
import {
  MapPin,
  X,
  Sparkles,
  Coffee,
  Beer,
  Laptop,
  Palette,
  Trees,
  Check
} from 'lucide-react';
import { DublinPlace } from '../types';

interface AddPlaceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddPlace: (newPlace: DublinPlace) => void;
  userDistrict?: string;
}

const CATEGORIES: { id: DublinPlace['category']; label: string; icon: any; color: string }[] = [
  { id: 'cafe', label: 'Cafe', icon: Coffee, color: 'text-amber-400 bg-amber-500/10 border-amber-500/30' },
  { id: 'pub', label: 'Pub', icon: Beer, color: 'text-orange-400 bg-orange-500/10 border-orange-500/30' },
  { id: 'coworking', label: 'Coworking', icon: Laptop, color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30' },
  { id: 'culture', label: 'Culture', icon: Palette, color: 'text-pink-400 bg-pink-500/10 border-pink-500/30' },
  { id: 'park', label: 'Park & Outdoors', icon: Trees, color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' },
];

const DUBLIN_DISTRICTS = [
  'Portobello',
  'Docklands / Silicon Docks',
  'Grafton Quarter',
  'Temple Bar',
  'Camden & Harcourt',
  'Ranelagh',
  'Smithfield',
  'St. Stephen’s Green',
  'The Liberties',
  'Grand Canal Dock'
];

export const AddPlaceModal: React.FC<AddPlaceModalProps> = ({
  isOpen,
  onClose,
  onAddPlace,
  userDistrict = 'Portobello'
}) => {
  const [name, setName] = useState('');
  const [category, setCategory] = useState<DublinPlace['category']>('cafe');
  const [district, setDistrict] = useState(userDistrict);
  const [address, setAddress] = useState('');
  const [liveContext, setLiveContext] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [isQuietHour, setIsQuietHour] = useState(false);
  const [hasLiveEvent, setHasLiveEvent] = useState(false);
  const [eventTime, setEventTime] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    // Generate slight offset coordinates around Dublin center/district
    const baseLat = 53.3330;
    const baseLng = -6.2655;
    const offsetLat = (Math.random() - 0.5) * 0.015;
    const offsetLng = (Math.random() - 0.5) * 0.02;

    const tags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    if (tags.length === 0) {
      if (category === 'cafe') tags.push('Specialty Coffee', 'Focus Friendly');
      else if (category === 'pub') tags.push('Irish Pub Sessions', 'Live Tunes');
      else if (category === 'coworking') tags.push('Fast WiFi', 'IT & Tech');
      else if (category === 'culture') tags.push('Art & Heritage', 'Book Clubs');
      else tags.push('Canal Walks', 'Outdoor');
    }

    const newPlace: DublinPlace = {
      id: `place-${Date.now()}`,
      name: name.trim(),
      category,
      district,
      address: address.trim() || `${district}, Dublin`,
      liveContext: liveContext.trim() || 'New vibrant Dublin community spot added by user radar',
      isQuietHour,
      hasLiveEvent,
      eventTime: hasLiveEvent && eventTime.trim() ? eventTime.trim() : undefined,
      lat: baseLat + offsetLat,
      lng: baseLng + offsetLng,
      auraScore: 90 + Math.floor(Math.random() * 8),
      tags,
    };

    onAddPlace(newPlace);
    setName('');
    setAddress('');
    setLiveContext('');
    setTagsInput('');
    setHasLiveEvent(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-md animate-fade-in select-none">
      <div className="relative w-full max-w-lg bg-[#0a0f24] border-t sm:border border-slate-800 rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-4 px-6 border-b border-slate-800/80 bg-[#0d1430]/80 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-pink-500/20 border border-pink-500/40 flex items-center justify-center text-pink-400">
              <MapPin className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">Add New Place</h3>
              <p className="text-[11px] text-slate-400">Broadcast a spot to the live Dublin radar</p>
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
          {/* Place Name */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-300 mb-1.5">
              Place Name *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Kaph Coffee, The Bernard Shaw, Canal Bench #4"
              className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-pink-500"
            />
          </div>

          {/* Category Selector */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-300 mb-1.5">
              Category
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {CATEGORIES.map((cat) => {
                const Icon = cat.icon;
                const isSelected = category === cat.id;
                return (
                  <button
                    type="button"
                    key={cat.id}
                    onClick={() => setCategory(cat.id)}
                    className={`flex items-center gap-2 p-2.5 rounded-xl border text-left transition-all ${
                      isSelected
                        ? `${cat.color} font-semibold ring-1 ring-pink-500`
                        : 'bg-slate-900/90 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span className="truncate">{cat.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* District & Address */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1.5">
                Dublin District
              </label>
              <select
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-pink-500 text-xs"
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
                Street / Location
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="e.g. 14 South William St, D2"
                className="w-full px-3 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-pink-500 text-xs"
              />
            </div>
          </div>

          {/* Live Context / Atmosphere */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-300 mb-1.5">
              Live Vibe & Atmosphere Note
            </label>
            <textarea
              rows={2}
              value={liveContext}
              onChange={(e) => setLiveContext(e.target.value)}
              placeholder="e.g. Sun-drenched outdoor benches, fast WiFi, calm acoustic jazz background"
              className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-pink-500 text-xs resize-none"
            />
          </div>

          {/* Tags */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-300 mb-1.5">
              Tags (comma-separated)
            </label>
            <input
              type="text"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="Specialty Coffee, WiFi, Dog Friendly, Canal Walks"
              className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-pink-500 text-xs"
            />
          </div>

          {/* Quick Atmosphere Toggles */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            <button
              type="button"
              onClick={() => setIsQuietHour(!isQuietHour)}
              className={`p-2.5 rounded-xl border flex items-center justify-between text-left transition-colors ${
                isQuietHour
                  ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300'
                  : 'bg-slate-900 border-slate-800 text-slate-400'
              }`}
            >
              <div>
                <span className="font-semibold block text-[11px]">Quiet Focus Zone</span>
                <span className="text-[10px] text-slate-500">Low noise levels</span>
              </div>
              <div className={`w-4 h-4 rounded flex items-center justify-center border ${
                isQuietHour ? 'bg-emerald-500 border-emerald-400 text-slate-950' : 'border-slate-700'
              }`}>
                {isQuietHour && <Check className="w-3 h-3 stroke-[3]" />}
              </div>
            </button>

            <button
              type="button"
              onClick={() => setHasLiveEvent(!hasLiveEvent)}
              className={`p-2.5 rounded-xl border flex items-center justify-between text-left transition-colors ${
                hasLiveEvent
                  ? 'bg-pink-500/10 border-pink-500/40 text-pink-300'
                  : 'bg-slate-900 border-slate-800 text-slate-400'
              }`}
            >
              <div>
                <span className="font-semibold block text-[11px]">Live Event Today</span>
                <span className="text-[10px] text-slate-500">Music or meetups</span>
              </div>
              <div className={`w-4 h-4 rounded flex items-center justify-center border ${
                hasLiveEvent ? 'bg-pink-500 border-pink-400 text-slate-950' : 'border-slate-700'
              }`}>
                {hasLiveEvent && <Check className="w-3 h-3 stroke-[3]" />}
              </div>
            </button>
          </div>

          {hasLiveEvent && (
            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                Event Time / Detail
              </label>
              <input
                type="text"
                value={eventTime}
                onChange={(e) => setEventTime(e.target.value)}
                placeholder="e.g. 7:30 PM Acoustic Jam / Tech Demo"
                className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:border-pink-500"
              />
            </div>
          )}

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white font-bold text-xs shadow-lg shadow-pink-500/30 flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
            >
              <Sparkles className="w-4 h-4" />
              <span>Broadcast Place to Dublin Radar (+15 Aura)</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
