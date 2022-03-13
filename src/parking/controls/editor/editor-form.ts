import { hyper } from 'hyperhtml/esm'
import { OsmWay } from '../../../utils/types/osm-data'
import { WaysInRelation } from '../../../utils/types/osm-data-storage'
import { OsmKeyValue } from '../../../utils/types/preset'
import { presets } from './presets'
import { getAllTagsBlock } from '../lane-info'

export function getLaneEditForm(osm: OsmWay, waysInRelation: WaysInRelation, cutLaneListener: (way: OsmWay) => void): HTMLFormElement {
    const form = hyper`
        <form id="${osm.id}"
              class="editor-form">
            <label class="editor-form__side-switcher">
                <input id="side-switcher"
                       type="checkbox"
                       class="editor-form__side-switcher-checkbox"
                       onchange=${handleSideSwitcherChange}>
                Both
            </label>
            <button title="Cut lane"
                    type="button"
                    class="editor-form__cut-button"
                    style="${waysInRelation[osm.id] ? displayNone : null}"
                    onclick=${() => cutLaneListener(osm)}>
                ✂
            </button>
            <dl>
                ${getSideGroup(osm, 'both')}
                ${getSideGroup(osm, 'right')}
                ${getSideGroup(osm, 'left')}
                ${getAllTagsBlock(osm.tags)}
            </dl>
        </form>` as HTMLFormElement

    const existsRightTags = existsSideTags(form, 'right')
    const existsLeftTags = existsSideTags(form, 'left')
    const existsBothTags = existsSideTags(form, 'both')

    if (!existsRightTags && !existsLeftTags && existsBothTags) {
        form.querySelector<HTMLElement>('#right')!.style.display = 'none'
        form.querySelector<HTMLElement>('#left')!.style.display = 'none'
    } else if (!existsBothTags) {
        form.querySelector<HTMLElement>('#both')!.style.display = 'none'
    }

    form.querySelector<HTMLInputElement>('#side-switcher')!.checked = existsBothTags

    return form
}

function existsSideTags(form: HTMLFormElement, side: string) {
    const regex = new RegExp('^parking:.*' + side)

    for (const input of Array.from(form)) {
        if ((input instanceof HTMLInputElement || input instanceof HTMLSelectElement) &&
            regex.test(input.name) && input.value !== '')
            return true
    }

    return false
}

function handleSideSwitcherChange(e: Event) {
    if (!(e.currentTarget instanceof HTMLInputElement))
        return

    if (e.currentTarget.checked) {
        hideElement('right')
        hideElement('left')
        showElement('both')
    } else {
        showElement('right')
        showElement('left')
        hideElement('both')
    }
}

function getSideGroup(osm: OsmWay, side: 'both'|'left'|'right') {
    return hyper`
        <div id=${side}
             class="tags-block tags-block_${side}">
            ${getPresetSigns(osm, side)}
            <table>
                ${getTagInputs(osm, side)}
            </table>
        </div>`
}

const parkingLaneTagTemplates = [
    'parking:lane:{side}',
    'parking:lane:{side}:{type}',
    'parking:condition:{side}',
    'parking:condition:{side}:time_interval',
    'parking:condition:{side}:default',
    'parking:condition:{side}:maxstay',
    'parking:lane:{side}:capacity',
    'parking:lane:{side}:surface',
]

function getTagInputs(osm: OsmWay, side: 'both'|'left'|'right') {
    const inputs: HTMLElement[] = []
    const type = osm.tags[`parking:lane:${side}`] || 'type'
    for (const tagTemplate of parkingLaneTagTemplates)
        inputs.push(getTagInput(osm, side, type, tagTemplate))
    return inputs
}

function getTagInput(osm: OsmWay, side: string, parkingType: string, tagTemplate: string) {
    const tag = tagTemplate
        .replace('{side}', side)
        .replace('{type}', parkingType)

    const tagSplit = tag.split(':')
    const label = tagSplit[Math.floor(tagSplit.length / 2) * 2 - 1]

    const value = osm.tags[tag]

    let input: HTMLInputElement | HTMLSelectElement

    let hide = false
    switch (tagTemplate) {
        case 'parking:lane:{side}':
            input = getSelectInput(tag, value, laneValues)
            input.oninput = handleLaneTagInput
            break

        case 'parking:condition:{side}:time_interval':
            input = getTextInput(tag, value)
            input.oninput = handleTimeIntervalTagInput
            break

        case 'parking:lane:{side}:{type}': {
            input = getSelectInput(tag, value, typeValues)
            const laneTag = 'parking:lane:{side}'
                .replace('{side}', side)
            hide = !['parallel', 'diagonal', 'perpendicular']
                .includes(osm.tags[laneTag])
            break
        }
        case 'parking:condition:{side}':
            input = getSelectInput(tag, value, conditionValues)
            input.oninput = handleConditionTagInput
            break

        case 'parking:condition:{side}:default': {
            input = getTextInput(tag, value)
            const timeIntervalTag = 'parking:condition:{side}:time_interval'
                .replace('{side}', side)
            hide = !osm.tags[timeIntervalTag]
            break
        }
        case 'parking:condition:{side}:maxstay': {
            input = getTextInput(tag, value)
            const conditionTag = 'parking:condition:{side}'
                .replace('{side}', side)
            hide = osm.tags[conditionTag] !== 'disc'
            break
        }
        case 'parking:lane:{side}:surface': {
            input = getTextInput(tag, value)
            input.placeholder = osm.tags.surface ?? input.placeholder
            const laneTag = 'parking:lane:{side}'
                .replace('{side}', side)
            hide = !['parallel', 'diagonal', 'perpendicular', 'marked', 'yes']
                .includes(osm.tags[laneTag])
            break
        }
        default:
            input = getTextInput(tag, value)
            break
    }

    input.onchange = (e) => {
        if (!(e.currentTarget instanceof HTMLInputElement || e.currentTarget instanceof HTMLSelectElement) ||
            e.currentTarget.form == null)
            return

        const newOsm = formToOsmWay(osm, e.currentTarget.form)
        osmChangeListener?.(newOsm)
    }

    return hyper`
        <tr id="${tag}"
            style=${{ display: hide && !value ? 'none' : null }}>
            <td><label title="${tag}">${label}</label></td>
            <td>
                ${input}
            </td>
        </tr>` as HTMLElement
}

function getSelectInput(tag: string, value: string, values: string[]): HTMLSelectElement {
    const options = !value || values.includes(value) ?
        ['', ...values] :
        ['', value, ...values]

    return hyper`
        <select name=${tag}>
            ${options.map(o => hyper`<option value=${o} selected=${value === o}>${o}</option>`)}
        </select>`
}

function getTextInput(tag: string, value: string): HTMLInputElement {
    return hyper`
        <input type="text"
               placeholder="${tag}"
               name="${tag}"
               value="${value ?? ''}">`
}

function getPresetSigns(osm: OsmWay, side: 'both'|'left'|'right') {
    return presets.map(x => hyper`
        <img src=${x.img.src}
             class="sign-preset"
             height=${x.img.height}
             width=${x.img.width}
             alt=${x.img.alt}
             title=${x.img.title}
             onclick=${() => handlePresetClick(x.tags, osm, side)}>`)
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

    const inputSelector = `form[id='${osm.id}'] [name='${`parking:lane:${side}`}']`
    const element = document.querySelector(inputSelector) as HTMLInputElement | HTMLSelectElement
    element.dispatchEvent(new Event('change'))
}

function handleLaneTagInput(e: Event) {
    const el = e.target as HTMLSelectElement
    const side = el.name.split(':')[2]
    // Type tag should only exist when parking:lane:side has one on the following values
    if (['parallel', 'diagonal', 'perpendicular'].includes(el.value)) {
        // exact name of the tag depends on parking:lane:side value
        const typeTagTr = document.querySelector<HTMLElement>(`[id^="parking:lane:${side}:"]`)
        typeTagTr!.id = `parking:lane:${side}:${el.value}`
        typeTagTr!.style.display = ''
        typeTagTr!.querySelector<HTMLElement>('label')!.innerText = el.value

        const typeTagSelect = document.querySelector<HTMLInputElement>(`[name^="parking:lane:${side}:"]`)
        typeTagSelect!.name = `parking:lane:${side}:${el.value}`
    } else {
        document.querySelector<HTMLElement>(`[id^="parking:lane:${side}:"]`)!.style.display = 'none'
        document.querySelector<HTMLInputElement>(`[name^="parking:lane:${side}:"]`)!.value = ''
    }

    const surfaceTr = document.getElementById(`parking:lane:${side}:surface`)
    if (['parallel', 'diagonal', 'perpendicular', 'marked', 'yes'].includes(el.value))
        showElement(surfaceTr!.id)
    else if (!surfaceTr?.querySelector('input')?.value)
        hideElement(surfaceTr!.id)
}

function handleConditionTagInput(e: Event) {
    const el = e.target as HTMLInputElement
    const side = el.name.split(':')[2]
    const maxstayTr = document.getElementById(`parking:condition:${side}:maxstay`)

    if (el.value === 'disc' && !maxstayTr?.querySelector('input')?.value)
        hideElement(maxstayTr!.id)
    else
        showElement(maxstayTr!.id)
}

function handleTimeIntervalTagInput(e: Event) {
    const el = e.target as HTMLInputElement
    const side = el.name.split(':')[2]
    const defaultConditionTr = document.getElementById(`parking:condition:${side}:default`)

    if (el.value === '' && !defaultConditionTr?.querySelector('input')?.value)
        hideElement(defaultConditionTr!.id)
    else
        showElement(defaultConditionTr!.id)
}

function showElement(id: string) {
    document.getElementById(id)!.style.display = ''
}

function hideElement(id: string) {
    document.getElementById(id)!.style.display = 'none'
}

const displayNone = { display: 'none' }

const laneValues = [
    'parallel',
    'diagonal',
    'perpendicular',
    'no_parking',
    'no_stopping',
    'marked',
    'fire_lane',
    'no',
    'separate',
]

const typeValues = [
    'on_street',
    'street_side',
    'on_kerb',
    'half_on_kerb',
    'painted_area_only',
    'shoulder',
]

const conditionValues = [
    'free',
    'ticket',
    'disc',
    'residents',
    'customers',
    'private',
]

let osmChangeListener: (way: OsmWay) => void

export function setOsmChangeListener(listener: (way: OsmWay) => void) {
    osmChangeListener = listener
}

function formToOsmWay(osm: OsmWay, form: HTMLFormElement) {
    const regex = /^parking:/

    const supprtedTags = parkingLaneTagTemplates
        .map(x => {
            const tagRegexPart = x
                .replace('{side}', '(both|right|left)')
                .replace('{type}', '(parallel|diagonal|perpendicular)')
            return new RegExp('^' + tagRegexPart + '$')
        })

    for (const tagKey of Object.keys(osm.tags)) {
        if (supprtedTags.some(regex => regex.test(tagKey)))
            delete osm.tags[tagKey]
    }

    for (const input of Array.from(form.elements)) {
        if ((input instanceof HTMLInputElement || input instanceof HTMLSelectElement) &&
            regex.test(input.name) && input.value)
            osm.tags[input.name] = input.value
    }

    return osm
}
