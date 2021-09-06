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
    ways: Ways;
    nodes: Nodes;
    waysInRelation: { [key: number]: boolean};
}

////// OSM Types
export interface Way {
    type: "way";
    id: number;
    /** ISO8601 string */
    timestamp: string;
    version: number;
    changeset: number;
    user: string;
    uid: number;
    nodes: number[];
    tags: { [key: string]: string };
}

export type Ways  = { [key: number]: Way }
export type Nodes  = { [key: number]: Way }
