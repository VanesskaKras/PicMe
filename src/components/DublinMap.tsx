import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { DublinPlace, DublinOpportunity, NearbyDublinUser, VisibilityLevel } from '../types';
import { getGraphicSvgString } from './GraphicIcon';
import { COLORS } from '../theme';

interface DublinMapProps {
  center: { lat: number; lng: number };
  zoom?: number;
  layers: {
    people: boolean;
    places: boolean;
    opportunities: boolean;
  };
  filterCategory: string;
  people: NearbyDublinUser[];
  places: DublinPlace[];
  opportunities: DublinOpportunity[];
  selectedUser: NearbyDublinUser | null;
  selectedPlace: DublinPlace | null;
  selectedOpportunity: DublinOpportunity | null;
  onSelectUser: (user: NearbyDublinUser) => void;
  onSelectPlace: (place: DublinPlace) => void;
  onSelectOpportunity: (opp: DublinOpportunity) => void;
  myVisibility: VisibilityLevel;
  myLocation: { lat: number; lng: number };
  isOnboarded: boolean;
  onRequireOnboarding: (reason: string) => void;
}

export const DublinMap: React.FC<DublinMapProps> = ({
  center,
  zoom = 14,
  layers,
  filterCategory,
  people,
  places,
  opportunities,
  selectedUser,
  selectedPlace,
  selectedOpportunity,
  onSelectUser,
  onSelectPlace,
  onSelectOpportunity,
  myVisibility,
  myLocation,
  isOnboarded,
  onRequireOnboarding,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [center.lat, center.lng],
        zoom: zoom,
        zoomControl: false,
        attributionControl: false,
      });

      // CartoDB Positron tiles (light), tinted green via .leaflet-tile in index.css
      L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        maxZoom: 19,
        subdomains: 'abcd',
      }).addTo(map);

      // Add minimal zoom controls top right
      L.control.zoom({ position: 'topright' }).addTo(map);

      // Add minimal attribution
      L.control.attribution({ position: 'bottomright', prefix: false })
        .addAttribution('&copy; OpenStreetMap &copy; CARTO')
        .addTo(map);

      const markersGroup = L.layerGroup().addTo(map);
      markersLayerRef.current = markersGroup;
      mapInstanceRef.current = map;
    }

    return () => {
      // Map cleanup on unmount
    };
  }, []);

  // Update center when center prop changes
  useEffect(() => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView([center.lat, center.lng], mapInstanceRef.current.getZoom());
    }
  }, [center.lat, center.lng]);

  // Update Markers whenever layers, filters, or selection changes
  useEffect(() => {
    if (!mapInstanceRef.current || !markersLayerRef.current) return;
    const markersGroup = markersLayerRef.current;
    markersGroup.clearLayers();

    // 1. Render Current User's Radar Halo
    if (isOnboarded && myVisibility !== 'invisible') {
      const myIcon = L.divIcon({
        className: 'custom-my-location-marker',
        html: `
          <div class="relative flex items-center justify-center">
            <div class="absolute w-12 h-12 rounded-full bg-ink/15 animate-ping"></div>
            <div class="relative w-5 h-5 rounded-full bg-ink border-[3px] border-white shadow-md"></div>
            <span class="absolute -bottom-5 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-white text-ink whitespace-nowrap shadow-md">
              You (${myVisibility})
            </span>
          </div>
        `,
        iconSize: [28, 28],
        iconAnchor: [14, 14],
      });

      const userMarker = L.marker([myLocation.lat, myLocation.lng], { icon: myIcon });
      markersGroup.addLayer(userMarker);

      // If privacy zone mode is chosen, draw the blurred 500m circle (raw coordinates blurred)
      if (myVisibility === 'zone') {
        const zoneCircle = L.circle([myLocation.lat, myLocation.lng], {
          radius: 400,
          color: COLORS.ink, // the viewer's own privacy zone
          weight: 1,
          dashArray: '4, 8',
          fillColor: COLORS.ink,
          fillOpacity: 0.08,
        });
        markersGroup.addLayer(zoneCircle);
      }
    }

    // 2. Render Layer 1: People
    if (layers.people) {
      people.forEach((user) => {
        // Filter by category if active
        if (filterCategory !== 'all') {
          const matches =
            user.interests.includes(filterCategory) ||
            user.activity.toLowerCase().includes(filterCategory.toLowerCase()) ||
            user.identity.toLowerCase().includes(filterCategory.toLowerCase());
          if (!matches) return;
        }

        const isSelected = selectedUser?.id === user.id;

        // If user is in 'zone' or 'district' visibility, show privacy halo
        if (user.visibility === 'zone') {
          const privacyCircle = L.circle([user.lat, user.lng], {
            radius: 350,
            color: COLORS.people,
            weight: 1,
            fillColor: COLORS.people,
            fillOpacity: 0.06,
          });
          markersGroup.addLayer(privacyCircle);
        }

        const moodBadgeSvg = getGraphicSvgString(user.mood ? user.mood.emoji : '✨', 14);
        const ringColor = isSelected ? 'ring-2 ring-ink scale-110' : 'ring-2 ring-white';

        const personIcon = L.divIcon({
          className: 'custom-person-marker',
          html: `
            <div class="relative group cursor-pointer transition-transform duration-200">
              <div class="relative w-11 h-11 rounded-full p-[3px] bg-people shadow-md ${ringColor}">
                <img src="${user.avatarUrl}" alt="${user.name}" class="w-full h-full object-cover rounded-full bg-card" />
                <span class="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-people text-ink border-2 border-white flex items-center justify-center shadow">
                  ${moodBadgeSvg}
                </span>
              </div>
              <div class="absolute -bottom-5 left-1/2 -translate-x-1/2 px-1.5 py-0.5 rounded-full bg-white text-[10px] font-semibold text-ink whitespace-nowrap shadow-md flex items-center gap-1">
                <span class="w-1.5 h-1.5 rounded-full bg-people"></span>
                <span>${user.name.split(' ')[0]}</span>
              </div>
            </div>
          `,
          iconSize: [44, 44],
          iconAnchor: [22, 22],
        });

        const marker = L.marker([user.lat, user.lng], { icon: personIcon });
        marker.on('click', () => {
          if (!isOnboarded) {
            onRequireOnboarding(`To view ${user.name}'s profile and match mutual signals, complete your 5-step Dublin context profile.`);
          } else {
            onSelectUser(user);
          }
        });
        markersGroup.addLayer(marker);
      });
    }

    // 3. Render Layer 2: Places (Venues, Cafes, Pubs, Events)
    if (layers.places) {
      places.forEach((place) => {
        if (filterCategory !== 'all') {
          const matches =
            place.tags.some((t) => t.toLowerCase().includes(filterCategory.toLowerCase())) ||
            place.category.toLowerCase().includes(filterCategory.toLowerCase());
          if (!matches) return;
        }

        const isSelected = selectedPlace?.id === place.id;
        const placeRing = isSelected ? 'border-ink scale-110' : 'border-white';

        const placeSvg = getGraphicSvgString(place.category, 18);

        const placeIcon = L.divIcon({
          className: 'custom-place-marker',
          html: `
            <div class="relative group cursor-pointer transition-transform duration-200">
              <div class="w-9 h-9 rounded-xl bg-place text-ink-strong border-2 ${placeRing} flex items-center justify-center text-sm shadow-md">
                ${placeSvg}
                ${place.hasLiveEvent ? '<span class="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-people ring-2 ring-white animate-pulse"></span>' : ''}
              </div>
              <div class="absolute -bottom-5 left-1/2 -translate-x-1/2 px-1.5 py-0.5 rounded-full bg-white text-[10px] font-semibold text-ink whitespace-nowrap shadow-md">
                ${place.name.length > 14 ? place.name.slice(0, 13) + '…' : place.name}
              </div>
            </div>
          `,
          iconSize: [36, 36],
          iconAnchor: [18, 18],
        });

        const marker = L.marker([place.lat, place.lng], { icon: placeIcon });
        marker.on('click', () => {
          if (!isOnboarded) {
            onRequireOnboarding(`To interact with ${place.name} and view verified community hours, set up your profile context.`);
          } else {
            onSelectPlace(place);
          }
        });
        markersGroup.addLayer(marker);
      });
    }

    // 4. Render Layer 3: Opportunities (Housing, Jobs, Activities)
    if (layers.opportunities) {
      opportunities.forEach((opp) => {
        if (filterCategory !== 'all') {
          const matches =
            opp.categoryTag.toLowerCase().includes(filterCategory.toLowerCase()) ||
            opp.type.toLowerCase().includes(filterCategory.toLowerCase());
          if (!matches) return;
        }

        const isSelected = selectedOpportunity?.id === opp.id;
        const ring = isSelected ? 'border-ink scale-110' : 'border-white';

        const oppSvg = getGraphicSvgString(opp.type, 18);

        const oppIcon = L.divIcon({
          className: 'custom-opp-marker',
          html: `
            <div class="relative group cursor-pointer transition-transform duration-200">
              <div class="w-9 h-9 rounded-full bg-opp text-ink border-2 ${ring} flex items-center justify-center text-sm shadow-md">
                ${oppSvg}
              </div>
              <div class="absolute -bottom-5 left-1/2 -translate-x-1/2 px-1.5 py-0.5 rounded-full bg-white text-[9px] font-bold text-ink whitespace-nowrap shadow-md">
                ${opp.rateOrPrice.split(' ')[0]}
              </div>
            </div>
          `,
          iconSize: [36, 36],
          iconAnchor: [18, 18],
        });

        const marker = L.marker([opp.lat, opp.lng], { icon: oppIcon });
        marker.on('click', () => {
          if (!isOnboarded) {
            onRequireOnboarding(`To access Dublin housing listings, job opportunities, and peer activities, complete onboarding.`);
          } else {
            onSelectOpportunity(opp);
          }
        });
        markersGroup.addLayer(marker);
      });
    }
  }, [
    layers,
    filterCategory,
    people,
    places,
    opportunities,
    selectedUser,
    selectedPlace,
    selectedOpportunity,
    isOnboarded,
    myVisibility,
    myLocation,
  ]);

  return (
    <div className="relative w-full h-full bg-canvas overflow-hidden select-none">
      <div ref={mapContainerRef} className="w-full h-full z-0" />
    </div>
  );
};
