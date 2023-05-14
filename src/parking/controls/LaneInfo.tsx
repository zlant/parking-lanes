import { type Root, createRoot } from 'react-dom/client'
import L, { type LatLngLiteral } from 'leaflet'
import { handleJosmLinkClick } from '../..//utils/josm'
import { idEditorUrl, josmUrl, mapillaryUrl, overpassDeUrl } from '../../utils/links'
import { LaneEditForm } from './editor/EditorForm'
import { type OsmTags, type OsmWay } from '../../utils/types/osm-data'

export default L.Control.extend({
    reactRoot: null as Root | null,

    onAdd: () => {
        const panel = document.createElement('div')
        panel.id = 'lane-control'
        panel.className = 'leaflet-control-layers control-padding'
        panel.style.display = 'none'
        panel.onmousedown = L.DomEvent.stopPropagation
        panel.ondblclick = L.DomEvent.stopPropagation
        panel.onpointerdown = L.DomEvent.stopPropagation
        panel.onclick = L.DomEvent.stopPropagation
        return panel
    },

    showLaneInfo(osm: OsmWay, mapCenter: LatLngLiteral) {
        const laneinfo = document.getElementById('lane-control')
        if (laneinfo === null)
            return

        this.reactRoot = createRoot(laneinfo)
        this.reactRoot.render(
            <Panel osm={osm}
                mapCenter={mapCenter} />)
        laneinfo.style.display = 'block'
    },

    showEditForm(osm: OsmWay, waysInRelation: any, cutLaneListener: (way: OsmWay) => void, mapCenter: LatLngLiteral, osmChangeListener: (way: OsmWay) => void) {
        const laneinfo = document.getElementById('lane-control')
        if (laneinfo === null)
            return

        this.reactRoot = createRoot(laneinfo)
        this.reactRoot.render(
            <Panel osm={osm}
                mapCenter={mapCenter}
                waysInRelation={waysInRelation}
                onCutLane={cutLaneListener}
                onChange={osmChangeListener} />)
        laneinfo.style.display = 'block'
    },

    closeLaneInfo() {
        const laneinfo = document.getElementById('lane-control')
        if (laneinfo === null)
            return

        this.reactRoot?.unmount()
        laneinfo.style.display = 'none'
        laneinfo.innerHTML = ''
    },
})

function Panel(props: {
    osm: OsmWay
    mapCenter: LatLngLiteral
    waysInRelation?: any
    onCutLane?: any
    onChange?: (way: OsmWay) => void
}) {
    return (
        <div>
            <div style={{
                minWidth: '250px',
                display: 'flex',
                justifyContent: 'space-between',
            }}>
                <span>
                    <span>View: </span>
                    <a href={`https://openstreetmap.org/way/${props.osm.id}`} target="_blank" rel="noreferrer">OSM</a><span>, </span>
                    <a href={`${mapillaryUrl(props.mapCenter)}`} target="_blank" rel="noreferrer">Mapillary</a>
                </span>
                <span>
                    <span>Edit: </span>
                    <a href={`${josmUrl + overpassDeUrl + getWayWithRelationsOverpassQuery(props.osm.id).replace(/\s+/g, ' ')}`}
                        target="_blank" rel="noreferrer"
                        // eslint-disable-next-line @typescript-eslint/no-misused-promises
                        onClick={(e) => handleJosmLinkClick(e.nativeEvent)}>Josm</a><span>, </span>
                    <a href={`${idEditorUrl({ osmObjectType: 'way', osmObjectId: props.osm.id })}`}
                        target="_blank" rel="noreferrer">iD</a>
                </span>
            </div>
            <hr />
            {props.waysInRelation ?
                <LaneEditForm osm={props.osm}
                    waysInRelation={props.waysInRelation}
                    onCutLane={props.onCutLane}
                    onChange={props.onChange!} /> :
                <LaneInfo osm={props.osm} />}
        </div>
    )
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

function LaneInfo(props: { osm: OsmWay }) {
    return (
        <div>
            <SideBlock tags={props.osm.tags} side="right" />
            <SideBlock tags={props.osm.tags} side="left" />
            <AllTagsBlock tags={props.osm.tags} />
        </div>
    )
}

function SideBlock(props: {
    tags: OsmTags
    side: 'right' | 'left'
}) {
    const regex = new RegExp('^parking:.*(?:' + props.side + '|both)')

    const filteredTags = Object.keys(props.tags)
        .filter(tag => regex.test(tag))
        .map(tag => tag + ' = ' + props.tags[tag])
        .map(tag => <p key={tag} className="tags-block__tag">{tag}</p>)

    return (
        <div className={`tags-block tags-block_${props.side}`}>
            {filteredTags}
        </div>
    )
}

export function AllTagsBlock(props: { tags: OsmTags }) {
    return (
        <details className="all-tags">
            <summary className="all-tags__summary">All tags</summary>
            <table>
                <tbody>
                    {Object.keys(props.tags).map(tag => (
                        <tr key={tag}
                            className={tag.startsWith('parking:') ? 'all-tags__tag--highlight' : ''}>
                            <td>{tag}</td>
                            <td>{props.tags[tag]}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </details>
    )
}
