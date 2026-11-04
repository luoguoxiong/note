/**
 * v-clipboard 指令
 * 迁移自: netc-pc-web/src/directives/clipboard.js（基于 clipboard npm 包）
 * 新基座未安装 clipboard 包，此处用 navigator.clipboard + execCommand 兜底实现，
 * 指令行为与老项目一致：
 *  - v-clipboard="url"                      点击复制 url
 *  - v-clipboard="{ text, message }"         点击复制 text，成功后提示 message
 *  - v-clipboard:cut="..."                   输入框场景执行剪切
 *  - 成功: ElMessage.success(message || '复制成功')（1500ms）
 *  - 失败: ElMessage.error(message || '复制失败')
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
function execCommandCopy(text: string, action: 'copy' | 'cut'): boolean {
  let target: HTMLTextAreaElement | HTMLInputElement | null = null
  let success = false
  if (action === 'cut') {
    // 剪切仅对输入类元素有意义，沿用老指令场景：绑定的元素自身为输入框
    const el = document.activeElement as HTMLInputElement | null
    if (el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA')) {
      target = el
    }
  }
  if (!target) {
    target = document.createElement('textarea')
    target.value = text
    target.setAttribute('readonly', '')
    target.style.position = 'absolute'
    target.style.left = '-9999px'
    document.body.appendChild(target)
  }
  target.select()
  try {
    success = document.execCommand(action)
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

async function doCopy(value: ClipboardValue, action: 'copy' | 'cut') {
  const text = dealText(value)
  try {
    if (navigator.clipboard && window.isSecureContext) {
      if (action === 'cut') {
        await navigator.clipboard.writeText(text) // cut 兜底走 copy 语义（老指令 cut 场景未在本组件使用）
      } else {
        await navigator.clipboard.writeText(text)
      }
    } else {
      const ok = execCommandCopy(text, action)
      if (!ok) throw new Error('execCommand copy failed')
    }
    clipboardSuccess(value)
  } catch (e) {
    // navigator.clipboard 失败时再兜底一次 execCommand
    try {
      const ok = execCommandCopy(text, 'copy')
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
    el._v_clipboard_handler = () => {
      const action = binding.arg === 'cut' ? 'cut' : 'copy'
      doCopy(binding.value, action)
    }
    el.addEventListener('click', el._v_clipboard_handler)
  },
  updated(el, binding) {
    // 绑定值变化由 handler 闭包引用 binding 最新值，无需重建监听
    if (el._v_clipboard_handler) {
      el.removeEventListener('click', el._v_clipboard_handler)
      el._v_clipboard_handler = () => {
        const action = binding.arg === 'cut' ? 'cut' : 'copy'
        doCopy(binding.value, action)
      }
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
