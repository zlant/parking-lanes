import L from 'leaflet'
import { hyper } from 'hyperhtml/esm'
import dayjs from 'dayjs'

export default L.Control.extend({
    onAdd: map => hyper`
        <input id="datetime-input"
               class="leaflet-control-layers control-padding control-bigfont"
               style="width: 150px"
               type="datetime-local"
               onmousedown=${L.DomEvent.stopPropagation}
               ondblclick=${L.DomEvent.stopPropagation}
               onpointerdown=${L.DomEvent.stopPropagation}>`,

    setDatetime(datetime) {
        document.getElementById('datetime-input').value = dayjs(datetime).format('YYYY-MM-DDTHH:mm')
        return this
    },

    setDatetimeChangeListener(listener) {
        document.getElementById('datetime-input').oninput = e => {
            const newDatetime = dayjs(e.target.value)
            if (newDatetime.isValid())
                listener(newDatetime.toDate())
        }
        return this
    },
})
