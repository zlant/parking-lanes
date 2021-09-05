import { hyper } from 'hyperhtml/esm'
import { presets } from './presets'

export function getLaneEditForm(osm: any, waysInRelation: any, cutLaneListener: any) {
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

function existsSideTags(form: any, side: string) {
    const regex = new RegExp('^parking:.*' + side)

    for (const input of form) {
        if (regex.test(input.name) && input.value !== '')
            return true
    }

    return false
}

function handleSideSwitcherChange(e: Event) {
    if(e.currentTarget === null) {
        return;
    }
    // @ts-ignore
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

function getSideGroup(osm: any, side: string) {
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

function getTagInupts(osm: any, side: string) {
    const inputs = []
    const type = osm.tags[`parking:lane:${side}`] || 'type'
    for (const tagTemplate of parkingLaneTagTemplates)
        inputs.push(getTagInupt(osm, side, type, tagTemplate))
    return inputs
}

function getTagInupt(osm: any, side: string, parkingType: any, tagTemplate: any) {
    const tag = tagTemplate
        .replace('{side}', side)
        .replace('{type}', parkingType)

    const tagSplit = tag.split(':')
    const label = tagSplit[Math.floor(tagSplit.length / 2) * 2 - 1]

    const value = osm.tags[tag]

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
        default:
            input = getTextInput(tag, value)
            break
    }

    input.onchange = (e: Event) => {
        if(e.currentTarget === null) {
            return;
        }
        // @ts-ignore
        const newOsm = formToOsmWay(osm, e.currentTarget.form)
        // @ts-ignore
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

function getSelectInput(tag: string, value: any, values: any[]) {
    const options = values.includes(value) ?
        ['', ...values] :
        ['', value, ...values]

    return hyper`
        <select name=${tag}>
            ${options.map(o => hyper`<option value=${o} selected=${value === o}>${o}</option>`)}
        </select>`
}

function getTextInput(tag: string, value: any) {
    return hyper`
        <input type="text" 
               placeholder="${tag}"
               name="${tag}"
               value="${value != null ? value : ''}">`
}

function getPresetSigns(osm: any, side: any) {
    return presets.map(x => hyper`
        <img src=${x.img.src}
             class="sign-preset"
             height=${x.img.height}
             width=${x.img.width}
             alt=${x.img.alt}
             title=${x.img.title}
             onclick=${() => handlePresetClick(x.tags, osm, side)}>`)
}

function handlePresetClick(tags: any, osm: any, side: any) {
    for (const tag of tags) {
        // @ts-ignore
        document.getElementById(osm.id)[tag.k.replace('{side}', side)].value = tag.v
    }

    // @ts-ignore
    document.getElementById(osm.id)['parking:lane:' + side].dispatchEvent(new Event('change'))
}

function handleLaneTagInput() {
    // @ts-ignore
    const side = this.name.split(':')[2]
    // Type tag should only exist when parking:lane:side has one on the following values
    // @ts-ignore
    if (['parallel', 'diagonal', 'perpendicular'].includes(this.value)) {
        // exact name of the tag depends on parking:lane:side value
        const typeTagTr = document.querySelector('[id^="parking:lane:' + side + ':"]')
        // @ts-ignore
        typeTagTr.style.display = ''

        const typeTagSelect = document.querySelector('[name^="parking:lane:' + side + ':"]')
        // @ts-ignore
        typeTagSelect.name = 'parking:lane:' + side + ':' + this.value
    } else {
        // @ts-ignore
        document.querySelector('[id^="parking:lane:' + side + ':"]').style.display = 'none'
    }
}

function handleConditionTagInput() {
    // @ts-ignore
    const side = this.name.split(':')[2]
    const maxstayTr = document.getElementById('parking:condition:' + side + ':maxstay')

    // @ts-ignore
    if (this.value === 'disc') {
        // @ts-ignore
        hideElement(maxstayTr.id)
    } else {
        // @ts-ignore
        showElement(maxstayTr.id)
    }
}

function handleTimeIntervalTagInput() {
    // @ts-ignore
    const side = this.name.split(':')[2]
    const defaultConditionTr = document.getElementById('parking:condition:' + side + ':default')
    // @ts-ignore
    if (this.value === '') {
        // @ts-ignore
        hideElement(defaultConditionTr.id)
    } else {
        // @ts-ignore
        showElement(defaultConditionTr.id)
    }
}

function showElement(id: string) {
    (document.getElementById(id) as HTMLElement).style.display = ''
}

function hideElement(id: string) {
    (document.getElementById(id) as HTMLElement).style.display = 'none'
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

let osmChangeListener: any

export function setOsmChangeListener(listener: any) {
    osmChangeListener = listener
}

function formToOsmWay(osm: any, form:any) {
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

    for (const input of form) {
        if (regex.test(input.name) && input.value)
            osm.tags[input.name] = input.value
    }

    return osm
}
