import { type CircleMarkerOptions, type PolylineOptions } from 'leaflet'
import type L from 'leaflet'
import { type ParkingConditions } from './conditions'
import { type OsmNode, type OsmWay, type OsmRelation } from './osm-data'

export interface ParkingPolylineOptions extends PolylineOptions {
    offset?: number | undefined
    conditions?: ParkingConditions
    osm: OsmWay | OsmRelation
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
