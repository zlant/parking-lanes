export type OsmTags = Record<string, string>

type OsmType = 'node' | 'way' | 'relation'

interface OsmObject {
    id: number
    type: OsmType
    uid?: number
    user?: string
    /** ISO8601 string */
    timestamp?: string
    version: number
    changeset: number
    tags: OsmTags
}

interface RelationMember {
    type: OsmType
    ref: number
    role: string
}

export interface OsmRelation extends OsmObject {
    type: 'relation'
    members: RelationMember[]
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
