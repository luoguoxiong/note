import { onBeforeUnmount, ref } from 'vue'
import type { FuzzyGoods, GoodsSearchData } from '@/apis/home/types'
import { http } from '@/utils/request/request'

/** 当前展开的面板：历史 / 联想 / 无（两面板互斥，由单一状态表达） */
export type ActivePanel = 'history' | 'suggestions' | null

/** 历史记录加载状态：idle 未请求过 / loading 请求中 / loaded 已加载（含加载后为空或失败） */
export type HistoryLoadState = 'idle' | 'loading' | 'loaded'

const HISTORY_MAX = 20 // 最多展示最近 20 条
const DEBOUNCE_INTERVAL = 300 // 联想输入防抖
const DEL_RECORD_API = 'web.client.forbidden.delSearchRecord' // 删除/清空搜索记录（传 searchWord 删单条，不传即清空）

/**
 * 违禁品查询搜索业务：请求、数据归一化、防抖、请求失效、历史维护、面板切换。
 * 面板滚动与点击外部收起由入口组件处理（调用 closePanels / 读取 activePanel）。
 */
export function useContrabandSearch() {
  // ===== 展示状态 =====
  const keyword = ref('')
  const activePanel = ref<ActivePanel>(null)
  const isFocused = ref(false)

  // 联想
  const suggestions = ref<FuzzyGoods[]>([])
  // 当前结果对应的关键词（用于面板内关键词高亮，避免与正在输入的新关键词错位）
  const fetchedKeyword = ref('')

  // 历史
  const historyList = ref<string[]>([])
  const historyLoadState = ref<HistoryLoadState>('idle')

  // ===== 统一清理：防抖定时器 + 过期请求 =====
  let debounceTimer: ReturnType<typeof setTimeout> | undefined
  let requestSeq = 0

  // 输入变化、选中、关闭、提交、卸载时统一调用，防止面板关闭后被异步结果重新打开
  const invalidatePending = () => {
    clearTimeout(debounceTimer)
    requestSeq += 1
  }

  // 关闭所有面板并失效在途联想
  const closePanels = () => {
    invalidatePending()
    activePanel.value = null
    suggestions.value = []
  }

  // ===== 联想搜索 =====
  const fetchSuggestions = async (kw: string) => {
    requestSeq += 1
    const seq = requestSeq
    try {
      const res = await http<GoodsSearchData>('web.client.goods.searchByKeyWords', {
        goodsKeyWord: kw,
        type: 0,
        clientType: 2,
      })
      // 在途旧请求：期间有新输入/关闭/选中，丢弃本次结果
      if (seq !== requestSeq) return
      const list = res?.data?.fuzzyGoodsList || []
      suggestions.value = list
      fetchedKeyword.value = kw
      activePanel.value = list.length ? 'suggestions' : null
    } catch {
      if (seq !== requestSeq) return
      closePanels()
    }
  }

  // ===== 搜索历史 =====
  // 历史数据仅来自读接口：web.client.forbidden.latestRecord（clientType：1 移动端 / 2 客户端）
  // 删除/清空走写接口 web.client.forbidden.delSearchRecord：传 searchWord 删单条，不传即清空
  // 查询记录由服务端自动落库，前端无需上报

  // 接口返回归一化：兼容字符串或 { goodsName/keyword } 对象，去重后截断到上限
  // 去重用 indexOf 过滤（项目编译目标为 ES5，不能用 Set 展开）
  const normalizeHistory = (raw: unknown): string[] => {
    if (!Array.isArray(raw)) return []
    const items = raw
      .map((v): string => {
        if (typeof v === 'string') return v
        if (v && typeof v === 'object') {
          const obj = v as Record<string, unknown>
          const name = obj.goodsName || obj.keyword
          return typeof name === 'string' ? name : ''
        }
        return ''
      })
      .filter((v) => !!v.trim())
    return items.filter((v, i) => items.indexOf(v) === i).slice(0, HISTORY_MAX)
  }

  // 拉取最近搜索记录（clientType：1 移动端 / 2 客户端），接口数据整体覆盖；
  // 失败保持 idle，下次展开历史面板时重试
  const fetchHistory = async () => {
    if (historyLoadState.value === 'loading') return
    historyLoadState.value = 'loading'
    try {
      const res = await http<string[]>('web.client.forbidden.latestRecord', { clientType: 2 })
      historyList.value = normalizeHistory(res?.data)
      historyLoadState.value = 'loaded'
    } catch {
      // 拉取失败保留当前列表
    }
  }

  // 展开历史面板（与联想互斥，展开前先失效在途联想）
  const openHistory = () => {
    if (!historyList.value.length) return
    closePanels()
    activePanel.value = 'history'
  }

  // 空关键词时展开历史面板（聚焦、清空输入共用）：先展示本地缓存（无闪烁），
  // 同时拉取接口静默刷新（删除/清空/多端查询都会改变服务端数据）；
  // 刷新返回后若仍聚焦且关键词为空则补展开（覆盖缓存为空未展开的场景）
  const showHistory = () => {
    openHistory()
    fetchHistory().then(() => {
      if (isFocused.value && !keyword.value.trim() && !activePanel.value) openHistory()
    })
  }

  // ===== 删除/清空（delSearchRecord：传 searchWord 删单条，只传 clientType 清空）=====
  // 失败时 http 封装已统一 toast，业务层保持本地不变；请求中忽略重复触发
  let historyMutating = false

  const removeHistory = async (kw: string) => {
    if (historyMutating || !kw) return
    historyMutating = true
    try {
      await http<number>(DEL_RECORD_API, { clientType: 2, searchWord: kw })
      historyList.value = historyList.value.filter((v) => v !== kw)
      if (activePanel.value === 'history' && !historyList.value.length) activePanel.value = null
    } catch {
      // 保持本地列表不变
    } finally {
      historyMutating = false
    }
  }

  const clearHistory = async () => {
    if (historyMutating) return
    historyMutating = true
    try {
      await http<number>(DEL_RECORD_API, { clientType: 2 })
      historyList.value = []
      if (activePanel.value === 'history') activePanel.value = null
    } catch {
      // 保持本地列表不变
    } finally {
      historyMutating = false
    }
  }

  // ===== 用户操作 =====

  // 用户输入（@update:model-value）：更新关键词 + 防抖联想；选中回填不走这里
  const handleUserInput = (val: string) => {
    keyword.value = val
    invalidatePending()
    const kw = val.trim()
    if (!kw) {
      closePanels()
      // 输入被清空且仍聚焦时，展示搜索历史
      if (isFocused.value) showHistory()
      return
    }
    if (activePanel.value === 'history') activePanel.value = null
    debounceTimer = setTimeout(() => fetchSuggestions(kw), DEBOUNCE_INTERVAL)
  }

  // 选中回填（联想/历史统一入口）：回填不触发联想
  const selectKeyword = (kw: string) => {
    closePanels()
    if (keyword.value === kw) return
    keyword.value = kw
  }

  // 聚焦：空关键词展示历史（未加载时拉取，数据返回后自动展开）；有关键词且联想面板未开则重新联想
  // 后续可选优化：改为每次聚焦重新 fetchHistory，保持多端最新记录（接口就位后评估）
  const handleFocus = () => {
    isFocused.value = true
    const kw = keyword.value.trim()
    if (!kw) {
      showHistory()
      return
    }
    if (activePanel.value === 'suggestions') return
    fetchSuggestions(kw)
  }

  const handleBlur = () => {
    isFocused.value = false
    // 失焦关闭所有面板（面板内条目已用 mousedown.prevent 阻止失焦，不影响操作）；
    // 必须失效在途联想，否则请求返回会重新打开联想面板
    closePanels()
  }

  onBeforeUnmount(() => {
    invalidatePending()
  })

  return {
    // 状态
    keyword,
    activePanel,
    isFocused,
    suggestions,
    fetchedKeyword,
    historyList,
    historyLoadState,
    // 操作
    handleUserInput,
    selectKeyword,
    handleFocus,
    handleBlur,
    closePanels,
    removeHistory,
    clearHistory,
  }
}
