import React, { useEffect, useRef, useState } from 'react';
import {
  APIProvider,
  Map,
  useApiLoadingStatus,
  APILoadingStatus,
  useMap,
} from '@vis.gl/react-google-maps';
import { DublinPlace, DublinOpportunity, NearbyDublinUser, VisibilityLevel } from '../types';
import { DublinMap as FallbackLeafletMap } from './DublinMap';
import { ZoomIn, ZoomOut, Compass } from 'lucide-react';
import { MarkersLayer } from './MapMarkers';
import { PICME_MAP_STYLE } from './mapStyle';
import { COLORS } from '../theme';

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

    const RADIUS: Partial<Record<VisibilityLevel, number>> = { zone: 400, district: 800 };
    const addCircle = (center: { lat: number; lng: number }, radius: number) =>
      circlesRef.current.push(
        new google.maps.Circle({
          strokeColor: COLORS.people,
          strokeOpacity: 1,
          strokeWeight: 1,
          fillColor: COLORS.people,
          fillOpacity: 0.12,
          clickable: false,
          map,
          center,
          radius,
        })
      );

    // Current user's visibility area
    if (isOnboarded && RADIUS[myVisibility]) {
      addCircle(myLocation, RADIUS[myVisibility]!);
    }

    // Other people's visibility areas
    if (layersPeople) {
      people.forEach((u) => {
        if (RADIUS[u.visibility]) addCircle({ lat: u.lat, lng: u.lng }, RADIUS[u.visibility]!);
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
        className="w-8 h-8 rounded-xl bg-white hover:bg-card border border-line text-ink shadow-md flex items-center justify-center transition-colors shadow-md"
        title="Zoom In"
      >
        <ZoomIn className="w-4 h-4" />
      </button>
      <button
        onClick={() => map?.setZoom((map.getZoom() || 14) - 1)}
        className="w-8 h-8 rounded-xl bg-white hover:bg-card border border-line text-ink shadow-md flex items-center justify-center transition-colors shadow-md"
        title="Zoom Out"
      >
        <ZoomOut className="w-4 h-4" />
      </button>
      <button
        onClick={() => {
          map?.panTo(center);
          map?.setZoom(14);
        }}
        className="w-8 h-8 rounded-xl bg-white hover:bg-card border border-line text-ink shadow-md flex items-center justify-center transition-colors shadow-md"
        title="Recenter Dublin"
      >
        <Compass className="w-4 h-4" />
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

  const f = filterCategory.toLowerCase();
  const visiblePeople = !layers.people
    ? []
    : people.filter(
        (user) =>
          filterCategory === 'all' ||
          user.interests.includes(filterCategory) ||
          user.activity.toLowerCase().includes(f) ||
          user.identity.toLowerCase().includes(f)
      );
  const visiblePlaces = !layers.places
    ? []
    : places.filter(
        (place) =>
          filterCategory === 'all' ||
          place.tags.some((t) => t.toLowerCase().includes(f)) ||
          place.category.toLowerCase().includes(f)
      );
  const visibleOpportunities = !layers.opportunities
    ? []
    : opportunities.filter(
        (opp) => filterCategory === 'all' || opp.categoryTag.toLowerCase().includes(f) || opp.type.toLowerCase().includes(f)
      );

  // If Google Maps fails to authenticate or load, seamlessly render the dark Dublin map
  if (status === APILoadingStatus.FAILED || status === APILoadingStatus.AUTH_FAILURE) {
    return (
      <div className="relative w-full h-full bg-canvas">
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
      <div className="w-full h-full bg-canvas flex flex-col items-center justify-center p-4 text-center">
        <div className="w-10 h-10 rounded-full border-2 border-line border-t-ink animate-spin mb-3" />
        <span className="text-xs font-semibold text-ink">Connecting Google Maps Platform...</span>
        <span className="text-[10px] text-subtle font-mono mt-1">Initializing Dublin Navigation Mesh</span>
      </div>
    );
  }

  // Loaded successfully!
  return (
    <div className="relative w-full h-full bg-canvas overflow-hidden select-none">
      <Map
        defaultCenter={{ lat: center.lat, lng: center.lng }}
        defaultZoom={zoom}
        // No mapId: markers are HTML overlays, so the green base style can be applied from code
        styles={PICME_MAP_STYLE}
        backgroundColor={COLORS.canvas}
        clickableIcons={false}
        gestureHandling={'greedy'}
        disableDefaultUI={true}
        internalUsageAttributionIds={['gmp_git_agentskills_v1']}
        className="w-full h-full"
      >
        {/* Controls */}
        <MapControls center={center} />

        {/* Visibility areas (zone / district) */}
        <MapCirclesController
          myLocation={myLocation}
          myVisibility={myVisibility}
          isOnboarded={isOnboarded}
          people={visiblePeople}
          layersPeople={layers.people}
        />

        <MarkersLayer
          people={visiblePeople}
          places={visiblePlaces}
          opportunities={visibleOpportunities}
          selectedKey={
            selectedUser
              ? `person-${selectedUser.id}`
              : selectedPlace
              ? `place-${selectedPlace.id}`
              : selectedOpportunity
              ? `opp-${selectedOpportunity.id}`
              : null
          }
          onSelectUser={(user) => {
            if (!isOnboarded) {
              onRequireOnboarding(
                `To view ${user.name}'s Dublin profile and mutual resonance signals, complete your context pass.`
              );
            } else {
              onSelectUser(user);
            }
          }}
          onSelectPlace={(place) => {
            if (!isOnboarded) {
              onRequireOnboarding(
                `To interact with ${place.name} and view verified community hours, set up your profile context.`
              );
            } else {
              onSelectPlace(place);
            }
          }}
          onSelectOpportunity={(opp) => {
            if (!isOnboarded) {
              onRequireOnboarding(
                `To access Dublin housing listings, job opportunities, and peer activities, complete onboarding.`
              );
            } else {
              onSelectOpportunity(opp);
            }
          }}
          myLocation={myLocation}
          myVisibility={myVisibility}
          isOnboarded={isOnboarded}
        />
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
