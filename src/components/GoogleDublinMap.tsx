import React, { useEffect, useRef, useState } from 'react';
import {
  APIProvider,
  Map,
  AdvancedMarker,
  useApiLoadingStatus,
  APILoadingStatus,
  useMap,
  ColorScheme
} from '@vis.gl/react-google-maps';
import { DublinPlace, DublinOpportunity, NearbyDublinUser, VisibilityLevel } from '../types';
import { DublinMap as FallbackLeafletMap } from './DublinMap';
import { AlertTriangle, Layers, RefreshCw, ZoomIn, ZoomOut, Compass } from 'lucide-react';
import { GraphicIcon } from './GraphicIcon';

interface GoogleDublinMapProps {
  apiKey: string;
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

// Custom Map Circles Controller for Privacy Radii (Zone Blur)
const MapCirclesController: React.FC<{
  myLocation: { lat: number; lng: number };
  myVisibility: VisibilityLevel;
  isOnboarded: boolean;
  people: NearbyDublinUser[];
  layersPeople: boolean;
}> = ({ myLocation, myVisibility, isOnboarded, people, layersPeople }) => {
  const map = useMap();
  const circlesRef = useRef<google.maps.Circle[]>([]);

  useEffect(() => {
    if (!map) return;

    // Clear old circles
    circlesRef.current.forEach((c) => c.setMap(null));
    circlesRef.current = [];

    // Current user's zone circle (400m privacy blur)
    if (isOnboarded && myVisibility === 'zone') {
      const myCircle = new google.maps.Circle({
        strokeColor: '#00f0ff',
        strokeOpacity: 0.8,
        strokeWeight: 1,
        fillColor: '#00f0ff',
        fillOpacity: 0.12,
        map,
        center: myLocation,
        radius: 400,
      });
      circlesRef.current.push(myCircle);
    }

    // Other users' zone blur circles
    if (layersPeople) {
      people.forEach((u) => {
        if (u.visibility === 'zone') {
          const c = new google.maps.Circle({
            strokeColor: '#ff2a85',
            strokeOpacity: 0.6,
            strokeWeight: 1,
            fillColor: '#ff2a85',
            fillOpacity: 0.08,
            map,
            center: { lat: u.lat, lng: u.lng },
            radius: 350,
          });
          circlesRef.current.push(c);
        }
      });
    }

    return () => {
      circlesRef.current.forEach((c) => c.setMap(null));
      circlesRef.current = [];
    };
  }, [map, myLocation, myVisibility, isOnboarded, people, layersPeople]);

  return null;
};

// Custom Zoom and Navigation Buttons
const MapControls: React.FC<{ center: { lat: number; lng: number } }> = ({ center }) => {
  const map = useMap();

  return (
    <div className="absolute top-3 right-3 z-10 flex flex-col gap-1.5 shadow-lg">
      <button
        onClick={() => map?.setZoom((map.getZoom() || 14) + 1)}
        className="w-8 h-8 rounded-xl bg-[#0c132c]/90 hover:bg-[#1a254f] border border-slate-700/80 text-slate-200 flex items-center justify-center transition-colors shadow-md"
        title="Zoom In"
      >
        <ZoomIn className="w-4 h-4" />
      </button>
      <button
        onClick={() => map?.setZoom((map.getZoom() || 14) - 1)}
        className="w-8 h-8 rounded-xl bg-[#0c132c]/90 hover:bg-[#1a254f] border border-slate-700/80 text-slate-200 flex items-center justify-center transition-colors shadow-md"
        title="Zoom Out"
      >
        <ZoomOut className="w-4 h-4" />
      </button>
      <button
        onClick={() => {
          map?.panTo(center);
          map?.setZoom(14);
        }}
        className="w-8 h-8 rounded-xl bg-[#0c132c]/90 hover:bg-[#1a254f] border border-cyan-500/40 text-cyan-300 flex items-center justify-center transition-colors shadow-md"
        title="Recenter Dublin"
      >
        <Compass className="w-4 h-4 text-cyan-400" />
      </button>
    </div>
  );
};

// Inner Google Maps Content after APIProvider is active
const GoogleMapsCanvas: React.FC<GoogleDublinMapProps> = (props) => {
  const {
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
    apiKey,
  } = props;

  const status = useApiLoadingStatus();

  // If Google Maps fails to authenticate or load, seamlessly render the dark Dublin map
  if (status === APILoadingStatus.FAILED || status === APILoadingStatus.AUTH_FAILURE) {
    return (
      <div className="relative w-full h-full bg-[#070b19]">
        {/* Fallback Dublin Vector Map */}
        <FallbackLeafletMap
          center={center}
          zoom={zoom}
          layers={layers}
          filterCategory={filterCategory}
          people={people}
          places={places}
          opportunities={opportunities}
          selectedUser={selectedUser}
          selectedPlace={selectedPlace}
          selectedOpportunity={selectedOpportunity}
          onSelectUser={onSelectUser}
          onSelectPlace={onSelectPlace}
          onSelectOpportunity={onSelectOpportunity}
          myVisibility={myVisibility}
          myLocation={myLocation}
          isOnboarded={isOnboarded}
          onRequireOnboarding={onRequireOnboarding}
        />
      </div>
    );
  }

  // Loading state
  if (status === APILoadingStatus.LOADING || status === APILoadingStatus.NOT_LOADED) {
    return (
      <div className="w-full h-full bg-[#070b19] flex flex-col items-center justify-center p-4 text-center">
        <div className="w-10 h-10 rounded-full border-2 border-cyan-400/30 border-t-cyan-400 animate-spin mb-3" />
        <span className="text-xs font-semibold text-white">Connecting Google Maps Platform...</span>
        <span className="text-[10px] text-slate-400 font-mono mt-1">Initializing Dublin Navigation Mesh</span>
      </div>
    );
  }

  // Loaded successfully!
  return (
    <div className="relative w-full h-full bg-[#070b19] overflow-hidden select-none">
      <Map
        defaultCenter={{ lat: center.lat, lng: center.lng }}
        defaultZoom={zoom}
        mapId={'DEMO_MAP_ID'}
        colorScheme={ColorScheme.DARK}
        gestureHandling={'greedy'}
        disableDefaultUI={true}
        internalUsageAttributionIds={['gmp_git_agentskills_v1']}
        className="w-full h-full"
      >
        {/* Controls */}
        <MapControls center={center} />

        {/* Circle Overlays for Zone Privacy */}
        <MapCirclesController
          myLocation={myLocation}
          myVisibility={myVisibility}
          isOnboarded={isOnboarded}
          people={people}
          layersPeople={layers.people}
        />

        {/* 1. CURRENT USER MARKER */}
        {isOnboarded && myVisibility !== 'invisible' && (
          <AdvancedMarker position={myLocation}>
            <div className="relative flex items-center justify-center cursor-pointer">
              <div className="absolute w-12 h-12 rounded-full bg-cyan-500/20 border border-cyan-400/50 animate-ping" />
              <div className="relative w-7 h-7 rounded-full bg-slate-900 border-2 border-cyan-400 flex items-center justify-center shadow-[0_0_15px_rgba(0,240,255,0.8)]">
                <div className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
              </div>
              <span className="absolute -bottom-5 px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-950/95 text-cyan-300 border border-cyan-500/40 whitespace-nowrap shadow-md">
                You ({myVisibility})
              </span>
            </div>
          </AdvancedMarker>
        )}

        {/* 2. LAYER 1: PEOPLE */}
        {layers.people &&
          people.map((user) => {
            if (filterCategory !== 'all') {
              const matches =
                user.interests.includes(filterCategory) ||
                user.activity.toLowerCase().includes(filterCategory.toLowerCase()) ||
                user.identity.toLowerCase().includes(filterCategory.toLowerCase());
              if (!matches) return null;
            }

            const isSelected = selectedUser?.id === user.id;
            const ringColor = isSelected
              ? 'border-[#ff2a85] ring-4 ring-[#ff2a85]/50 scale-110'
              : 'border-pink-500/80';

            return (
              <AdvancedMarker
                key={user.id}
                position={{ lat: user.lat, lng: user.lng }}
                onClick={() => {
                  if (!isOnboarded) {
                    onRequireOnboarding(
                      `To view ${user.name}'s Dublin profile and mutual resonance signals, complete your context pass.`
                    );
                  } else {
                    onSelectUser(user);
                  }
                }}
              >
                <div className="relative group cursor-pointer transition-transform duration-200">
                  <div className="relative w-11 h-11 rounded-full p-0.5 bg-gradient-to-tr from-pink-500 via-cyan-400 to-emerald-400 shadow-[0_0_16px_rgba(255,42,133,0.5)]">
                    <img
                      src={user.avatarUrl}
                      alt={user.name}
                      className={`w-full h-full object-cover rounded-full bg-slate-900 border ${ringColor}`}
                    />
                    <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-slate-950 border border-pink-400 flex items-center justify-center shadow">
                      <GraphicIcon nameOrEmoji={user.mood?.emoji || '✨'} size="xs" />
                    </span>
                  </div>
                  <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 px-1.5 py-0.5 rounded bg-slate-950/95 border border-slate-800 text-[10px] font-medium text-slate-200 whitespace-nowrap shadow-md flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-pink-500" />
                    <span>{user.name.split(' ')[0]}</span>
                    <span className="text-cyan-400 font-mono text-[9px]">{user.mutualScore}%</span>
                  </div>
                </div>
              </AdvancedMarker>
            );
          })}

        {/* 3. LAYER 2: PLACES */}
        {layers.places &&
          places.map((place) => {
            if (filterCategory !== 'all') {
              const matches =
                place.tags.some((t) => t.toLowerCase().includes(filterCategory.toLowerCase())) ||
                place.category.toLowerCase().includes(filterCategory.toLowerCase());
              if (!matches) return null;
            }

            const isSelected = selectedPlace?.id === place.id;
            const placeRing = isSelected
              ? 'border-[#00f0ff] ring-4 ring-[#00f0ff]/50 scale-110'
              : 'border-cyan-400/80';

            return (
              <AdvancedMarker
                key={place.id}
                position={{ lat: place.lat, lng: place.lng }}
                onClick={() => {
                  if (!isOnboarded) {
                    onRequireOnboarding(
                      `To interact with ${place.name} and view verified community hours, set up your profile context.`
                    );
                  } else {
                    onSelectPlace(place);
                  }
                }}
              >
                <div className="relative group cursor-pointer transition-transform duration-200">
                  <div
                    className={`w-9 h-9 rounded-xl bg-slate-900/95 border ${placeRing} flex items-center justify-center shadow-[0_0_16px_rgba(0,240,255,0.4)]`}
                  >
                    <GraphicIcon nameOrEmoji={place.category} size={18} />
                    {place.hasLiveEvent && (
                      <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-pink-500 ring-2 ring-slate-950 animate-pulse" />
                    )}
                  </div>
                  <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 px-1.5 py-0.5 rounded bg-slate-950/95 border border-cyan-900/60 text-[10px] font-medium text-cyan-200 whitespace-nowrap shadow-md">
                    {place.name.length > 14 ? place.name.slice(0, 13) + '…' : place.name}
                  </div>
                </div>
              </AdvancedMarker>
            );
          })}

        {/* 4. LAYER 3: OPPORTUNITIES */}
        {layers.opportunities &&
          opportunities.map((opp) => {
            if (filterCategory !== 'all') {
              const matches =
                opp.categoryTag.toLowerCase().includes(filterCategory.toLowerCase()) ||
                opp.type.toLowerCase().includes(filterCategory.toLowerCase());
              if (!matches) return null;
            }

            const isSelected = selectedOpportunity?.id === opp.id;
            const ring = isSelected
              ? 'border-[#10b981] ring-4 ring-[#10b981]/50 scale-110'
              : 'border-emerald-400/80';

            return (
              <AdvancedMarker
                key={opp.id}
                position={{ lat: opp.lat, lng: opp.lng }}
                onClick={() => {
                  if (!isOnboarded) {
                    onRequireOnboarding(
                      `To access Dublin housing listings, job opportunities, and peer activities, complete onboarding.`
                    );
                  } else {
                    onSelectOpportunity(opp);
                  }
                }}
              >
                <div className="relative group cursor-pointer transition-transform duration-200">
                  <div
                    className={`w-9 h-9 rounded-xl bg-slate-900/95 border ${ring} flex items-center justify-center shadow-[0_0_16px_rgba(16,185,129,0.4)]`}
                  >
                    <GraphicIcon nameOrEmoji={opp.type} size={18} />
                    <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 ring-2 ring-slate-950" />
                  </div>
                  <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 px-1.5 py-0.5 rounded bg-slate-950/95 border border-emerald-900/60 text-[9px] font-semibold text-emerald-300 whitespace-nowrap shadow-md">
                    {opp.rateOrPrice.split(' ')[0]}
                  </div>
                </div>
              </AdvancedMarker>
            );
          })}
      </Map>
    </div>
  );
};

// Root Exported Component with APIProvider
export const GoogleDublinMap: React.FC<GoogleDublinMapProps> = (props) => {
  // If no apiKey provided at all, fallback directly to Leaflet
  if (!props.apiKey) {
    return (
      <FallbackLeafletMap
        center={props.center}
        zoom={props.zoom}
        layers={props.layers}
        filterCategory={props.filterCategory}
        people={props.people}
        places={props.places}
        opportunities={props.opportunities}
        selectedUser={props.selectedUser}
        selectedPlace={props.selectedPlace}
        selectedOpportunity={props.selectedOpportunity}
        onSelectUser={props.onSelectUser}
        onSelectPlace={props.onSelectPlace}
        onSelectOpportunity={props.onSelectOpportunity}
        myVisibility={props.myVisibility}
        myLocation={props.myLocation}
        isOnboarded={props.isOnboarded}
        onRequireOnboarding={props.onRequireOnboarding}
      />
    );
  }

  return (
    <APIProvider apiKey={props.apiKey}>
      <GoogleMapsCanvas {...props} />
    </APIProvider>
  );
};
