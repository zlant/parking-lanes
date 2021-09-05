import L from 'leaflet'

interface GlobalState {
  map: L.Map;
}

export type OurWindow = Window & GlobalState & typeof globalThis;


export interface ConditionsInterface {
  intervals: any[],
  default: any
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