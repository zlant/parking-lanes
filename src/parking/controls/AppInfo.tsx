import L from 'leaflet'
import { createRoot } from 'react-dom/client'
import { handleJosmLinkClick } from '../../utils/josm'
import { useState } from 'react'
import { AuthState, useAuthState, useEditorMode, useMapState } from '../state'
import { idEditorUrl, josmUrl, overpassDeUrl } from '../../utils/links'

export default L.Control.extend({
    onAdd: () => {
        const control = document.createElement('div')
        control.onmousedown = L.DomEvent.stopPropagation
        control.ondblclick = L.DomEvent.stopPropagation
        control.onpointerdown = L.DomEvent.stopPropagation
        control.onclick = L.DomEvent.stopPropagation

        const reactRoot = createRoot(control)
        reactRoot.render(<AppInfoPanel />)

        return control
    },
})

function AppInfoPanel() {
    const [editorLinkShown, setEditorLinkShown] = useState(false)
    const [editorMode, setEditorMode] = useEditorMode()
    const [authState] = useAuthState()
    const [mapState] = useMapState()
    const editorModeLabelColor = authState === AuthState.initial ?
        'black' :
        authState === AuthState.fail ? 'red' : 'green'

    return (
        <div className="leaflet-control-layers control-padding control-bigfont"
            onMouseEnter={() => setEditorLinkShown(true)}
            onMouseLeave={() => setEditorLinkShown(false)}>
            <span style={{ display: editorLinkShown ? '' : 'none' }}>
                <a href="https://wiki.openstreetmap.org/wiki/Street_parking" target="_blank" rel="noreferrer">Tagging</a>
                <span> | </span>
                <a href={idEditorUrl({ zoom: mapState.zoom, center: mapState.center })}
                    target="_blank" rel="noreferrer">iD</a>
                <span>, </span>
                <a href={josmUrl + overpassDeUrl + getHighwaysOverpassQuery(mapState.bounds)}
                    target="_blank" rel="noreferrer"
                    // eslint-disable-next-line @typescript-eslint/no-misused-promises
                    onClick={e => handleJosmLinkClick(e.nativeEvent)}>Josm</a>
                <span> </span>
            </span>
            <label className="editor-mode"
                style={{ color: editorModeLabelColor }}>
                <input
                    checked={editorMode}
                    type="checkbox"
                    className="editor-mode__checkbox"
                    onChange={(e) => setEditorMode(e.target.checked)} />
                Editor
            </label>
            <span> | </span>
            <a href="https://github.com/zlant/parking-lanes" target="_blank" rel="noreferrer">GitHub</a>
        </div>
    )
}

function getHighwaysOverpassQuery(bounds: { south: number, west: number, north: number, east: number }) {
    const bbox = [bounds.south, bounds.west, bounds.north, bounds.east].join(',')
    const tag = 'highway~"^motorway|trunk|primary|secondary|tertiary|unclassified|residential|service|living_street"'
    return `
[out:xml];
(
    way[${tag}](${bbox});
    >;
    way[${tag}](${bbox});
    <;
);
out meta;`
}
