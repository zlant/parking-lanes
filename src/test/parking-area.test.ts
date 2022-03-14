import { getConditions } from '../parking/parking-area'
import { OsmTags } from '../utils/types/osm-data'

describe('#getConditions()', () => {
    test('should return no intervals and default as free when no tags', async() => {
        const tags: OsmTags = {}
        const conditions = getConditions(tags)
        expect(conditions).toStrictEqual({ default: 'free', intervals: [] })
    })
    test('should return ticket when fee=yes', async() => {
        const tags: OsmTags = { fee: 'yes' }
        const conditions = getConditions(tags)
        expect(conditions).toStrictEqual({ default: 'ticket', intervals: [] })
    })
})
