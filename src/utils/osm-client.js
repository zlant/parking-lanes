import * as JXON from 'jxon'
import osmAuth from 'osm-auth'
import { osmProdUrl, osmDevUrl } from './links'

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
 * @param {boolean} useDevServer
 */
export function authenticate(useDevServer) {
    auth ??= craeteOsmAuth(useDevServer)
    return new Promise((resolve, reject) =>
        auth.authenticate((err, oauth) => err ? reject(err) : resolve(oauth)),
    )
}

/**
 * @param {string} editor
 */
export async function uploadChanges(editor, changesStore) {
    try {
        const changesetId = await createChangset(editor)
        await saveChangesets(changesStore, changesetId, editor)
        await closeChangset(changesetId)

        for (const way of changesStore.modify.way)
            way.$version = parseInt(way.$version) + 1

        changesStore.modify.way = []
        changesStore.create.way = []
    } catch (err) {
        console.error(err)
        throw new Error(err)
    }
}

function createChangset(editor) {
    const change = {
        osm: {
            changeset: {
                tag: [
                    { $k: 'created_by', $v: editor },
                    { $k: 'comment', $v: 'Parking lanes' }],
            },
        },
    }

    const xmlContent = JXON.jsToString(change)

    return new Promise((resolve, reject) =>
        auth.xhr(
            {
                method: 'PUT',
                path: '/api/0.6/changeset/create',
                options: { header: { 'Content-Type': 'text/xml' } },
                content: xmlContent,
            },
            (err, details) => {
                if (err)
                    reject(err)
                else
                    resolve(details)
            },
        ),
    )
}

function saveChangesets(changesStore, changesetId, editor) {
    for (const way of changesStore.modify.way)
        way.$changeset = changesetId
    for (const way of changesStore.create.way)
        way.$changeset = changesetId

    const change = {
        osmChange: {
            $version: '0.6',
            $generator: editor,
            modify: {
                way: changesStore.modify.way,
            },
            create: {
                way: changesStore.create.way,
            },
        },
    }
    const xmlContent = JXON.jsToString(change)

    return new Promise((resolve, reject) =>
        auth.xhr(
            {
                method: 'POST',
                path: '/api/0.6/changeset/' + changesetId + '/upload',
                options: { header: { 'Content-Type': 'text/xml' } },
                content: xmlContent,
            },
            (err, details) => {
                if (err)
                    reject(err)
                else
                    resolve(details)
            },
        ),
    )
}

function closeChangset(changesetId) {
    return new Promise((resolve, reject) =>
        auth.xhr(
            {
                method: 'PUT',
                path: '/api/0.6/changeset/' + changesetId + '/close',
                options: { header: { 'Content-Type': 'text/xml' } },
            },
            (err, details) => {
                if (err)
                    reject(err)
                else
                    resolve(details)
            },
        ),
    )
}
