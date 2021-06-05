import * as JXON from 'jxon'
import osmAuth from 'osm-auth'
import { osmProdUrl, osmDevUrl } from './links'

/** @type {OSMAuth.OSMAuthInstance} */
let auth = null

function craeteOsmAuth(useDevServer) {
    return useDevServer ?
        osmAuth({
            url: osmDevUrl,
            oauth_consumer_key: 'FhbDyU5roZ0wAPffly1yfiYChg8RaNuFlJTB0SE1',
            oauth_secret: 'gTzuFDWUqmZnwho2NIaVoxpgSX47Xyqq65lTw8do',
            auto: true,
        }) :
        osmAuth({
            url: osmProdUrl,
            oauth_consumer_key: 'Np0gmfYoqo6Ronla4wuFTXEUgypODL0jPRzjiFW6',
            oauth_secret: 'KnUDQ3sL3T7LZjvwi5OJj1hxNBz0UiSpTr0T0fLs',
            auto: true,
        })
}

/**
 * @param {OSMAuth.OSMAuthXHROptions} options
 */
function osmXhr(options) {
    return new Promise((resolve, reject) =>
        auth.xhr(
            options,
            (err, details) => {
                if (err)
                    reject(err)
                else
                    resolve(details)
            },
        ),
    )
}

/**
 * @param {boolean} useDevServer
 */
export function authenticate(useDevServer) {
    auth ??= craeteOsmAuth(useDevServer)
    return new Promise((resolve, reject) =>
        auth.authenticate((err, oauth) => err ? reject(err) : resolve(oauth)),
    )
}

export function logout() {
    return auth.logout()
}

export function userInfo() {
    return osmXhr({
        method: 'GET',
        path: '/api/0.6/user/details',
        options: { header: { Accept: 'application/json' } },
    })
}

/**
 * @param {string} editorName
 * @param {number} editorVersion
 */
export async function uploadChanges(editorName, editorVersion, changesStore) {
    try {
        const changesetId = await createChangeset(editorName, editorVersion)
        await saveChangesets(changesStore, changesetId, editorName)
        await closeChangeset(changesetId)

        for (const way of changesStore.modify.way)
            way.$version = parseInt(way.$version) + 1

        changesStore.modify.way = []
        changesStore.create.way = []
    } catch (err) {
        console.error(err)
        throw err
    }
}

function createChangeset(editorName, editorVersion) {
    const change = {
        osm: {
            changeset: {
                $version: '0.6',
                $generator: editorName,
                tag: [
                    { $k: 'created_by', $v: `${editorName} ${editorVersion}` },
                    { $k: 'comment', $v: 'Parking lanes' },
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

function saveChangesets(changesStore, changesetId, editorName) {
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

function closeChangeset(changesetId) {
    return osmXhr({
        method: 'PUT',
        path: '/api/0.6/changeset/' + changesetId + '/close',
        options: { header: { 'Content-Type': 'text/xml' } },
    })
}

function wayToJxon(osm, changesetId) {
    const jxonWay = {
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
