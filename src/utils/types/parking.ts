import { type OsmTags } from './osm-data'

export type Side = 'left' | 'right'

export interface StyleMapInterface {
    weightMinor?: number
    weightMajor?: number

    offsetMajor?: number
    offsetMinor?: number
}

export type ParkingLanes = Record<string, L.Polyline | any>

export type ParkingAreas = Record<string, L.Polyline | any>

export type ParkingPoint = Record<string, L.Marker | any>

export interface ParkingTagInfo {
    template: string
    values?: string[]
    dependentTags?: string[]
    checkForNeedShowing: (tags: OsmTags, side: string) => boolean
}
