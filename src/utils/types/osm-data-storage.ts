import { type OsmNode, type OsmWay } from './osm-data'

export type WaysInRelation = Record<number, boolean>

export interface ParsedOsmData {
    // eslint-disable-next-line @typescript-eslint/consistent-indexed-object-style
    ways: { [wayId: number]: OsmWay }

    // eslint-disable-next-line @typescript-eslint/consistent-indexed-object-style
    nodes: { [nodeId: number]: OsmNode }

    // eslint-disable-next-line @typescript-eslint/consistent-indexed-object-style
    nodeCoords: { [nodeId: number]: L.LatLngTuple }

    waysInRelation: WaysInRelation
}
