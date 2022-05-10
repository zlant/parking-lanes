import { OsmNode, OsmWay } from './osm-data'

export interface WaysInRelation {
    [wayId: number]: boolean
}

export interface ParsedOsmData {
    ways: { [wayId: number]: OsmWay }
    nodes: { [nodeId: number]: OsmNode }
    nodeCoords: { [nodeId: number]: L.LatLngTuple }
    waysInRelation: WaysInRelation
}
