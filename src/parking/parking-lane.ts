import L from 'leaflet'
import { parseOpeningHourse, getOpeningHourseState } from '../utils/opening-hours'
import { legend } from './legend'
import { laneStyleByZoom as laneStyle } from './lane-styles'

import { ConditionColor, ConditionsInterface } from '../utils/types/conditions'
import { OsmWay, OsmTags } from '../utils/types/osm-data'
import { ParkingLanes, Side } from '../utils/types/parking'
import { MyPolylineOptions } from '../utils/types/leaflet'

const highwayRegex = /^motorway|trunk|primary|secondary|tertiary|unclassified|residential|service|living_street/
const majorHighwayRegex = /^motorway|trunk|primary|secondary|tertiary|unclassified|residential/

export function parseParkingLane(
    way: OsmWay,
    nodes: { [key: number]: number[] },
    zoom: number,
    editorMode: boolean): ParkingLanes | undefined {
    const isMajor = wayIsMajor(way.tags)

    if (typeof isMajor !== 'boolean')
        return

    const polylineNodes = way.nodes.map(x => nodes[x])
    const polyline: L.LatLngLiteral[] = polylineNodes.map((node) => ({ lat: node[0], lng: node[1] }))

    let emptyway = true

    const lanes: ParkingLanes = {}

    for (const side of ['right', 'left'] as Side[]) {
        const conditions = getConditions(side, way.tags)
        if (conditions.default != null || (conditions.intervals && conditions.intervals.length > 0)) {
            const laneId = generateLaneId(way, side, conditions)
            const offset: number = isMajor ?
                laneStyle[zoom].offsetMajor as number :
                laneStyle[zoom].offsetMinor as number
            const leafletPolyline = createPolyline(polyline, conditions, side, way, offset, isMajor, zoom)
            lanes[laneId] = leafletPolyline
            emptyway = false
        }
    }
    if (editorMode &&
        emptyway &&
        way.tags.highway &&
        highwayRegex.test(way.tags.highway)) {
        const laneId = generateLaneId(way)
        const leafletPolyline = createPolyline(polyline, {}, 'right', way, 0, isMajor, zoom)
        lanes[laneId] = leafletPolyline
    }

    return lanes
}

export function parseChangedParkingLane(newOsm: OsmWay, lanes: ParkingLanes, datetime: Date, zoom: number): L.Polyline[] {
    const lane = lanes['right' + newOsm.id] || lanes['left' + newOsm.id] || lanes['empty' + newOsm.id]
    const polyline = lane.getLatLngs()
    let emptyway = true

    const newLanes: L.Polyline[] = []

    for (const side of ['right', 'left'] as Side[]) {
        const conditions = getConditions(side, newOsm.tags)
        const id = side + newOsm.id
        if (conditions.default != null) {
            if (lanes[id]) {
                lanes[id].conditions = conditions
                lanes[id].setStyle({ color: getColorByDate(conditions, datetime) })
            } else {
                const isMajor = wayIsMajor(newOsm.tags)
                const laneId = generateLaneId(newOsm, side, conditions)
                const leafletPolyline = createPolyline(polyline, conditions, side, newOsm, isMajor ? laneStyle[zoom].offsetMajor ?? 1 : laneStyle[zoom].offsetMinor ?? 0.5, isMajor, zoom)
                lanes[laneId] = leafletPolyline
                newLanes.push(leafletPolyline)
            }
            emptyway = false
        } else if (lanes[id]) {
            lanes[id].remove()
            delete lanes[id]
        }
    }

    if (emptyway) {
        if (!lanes['empty' + newOsm.id]) {
            const isMajor = wayIsMajor(newOsm.tags)
            const laneId = generateLaneId(newOsm)
            const leafletPolyline = createPolyline(polyline, {}, 'right', newOsm, 0, isMajor, zoom)
            lanes[laneId] = leafletPolyline
            newLanes.push(leafletPolyline)
        }
    } else if (lanes['empty' + newOsm.id]) {
        lanes['empty' + newOsm.id].remove()
        delete lanes['empty' + newOsm.id]
    }

    return newLanes
}

function generateLaneId(osm: OsmWay, side?: 'left' | 'right', conditions?: ConditionsInterface) {
    if (!conditions)
        return 'empty' + osm.id

    return side! + osm.id
}

function createPolyline(line: L.LatLngLiteral[], conditions: ConditionsInterface, side: string, osm: OsmWay, offset: number, isMajor: boolean, zoom: number) {
    return L.polyline(line,
        {
            color: getColor(conditions?.default),
            weight: isMajor ? laneStyle[zoom].weightMajor : laneStyle[zoom].weightMinor,
            offset: side === 'right' ? offset : -offset,
            conditions: conditions,
            osm: osm,
            isMajor: isMajor,
        } as MyPolylineOptions)
}

function getColor(condition: string | null | undefined): ConditionColor | undefined {
    if (!condition)
        return undefined

    for (const element of legend) {
        if (condition === element.condition)
            return element.color
    }
}

function wayIsMajor(tags: OsmTags) {
    return tags.highway.search(majorHighwayRegex) >= 0
}

function getConditions(side: 'left' | 'right', tags: { [key: string]: string }): ConditionsInterface {
    const conditions: ConditionsInterface = { intervals: [], default: null }
    const sides = ['both', side]

    const defaultTags = sides.map(side => 'parking:condition:' + side + ':default')
        .concat(sides.map(side => 'parking:lane:' + side))

    let findResult: string
    for (const tag of defaultTags) {
        findResult = tags[tag]
        if (findResult)
            conditions.default = findResult

        if (conditions.default)
            break
    }

    for (let i = 1; i < 10; i++) {
        const index = i > 1 ? ':' + i : ''

        const laneTags = sides.map(side => 'parking:lane:' + side + index)
        const conditionTags = sides.map(side => 'parking:condition:' + side + index)
        const intervalTags = sides.map(side => 'parking:condition:' + side + index + ':time_interval')

        const cond: any = {}

        for (let j = 0; j < sides.length; j++) {
            findResult = tags[laneTags[j]]
            if (findResult && legend.findIndex(x => x.condition === findResult) >= 0)
                cond.condition = findResult

            findResult = tags[conditionTags[j]]
            if (findResult)
                cond.condition = findResult

            findResult = tags[intervalTags[j]]
            if (findResult)
                cond.interval = parseOpeningHourse(findResult)
        }

        if (i === 1 && cond.interval == null) {
            if ('condition' in cond)
                conditions.default = cond.condition

            break
        }

        if ('condition' in cond)
            // @ts-expect-error
            conditions.intervals[i - 1] = cond
        else
            break
    }

    if (legend.findIndex(x => x.condition === conditions.default) === -1)
        conditions.default = null

    return conditions
}

/** The time effects the current parking restrictions. Update colors based on this. */
export function updateLaneColorsByDate(lanes: ParkingLanes, datetime: Date): void {
    for (const lane in lanes) {
        const color = getColorByDate(lanes[lane].options.conditions, datetime)
        lanes[lane].setStyle({ color })
    }
}

function getColorByDate(conditions: ConditionsInterface, datetime: Date): ConditionColor | undefined {
    // Is object empty?
    if (Object.keys(conditions).length === 0)
        return 'black'

    // If conditions.intervals not defined, return the default color
    for (const interval of conditions.intervals ?? []) {
        if (interval.interval && getOpeningHourseState(interval.interval, datetime))
            return getColor(interval.condition)
    }
    return getColor(conditions.default)
}

export function updateLaneStylesByZoom(lanes: ParkingLanes, zoom: number): void {
    for (const lane in lanes) {
        if (lane === 'right' || lane === 'left' || lane.startsWith('empty'))
            continue

        const sideOffset = lanes[lane].options.offset > 0 ? 1 : -1
        const isMajor = lanes[lane].options.isMajor
        const offset = isMajor ? laneStyle[zoom].offsetMajor : laneStyle[zoom].offsetMinor
        const weight = isMajor ? laneStyle[zoom].weightMajor : laneStyle[zoom].weightMinor

        if (offset !== undefined) {
            if (lanes[lane]?.setOffset) {
                lanes[lane].setOffset(sideOffset * offset)
                lanes[lane].setStyle({ weight })
            } else {
                console.error(`lanes[${lane}] is bad`)
                console.log(lanes[lane])
            }
        } else {
            console.error('Offset is undefined!')
        }
    }
}

export function getBacklights(polyline: L.LatLngExpression[], zoom: number): { right: L.Polyline, left: L.Polyline } {
    const n = 3

    return {
        right: L.polyline(polyline,
            {
                color: 'fuchsia',
                weight: (laneStyle[zoom].offsetMajor ?? 1) * n - 4,
                offset: (laneStyle[zoom].offsetMajor ?? 1) * n,
                opacity: 0.4,
            } as MyPolylineOptions),

        left: L.polyline(polyline,
            {
                color: 'cyan',
                weight: (laneStyle[zoom].offsetMajor ?? 0.5) * n - 4,
                offset: -(laneStyle[zoom].offsetMajor ?? 0.5) * n,
                opacity: 0.4,
            } as MyPolylineOptions),
    }
}
