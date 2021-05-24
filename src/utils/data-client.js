import * as JXON from 'jxon'
import axios from 'axios'

export const osmData = {
    ways: {},
    nodes: {},
    waysInRelation: {},
}

let lastBounds

export async function downloadBbox(bounds, url) {
    if (withinLastBounds(bounds))
        return null

    lastBounds = bounds

    const content = await downloadContent(url)

    if (!content)
        return null

    const newData = parseXml(content)

    if (newData) {
        Object.assign(osmData.nodes, newData.nodes)
        Object.assign(osmData.ways, newData.ways)
        Object.assign(osmData.waysInRelation, newData.waysInRelation)
    }

    return newData
}

function withinLastBounds(bounds) {
    if (lastBounds == null)
        return false

    return bounds.getWest() > lastBounds.getWest() && bounds.getSouth() > lastBounds.getSouth() &&
           bounds.getEast() < lastBounds.getEast() && bounds.getNorth() < lastBounds.getNorth()
}

export function resetLastBounds() {
    lastBounds = null
}

async function downloadContent(url) {
    try {
        const resp = await axios.get(url, {
            headers: {
                Accept: 'application/xml',
            },
        })
        return resp.data
    } catch (err) {
        console.error(err)
        return null
    }
}

function parseXml(xmlStr) {
    const xmlObj = JXON.stringToJs(xmlStr)

    const newData = {
        ways: {},
        nodes: {},
        waysInRelation: {},
    }

    if (xmlObj.osm.node) {
        for (const node of Array.isArray(xmlObj.osm.node) ? xmlObj.osm.node : [xmlObj.osm.node])
            newData.nodes[node.$id] = [node.$lat, node.$lon]
    }

    if (xmlObj.osm.way) {
        xmlObj.osm.way = Array.isArray(xmlObj.osm.way) ? xmlObj.osm.way : [xmlObj.osm.way]
        for (const way of xmlObj.osm.way.filter(x => x.tag != null))
            newData.ways[way.$id] = way
    }

    if (xmlObj.osm.relation) {
        xmlObj.osm.relation = Array.isArray(xmlObj.osm.relation) ? xmlObj.osm.relation : [xmlObj.osm.relation]
        for (const rel of xmlObj.osm.relation) {
            for (const member of Array.isArray(rel.member) ? rel.member : [rel.member]) {
                if (member.$type === 'way' && newData.ways[member.$ref])
                    newData.waysInRelation[member.$ref] = true
            }
        }
    }

    return newData
}
