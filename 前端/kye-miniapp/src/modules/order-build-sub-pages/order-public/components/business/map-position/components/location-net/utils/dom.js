export function calcText(text, width = 134, padding = 16) {
  const fontSize = 14
  const minFontSize = 12

  const length = text.replace(/[\u0391-\uFFE5]/g, 'aa').length
  let textSize = length * fontSize
  if (textSize > width) {
    // 可能需要显示两行
    // let textSize = length * minFontSize / 2
    let size = 0
    let charSize = 0
    let charCode = -1
    for (let i = 0; i < text.length; i++) {
      charCode = text.charCodeAt(i)
      if (charCode >= 0 && charCode <= 128) {
        charSize = minFontSize / 2 + 0.5
      } else {
        charSize = minFontSize
      }
      size += charSize
      if (size > width) {
        return {
          width: size - charSize + padding * 2 + 'px',
          text: text.slice(0, i + 4) + (text.length > i + 4 ? '...' : ''),
          fontSize: minFontSize + 'px',
        }
      }
    }
  }
  return {
    width: textSize + padding * 2 + 10 + 'px',
    text,
    fontSize: fontSize + 'px',
  }
}

export function on(target, event, handler) {
  target.addEventListener(event, handler, { capture: false, passive: false })
}

export function off(target, event, handler) {
  target.removeEventListener(event, handler)
}
