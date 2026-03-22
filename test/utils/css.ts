/**
 * Resolves a CSS custom property or color value to its computed color.
 * Applies the value to a temporary element and reads the element's
 * computed style, relying on the browser to resolve any var() references.
 */
export function resolveCssColor(property: 'backgroundColor' | 'color', value: string): string {
  const probe = document.createElement('div')
  probe.style.position = 'absolute'
  probe.style.top = '0'
  probe.style.left = '0'
  probe.style.width = '0'
  probe.style.height = '0'
  probe.style.overflow = 'hidden'
  probe.style.visibility = 'hidden'
  probe.style.pointerEvents = 'none'
  probe.style.margin = '0'
  probe.style.padding = '0'
  probe.style.border = '0'

  probe.style.setProperty(property === 'backgroundColor' ? 'background-color' : 'color', value)
  document.body.append(probe)

  let resolvedColor: string
  try {
    resolvedColor = getComputedStyle(probe)[property]
  } finally {
    probe.remove()
  }

  return resolvedColor
}
