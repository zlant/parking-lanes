
import ausNoStoppingImg from '../../../signs/no-stopping.jpg'
import ausNoParkingSign from '../../../signs/no-parking.jpg'
import aus1pSign from '../../../signs/1p.jpg'
import aus1pDuringDaySign from '../../../signs/1p-during-day.jpg'
import aus2pPermitSign from '../../../signs/2p-permit.png'

const ausSignWidth = 30
const ausSignAspectRatio = 60 / 100
const ausSignHeight = ausSignWidth / ausSignAspectRatio

export const presets = [
    {
        country: 'australia',
        key: 'noStoppingAus',
        tags: [
            { k: 'parking:lane:{side}', v: 'no_stopping' },
            { k: 'parking:condition:{side}', v: '' },
            { k: 'parking:condition:{side}:time_interval', v: '' },
            { k: 'parking:condition:{side}:default', v: '' },
            { k: 'parking:condition:{side}:disc:maxstay', v: '' },
            { k: 'parking:condition:{side}:disc:time_interval', v: '' },
            { k: 'parking:condition:{side}:residents', v: '' },
        ],
        img: {
            src: ausNoStoppingImg,
            height: ausSignHeight,
            width: ausSignWidth,
            alt: 'No Stopping Sign',
            title: 'No Stopping',
        },
    },
    {
        country: 'australia',
        key: 'noParkingAus',
        tags: [
            { k: 'parking:lane:{side}', v: 'no_parking' },
            { k: 'parking:condition:{side}', v: '' },
            { k: 'parking:condition:{side}:time_interval', v: '' },
            { k: 'parking:condition:{side}:default', v: '' },
            { k: 'parking:condition:{side}:disc:maxstay', v: '' },
            { k: 'parking:condition:{side}:disc:time_interval', v: '' },
            { k: 'parking:condition:{side}:residents', v: '' },
        ],
        img: {
            src: ausNoParkingSign,
            height: ausSignHeight,
            width: ausSignWidth,
            alt: 'No Parking Sign',
            title: 'No Parking',
        },
    },
    {
        country: 'australia',
        key: '1p-during-day',
        tags: [
            { k: 'parking:lane:{side}', v: '' },
            { k: 'parking:condition:{side}', v: 'disc' },
            { k: 'parking:condition:{side}:time_interval', v: '' },
            { k: 'parking:condition:{side}:default', v: 'free' },
            { k: 'parking:condition:{side}:disc:maxstay', v: '1 hour' },
            { k: 'parking:condition:{side}:disc:time_interval', v: 'Mo-Fr 09:30-17:30; Sa 09:00-12:00' },
            { k: 'parking:condition:{side}:residents', v: '' },
        ],
        img: {

            src: aus1pDuringDaySign,
            height: ausSignHeight,
            width: ausSignWidth,
            alt: '1P free parking during day, unlimited otherwise',
            title: '1P free parking during day, unlimited otherwise',
        },
        click: {
            showTypeButtons: true,
        },
    },
    {
        country: 'australia',
        key: '1p',
        tags: [
            { k: 'parking:lane:{side}', v: '' },
            { k: 'parking:condition:{side}', v: 'disc' },
            { k: 'parking:condition:{side}:time_interval', v: '' },
            { k: 'parking:condition:{side}:default', v: '' },
            { k: 'parking:condition:{side}:disc:maxstay', v: '1 hour' },
            { k: 'parking:condition:{side}:disc:time_interval', v: '' },
            { k: 'parking:condition:{side}:residents', v: '' },
        ],
        img: {
            src: aus1pSign,
            height: ausSignHeight,
            width: ausSignWidth,
            alt: '1P Parking',
            title: '1P free parking',
        },
        click: {
            showTypeButtons: true,
        },
    },
    {
        country: 'australia',
        key: '2p-residents',
        tags: [
            { k: 'parking:lane:{side}', v: '' },
            { k: 'parking:condition:{side}', v: 'disc' },
            { k: 'parking:condition:{side}:time_interval', v: '' },
            { k: 'parking:condition:{side}:default', v: 'free' },
            { k: 'parking:condition:{side}:disc:maxstay', v: '2 hours' },
            { k: 'parking:condition:{side}:disc:time_interval', v: 'Mo-Fr 08:00-18:00' },
            { k: 'parking:condition:{side}:residents', v: '*' },
        ],
        img: {
            src: aus2pPermitSign,
            height: ausSignHeight,
            width: ausSignWidth,
            alt: '2P free parking during weekday daytime, permit excepted',
            title: '2P free parking during weekday daytime, permit excepted',
        },
        click: {
            showTypeButtons: true,
        },
    },
    {
        country: 'russia',
        key: 'noStopping',
        tags: [
            { k: 'parking:lane:{side}', v: 'no_stopping' },
            { k: 'parking:condition:{side}', v: '' },
            { k: 'parking:condition:{side}:time_interval', v: '' },
            { k: 'parking:condition:{side}:default', v: '' },
            { k: 'parking:condition:{side}:disc:maxstay', v: '' },
            { k: 'parking:condition:{side}:disc:time_interval', v: '' },
            { k: 'parking:condition:{side}:residents', v: '' },
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
        country: 'russia',
        key: 'noParking',
        tags: [
            { k: 'parking:lane:{side}', v: 'no_parking' },
            { k: 'parking:condition:{side}', v: '' },
            { k: 'parking:condition:{side}:time_interval', v: '' },
            { k: 'parking:condition:{side}:default', v: '' },
            { k: 'parking:condition:{side}:disc:maxstay', v: '' },
            { k: 'parking:condition:{side}:disc:time_interval', v: '' },
            { k: 'parking:condition:{side}:residents', v: '' },
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
        country: 'russia',
        key: 'noParkingOdd',
        tags: [
            { k: 'parking:lane:{side}', v: 'no_parking' },
            { k: 'parking:condition:{side}', v: '' },
            { k: 'parking:condition:{side}:time_interval', v: '1-31/2' },
            { k: 'parking:condition:{side}:default', v: 'free' },
            { k: 'parking:condition:{side}:disc:maxstay', v: '' },
            { k: 'parking:condition:{side}:disc:time_interval', v: '' },
            { k: 'parking:condition:{side}:residents', v: '' },
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
        country: 'russia',
        key: 'noParkingEven',
        tags: [
            { k: 'parking:lane:{side}', v: 'no_parking' },
            { k: 'parking:condition:{side}', v: '' },
            { k: 'parking:condition:{side}:time_interval', v: '2-30/2' },
            { k: 'parking:condition:{side}:default', v: 'free' },
            { k: 'parking:condition:{side}:disc:maxstay', v: '' },
            { k: 'parking:condition:{side}:disc:time_interval', v: '' },
            { k: 'parking:condition:{side}:residents', v: '' },
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
        country: 'russia',
        key: 'parking',
        tags: [
            { k: 'parking:lane:{side}', v: '' },
            { k: 'parking:condition:{side}', v: 'free' },
            { k: 'parking:condition:{side}:time_interval', v: '' },
            { k: 'parking:condition:{side}:default', v: '' },
            { k: 'parking:condition:{side}:disc:maxstay', v: '' },
            { k: 'parking:condition:{side}:disc:time_interval', v: '' },
            { k: 'parking:condition:{side}:residents', v: '' },
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
        country: 'russia',
        key: 'ticket',
        tags: [
            { k: 'parking:lane:{side}', v: '' },
            { k: 'parking:condition:{side}', v: 'ticket' },
            { k: 'parking:condition:{side}:time_interval', v: '' },
            { k: 'parking:condition:{side}:default', v: '' },
            { k: 'parking:condition:{side}:disc:maxstay', v: '' },
            { k: 'parking:condition:{side}:disc:time_interval', v: '' },
            { k: 'parking:condition:{side}:residents', v: '' },
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
