import { OsmWay } from './osm-data'

interface EditTypeStore {
    way: OsmWay[]
}

export interface ChangesStore {
    modify: EditTypeStore
    create: EditTypeStore
}

interface JxonOsmTag {
    $k: string
    $v: string
}

interface JxonOsmObject {
    $id: number
    $version: number
    tag: JxonOsmTag[]
    $changeset?: string
}

export interface JxonOsmWay extends JxonOsmObject {
    nd: Array<{$ref: number}>
}

export interface ChangedIdMap {
    [oldId: string]: string
}
