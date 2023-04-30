import L from 'leaflet'
import { createRoot } from 'react-dom/client'
import { useDatetime } from '../state'
import dayjs from 'dayjs'

export default L.Control.extend({
    onAdd: () => {
        const control = document.createElement('div')
        control.onmousedown = L.DomEvent.stopPropagation
        control.ondblclick = L.DomEvent.stopPropagation
        control.onpointerdown = L.DomEvent.stopPropagation
        control.onclick = L.DomEvent.stopPropagation

        const reactRoot = createRoot(control)
        reactRoot.render(<DatetimeInput />)

        return control
    },
})

function DatetimeInput() {
    const [datetime, setDatetime] = useDatetime()
    return (
        <input id="datetime-input"
            value={dayjs(datetime).format('YYYY-MM-DDTHH:mm')}
            className="leaflet-control-layers control-padding control-bigfont"
            style={{ width: '150px' }}
            type="datetime-local"
            title="If parking:condition present, show kind of parking at this time of day and day of week."
            onChange={(e) => setDatetime(new Date(e.target.value))} />
    )
}
