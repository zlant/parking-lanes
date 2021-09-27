import { OsmWay } from './osm-data'

export interface WaysInRelation {
    [wayId: number]: boolean
}

export interface OsmWays {
    [wayId: number]: OsmWay
}

export interface ParsedOsmData {
    ways: OsmWays
    nodes: { [nodeId: number]: L.LatLngTuple }
    waysInRelation: WaysInRelation
}
