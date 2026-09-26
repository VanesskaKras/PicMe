// Sub-category filters per map layer. Shared by the map's "Layers & Filters" sheet
// and the list screen, so both always show the same selection.

export type PeopleFilter = 'all' | 'interests' | 'mood';
export type PlacesFilter = 'all' | 'cafe' | 'coworking' | 'sport' | 'culture';
export type OppsFilter = 'all' | 'housing' | 'job' | 'collaboration' | 'activity';

export const PEOPLE_FILTER_OPTIONS: [PeopleFilter, string][] = [
  ['all', 'All Open'],
  ['interests', 'Matching Interests'],
  ['mood', 'Shared Mood'],
];

export const PLACES_FILTER_OPTIONS: [PlacesFilter, string][] = [
  ['all', 'All'],
  ['cafe', 'Coffee & Food'],
  ['coworking', 'Coworking'],
  ['sport', 'Sports'],
  ['culture', 'Culture'],
];

export const OPPS_FILTER_OPTIONS: [OppsFilter, string][] = [
  ['all', 'All'],
  ['housing', 'Housing (714)'],
  ['job', 'Jobs (1154)'],
  ['collaboration', 'Collaborations'],
  ['activity', 'Activities'],
];
