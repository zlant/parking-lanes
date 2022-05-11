import L from 'leaflet'
import { ParkingConditions } from '../utils/types/conditions'
import { ParkingEntranceOptions } from '../utils/types/leaflet'
import { OsmNode } from '../utils/types/osm-data'
import { ParkingEntrances } from '../utils/types/parking'
import { getConditions } from './access-condition'
import { getColor, getColorByDate } from './condition-color'

export function parseParkingEntrance(
    node: OsmNode,
    zoom: number,
    editorMode: boolean): ParkingEntrances | undefined {
    const conditions = getConditions(node.tags)
    return {
        [node.id]: createMarker(conditions, node, zoom),
    }
}

export function updateEntranceColorsByDate(entrnaces: ParkingEntrances, datetime: Date): void {
    for (const entrance in entrnaces) {
        const color = getColorByDate(entrnaces[entrance].options.conditions, datetime)
        entrnaces[entrance].setStyle({ color })
    }
}

export function updateEntranceStylesByZoom(entrances: ParkingEntrances, zoom: number): void {
    const radius = getRadius(zoom)
    for (const entrance in entrances)
        entrances[entrance].setStyle({ radius })
}

function createMarker(conditions: ParkingConditions | undefined, osm: OsmNode, zoom: number) {
    const parkingEntranceOptions: ParkingEntranceOptions = {
        color: getColor(conditions?.default),
        radius: getRadius(zoom),
        fillOpacity: 0.6,
        weight: 0,
        osm,
        conditions,
    }
    return L.circleMarker({ lat: osm.lat, lng: osm.lon }, parkingEntranceOptions)
}

function getRadius(zoom: number) {
    if (zoom < 12)
        return 1
    if (zoom < 14)
        return 2
    if (zoom < 15)
        return 3
    if (zoom < 16)
        return 4
    if (zoom < 18)
        return 6
    return 10
}
