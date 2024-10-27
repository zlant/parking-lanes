import { useState } from 'react'
import { type ConditionalValue, parseConditionalTag } from '../../../utils/conditional-tag'
import { type OsmWay } from '../../../utils/types/osm-data'
import { SelectInput } from './SelectInput'
import { TextInput } from './TextInput'
import { type TagValue } from '../../../utils/types/parking'

export function ConditionalInput(props: {
    osm: OsmWay
    tag: string
    label: string
    hide: boolean
    values?: TagValue[]
    onChange: (tagValue: string) => void
}) {
    const parsedConditionalTag = props.osm.tags[props.tag] ? parseConditionalTag(props.osm.tags[props.tag]) : []
    parsedConditionalTag.push({ value: '', condition: null })

    const buildTagValue = (newConditionalValue: ConditionalValue, index: number) => {
        return parsedConditionalTag
            .map((cv, i) => index === i ? newConditionalValue : cv)
            .filter(cv => cv.value && cv.condition)
            .map(cv => buildConditionalValue(cv.value, cv.condition))
            .join('; ')
    }

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
                            .map((conditionalValue, index) =>
                                <ConditionalPartInput
                                    key={index}
                                    tag={props.tag}
                                    part={conditionalValue}
                                    values={props.values}
                                    onChange={vp => props.onChange(buildTagValue(vp, index))} />)
                        }
                    </tbody>
                </table>
            </td>
        </tr>
    )

    function buildConditionalValue(value: string, condition: string | null) {
        return condition == null || condition === '' ? value : `${value} @ (${condition})`
    }
}

function ConditionalPartInput(props: {
    tag: string
    part: ConditionalValue
    values?: TagValue[]
    onChange: (tagValuePart: ConditionalValue) => void
}) {
    const [value, setValue] = useState(props.part.value)
    const [condition, setCondition] = useState(props.part.condition)

    const handleChangeValue = newValue => {
        setValue(newValue)
        if (newValue && condition)
            props.onChange({ value: newValue, condition })
    }

    const handleChangeCondition = newCondition => {
        setCondition(newCondition)
        if (value && newCondition)
            props.onChange({ value, condition: newCondition })
    }

    return (
        <tr>
            <td>
                {
                    props.values ?
                        <SelectInput
                            tag={props.tag}
                            value={value}
                            values={props.values}
                            onChange={handleChangeValue} /> :
                        <TextInput
                            tag={props.tag}
                            value={value}
                            onChange={handleChangeValue} />
                }
            </td>
            <td>
                @
                <input type="text"
                    placeholder="time interval"
                    name={props.tag}
                    value={condition ?? undefined}
                    onInput={(e: React.ChangeEvent<HTMLInputElement>) => handleChangeCondition(e.target.value)} />
            </td>
        </tr>
    )
}
