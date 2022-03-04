import * as JXON from 'jxon'
import osmAuth from 'osm-auth'
import { osmProdUrl, osmDevUrl } from './links'

import { OsmWay } from './types/osm-data'
import { ChangesStore, JxonOsmWay } from './types/changes-store'

let auth: OSMAuth.OSMAuthInstance | null = null

function craeteOsmAuth(useDevServer: boolean) {
    return useDevServer ?
        // Used to not have these new keywords
        // eslint-disable-next-line new-cap
        new osmAuth({
            url: osmDevUrl,
            oauth_consumer_key: 'FhbDyU5roZ0wAPffly1yfiYChg8RaNuFlJTB0SE1',
            oauth_secret: 'gTzuFDWUqmZnwho2NIaVoxpgSX47Xyqq65lTw8do',
            auto: true,
        }) :
        // eslint-disable-next-line new-cap
        new osmAuth({
            url: osmProdUrl,
            oauth_consumer_key: 'Np0gmfYoqo6Ronla4wuFTXEUgypODL0jPRzjiFW6',
            oauth_secret: 'KnUDQ3sL3T7LZjvwi5OJj1hxNBz0UiSpTr0T0fLs',
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
        options: { header: { Accept: 'application/json' } },
    })
}

export async function uploadChanges(editorName: string, editorVersion: string, changesStore: ChangesStore): Promise<void> {
    try {
        const changesetId = await createChangeset(editorName, editorVersion)
        await saveChangesets(changesStore, changesetId, editorName)
        await closeChangeset(changesetId)

        for (const way of changesStore.modify.way)
            way.version = way.version + 1

        changesStore.modify.way = []
        changesStore.create.way = []
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
        options: { header: { 'Content-Type': 'text/xml' } },
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
        options: { header: { 'Content-Type': 'text/xml' } },
        content: JXON.jsToString(change),
    })
}

function closeChangeset(changesetId: string) {
    return osmXhr({
        method: 'PUT',
        path: '/api/0.6/changeset/' + changesetId + '/close',
        options: { header: { 'Content-Type': 'text/xml' } },
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
