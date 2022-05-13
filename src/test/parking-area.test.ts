import { getConditions } from '../parking/access-condition'
import { ParkingConditions } from '../utils/types/conditions'
import { OsmTags } from '../utils/types/osm-data'

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
})
