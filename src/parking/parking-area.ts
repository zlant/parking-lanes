import L from 'leaflet'
import { getOpeningHourseState, parseOpeningHourse } from '../utils/opening-hours'
import { ConditionColor, ParkingConditions } from '../utils/types/conditions'
import { ParkingPolylineOptions } from '../utils/types/leaflet'
import { OsmTags, OsmWay } from '../utils/types/osm-data'
import { ParkingAreas } from '../utils/types/parking'
import { legend } from './legend'

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

export function getConditions(tags: OsmTags) {
    const conditions: ParkingConditions = {
        conditionalValues: [],
        default: getDefaultCondition(tags),
    }

    if (tags.opening_hours) {
        conditions.conditionalValues!.push({
            condition: parseOpeningHourse(tags.opening_hours),
            parkingCondition: conditions.default!,
        })
        conditions.default = 'no_stopping'
    }
    if (tags.fee && tags.fee !== 'yes' && tags.fee !== 'no') {
        conditions.conditionalValues?.push({
            condition: parseOpeningHourse(tags.fee),
            parkingCondition: 'ticket',
        })
    }
    if (tags['fee:conditional']) {
        const match = tags['fee:conditional'].match(/(?<value>.*?) *@ *\((?<interval>.*?)\)/)
        if (match?.groups?.interval) {
            conditions.conditionalValues?.push({
                condition: parseOpeningHourse(match?.groups?.interval),
                parkingCondition: match?.groups?.value === 'yes' ? 'ticket' : 'free',
            })
        }
    }

    return conditions
}

/**
 * Get default parking condition for a way given a set of tags based on the access key
 * @param tags A set of tags on the way
 * @returns The default parking condition
 */
function getDefaultCondition(tags: OsmTags): 'yes' | 'ticket' | 'free' | 'customers' | 'no_stopping' | 'residents' | 'disabled' | 'no_parking' {
    switch (tags.access) {
        case undefined:
        case 'yes':
        case 'public':
            return tags.fee === 'yes' ? 'ticket' : 'free'

        case 'private':
        case 'no':
        case 'permissive':
        case 'permit':
            return 'no_stopping'

        case 'customers':
        case 'destination':
            return tags.fee === 'yes' ? 'ticket' : 'customers'

        case 'residents':
        case 'employees':
            return 'residents'

        case 'disabled':
            return 'disabled'

        default:
            return 'no_parking'
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

function getColor(condition: string | null | undefined): ConditionColor | undefined {
    if (!condition)
        return undefined

    for (const element of legend) {
        if (condition === element.condition)
            return element.color
    }
}

export function updateAreaColorsByDate(areas: ParkingAreas, datetime: Date): void {
    for (const area in areas) {
        const color = getColorByDate(areas[area].options.conditions, datetime)
        areas[area].setStyle({ color })
    }
}

function getColorByDate(conditions: ParkingConditions, datetime: Date): ConditionColor | undefined {
    if (!conditions)
        return 'black'

    // If conditions.intervals not defined, return the default color
    for (const interval of conditions.conditionalValues ?? []) {
        if (interval.condition && getOpeningHourseState(interval.condition, datetime))
            return getColor(interval.parkingCondition)
    }
    return getColor(conditions.default)
}
