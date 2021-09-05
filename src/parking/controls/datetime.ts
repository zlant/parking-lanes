import L from 'leaflet'
import { hyper } from 'hyperhtml/esm'
import dayjs from 'dayjs'

export default L.Control.extend({
    onAdd: (map: L.Map) => hyper`
        <input id="datetime-input"
               class="leaflet-control-layers control-padding control-bigfont"
               style="width: 150px"
               type="datetime-local"
               onmousedown=${L.DomEvent.stopPropagation}
               ondblclick=${L.DomEvent.stopPropagation}
               onpointerdown=${L.DomEvent.stopPropagation}>`,

    setDatetime(datetime: Date) {
        (document.getElementById('datetime-input') as HTMLInputElement)
            .value = dayjs(datetime).format('YYYY-MM-DDTHH:mm')
        return this
    },

    setDatetimeChangeListener(listener: any) {
        (document.getElementById('datetime-input') as HTMLInputElement).oninput = e => {
            // @ts-ignore
            const newDatetime = dayjs(e.target.value)
            if (newDatetime.isValid())
                listener(newDatetime.toDate())
        }
        return this
    },
})
