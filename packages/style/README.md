# @opensky/style

A collection of utility functions for styling in Svelte applications with Tailwind CSS support.

## Installation

```bash
npm install @opensky/style
```

## Usage

```typescript
import { createClass, preserveClass, createVariants } from '@opensky/style'
import type { ClassValue } from '@opensky/style'
```

The `ClassValue` type matches what `createClass` accepts (and is compatible with Svelte's `ClassValue` from `svelte/elements`) — useful for typing `class` props on components:

```svelte
<script lang="ts">
	import { createClass, type ClassValue } from '@opensky/style'
	let { class: classProp }: { class?: ClassValue } = $props()
</script>

<div class={createClass('flex gap-2', classProp)}>...</div>
```

## API

### createClass(...inputs)

Merges and processes CSS class names using clsx and tailwind-merge.

**Parameters:**
- `inputs` - Class values to merge (strings, objects, arrays)

**Returns:**
- String of merged and processed class names

**Example:**
```typescript
// Basic usage - Tailwind conflicts resolved
createClass('text-lg', 'text-sm')
// Returns: "text-sm" (last conflicting Tailwind class wins)

// Conditional classes
createClass('flex', isActive && 'bg-blue-500', { 'opacity-50': isLoading })
// Returns: "flex bg-blue-500 opacity-50" (if both conditions are true)

// Mix regular and preserved classes
createClass('flex bg-red-500', 'bg-blue-500', preserveClass('custom-animation'))
// Returns: "flex bg-blue-500 custom-animation"
```

### preserveClass(classes)

Marks classes to be preserved without Tailwind conflict resolution.

**Parameters:**
- `classes` - Class values to preserve

**Returns:**
- Preserved class object for use with createClass

**Example:**
```typescript
// Preserve custom animation class
createClass('bg-red-500', preserveClass('custom-fade-in'))
// Returns: "bg-red-500 custom-fade-in"

// Preserve multiple classes conditionally
createClass('flex', preserveClass(['animate-spin', isLoading && 'opacity-50']))
// Returns: "flex animate-spin opacity-50" (if isLoading is true)
```

### createVariants(config)

Creates a typed variant function for a component. Define once at module scope, apply per render. The output is merged with tailwind-merge, so later sources win: `base` < variant groups (definition order) < `compound` rules.

**Config:**
- `base` - Classes always applied (first, so variants can override them)
- `variants` - Variant group definitions:
  - Object values create multi-option variants (`size: { sm: '...', lg: '...' }`)
  - String values create boolean toggles (`disabled: 'opacity-50'`)
  - `classes` and `unstyled` are reserved names
- `defaults` - Default option per group when the prop is omitted (a defined key, or raw classes)
- `compound` - `{ when, classes }` rules: `classes` applies when every value in `when` matches the resolved variants
- `reset` - Classes returned instead of everything else when `unstyled: true` is passed

**Returns a function** taking variant props and returning:
- `classes` - Final merged class string
- `[group]` - Resolved value per group, including applied defaults
- `unstyled` - Whether the unstyled escape hatch was used

```typescript
const button = createVariants({
  base: 'px-4 py-2 font-medium rounded',
  reset: 'p-0 bg-transparent',
  variants: {
    style: {
      primary: 'bg-blue-500 text-white',
      secondary: 'bg-gray-200 text-gray-800'
    },
    size: {
      sm: 'text-sm',
      md: 'text-base',
      lg: 'text-lg'
    },
    // String value = boolean toggle
    disabled: 'opacity-50 cursor-not-allowed'
  },
  defaults: { style: 'secondary', size: 'md' },
  compound: [
    { when: { style: 'primary', size: 'lg' }, classes: 'shadow-lg hover:shadow-xl' }
  ]
})

button({ style: 'primary', size: 'lg' })
// { classes: 'px-4 py-2 font-medium rounded bg-blue-500 text-white text-lg shadow-lg hover:shadow-xl',
//   style: 'primary', size: 'lg', disabled: false, unstyled: false }

button()
// defaults applied: style: 'secondary', size: 'md'

button({ style: 'bg-purple-500 underline' })
// raw pass-through: values that aren't defined keys are applied as classes verbatim

button({ unstyled: true })
// { classes: 'p-0 bg-transparent', style: undefined, size: undefined, ... }
```

Everything is inferred from the config — option names autocomplete and invalid values are compile errors. Use `VariantProps` to type your component's props from the definition:

```svelte
<script lang="ts">
  import { createClass, createVariants, type VariantProps } from '@opensky/style'

  const button = createVariants({ /* ... */ })

  type Props = {
    children: Snippet
    class?: ClassValue
  } & VariantProps<typeof button>

  let { children, class: classProp, ...variantProps }: Props = $props()
  let variants = $derived(button(variantProps))
</script>

<button class={createClass(variants.classes, classProp)}>{@render children()}</button>
```

## Dependencies

- clsx - For conditional class handling
- tailwind-merge - For Tailwind CSS class conflict resolution

## License

MIT