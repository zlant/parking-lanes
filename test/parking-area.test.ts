import { getConditions } from '../src/parking/parking-area'

describe('#getConditions()', () => {
    test('no tags', async() => {
        const conditions = getConditions({})
        expect(conditions).toBe([])
    })
})
