import { useAppStateStore } from '../state'

export function SaveButton(props: { onClick: () => void }) {
    const changesCount = useAppStateStore(state => state.changesCount)

    if (!changesCount)
        return null

    return (
        <button
            className="control-padding control-bigfont control-button save-control"
            onClick={props.onClick}>
            Save ({changesCount})
        </button>)
}
