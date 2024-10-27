import { type OsmWay } from '../../../utils/types/osm-data'
import { type TagValue } from '../../../utils/types/parking'
import { SelectInput } from './SelectInput'
import { TextInput } from './TextInput'

export function SimpleTagInput(props: {
    osm: OsmWay
    tag: string
    label: string
    hide: boolean
    values?: TagValue[]
    onChange: (value: string) => void
}) {
    const value = props.osm.tags[props.tag]

    const buttons = props.values
        ?.filter(v => v.imgSrc)
        .map(v =>
            <button type='button'
                key={v.value}
                title={v.value}
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    border: '2px solid',
                    borderRadius: 3,
                    padding: 0,
                    background: 'none',
                    cursor: 'pointer',
                    borderColor: v.value === value ? 'dodgerblue' : 'transparent',
                }}
                onClick={e => props.onChange(v.value)}>
                <img src={v.imgSrc}
                    height="15"
                    alt={v.value} />
            </button>)

    return (
        <tr id={props.tag}
            style={{ display: props.hide && !value ? 'none' : undefined }}>
            <td><label title={props.tag}>{props.label}</label></td>
            <td style={{
                display: 'flex',
                alignItems: 'center',
                gap: 3,
            }}>
                {
                    props.values ?
                        <SelectInput
                            tag={props.tag}
                            value={value}
                            values={props.values}
                            onChange={e => props.onChange(e)} /> :
                        <TextInput
                            tag={props.tag}
                            value={value}
                            onChange={e => props.onChange(e)} />
                }
                {buttons}
            </td>
        </tr>
    )
}
