import type React from 'react'
import { useState } from 'react'
import { type OsmTags, type OsmWay } from '../../../utils/types/osm-data'
import { type WaysInRelation } from '../../../utils/types/osm-data-storage'
import { type OsmKeyValue } from '../../../utils/types/preset'
import { presets } from './presets'
import { AllTagsBlock } from '../LaneInfo'
import { parseConditionalTag, type ConditionalValue } from '../../../utils/conditional-tag'
import { type ParkingTagInfo } from '../../../utils/types/parking'
import { transpose } from 'osm-parking-tag-updater/src/components/Tool/transpose/transpose'

export function LaneEditForm(props: {
    osm: OsmWay
    waysInRelation: WaysInRelation
    cutLaneListener: (way: OsmWay) => void
    changeListener?: (way: OsmWay) => void
}) {
    if (props.changeListener)
        osmChangeListener = props.changeListener

    const existsRightTags = existsSideTags(props.osm.tags, 'right')
    const existsLeftTags = existsSideTags(props.osm.tags, 'left')
    const existsBothTags = existsSideTags(props.osm.tags, 'both')

    const [bothBlockShown, setBothBlockShown] = useState(!existsRightTags && !existsLeftTags && existsBothTags)
    const [tagUpdaterModalShown, setTagUpdaterModalShown] = useState(false)

    return (
        <form id={props.osm.id.toString()}
            className="editor-form">
            <div className="editor-form__header">
                <label className="editor-form__side-switcher">
                    <input id="side-switcher"
                        type="checkbox"
                        className="editor-form__side-switcher-checkbox"
                        onChange={() => setBothBlockShown(!bothBlockShown)} />
                    Both
                </label>
                <div className="editor-form__utils">
                    <button title="Cut lane"
                        type="button"
                        className="editor-form__cut-button"
                        style={{ display: props.waysInRelation[props.osm.id] ? 'none' : undefined }}
                        onClick={() => props.cutLaneListener(props.osm)}>
                        ✂
                    </button>
                    <button title="Update tags"
                        type="button"
                        className="editor-form__cut-button"
                        style={{ display: canUpdateTags(props.osm) ? undefined : 'none' }}
                        onClick={() => setTagUpdaterModalShown(true)}>
                        🔄
                    </button>
                </div>
            </div>
            <div id="tags-block">
                {bothBlockShown ? <SideGroup osm={props.osm} side='both' /> : null}
                {!bothBlockShown ? <SideGroup osm={props.osm} side='right' /> : null}
                {!bothBlockShown ? <SideGroup osm={props.osm} side='left' /> : null}
                <AllTagsBlock tags={props.osm.tags} />
            </div>

            {tagUpdaterModalShown ? <TagUpdaterModal osm={props.osm} onClose={() => setTagUpdaterModalShown(false)} /> : null}
        </form>
    )
}

function existsSideTags(tags: OsmTags, side: string) {
    const regex = new RegExp(`^parking:.*${side}`)
    return Object.keys(tags).some(x => regex.test(x))
}

function SideGroup(props: {
    osm: OsmWay
    side: 'both' | 'left' | 'right'
}) {
    return (
        <div id={props.side}
            className={`tags-block tags-block_${props.side}`}>
            <table>
                <TagInputs osm={props.osm} side={props.side} />
            </table>
        </div>
    )
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
        values: ['yes', 'no'],
        checkForNeedShowing: (tags: OsmTags, side: string) => true,
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
        checkForNeedShowing: (tags: OsmTags, side: string) => true,
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
        checkForNeedShowing: (tags: OsmTags, side: string) => true,
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
        values: restrictionValues,
        checkForNeedShowing: (tags: OsmTags, side: string) => true,
    },
    {
        template: 'parking:{side}:restriction:reason',
        values: reasonValues,
        checkForNeedShowing: (tags: OsmTags, side: string) => !!tags[`parking:${side}:restriction`],
    },
]

function TagInputs(props: {
    osm: OsmWay
    side: 'both' | 'left' | 'right'
}) {
    const unsupportedTags = Object.keys(props.osm.tags)
        .filter(x => x.startsWith('parking:'))
        .filter(x => x.includes(props.side))
        /* eslint-disable @typescript-eslint/indent */
        .map<ParkingTagInfo>(x => ({
            template: x.replace(props.side, '{side}'),
            checkForNeedShowing: (tags, side) => true,
        }))
        /* eslint-enable @typescript-eslint/indent */
        .filter(x => !parkingLaneTags.find(t => t.template === x.template))

    const inputs = parkingLaneTags.concat(unsupportedTags)
        .map(tagInfo => <TagInput key={tagInfo.template} osm={props.osm} side={props.side} tagInfo={tagInfo} />)

    return <tbody>{inputs}</tbody>
}

function TagInput(props: {
    osm: OsmWay
    side: 'both' | 'left' | 'right'
    tagInfo: ParkingTagInfo
}) {
    const tag = props.tagInfo.template.replace('{side}', props.side)
    const label = props.tagInfo.template.startsWith('parking:{side}') ?
        props.tagInfo.template.replace('parking:{side}', '').slice(1) || props.side :
        tag
    const hide = !props.tagInfo.checkForNeedShowing(props.osm.tags, props.side)
    return tag.endsWith(':conditional') ?
        <ConditionalInput osm={props.osm} tag={tag} label={label} hide={hide} values={props.tagInfo.values} /> :
        <SimpleTagInput osm={props.osm} tag={tag} label={label} hide={hide} values={props.tagInfo.values} />
}

function SelectInput(props: {
    tag: string
    value: string
    values: string[]
    onChange: (e: React.ChangeEvent) => void
}) {
    const options = !props.value || props.values.includes(props.value) ?
        ['', ...props.values] :
        ['', props.value, ...props.values]

    return (
        <select name={props.tag}
            defaultValue={props.value}
            className="editor-form__select-input"
            onChange={e => props.onChange(e)}>
            {options.map(o => <option
                key={o}
                value={o}>
                {o}
            </option>)}
        </select>
    )
}

function TextInput(props: {
    tag: string
    value: string
    onChange: (e: React.ChangeEvent) => void
}) {
    return (
        <input type="text"
            className="editor-form__text-input"
            placeholder={props.tag}
            name={props.tag}
            value={props.value ?? ''}
            onChange={e => props.onChange(e)} />
    )
}

function SimpleTagInput(props: {
    osm: OsmWay
    tag: string
    label: string
    hide: boolean
    values?: string[]
}) {
    const value = props.osm.tags[props.tag]

    return (
        <tr id={props.tag}
            style={{ display: props.hide && !value ? 'none' : undefined }}>
            <td><label title={props.tag}>{props.label}</label></td>
            <td>
                {
                    props.values ?
                        <SelectInput
                            tag={props.tag}
                            value={value}
                            values={props.values}
                            onChange={e => handleInputChange(e, props.osm)} /> :
                        <TextInput
                            tag={props.tag}
                            value={value}
                            onChange={e => handleInputChange(e, props.osm)} />
                }
            </td>
        </tr>
    )
}

function ConditionalInput(props: {
    osm: OsmWay
    tag: string
    label: string
    hide: boolean
    values?: string[]
}) {
    const parsedConditionalTag = props.osm.tags[props.tag] ? parseConditionalTag(props.osm.tags[props.tag]) : []
    parsedConditionalTag.push({ value: '', condition: null })

    return (
        <tr id={props.tag}
            className="conditional-tag"
            style={{ display: props.hide ? 'none' : undefined }}>
            <td style={{ verticalAlign: 'top' }}>
                <label title={props.tag}>{props.label}</label>
            </td>
            <td>
                <table>
                    <tbody>
                        {parsedConditionalTag
                            .map((conditionalValue, i) =>
                                <ConditionalPartInput
                                    key={props.tag}
                                    osm={props.osm}
                                    tag={props.tag}
                                    part={conditionalValue}
                                    partindex={i}
                                    values={props.values} />)
                        }
                    </tbody>
                </table>
            </td>
        </tr>
    )
}

function ConditionalPartInput(props: {
    osm: OsmWay
    tag: string
    part: ConditionalValue
    partindex: number
    values?: string[]
}) {
    return (
        <tr>
            <td>
                {
                    props.values ?
                        <SelectInput
                            tag={props.tag}
                            value={props.part.value}
                            values={props.values}
                            data-partindex={props.partindex.toString()}
                            data-tokenname="partindex"
                            onChange={e => handleInputChange(e, props.osm)} /> :
                        <TextInput
                            tag={props.tag}
                            value={props.part.value}
                            data-partindex={props.partindex.toString()}
                            data-tokenname="partindex"
                            onChange={e => handleInputChange(e, props.osm)} />
                }
            </td>
            <td>
                @
                <input type="text"
                    placeholder="time interval"
                    name={props.tag}
                    value={props.part.condition ?? undefined}
                    data-partindex={props.partindex.toString()}
                    data-tokenname="time_interval"
                    onInput={(e) => handleInputChange(e, props.osm)} />
            </td>
        </tr>
    )
}

function handleInputChange(e: React.SyntheticEvent, osm: OsmWay) {
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

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function getPresetSigns(osm: OsmWay, side: 'both' | 'left' | 'right') {
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

function canUpdateTags(way: OsmWay) {
    const updateInfo = transpose(Object.entries(way.tags).map(x => `${x[0]}=${x[1]}`))
    return Object.keys(updateInfo.newTagObjects).length > 0
}

function TagUpdaterModal(props: {
    osm: OsmWay
    onClose: () => void
}) {
    const updateInfo = transpose(Object.entries(props.osm.tags).map(x => `${x[0]}=${x[1]}`))

    return (
        <div id="tag-updater-modal" className="modal">
            <div className="modal__header">
                <h2 className="modal__header">Update tags to new scheme</h2>
                <button type="button"
                    className="modal_close"
                    onClick={() => props.onClose()}>
                    ✖
                </button>
            </div>
            <div id="updated-tags">
                <h3 className="modal__subtitle">Updated tags</h3>
                <table className="updated-tags__table">
                    <thead>
                        <tr>
                            <th>Old tag</th>
                            <th>New tags</th>
                        </tr>
                    </thead>
                    <tbody>
                        {Object.keys(updateInfo.newTagObjects).map(k =>
                            <tr key={k}>
                                <td>{k}</td>
                                <td>{updateInfo.newTagObjects[k].newTags.map(nt => <div key={nt}>{nt}</div>)}</td>
                            </tr>)}
                    </tbody>
                </table>
            </div>
            <div id="manual-updating-tags">
                <h3 className="modal__subtitle">Required manual updating</h3>
                {Object.keys(updateInfo.newTagsManualCandidates)
                    .map(k => <div key={k}>{k}</div>)}
            </div>

            <div className="modal__footer">
                <button type="button"
                    className="button"
                    onClick={() => {
                        handleUpdateTagsClick(props.osm)
                        props.onClose()
                    }}>
                    Update tags
                </button>
            </div>
        </div>
    )
}

function handleUpdateTagsClick(way: OsmWay) {
    const updateInfo = transpose(Object.entries(way.tags).map(x => `${x[0]}=${x[1]}`))

    for (const tagMap of Object.entries(updateInfo.newTagObjects)) {
        const oldKey = tagMap[0].split('=')[0]
        // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
        delete way.tags[oldKey]
        for (const newTag of tagMap[1].newTags) {
            const [newKey, newValue] = newTag.split('=')
            way.tags[newKey] = newValue
        }
    }
}

function showElement(id: string) {
    document.getElementById(id)!.style.display = ''
}

function hideElement(id: string) {
    document.getElementById(id)!.style.display = 'none'
}

let osmChangeListener: (way: OsmWay) => void

export function setOsmChangeListener(listener: (way: OsmWay) => void) {
    osmChangeListener = listener
}

function formToOsmWay(osm: OsmWay, form: HTMLFormElement) {
    const regex = /^parking:(?!.*conditional$)/

    for (const tagKey of Object.keys(osm.tags).filter(x => x.startsWith('parking:'))) {
        // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
        delete osm.tags[tagKey]
    }

    const conditionals: Record<string, string[][]> = {}

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
