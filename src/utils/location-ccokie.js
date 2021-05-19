export function setLocationToCookie(center, zoom) {
    const date = new Date(new Date().getTime() + 10 * 365 * 24 * 60 * 60 * 1000)
    document.cookie = 'location=' + zoom + '/' + center.lat + '/' + center.lng + '; expires=' + date
}

export function getLocationFromCookie() {
    const locationCookie = document.cookie.split('; ').find((e, i, a) => e.startsWith('location='))
    if (locationCookie == null)
        return null

    const location = locationCookie.split('=')[1].split('/')

    return [[location[1], location[2]], location[0]]
}
