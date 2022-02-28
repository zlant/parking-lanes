import L, { PolylineOptions } from 'leaflet'
import { ParkingConditions } from './conditions'
import { OsmWay } from './osm-data'

export interface ParkingPolylineOptions extends PolylineOptions {
    offset?: number | undefined
    conditions?: ParkingConditions
    osm: OsmWay
    isMajor: boolean
}

export interface LocationAndZoom {
    location: L.LatLng
    zoom: number
}
