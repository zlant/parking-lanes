import L from 'leaflet'
import { getOpeningHourseState, parseOpeningHourse } from '../utils/opening-hours'
import { ConditionColor, ConditionsInterface } from '../utils/types/conditions'
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

function getConditions(tags: OsmTags) {
    const conditions: ConditionsInterface = {
        intervals: [],
        default: getDefaultCondition(tags),
    }

    if (tags.opening_hours) {
        conditions.intervals!.push({
            interval: parseOpeningHourse(tags.opening_hours),
            condition: conditions.default!,
        })
        conditions.default = 'no_stopping'
    }
    if (tags.fee && tags.fee !== 'yes' && tags.fee !== 'no') {
        conditions.intervals?.push({
            interval: parseOpeningHourse(tags.fee),
            condition: 'ticket',
        })
    }
    if (tags['fee:conditional']) {
        const match = tags['fee:conditional'].match(/(?<value>.*?) *@ *\((?<interval>.*?)\)/)
        if (match?.groups?.interval) {
            conditions.intervals?.push({
                interval: parseOpeningHourse(match?.groups?.interval),
                condition: match?.groups?.value === 'yes' ? 'ticket' : 'free',
            })
        }
    }

    return conditions
}

function getDefaultCondition(tags: OsmTags) {
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

function createPolygon(line: L.LatLngLiteral[], conditions: ConditionsInterface | undefined, osm: OsmWay, zoom: number) {
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

function getColorByDate(conditions: ConditionsInterface, datetime: Date): ConditionColor | undefined {
    if (!conditions)
        return 'black'

    // If conditions.intervals not defined, return the default color
    for (const interval of conditions.intervals ?? []) {
        if (interval.interval && getOpeningHourseState(interval.interval, datetime))
            return getColor(interval.condition)
    }
    return getColor(conditions.default)
}
