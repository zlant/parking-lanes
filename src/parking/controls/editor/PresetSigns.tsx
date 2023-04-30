import { type OsmWay } from '../../../utils/types/osm-data'
import { type OsmKeyValue } from '../../../utils/types/preset'
import { presets } from './presets'

export function PresetSigns(osm: OsmWay, side: 'both' | 'left' | 'right') {
    return presets.map(x => (
        <img src={x.img.src}
            key={x.img.src}
            className="sign-preset"
            height={x.img.height}
            width={x.img.width}
            alt={x.img.alt}
            title={x.img.title}
            onClick={() => handlePresetClick(x.tags, osm, side)} />))
}

/**
 * Set the content of all the select and input elements in the form when clicking on a preset.
 * @param tags An array of objects containing an OSM key and corresponding value for the preset
 * @param osm The OSM way we have selected
 * @param side What side of the OSM way we are applying this preset to
 */
function handlePresetClick(
    tags: OsmKeyValue[], osm: OsmWay, side: 'both' | 'left' | 'right',
): void {
    for (const tag of tags) {
        // Replace the placeholder `{side}` in the key with the actual side
        const osmTagKey = tag.k.replace('{side}', side)

        // Some controls are selects, some are textboxes
        const inputSelector = `form[id='${osm.id}'] [name='${osmTagKey}']`
        const currentInput = document.querySelector(inputSelector) as
            HTMLInputElement | HTMLSelectElement

        // Set the textbox/select content
        currentInput.value = tag.v
    }

    const inputSelector = `form[id='${osm.id}'] [name='${`parking:${side}`}']`
    const element = document.querySelector(inputSelector) as HTMLInputElement | HTMLSelectElement
    element.dispatchEvent(new Event('change'))
}
