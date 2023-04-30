import { type Root, createRoot } from 'react-dom/client'
import L from 'leaflet'
import { idEditorUrl } from '../../utils/links'
import { type OsmNode, type OsmRelation, type OsmWay } from '../../utils/types/osm-data'

export default L.Control.extend({
    reactRoot: null as Root | null,

    onAdd: () => {
        const panel = document.createElement('div')
        panel.id = 'area-control'
        panel.className = 'leaflet-control-layers control-padding'
        panel.style.display = 'none'
        panel.onmousedown = L.DomEvent.stopPropagation
        panel.ondblclick = L.DomEvent.stopPropagation
        panel.onpointerdown = L.DomEvent.stopPropagation
        panel.onclick = L.DomEvent.stopPropagation
        return panel
    },

    showAreaInfo(osm: OsmNode | OsmWay | OsmRelation) {
        const areainfo = document.getElementById('area-control')
        if (areainfo === null)
            return

        this.reactRoot = createRoot(areainfo)
        this.reactRoot.render(<Panel osm={osm} />)
        areainfo.style.display = 'block'
    },

    closeAreaInfo() {
        const areainfo = document.getElementById('area-control')
        if (areainfo === null)
            return

        this.reactRoot?.unmount()
        areainfo.style.display = 'none'
        areainfo.innerHTML = ''
    },
})

function Panel(props: { osm: OsmNode | OsmWay | OsmRelation }) {
    return (
        <div>
            <div style={{
                minWidth: '250px',
                display: 'flex',
                justifyContent: 'space-between',
            }}>
                <a href={`https://openstreetmap.org/${props.osm.type}/${props.osm.id}`} target="_blank" rel="noreferrer">View in OSM</a>
                <span>
                    <span>Edit: </span>
                    <a href={idEditorUrl({ osmObjectType: 'way', osmObjectId: props.osm.id })}
                        target="_blank" rel='noreferrer'>iD</a>
                </span>
            </div>
            <hr />
            <AreaInfo osm={props.osm} />
        </div>
    )
}

function AreaInfo(props: { osm: OsmNode | OsmWay | OsmRelation }) {
    return (
        <table>
            <tbody>
                {Object.keys(props.osm.tags).map(tag => (
                    <tr key={tag}>
                        <td>{tag}</td>
                        <td>{props.osm.tags[tag]}</td>
                    </tr>
                ))}
            </tbody>
        </table>
    )
}
