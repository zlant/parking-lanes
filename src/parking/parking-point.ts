import L from 'leaflet'
import { ParkingConditions } from '../utils/types/conditions'
import { ParkingPointOptions } from '../utils/types/leaflet'
import { OsmNode } from '../utils/types/osm-data'
import { ParkingPoint } from '../utils/types/parking'
import { getConditions } from './access-condition'
import { getColor, getColorByDate } from './condition-color'

export function parseParkingPoint(
    node: OsmNode,
    zoom: number,
    editorMode: boolean): ParkingPoint | undefined {
    const conditions = getConditions(node.tags)
    return {
        [node.id]: createMarker(conditions, node, zoom),
    }
}

export function updatePointColorsByDate(points: ParkingPoint, datetime: Date): void {
    for (const point in points) {
        const color = getColorByDate(points[point].options.conditions, datetime)
        points[point].setStyle({ color })
    }
}

export function updatePointStylesByZoom(points: ParkingPoint, zoom: number): void {
    const radius = getRadius(zoom)
    for (const point in points)
        points[point].setStyle({ radius })
}

function createMarker(conditions: ParkingConditions | undefined, osm: OsmNode, zoom: number) {
    const parkingPointOptions: ParkingPointOptions = {
        color: getColor(conditions?.default),
        radius: getRadius(zoom),
        fillOpacity: 0.6,
        weight: 0,
        osm,
        conditions,
    }
    return L.circleMarker({ lat: osm.lat, lng: osm.lon }, parkingPointOptions)
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
