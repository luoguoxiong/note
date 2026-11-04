export const highlightText = (text, identifier) => {
  let result = ''
  if (!identifier) {
    result = text
  } else {
    result = text.split(identifier).join(`<span style="color: #8365f6">${identifier}</span>`)
  }
  return result
}

export const NatureMap = {
  1: '生鲜',
  2: '易碎',
  3: '危险品',
  4: '贵重物品',
  5: '异性货物、不规则货物类',
  6: '液体',
  7: '气体',
  8: '常规',
  9: '含锂电池',
  10: '含磁性',
  11: '粉末',
  12: '膏状',
  13: '含电池',
}
