import L from 'leaflet'

interface GlobalState {
    map: L.Map
}

export type OurWindow = Window & GlobalState & typeof globalThis
