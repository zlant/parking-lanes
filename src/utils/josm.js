import axios from 'axios'

export function handleJosmLinkClick(e) {
    axios.get(e.target.href)
    e.preventDefault()
}
