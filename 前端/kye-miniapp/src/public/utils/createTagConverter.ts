/**
 * 创建一个标签转换器（字符串处理）
 * @param {string} sourceTag - 源标签名，如 'strong'、'b'、'em' 等（不包含尖括号）
 * @param {string} targetTag - 目标标签名，通常是 'span'
 * @param {string} forcedStyle - 需要强制添加的样式，如 'font-weight: bold'
 * @returns {Function} 接收原始 HTML 字符串，返回转换后的字符串
 */
export function createTagConverter(sourceTag, targetTag, forcedStyle) {
  // 不区分大小写的开始标签正则，捕获可选属性
  const startTagRegex = new RegExp(`<${sourceTag}(\\s+[^>]*)?>`, 'gi')
  const endTagRegex = new RegExp(`</${sourceTag}>`, 'gi')

  /**
   * 处理单个开始标签的转换
   * @param {string} match - 完整匹配到的开始标签，如 '<strong style="color: red;">'
   * @returns {string} 转换后的目标标签
   */
  function convertStartTag(match) {
    // 提取属性部分（可能为空）
    const attrMatch = match.match(new RegExp(`^<${sourceTag}(\\s+[^>]*)?>`, 'i'))
    if (!attrMatch) return match
    let attrs = attrMatch[1] || ''

    // 提取原有的 style 属性值
    let styleMatch = attrs.match(/style\s*=\s*"([^"]*)"/i)
    let newStyle = forcedStyle

    if (styleMatch) {
      let originalStyle = styleMatch[1]
      // 去除原有样式中可能与 forcedStyle 冲突的属性（例如 forcedStyle 含 font-weight，则去除原有 font-weight）
      const forcedProp = forcedStyle.split(':')[0].trim() // 取属性名，如 'font-weight'
      const propRegex = new RegExp(`${forcedProp}\\s*:\\s*[^;]+;?`, 'i')
      let cleanedStyle = originalStyle.replace(propRegex, '').trim()
      if (cleanedStyle && !cleanedStyle.endsWith(';')) cleanedStyle += ';'
      newStyle = cleanedStyle ? `${cleanedStyle} ${forcedStyle}` : forcedStyle
      // 从原属性中移除 style，稍后重新加上
      attrs = attrs.replace(/style\s*=\s*"[^"]*"/i, '').trim()
    }

    // 组装新的目标标签
    if (attrs) {
      return `<${targetTag}${attrs} style="${newStyle}">`
    } else {
      return `<${targetTag} style="${newStyle}">`
    }
  }

  /**
   * 对完整 HTML 字符串进行转换
   * @param {string} html - 原始 HTML 字符串
   * @returns {string} 转换后的 HTML
   */
  return function (html) {
    let result = html.replace(startTagRegex, convertStartTag)
    result = result.replace(endTagRegex, `</${targetTag}>`)
    return result
  }
}
// 使用示例：转换 <strong> -> <span style="font-weight: bold">
const strongToSpan = createTagConverter('strong', 'span', 'font-weight: bold')

// 转换 <font> -> <span>（不添加额外样式，只是改标签名）
const fontToSpan = createTagConverter('font', 'span', '') // 空样式表示只改标签，不追加样式
const emToSpan = createTagConverter('em', 'span', '') // 所有em转 span

// 如果需要同时处理多个标签，可以组合使用
export const convertHtml = (html) => {
  let result = fontToSpan(html) // 先转 <font>
  result = strongToSpan(result) // 再转 <strong>
  result = emToSpan(result) // 再转 <strong>
  return result
}
