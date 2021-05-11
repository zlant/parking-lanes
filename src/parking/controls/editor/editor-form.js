import { hyper } from 'hyperhtml/esm'
import { presets } from './presets'

export function getLaneEditForm(osm, waysInRelation, cutLaneListener) {
    const form = hyper`
        <form id="${osm.$id}"
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
                    style="${waysInRelation[osm.$id] ? displayNone : null}"
                    onclick=${() => cutLaneListener(osm)}>
                ✂
            </button>
            <dl>
                ${getSideGroup(osm, 'both')}
                ${getSideGroup(osm, 'right')}
                ${getSideGroup(osm, 'left')}
            </dl>
        </form>`

    const existsRightTags = existsSideTags(form, 'right')
    const existsLeftTags = existsSideTags(form, 'left')
    const existsBothTags = existsSideTags(form, 'both')

    if (!existsRightTags && !existsLeftTags && existsBothTags) {
        form.querySelector('#right').style.display = 'none'
        form.querySelector('#left').style.display = 'none'
    } else if (!existsBothTags) {
        form.querySelector('#both').style.display = 'none'
    }

    form.querySelector('#side-switcher').checked = existsBothTags

    return form
}

function existsSideTags(form, side) {
    const regex = new RegExp('^parking:.*' + side)

    for (const input of form) {
        if (regex.test(input.name) && input.value !== '')
            return true
    }

    return false
}

function handleSideSwitcherChange(e) {
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

function getSideGroup(osm, side) {
    return hyper`
        <div id=${side}
             class="tags-block_${side}">
            ${getPresetSigns(osm, side)}
            <table>
                ${getTagInupts(osm, side)}
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
    'parking:condition:{side}:capacity',
]

function getTagInupts(osm, side) {
    const inputs = []
    const type = osm.tag.find(x => x.$k === `parking:lane:${side}`)?.$v || 'type'
    for (const tagTemplate of parkingLaneTagTemplates)
        inputs.push(getTagInupt(osm, side, type, tagTemplate))
    return inputs
}

function getTagInupt(osm, side, parkingType, tagTemplate) {
    const tag = tagTemplate
        .replace('{side}', side)
        .replace('{type}', parkingType)

    const tagSplit = tag.split(':')
    const label = tagSplit[Math.floor(tagSplit.length / 2) * 2 - 1]

    const value = osm.tag.find(x => x.$k === tag)?.$v

    /** @type {HTMLElement} */
    let input

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
                .includes(osm.tag.find(x => x.$k === laneTag)?.$v)
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
            hide = !osm.tag.find(x => x.$k === timeIntervalTag)?.$v
            break
        }
        case 'parking:condition:{side}:maxstay': {
            input = getTextInput(tag, value)
            const conditionTag = 'parking:condition:{side}'
                .replace('{side}', side)
            hide = osm.tag.find(x => x.$k === conditionTag)?.$v !== 'disc'
            break
        }
        default:
            input = getTextInput(tag, value)
            break
    }

    input.onchange = e => {
        const newOsm = formToOsmWay(osm, e.currentTarget.form)
        osmChangeListener?.(newOsm)
    }

    return hyper`
        <tr id="${tag}"
            style=${{ display: hide ? 'none' : null }}>
            <td><label>${label}</label></td>
            <td>
                ${input}
            </td>
        </tr>`
}

function getSelectInput(tag, value, values) {
    const options = values.includes(value) ?
        ['', value, ...values] :
        ['', ...values]

    return hyper`
        <select name=${tag}>
            ${options.map(o => hyper`<option value=${o} selected=${value === o}>${o}</option>`)}
        </select>`
}

function getTextInput(tag, value) {
    return hyper`
        <input type="text" 
               placeholder="${tag}"
               name="${tag}"
               value="${value != null ? value : ''}">`
}

function getPresetSigns(osm, side) {
    return presets.map(x => hyper`
        <img src=${x.img.src}
             class="sign-preset"
             height=${x.img.height}
             width=${x.img.width}
             alt=${x.img.alt}
             title=${x.img.title}
             onclick=${() => handlePresetClick(x.tags, osm, side)}>`)
}

function handlePresetClick(tags, osm, side) {
    for (const tag of tags)
        document.getElementById(osm.$id)[tag.k.replace('{side}', side)].value = tag.v

    document.getElementById(osm.$id)['parking:lane:' + side].dispatchEvent(new Event('change'))
}

function handleLaneTagInput() {
    const side = this.name.split(':')[2]
    // Type tag should only exist when parking:lane:side has one on the following values
    if (['parallel', 'diagonal', 'perpendicular'].includes(this.value)) {
        // exact name of the tag depends on parking:lane:side value
        const typeTagTr = document.querySelector('[id^="parking:lane:' + side + ':"]')
        typeTagTr.style.display = ''

        const typeTagSelect = document.querySelector('[name^="parking:lane:' + side + ':"]')
        typeTagSelect.name = 'parking:lane:' + side + ':' + this.value
    } else {
        document.querySelector('[id^="parking:lane:' + side + ':"]').style.display = 'none'
    }
}

function handleConditionTagInput() {
    const side = this.name.split(':')[2]
    const maxstayTr = document.getElementById('parking:condition:' + side + ':maxstay')

    if (this.value === 'disc')
        hideElement(maxstayTr.id)
    else
        showElement(maxstayTr.id)
}

function handleTimeIntervalTagInput() {
    const side = this.name.split(':')[2]
    const defaultConditionTr = document.getElementById('parking:condition:' + side + ':default')
    if (this.value === '')
        hideElement(defaultConditionTr.id)
    else
        showElement(defaultConditionTr.id)
}

function showElement(id) {
    document.getElementById(id).style.display = ''
}

function hideElement(id) {
    document.getElementById(id).style.display = 'none'
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

let osmChangeListener

export function setOsmChangeListener(listener) {
    osmChangeListener = listener
}

function formToOsmWay(osm, form) {
    const regex = /^parking:/

    const supprtedTags = parkingLaneTagTemplates
        .map(x => {
            const tagRegexPart = x
                .replace('{side}', '(both|right|left)')
                .replace('{type}', '(parallel|diagonal|perpendicular)')
            return new RegExp('^' + tagRegexPart + '$')
        })

    osm.tag = osm.tag.filter(tag => supprtedTags.every(rgx => !rgx.test(tag.$k)))

    for (const input of form) {
        if (regex.test(input.name) && input.value)
            osm.tag.push({ $k: input.name, $v: input.value })
    }

    return osm
}
