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
    if (legendPinned)
        setLegendHead(e)
    else
        setLegendBody(e)

    legendPinned = !legendPinned
}

function handleLegendMouseEnter(e: Event) {
    if (!legendPinned)
        setLegendBody(e)
}

function handleLegendMouseLeave(e: Event) {
    if (!legendPinned)
        setLegendHead(e)
}

function setLegendBody(e: Event) {
    if(e.currentTarget === null) {
        return;
    }
    // @ts-ignore
    e.currentTarget.innerHTML = legend
        .map(x => "<div class='legend-element' style='background-color:" + x.color + ";'></div> " + x.text)
        .join('<br />')
}

function setLegendHead(e: Event) {
    if(e.currentTarget === null) {
        return;
    }
    // @ts-ignore
    e.currentTarget.innerHTML = 'Legend'
}
