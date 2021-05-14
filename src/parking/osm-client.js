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
            // singlepage: true
        }) :
        osmAuth({
            url: osmProdUrl,
            oauth_consumer_key: 'Np0gmfYoqo6Ronla4wuFTXEUgypODL0jPRzjiFW6',
            oauth_secret: 'KnUDQ3sL3T7LZjvwi5OJj1hxNBz0UiSpTr0T0fLs',
            auto: true,
            // singlepage: true
        })
}

export function authenticate(useDevServer, callback) {
    auth ??= craeteOsmAuth(useDevServer)
    auth.authenticate(callback)
}

const editorName = 'PLanes'
const version = '0.4.0'

const change = {
    osmChange: {
        $version: '0.6',
        $generator: editorName + ' ' + version,
        modify: { way: [] },
        create: { way: [] },
    },
}

export function save(osm) {
    delete osm.$user
    delete osm.$uid
    delete osm.$timestamp

    if (osm.$id > 0) {
        const index = change.osmChange.modify.way.findIndex(x => x.$id === osm.$id)
        if (index > -1)
            change.osmChange.modify.way[index] = osm
        else
            change.osmChange.modify.way.push(osm)
    } else {
        const index = change.osmChange.create.way.findIndex(x => x.$id === osm.$id)
        if (index > -1)
            change.osmChange.create.way[index] = osm
        else
            change.osmChange.create.way.push(osm)
    }

    const changesCount = change.osmChange.modify.way.length + change.osmChange.create.way.length
    return changesCount
}

export function uploadChanges(callback) {
    createChangset(callback)
}

function createChangset(callback) {
    const path = '/api/0.6/changeset/create'

    const change = {
        osm: {
            changeset: {
                tag: [
                    { $k: 'created_by', $v: editorName + ' ' + version },
                    { $k: 'comment', $v: 'Parking lanes' }],
            },
        },
    }

    const xmlContent = JXON.jsToString(change)

    auth.xhr(
        {
            method: 'PUT',
            path: path,
            options: { header: { 'Content-Type': 'text/xml' } },
            content: xmlContent,
        },
        (err, details) => {
            if (err) {
                console.error(err)
                callback(err)
            } else {
                saveChangesets(details, callback)
            }
        })
}

function saveChangesets(changesetId, callback) {
    for (const way of change.osmChange.modify.way)
        way.$changeset = changesetId
    for (const way of change.osmChange.create.way)
        way.$changeset = changesetId

    const path = '/api/0.6/changeset/' + changesetId + '/upload'
    const xmlContent = JXON.jsToString(change)

    auth.xhr(
        {
            method: 'POST',
            path: path,
            options: { header: { 'Content-Type': 'text/xml' } },
            content: xmlContent,
        },
        (err, details) => {
            if (err) {
                console.error(err)
                callback(err)
            } else {
                closeChangset(changesetId, callback)
            }
        })
}

function closeChangset(changesetId, callback) {
    const path = '/api/0.6/changeset/' + changesetId + '/close'

    auth.xhr(
        {
            method: 'PUT',
            options: { header: { 'Content-Type': 'text/xml' } },
            path: path,
        },
        (err, details) => {
            if (err) {
                console.error(err)
                callback(err)
            } else {
                for (const way of change.osmChange.modify.way)
                    way.$version = parseInt(way.$version) + 1

                change.osmChange.modify.way = []
                change.osmChange.create.way = []

                callback()
            }
        })
}
