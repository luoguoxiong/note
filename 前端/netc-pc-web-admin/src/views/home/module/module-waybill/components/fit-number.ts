export const fitNumberFontSize = (maxSize: number, minSize: number, isOverflowing: (fontSize: number) => boolean) => {
  let fontSize = maxSize

  while (isOverflowing(fontSize) && fontSize > minSize) {
    fontSize = Math.max(minSize, fontSize - 2)
  }

  return {
    fontSize,
    isTruncated: isOverflowing(fontSize),
  }
}
