import { getConditions } from '../parking/access-condition'
import { type ParkingConditions } from '../utils/types/conditions'
import { type OsmTags } from '../utils/types/osm-data'

describe('#getConditions()', () => {
    test('should return no conditional values and default as free when no tags', async() => {
        const tags: OsmTags = {}
        const receivedConditions = getConditions(tags)
        const expectedConditions: ParkingConditions = {
            default: 'free',
            conditionalValues: [],
        }
        expect(expectedConditions).toStrictEqual(receivedConditions)
    })

    test('should return ticket when fee=yes', async() => {
        const tags: OsmTags = { fee: 'yes' }
        const receivedConditions = getConditions(tags)
        const expectedConditions: ParkingConditions = {
            default: 'ticket',
            conditionalValues: [],
        }
        expect(expectedConditions).toStrictEqual(receivedConditions)
    })

    test('fee={time_interval}', async() => {
        const tags: OsmTags = { fee: 'Mo-Fr 08:00-19:00' }
        const receivedConditions = getConditions(tags)
        const expectedConditions: ParkingConditions = {
            default: 'free',
            conditionalValues: [{
                parkingCondition: 'ticket',
                condition: null, // new OpeningHours(tags.fee, null, 0),
            }],
        }
        expect(expectedConditions).toStrictEqual(receivedConditions)
    })

    test('fee:conditional=yes @ ({time_interval})', async() => {
        const tags: OsmTags = { 'fee:conditional': 'yes @ (Mo-Fr 08:00-19:00)' }
        const receivedConditions = getConditions(tags)
        const expectedConditions: ParkingConditions = {
            default: 'free',
            conditionalValues: [{
                parkingCondition: 'ticket',
                condition: null, // new OpeningHours('Mo-Fr 08:00-19:00', null, 0),
            }],
        }
        expect(expectedConditions).toStrictEqual(receivedConditions)
    })

    test('fee:conditional=no @ ({time_interval})', async() => {
        const tags: OsmTags = { 'fee:conditional': 'no @ (Mo-Fr 08:00-19:00)' }
        const receivedConditions = getConditions(tags)
        const expectedConditions: ParkingConditions = {
            default: 'ticket',
            conditionalValues: [{
                parkingCondition: 'free',
                condition: null, // new OpeningHours('Mo-Fr 08:00-19:00', null, 0),
            }],
        }
        expect(expectedConditions).toStrictEqual(receivedConditions)
    })

    test('fee:conditional=no @ ({time_interval})', async() => {
        const tags: OsmTags = { 'fee:conditional': 'yes @ (stay > 2h)' }
        const receivedConditions = getConditions(tags)
        const expectedConditions: ParkingConditions = {
            default: 'disc',
            conditionalValues: [{
                parkingCondition: 'ticket',
                condition: null,
            }],
        }
        expect(expectedConditions).toStrictEqual(receivedConditions)
    })

    test('maxstay and fee=no', async() => {
        const tags: OsmTags = {
            'parking:right': 'street_side',
            'parking:right:fee': 'no',
            'parking:right:maxstay': '15 minutes',
        }
        const receivedConditions = getConditions(tags, 'right')
        const expectedConditions: ParkingConditions = {
            default: 'disc',
            conditionalValues: [],
        }
        expect(expectedConditions).toStrictEqual(receivedConditions)
    })

    test('maxstay=no', async() => {
        const tags: OsmTags = {
            'parking:right': 'street_side',
            'parking:right:fee': 'no',
            'parking:right:maxstay': 'no',
        }
        const receivedConditions = getConditions(tags, 'right')
        const expectedConditions: ParkingConditions = {
            default: 'free',
            conditionalValues: [],
        }
        expect(expectedConditions).toStrictEqual(receivedConditions)
    })

    test('access=private', async() => {
        const tags: OsmTags = {
            'parking:left': 'street_side',
            'parking:left:access': 'private',
        }
        const receivedConditions = getConditions(tags, 'left')
        const expectedConditions: ParkingConditions = {
            default: 'no_stopping',
            conditionalValues: [],
        }
        expect(expectedConditions).toStrictEqual(receivedConditions)
    })

    test('maxstay:conditional and fee:conditional', async() => {
        const tags: OsmTags = {
            'parking:right': 'yes',
            'parking:right:fee': 'no',
            'parking:right:fee:conditional': 'yes @ (Mo-Fr 08:00-18:00; Sa 08:00-15:00)',
            'parking:right:maxstay:conditional': '30 minutes @ (Mo-Fr 08:00-18:00; Sa 08:00-15:00)',
        }
        const receivedConditions = getConditions(tags, 'right')
        const expectedConditions: ParkingConditions = {
            default: 'free',
            conditionalValues: [{
                parkingCondition: 'ticket',
                condition: null,
            }, {
                parkingCondition: 'disc',
                condition: null,
            }],
        }
        expect(expectedConditions).toStrictEqual(receivedConditions)
    })

    test('loading_only', async() => {
        const tags: OsmTags = {
            'parking:right:restriction': 'no_parking',
            'parking:right:restriction:conditional': 'loading_only @ (Mo-Fr 08:00-11:00)',
            'parking:right:restriction:reason': 'loading_zone',
        }
        const receivedConditions = getConditions(tags, 'right')
        const expectedConditions: ParkingConditions = {
            default: 'no_parking',
            conditionalValues: [{
                parkingCondition: 'loading_only',
                condition: null,
            }],
        }
        expect(expectedConditions).toStrictEqual(receivedConditions)
    })
})
