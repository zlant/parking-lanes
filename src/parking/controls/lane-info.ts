import L, { type LatLngLiteral } from 'leaflet'
import { hyper } from 'hyperhtml/esm'
import { handleJosmLinkClick } from '../..//utils/josm'
import { idEditorUrl, josmUrl, mapillaryUrl, overpassDeUrl } from '../../utils/links'
import { getLaneEditForm, setOsmChangeListener } from './editor/editor-form'
import { type OsmTags, type OsmWay } from '../../utils/types/osm-data'

export default L.Control.extend({
    onAdd: () => hyper`
        <div id="lane-control"
             class="leaflet-control-layers control-padding"
             style="display: none"
             onmousedown=${L.DomEvent.stopPropagation}
             ondblclick=${L.DomEvent.stopPropagation}
             onpointerdown=${L.DomEvent.stopPropagation}
             onclick=${L.DomEvent.stopPropagation} />`,

    showLaneInfo(osm: OsmWay, mapCenter: LatLngLiteral) {
        const laneinfo = document.getElementById('lane-control')
        if (laneinfo === null)
            return

        laneinfo.appendChild(getPanel(osm, getLaneInfo(osm), mapCenter))
        laneinfo.style.display = 'block'
    },

    showEditForm(osm: OsmWay, waysInRelation: any, cutLaneListener: any, mapCenter: LatLngLiteral) {
        const laneinfo = document.getElementById('lane-control')
        if (laneinfo === null)
            return

        laneinfo.appendChild(getPanel(osm, getLaneEditForm(osm, waysInRelation, cutLaneListener), mapCenter))
        laneinfo.style.display = 'block'
    },

    setOsmChangeListener(listener: any) {
        setOsmChangeListener(listener)
        return this
    },

    closeLaneInfo() {
        const laneinfo = document.getElementById('lane-control')
        if (laneinfo === null)
            return

        laneinfo.style.display = 'none'
        laneinfo.innerHTML = ''
    },
})

function getPanel(osm: OsmWay, body: any, mapCenter: LatLngLiteral) {
    return hyper`
        <div>
            <div style="min-width:250px">
                View:${' '}
                <a href="https://openstreetmap.org/way/${osm.id}" target="_blank">OSM</a>,${' '}
                <a href="${mapillaryUrl(mapCenter)}" target="_blank">Mapillary</a>
                <span style="float:right">
                    Edit:${' '}
                    <a href="${josmUrl + overpassDeUrl + getWayWithRelationsOverpassQuery(osm.id).replace(/\s+/g, ' ')}"
                       target="_blank"
                       onclick=${handleJosmLinkClick}>Josm</a>,${' '}
                    <a href="${idEditorUrl({ osmObjectType: 'way', osmObjectId: osm.id })}"
                       target="_blank">iD</a>
                </span>
            </div>
            <hr>
            ${body}
        </div>`
}

function getWayWithRelationsOverpassQuery(wayId: number) {
    return `
        [out:xml];
        (
            way(id:${wayId});
            >;
            way(id:${wayId});
            <;
        );
        out meta;`
}

function getLaneInfo(osm: OsmWay) {
    return hyper`
        <div>
            ${getSideBlock(osm.tags, 'right')}
            ${getSideBlock(osm.tags, 'left')}
            ${getAllTagsBlock(osm.tags)}
        </div>`

    function getSideBlock(tags: OsmTags, side: string) {
        return hyper`
            <div class="tags-block ${'tags-block_' + side}">
                ${getParkingTagsBlock(osm.tags, side)}
            </div>`
    }

    function getParkingTagsBlock(tags: OsmTags, side: string) {
        const regex = new RegExp('^parking:.*(?:' + side + '|both)')

        const filteredTags = Object.keys(tags)
            .filter(tag => regex.test(tag))
            .map(tag => tag + ' = ' + tags[tag])

        return filteredTags.map(tag => hyper`<p class="tags-block__tag">${tag}</p>`)
    }
}

export function getAllTagsBlock(tags: OsmTags) {
    return hyper`
        <details class="all-tags">
            <summary class="all-tags__summary">All tags</summary>
            <table>
                ${Object.keys(tags).map(tag => hyper`
                    <tr class="${tag.startsWith('parking:') ? 'all-tags__tag--highlight' : ''}">
                        <td>${tag}</td>
                        <td>${tags[tag]}</td>
                    </tr>
                `)}
            </table>
        </details>`
}
