import { createClass } from './createClass'

/**
 * Variant group definitions:
 * - A string value creates a boolean toggle (classes applied when the prop is true)
 * - An object value creates a multi-option variant (keys are option names)
 */
type VariantGroups = Record<string, string | Record<string, string>>

/**
 * The prop value a group accepts:
 * - boolean toggles take true/false
 * - multi-option groups take a defined key, or any raw class string (pass-through)
 */
type GroupValue<G> = G extends string ? boolean : (keyof G & string) | (string & {})

export type VariantConfig<V extends VariantGroups> = {
	/** Classes always applied (first, so variants can override them) */
	base?: string
	/** Classes returned instead of everything else when `unstyled` is passed */
	reset?: string
	/** Variant group definitions. `classes` and `unstyled` are reserved names */
	variants: V & { classes?: never; unstyled?: never }
	/** Default option per group, applied when the prop is omitted. Can be a defined key or raw classes */
	defaults?: { [K in keyof V]?: GroupValue<V[K]> }
	/** Extra classes applied when every value in `when` matches the resolved variants */
	compound?: Array<{ when: { [K in keyof V]?: GroupValue<V[K]> }; classes: string }>
}

type Props<V extends VariantGroups> = {
	[K in keyof V]?: GroupValue<V[K]>
} & {
	/** Skip base, variants, and compound rules — apply only the config's `reset` classes */
	unstyled?: boolean
}

type Result<V extends VariantGroups> = {
	/** The final merged class string (conflicts resolved, later wins) */
	classes: string
	unstyled: boolean
} & {
	/** Resolved value per group, including defaults (undefined if no value and no default) */
	[K in keyof V]: V[K] extends string ? boolean : string | undefined
}

/**
 * Extracts the props type from a variant function, for use in component prop types.
 *
 * @example
 * const button = createVariants({ variants: { size: { sm: '...', lg: '...' } } })
 * type ButtonProps = VariantProps<typeof button> // { size?: 'sm' | 'lg' | (string & {}); unstyled?: boolean }
 */
export type VariantProps<F> = F extends (props?: infer P) => unknown ? NonNullable<P> : never

/**
 * Creates a typed variant function from a config object. Call it once at module
 * scope, then apply per render with the variant props (spread works well).
 *
 * Output classes are merged with tailwind-merge, so later sources win over
 * earlier ones: base < variants (definition order) < compound rules.
 *
 * @example
 * const button = createVariants({
 * 	base: 'px-3.5 py-1.5 font-medium',
 * 	variants: {
 * 		style: {
 * 			primary: 'bg-neutral-700 text-white',
 * 			secondary: 'bg-neutral-150 text-neutral-800'
 * 		},
 * 		size: { sm: 'text-sm', md: 'text-base', lg: 'text-lg' },
 * 		destructive: 'text-rose-500' // boolean toggle
 * 	},
 * 	defaults: { style: 'secondary', size: 'md' },
 * 	compound: [{ when: { style: 'primary', destructive: true }, classes: 'bg-red-500' }]
 * })
 *
 * const v = button({ style: 'primary', destructive: true })
 * v.classes // 'px-3.5 py-1.5 font-medium text-white text-base text-rose-500 bg-red-500'
 * v.style   // 'primary'
 * v.size    // 'md' (default applied)
 *
 * // Raw pass-through: values that aren't defined keys are applied as classes
 * button({ style: 'bg-purple-500 text-white' })
 */
export function createVariants<V extends VariantGroups>(config: VariantConfig<V>) {
	const groups = Object.entries(config.variants) as Array<[string, string | Record<string, string>]>

	return (props: Props<V> = {} as Props<V>): Result<V> => {
		const resolved: Record<string, string | boolean | undefined> = {}

		if (props.unstyled) {
			for (const [name, group] of groups) {
				resolved[name] = typeof group === 'string' ? false : undefined
			}
			return { ...resolved, classes: config.reset ?? '', unstyled: true } as Result<V>
		}

		const parts: string[] = []
		if (config.base) parts.push(config.base)

		for (const [name, group] of groups) {
			const value = (props as Record<string, unknown>)[name]

			if (typeof group === 'string') {
				const on = value === true
				resolved[name] = on
				if (on) parts.push(group)
				continue
			}

			const raw = value !== undefined ? value : (config.defaults as Record<string, unknown> | undefined)?.[name]
			const selected = typeof raw === 'string' ? raw : undefined
			resolved[name] = selected
			if (selected !== undefined) {
				parts.push(group[selected] ?? selected)
			}
		}

		if (config.compound) {
			for (const rule of config.compound) {
				const match = Object.entries(rule.when).every(([key, expected]) => resolved[key] === expected)
				if (match) parts.push(rule.classes)
			}
		}

		return { ...resolved, classes: createClass(parts), unstyled: false } as Result<V>
	}
}
