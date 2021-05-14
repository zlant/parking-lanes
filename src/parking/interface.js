import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// eslint-disable-next-line no-unused-vars
import locatecontrol from 'leaflet.locatecontrol'

// eslint-disable-next-line no-unused-vars
import polylineoffset from 'leaflet-polylineoffset'

// eslint-disable-next-line no-unused-vars
import leaflethash from 'leaflet-hash'

import 'leaflet.locatecontrol/dist/L.Control.Locate.min.css'
import 'font-awesome/css/font-awesome.min.css'

import { hyper } from 'hyperhtml/esm'

import DatetimeControl from './controls/datetime'
import GithubControl from './controls/github'
import LegendControl from './controls/legend'
import LaneInfoControl from './controls/lane-info'

import {
    parseParkingLane,
    parseChangedParkingLane,
    updateLaneColorsByDate,
    updateLaneStylesByZoom,
    getBacklights,
} from './parking-lane'

import { getLocationFromCookie, setLocationToCookie } from './location-ccokie'
import { idUrl, josmUrl, overpassUrl } from './links'
import { downloadBbox, cache, resetLastBounds } from './data-client'
import { authenticate, save, uploadChanges } from './osm-client'

/** @type {L.Map} */
let map = null

let editorMode = false
const useDevServer = false
let datetime = new Date()
const viewMinZoom = 15

const laneInfoControl = new LaneInfoControl({ position: 'topright' })

const tileLayers = {
    mapnik: L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 18,
        className: 'mapnik_gray',
    }),
    esri: L.tileLayer('https://clarity.maptiles.arcgis.com/arcgis/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        attribution: "<a href='https://wiki.openstreetmap.org/wiki/Esri'>Terms & Feedback</a>",
        maxZoom: 19,
        maxNativeZoom: 19,
        ref: 'esric',
    }),
}

const layersControl = L.control.layers(
    {
        Mapnik: tileLayers.mapnik,
        'Esri Clarity': tileLayers.esri,
    },
    null,
    { position: 'bottomright' })

export function initMap() {
    const root = document.querySelector('#map')
    map = L.map(root, { fadeAnimation: false })

    if (document.location.href.indexOf('#') === -1)
        map.setView(...(getLocationFromCookie() || [[51.591, 24.609], 5]))

    tileLayers.mapnik.addTo(map)

    L.control.locate({ drawCircle: false, drawMarker: true }).addTo(map)

    new GithubControl({ position: 'bottomright' }).addTo(map)
        .setEditorModeCheckboxListener(handleEditorModeCheckboxChange)
    new LegendControl({ position: 'bottomright' }).addTo(map)
    new DatetimeControl({ position: 'topright' }).addTo(map)
        .setDatetime(datetime)
        .setDatetimeChangeListener(handleDatetimeChange)
    new InfoControl({ position: 'topright' }).addTo(map)
    new DownloadControl({ position: 'topright' }).addTo(map)
    new SaveControl({ position: 'topright' }).addTo(map)
    laneInfoControl.addTo(map)
        .setOsmChangeListener(handleOsmChange)

    map.on('moveend', handleMapMoveEnd)
    map.on('click', closeLaneInfo)

    // eslint-disable-next-line no-new
    new L.Hash(map)

    return map
}

export const InfoControl = L.Control.extend({
    onAdd: map => hyper`
        <div id="min-zoom-btn"
             class="leaflet-control-layers control-padding control-bigfont control-button"
             onclick=${() => map.setZoom(viewMinZoom)}>
            Zoom in on the map
        </div>`,
})

export const DownloadControl = L.Control.extend({
    onAdd: map => hyper`
        <div id="download-btn"
             class="leaflet-control-layers control-padding control-bigfont control-button"
             onclick=${() => downloadParkinkLanes(map)}>
            Download bbox
        </div>`,
})

export const SaveControl = L.Control.extend({
    onAdd: map => hyper`
        <button id="save-btn"
                class="leaflet-control-layers control-padding control-bigfont control-button save-control"
                style="display: none"
                onclick=${handleSaveClick}>
            Save
        </button>`,
})

function handleDatetimeChange(newDatetime) {
    datetime = newDatetime
    updateLaneColorsByDate(lanes, datetime)
}

const lanes = {}
const markers = {}

async function downloadParkinkLanes(map) {
    document.getElementById('download-btn').innerText = 'Downloading...'
    const newData = await downloadBbox(map.getBounds(), editorMode, useDevServer)
    document.getElementById('download-btn').innerText = 'Download bbox'

    if (!newData)
        return

    for (const way of Object.values(newData.ways).filter(x => x.tag != null)) {
        if (lanes['right' + way.$id] || lanes['left' + way.$id] || lanes['empty' + way.$id])
            continue

        const newLanes = parseParkingLane(way, newData.nodes, map.getZoom(), editorMode)
        addNewLanes(newLanes, map)
    }
}

function addNewLanes(newLanes, map) {
    updateLaneColorsByDate(newLanes, datetime)
    Object.assign(lanes, newLanes)
    for (const newLane of Object.values(newLanes)) {
        newLane.on('click', handleLaneClick)
        newLane.addTo(map)
    }
}

function handleLaneClick(e) {
    closeLaneInfo(e)

    const osmId = e.target.options.osm.$id
    const lane = lanes['right' + osmId] || lanes['left' + osmId] || lanes['empty' + osmId]
    const backligntPolylines = getBacklights(lane.getLatLngs(), map.getZoom())
    lanes.right = backligntPolylines.right.addTo(map)
    lanes.left = backligntPolylines.left.addTo(map)

    if (editorMode) {
        laneInfoControl.showEditForm(
            e.target.options.osm,
            cache.waysInRelation,
            handleCutLaneClick)
    } else {
        laneInfoControl.showLaneInfo(e.target.options.osm)
    }

    L.DomEvent.stopPropagation(e)
}

function closeLaneInfo(e) {
    laneInfoControl.closeLaneInfo()

    for (const marker in markers) {
        markers[marker].remove()
        delete markers[marker]
    }

    lanes.right?.remove()
    lanes.left?.remove()
}

// Map move handler

function handleMapMoveEnd() {
    document.getElementById('ghc-josm').href = josmUrl + overpassUrl + getHighwaysOverpassQuery()
    document.getElementById('ghc-id').href = idUrl + '#map=' +
    document.location.href.substring(document.location.href.indexOf('#') + 1)

    const zoom = map.getZoom()
    setLocationToCookie(map.getCenter(), zoom)

    updateLaneStylesByZoom(lanes, zoom)

    document.getElementById('min-zoom-btn').style.display =
        zoom < viewMinZoom ? 'block' : 'none'

    if (zoom < viewMinZoom)
        return

    downloadParkinkLanes(map)
}

function getHighwaysOverpassQuery() {
    const bounds = map.getBounds()
    const bbox = [bounds.getSouth(), bounds.getWest(), bounds.getNorth(), bounds.getEast()].join(',')
    const tag = 'highway~"^motorway|trunk|primary|secondary|tertiary|unclassified|residential|service|living_street"'
    return '[out:xml];(way[' + tag + '](' + bbox + ');>;way[' + tag + '](' + bbox + ');<;);out meta;'
}

// Editor

function handleEditorModeCheckboxChange(e) {
    if (e.currentTarget.checked) {
        authenticate(useDevServer, checkAuth)
    } else {
        editorMode = false

        layersControl.remove(map)
        if (map.hasLayer(tileLayers.esri)) {
            map.removeLayer(tileLayers.esri)
            map.addLayer(tileLayers.mapnik)
            tileLayers.mapnik.addTo(map)
        }

        document.getElementById('ghc-editor-mode-label').style.color = 'black'

        for (const lane in lanes) {
            if (lane.startsWith('empty')) {
                lanes[lane].remove()
                delete lanes[lane]
            }
        }
    }

    function checkAuth(err) {
        if (err) {
            document.getElementById('ghc-editor-mode-label').style.color = 'red'
            alert(err)
        } else {
            editorMode = true
            layersControl.addTo(map)
            document.getElementById('ghc-editor-mode-label').style.color = 'green'
            resetLastBounds()
            handleMapMoveEnd()
        }
    }
}

function handleOsmChange(newOsm) {
    const newLanes = parseChangedParkingLane(newOsm, lanes, datetime, map.getZoom())
    newLanes.forEach(lane => lane.addTo(map))

    const changesCount = save(newOsm)
    document.getElementById('save-btn').innerText = 'Save (' + changesCount + ')'
    document.getElementById('save-btn').style.display = 'block'
}

function handleSaveClick() {
    uploadChanges(handleUploadingCallback)
}

function handleUploadingCallback(err) {
    if (err) {
        alert(err)
        return
    }

    document.getElementById('save-btn').style.display = 'none'
}

const cutIcon = L.divIcon({
    className: 'cut-icon',
    iconSize: new L.Point(20, 20),
    html: '✂',
})

function handleCutLaneClick(osm) {
    if (Object.keys(markers).length > 0)
        return

    for (const nd of osm.nd.slice(1, osm.nd.length - 1)) {
        markers[nd.$ref] = L.marker(
            cache.nodes[nd.$ref],
            {
                icon: cutIcon,
                ndId: nd.$ref,
                wayId: osm.$id,
            })
            .on('click', cutWay)
            .addTo(map)
    }
}

let newWayId = -1

function cutWay(arg) {
    const oldWay = cache.ways[arg.target.options.wayId]
    const newWay = { ...oldWay }

    const ndIndex = oldWay.nd.findIndex(e => e.$ref === arg.target.options.ndId)

    oldWay.nd = oldWay.nd.slice(0, ndIndex + 1)
    newWay.nd = newWay.nd.slice(ndIndex)
    newWay.$id = newWayId--
    newWay.$version = '1'
    delete newWay.$user
    delete newWay.$uid
    delete newWay.$timestamp

    lanes['right' + oldWay.$id]?.setLatLngs(oldWay.nd.map(x => cache.nodes[x.$ref]))
    lanes['left' + oldWay.$id]?.setLatLngs(oldWay.nd.map(x => cache.nodes[x.$ref]))
    lanes['empty' + oldWay.$id]?.setLatLngs(oldWay.nd.map(x => cache.nodes[x.$ref]))

    lanes.left?.setLatLngs(oldWay.nd.map(x => cache.nodes[x.$ref]))
    lanes.right?.setLatLngs(oldWay.nd.map(x => cache.nodes[x.$ref]))

    for (const marker in markers) {
        markers[marker].remove()
        delete markers[marker]
    }

    cache.ways[newWay.$id] = newWay
    const newLanes = parseParkingLane(newWay, cache.nodes, map.getZoom(), editorMode)
    addNewLanes(newLanes, map)

    save(newWay)
    const changesCount = save(oldWay)
    document.getElementById('save-btn').innerText = 'Save (' + changesCount + ')'
    document.getElementById('save-btn').style.display = 'block'
}
