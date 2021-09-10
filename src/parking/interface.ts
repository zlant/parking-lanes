import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

import locatecontrol from 'leaflet.locatecontrol'
locatecontrol

// @ts-ignore
import polylineoffset from 'leaflet-polylineoffset'
polylineoffset

// @ts-ignore
import leaflethash from 'leaflet-hash'
leaflethash

// @ts-ignore
import leaflettouchhelper from 'leaflet-touch-helper'
leaflettouchhelper

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

import { getLocationFromCookie, setLocationToCookie } from '../utils/location-ccokie'
import { idUrl, josmUrl, overpassUrl } from '../utils/links'
import { downloadBbox, osmData, resetLastBounds } from '../utils/data-client'
import { getUrl } from './data-url'
import { addChangedEntity, changesStore } from '../utils/changes-store'
import { authenticate, logout, userInfo, uploadChanges } from '../utils/osm-client'
import { OurWindow, OverpassTurboResponse, ParkingLanes, OsmWay } from '../utils/interfaces'

const editorName = 'PLanes'
const version = '0.4.2'

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
        // @ts-ignore
        ref: 'esric',
    }),
}

const layersControl = L.control.layers(
    {
        Mapnik: tileLayers.mapnik,
        'Esri Clarity': tileLayers.esri,
    },
    undefined,
    { position: 'bottomright' })

export function initMap() {
    const root = document.querySelector('#map') as HTMLElement;
    const map = L.map(root, { fadeAnimation: false })

    if (document.location.href.indexOf('#') === -1) {
        const cookieLocation = getLocationFromCookie();
        const defaultLocation: L.LatLng = new L.LatLng(51.591, 24.609);
        const defaultZoom = 5;

        const location = cookieLocation !== undefined ? cookieLocation.location : defaultLocation
        const zoom = cookieLocation !== undefined ? cookieLocation.zoom : defaultZoom

        map.setView(location, zoom)
    }

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

    // @ts-ignore
    const hash = new L.Hash(map)
    return map
}

export const InfoControl = L.Control.extend({
    onAdd: (map: L.Map) => hyper`
        <div id="min-zoom-btn"
             class="leaflet-control-layers control-padding control-bigfont control-button"
             onclick=${() => map.setZoom(viewMinZoom)}>
            Zoom in on the map
        </div>`,
})

export const DownloadControl = L.Control.extend({
    onAdd: (map: L.Map) => hyper`
        <div id="download-btn"
             class="leaflet-control-layers control-padding control-bigfont control-button"
             onclick=${() => downloadParkingLanes(map)}>
            Download bbox
        </div>`,
})

export const SaveControl = L.Control.extend({
    onAdd: (map: L.Map) => hyper`
        <button id="save-btn"
                class="leaflet-control-layers control-padding control-bigfont control-button save-control"
                style="display: none"
                onclick=${handleSaveClick}>
            Save
        </button>`,
})

function handleDatetimeChange(newDatetime: Date) {
    datetime = newDatetime
    updateLaneColorsByDate(lanes, newDatetime)
}

const lanes: ParkingLanes = {}
const markers: { [key: string]: any} = {}

async function downloadParkingLanes(map: L.Map) {
    (document.getElementById('download-btn') as HTMLButtonElement)
        .innerText = 'Downloading...'
    const url = getUrl(map.getBounds(), editorMode, useDevServer)
    const newData: OverpassTurboResponse | null = await downloadBbox(map.getBounds(), url);
    (document.getElementById('download-btn') as HTMLButtonElement).innerText = 'Download bbox'

    if (!newData) {
        return
    }

    for (const way of Object.values(newData.ways).filter(x => x.tags?.highway)) {
        if (lanes['right' + way.id] || lanes['left' + way.id] || lanes['empty' + way.id])
            continue

        const newLanes = parseParkingLane(way, newData.nodes, map.getZoom(), editorMode)
        if(newLanes !== undefined) {
            addNewLanes(newLanes, map)
        }
    }
}

function addNewLanes(newLanes: ParkingLanes, map: L.Map): void {
    updateLaneColorsByDate(newLanes, datetime)
    Object.assign(lanes, newLanes)
    for (const newLane of Object.values(newLanes)) {
        newLane.on('click', handleLaneClick)
        newLane.addTo(map)
        // L.path is added by plugin, types don't exist. 
        // @ts-ignore
        L.path.touchHelper(newLane).addTo(map)
    }
}

function handleLaneClick(e: Event) {
    const {map} = (window as OurWindow);
    closeLaneInfo()

    // I don't know where this gets set, but it appears to be a way
    // @ts-ignore
    const osm: OsmWay = e.target.options.osm;

    const osmId = osm.id
    const lane = lanes['right' + osmId] || lanes['left' + osmId] || lanes['empty' + osmId]
    const backligntPolylines = getBacklights(lane.getLatLngs(), map.getZoom())
    lanes.right = backligntPolylines.right.addTo(map)
    lanes.left = backligntPolylines.left.addTo(map)

    if (editorMode) {
        laneInfoControl.showEditForm(
            osm,
            osmData.waysInRelation,
            handleCutLaneClick)
    } else {
        laneInfoControl.showLaneInfo(osm)
    }

    L.DomEvent.stopPropagation(e)
}

function closeLaneInfo(){
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
    const {map} = (window as OurWindow);
    (document.getElementById('ghc-josm') as HTMLLinkElement).href = josmUrl + overpassUrl + getHighwaysOverpassQuery();
    (document.getElementById('ghc-id') as HTMLLinkElement).href = idUrl + '#map=' +
    document.location.href.substring(document.location.href.indexOf('#') + 1)

    const zoom = map.getZoom()
    setLocationToCookie(map.getCenter(), zoom)
    
    updateLaneStylesByZoom(lanes, zoom);

    (document.getElementById('min-zoom-btn') as HTMLButtonElement).style.display =
        zoom < viewMinZoom ? 'block' : 'none'

    if (zoom < viewMinZoom)
        return

    downloadParkingLanes(map)
}

function getHighwaysOverpassQuery() {
    const {map} = (window as OurWindow);
    const bounds = map.getBounds()
    const bbox = [bounds.getSouth(), bounds.getWest(), bounds.getNorth(), bounds.getEast()].join(',')
    const tag = 'highway~"^motorway|trunk|primary|secondary|tertiary|unclassified|residential|service|living_street"'
    return '[out:xml];(way[' + tag + '](' + bbox + ');>;way[' + tag + '](' + bbox + ');<;);out meta;'
}

// Editor

async function handleEditorModeCheckboxChange(e: Event) {
    const {map} = (window as OurWindow);
    // @ts-ignore
    if (e.currentTarget.checked) {
        try {
            await authenticate(useDevServer)
            try {
                await userInfo()
            } catch {
                logout()
                await authenticate(useDevServer)
            }
            editorMode = true;
            layersControl.addTo(map);
            (document.getElementById('ghc-editor-mode-label') as HTMLLabelElement).style.color = 'green'
            resetLastBounds()
            handleMapMoveEnd()
        } catch (err) {
            (document.getElementById('ghc-editor-mode-label') as HTMLLabelElement).style.color = 'red'
            alert(err)
        }
    } else {
        editorMode = false;
        // @ts-ignore
        layersControl.remove(map);
        if (map.hasLayer(tileLayers.esri)) {
            map.removeLayer(tileLayers.esri)
            map.addLayer(tileLayers.mapnik)
            tileLayers.mapnik.addTo(map)
        }

        (document.getElementById('ghc-editor-mode-label') as HTMLLabelElement).style.color = 'black'

        for (const lane in lanes) {
            if (lane.startsWith('empty')) {
                // @ts-ignore
                lanes[lane].remove()
                // @ts-ignore
                delete lanes[lane]
            }
        }
    }
}

function handleOsmChange(newOsm: OsmWay) {
    const {map} = (window as OurWindow);
    const newLanes = parseChangedParkingLane(newOsm, lanes, datetime, map.getZoom())
    newLanes.forEach(lane => lane.addTo(map))

    const changesCount = addChangedEntity(newOsm)
    const saveBtn = (document.getElementById('save-btn') as HTMLButtonElement)
    saveBtn.innerText = 'Save (' + changesCount + ')'
    saveBtn.style.display = 'block'
}

async function handleSaveClick() {
    try {
        await uploadChanges(editorName, version, changesStore);
        (document.getElementById('save-btn') as HTMLButtonElement).style.display = 'none';
    } catch (err) {
        if (err instanceof XMLHttpRequest)
            alert(err.responseText || err)
        else
            alert(err)
    }
}

const cutIcon = L.divIcon({
    className: 'cut-icon',
    iconSize: new L.Point(20, 20),
    html: '✂',
})

function handleCutLaneClick(osm: OsmWay) {
    if (Object.keys(markers).length > 0)
        return

    const {map} = (window as OurWindow);
    for (const nd of osm.nodes.slice(1, osm.nodes.length - 1)) {
        markers[nd] = L.marker(
            osmData.nodes[nd],
            {
                icon: cutIcon,
                // @ts-ignore
                ndId: nd,
                wayId: osm.id,
            })
            .on('click', cutWay)
            .addTo(map)
    }
}

let newWayId = -1

function cutWay(arg: any) {
    const oldWay = osmData.ways[arg.target.options.wayId]
    const newWay = JSON.parse(JSON.stringify(oldWay))

    const ndIndex = oldWay.nodes.findIndex(e => e === arg.target.options.ndId)

    oldWay.nodes = oldWay.nodes.slice(0, ndIndex + 1)
    newWay.nodes = newWay.nodes.slice(ndIndex)
    newWay.id = newWayId--
    newWay.version = 1
    delete newWay.user
    delete newWay.uid
    delete newWay.timestamp

    lanes['right' + oldWay.id]?.setLatLngs(oldWay.nodes.map(x => osmData.nodes[x]))
    lanes['left' + oldWay.id]?.setLatLngs(oldWay.nodes.map(x => osmData.nodes[x]))
    lanes['empty' + oldWay.id]?.setLatLngs(oldWay.nodes.map(x => osmData.nodes[x]))

    lanes.left?.setLatLngs(oldWay.nodes.map(x => osmData.nodes[x]))
    lanes.right?.setLatLngs(oldWay.nodes.map(x => osmData.nodes[x]))

    for (const marker in markers) {
        markers[marker].remove()
        delete markers[marker]
    }

    osmData.ways[newWay.id] = newWay
    const {map} = (window as OurWindow);
    const newLanes = parseParkingLane(newWay, osmData.nodes, map.getZoom(), editorMode)
    // @ts-ignore
    addNewLanes(newLanes, map)

    addChangedEntity(newWay)
    const changesCount = addChangedEntity(oldWay)
    const saveBtn = document.getElementById('save-btn') as HTMLButtonElement;
    saveBtn.innerText = 'Save (' + changesCount + ')'
    saveBtn.style.display = 'block'
}
