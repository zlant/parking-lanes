import { getOpeningHourseState } from '../utils/opening-hours'
import { ConditionColor, ParkingConditions } from '../utils/types/conditions'
import { legend } from './legend'

export function getColor(condition: string | null | undefined): ConditionColor | undefined {
    if (!condition)
        return undefined

    for (const element of legend) {
        if (condition === element.condition)
            return element.color
    }
}

export function getColorByDate(conditions: ParkingConditions, datetime: Date): ConditionColor | undefined {
    if (!conditions)
        return 'black'

    // If conditions.intervals not defined, return the default color
    for (const interval of conditions.conditionalValues ?? []) {
        if (interval.condition && getOpeningHourseState(interval.condition, datetime))
            return getColor(interval.parkingCondition)
    }
    return getColor(conditions.default)
}
