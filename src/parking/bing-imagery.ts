import L from 'leaflet'

function toQuadKey(x: number, y: number, z: any) {
    let index = ''
    for (let i = z; i > 0; i--) {
        let b = 0
        const mask = 1 << (i - 1)
        if ((x & mask) !== 0) b++
        if ((y & mask) !== 0) b += 2
        index += b.toString()
    }
    return index
}

export async function addBingImagery(layersControl) {
    // Key by @tordans from https://www.bingmapsportal.com/Application
    const key = 'ArLnyyo1sSjfKJUAV3MPMPEkHkY3eCwzKf5MfEfiTHa67h5QFLoF8Im4GxNJ4a5K'
    const url = `https://dev.virtualearth.net/REST/v1/Imagery/Metadata/AerialOSM?include=ImageryProviders&uriScheme=https&key=${key}`

    // Get the image tiles template:
    const metadata = await (await fetch(url)).json()
    // FYI:
    // "imageHeight": 256, "imageWidth": 256,
    // "imageUrlSubdomains": ["t0","t1","t2","t3"],
    // "zoomMax": 21,
    const imageryResource = metadata.resourceSets[0].resources[0]
    const template = new URL(imageryResource.imageUrl)
    // Add tile image strictness param (n=)
    // • n=f -> (Fail) returns a 404
    // • n=z -> (Empty) returns a 200 with 0 bytes (no content)
    // • n=t -> (Transparent) returns a 200 with a transparent (png) tile
    if (!template.searchParams.has('n'))
        template.searchParams.append('n', 'f')

    // FYI: `template` looks like this but partly encoded
    // https://ecn.{subdomain}.tiles.virtualearth.net/tiles/a{quadkey}.jpeg?g=14107&pr=odbl&n=z

    layersControl.addBaseLayer(new BingImagery(template.toString()), 'Bing Aerial Imagery')
}

export class BingImagery extends L.TileLayer {
    private readonly url: string

    constructor(template: string) {
        super('')
        this.options.maxNativeZoom = 20 // The `metadata` say its 21, but that fails…
        this.options.maxZoom = 22
        this.url = template
    }

    public createTile(coords: any) {
        const tile = document.createElement('img')
        tile.src = this.getTileUrl(coords)
        tile.alt = ''
        return tile
    }

    public getTileUrl(coords: any) {
        // Arg, the `new URL(template).toString()` mangles our template keys
        const unescapeUrl = decodeURIComponent(this.url)
        return L.Util.template(unescapeUrl, {
            quadkey: toQuadKey(coords.x, coords.y, coords.z),
            subdomain: 't1', // See `imageUrlSubdomains` above
        })
    }
}
