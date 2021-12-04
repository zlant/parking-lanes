import L, { PolylineOptions } from 'leaflet'
import { ConditionsInterface } from './conditions'
import { OsmWay } from './osm-data'

export interface ParkingPolylineOptions extends PolylineOptions {
    offset?: number | undefined
    conditions?: ConditionsInterface
    osm: OsmWay
    isMajor: boolean
}

export interface LocationAndZoom {
    location: L.LatLng
    zoom: number
}
