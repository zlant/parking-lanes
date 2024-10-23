export function SelectInput(props: {
    tag: string
    value: string
    values: string[]
    onChange: (tagValue: string) => void
}) {
    const options = !props.value || props.values.includes(props.value) ?
        ['', ...props.values] :
        ['', props.value, ...props.values]

    return (
        <select name={props.tag}
            value={props.value}
            className="editor-form__select-input"
            onChange={e => props.onChange(e.target.value)}>
            {options.map(o => <option
                key={o}
                value={o}>
                {o}
            </option>)}
        </select>
    )
}
