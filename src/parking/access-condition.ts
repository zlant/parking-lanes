import { parseConditionalTag } from '../utils/conditional-tag'
import { parseOpeningHours } from '../utils/opening-hours'
import { ParkingConditions } from '../utils/types/conditions'
import { OsmTags } from '../utils/types/osm-data'

export function getConditions(tags: OsmTags) {
    const conditions: ParkingConditions = {
        conditionalValues: [],
        default: getDefaultCondition(tags),
    }

    if (tags.opening_hours) {
        conditions.conditionalValues!.push({
            condition: parseOpeningHours(tags.opening_hours),
            parkingCondition: conditions.default!,
        })
        conditions.default = 'no'
    }
    if (tags.fee && tags.fee !== 'yes' && tags.fee !== 'no') {
        conditions.conditionalValues?.push({
            condition: parseOpeningHours(tags.fee),
            parkingCondition: 'ticket',
        })
    }
    if (tags['fee:conditional']) {
        const conditionalFee = parseConditionalTag(tags['fee:conditional'])
        for (const conditionalValue of conditionalFee) {
            conditions.conditionalValues?.push({
                condition: parseOpeningHours(conditionalValue.condition),
                parkingCondition: conditionalValue.value === 'yes' ? 'ticket' : 'free',
            })
            if (conditionalValue.value === 'no' && tags.access === undefined)
                conditions.default = 'ticket'
            if (conditionalValue.value === 'yes' && conditionalValue.condition?.includes('stay'))
                conditions.default = 'disc'
        }
    }

    return conditions
}

/**
 * Get default parking condition for a way given a set of tags based on the access key
 * @param tags A set of tags on the way
 * @returns The default parking condition
 */
function getDefaultCondition(tags: OsmTags): 'yes' | 'ticket' | 'free' | 'customers' | 'no_stopping' | 'residents' | 'disabled' | 'no_parking' {
    switch (tags.access) {
        case undefined:
        case 'yes':
        case 'public':
            return tags.fee === 'yes' ? 'ticket' : 'free'

        case 'private':
        case 'no':
        case 'permissive':
        case 'permit':
            return 'no_stopping'

        case 'customers':
        case 'destination':
            return tags.fee === 'yes' ? 'ticket' : 'customers'

        case 'residents':
        case 'employees':
            return 'residents'

        case 'disabled':
            return 'disabled'

        default:
            return 'no_parking'
    }
}
