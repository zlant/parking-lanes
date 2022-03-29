import { hyper } from 'hyperhtml/esm'
import { OsmWay } from '../../../utils/types/osm-data'
import { WaysInRelation } from '../../../utils/types/osm-data-storage'
import { OsmKeyValue } from '../../../utils/types/preset'
import { presets } from './presets'
import { getAllTagsBlock } from '../lane-info'
import { parseConditionalTag, ConditionalValue } from '../../../utils/conditional-tag'

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
    'parking:condition:{side}:conditional',
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

    if (tagTemplate === 'parking:condition:{side}:conditional') {
        const conditionTag = 'parking:condition:{side}'
            .replace('{side}', side)
        const hide = !osm.tags[conditionTag]
        return getConditionalInput(osm, tag, label, hide)
    }

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
            hide = !osm.tags[tagTemplate.replace('{side}', side)]
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
            input.placeholder = `eg. ${osm.tags.surface ?? input.placeholder}`
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

    input.onchange = (e) => handleInputChange(e, osm)

    return hyper`
        <tr id="${tag}"
            style=${{ display: hide && !value ? 'none' : null }}>
            <td><label title="${tag}">${label}</label></td>
            <td>
                ${input}
            </td>
        </tr>` as HTMLElement
}

function handleInputChange(e: Event, osm: OsmWay) {
    if (!(e.currentTarget instanceof HTMLInputElement || e.currentTarget instanceof HTMLSelectElement) ||
        e.currentTarget.form == null)
        return

    const newOsm = formToOsmWay(osm, e.currentTarget.form)
    osmChangeListener?.(newOsm)
}

function getSelectInput(tag: string, value: string, values: string[]): HTMLSelectElement {
    const options = !value || values.includes(value) ?
        ['', ...values] :
        ['', value, ...values]

    return hyper`
        <select name=${tag}
                class="editor-form__select-input">
            ${options.map(o => hyper`<option value=${o} selected=${value === o}>${o}</option>`)}
        </select>`
}

function getTextInput(tag: string, value: string): HTMLInputElement {
    return hyper`
        <input type="text"
               class="editor-form__text-input"
               placeholder="${tag}"
               name="${tag}"
               value="${value ?? ''}">`
}

function getConditionalInput(osm: OsmWay, tag: string, label: string, hide: boolean): HTMLElement {
    const parsedConditionalTag = osm.tags[tag] ? parseConditionalTag(osm.tags[tag]) : []
    parsedConditionalTag.push({ value: '', condition: null })

    return hyper`
        <tr id="${tag}" 
            class="conditional-tag"
            style=${{ display: hide ? 'none' : null }}>
            <td colspan="2">
                <table>
                    <tr><td><label title="${tag}">${label}</label></td></tr>
                    ${parsedConditionalTag.map((conditionalValue, i) => getConditionalPartInput(osm, tag, conditionalValue, i))}
                </table>
            </td>
        </tr>`
}

function getConditionalPartInput(osm: OsmWay, tag: string, part: ConditionalValue, partindex: number) {
    const selectInput = getSelectInput(`${tag}`, part.value, conditionValues)
    selectInput.onchange = (e) => handleInputChange(e, osm)
    selectInput.dataset.partindex = partindex.toString()
    selectInput.dataset.tokenname = 'condition'

    return hyper`
        <tr>
            <td>
                ${selectInput}
            </td>
            <td>
                <input type="text"
                       placeholder="time interval"
                       name="${tag}"
                       value="${part.condition}"
                       data-partindex="${partindex}"
                       data-tokenname="time_interval"
                       oninput=${(e) => handleInputChange(e, osm)}>
            </td>
        </tr>`
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

    const condtionalBlockId = `parking:condition:${side}:conditional`
    if (el.value)
        showElement(condtionalBlockId)
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
    'marked',
    'no',
    'yes',
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
    'disabled',
    'no_parking',
    'no_standing',
    'no_stopping',
    'no',
]

let osmChangeListener: (way: OsmWay) => void

export function setOsmChangeListener(listener: (way: OsmWay) => void) {
    osmChangeListener = listener
}

function formToOsmWay(osm: OsmWay, form: HTMLFormElement) {
    const regex = /^parking:(?!.*conditional$)/

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

    const conditionals: {[tag: string]: string[][]} = {}

    for (const input of Array.from(form.elements)) {
        if (input instanceof HTMLInputElement || input instanceof HTMLSelectElement) {
            if (regex.test(input.name) && input.value)
                osm.tags[input.name] = input.value

            if (input.dataset.partindex) {
                if (!conditionals[input.name])
                    conditionals[input.name] = []

                if (conditionals[input.name].length < parseInt(input.dataset.partindex) + 1)
                    conditionals[input.name].push(['', ''])

                conditionals[input.name][parseInt(input.dataset.partindex)][input.dataset.tokenname === 'condition' ? 0 : 1] = input.value
            }
        }
    }

    for (const conditionalTag in conditionals) {
        if (conditionals[conditionalTag].length > 0 && conditionals[conditionalTag][0][0]) {
            osm.tags[conditionalTag] = conditionals[conditionalTag]
                .filter(x => x[0])
                .map(x => x[1] ? `${x[0]} @ (${x[1]})` : x[0])
                .join('; ')
        }
    }

    return osm
}
