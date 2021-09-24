import { OsmWay } from './osm-data'

export interface WaysInRelation {
    [key: number]: boolean
}

export interface OsmWays {
    [key: number]: OsmWay
}

export interface ParsedOsmData {
    ways: OsmWays
    nodes: { [key: number]: L.LatLngTuple }
    waysInRelation: WaysInRelation
}
