import { Preset } from '../../../utils/types/preset'

export const presets: Preset[] = [
    {
        key: 'noStopping',
        tags: [
            { k: 'parking:lane:{side}', v: 'no_stopping' },
            { k: 'parking:condition:{side}', v: '' },
            { k: 'parking:condition:{side}:time_interval', v: '' },
            { k: 'parking:condition:{side}:default', v: '' },
            { k: 'parking:condition:{side}:maxstay', v: '' },
        ],
        img: {
            src: './assets/no_stopping/no_stopping.svg',
            height: 20,
            width: 20,
            alt: 'No Stopping Sign',
            title: 'No Stopping',
        },
    },
    {
        key: 'noParking',
        tags: [
            { k: 'parking:lane:{side}', v: 'no_parking' },
            { k: 'parking:condition:{side}', v: '' },
            { k: 'parking:condition:{side}:time_interval', v: '' },
            { k: 'parking:condition:{side}:default', v: '' },
            { k: 'parking:condition:{side}:maxstay', v: '' },
        ],
        img: {
            src: './assets/no_parking/no_parking.svg',
            height: 20,
            width: 20,
            alt: 'No Parking Sign',
            title: 'No Parking',
        },
    },
    {
        key: 'noParkingOdd',
        tags: [
            { k: 'parking:lane:{side}', v: 'no_parking' },
            { k: 'parking:condition:{side}', v: '' },
            { k: 'parking:condition:{side}:time_interval', v: '1-31/2' },
            { k: 'parking:condition:{side}:default', v: 'free' },
            { k: 'parking:condition:{side}:maxstay', v: '' },
        ],
        img: {
            src: './assets/no_parking/no_parking_on_odd_days.svg',
            height: 20,
            width: 20,
            alt: 'No Parking on Odd Days Sign',
            title: 'No Parking on Odd Days',
        },
    },
    {
        key: 'noParkingEven',
        tags: [
            { k: 'parking:lane:{side}', v: 'no_parking' },
            { k: 'parking:condition:{side}', v: '' },
            { k: 'parking:condition:{side}:time_interval', v: '2-30/2' },
            { k: 'parking:condition:{side}:default', v: 'free' },
            { k: 'parking:condition:{side}:maxstay', v: '' },
        ],
        img: {
            src: './assets/no_parking/no_parking_on_even_days.svg',
            height: 20,
            width: 20,
            alt: 'No Parking on Even Days Sign',
            title: 'No Parking on Even Days',
        },
    },
    {
        key: 'parking',
        tags: [
            { k: 'parking:lane:{side}', v: '' },
            { k: 'parking:condition:{side}', v: 'free' },
            { k: 'parking:condition:{side}:time_interval', v: '' },
            { k: 'parking:condition:{side}:default', v: '' },
            { k: 'parking:condition:{side}:maxstay', v: '' },
        ],
        img: {
            src: './assets/free_parking/free_parking_russia.svg',
            height: 20,
            width: 20,
            alt: 'Free Parking Sign',
            title: 'Free Parking',
        },
    },
    {
        key: 'ticket',
        tags: [
            { k: 'parking:lane:{side}', v: '' },
            { k: 'parking:condition:{side}', v: 'ticket' },
            { k: 'parking:condition:{side}:time_interval', v: '' },
            { k: 'parking:condition:{side}:default', v: '' },
            { k: 'parking:condition:{side}:maxstay', v: '' },
        ],
        img: {
            src: './assets/paid_parking/paid_parking_russia.svg',
            height: 20,
            width: 40,
            alt: 'Paid Parking Sign',
            title: 'Paid Parking',
        },
    },
]
