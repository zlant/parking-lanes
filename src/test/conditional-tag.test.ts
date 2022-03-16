import { parseConditionalTag } from '../utils/conditional-tag'

describe('#parseConditionalTag()', () => {
    test('one value', async() => {
        const values = parseConditionalTag('free @ (Mo-Fr 09:00-19:00)')
        expect(values).toStrictEqual([
            { value: 'free', condition: 'Mo-Fr 09:00-19:00' },
        ])
    })
    test('two value; without brackets', async() => {
        const values = parseConditionalTag('free @ (Mo-Fr 09:00-19:00); ticket @  19:00-20:00')
        expect(values).toStrictEqual([
            { value: 'free', condition: 'Mo-Fr 09:00-19:00' },
            { value: 'ticket', condition: '19:00-20:00' },
        ])
    })
    test('two values; value without condition', async() => {
        const values = parseConditionalTag('free @ (Mo-Fr 09:00-19:00); ticket')
        expect(values).toStrictEqual([
            { value: 'free', condition: 'Mo-Fr 09:00-19:00' },
            { value: 'ticket', condition: null },
        ])
    })
    test('free values; without brackets; condition with semicolons; ends with semicolon', async() => {
        const values = parseConditionalTag('free @  (Mo-Fr 09:00-19:00);ticket@19:00-20:00 ; residents @ (Mo-Fr 07:00-09:00,15:00-18:00; Sa 09:00-15:00);')
        expect(values).toStrictEqual([
            { value: 'free', condition: 'Mo-Fr 09:00-19:00' },
            { value: 'ticket', condition: '19:00-20:00' },
            { value: 'residents', condition: 'Mo-Fr 07:00-09:00,15:00-18:00; Sa 09:00-15:00' },
        ])
    })
})
