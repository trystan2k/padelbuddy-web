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
  { name: 'iPad Air', width: 820, height: 1180 },
  { name: 'iPad Pro', width: 1024, height: 1366 },
  { name: 'MacBook Pro 14', width: 1512, height: 982 }
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
