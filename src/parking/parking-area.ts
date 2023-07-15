import L from 'leaflet'
import { type ParkingConditions } from '../utils/types/conditions'
import { type ParkingPolylineOptions } from '../utils/types/leaflet'
import { type OsmRelation, type OsmWay } from '../utils/types/osm-data'
import { type ParkingAreas } from '../utils/types/parking'
import { getConditions } from './access-condition'
import { getColor, getColorByDate } from './condition-color'

export function parseParkingArea(
    way: OsmWay,
    nodes: Record<number, number[]>,
    zoom: number,
    editorMode: boolean): ParkingAreas | undefined {
    const polylineNodes = way.nodes.map(x => nodes[x])
    const polyline: L.LatLngLiteral[] = polylineNodes.map((node) => ({ lat: node[0], lng: node[1] }))

    const areas: ParkingAreas = {}

    const conditions = getConditions(way.tags)
    const leafletPolygon = createPolygon(polyline, conditions, way, zoom)
    areas[way.type + way.id] = leafletPolygon

    return areas
}

export function parseParkingRelation(
    relation: OsmRelation,
    nodes: Record<number, number[]>,
    ways: Record<number, OsmWay>,
    zoom: number,
    editorMode: boolean): ParkingAreas | undefined {
    const wayGroups: OsmWay[][] = []
    for (const member of relation.members) {
        if (member.type === 'way' && member.role === 'outer') {
            const way = ways[member.ref]
            const group = wayGroups.find(g => g.some(w =>
                w.nodes[0] === way.nodes[0] ||
                w.nodes[0] === way.nodes.at(-1) ||
                w.nodes.at(-1) === way.nodes[0] ||
                w.nodes.at(-1) === way.nodes.at(-1)))

            if (group)
                group.push(way)
            else
                wayGroups.push([way])
        }
    }

    const nodeGroups: number[][] = []
    if (wayGroups.length) {
        for (const wayGroup of wayGroups) {
            const nodeGroup = wayGroup[0].nodes
            wayGroup.splice(0, 1)

            while (wayGroup.length) {
                const lastNode = nodeGroup.at(-1)
                const newWayIndex = wayGroup.findIndex(w =>
                    w.nodes[0] === lastNode ||
                    w.nodes.at(-1) === lastNode)
                if (newWayIndex === -1)
                    break
                const newNodes = wayGroup[newWayIndex].nodes
                if (newNodes[0] !== lastNode)
                    newNodes.reverse()
                nodeGroup.push(...newNodes.slice(1))
                wayGroup.splice(newWayIndex, 1)
            }

            if (nodeGroup[0] === nodeGroup.at(-1))
                nodeGroups.push(nodeGroup)
        }
    }

    const polylineNodes = nodeGroups.map(g => g.map(x => nodes[x]))
    const polyline: L.LatLngLiteral[][] = polylineNodes.map(g => g.map((node) => ({ lat: node[0], lng: node[1] })))

    const areas: ParkingAreas = {}

    const conditions = getConditions(relation.tags)
    const leafletPolygon = createPolygon(polyline, conditions, relation, zoom)
    areas[relation.type + relation.id] = leafletPolygon

    return areas
}

export function updateAreaColorsByDate(areas: ParkingAreas, datetime: Date): void {
    for (const area in areas) {
        const color = getColorByDate(areas[area].options.conditions, datetime)
        areas[area].setStyle({ color })
    }
}

function createPolygon(line: L.LatLngLiteral[] | L.LatLngLiteral[][], conditions: ParkingConditions | undefined, osm: OsmWay | OsmRelation, zoom: number) {
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
