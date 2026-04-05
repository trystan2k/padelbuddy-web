export interface CatalogViewport {
  name: string
  width: number
  height: number
}

export const viewportCatalog = [
  { name: 'iPhone SE', width: 375, height: 667 },
  { name: 'iPhone 15', width: 390, height: 844 },
  { name: 'iPhone 17 Pro Max', width: 430, height: 932 },
  { name: 'iPad', width: 768, height: 1024 },
  { name: 'iPad Mini', width: 744, height: 1133 },
  { name: 'iPad Air', width: 820, height: 1180 },
  { name: 'iPad Pro', width: 1024, height: 1366 },
  { name: 'MacBook Pro 14', width: 1512, height: 982 }
] as const satisfies ReadonlyArray<CatalogViewport>

export const landscapeViewportCatalog = [
  { name: 'iPhone SE landscape', width: 667, height: 375 },
  { name: 'iPhone 15 landscape', width: 844, height: 390 },
  { name: 'iPhone 17 Pro Max landscape', width: 932, height: 430 },
  { name: 'iPad landscape', width: 1024, height: 768 },
  { name: 'iPad Mini landscape', width: 1133, height: 744 },
  { name: 'iPad Air landscape', width: 1180, height: 820 },
  { name: 'iPad Pro landscape', width: 1366, height: 1024 },
  { name: 'MacBook Pro 14 landscape', width: 1512, height: 982 }
] as const satisfies ReadonlyArray<CatalogViewport>

export type ViewportOrientation = 'portrait' | 'landscape'

export function getViewportOrientation(
  viewport: Pick<CatalogViewport, 'width' | 'height'>
): ViewportOrientation {
  return viewport.height >= viewport.width ? 'portrait' : 'landscape'
}

export function isPortraitViewport(viewport: Pick<CatalogViewport, 'width' | 'height'>): boolean {
  return getViewportOrientation(viewport) === 'portrait'
}
