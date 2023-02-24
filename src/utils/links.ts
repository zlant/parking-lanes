import { type LatLng, type LatLngLiteral } from 'leaflet'
import { type OsmNode, type OsmRelation, type OsmWay } from './types/osm-data'

export const overpassDeUrl = 'https://overpass-api.de/api/interpreter?data='
export const overpassVkUrl = 'https://maps.mail.ru/osm/tools/overpass/api/interpreter?data='
export const josmUrl = 'http://127.0.0.1:8111/import?url='

export const osmProdUrl = 'https://www.openstreetmap.org'
export const osmDevUrl = 'https://master.apis.dev.openstreetmap.org'

export function mapillaryUrl(center: LatLngLiteral) {
    return `https://www.mapillary.com/app/?lat=${center.lat}&lng=${center.lng}&z=17&focus=map&trafficSign=all`
}

interface idEditorUrlProps {
    center?: LatLngLiteral | LatLng
    zoom?: number
    background?: string
    osmObjectType?: OsmRelation['type'] | OsmWay['type'] | OsmNode['type']
    osmObjectId?: number | string
}
export function idEditorUrl({ center, zoom, background, osmObjectType, osmObjectId }: idEditorUrlProps) {
    const params: Record<string, string> = {
        disable_features: 'boundaries',
        photo_overlay: 'streetside,mapillary,kartaview',
    }
    if (zoom && center) params.map = `${zoom}/${center.lat}/${center.lng}`
    if (background) params.background = background
    if (osmObjectType && osmObjectId) params.id = `${osmObjectType.charAt(0)}${osmObjectId}`
    const hashUrlParams = new URLSearchParams(params as any)

    return `https://ideditor-release.netlify.app/#${hashUrlParams.toString()}`
}
