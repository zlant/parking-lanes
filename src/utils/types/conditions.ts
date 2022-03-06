import OpeningHours from 'opening_hours'

export interface ConditionsInterface {
    intervals?: ConditionInterface[]
    default?: null | string // TODO add type: Can be free, no_parking, no_stopping and likely others
}

export interface ConditionInterface {
    interval: OpeningHours | 'even' | 'odd' | null
    condition: string | null
}

export type ConditionName = 'disc' | 'no_parking' | 'no_stopping' | 'free' | 'ticket' |'customers' | 'residents' | 'disabled' | 'disc' | 'no' | 'separate'

export type ConditionColor = string

export interface ConditionColorDefinition {
    condition: ConditionName
    color: ConditionColor
    /** Text describing the condition */
    text: string
}
