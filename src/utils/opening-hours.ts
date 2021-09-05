import OpeningHours from 'opening_hours'

export function parseOpeningHourse(value: string) {
    if (/\d+-\d+\/\d+$/.test(value)) {
        // @ts-ignore
        return parseInt(value.match(/\d+/g)[0]) % 2 === 0 ?
            'even' :
            'odd'
    }

    try {
        return new OpeningHours(value, null, 0)
    } catch (err) {
        console.error('Invalid time interval: ' + value)
        return null
    }
}

export function getOpeningHourseState(interval: any, timestamp: Date) {
    switch (interval) {
        case 'even':
            return timestamp.getDate() % 2 === 0

        case 'odd':
            return timestamp.getDate() % 2 === 1

        case null:
            return false

        default:
            return interval.getState(timestamp)
    }
}
