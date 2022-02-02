import L from 'leaflet'
import { hyper } from 'hyperhtml/esm'
import { OsmDataSource } from '../../utils/types/osm-data'

export default L.Control.extend({
    onAdd: () => hyper`
        <div id="fetch-control"
             class="fetch-control"
             tabindex="-1"
             onblur="${handleBlur}"
             onmousedown=${L.DomEvent.stopPropagation}
             ondblclick=${L.DomEvent.stopPropagation}
             onpointerdown=${L.DomEvent.stopPropagation}
             onclick=${L.DomEvent.stopPropagation}>
            <div class="leaflet-control-layers control-bigfont control-button">
                <div class="fetch-control_wrapper">
                    <div id="download-btn" class="fetch-control_button">
                        Fetch parking data
                    </div>
                    <div class="fetch-control_toggle"
                         onclick=${handleToggleClick} />
                </div>
            </div>
            <div id="data-source-select" class="fetch-control_items">
                <div data-value="${OsmDataSource.OverpassDe}"
                     class="fetch-control_item"
                     onclick="${handleDataSourceChange}">
                    From overpass-turbo
                </div>
                <div data-value="${OsmDataSource.OsmOrg}"
                     class="fetch-control_item"
                     onclick="${handleDataSourceChange}">
                    From osm.org
                </div>
                <div data-value="${OsmDataSource.OverpassVk}"
                     class="fetch-control_item"
                     onclick="${handleDataSourceChange}">
                    From overpass-vk
                </div>
            </div>
        </div>`,

    setFetchDataBtnClickListener(listener: (e?: MouseEvent) => any) {
        document.getElementById('download-btn')!.onclick = listener
        return this
    },

    setFetchDataBtnText(newText: string) {
        (document.getElementById('download-btn') as HTMLButtonElement)
            .innerText = newText
    },

    setDataSource(dataSource: OsmDataSource) {
        updateItemsStyles(dataSource)
        return this
    },

    setDataSourceChangeListener(listener: (dataSource: OsmDataSource) => void) {
        dataSourceChangeListener = listener
        return this
    },
})

// data source select list opened state

let opened: boolean = false

function setOpenedState(newState: boolean) {
    if (newState)
        document.getElementById('fetch-control')?.classList.add('opened')
    else
        document.getElementById('fetch-control')?.classList.remove('opened')

    opened = newState
}

function handleToggleClick(e: MouseEvent) {
    setOpenedState(!opened)
}

function handleBlur(e: MouseEvent) {
    setOpenedState(false)
}

// data source change handlers

let dataSourceChangeListener: (dataSource: OsmDataSource) => void = () => {}

function handleDataSourceChange(e: Event) {
    const value = (e.target as HTMLElement).dataset.value
    if (!value)
        return

    const dataSource = parseInt(value)
    dataSourceChangeListener(dataSource)
    updateItemsStyles(dataSource)
    setOpenedState(false)
}

function updateItemsStyles(dataSource: OsmDataSource) {
    document.querySelectorAll('#data-source-select > .fetch-control_item').forEach(el => {
        const htmlEl = el as HTMLElement
        if (htmlEl.dataset.value === dataSource.toString())
            htmlEl.classList.add('fetch-control_item--selected')
        else
            htmlEl.classList.remove('fetch-control_item--selected')
    })
}
