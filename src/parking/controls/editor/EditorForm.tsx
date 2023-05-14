import type React from 'react'
import { useState } from 'react'
import { type OsmTags, type OsmWay } from '../../../utils/types/osm-data'
import { type WaysInRelation } from '../../../utils/types/osm-data-storage'
import { AllTagsBlock } from '../LaneInfo'
import { transpose } from 'osm-parking-tag-updater/src/components/Tool/transpose/transpose'
import { SideGroup } from './SideGroup'
import { TagUpdaterModal } from './TagUpdaterModal'

export function LaneEditForm(props: {
    osm: OsmWay
    waysInRelation: WaysInRelation
    onCutLane: (way: OsmWay) => void
    onChange: (way: OsmWay) => void
}) {
    const existsRightTags = existsSideTags(props.osm.tags, 'right')
    const existsLeftTags = existsSideTags(props.osm.tags, 'left')
    const existsBothTags = existsSideTags(props.osm.tags, 'both')

    const [bothBlockShown, setBothBlockShown] = useState(!existsRightTags && !existsLeftTags && existsBothTags)
    const [tagUpdaterModalShown, setTagUpdaterModalShown] = useState(false)

    const forceUpdate = useForceUpdate()

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
                        onClick={() => props.onCutLane(props.osm)}>
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
                {bothBlockShown ? <SideGroup osm={props.osm} side='both' onChange={handleInputChange} /> : null}
                {!bothBlockShown ? <SideGroup osm={props.osm} side='right' onChange={handleInputChange} /> : null}
                {!bothBlockShown ? <SideGroup osm={props.osm} side='left' onChange={handleInputChange} /> : null}
                <AllTagsBlock tags={props.osm.tags} />
            </div>

            {tagUpdaterModalShown ?
                <TagUpdaterModal
                    osm={props.osm}
                    onUpdate={() => handleUpdateTagsClick()}
                    onClose={() => setTagUpdaterModalShown(false)} /> :
                null}
        </form>
    )

    function handleInputChange(e: React.SyntheticEvent, osm: OsmWay) {
        if (!(e.currentTarget instanceof HTMLInputElement || e.currentTarget instanceof HTMLSelectElement) ||
            e.currentTarget.form == null)
            return

        const newOsm = formToOsmWay(osm, e.currentTarget.form)
        props.onChange(newOsm)

        forceUpdate()
    }

    function handleUpdateTagsClick() {
        const way = props.osm
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
}

function useForceUpdate() {
    const [, setValue] = useState(0)
    return () => setValue(value => value + 1)
}

function existsSideTags(tags: OsmTags, side: string) {
    const regex = new RegExp(`^parking:.*${side}`)
    return Object.keys(tags).some(x => regex.test(x))
}

function canUpdateTags(way: OsmWay) {
    const updateInfo = transpose(Object.entries(way.tags).map(x => `${x[0]}=${x[1]}`))
    return Object.keys(updateInfo.newTagObjects).length > 0
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
