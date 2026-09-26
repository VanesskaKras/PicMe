// Light, green-toned base map (Google Maps styles JSON). Applied from code, so no Cloud Map ID is needed.
export const PICME_MAP_STYLE: google.maps.MapTypeStyle[] = [
  { elementType: 'geometry', stylers: [{ color: '#eef2e4' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#6b7a58' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#ffffff' }, { weight: 3 }] },
  { elementType: 'labels.icon', stylers: [{ visibility: 'off' }] },
  { featureType: 'administrative', elementType: 'geometry.stroke', stylers: [{ color: '#dde6c8' }] },
  { featureType: 'landscape', elementType: 'geometry', stylers: [{ color: '#eef2e4' }] },
  // Google's own POIs compete with PicMe markers: keep parks, hide the rest
  { featureType: 'poi', stylers: [{ visibility: 'off' }] },
  { featureType: 'poi.park', stylers: [{ visibility: 'on' }] },
  { featureType: 'poi.park', elementType: 'geometry', stylers: [{ color: '#d4e6b5' }] },
  { featureType: 'poi.park', elementType: 'labels.text.fill', stylers: [{ color: '#6b7a58' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#ffffff' }] },
  { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ color: '#ffffff' }] },
  { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#dde6c8' }] },
  { featureType: 'road.highway', elementType: 'geometry.stroke', stylers: [{ color: '#dde6c8' }] },
  { featureType: 'transit', stylers: [{ visibility: 'off' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#bfdcc6' }] },
  { featureType: 'water', elementType: 'labels.text.fill', stylers: [{ color: '#6b7a58' }] },
];
