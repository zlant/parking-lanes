import { type OsmWay } from '../../../utils/types/osm-data'
import { type ParkingTagInfo } from '../../../utils/types/parking'
import { ConditionalInput } from './ConditionalInput'
import { SimpleTagInput } from './SimpleTagInput'
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { PresetSigns } from './PresetSigns'
import { parkingLaneTags } from './lane-tags'

export function SideGroup(props: {
    osm: OsmWay
    side: 'both' | 'left' | 'right'
    shown: boolean
    onChange: (key: string, value: string) => void
}) {
    return (
        <div id={props.side}
            className={`tags-block tags-block_${props.side}`}
            style={{ display: props.shown ? undefined : 'none' }} >
            <table className='tags-inputs-table'>
                <TagInputs
                    osm={props.osm}
                    side={props.side}
                    onChange={props.onChange} />
            </table>
        </div>
    )
}

function TagInputs(props: {
    osm: OsmWay
    side: 'both' | 'left' | 'right'
    onChange: (key: string, value: string) => void
}) {
    const unsupportedTags = Object.keys(props.osm.tags)
        .filter(x => x.startsWith('parking:'))
        .filter(x => x.includes(props.side))
        /* eslint-disable @typescript-eslint/indent */
        .map<ParkingTagInfo>(x => ({
            template: x.replace(props.side, '{side}'),
            checkForNeedShowing: (tags, side) => true,
        }))
        /* eslint-enable @typescript-eslint/indent */
        .filter(x => !parkingLaneTags.find(t => t.template === x.template))

    const inputs = parkingLaneTags.concat(unsupportedTags)
        .map(tagInfo => <TagInput key={tagInfo.template} osm={props.osm} side={props.side} tagInfo={tagInfo} onChange={props.onChange} />)

    return <tbody>{inputs}</tbody>
}

function TagInput(props: {
    osm: OsmWay
    side: 'both' | 'left' | 'right'
    tagInfo: ParkingTagInfo
    onChange: (key: string, value: string) => void
}) {
    const tag = props.tagInfo.template.replace('{side}', props.side)
    const label = props.tagInfo.template.startsWith('parking:{side}') ?
        props.tagInfo.template.replace('parking:{side}', '').slice(1) || props.side :
        tag
    const hide = !props.tagInfo.checkForNeedShowing(props.osm.tags, props.side)
    return tag.endsWith(':conditional') ?
        <ConditionalInput osm={props.osm} tag={tag} label={label} hide={hide} values={props.tagInfo.values} onChange={v => props.onChange(tag, v)} /> :
        <SimpleTagInput osm={props.osm} tag={tag} label={label} hide={hide} values={props.tagInfo.values} onChange={v => props.onChange(tag, v)} />
}
