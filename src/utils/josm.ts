import axios from 'axios'

export function handleJosmLinkClick(e: Event): void {
    // @ts-expect-error
    axios.get(e.target.href)
    e.preventDefault()
}
