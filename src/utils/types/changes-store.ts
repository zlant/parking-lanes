interface EditTypeStore {
    way: any[]
}

export interface ChangesStore {
    modify: EditTypeStore
    create: EditTypeStore
}
