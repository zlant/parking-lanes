import L from 'leaflet'
import { createRoot } from 'react-dom/client'
import { useState } from 'react'
import { legend } from '../legend'

export default L.Control.extend({
    onAdd: () => {
        const control = document.createElement('div')
        control.onmousedown = L.DomEvent.stopPropagation
        control.ondblclick = L.DomEvent.stopPropagation
        control.onpointerdown = L.DomEvent.stopPropagation
        control.onclick = L.DomEvent.stopPropagation

        const reactRoot = createRoot(control)
        reactRoot.render(<LegendPanel />)

        return control
    },
})

function LegendPanel() {
    const [shown, setShown] = useState(false)
    const [pinned, setPinned] = useState(false)

    return (
        <div className="leaflet-control-layers control-padding control-bigfont"
            onMouseEnter={() => !pinned && setShown(true)}
            onMouseLeave={() => !pinned && setShown(false)}
            onClick={() => {
                pinned ? setShown(false) : setShown(true)
                setPinned(!pinned)
            }}>
            {shown ?
                legend.map(x =>
                    <div key={x.condition} className='legend__element'>
                        <div className="legend__line" style={{ backgroundColor: x.color }} />
                        <span>{x.text}</span>
                    </div>) :
                <span>Legend</span>
            }
        </div>
    )
}
