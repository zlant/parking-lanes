export function SelectInput(props: {
    tag: string
    value: string
    values: string[]
    onChange: (e: React.ChangeEvent) => void
}) {
    const options = !props.value || props.values.includes(props.value) ?
        ['', ...props.values] :
        ['', props.value, ...props.values]

    return (
        <select name={props.tag}
            defaultValue={props.value}
            className="editor-form__select-input"
            onChange={e => props.onChange(e)}>
            {options.map(o => <option
                key={o}
                value={o}>
                {o}
            </option>)}
        </select>
    )
}
