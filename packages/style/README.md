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

### createVariants(options, props)

Creates a powerful variant system for components with support for base styles, variant groups, compound variants, and reset styles.

**Parameters:**
- `options` - Configuration object containing:
  - `base` - Base classes always applied
  - `reset` - Classes applied when resetStyles is true
  - `compound` - Array of compound variant rules
  - `[variantGroup]` - Variant group definitions with options and optional `_default`
- `props` - Props object containing variant selections and optional `resetStyles`

**Returns:**
- Object containing:
  - `classes` - Final merged class string
  - `[variantProp]` - Selected variant values for each group

**Example:**
```typescript
// Define variants
const buttonVariants = {
  base: 'px-4 py-2 font-medium rounded',
  reset: 'p-0 bg-transparent border-0',
  
  // Multi-option variants
  size: {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
    _default: 'md'
  },
  variant: {
    primary: 'bg-blue-500 text-white',
    secondary: 'bg-gray-200 text-gray-800',
    danger: 'bg-red-500 text-white'
  },
  
  // Boolean toggle variants (string values)
  disabled: 'opacity-50 cursor-not-allowed',
  elevated: 'shadow-lg',
  
  // Compound variants
  compound: [
    {
      size: 'lg',
      variant: 'primary',
      classes: 'shadow-lg hover:shadow-xl'
    }
  ]
}

// Use in component
const result = createVariants(buttonVariants, { size: 'lg', variant: 'primary' })
// Returns: {
//   classes: 'px-4 py-2 font-medium rounded text-lg bg-blue-500 text-white shadow-lg hover:shadow-xl',
//   size: 'lg',
//   variant: 'primary'
// }

// With reset
const resetResult = createVariants(buttonVariants, { resetStyles: true })
// Returns: {
//   classes: 'p-0 bg-transparent border-0',
//   size: '_reset',
//   variant: '_reset'
// }

// With custom classes (not defined in options)
const customResult = createVariants(buttonVariants, { variant: 'custom-gradient' })
// Returns: {
//   classes: 'px-4 py-2 font-medium rounded text-base custom-gradient',
//   size: 'md', // default value
//   variant: 'custom-gradient'
// }

// Using boolean toggles
const toggleResult = createVariants(buttonVariants, { 
  size: 'sm', 
  variant: 'primary', 
  disabled: true, 
  elevated: true 
})
// Returns: {
//   classes: 'px-4 py-2 font-medium rounded text-sm bg-blue-500 text-white opacity-50 cursor-not-allowed shadow-lg',
//   size: 'sm',
//   variant: 'primary',
//   disabled: true,
//   elevated: true
// }
```

## Dependencies

- clsx - For conditional class handling
- tailwind-merge - For Tailwind CSS class conflict resolution

## License

MIT