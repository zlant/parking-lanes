import { ChangesStore } from './types/changes-store'

export const changesStore: ChangesStore = {
    modify: {
        way: [],
    },
    create: {
        way: [],
    },
}

export function addChangedEntity(osm: any): number {
    // TODO: May need to duplicate osm object or change type
    delete osm.user
    delete osm.uid
    delete osm.timestamp

    if (osm.id > 0) {
        const index = changesStore.modify.way.findIndex(x => x.id === osm.id)
        if (index > -1)
            changesStore.modify.way[index] = osm
        else
            changesStore.modify.way.push(osm)
    } else {
        const index = changesStore.create.way.findIndex(x => x.id === osm.id)
        if (index > -1)
            changesStore.create.way[index] = osm
        else
            changesStore.create.way.push(osm)
    }

    const changesCount = changesStore.modify.way.length + changesStore.create.way.length
    return changesCount
}
