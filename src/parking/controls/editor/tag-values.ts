import { type TagValue } from '../../../utils/types/parking'

export const laneValues: TagValue[] = [
    { value: 'lane', imgSrc: 'https://wiki.openstreetmap.org/w/images/e/ef/Parking_position_lane.png' },
    { value: 'street_side', imgSrc: 'https://wiki.openstreetmap.org/w/images/thumb/4/44/Parking_position_street_side.png/120px-Parking_position_street_side.png?20221020081454' },
    { value: 'on_kerb' },
    { value: 'half_on_kerb' },
    { value: 'shoulder', imgSrc: 'https://wiki.openstreetmap.org/w/images/8/82/Parking_position_shoulder.png' },
    { value: 'no', imgSrc: 'https://wiki.openstreetmap.org/w/images/f/f8/Parking_position_no.png' },
    { value: 'separate' },
    { value: 'yes', imgSrc: 'https://wiki.openstreetmap.org/w/images/c/cd/Parking_position_yes.png' },
]

export const orientationValues: TagValue[] = [
    { value: 'parallel', imgSrc: 'https://wiki.openstreetmap.org/w/images/4/45/Parking_orientation_parallel.png' },
    { value: 'diagonal', imgSrc: 'https://wiki.openstreetmap.org/w/images/e/e6/Parking_orientation_diagonal.png' },
    { value: 'perpendicular', imgSrc: 'https://wiki.openstreetmap.org/w/images/2/29/Parking_orientation_perpendicular.png' },
]

export const reasonValues: TagValue[] = [
    { value: 'bus_lane' },
    { value: 'rails' },
    { value: 'bus_stop' },
    { value: 'crossing' },
    { value: 'cycleway' },
    { value: 'driveway' },
    { value: 'dual_carriage' },
    { value: 'fire_lane' },
    { value: 'junction' },
    { value: 'loading_zone' },
    { value: 'markings' },
    { value: 'narrow' },
    { value: 'passenger_loading_zone' },
    { value: 'priority_road' },
    { value: 'street_cleaning' },
    { value: 'turnaround' },
    { value: 'turn_lane' },
]

export const restrictionValues: TagValue[] = [
    { value: 'no_parking', imgSrc: './assets/no_parking/no_parking.svg' },
    { value: 'no_standing' },
    { value: 'no_stopping', imgSrc: './assets/no_stopping/no_stopping.svg' },
    { value: 'loading_only' },
    { value: 'charging_only' },
]
