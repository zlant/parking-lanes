import { transpose } from 'osm-parking-tag-updater/src/components/Tool/transpose'
import { type OsmWay } from '../../../utils/types/osm-data'

export function TagUpdaterModal(props: {
    osm: OsmWay
    onUpdate: () => void
    onClose: () => void
}) {
    const updateInfo = transpose(Object.entries(props.osm.tags).map(x => `${x[0]}=${x[1]}`))

    return (
        <div id="tag-updater-modal" className="modal">
            <div className="modal__header">
                <h2 className="modal__header">Update tags to new scheme</h2>
                <button type="button"
                    className="modal_close"
                    onClick={() => props.onClose()}>
                    ✖
                </button>
            </div>
            <div id="updated-tags">
                <h3 className="modal__subtitle">Updated tags</h3>
                <table className="updated-tags__table">
                    <thead>
                        <tr>
                            <th>Old tag</th>
                            <th>New tags</th>
                        </tr>
                    </thead>
                    <tbody>
                        {Object.keys(updateInfo.newTagObjects).map(k =>
                            <tr key={k}>
                                <td>{k}</td>
                                <td>{updateInfo.newTagObjects[k].newTags.map(nt => <div key={nt}>{nt}</div>)}</td>
                            </tr>)}
                    </tbody>
                </table>
            </div>
            <div id="manual-updating-tags">
                <h3 className="modal__subtitle">Required manual updating</h3>
                {Object.keys(updateInfo.newTagsManualCandidates)
                    .map(k => <div key={k}>{k}</div>)}
            </div>

            <div className="modal__footer">
                <button type="button"
                    className="button"
                    onClick={() => {
                        props.onUpdate()
                        props.onClose()
                    }}>
                    Update tags
                </button>
            </div>
        </div>
    )
}
