import L from 'leaflet'
import { parseOpeningHourse, getOpeningHourseState } from '../utils/opening-hours'
import { legend } from './legend'
import { laneStyleByZoom as laneStyle } from './lane-styles'

import { ConditionColor, ConditionalParkingCondition, ParkingConditions } from '../utils/types/conditions'
import { OsmWay, OsmTags } from '../utils/types/osm-data'
import { ParkingLanes, Side } from '../utils/types/parking'
import { ParkingPolylineOptions } from '../utils/types/leaflet'
import { parseConditionalTag } from '../utils/conditional-tag'

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
        if (conditions.default != null || (conditions.conditionalValues && conditions.conditionalValues.length > 0)) {
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
        const leafletPolyline = createPolyline(polyline, undefined, 'right', way, 0, isMajor, zoom)
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
                lanes[id].options.conditions = conditions
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
            const leafletPolyline = createPolyline(polyline, undefined, 'right', newOsm, 0, isMajor, zoom)
            lanes[laneId] = leafletPolyline
            newLanes.push(leafletPolyline)
        }
    } else if (lanes['empty' + newOsm.id]) {
        lanes['empty' + newOsm.id].remove()
        delete lanes['empty' + newOsm.id]
    }

    return newLanes
}

function generateLaneId(osm: OsmWay, side?: 'left' | 'right', conditions?: ParkingConditions) {
    if (!conditions)
        return 'empty' + osm.id

    return side! + osm.id
}

function createPolyline(line: L.LatLngLiteral[], conditions: ParkingConditions | undefined, side: string, osm: OsmWay, offset: number, isMajor: boolean, zoom: number) {
    const polylineOptions: ParkingPolylineOptions = {
        color: getColor(conditions?.default),
        weight: isMajor ? laneStyle[zoom].weightMajor : laneStyle[zoom].weightMinor,
        offset: side === 'right' ? offset : -offset,
        conditions,
        osm,
        isMajor,
    }
    return L.polyline(line, polylineOptions)
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

function getConditions(side: 'left' | 'right', tags: OsmTags): ParkingConditions {
    const conditions: ParkingConditions = { conditionalValues: [], default: null }

    conditions.conditionalValues = parseConditionsByNewScheme(side, tags)
    if (conditions.conditionalValues.length > 0) {
        conditions.default = parseDefaultCondition(side, tags, 0)
    } else {
        conditions.conditionalValues = parseConditionsByOldScheme(side, tags)
        conditions.default = parseDefaultCondition(side, tags, conditions.conditionalValues.length)
    }
    return conditions
}

function parseDefaultCondition(side: string, tags: OsmTags, findedByOldSchemeIntervalsCount: number) {
    const sides = [side, 'both']

    const laneTag = sides.map(side => 'parking:lane:' + side).find(tag => tags[tag])
    const conditionTag = sides.map(side => 'parking:condition:' + side).find(tag => tags[tag])
    const defalutConditionTag = sides.map(side => 'parking:condition:' + side + ':default').find(tag => tags[tag])

    const tag = findedByOldSchemeIntervalsCount === 0 ?
        conditionTag ?? (laneTag && legend.some(x => x.condition === tags[laneTag]) ? laneTag : null) ?? defalutConditionTag :
        defalutConditionTag ?? laneTag
    const condition = tag ? tags[tag] : null
    const conditionInLegend = condition ? legend.some(x => x.condition === condition) : false

    if (conditionInLegend)
        return condition

    if (condition)
        return 'unsupported'

    if (!condition && laneTag &&
        ['parallel', 'diagonal', 'perpendicular', 'marked', 'yes'].includes(tags[laneTag]))
        return 'free'

    return null
}

function parseConditionsByNewScheme(side: string, tags: OsmTags) {
    const conditionalTag = [side, 'both']
        .map(side => 'parking:condition:' + side + ':conditional')
        .find(tag => tags[tag])

    if (!conditionalTag)
        return []

    const intervals: ConditionalParkingCondition[] = parseConditionalTag(tags[conditionalTag])
        .map(x => ({
            parkingCondition: x.value,
            condition: parseOpeningHourse(x.condition),
        }))

    return intervals
}

function parseConditionsByOldScheme(side: string, tags: OsmTags) {
    const conditionalParkingConditions: ConditionalParkingCondition[] = []
    const sides = ['both', side]

    for (let i = 1; i < 10; i++) {
        const index = i > 1 ? ':' + i : ''

        const laneTags = sides.map(side => 'parking:lane:' + side + index)
        const conditionTags = sides.map(side => 'parking:condition:' + side + index)
        const intervalTags = sides.map(side => 'parking:condition:' + side + index + ':time_interval')

        const conditionalParkingCondition: ConditionalParkingCondition = { parkingCondition: null, condition: null }

        for (let j = 0; j < sides.length; j++) {
            let tagValue = tags[laneTags[j]]
            if (tagValue && legend.findIndex(x => x.condition === tagValue) >= 0)
                conditionalParkingCondition.parkingCondition = tagValue

            tagValue = tags[conditionTags[j]]
            if (tagValue)
                conditionalParkingCondition.parkingCondition = tagValue

            tagValue = tags[intervalTags[j]]
            if (tagValue)
                conditionalParkingCondition.condition = parseOpeningHourse(tagValue)
        }

        if (i === 1 && conditionalParkingCondition.condition == null)
            break

        if (conditionalParkingCondition.parkingCondition)
            conditionalParkingConditions?.push(conditionalParkingCondition)
        else
            break
    }

    return conditionalParkingConditions
}

/** The time effects the current parking restrictions. Update colors based on this. */
export function updateLaneColorsByDate(lanes: ParkingLanes, datetime: Date): void {
    for (const lane in lanes) {
        const color = getColorByDate(lanes[lane].options.conditions, datetime)
        lanes[lane].setStyle({ color })
    }
}

function getColorByDate(parkingConditions: ParkingConditions, datetime: Date): ConditionColor | undefined {
    if (!parkingConditions)
        return 'black'

    // If conditions.intervals not defined, return the default color
    for (const conditionalValue of parkingConditions.conditionalValues ?? []) {
        if (conditionalValue.condition && getOpeningHourseState(conditionalValue.condition, datetime))
            return getColor(conditionalValue.parkingCondition)
    }
    return getColor(parkingConditions.default)
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
            // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
            {
                color: '#e66101',
                weight: (laneStyle[zoom].offsetMajor ?? 1) * n - 4,
                offset: (laneStyle[zoom].offsetMajor ?? 1) * n,
                opacity: 0.4,
            } as ParkingPolylineOptions),

        left: L.polyline(polyline,
            // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
            {
                color: '#5e3c99',
                weight: (laneStyle[zoom].offsetMajor ?? 0.5) * n - 4,
                offset: -(laneStyle[zoom].offsetMajor ?? 0.5) * n,
                opacity: 0.4,
            } as ParkingPolylineOptions),
    }
}
