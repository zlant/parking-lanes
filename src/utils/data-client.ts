import axios from 'axios'
import { OverpassTurboRawResponse, OverpassTurboResponse } from './interfaces';

export const osmData: OverpassTurboResponse = {
    ways: {},
    nodes: {},
    waysInRelation: {},
}

let lastBounds: L.LatLngBounds | undefined;

/**
 * Get OSM data within specified bounds
 * @throws {Error} Throws error when HTTP request fails (eg. HTTP 429 when too many requests)
 * @param bounds Which area do we search, to check if we've already searched here
 * @param url Overpass Turbo request URL
 * @returns Object containing nodes, ways and ways in relation
 */
export async function downloadBbox(bounds: L.LatLngBounds, url: string): Promise<OverpassTurboResponse | null> {
    if (lastBounds !== undefined && withinLastBounds(bounds, lastBounds))
        return null

    lastBounds = bounds

    // This may throw - if it does we handle in calling function
    const osmResp: OverpassTurboRawResponse = await downloadContent(url)

    const newData = parseOsmResp(osmResp)

    if (newData) {
        Object.assign(osmData.nodes, newData.nodes)
        Object.assign(osmData.ways, newData.ways)
        Object.assign(osmData.waysInRelation, newData.waysInRelation)
    }

    return newData
}

/** Check if the new bounds (lat/lng + zoom) is contained within the old bounds */
function withinLastBounds(newBounds: L.LatLngBounds, oldBounds: L.LatLngBounds) {
    return newBounds.getWest() > oldBounds.getWest() && newBounds.getSouth() > oldBounds.getSouth() &&
        newBounds.getEast() < oldBounds.getEast() && newBounds.getNorth() < oldBounds.getNorth()
}

export function resetLastBounds() {
    lastBounds = undefined;
}

/**
 * Make a GET request to the specified URL.
 * @throws {Error}
 */
async function downloadContent(url: string): Promise<any> {
    const resp = await axios.get(url, {
        headers: {
            Accept: 'application/json',
        },
    })
    return resp.data
}

function parseOsmResp(osmResp: OverpassTurboRawResponse): OverpassTurboResponse {
    const newData: OverpassTurboResponse = {
        ways: {},
        nodes: {},
        waysInRelation: {},
    }

    for (const el of osmResp.elements) {
        switch (el.type) {
            case 'node':
                newData.nodes[el.id] = [el.lat, el.lon]
                break

            case 'way':
                newData.ways[el.id] = el
                break

            case 'relation':
                for (const member of el.members) {
                    if (member.type === 'way' && newData.ways[member.ref])
                        newData.waysInRelation[member.ref] = true
                }
                break

            default:
                // This shouldn't happen, but in case.
                // @ts-ignore
                throw new Error('Not supported osm type ' + el.type)
        }
    }
    return newData
}
