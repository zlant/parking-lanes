import { LatLngLiteral } from 'leaflet'

export const overpassDeUrl = 'https://overpass-api.de/api/interpreter?data='
export const overpassVkUrl = 'https://maps.mail.ru/osm/tools/overpass/api/interpreter?data='
export const josmUrl = 'http://127.0.0.1:8111/import?url='
export const idUrl = 'https://www.openstreetmap.org/edit?editor=id'

export const osmProdUrl = 'https://www.openstreetmap.org'
export const osmDevUrl = 'https://master.apis.dev.openstreetmap.org'

export function mapillaryUrl(center: LatLngLiteral) {
    return `https://www.mapillary.com/app/?lat=${center.lat}&lng=${center.lng}&z=17&focus=map&trafficSign=all`
}
