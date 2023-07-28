import { type ConditionalValue, parseConditionalTag } from '../../../utils/conditional-tag'
import { type OsmWay } from '../../../utils/types/osm-data'
import { SelectInput } from './SelectInput'
import { TextInput } from './TextInput'

export function ConditionalInput(props: {
    osm: OsmWay
    tag: string
    label: string
    hide: boolean
    values?: string[]
    onChange: (e: React.SyntheticEvent, way: OsmWay) => void
}) {
    const parsedConditionalTag = props.osm.tags[props.tag] ? parseConditionalTag(props.osm.tags[props.tag]) : []
    parsedConditionalTag.push({ value: '', condition: null })

    return (
        <tr id={props.tag}
            className="conditional-tag"
            style={{ display: props.hide ? 'none' : undefined }}>
            <td style={{ verticalAlign: 'top' }}>
                <label title={props.tag}>{props.label}</label>
            </td>
            <td>
                <table>
                    <tbody>
                        {parsedConditionalTag
                            .map((conditionalValue, i) =>
                                <ConditionalPartInput
                                    key={i}
                                    osm={props.osm}
                                    tag={props.tag}
                                    part={conditionalValue}
                                    partindex={i}
                                    values={props.values}
                                    onChange={props.onChange} />)
                        }
                    </tbody>
                </table>
            </td>
        </tr>
    )
}

function ConditionalPartInput(props: {
    osm: OsmWay
    tag: string
    part: ConditionalValue
    partindex: number
    values?: string[]
    onChange: (e: React.SyntheticEvent, way: OsmWay) => void
}) {
    return (
        <tr>
            <td>
                {
                    props.values ?
                        <SelectInput
                            tag={props.tag}
                            value={props.part.value}
                            values={props.values}
                            data-partindex={props.partindex.toString()}
                            data-tokenname="condition"
                            onChange={e => props.onChange(e, props.osm)} /> :
                        <TextInput
                            tag={props.tag}
                            value={props.part.value}
                            data-partindex={props.partindex.toString()}
                            data-tokenname="condition"
                            onChange={e => props.onChange(e, props.osm)} />
                }
            </td>
            <td>
                @
                <input type="text"
                    placeholder="time interval"
                    name={props.tag}
                    value={props.part.condition ?? undefined}
                    data-partindex={props.partindex.toString()}
                    data-tokenname="time_interval"
                    onInput={(e) => props.onChange(e, props.osm)} />
            </td>
        </tr>
    )
}
