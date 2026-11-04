import { KyInputProps } from '../../input/src/types'

export interface AutoCompleteProps extends KyInputProps {
  fetchSuggestions: [] | Function // 获取输入建议的方法， 仅当你的输入建议数据 resolve 时，通过调用 callback(data:[])  来返回它
  hideLoading: boolean // 是否隐藏远程加载时的加载图标
  debounce: number // 获取输入建议的防抖延时，单位为毫秒
  highlightFirstItem: boolean // 是否默认高亮远程搜索结果的第一项
  placement: 'top' | 'top- start' | 'top-end' | 'bottom' | 'bottom-start' | 'bottom-end' // 菜单弹出位置
  listenClickId: string
}
