import L from 'leaflet'
import { hyper } from 'hyperhtml/esm'
import { handleJosmLinkClick } from '~/src/utils/josm'
import { idUrl, josmUrl, overpassUrl } from '~/src/utils/links'
import { getLaneEditForm, setOsmChangeListener } from './editor/editor-form'

export default L.Control.extend({
    onAdd: map => hyper`
        <div id="lane-control"
             class="leaflet-control-layers control-padding"
             style="display: none"
             onmousedown=${L.DomEvent.stopPropagation}
             ondblclick=${L.DomEvent.stopPropagation}
             onpointerdown=${L.DomEvent.stopPropagation}
             onclick=${L.DomEvent.stopPropagation} />`,

    showLaneInfo(osm) {
        const laneinfo = document.getElementById('lane-control')
        laneinfo.appendChild(getPanel(osm, getLaneInfo(osm)))
        laneinfo.style.display = 'block'
    },

    showEditForm(osm, waysInRelation, cutLaneListener) {
        const laneinfo = document.getElementById('lane-control')
        laneinfo.appendChild(getPanel(osm, getLaneEditForm(osm, waysInRelation, cutLaneListener)))
        laneinfo.style.display = 'block'
    },

    setOsmChangeListener(listener) {
        setOsmChangeListener(listener)
        return this
    },

    closeLaneInfo() {
        const laneinfo = document.getElementById('lane-control')
        laneinfo.style.display = 'none'
        laneinfo.innerHTML = ''
    },
})

function getPanel(osm, body) {
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

function getWayWithRelationsOverpassQuery(wayId) {
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

function getLaneInfo(osm) {
    return hyper`
        <div>
            ${getTagsBlock(osm.tags, 'right')}
            ${getTagsBlock(osm.tags, 'left')}
        </div>`

    function getTagsBlock(tags, side) {
        const regex = new RegExp('^parking:.*(?:' + side + '|both)')

        const filteredTags = Object.keys(tags)
            .filter(tag => regex.test(tag))
            .map(tag => tag + ' = ' + tags[tag])

        return hyper`
            <div class="tags-block ${'tags-block_' + side}">
                ${filteredTags.map(tag => hyper`<p class="tags-block__tag">${tag}</p>`)}
            </div>`
    }
}
