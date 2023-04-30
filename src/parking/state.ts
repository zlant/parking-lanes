import { useSyncExternalStore } from 'react'
import { OsmDataSource } from '../utils/types/osm-data'

export const state = {
    fetchButtonText: 'Fetch parking data',
    osmDataSource: OsmDataSource.OverpassVk,
    datetime: new Date(),

    setDataSource(value: OsmDataSource) {
        state.osmDataSource = value
        emitChange('osmDataSource')
    },
    setFetchButtonText(value: string) {
        state.fetchButtonText = value
        emitChange('fetchButtonText')
    },
    setDatetime(value: Date) {
        state.datetime = value
        emitChange('datetime')
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
