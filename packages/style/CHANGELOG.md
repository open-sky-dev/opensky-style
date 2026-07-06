# Changelog

## [0.2.0]

### createVariants redesigned (breaking)

`createVariants` is now a define-once / apply-per-render API with full type inference. Define at module scope, get back a typed function, call it with variant props each render.

```ts
const button = createVariants({
	base: 'px-4 py-2 font-medium',
	variants: {
		look: { primary: 'bg-blue-500 text-white', secondary: 'bg-gray-200' },
		size: { sm: 'text-sm', md: 'text-base' },
		disabled: 'opacity-50' // string value = boolean toggle
	},
	defaults: { look: 'secondary', size: 'md' },
	compound: [{ when: { look: 'primary', disabled: true }, classes: '...' }]
})

const v = button({ look: 'primary' })
v.classes // merged class string
v.size // 'md' — resolved values include defaults
```

Migrating from 0.1.0:

- Wrap variant groups in a `variants: {}` key (fixes name collisions with `base`/`reset`/`compound`)
- Move each group's `_default` into a top-level `defaults: {}` object
- Reshape compound rules from `{ style: 'primary', classes: '...' }` to `{ when: { style: 'primary' }, classes: '...' }`
- Rename the `resetStyles` prop to `unstyled`; on unstyled results, groups resolve to `undefined`/`false` instead of `'_reset'`
- Raw class pass-through (values that aren't defined keys) and boolean toggle shorthand work as before

New:

- Full type inference: option names autocomplete, invalid values are compile errors
- `VariantProps<typeof fn>` derives component prop types from the definition
- Output runs through tailwind-merge with defined precedence: `base` < variants (definition order) < `compound` — variant classes now reliably override conflicting base classes
- `VariantConfig` type exported; `VariantOptions`, `VariantGroupOptions`, and `CompoundRule` types removed

### Packaging

- ESM-only: the CommonJS build was removed
- clsx and tailwind-merge are no longer bundled into the dist (~58 KB → ~2 KB); they resolve from `dependencies` as normal
- Removed the `tailwindcss` peer dependency (not needed at runtime)
- tailwind-merge floor raised to 3.6.0
- `ClassValue` type re-exported (compatible with Svelte's `ClassValue` from `svelte/elements`) for typing component `class` props

## [0.1.0]

Initial release: `createClass`, `preserveClass`, `createVariants`.
