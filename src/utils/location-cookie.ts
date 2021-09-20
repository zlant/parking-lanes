import L from 'leaflet'
import { LocationAndZoom } from './types/leaflet'

export function setLocationToCookie(center: L.LatLng, zoom: number): void {
    const date = new Date(new Date().getTime() + 10 * 365 * 24 * 60 * 60 * 1000)
    document.cookie = 'location=' + zoom + '/' + center.lat + '/' + center.lng + '; expires=' + date
}

export function getLocationFromCookie(): LocationAndZoom | undefined {
    const locationCookie = document.cookie.split('; ').find(e => e.startsWith('location='))
    if (locationCookie == null)
        return undefined

    const rawLocation = locationCookie.split('=')[1].split('/')
    const location = new L.LatLng(parseFloat(rawLocation[1]), parseFloat(rawLocation[2]))
    const zoom: number = parseInt(rawLocation[0])

    return {
        location,
        zoom,
    }
}
