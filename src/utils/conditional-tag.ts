export function parseConditionalTag(tag: string) {
    const bracketStack: number[] = []
    let prevConditionEndPosition: number | null = null
    const parsedConditionalTag: ConditionalValue[] = []

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
                    parsedConditionalTag.push(parseConditionalValue(tag.substring(startPosition, i - 1)))
                    prevConditionEndPosition = i
                }
            }
        }
    }

    if (prevConditionEndPosition == null || prevConditionEndPosition < tag.length - (tag.endsWith(')') ? 2 : 1)) {
        const startPosition = prevConditionEndPosition ? prevConditionEndPosition + 1 : 0
        parsedConditionalTag.push(parseConditionalValue(tag.substring(startPosition, tag.length - (tag.endsWith(')') ? 1 : 0))))
    }

    return parsedConditionalTag
}

function parseConditionalValue(rawConditionalValue: string) {
    const tokens = rawConditionalValue.split('@', 2)

    const conditionalValue: ConditionalValue = {
        value: tokens[0].trim(),
        condition: null,
    }

    if (tokens.length > 1) {
        conditionalValue.condition = tokens[1]
            .trim()
            .substring(1, tokens[1].length - 1)
    }

    return conditionalValue
}

export interface ConditionalValue {
    value: string
    condition: string | null
}
