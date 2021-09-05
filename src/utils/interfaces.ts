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
    ways: OSMWays;
    nodes: { [key: number]: L.LatLngTuple};
    waysInRelation: { [key: number]: boolean};
}

export type OSMElement = OSMNode | OSMWay | OSMRelation;
export interface OverpassTurboRawResponse {
  elements: OSMElement[];
}

////// OSM Types
interface OSMObject {
  id: number;
  uid: number;
  user: string;
  /** ISO8601 string */
  timestamp: string;
  version: number;
  changeset: number;
}
interface OSMRelation extends OSMObject {
    type: "relation";
    members: any[];
    tags: { [key: string]: string };
}

export interface OSMNode extends OSMObject {
  type: "node";
  lat: number;
  lon: number;
}

export interface OSMWay extends OSMObject {
    type: "way";
    nodes: number[];
    tags: { [key: string]: string };
}

export type OSMWays  = { [key: number]: OSMWay }
export type OSMNodes  = { [key: number]: OSMNode }
