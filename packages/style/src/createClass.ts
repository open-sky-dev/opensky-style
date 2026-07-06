import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Helper function to mark non-Tailwind classes for preservation during class merging.
 * Classes marked with this function will not be processed by tailwind-merge and will
 * always be included in the final output.
 *
 * @param {ClassValue} classes - The class names to preserve (strings, objects, arrays)
 * @returns {object} A preserved class object for use with createClass
 *
 * @example
 * // Preserve custom animation class
 * createClass('bg-red-500', preserveClass('custom-fade-in'))
 * // Returns: "bg-red-500 custom-fade-in"
 *
 * @example
 * // Preserve multiple classes conditionally
 * createClass('flex', preserveClass(['animate-spin', isLoading && 'opacity-50']))
 * // Returns: "flex animate-spin opacity-50" (if isLoading is true)
 */
export const preserveClass = (classes: ClassValue) => ({ __preserved: classes })

/**
 * Merges and processes CSS class names using `clsx` and `tailwind-merge`,
 * while allowing preservation of specific non-Tailwind classes.
 *
 * This function combines multiple class inputs, resolves Tailwind CSS conflicts
 * (keeping the last conflicting class), and preserves any classes marked with
 * preserveClass() without processing them through tailwind-merge.
 *
 * @param {...ClassValue} inputs - Class values to merge (strings, objects, arrays, conditionals)
 * @returns {string} A string of merged and processed class names
 *
 * @example
 * // Basic usage - Tailwind conflicts resolved
 * createClass('text-lg', 'text-sm')
 * // Returns: "text-sm" (last conflicting Tailwind class wins)
 *
 * @example
 * // Conditional classes
 * createClass('flex', isActive && 'bg-blue-500', { 'opacity-50': isLoading })
 * // Returns: "flex bg-blue-500 opacity-50" (if both conditions are true)
 *
 * @example
 * // Mix regular and preserved classes
 * createClass('flex bg-red-500', 'bg-blue-500', preserveClass('custom-animation'))
 * // Returns: "flex bg-blue-500 custom-animation"
 *
 * @example
 * // Complex usage with multiple preserved classes
 * createClass(
 *   'p-4 text-white',
 *   isError && 'bg-red-500',
 *   preserveClass(['animate-bounce', 'custom-shadow'])
 * )
 * // Returns: "p-4 text-white bg-red-500 animate-bounce custom-shadow" (if isError is true)
 */
export function createClass(...inputs: ClassValue[]) {
	// Filter out any preserved classes
	// Still runs clsx for preserved classes (so you can use conditionals)
	const preservedClasses: Array<string> = []
	const regularClasses = inputs.filter((input) => {
		if (input && typeof input === 'object' && '__preserved' in input) {
			preservedClasses.push(clsx(input.__preserved))
			return false
		}
		return true
	})

	return [twMerge(clsx(regularClasses)), ...preservedClasses].filter(Boolean).join(' ')
}
