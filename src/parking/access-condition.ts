import { parseConditionalTag } from '../utils/conditional-tag'
import { parseOpeningHours } from '../utils/opening-hours'
import { type ParkingConditions } from '../utils/types/conditions'
import { type OsmTags } from '../utils/types/osm-data'

export function getConditions(tags: OsmTags, side?: string) {
    const conditions: ParkingConditions = {
        conditionalValues: [],
        default: side == null ? mapAccessValue(tags, getValue(tags, 'access')) : null,
    }

    const feeValue = getValue(tags, 'fee', side)
    if (feeValue && feeValue !== 'yes' && feeValue !== 'no') {
        conditions.conditionalValues!.push({
            condition: parseOpeningHours(feeValue),
            parkingCondition: 'ticket',
        })
    }

    const accessValue = getValue(tags, 'access', side)
    const feeConditionalValue = getValue(tags, 'fee:conditional', side)
    if (feeConditionalValue) {
        const conditionalFee = parseConditionalTag(feeConditionalValue)
        for (const conditionalValue of conditionalFee) {
            conditions.conditionalValues?.push({
                condition: parseOpeningHours(conditionalValue.condition),
                parkingCondition: conditionalValue.value === 'yes' ? 'ticket' : 'free',
            })
            if (conditionalValue.value === 'no' && accessValue === undefined)
                conditions.default = 'ticket'
            if (conditionalValue.value === 'yes' && conditionalValue.condition?.includes('stay'))
                conditions.default = 'disc'
        }
    }

    const maxstayConditionalValue = getValue(tags, 'maxstay:conditional', side)
    if (maxstayConditionalValue) {
        conditions.conditionalValues?.push(
            ...parseConditionalTag(maxstayConditionalValue)
                .map(x => ({
                    condition: parseOpeningHours(x.condition),
                    parkingCondition: 'disc',
                })))
    }

    const accessConditionalValue = getValue(tags, 'access:conditional', side)
    if (accessConditionalValue) {
        conditions.conditionalValues?.push(
            ...parseConditionalTag(accessConditionalValue)
                .map(x => ({
                    condition: parseOpeningHours(x.condition),
                    parkingCondition: mapAccessValue(tags, x.value, side),
                })))
    }

    const restrictionConditionalValue = getValue(tags, 'restriction:conditional', side)
    if (restrictionConditionalValue) {
        conditions.conditionalValues?.push(
            ...parseConditionalTag(restrictionConditionalValue)
                .map(x => ({
                    condition: parseOpeningHours(x.condition),
                    parkingCondition: x.value,
                })))
    }

    const laneValue = getValue(tags, '', side)
    const restrictionValue = getValue(tags, 'restriction', side)
    if (!restrictionValue && laneValue &&
        ['lane', 'street_side', 'on_kerb', 'half_on_kerb', 'shoulder', 'yes'].includes(laneValue))
        conditions.default = 'free'

    const maxstayValue = getValue(tags, 'maxstay', side)
    if (maxstayValue && maxstayValue !== 'no')
        conditions.default = 'disc'

    if (feeValue === 'yes')
        conditions.default = 'ticket'

    if (laneValue && ['no', 'separate'].includes(laneValue))
        conditions.default = laneValue

    if (restrictionValue)
        conditions.default = restrictionValue

    if (accessValue)
        conditions.default = mapAccessValue(tags, accessValue, side)

    const openingHoursValue = getValue(tags, 'opening_hours', side)
    if (openingHoursValue) {
        conditions.conditionalValues!.push({
            condition: parseOpeningHours(openingHoursValue),
            parkingCondition: conditions.default!,
        })
        conditions.default = 'no'
    }

    return conditions
}

function mapAccessValue(tags: OsmTags, accessValue: string | undefined, side?: string): 'yes' | 'ticket' | 'free' | 'customers' | 'no_stopping' | 'residents' | 'disabled' | 'no_parking' {
    switch (accessValue) {
        case undefined:
        case 'yes':
        case 'public':
            return getValue(tags, 'fee', side) === 'yes' ? 'ticket' : 'free'

        case 'private':
            return getValue(tags, 'zone', side) ? 'residents' : 'no_stopping'

        case 'no':
        case 'permissive':
        case 'permit':
            return 'no_stopping'

        case 'customers':
        case 'destination':
            return getValue(tags, 'fee', side) === 'yes' ? 'ticket' : 'customers'

        case 'residents':
        case 'employees':
            return 'residents'

        case 'disabled':
            return 'disabled'

        default:
            return 'no_parking'
    }
}

function getValue(tags: OsmTags, key: string, side?: string) {
    if (side == null)
        return tags[key]

    return [side, 'both']
        .map(side => [`parking:${side}`, key].filter(x => x).join(':'))
        .map(x => tags[x])
        .find(x => x)
}
