import { ConditionColorDefinition } from '../utils/types/conditions'

export const legend: ConditionColorDefinition[] = [
    /* eslint-disable no-multi-spaces */
    { condition: 'free',         color: 'limegreen',    text: 'Free parking' },
    { condition: 'disc',         color: 'yellowgreen',  text: 'Disc or time limited' },
    { condition: 'no_parking',   color: 'orange',       text: 'No parking' },
    { condition: 'no_stopping',  color: 'salmon',       text: 'No stopping' },
    { condition: 'no',           color: '#FFC7B6',      text: 'Not applicable' },
    { condition: 'ticket',       color: 'dodgerblue',   text: 'Paid parking' },
    { condition: 'customers',    color: 'greenyellow',  text: 'For customers' },
    { condition: 'residents',    color: 'hotpink',      text: 'For residents' },
    { condition: 'disabled',     color: 'turquoise',    text: 'Disabled' },
    { condition: 'unsupported',  color: 'gray',         text: 'Unsupported condition' },
    { condition: 'separate',     color: 'darkgray',     text: 'Parking mapped separately' },
    /* eslint-enable no-multi-spaces */
]
