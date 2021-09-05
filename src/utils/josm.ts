import axios from 'axios'

export function handleJosmLinkClick(e: Event) {
    // @ts-ignore
    axios.get(e.target.href)
    e.preventDefault()
}
