/**
 * px转rem
 * @param px numver
 * @returns rem
 */
export function pxToRem(px: number) {
  const rootFontSize = parseFloat(document.body.style.fontSize)
  return `${px / rootFontSize}rem`
}
