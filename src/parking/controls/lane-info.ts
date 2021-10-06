import L from 'leaflet'
import { hyper } from 'hyperhtml/esm'
import { handleJosmLinkClick } from '../..//utils/josm'
import { idUrl, josmUrl, overpassUrl } from '../../utils/links'
import { getLaneEditForm, setOsmChangeListener } from './editor/editor-form'
import { OsmTags, OsmWay } from '../../utils/types/osm-data'

export default L.Control.extend({
    onAdd: (map: L.Map) => hyper`
        <div id="lane-control"
             class="leaflet-control-layers control-padding"
             style="display: none"
             onmousedown=${L.DomEvent.stopPropagation}
             ondblclick=${L.DomEvent.stopPropagation}
             onpointerdown=${L.DomEvent.stopPropagation}
             onclick=${L.DomEvent.stopPropagation} />`,

    showLaneInfo(osm: OsmWay) {
        const laneinfo = document.getElementById('lane-control')
        if (laneinfo === null)
            return

        laneinfo.appendChild(getPanel(osm, getLaneInfo(osm)))
        laneinfo.style.display = 'block'
    },

    showEditForm(osm: OsmWay, waysInRelation: any, cutLaneListener: any) {
        const laneinfo = document.getElementById('lane-control')
        if (laneinfo === null)
            return

        laneinfo.appendChild(getPanel(osm, getLaneEditForm(osm, waysInRelation, cutLaneListener)))
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

function getPanel(osm: OsmWay, body: any) {
    return hyper`
        <div>
            <div style="min-width:250px">
                <a href="https://openstreetmap.org/way/${osm.id}" target="_blank">View in OSM</a>
                <span style="float:right">
                    Edit: 
                    <a href="${josmUrl + overpassUrl + getWayWithRelationsOverpassQuery(osm.id).replace(/\s+/g, ' ')}" 
                       target="_blank"
                       onclick=${handleJosmLinkClick}>Josm</a>,
                    <a href="${idUrl + '&way=' + osm.id}" 
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
        </div>`

    function getSideBlock(tags: OsmTags, side: string) {
        return hyper`
            <div class="tags-block ${'tags-block_' + side}">
                ${getParkingTagsBlock(osm.tags, side)}
                ${getAllTagsBlock(osm.tags, side)}
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

export function getAllTagsBlock(tags: OsmTags, side: string) {
    return hyper`
        <details class="tags-block__all-tags">
            <summary>All tags</summary>
            <table>
                ${Object.keys(tags).map(tag => hyper`
                    <tr class="${tag.startsWith('parking:') ? 'tags-block__all-tags--highlight' : ''}">
                        <td>${tag}</td>
                        <td>${tags[tag]}</td>
                    </tr>
                `)}
            </table>
        </details>`
}
