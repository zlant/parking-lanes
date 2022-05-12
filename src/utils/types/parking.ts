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

export interface ParkingAreas {
    [key: string]: L.Polyline | any
}

export interface ParkingPoint {
    [key: string]: L.Marker | any
}
