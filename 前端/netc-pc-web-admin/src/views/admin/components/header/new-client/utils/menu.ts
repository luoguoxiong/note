/**
 * 客户端右键菜单初始化工具
 * 来源: netc-pc-web/src/views/new-client/utils/menu.js
 */
import { isKuaShenClientMode, setRightMenu } from '@/native/electron'

const canEdit = (target: Element | null): boolean => {
  if (!target) return false
  const el = target as HTMLElement
  return (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || !!el.isContentEditable) && !el.getAttribute('readonly')
}

export const getSelectionWord = (): boolean => {
  const sel = window.getSelection()
  const type = sel?.type
  return type === 'Range'
}

export function initMenu() {
  document.addEventListener('contextmenu', (ev) => {
    ev.preventDefault()
    const activeElement = document.activeElement
    const filters: string[] = []
    const normalMenuList = [
      {
        label: '剪切',
        role: 'cut',
        enabled: false,
        accelerator: 'CommandOrControl+X',
      },
      {
        label: '复制',
        role: 'copy',
        enabled: false,
        accelerator: 'CommandOrControl+C',
      },
      {
        label: '粘贴',
        role: 'paste',
        enabled: false,
        accelerator: 'CommandOrControl+V',
      },
    ]
    if (canEdit(activeElement)) {
      filters.push('粘贴')
    }
    if (getSelectionWord()) {
      filters.push('复制')
    }
    if (getSelectionWord() && canEdit(activeElement)) {
      filters.push('剪切')
    }
    // 获取鼠标位置
    const client = {
      x: ev.clientX,
      y: ev.clientY,
    }
    if (filters.length === 0) {
      return
    }
    const filterList = normalMenuList.map((item) => {
      return {
        ...item,
        enabled: filters.findIndex((i) => i === item.label) !== -1,
      }
    })
    let param: Record<string, unknown> | string = {
      filters: filterList,
      position: client,
    }
    if (isKuaShenClientMode()) {
      param = JSON.stringify(param)
    }
    setRightMenu(param)
  })
}
