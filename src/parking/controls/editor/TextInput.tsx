
export function TextInput(props: {
    tag: string
    value: string
    onChange: (tagValue: string) => void
}) {
    return (
        <input type="text"
            className="editor-form__text-input"
            placeholder={props.tag}
            name={props.tag}
            value={props.value ?? ''}
            onChange={e => props.onChange(e.target.value)} />
    )
}
