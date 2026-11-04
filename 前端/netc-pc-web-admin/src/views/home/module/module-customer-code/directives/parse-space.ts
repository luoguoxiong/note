/**
 * v-parse-space 指令(TS 版, 局部化)
 * 来源: customer-code 引用的全局 v-parseSpace (netc-pc-web/src/directives/parseSpace.js)
 * 行为: 粘贴内容去除空格; Vue2 vnode.componentInstance.$emit('input') ->
 * Vue3 对内部 input 派发原生 input 事件(element-plus v-model 据此同步)
 */
import type { ObjectDirective } from 'vue'

type ParseSpaceCallback = (value: string) => void

interface ParseSpaceElement extends HTMLInputElement {
  _v_parse_space_handler?: (e: ClipboardEvent) => void
}

const parseSpace: ObjectDirective<ParseSpaceElement, ParseSpaceCallback | undefined> = {
  beforeMount(elinput, binding) {
    const el = (elinput.querySelector('input') || elinput) as ParseSpaceElement
    const callback = binding.value
    const handler = (e: ClipboardEvent) => {
      e.preventDefault()
      const text = e.clipboardData?.getData('Text') || ''
      if (!text) {
        return
      }
      // 去除空格
      let value = text.replace(/\s+/g, '')
      // 字符长度过滤
      const maxLength = (e.target as HTMLInputElement)?.maxLength
      if (maxLength && typeof maxLength === 'number' && maxLength !== -1) {
        value = value.slice(0, maxLength)
      }
      el.value = value
      el.dispatchEvent(new Event('input', { bubbles: true }))
      callback && callback(value)
    }
    el._v_parse_space_handler = handler
    el.addEventListener('paste', handler)
  },
  unmounted(elinput) {
    const el = (elinput.querySelector('input') || elinput) as ParseSpaceElement
    if (el._v_parse_space_handler) {
      el.removeEventListener('paste', el._v_parse_space_handler)
      delete el._v_parse_space_handler
    }
  },
}

export default parseSpace
