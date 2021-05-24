function generateStyleMapByZoom() {
    const map = {}

    for (const zoom of [...Array(20).keys()]) {
        map[zoom] = {}
        if (zoom <= 12) {
            map[zoom].offsetMajor = 1
            map[zoom].weightMajor = 1
            map[zoom].offsetMinor = 0.5
            map[zoom].weightMinor = 0.5
        } else if (zoom >= 13 && zoom <= 14) {
            map[zoom].offsetMajor = 1.5
            map[zoom].weightMajor = 1.5
            map[zoom].offsetMinor = 1
            map[zoom].weightMinor = 1
        } else if (zoom === 15) {
            map[zoom].offsetMajor = 3
            map[zoom].weightMajor = 2
            map[zoom].offsetMinor = 1.25
            map[zoom].weightMinor = 1.25
        } else if (zoom === 16) {
            map[zoom].offsetMajor = 5
            map[zoom].weightMajor = 3
            map[zoom].offsetMinor = 2
            map[zoom].weightMinor = 1.5
        } else if (zoom === 17) {
            map[zoom].offsetMajor = 7
            map[zoom].weightMajor = 3
            map[zoom].offsetMinor = 3
            map[zoom].weightMinor = 1.5
        } else if (zoom >= 18) {
            map[zoom].offsetMajor = 8
            map[zoom].weightMajor = 3
            map[zoom].offsetMinor = 3
            map[zoom].weightMinor = 2
        }
    }

    return map
}

export const laneStyleByZoom = generateStyleMapByZoom()
