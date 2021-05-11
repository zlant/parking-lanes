export const presets = [
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
            src: 'https://upload.wikimedia.org/wikipedia/commons/9/98/3.27_Russian_road_sign.svg',
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
            src: 'https://upload.wikimedia.org/wikipedia/commons/8/81/3.28_Russian_road_sign.svg',
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
            src: 'https://upload.wikimedia.org/wikipedia/commons/f/f4/3.29_Russian_road_sign.svg',
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
            src: 'https://upload.wikimedia.org/wikipedia/commons/7/76/3.30_Russian_road_sign.svg',
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
            src: 'https://upload.wikimedia.org/wikipedia/commons/e/eb/6.4_Russian_road_sign.svg',
            height: 20,
            width: 20,
            alt: 'Free Parking Sign',
            title: 'Free Parking',
        },
        click: {
            showTypeButtons: true,
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
            src: 'https://upload.wikimedia.org/wikipedia/commons/f/f3/8.8_Russian_road_sign.svg',
            height: 20,
            width: 40,
            alt: 'Paid Parking Sign',
            title: 'Paid Parking',
        },
        click: {
            showTypeButtons: true,
        },
    },
]
