import L from 'leaflet'
import { hyper } from 'hyperhtml/esm'
import { legend } from '../legend'

export default L.Control.extend({
    onAdd: map => hyper`
        <div id="legend"
             class="leaflet-control-layers control-padding control-bigfont"
             onmouseenter=${handleLegendMouseEnter}
             onmouseleave=${handleLegendMouseLeave}
             onclick=${changeLegendPinning}>
            Legend
        </div>`,
})

let legendPinned = false

function changeLegendPinning(e) {
    if (legendPinned)
        setLegendHead(e)
    else
        setLegendBody(e)

    legendPinned = !legendPinned
}

function handleLegendMouseEnter(e) {
    if (!legendPinned)
        setLegendBody(e)
}

function handleLegendMouseLeave(e) {
    if (!legendPinned)
        setLegendHead(e)
}

function setLegendBody(e) {
    e.currentTarget.innerHTML = legend
        .map(x => "<div class='legend-element' style='background-color:" + x.color + ";'></div> " + x.text)
        .join('<br />')
}

function setLegendHead(e) {
    e.currentTarget.innerHTML = 'Legend'
}
