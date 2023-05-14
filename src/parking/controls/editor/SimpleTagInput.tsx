import { type OsmWay } from '../../../utils/types/osm-data'
import { SelectInput } from './SelectInput'
import { TextInput } from './TextInput'

export function SimpleTagInput(props: {
    osm: OsmWay
    tag: string
    label: string
    hide: boolean
    values?: string[]
    onChange: (e: React.SyntheticEvent, way: OsmWay) => void
}) {
    const value = props.osm.tags[props.tag]

    return (
        <tr id={props.tag}
            style={{ display: props.hide && !value ? 'none' : undefined }}>
            <td><label title={props.tag}>{props.label}</label></td>
            <td>
                {
                    props.values ?
                        <SelectInput
                            tag={props.tag}
                            value={value}
                            values={props.values}
                            onChange={e => props.onChange(e, props.osm)} /> :
                        <TextInput
                            tag={props.tag}
                            value={value}
                            onChange={e => props.onChange(e, props.osm)} />
                }
            </td>
        </tr>
    )
}
