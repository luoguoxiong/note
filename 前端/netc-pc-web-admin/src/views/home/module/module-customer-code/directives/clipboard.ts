/**
 * v-clipboard 指令(局部化)
 * 来源: customer-code 引用的全局 v-clipboard (netc-pc-web/src/directives/clipboard.js)
 * 同 header/qrcode-dialog/directive/clipboard.ts 方案:
 * 新基座未安装 clipboard 包, 用 navigator.clipboard + execCommand 兜底实现
 */
import type { ObjectDirective } from 'vue'
import { ElMessage } from 'element-plus'

type ClipboardValue = string | { text?: string; message?: string } | undefined

interface ClipboardElement extends HTMLElement {
  _v_clipboard_handler?: () => void
}

/** 支持的取值: 字符串或对象 { text } */
function dealText(value: ClipboardValue): string {
  if (typeof value === 'string') {
    return value
  }
  if (typeof value === 'object' && value !== null) {
    return value.text ?? ''
  }
  return ''
}

/** 自定义提示语（仅对象取值时生效） */
function dealMsg(value: ClipboardValue): string {
  if (typeof value === 'object' && value !== null) {
    return value.message || ''
  }
  return ''
}

/** execCommand 兜底复制（非安全上下文 / 老壳） */
function execCommandCopy(text: string): boolean {
  const target = document.createElement('textarea')
  target.value = text
  target.setAttribute('readonly', '')
  target.style.position = 'absolute'
  target.style.left = '-9999px'
  document.body.appendChild(target)
  target.select()
  let success = false
  try {
    success = document.execCommand('copy')
  } catch (e) {
    success = false
  }
  if (target !== document.activeElement) {
    document.body.removeChild(target)
  }
  return success
}

function clipboardSuccess(value: ClipboardValue) {
  ElMessage({
    message: dealMsg(value) || '复制成功',
    type: 'success',
    duration: 1500,
  })
}

function clipboardError(value: ClipboardValue) {
  ElMessage({
    message: dealMsg(value) || '复制失败',
    type: 'error',
  })
}

async function doCopy(value: ClipboardValue) {
  const text = dealText(value)
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text)
    } else {
      const ok = execCommandCopy(text)
      if (!ok) throw new Error('execCommand copy failed')
    }
    clipboardSuccess(value)
  } catch (e) {
    // navigator.clipboard 失败时再兜底一次 execCommand
    try {
      const ok = execCommandCopy(text)
      if (ok) {
        clipboardSuccess(value)
      } else {
        clipboardError(value)
      }
    } catch (e2) {
      clipboardError(value)
    }
  }
}

const clipboard: ObjectDirective<ClipboardElement, ClipboardValue> = {
  mounted(el, binding) {
    el._v_clipboard_handler = () => doCopy(binding.value)
    el.addEventListener('click', el._v_clipboard_handler)
  },
  updated(el, binding) {
    // 重建监听以引用最新 binding 值
    if (el._v_clipboard_handler) {
      el.removeEventListener('click', el._v_clipboard_handler)
      el._v_clipboard_handler = () => doCopy(binding.value)
      el.addEventListener('click', el._v_clipboard_handler)
    }
  },
  unmounted(el) {
    if (el._v_clipboard_handler) {
      el.removeEventListener('click', el._v_clipboard_handler)
      delete el._v_clipboard_handler
    }
  },
}

export default clipboard
