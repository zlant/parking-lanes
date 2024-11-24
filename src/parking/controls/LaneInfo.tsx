import { handleJosmLinkClick } from '../..//utils/josm'
import { idEditorUrl, josmUrl, mapillaryUrl, overpassDeUrl } from '../../utils/links'
import { LaneEditForm } from './editor/EditorForm'
import { type OsmObject, type OsmTags, type OsmWay } from '../../utils/types/osm-data'
import { useAppStateStore } from '../state'
import { osmData } from '../../utils/data-client'

export function OsmObjectPanel(props: {
    onCutLane?: any
    onChange?: (way: OsmWay) => void
    onClose?: () => void
}) {
    const mapState = useAppStateStore(state => state.mapState)
    const selectedOsmObject = useAppStateStore(state => state.selectedOsmObject)
    const editorMode = useAppStateStore(state => state.editorMode)

    if (!selectedOsmObject)
        return null

    const isStreetParking = selectedOsmObject.tags.amenity !== 'parking' &&
        Object.keys(selectedOsmObject.tags).some(t => t.startsWith('parking:'))

    return (
        <div className='osm-entity'>
            <hr className='osm-entity__top-hr' />
            <div style={{
                minWidth: '250px',
                display: 'flex',
                justifyContent: 'space-between',
            }}>
                <span>
                    <span>View: </span>
                    <a href={`https://openstreetmap.org/way/${selectedOsmObject.id}`} target="_blank" rel="noreferrer">OSM</a><span>, </span>
                    <a href={`${mapillaryUrl(mapState!.center)}`} target="_blank" rel="noreferrer">Mapillary</a>
                </span>
                <span className='osm-entity__editors'>
                    <span>Edit: </span>
                    <a href={`${josmUrl + overpassDeUrl + getWayWithRelationsOverpassQuery(selectedOsmObject.id).replace(/\s+/g, ' ')}`}
                        target="_blank" rel="noreferrer"
                        // eslint-disable-next-line @typescript-eslint/no-misused-promises
                        onClick={(e) => handleJosmLinkClick(e.nativeEvent)}>Josm</a><span>, </span>
                    <a href={`${idEditorUrl({ osmObjectType: 'way', osmObjectId: selectedOsmObject.id })}`}
                        target="_blank" rel="noreferrer">iD</a>
                </span>
                <button className='osm-entity__close'
                    onClick={props.onClose}>
                    +
                </button>
            </div>
            <hr />
            {isStreetParking ?
                editorMode ?
                    <LaneEditForm osm={selectedOsmObject as OsmWay}
                        waysInRelation={osmData.waysInRelation}
                        onCutLane={props.onCutLane}
                        onChange={props.onChange!} /> :
                    <LaneInfo osm={selectedOsmObject as OsmWay} /> :
                <OsmObjectInfo osm={selectedOsmObject} />}
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

function OsmObjectInfo(props: { osm: OsmObject }) {
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
