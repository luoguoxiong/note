/**
 * 将html转换为文本
 * @param html: string
 */
export const parseHtmlToText = (htmlString: string) => {
  const div = document.createElement('div')
  div.innerHTML = htmlString
  const text = div.textContent || div.innerText || ''
  return text
}
