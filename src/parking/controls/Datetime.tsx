import { useAppStateStore } from '../state'
import dayjs from 'dayjs'

export function DatetimeInput() {
    const datetime = useAppStateStore(state => state.datetime)
    const setDatetime = useAppStateStore(state => state.setDatetime)

    return (
        <input id="datetime-input"
            value={dayjs(datetime).format('YYYY-MM-DDTHH:mm')}
            className="control-padding control-bigfont"
            style={{ width: '150px' }}
            type="datetime-local"
            title="If parking:condition present, show kind of parking at this time of day and day of week."
            onChange={(e) => setDatetime(new Date(e.target.value))} />
    )
}
