import L from 'leaflet'
import { hyper } from 'hyperhtml/esm'
import { legend } from '../legend'

export default L.Control.extend({
    onAdd: (map: L.Map) => hyper`
        <div id="legend"
             class="leaflet-control-layers control-padding control-bigfont"
             onmouseenter=${handleLegendMouseEnter}
             onmouseleave=${handleLegendMouseLeave}
             onclick=${changeLegendPinning}>
            Legend
        </div>`,
})

let legendPinned = false

function changeLegendPinning(e: Event) {
    if (e.currentTarget instanceof Element) {
        if (legendPinned)
            setLegendHead(e.currentTarget)
        else
            setLegendBody(e.currentTarget)
    }

    legendPinned = !legendPinned
}

function handleLegendMouseEnter(e: Event) {
    if (!legendPinned && e.currentTarget instanceof Element)
        setLegendBody(e.currentTarget)
}

function handleLegendMouseLeave(e: Event) {
    if (!legendPinned && e.currentTarget instanceof Element)
        setLegendHead(e.currentTarget)
}

function setLegendBody(el: Element) {
    el.innerHTML = legend
        .map(x => "<div class='legend-element' style='background-color:" + x.color + ";'></div> " + x.text)
        .join('<br />')
}

function setLegendHead(el: Element) {
    el.innerHTML = 'Legend'
}
