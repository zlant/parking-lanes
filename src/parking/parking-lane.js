import L from 'leaflet'
import { parseOpeningHourse, getOpeningHourseState } from '~/src/utils/opening-hours'
import { legend } from './legend'
import { laneStyleByZoom as laneStyle } from './lane-styles'

const highwayRegex = /'^motorway|trunk|primary|secondary|tertiary|unclassified|residential|service|living_street'/

export function parseParkingLane(way, nodes, zoom, editorMode) {
    const isMajor = wayIsMajor(way.tags)

    if (typeof isMajor !== 'boolean')
        return

    const polyline = way.nodes.map(x => nodes[x])
    let emptyway = true

    const lanes = {}

    for (const side of ['right', 'left']) {
        const conditions = getConditions(side, way.tags)
        if (conditions.default != null || conditions.intervals.length > 0) {
            const laneId = generateLaneId(way, side, conditions)
            const leafletPolyline = createPolyline(polyline, conditions, side, way, isMajor ? laneStyle[zoom].offsetMajor : laneStyle[zoom].offsetMinor, isMajor, zoom)
            lanes[laneId] = leafletPolyline
            emptyway = false
        }
    }
    if (editorMode &&
        emptyway &&
        way.tags.highway &&
        highwayRegex.test(way.tags.highway)) {
        const laneId = generateLaneId(way)
        const leafletPolyline = createPolyline(polyline, null, 'right', way, 0, isMajor, zoom)
        lanes[laneId] = leafletPolyline
    }

    return lanes
}

export function parseChangedParkingLane(newOsm, lanes, datetime, zoom) {
    const lane = lanes['right' + newOsm.id] || lanes['left' + newOsm.id] || lanes['empty' + newOsm.id]
    const polyline = lane.getLatLngs()
    let emptyway = true

    const newLanes = []

    for (const side of ['right', 'left']) {
        const conditions = getConditions(side, newOsm.tags)
        const id = side + newOsm.id
        if (conditions.default != null) {
            if (lanes[id]) {
                lanes[id].conditions = conditions
                lanes[id].setStyle({ color: getColorByDate(conditions, datetime) })
            } else {
                const isMajor = wayIsMajor(newOsm.tags)
                const laneId = generateLaneId(newOsm, side, conditions)
                const leafletPolyline = createPolyline(polyline, conditions, side, newOsm, isMajor ? laneStyle[zoom].offsetMajor : laneStyle[zoom].offsetMinor, isMajor, zoom)
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
            const leafletPolyline = createPolyline(polyline, null, 'right', newOsm, 0, isMajor, zoom)
            lanes[laneId] = leafletPolyline
            newLanes.push(leafletPolyline)
        }
    } else if (lanes['empty' + newOsm.id]) {
        lanes['empty' + newOsm.id].remove()
        delete lanes['empty' + newOsm.id]
    }

    return newLanes
}

function generateLaneId(osm, side, conditions) {
    if (!conditions)
        return 'empty' + osm.id

    return side + osm.id
}

function createPolyline(line, conditions, side, osm, offset, isMajor, zoom) {
    return L.polyline(line,
        {
            color: getColor(conditions?.default),
            weight: isMajor ? laneStyle[zoom].weightMajor : laneStyle[zoom].weightMinor,
            offset: side === 'right' ? offset : -offset,
            conditions: conditions,
            osm: osm,
            isMajor: isMajor,
        })
}

function getColor(condition) {
    if (!condition)
        return null

    for (const element of legend) {
        if (condition === element.condition)
            return element.color
    }
}

function wayIsMajor(tags) {
    if (tags.highway) {
        if (tags.highway.search(/^motorway|trunk|primary|secondary|tertiary|unclassified|residential/) >= 0)
            return true
        else
            return false
    }
}

function getConditions(side, tags) {
    const conditions = { intervals: [], default: null }
    const sides = ['both', side]

    const defaultTags = sides.map(side => 'parking:condition:' + side + ':default')
        .concat(sides.map(side => 'parking:lane:' + side))

    let findResult
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

        const cond = {}

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
            conditions.intervals[i - 1] = cond
        else
            break
    }

    if (legend.findIndex(x => x.condition === conditions.default) === -1)
        conditions.default = null

    return conditions
}

export function updateLaneColorsByDate(lanes, datetime) {
    for (const lane in lanes)
        lanes[lane].setStyle({ color: getColorByDate(lanes[lane].options.conditions, datetime) })
}

function getColorByDate(conditions, datetime) {
    if (!conditions)
        return 'black'

    for (const interval of conditions.intervals) {
        if (interval.interval && getOpeningHourseState(interval.interval, datetime))
            return getColor(interval.condition)
    }
    return getColor(conditions.default)
}

export function updateLaneStylesByZoom(lanes, zoom) {
    for (const lane in lanes) {
        if (lane === 'right' || lane === 'left' || lane.startsWith('empty'))
            continue

        const sideOffset = lanes[lane].options.offset > 0 ? 1 : -1
        const isMajor = lanes[lane].options.isMajor
        const offset = isMajor ? laneStyle[zoom].offsetMajor : laneStyle[zoom].offsetMinor
        const weight = isMajor ? laneStyle[zoom].weightMajor : laneStyle[zoom].weightMinor
        lanes[lane].setOffset(sideOffset * offset)
        lanes[lane].setStyle({ weight })
    }
}

export function getBacklights(polyline, zoom) {
    const n = 3

    return {
        right: L.polyline(polyline,
            {
                color: 'fuchsia',
                weight: laneStyle[zoom].offsetMajor * n - 4,
                offset: laneStyle[zoom].offsetMajor * n,
                opacity: 0.4,
            }),

        left: L.polyline(polyline,
            {
                color: 'cyan',
                weight: laneStyle[zoom].offsetMajor * n - 4,
                offset: -laneStyle[zoom].offsetMajor * n,
                opacity: 0.4,
            }),
    }
}
