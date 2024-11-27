import { type TagValue } from '../../../utils/types/parking'

export function SelectInput(props: {
    tag: string
    value: string
    values: TagValue[]
    onChange: (tagValue: string) => void
}) {
    const values = props.values.map(v => v.value)
    const options = !props.value || values.includes(props.value) ?
        ['', ...values] :
        ['', props.value, ...values]

    return (
        <select name={props.tag}
            value={props.value}
            className="tag-editor__select"
            onChange={e => props.onChange(e.target.value)}>
            {options.map(o => <option
                key={o}
                value={o}>
                {o}
            </option>)}
        </select>
    )
}
