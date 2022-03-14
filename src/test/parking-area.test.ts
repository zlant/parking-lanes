import { getConditions } from '../parking/parking-area'
import { ConditionsInterface } from '../utils/types/conditions'

describe('#getConditions()', () => {
    test('no tags', async() => {
        const conditions = getConditions({})
        const expectedConditions: ConditionsInterface = { default: 'free', intervals: [] }
        expect(conditions).toStrictEqual(expectedConditions)
    })
})
