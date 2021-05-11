import * as JXON from 'jxon'
import axios from 'axios'
import { overpassUrl, osmDevUrl } from './links'

export const cache = {
    ways: {},
    nodes: {},
    waysInRelation: {},
}

let lastBounds

export async function downloadBbox(bounds, editorMode, useDevServer) {
    if (withinLastBbox(bounds))
        return null

    lastBounds = bounds
    let newData = null

    const content = await downloadContent(getQueryUrl(bounds, editorMode, useDevServer))
    newData = parseContent(content)

    if (newData) {
        Object.assign(cache.nodes, newData.nodes)
        Object.assign(cache.ways, newData.ways)
        Object.assign(cache.waysInRelation, newData.waysInRelation)
    }

    return newData
}

function withinLastBbox(bounds) {
    if (lastBounds == null)
        return false

    return bounds.getWest() > lastBounds.getWest() && bounds.getSouth() > lastBounds.getSouth() &&
           bounds.getEast() < lastBounds.getEast() && bounds.getNorth() < lastBounds.getNorth()
}

function getQueryUrl(bounds, editorMode, useDevServer) {
    if (useDevServer) {
        const bbox = [bounds.getWest(), bounds.getSouth(), bounds.getEast(), bounds.getNorth()].join(',')
        return osmDevUrl + '/api/0.6/map?bbox=' + bbox
    } else {
        const bbox = [bounds.getSouth(), bounds.getWest(), bounds.getNorth(), bounds.getEast()].join(',')
        const overpassQuery = editorMode ?
            '[out:xml];(way[highway~"^motorway|trunk|primary|secondary|tertiary|unclassified|residential|service|living_street"][service!=parking_aisle](' + bbox + ');)->.a;(.a;.a >;.a <;);out meta;' :
            '[out:xml];(way[highway][~"^parking:.*"~"."](' + bbox + ');)->.a;(.a;.a >;.a <;);out meta;'
        return overpassUrl + encodeURIComponent(overpassQuery)
    }
}

async function downloadContent(url) {
    const resp = await axios.get(url, {
        headers: {
            Accept: 'application/xml',
        },
    })
    return JXON.stringToJs(resp.data)
}

function parseContent(content) {
    const newData = {
        ways: {},
        nodes: {},
        waysInRelation: {},
    }

    if (content.osm.node) {
        for (const obj of Array.isArray(content.osm.node) ? content.osm.node : [content.osm.node])
            newData.nodes[obj.$id] = [obj.$lat, obj.$lon]
    }

    if (content.osm.way) {
        content.osm.way = Array.isArray(content.osm.way) ? content.osm.way : [content.osm.way]
        for (const obj of content.osm.way.filter(x => x.tag != null)) {
            // parseWay(obj)
            newData.ways[obj.$id] = obj
        }
    }

    if (content.osm.relation) {
        content.osm.relation = Array.isArray(content.osm.relation) ? content.osm.relation : [content.osm.relation]
        for (const obj of content.osm.relation) {
            for (const member of Array.isArray(obj.member) ? obj.member : [obj.member]) {
                if (member.$type === 'way' && newData.ways[member.$ref])
                    newData.waysInRelation[member.$ref] = true
            }
        }
    }

    return newData
}
