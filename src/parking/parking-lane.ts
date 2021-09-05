import L from 'leaflet'
import { parseOpeningHourse, getOpeningHourseState } from '../utils/opening-hours'
import { legend } from './legend'
import { laneStyleByZoom as laneStyle } from './lane-styles'
import {ConditionsInterface} from '../utils/interfaces';

const highwayRegex = /'^motorway|trunk|primary|secondary|tertiary|unclassified|residential|service|living_street'/

export function parseParkingLane(way: any, nodes: Object, zoom: number, editorMode: boolean) {
    const isMajor = wayIsMajor(way.tags)

    if (typeof isMajor !== 'boolean') {
        return
    }

    // @ts-ignore
    const polyline = way.nodes.map(x => nodes[x])
    let emptyway = true

    const lanes = {}

    for (const side of ['right', 'left']) {
        const conditions = getConditions(side, way.tags)
        if (conditions.default != null || conditions.intervals.length > 0) {
            const laneId = generateLaneId(way, side, conditions)
            // @ts-ignore
            const leafletPolyline = createPolyline(polyline, conditions, side, way, isMajor ? laneStyle[zoom].offsetMajor : laneStyle[zoom].offsetMinor, isMajor, zoom)
            // @ts-ignore
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
        // @ts-ignore
        lanes[laneId] = leafletPolyline
    }

    return lanes
}

export function parseChangedParkingLane(newOsm: any, lanes: any[], datetime: Date, zoom:Number) {
    // @ts-ignore
    const lane = lanes['right' + newOsm.id] || lanes['left' + newOsm.id] || lanes['empty' + newOsm.id]
    const polyline = lane.getLatLngs()
    let emptyway = true

    const newLanes = []

    for (const side of ['right', 'left']) {
        const conditions = getConditions(side, newOsm.tags)
        const id = side + newOsm.id
        if (conditions.default != null) {
            // @ts-ignore
            if (lanes[id]) {
                // @ts-ignore
                lanes[id].conditions = conditions
                // @ts-ignore
                lanes[id].setStyle({ color: getColorByDate(conditions, datetime) })
            } else {
                const isMajor = wayIsMajor(newOsm.tags)
                const laneId = generateLaneId(newOsm, side, conditions)
                // @ts-ignore
                const leafletPolyline = createPolyline(polyline, conditions, side, newOsm, isMajor ? laneStyle[zoom].offsetMajor : laneStyle[zoom].offsetMinor, isMajor, zoom)
                lanes[laneId] = leafletPolyline
                newLanes.push(leafletPolyline)
            }
            emptyway = false
            // @ts-ignore
        } else if (lanes[id]) {
            // @ts-ignore
            lanes[id].remove()
            // @ts-ignore
            delete lanes[id]
        }
    }

    if (emptyway) {
        // @ts-ignore
        if (!lanes['empty' + newOsm.id]) {
            const isMajor = wayIsMajor(newOsm.tags)
            const laneId = generateLaneId(newOsm)
            // @ts-ignore
            const leafletPolyline = createPolyline(polyline, {}, 'right', newOsm, 0, isMajor, zoom)
            lanes[laneId] = leafletPolyline
            newLanes.push(leafletPolyline)
        }
    // @ts-ignore
    } else if (lanes['empty' + newOsm.id]) {
        // @ts-ignore
        lanes['empty' + newOsm.id].remove()
        // @ts-ignore
        delete lanes['empty' + newOsm.id]
    }

    return newLanes
}

function generateLaneId(osm: any, side?: any, conditions?: any) {
    if (!conditions)
        return 'empty' + osm.id

    return side + osm.id
}

function createPolyline(line:L.LatLngExpression[], conditions: Object, side: string, osm: any, offset: number, isMajor:boolean, zoom: number) {
    return L.polyline(line,
        {
            // @ts-ignore
            color: getColor(conditions?.default),
            weight: isMajor ? laneStyle[zoom].weightMajor : laneStyle[zoom].weightMinor,
            // @ts-ignore
            offset: side === 'right' ? offset : -offset,
            conditions: conditions,
            osm: osm,
            isMajor: isMajor,
        })
}

function getColor(condition: string) {
    if (!condition) {
        return undefined;
    }

    for (const element of legend) {
        if (condition === element.condition)
            return element.color
    }
}

function wayIsMajor(tags: Object) {
    // @ts-ignore
    if (tags.highway) {
        // @ts-ignore
        if (tags.highway.search(/^motorway|trunk|primary|secondary|tertiary|unclassified|residential/) >= 0)
            return true
        else
            return false
    }
}


function getConditions(side: any, tags: Object): ConditionsInterface {
    const conditions = { intervals: [], default: null }
    const sides = ['both', side]

    const defaultTags = sides.map(side => 'parking:condition:' + side + ':default')
        .concat(sides.map(side => 'parking:lane:' + side))

    let findResult: any;
    for (const tag of defaultTags) {
        // @ts-ignore
        findResult = tags[tag];
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
            // @ts-ignore
            findResult = tags[laneTags[j]]
            if (findResult && legend.findIndex(x => x.condition === findResult) >= 0) {
                // @ts-ignore
                cond.condition = findResult
            }

            // @ts-ignore
            findResult = tags[conditionTags[j]]
            if (findResult) {
                // @ts-ignore
                cond.condition = findResult
            }

            // @ts-ignore
            findResult = tags[intervalTags[j]]
            if (findResult) {
                // @ts-ignore
                cond.interval = parseOpeningHourse(findResult)
            }
        }

        // @ts-ignore
        if (i === 1 && cond.interval == null) {
            if ('condition' in cond)
                // @ts-ignore
                conditions.default = cond.condition;

            break
        }

        if ('condition' in cond)
            // @ts-ignore
            conditions.intervals[i - 1] = cond
        else
            break
    }

    if (legend.findIndex(x => x.condition === conditions.default) === -1)
        conditions.default = null

    return conditions
}

export function updateLaneColorsByDate(lanes: any, datetime: Date) {
    for (const lane in lanes)
        lanes[lane].setStyle({ color: getColorByDate(lanes[lane].options.conditions, datetime) })
}

function getColorByDate(conditions: ConditionsInterface, datetime: Date) {
    if (!conditions)
        return 'black'

    for (const interval of conditions.intervals) {
        if (interval.interval && getOpeningHourseState(interval.interval, datetime))
            return getColor(interval.condition)
    }
    return getColor(conditions.default)
}

export function updateLaneStylesByZoom(lanes: any, zoom: number) {
    for (const lane in lanes) {
        if (lane === 'right' || lane === 'left' || lane.startsWith('empty')) {
            continue
        }

        const sideOffset = lanes[lane].options.offset > 0 ? 1 : -1
        const isMajor = lanes[lane].options.isMajor
        const offset = isMajor ? laneStyle[zoom].offsetMajor : laneStyle[zoom].offsetMinor
        const weight = isMajor ? laneStyle[zoom].weightMajor : laneStyle[zoom].weightMinor
        
        if(offset !== undefined) {
            if(lanes[lane] !== undefined && lanes[lane].setOffset) {
                lanes[lane].setOffset(sideOffset * offset)
                lanes[lane].setStyle({ weight })
            } else {
                console.error(`lanes[${lane}] is bad`)
                console.log(lanes[lane])
            }
        } else {
            console.error("Offset is undefined!")
        }

    }
}

export function getBacklights(polyline: L.LatLngExpression[], zoom: Number) {
    const n = 3

    return {
        right: L.polyline(polyline,
            {
                color: 'fuchsia',
                // @ts-ignore
                weight: laneStyle[zoom].offsetMajor * n - 4,
                // @ts-ignore
                offset: laneStyle[zoom].offsetMajor * n,
                opacity: 0.4,
            }),

        left: L.polyline(polyline,
            {
                color: 'cyan',
                // @ts-ignore
                weight: laneStyle[zoom].offsetMajor * n - 4,
                // @ts-ignore
                offset: -laneStyle[zoom].offsetMajor * n,
                opacity: 0.4,
            }),
    }
}
