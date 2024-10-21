import * as JXON from 'jxon'
import { osmAuth } from 'osm-auth'
import { osmProdUrl, osmDevUrl } from './links'

import { type OsmWay } from './types/osm-data'
import { type ChangedIdMap, type ChangesStore, type JxonOsmWay } from './types/changes-store'

let auth: OSMAuth.osmAuth | null = null

function craeteOsmAuth(useDevServer: boolean) {
    return useDevServer ?
        // eslint-disable-next-line new-cap
        new osmAuth({
            url: osmDevUrl,
            apiUrl: osmDevUrl,
            client_id: 'lX6vX5gKHEfLV9kybjRpy2L7BTqtwZ5c_G7sjKscVw0',
            access_token: localStorage.getItem('https://master.apis.dev.openstreetmap.orgoauth2_access_token') ?? undefined,
            redirect_uri: window.location.origin + window.location.pathname + 'land.html',
            scope: 'read_prefs write_api',
            auto: true,
        }) :
        // eslint-disable-next-line new-cap
        new osmAuth({
            url: osmProdUrl,
            apiUrl: osmProdUrl,
            client_id: 'wwP2hKLF5LAWQgZTcd8SjYXsCzd8zYvl7muuQm1V3Jo',
            access_token: localStorage.getItem('https://openstreetmap.orgoauth2_access_token') ?? undefined,
            redirect_uri: window.location.origin + window.location.pathname + 'land.html',
            scope: 'read_prefs write_api',
            auto: true,
        })
}

function osmXhr(options: OSMAuth.OSMAuthXHROptions): Promise<any> {
    return new Promise((resolve, reject) => {
        if (auth === null)
            return

        return auth.xhr(
            options,
            (err, details) => {
                if (err)
                    reject(err)
                else
                    resolve(details)
            },
        )
    },
    )
}

export function authenticate(useDevServer: boolean): Promise<any> {
    auth ??= craeteOsmAuth(useDevServer)
    return new Promise((resolve, reject) => {
        if (auth === null)
            return

        return auth.authenticate((err, oauth) => err ? reject(err) : resolve(oauth))
    })
}

export function logout() {
    if (auth === null)
        return

    return auth.logout()
}

export function userInfo(): Promise<any> {
    return osmXhr({
        method: 'GET',
        path: '/api/0.6/user/details',
        headers: { Accept: 'application/json' },
    })
}

export async function uploadChanges(editorName: string, editorVersion: string, changesStore: ChangesStore): Promise<ChangedIdMap> {
    try {
        const changesetId = await createChangeset(editorName, editorVersion)
        const diffResult = await saveChangesets(changesStore, changesetId, editorName)
        await closeChangeset(changesetId)

        const diffResultJxon: any = JXON.xmlToJs(diffResult)

        const diffWays = Array.isArray(diffResultJxon.diffResult.way) ?
            diffResultJxon.diffResult.way :
            [diffResultJxon.diffResult.way]

        const changedIdMap: ChangedIdMap = {}

        for (const diffWay of diffWays) {
            const oldId = parseInt(diffWay.$old_id)
            const way = changesStore.modify.way.find(x => x.id === oldId) ??
                        changesStore.create.way.find(x => x.id === oldId)
            way!.id = parseInt(diffWay.$new_id)
            way!.version = parseInt(diffWay.$new_version)

            if (diffWay.$old_id !== diffWay.$new_id)
                changedIdMap[diffWay.$old_id] = diffWay.$new_id
        }

        changesStore.modify.way = []
        changesStore.create.way = []

        return changedIdMap
    } catch (err) {
        console.error(err)
        throw err
    }
}

function createChangeset(editorName: string, editorVersion: string): Promise<string> {
    const change = {
        osm: {
            changeset: {
                $version: '0.6',
                $generator: editorName,
                tag: [
                    { $k: 'created_by', $v: `${editorName} ${editorVersion}` },
                    { $k: 'comment', $v: 'Parking lanes' },
                    { $k: 'host', $v: `${window.location.origin}${window.location.pathname}` },
                ],
            },
        },
    }

    return osmXhr({
        method: 'PUT',
        path: '/api/0.6/changeset/create',
        headers: { 'Content-Type': 'text/xml' },
        content: JXON.jsToString(change),
    })
}

function saveChangesets(changesStore: ChangesStore, changesetId: string, editorName: string) {
    const change = {
        osmChange: {
            $version: '0.6',
            $generator: editorName,
            modify: {
                way: changesStore.modify.way
                    .map(x => wayToJxon(x, changesetId)),
            },
            create: {
                way: changesStore.create.way
                    .map(x => wayToJxon(x, changesetId)),
            },
        },
    }

    return osmXhr({
        method: 'POST',
        path: '/api/0.6/changeset/' + changesetId + '/upload',
        headers: { 'Content-Type': 'text/xml' },
        content: JXON.jsToString(change),
    })
}

function closeChangeset(changesetId: string) {
    return osmXhr({
        method: 'PUT',
        path: '/api/0.6/changeset/' + changesetId + '/close',
        headers: { 'Content-Type': 'text/xml' },
    })
}

function wayToJxon(osm: OsmWay, changesetId: string): JxonOsmWay {
    const jxonWay: JxonOsmWay = {
        $id: osm.id,
        $version: osm.version || 0,
        tag: Object.keys(osm.tags)
            .map(k => ({ $k: k, $v: osm.tags[k] })),
        nd: osm.nodes
            .map(id => ({ $ref: id })),
    }

    if (changesetId)
        jxonWay.$changeset = changesetId

    return jxonWay
}
