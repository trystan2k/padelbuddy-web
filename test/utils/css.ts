/**
 * Resolves a CSS custom property value to its computed color.
 * Reads from the element's computed style and recursively resolves
 * var() references if needed.
 */
export function resolveCssColor(property: 'backgroundColor' | 'color', value: string): string {
  const probe = document.createElement('div')

  probe.style.setProperty(property === 'backgroundColor' ? 'background-color' : 'color', value)
  document.body.append(probe)

  const resolvedColor = getComputedStyle(probe)[property]

  probe.remove()

  return resolvedColor
}
