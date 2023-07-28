
export function TextInput(props: {
    tag: string
    value: string
    'data-partindex'?: string
    'data-tokenname'?: string
    onChange: (e: React.ChangeEvent) => void
}) {
    return (
        <input type="text"
            data-partindex={props['data-partindex']}
            data-tokenname={props['data-tokenname']}
            className="editor-form__text-input"
            placeholder={props.tag}
            name={props.tag}
            value={props.value ?? ''}
            onChange={e => props.onChange(e)} />
    )
}
