import { useSyncExternalStore } from 'react'
import { OsmDataSource } from '../utils/types/osm-data'

export const state = {
    fetchButtonText: 'Fetch parking data',
    osmDataSource: OsmDataSource.OverpassVk,

    setDataSource(value: OsmDataSource) {
        state.osmDataSource = value
        emitChange()
    },
    setFetchButtonText(value: string) {
        state.fetchButtonText = value
        emitChange()
    },
}

let listeners = new Array<any>()

function subscribe(listener: any) {
    listeners = [...listeners, listener]
    return () => {
        listeners = listeners.filter(l => l !== listener)
    }
}
function emitChange() {
    for (const listener of listeners)
        listener()
}

export function useOsmDataSource(): [typeof state.osmDataSource, typeof state.setDataSource] {
    useSyncExternalStore(subscribe, () => state.osmDataSource)
    return [state.osmDataSource, state.setDataSource]
}

export function useFetchButtonText(): [typeof state.fetchButtonText, typeof state.setFetchButtonText] {
    useSyncExternalStore(subscribe, () => state.fetchButtonText)
    return [state.fetchButtonText, state.setFetchButtonText]
}
