import { useAppStateStore } from '../state'

export function SaveButton(props: { onClick: () => void }) {
    const changesCount = useAppStateStore(state => state.changesCount)

    if (!changesCount)
        return null

    return (
        <button
            className="save-control"
            onClick={props.onClick}>
            <img src="./assets/icons/upload.svg"
                width={16} height={16} />
            <span><span className='save-control_button-text'>Save</span>({changesCount})</span>
        </button>)
}
