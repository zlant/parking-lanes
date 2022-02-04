/** EG: { k: 'parking:lane:{side}', v: 'no_stopping' } */
export interface OsmKeyValue {
    k: string
    v: string
}

export interface Presets {
    [key: string]: Preset[]
}

export interface Preset {
    /** Name of this preset */
    key: string
    tags: OsmKeyValue[]
    img: {
        src: string
        height: number
        width: number
        alt: string
        title: string
    }
}
