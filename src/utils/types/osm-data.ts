export interface OsmTags {
    [key: string]: string
}

interface OsmObject {
    id: number
    uid?: number
    user?: string
    /** ISO8601 string */
    timestamp?: string
    version: number
    changeset: number
    tags: OsmTags
}

export interface OsmRelation extends OsmObject {
    type: 'relation'
    members: any[]
}

export interface OsmNode extends OsmObject {
    type: 'node'
    lat: number
    lon: number
}

export interface OsmWay extends OsmObject {
    type: 'way'
    nodes: number[]
}

export type OsmElement = OsmNode | OsmWay | OsmRelation

export interface RawOsmData {
    elements: OsmElement[]
}

export enum OsmDataSource {
    OverpassDe,
    OsmOrg,
    OverpassVk,
}
