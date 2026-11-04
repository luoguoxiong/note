/**
 * v-kye-restrict 指令(TS 版, 局部化)
 * 来源: customer-code 引用的全局 v-kyerestrict (netc-pc-web/src/directives/input.js)
 * 行为: 输入内容不符合修饰符对应正则时回退为上次合法值;
 * Vue2 vnode.componentInstance.$emit('input') -> Vue3 派发原生 input 事件同步 v-model
 *
 * 用法: <el-input v-kye-restrict.positive />
 */
import type { ObjectDirective } from 'vue'

interface KyeRestrictElement extends HTMLInputElement {
  oldValue?: string
  oldSelectionStart?: number | null
  oldSelectionEnd?: number | null
  _v_kye_restrict_handler?: (e: Event) => void
}

/** 修饰符 -> 正则(与老指令一致) */
const regExpes: Record<string, RegExp> = {
  integer: /^-?\d*$/,
  integerNonZero: /^[1-9]\d*$/,
  positive: /^\d*$/,
  positiveNotZero: /^[1-9]\d*$/,
  positiveOrZero: /^[0-9]\d*$/,
  float: /^\d*[.,]?\d*$/,
  currency: /^\d*[.]?\d{0,2}$/,
  alphabet: /^[a-z]*$/i,
  text: /^[\u4e00-\u9fa5a-zA-Z0-9-()（）*,，\u0020\u3000－]+$/, // 字母、中文、数字、括号、-和\u3000 全角空格，\u0020 半角空格
  chinese: /^[\u4E00-\u9FA5]+$/,
  letterOrNumber: /^[0-9a-z]*$/i,
  tagNumber: /^[1-9][-,，]?\d*/,
  floatThree: /^\d*[.]?\d{0,3}$/,
  letterAndNumber: /^[0-9a-zA-Z]+$/,
  threeFloatOne: /^\d{0,3}(\.\d{0,1})?$/,
}

const kyeRestrict: ObjectDirective<KyeRestrictElement, RegExp | undefined> = {
  beforeMount(elinput, binding) {
    if (Object.keys(binding.modifiers).length === 0) {
      return
    }
    const el = (elinput.querySelector('input') || elinput) as KyeRestrictElement
    const modifier = Object.keys(binding.modifiers)[0]
    const reg = modifier === 'regular' && binding.value ? binding.value : regExpes[modifier]
    if (!reg) return
    const max = parseFloat(el.max)

    const handle = () => {
      // 是否回退过值(回退后需派发 input 事件同步 v-model; 合法输入分支不派发, 避免递归)
      let changed = false
      if (el.value === '') {
        el.oldValue = el.value
      } else if (reg.test(el.value) && (!max || el.value === '' || parseFloat(el.value) <= max)) {
        el.oldValue = el.value
        el.oldSelectionStart = el.selectionStart
        el.oldSelectionEnd = el.selectionEnd
      } else if ('oldValue' in el) {
        el.value = el.oldValue || ''
        el.setSelectionRange(el.oldSelectionStart ?? el.value.length, el.oldSelectionEnd ?? el.value.length)
        changed = true
      } else {
        el.value = ''
        changed = true
      }
      // 处理 model 值与 input 的 value 不一致的问题
      if (changed) {
        el.dispatchEvent(new Event('input', { bubbles: true }))
      }
    }

    el.addEventListener('focus', () => {
      if (el.oldValue !== el.value) {
        el.oldValue = el.value
        el.oldSelectionEnd = el.oldValue.length
        el.oldSelectionStart = el.oldSelectionEnd
      }
    })
    el._v_kye_restrict_handler = handle
    el.addEventListener('input', handle)
  },
  unmounted(elinput) {
    const el = (elinput.querySelector('input') || elinput) as KyeRestrictElement
    if (el._v_kye_restrict_handler) {
      el.removeEventListener('input', el._v_kye_restrict_handler)
      delete el._v_kye_restrict_handler
    }
  },
}

export default kyeRestrict
