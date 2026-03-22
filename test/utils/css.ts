/**
 * Resolves a CSS custom property or color value to its computed color.
 * Applies the value to a temporary element and reads the element's
 * computed style, relying on the browser to resolve any var() references.
 */
export function resolveCssColor(property: 'backgroundColor' | 'color', value: string): string {
  const probe = document.createElement('div')

  probe.style.setProperty(property === 'backgroundColor' ? 'background-color' : 'color', value)
  document.body.append(probe)

  const resolvedColor = getComputedStyle(probe)[property]

  probe.remove()

  return resolvedColor
}
