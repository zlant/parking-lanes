
// eslint-disable-next-line no-unused-vars
import L from 'leaflet'
import { overpassUrl, osmDevUrl } from '~/src/utils/links'

/**
 * @param {L.LatLngBounds} bounds
 * @param {boolean} editorMode
 * @param {boolean} useDevServer
 */
export function getUrl(bounds, editorMode, useDevServer) {
    if (useDevServer) {
        const bbox = [bounds.getWest(), bounds.getSouth(), bounds.getEast(), bounds.getNorth()].join(',')
        return osmDevUrl + '/api/0.6/map?bbox=' + bbox
    } else {
        const overpassQuery = editorMode ?
            getOverpassEditorQuery(bounds).replace(/\s+/g, ' ') :
            getOverpassViewerQuery(bounds).replace(/\s+/g, ' ')
        return overpassUrl + encodeURIComponent(overpassQuery)
    }
}

function getOverpassEditorQuery(bounds) {
    return `
        [out:json];
        (
            way[highway~"^motorway|trunk|primary|secondary|tertiary|unclassified|residential|service|living_street"][service!=parking_aisle](${convertBoundsToOverpassBbox(bounds)});
        )->.a;
        (
            .a;
            .a >;
            .a <;
        );
        out meta;`
}

function getOverpassViewerQuery(bounds) {
    return `
        [out:json];
        (
            way[highway][~"^parking:.*"~"."](${convertBoundsToOverpassBbox(bounds)});
        )->.a;
        (
            .a;
            .a >;
            .a <;
        );
        out meta;`
}

/** @param {L.LatLngBounds} bounds */
function convertBoundsToOverpassBbox(bounds) {
    return [bounds.getSouth(), bounds.getWest(), bounds.getNorth(), bounds.getEast()].join(',')
}
