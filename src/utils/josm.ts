import axios from 'axios'

export async function handleJosmLinkClick(e: Event) {
    // @ts-expect-error
    await axios.get(e.target.href)
    e.preventDefault()
}
