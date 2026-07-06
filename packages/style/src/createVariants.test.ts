import { describe, expect, test } from 'bun:test'
import { createVariants } from './createVariants'

const button = createVariants({
	base: 'flex px-3.5 py-1.5 text-[0.95rem] font-medium',
	reset: 'appearance-none',
	variants: {
		style: {
			primary: 'bg-neutral-700 text-white',
			secondary: 'bg-neutral-150 text-neutral-800'
		},
		size: {
			sm: 'text-[0.87rem] px-3',
			md: 'text-[0.91rem] px-3.5',
			lg: 'text-[1.05rem] px-4'
		},
		destructive: 'text-rose-500'
	},
	defaults: { style: 'secondary', size: 'md' },
	compound: [{ when: { style: 'primary', destructive: true }, classes: 'bg-red-500 text-rose-50' }]
})

describe('createVariants', () => {
	test('applies defaults when props are omitted', () => {
		const v = button()
		expect(v.style).toBe('secondary')
		expect(v.size).toBe('md')
		expect(v.destructive).toBe(false)
		expect(v.classes).toContain('bg-neutral-150')
	})

	test('explicit props override defaults', () => {
		const v = button({ style: 'primary', size: 'lg' })
		expect(v.style).toBe('primary')
		expect(v.classes).toContain('bg-neutral-700')
		expect(v.classes).toContain('px-4')
	})

	test('variant classes win over conflicting base classes (tw-merge)', () => {
		const v = button()
		// base has text-[0.95rem], size md has text-[0.91rem] — merged, later wins
		expect(v.classes).toContain('text-[0.91rem]')
		expect(v.classes).not.toContain('text-[0.95rem]')
		expect(v.classes).not.toContain('px-3.5 py-1.5 px-3.5')
	})

	test('boolean toggles', () => {
		expect(button({ destructive: true }).classes).toContain('text-rose-500')
		expect(button({ destructive: true }).destructive).toBe(true)
		expect(button().classes).not.toContain('text-rose-500')
	})

	test('compound rules match resolved values, including booleans', () => {
		const v = button({ style: 'primary', destructive: true })
		expect(v.classes).toContain('bg-red-500')
		// compound wins over both the style and destructive classes it conflicts with
		expect(v.classes).not.toContain('bg-neutral-700')
		expect(v.classes).toContain('text-rose-50')
		expect(v.classes).not.toContain('text-rose-500')
	})

	test('compound rules match against defaults too', () => {
		const withDefaults = createVariants({
			variants: { style: { a: 'x', b: 'y' } },
			defaults: { style: 'a' },
			compound: [{ when: { style: 'a' }, classes: 'from-default' }]
		})
		expect(withDefaults().classes).toContain('from-default')
	})

	test('raw class pass-through for undefined option values', () => {
		const v = button({ style: 'bg-purple-500 underline' })
		expect(v.style).toBe('bg-purple-500 underline')
		expect(v.classes).toContain('bg-purple-500')
		expect(v.classes).toContain('underline')
	})

	test('raw class pass-through in defaults', () => {
		const rawDefault = createVariants({
			variants: { decoration: { none: 'no-underline' } },
			defaults: { decoration: 'underline' }
		})
		const v = rawDefault()
		expect(v.decoration).toBe('underline')
		expect(v.classes).toContain('underline')
	})

	test('unstyled returns only reset classes', () => {
		const v = button({ unstyled: true, style: 'primary' })
		expect(v.classes).toBe('appearance-none')
		expect(v.unstyled).toBe(true)
		expect(v.style).toBeUndefined()
		expect(v.destructive).toBe(false)
	})

	test('group with no value and no default resolves undefined and adds nothing', () => {
		const partial = createVariants({
			base: 'flex',
			variants: { tone: { loud: 'uppercase' } }
		})
		const v = partial()
		expect(v.tone).toBeUndefined()
		expect(v.classes).toBe('flex')
	})
})
