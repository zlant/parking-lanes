import L from 'leaflet'
import { hyper } from 'hyperhtml/esm'
import { idUrl } from '../../utils/links'
import { OsmWay } from '../../utils/types/osm-data'

export default L.Control.extend({
    onAdd: () => hyper`
        <div id="area-control"
             class="leaflet-control-layers control-padding"
             style="display: none"
             onmousedown=${L.DomEvent.stopPropagation}
             ondblclick=${L.DomEvent.stopPropagation}
             onpointerdown=${L.DomEvent.stopPropagation}
             onclick=${L.DomEvent.stopPropagation} />`,

    showAreaInfo(osm: OsmWay) {
        const areainfo = document.getElementById('area-control')
        if (areainfo === null)
            return

        areainfo.appendChild(getPanel(osm, getAreaInfo(osm)))
        areainfo.style.display = 'block'
    },

    closeAreaInfo() {
        const areainfo = document.getElementById('area-control')
        if (areainfo === null)
            return

        areainfo.style.display = 'none'
        areainfo.innerHTML = ''
    },
})

function getPanel(osm: OsmWay, body: any) {
    return hyper`
        <div>
            <div style="min-width:250px">
                <a href="https://openstreetmap.org/way/${osm.id}" target="_blank">View in OSM</a>
                <span style="float:right">
                    Edit:
                    <a href="${idUrl + '&way=' + osm.id}"
                       target="_blank">iD</a>
                </span>
            </div>
            <hr>
            ${body}
        </div>`
}

export function getAreaInfo(osm: OsmWay) {
    return hyper`
        <table>
            ${Object.keys(osm.tags).map(tag => hyper`
                <tr>
                    <td>${tag}</td>
                    <td>${osm.tags[tag]}</td>
                </tr>
            `)}
        </table>`
}
