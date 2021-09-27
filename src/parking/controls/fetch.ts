import L from 'leaflet'
import { hyper } from 'hyperhtml/esm'
import { OsmDataSource } from '../../utils/types/osm-data'

export default L.Control.extend({
    onAdd: (map: L.Map, initDataSource: OsmDataSource) => hyper`
        <div class="leaflet-control-layers control-padding control-bigfont control-button">
            <div id="download-btn">
                Fetch parking data
            </div>
            <select id="data-source-select">
                <option value="${OsmDataSource.OverpassTurbo}" selected="${initDataSource === OsmDataSource.OverpassTurbo}">From overpass-turbo</option>
                <option value="${OsmDataSource.OsmOrg}" selected="${initDataSource === OsmDataSource.OsmOrg}">From osm.org</option>
            </select>
        </div>`,

    setFetchDataBtnClickListener(listener: any) {
        document.getElementById('download-btn')!.onclick = listener
        return this
    },

    setDataSource(dataSource: OsmDataSource) {
        (document.getElementById('data-source-select') as HTMLSelectElement).value = dataSource.toString()
        return this
    },

    setDataSourceChangeListener(listener: any) {
        document.getElementById('data-source-select')!.onchange =
            (e: Event | any) => listener(parseInt(e.target.value))

        return this
    },
})
