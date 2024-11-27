import { createRoot } from 'react-dom/client'
import { FetchButton } from './Fetch'
import { DatetimeInput } from './Datetime'
import { SaveButton } from './SaveButton'
import { type OsmWay } from '../../utils/types/osm-data'
import { OsmObjectPanel } from './LaneInfo'

export default function render(
    fetchBtnClickListener: () => any,
    cutLaneListener: (way: OsmWay) => void,
    osmChangeListener: (way: OsmWay) => void,
    saveClickListener: () => any,
    closeListener: () => void) {
    const control = document.getElementById('panel')
    if (control === null)
        return

    const reactRoot = createRoot(control)
    reactRoot.render(
        <div className="panel control-padding control-bigfont">
            <div>
                <div className='data-controls'>
                    <DatetimeInput />
                    <div className='data-controls__right'>
                        <FetchButton onClick={fetchBtnClickListener} />
                        <SaveButton onClick={saveClickListener} />
                    </div>
                </div>
                <OsmObjectPanel
                    onCutLane={cutLaneListener}
                    onChange={osmChangeListener}
                    onClose={closeListener} />
            </div>
        </div>)

    return control
}
