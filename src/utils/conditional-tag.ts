export function parseConditionalTag(tag: string) {
    const bracketStack: number[] = []
    let prevConditionEndPosition: number | null = null
    const conditions: string[][] = []

    for (let i = 0; i < tag.length; i++) {
        const char = tag.charAt(i)
        switch (char) {
            case '(':
                bracketStack.push(i)
                break

            case ')': {
                bracketStack.pop()
                break
            }

            case ';': {
                if (bracketStack.length === 0) {
                    const startPosition = prevConditionEndPosition ? prevConditionEndPosition + 1 : 0
                    conditions.push(getConditionalTagPart(tag, startPosition, i))
                    prevConditionEndPosition = i
                }
            }
        }
    }

    if (prevConditionEndPosition == null || prevConditionEndPosition < tag.length - 2) {
        const startPosition = prevConditionEndPosition ? prevConditionEndPosition + 1 : 0
        conditions.push(getConditionalTagPart(tag, startPosition, tag.length))
    }

    return conditions
}

function getConditionalTagPart(tag: string, start: number, end: number) {
    const condition = tag.substring(start, end).split('@', 2)
    condition[0] = condition[0].trim()
    if (condition.length > 1) {
        condition[1] = condition[1].trim()
        condition[1] = condition[1].substring(1, condition[1].length - 1)
    } else {
        condition.push('')
    }
    return condition
}
