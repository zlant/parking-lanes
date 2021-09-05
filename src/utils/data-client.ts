import axios from 'axios'

export const osmData = {
    ways: {},
    nodes: {},
    waysInRelation: {},
}

let lastBounds: L.LatLngBounds | null;

export async function downloadBbox(bounds: L.LatLngBounds, url: string) {
    if (withinLastBounds(bounds))
        return null

    lastBounds = bounds

    const osmResp = await downloadContent(url)

    if (!osmResp)
        return null

    const newData = parseOsmResp(osmResp)

    if (newData) {
        Object.assign(osmData.nodes, newData.nodes)
        Object.assign(osmData.ways, newData.ways)
        Object.assign(osmData.waysInRelation, newData.waysInRelation)
    }

    return newData
}

function withinLastBounds(bounds: L.LatLngBounds) {
    if (lastBounds == null)
        return false

    return bounds.getWest() > lastBounds.getWest() && bounds.getSouth() > lastBounds.getSouth() &&
           bounds.getEast() < lastBounds.getEast() && bounds.getNorth() < lastBounds.getNorth()
}

export function resetLastBounds() {
    lastBounds = null
}

async function downloadContent(url: string) {
    try {
        const resp = await axios.get(url, {
            headers: {
                Accept: 'application/json',
            },
        })
        return resp.data
    } catch (err) {
        console.error(err)
        return null
    }
}

function parseOsmResp(osmResp: any) {
    const newData = {
        ways: {},
        nodes: {},
        waysInRelation: {},
    }

    for (const el of osmResp.elements) {
        switch (el.type) {
            case 'node':
                // @ts-ignore
                newData.nodes[el.id] = [el.lat, el.lon]
                break

            case 'way':
                // @ts-ignore
                newData.ways[el.id] = el
                break

            case 'relation':
                for (const member of el.members) {
                        // @ts-ignore
                    if (member.type === 'way' && newData.ways[member.ref])
                        // @ts-ignore
                        newData.waysInRelation[member.ref] = true
                }
                break

            default:
                throw new Error('Not supported osm type ' + el.type)
        }
    }

    return newData
}
