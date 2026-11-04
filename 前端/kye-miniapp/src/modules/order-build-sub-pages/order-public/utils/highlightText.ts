const highlightText = (text: string, identifier: string) => {
  let result = ''
  if (!identifier) {
    result = text
  } else {
    result = text.split(identifier).join(`<text style="color: #8365f6; font-weight: 600;">${identifier}</text>`)
    // result = text
  }
  return result
}

export default highlightText
