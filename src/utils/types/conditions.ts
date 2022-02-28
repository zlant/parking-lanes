import OpeningHours from 'opening_hours'

export interface ParkingConditions {
    default?: string | null
    conditionalValues?: ConditionalParkingCondition[]
}

export interface ConditionalParkingCondition {
    parkingCondition: string | null
    condition: OpeningHours | 'even' | 'odd' | null
}

export type ConditionName = 'disc' | 'no_parking' | 'no_stopping' | 'free' | 'ticket' |'customers' | 'residents' | 'disabled' | 'disc' | 'no' | 'separate' | 'unsupported'

export type ConditionColor = string

export interface ConditionColorDefinition {
    condition: ConditionName
    color: ConditionColor
    /** Text describing the condition */
    text: string
}
