import L from 'leaflet'
import { ParkingConditions } from '../utils/types/conditions'
import { ParkingPolylineOptions } from '../utils/types/leaflet'
import { OsmWay } from '../utils/types/osm-data'
import { ParkingAreas } from '../utils/types/parking'
import { getConditions } from './access-condition'
import { getColor, getColorByDate } from './condition-color'

export function parseParkingArea(
    way: OsmWay,
    nodes: { [key: number]: number[] },
    zoom: number,
    editorMode: boolean): ParkingAreas | undefined {
    const polylineNodes = way.nodes.map(x => nodes[x])
    const polyline: L.LatLngLiteral[] = polylineNodes.map((node) => ({ lat: node[0], lng: node[1] }))

    const areas: ParkingAreas = {}

    const conditions = getConditions(way.tags)
    const leafletPolygon = createPolygon(polyline, conditions, way, zoom)
    areas[way.id] = leafletPolygon

    return areas
}

export function updateAreaColorsByDate(areas: ParkingAreas, datetime: Date): void {
    for (const area in areas) {
        const color = getColorByDate(areas[area].options.conditions, datetime)
        areas[area].setStyle({ color })
    }
}

function createPolygon(line: L.LatLngLiteral[], conditions: ParkingConditions | undefined, osm: OsmWay, zoom: number) {
    const polylineOptions: ParkingPolylineOptions = {
        color: getColor(conditions?.default),
        fillOpacity: 0.6,
        weight: 0,
        conditions,
        osm,
        isMajor: false,
    }
    return L.polygon(line, polylineOptions)
}
