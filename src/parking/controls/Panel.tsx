import L from 'leaflet'
import { createRoot } from 'react-dom/client'
import { FetchButton } from './Fetch'
import { DatetimeInput } from './Datetime'
import { SaveButton } from './SaveButton'
import { type OsmWay } from '../../utils/types/osm-data'
import { OsmObjectPanel } from './LaneInfo'

export default L.Control.extend({
    onAdd: () => {
        const control = document.createElement('div')
        control.id = 'panel'
        control.onmousedown = L.DomEvent.stopPropagation
        control.ondblclick = L.DomEvent.stopPropagation
        control.onpointerdown = L.DomEvent.stopPropagation
        control.onclick = L.DomEvent.stopPropagation

        return control
    },

    render(
        fetchBtnClickListener: () => any,
        cutLaneListener: (way: OsmWay) => void,
        osmChangeListener: (way: OsmWay) => void,
        saveClickListener: () => any) {
        const control = document.getElementById('panel')
        if (control === null)
            return

        const reactRoot = createRoot(control)
        reactRoot.render(
            <div className="leaflet-control-layers control-padding control-bigfont">
                <div>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: 10,
                    }}>
                        <DatetimeInput />
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 10,
                        }}>
                            <FetchButton onClick={fetchBtnClickListener} />
                            <SaveButton onClick={saveClickListener} />
                        </div>
                    </div>
                    <OsmObjectPanel
                        onCutLane={cutLaneListener}
                        onChange={osmChangeListener} />
                </div>
            </div>)

        return control
    },
})
