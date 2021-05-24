import L from 'leaflet'
import { hyper } from 'hyperhtml/esm'
import { handleJosmLinkClick } from '~/src/utils/josm'

export default L.Control.extend({
    onAdd: map => hyper`
        <div class="leaflet-control-layers control-padding control-bigfont"
             onmouseenter=${showExternalEditorLinks}
             onmouseleave=${hideExternalEditorLinks}>
            <span id="ghc-editors" style="display: none;">
                <a href="https://wiki.openstreetmap.org/wiki/Key:parking:lane" target="_blank">Tagging</a>
                |
                <a id="ghc-id" target="_blank">iD</a>,
                <a id="ghc-josm" target="_blank" onclick=${handleJosmLinkClick}>Josm</a>,
            </span>
            <label id="ghc-editor-mode-label" class="editor-mode">
                <input id="ghc-editor-mode"
                       type="checkbox"
                       class="editor-mode__checkbox">
                Editor
            </label>
            |
            <a href="https://github.com/zetx16/parking-lanes" target="_blank">GitHub</a>
        </div>`,

    setEditorModeCheckboxListener(listener) {
        document.getElementById('ghc-editor-mode').onchange = listener
    },
})

function showExternalEditorLinks() {
    document.getElementById('ghc-editors').style.display = 'inline'
}

function hideExternalEditorLinks() {
    document.getElementById('ghc-editors').style.display = 'none'
}
