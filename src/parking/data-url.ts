import L from 'leaflet'
import { overpassDeUrl, overpassVkUrl, osmProdUrl, osmDevUrl } from '../utils/links'
import { OsmDataSource } from '../utils/types/osm-data'

/**
 * Get the API request URL
 */
export function getUrl(bounds: L.LatLngBounds, editorMode: boolean, useDevServer: boolean, source: OsmDataSource): string {
    if (editorMode || useDevServer || source === OsmDataSource.OsmOrg) {
        const bbox = [bounds.getWest(), bounds.getSouth(), bounds.getEast(), bounds.getNorth()].join(',')
        return (useDevServer ? osmDevUrl : osmProdUrl) + '/api/0.6/map?bbox=' + bbox
    } else {
        const overpassUrl = source === OsmDataSource.OverpassDe ?
            overpassDeUrl :
            overpassVkUrl
        const overpassQuery = getOverpassViewerQuery(bounds).replace(/\s+/g, ' ')
        return overpassUrl + encodeURIComponent(overpassQuery)
    }
}

function getOverpassViewerQuery(bounds: L.LatLngBounds) {
    return `
        [out:json];
        (
            way[highway][~"^parking:.*"~"."](${convertBoundsToOverpassBbox(bounds)});
            way[amenity=parking](${convertBoundsToOverpassBbox(bounds)});
        )->.a;
        (
            .a;
            .a >;
            .a <;
        );
        out meta;`
}

function convertBoundsToOverpassBbox(bounds: L.LatLngBounds) {
    return [bounds.getSouth(), bounds.getWest(), bounds.getNorth(), bounds.getEast()].join(',')
}
