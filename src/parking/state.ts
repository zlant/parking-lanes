import { create } from 'zustand'
import { OsmDataSource } from '../utils/types/osm-data'
import { type LatLng } from 'leaflet'

export enum AuthState {
    initial,
    success,
    fail,
}

export interface AppStateStore {
    fetchButtonText: string
    osmDataSource: OsmDataSource
    datetime: Date
    editorMode: boolean
    authState: AuthState
    mapState?: {
        zoom: number
        center: LatLng
        bounds: {
            south: number
            west: number
            north: number
            east: number
        }
    }

    setFetchButtonText: (value: this['fetchButtonText']) => void
    setOsmDataSource: (value: this['osmDataSource']) => void
    setDatetime: (value: this['datetime']) => void
    setEditorMode: (value: this['editorMode']) => void
    setAuthState: (value: this['authState']) => void
    setMapState: (value: this['mapState']) => void
}

export const useAppStateStore = create<AppStateStore>((set) => ({
    fetchButtonText: 'Fetch parking data',
    osmDataSource: OsmDataSource.OverpassVk,
    datetime: new Date(),
    editorMode: false,
    authState: AuthState.initial,

    setFetchButtonText: (value) => set({ fetchButtonText: value }),
    setOsmDataSource: (value) => set({ osmDataSource: value }),
    setDatetime: (value) => set({ datetime: value }),
    setEditorMode: (value) => set({ editorMode: value }),
    setAuthState: (value) => set({ authState: value }),
    setMapState: (value) => set({ mapState: value }),
}))
