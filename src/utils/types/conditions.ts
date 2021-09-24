
export interface ConditionsInterface {
    intervals?: any[]
    default?: null | string // TODO add type: Can be free, no_parking, no_stopping and likely others
}

export type ConditionName = 'disc' | 'no_parking' | 'no_stopping' | 'free' | 'ticket'
|'customers' | 'residents' | 'disabled' | 'disc'

export type ConditionColor = string

export interface ConditionColorDefinition {
    condition: ConditionName
    color: ConditionColor
    /** Text describing the condition */
    text: string
}
