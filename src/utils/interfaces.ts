import L from 'leaflet'

interface GlobalState {
  map: L.Map;
}

export type OurWindow = Window & GlobalState & typeof globalThis;

export type Side = 'left' | 'right';

export interface ConditionsInterface {
  intervals?: any[],
  default?: null | string // TODO add type: Can be free, no_parking, no_stopping and likely others
}

export interface StyleMapInterface {
  weightMinor?: number;
  weightMajor?: number;

  offsetMajor?: number;
  offsetMinor?: number;
}

export interface LocationAndZoom {
  location: L.LatLng,
  zoom: number
}

export type ParkingLanes = { [key: string]: any }


export type ConditionName = 'disc' | 'no_parking' | 'no_stopping' | 'free' | 'ticket'
  |'customers' | 'residents' | 'disabled' | 'disc';


export type ConditionColor = string;
export interface ConditionColorDefinition {
  condition: ConditionName,
  color: ConditionColor;
  /** Text describing the condition */
  text: string;
}

export interface OverpassTurboResponse {
    ways: OsmWays;
    nodes: { [key: number]: L.LatLngTuple};
    waysInRelation: { [key: number]: boolean};
}

export type OsmElement = OsmNode | OsmWay | OsmRelation;
export interface OverpassTurboRawResponse {
  elements: OsmElement[];
}

/** EG: { k: 'parking:lane:{side}', v: 'no_stopping' } */
export interface OsmKeyValue {
  k: string,
  v: string;
}
export interface Preset {
  /** Name of this preset */
  key: string,
  tags: OsmKeyValue[],
  img: {
      src: string,
      height: number,
      width: number,
      alt: string,
      title: string,
  },
}
////// OSM Types
interface OsmObject {
  id: number;
  uid: number;
  user: string;
  /** ISO8601 string */
  timestamp: string;
  version: number;
  changeset: number;
}
interface OsmRelation extends OsmObject {
    type: "relation";
    members: any[];
    tags: { [key: string]: string };
}

export interface OsmNode extends OsmObject {
  type: "node";
  lat: number;
  lon: number;
}

export interface OsmWay extends OsmObject {
    type: "way";
    nodes: number[];
    tags: { [key: string]: string };
}

export type OsmWays  = { [key: number]: OsmWay }
export type OsmNodes  = { [key: number]: OsmNode }
