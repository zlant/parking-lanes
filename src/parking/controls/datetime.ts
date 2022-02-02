import L from 'leaflet'
import { hyper } from 'hyperhtml/esm'
import dayjs from 'dayjs'

// The map can only show one condition.
// If `parking:condition` tags are present,
// changing the date/time will pick the fitting color getColorByDate().
export default L.Control.extend({
    onAdd: () => hyper`
        <input id="datetime-input"
               class="leaflet-control-layers control-padding control-bigfont"
               style="width: 150px"
               type="datetime-local"
               title="If parking:condition present, show kind of parking at this time of day and day of week."
               onmousedown=${L.DomEvent.stopPropagation}
               ondblclick=${L.DomEvent.stopPropagation}
               onpointerdown=${L.DomEvent.stopPropagation}>`,

    setDatetime(datetime: Date) {
        (document.getElementById('datetime-input') as HTMLInputElement)
            .value = dayjs(datetime).format('YYYY-MM-DDTHH:mm')
        return this
    },

    setDatetimeChangeListener(listener: any) {
        (document.getElementById('datetime-input') as HTMLInputElement).oninput = (e: Event | any) => {
            const newDatetime = dayjs(e.target.value)
            if (newDatetime.isValid())
                listener(newDatetime.toDate())
        }
        return this
    },
})
