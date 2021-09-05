export const changesStore = {
    modify: {
        way: [],
    },
    create: {
        way: [],
    },
}

export function addChangedEntity(osm: any) {
    // TODO: May need to duplicate osm object or change type
    delete osm.user
    delete osm.uid
    delete osm.timestamp

    if (osm.id > 0) {
        // @ts-ignore
        const index = changesStore.modify.way.findIndex(x => x.id === osm.id)
        if (index > -1)
            // @ts-ignore
            changesStore.modify.way[index] = osm
        else
            // @ts-ignore
            changesStore.modify.way.push(osm)
    } else {
        // @ts-ignore
        const index = changesStore.create.way.findIndex(x => x.id === osm.id)
        if (index > -1)
            // @ts-ignore
            changesStore.create.way[index] = osm
        else
            // @ts-ignore
            changesStore.create.way.push(osm)
    }

    const changesCount = changesStore.modify.way.length + changesStore.create.way.length
    return changesCount
}
