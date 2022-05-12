import L, { CircleMarkerOptions, PolylineOptions } from 'leaflet'
import { ParkingConditions } from './conditions'
import { OsmNode, OsmWay } from './osm-data'

export interface ParkingPolylineOptions extends PolylineOptions {
    offset?: number | undefined
    conditions?: ParkingConditions
    osm: OsmWay
    isMajor: boolean
}

export interface ParkingPointOptions extends CircleMarkerOptions {
    conditions?: ParkingConditions
    osm: OsmNode
}

export interface LocationAndZoom {
    location: L.LatLng
    zoom: number
}
