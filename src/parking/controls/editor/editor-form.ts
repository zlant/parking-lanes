import { hyper } from 'hyperhtml/esm'
import { OsmTags, OsmWay } from '../../../utils/types/osm-data'
import { WaysInRelation } from '../../../utils/types/osm-data-storage'
import { OsmKeyValue } from '../../../utils/types/preset'
import { presets } from './presets'
import { getAllTagsBlock } from '../lane-info'
import { parseConditionalTag, ConditionalValue } from '../../../utils/conditional-tag'
import { ParkingTagInfo } from '../../../utils/types/parking'

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

const laneValues = [
    'lane',
    'street_side',
    'on_kerb',
    'half_on_kerb',
    'shoulder',
    'no',
    'separate',
    'yes',
]

const orientationValues = [
    'parallel',
    'diagonal',
    'perpendicular',
]

const reasonValues = [
    'bus_lane',
    'rails',
    'bus_stop',
    'crossing',
    'cycleway',
    'driveway',
    'dual_carriage',
    'fire_lane',
    'junction',
    'loading_zone',
    'markings',
    'narrow',
    'passenger_loading_zone',
    'priority_road',
    'street_cleaning',
    'turnaround',
    'turn_lane',
]

const restrictionValues = [
    'no_parking',
    'no_standing',
    'no_stopping',
    'loading_only',
    'charging_only',
]

const parkingLaneTags: ParkingTagInfo[] = [
    {
        template: 'parking:{side}',
        values: laneValues,
        checkForNeedShowing: (tags: OsmTags, side: string) => true,
        dependentTags: [
            'parking:{side}:reason',
            'parking:{side}:orientation',
            'parking:{side}:surface',
        ],
    },
    {
        template: 'parking:{side}:reason',
        values: reasonValues,
        checkForNeedShowing: (tags: OsmTags, side: string) => tags[`parking:${side}`] === 'no',
    },
    {
        template: 'parking:{side}:orientation',
        values: orientationValues,
        checkForNeedShowing: (tags: OsmTags, side: string) =>
            ['lane', 'street_side', 'on_kerb', 'half_on_kerb', 'shoulder'].includes(tags[`parking:${side}`]),
    },
    {
        template: 'parking:{side}:surface',
        checkForNeedShowing: (tags: OsmTags, side: string) =>
            ['lane', 'street_side', 'on_kerb', 'half_on_kerb', 'shoulder', 'yes'].includes(tags[`parking:${side}`]),
    },
    {
        template: 'parking:{side}:fee',
        values: ['yes', 'no'],
        checkForNeedShowing: (tags: OsmTags, side: string) => true,
        dependentTags: [
            'parking:{side}:fee:conditional',
        ],
    },
    {
        template: 'parking:{side}:fee:conditional',
        checkForNeedShowing: (tags: OsmTags, side: string) => !!tags[`parking:${side}:fee`],
    },
    {
        template: 'parking:{side}:maxstay',
        checkForNeedShowing: (tags: OsmTags, side: string) => true,
        dependentTags: [
            'parking:{side}:maxstay:conditional',
        ],
    },
    {
        template: 'parking:{side}:maxstay:conditional',
        checkForNeedShowing: (tags: OsmTags, side: string) => !!tags[`parking:${side}:maxstay`],
    },
    {
        template: 'parking:{side}:access',
        checkForNeedShowing: (tags: OsmTags, side: string) => true,
        dependentTags: [
            'parking:{side}:access:conditional',
        ],
    },
    {
        template: 'parking:{side}:access:conditional',
        checkForNeedShowing: (tags: OsmTags, side: string) => !!tags[`parking:${side}:access`],
    },
    {
        template: 'parking:{side}:restriction',
        values: restrictionValues,
        checkForNeedShowing: (tags: OsmTags, side: string) => true,
        dependentTags: [
            'parking:{side}:restriction:conditional',
            'parking:{side}:restriction:reason',
        ],
    },
    {
        template: 'parking:{side}:restriction:conditional',
        checkForNeedShowing: (tags: OsmTags, side: string) => !!tags[`parking:${side}:restriction`],
    },
    {
        template: 'parking:{side}:restriction:reason',
        values: reasonValues,
        checkForNeedShowing: (tags: OsmTags, side: string) => !!tags[`parking:${side}:restriction`],
    },
]

function getTagInputs(osm: OsmWay, side: 'both'|'left'|'right') {
    const inputs: HTMLElement[] = []

    const unsupportedTags = Object.keys(osm.tags)
        .filter(x => x.startsWith('parking:'))
        .filter(x => x.includes(side))
        /* eslint-disable @typescript-eslint/indent */
        .map<ParkingTagInfo>(x => ({
            template: x.replace(side, '{side}'),
            checkForNeedShowing: (tags, side) => true,
        }))
        /* eslint-enable @typescript-eslint/indent */
        .filter(x => !parkingLaneTags.find(t => t.template === x.template))

    for (const tagInfo of parkingLaneTags.concat(unsupportedTags))
        inputs.push(getTagInput(osm, side, tagInfo))
    return inputs
}

function getTagInput(osm: OsmWay, side: string, tagInfo: ParkingTagInfo) {
    const tag = tagInfo.template.replace('{side}', side)
    const label = tagInfo.template.startsWith('parking:{side}') ?
        tagInfo.template.replace('parking:{side}', '').slice(1) || side :
        tag
    const hide = !tagInfo.checkForNeedShowing(osm.tags, side)
    return tag.endsWith(':conditional') ?
        getConditionalInput(osm, tag, label, hide, tagInfo.values) :
        getSimpleTagInput(osm, tag, label, hide, tagInfo.values)
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

function getSimpleTagInput(osm: OsmWay, tag: string, label: string, hide: boolean, values?: string[]) {
    const value = osm.tags[tag]
    const input = values ? getSelectInput(tag, value, values) : getTextInput(tag, value)
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

function getConditionalInput(osm: OsmWay, tag: string, label: string, hide: boolean, values?: string[]): HTMLElement {
    const parsedConditionalTag = osm.tags[tag] ? parseConditionalTag(osm.tags[tag]) : []
    parsedConditionalTag.push({ value: '', condition: null })

    return hyper`
        <tr id="${tag}" 
            class="conditional-tag"
            style=${{ display: hide && !osm.tags[tag] ? 'none' : null }}>
            <td colspan="2">
                <table>
                    <tr><td><label title="${tag}">${label}</label></td></tr>
                    ${parsedConditionalTag.map((conditionalValue, i) => getConditionalPartInput(osm, tag, conditionalValue, i, values))}
                </table>
            </td>
        </tr>`
}

function getConditionalPartInput(osm: OsmWay, tag: string, part: ConditionalValue, partindex: number, values?: string[]) {
    const input = values ?
        getSelectInput(tag, part.value, values) :
        getTextInput(tag, part.value)
    input.onchange = (e) => handleInputChange(e, osm)
    input.dataset.partindex = partindex.toString()
    input.dataset.tokenname = 'condition'

    return hyper`
        <tr>
            <td>
                ${input}
            </td>
            <td>
                @
                (<input type="text"
                       placeholder="time interval"
                       name="${tag}"
                       value="${part.condition}"
                       data-partindex="${partindex}"
                       data-tokenname="time_interval"
                       oninput=${(e) => handleInputChange(e, osm)}>)
            </td>
        </tr>`
}

function handleInputChange(e: Event, osm: OsmWay) {
    if (!(e.currentTarget instanceof HTMLInputElement || e.currentTarget instanceof HTMLSelectElement) ||
        e.currentTarget.form == null)
        return

    const newOsm = formToOsmWay(osm, e.currentTarget.form)
    osmChangeListener?.(newOsm)

    const el = e.target as HTMLSelectElement || e.target as HTMLInputElement
    const side = el.name.split(':')[1]
    const tagInfo = parkingLaneTags.find(x => x.template === el.name.replace(side, '{side}'))

    if (tagInfo?.dependentTags) {
        for (const dependentTag of tagInfo.dependentTags) {
            const sidedDependentTag = dependentTag.replace('{side}', side)
            if (osm.tags[sidedDependentTag] ||
                parkingLaneTags.find(x => x.template === dependentTag)?.checkForNeedShowing(osm.tags, side))
                showElement(sidedDependentTag)
            else
                hideElement(sidedDependentTag)
        }
    }
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

    const inputSelector = `form[id='${osm.id}'] [name='${`parking:${side}`}']`
    const element = document.querySelector(inputSelector) as HTMLInputElement | HTMLSelectElement
    element.dispatchEvent(new Event('change'))
}

function showElement(id: string) {
    document.getElementById(id)!.style.display = ''
}

function hideElement(id: string) {
    document.getElementById(id)!.style.display = 'none'
}

const displayNone = { display: 'none' }

let osmChangeListener: (way: OsmWay) => void

export function setOsmChangeListener(listener: (way: OsmWay) => void) {
    osmChangeListener = listener
}

function formToOsmWay(osm: OsmWay, form: HTMLFormElement) {
    const regex = /^parking:(?!.*conditional$)/

    for (const tagKey of Object.keys(osm.tags).filter(x => x.startsWith('parking:')))
        delete osm.tags[tagKey]

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
