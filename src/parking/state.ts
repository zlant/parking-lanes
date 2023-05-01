import { useSyncExternalStore } from 'react'
import { OsmDataSource } from '../utils/types/osm-data'
import { LatLng } from 'leaflet'

export enum AuthState {
    initial,
    success,
    fail,
}

export const state = {
    fetchButtonText: 'Fetch parking data',
    osmDataSource: OsmDataSource.OverpassVk,
    datetime: new Date(),
    editorMode: false,
    authState: AuthState.initial,
    mapState: {
        zoom: 0,
        center: new LatLng(0, 0),
        bounds: {
            south: 0,
            west: 0,
            north: 0,
            east: 0,
        },
    },

    setDataSource(value: OsmDataSource) {
        state.setValue('osmDataSource', value)
    },
    setFetchButtonText(value: string) {
        state.setValue('fetchButtonText', value)
    },
    setDatetime(value: Date) {
        state.setValue('datetime', value)
    },
    setEditorMode(value: boolean) {
        state.setValue('editorMode', value)
    },
    setAuthState(value: AuthState) {
        state.setValue('authState', value)
    },
    setMapState(value: { zoom: number, center: L.LatLng, bounds: { south: number, west: number, north: number, east: number } }) {
        state.setValue('mapState', value)
    },

    setValue<T>(field: string, value: T) {
        this[field] = value
        emitChange(field)
    },
}

let listeners = new Array<(field?: string) => any>()

export function subscribe(listener: (field?: string) => any) {
    listeners = [...listeners, listener]
    return () => {
        listeners = listeners.filter(l => l !== listener)
    }
}
function emitChange(field: string) {
    for (const listener of listeners)
        listener(field)
}

export function useOsmDataSource(): [typeof state.osmDataSource, typeof state.setDataSource] {
    useSyncExternalStore(subscribe, () => state.osmDataSource)
    return [state.osmDataSource, state.setDataSource]
}

export function useFetchButtonText(): [typeof state.fetchButtonText, typeof state.setFetchButtonText] {
    useSyncExternalStore(subscribe, () => state.fetchButtonText)
    return [state.fetchButtonText, state.setFetchButtonText]
}

export function useDatetime(): [typeof state.datetime, typeof state.setDatetime] {
    useSyncExternalStore(subscribe, () => state.datetime)
    return [state.datetime, state.setDatetime]
}

export function useEditorMode(): [typeof state.editorMode, typeof state.setEditorMode] {
    useSyncExternalStore(subscribe, () => state.editorMode)
    return [state.editorMode, state.setEditorMode]
}

export function useAuthState(): [typeof state.authState, typeof state.setAuthState] {
    useSyncExternalStore(subscribe, () => state.authState)
    return [state.authState, state.setAuthState]
}

export function useMapState(): [typeof state.mapState, typeof state.setMapState] {
    useSyncExternalStore(subscribe, () => state.mapState)
    return [state.mapState, state.setMapState]
}
