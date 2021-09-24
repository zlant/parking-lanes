export type Side = 'left' | 'right'

export interface StyleMapInterface {
    weightMinor?: number
    weightMajor?: number

    offsetMajor?: number
    offsetMinor?: number
}

export interface ParkingLanes {
    [key: string]: L.Polyline | any
}
