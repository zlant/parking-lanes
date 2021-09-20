import { ConditionColorDefinition } from '../utils/types/conditions'

export const legend: ConditionColorDefinition[] = [
    /* eslint-disable no-multi-spaces */
    { condition: 'disc',         color: 'yellowgreen',  text: 'Disc' },
    { condition: 'no_parking',   color: 'orange',       text: 'No parking' },
    { condition: 'no_stopping',  color: 'salmon',       text: 'No stopping' },
    { condition: 'no',           color: 'salmon',       text: 'No parking/stopping', subline: 'Mid section of dual lanes or just not applicable.' },
    { condition: 'free',         color: 'limegreen',    text: 'Free parking' },
    { condition: 'ticket',       color: 'dodgerblue',   text: 'Paid parking' },
    { condition: 'customers',    color: 'greenyellow',  text: 'For customers' },
    { condition: 'residents',    color: 'hotpink',      text: 'For residents' },
    { condition: 'disabled',     color: 'turquoise',    text: 'Disabled' },
    { condition: 'separate',     color: 'gray',         text: 'Parking street site mapped separately' },
    /* eslint-enable no-multi-spaces */
]
