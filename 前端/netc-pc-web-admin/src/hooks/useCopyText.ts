import { KMessage } from '@netc-design-pc/ui'

export const useCopyText = () => {
  const copyText = (text: string) => {
    const textarea = document.createElement('textarea')
    textarea.value = text
    textarea.style.width = '0'
    textarea.style.height = '0'
    document.body.appendChild(textarea)
    textarea.focus()
    textarea.select()

    try {
      const successful = document.execCommand('copy')
      if (!successful) throw '复制失败'
      KMessage.success({ message: '复制成功', zIndex: 3000 })
    } catch (error) {
      KMessage.warning({ message: '复制失败', zIndex: 3000 })
    }

    document.body.removeChild(textarea)
  }

  return { copyText }
}

export default useCopyText
