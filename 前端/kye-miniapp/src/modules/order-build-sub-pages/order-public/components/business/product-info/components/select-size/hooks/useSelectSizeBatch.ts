import { computed, ref } from 'vue'

/**
 * 选中 key 生成规则：
 * 我的尺寸（id）与历史尺寸（batchId）均为纯数字 id，直接 String(id) 作 key 会撞车，
 * 导致选中状态/全选状态跨 tab 串用。按类型加前缀隔离，两 tab 相互独立。
 */
export const mySizeKey = (id: string | number) => `my-${id}`
export const historySizeKey = (batchId: string | number) => `his-${batchId}`

/**
 * 选择尺寸页批量多选状态（page 级持有，随页面销毁自动重置，不用 Pinia 避免跨页污染）
 * - isSelectAllStatus：批量态开关
 * - selectedIds：已选中卡片标识集合（我的尺寸用 mySizeKey、历史尺寸用 historySizeKey 生成），
 *   跨 tab 共享集合用于「已选 N 条」合计与批量确定并集回填；全选状态按当前 tab 独立计算
 * - searchKey：搜索关键词，切 tab 保留
 */
export const useSelectSizeBatch = () => {
  /** 批量态开关 */
  const isSelectAllStatus = ref(false)

  /** 已选中卡片集合（跨 tab 共享，切换 tab 保留） */
  const selectedIds = ref<Set<string>>(new Set())

  /** 搜索关键词（切 tab 保留） */
  const searchKey = ref('')

  /** 已选条数 */
  const selectedCount = computed(() => selectedIds.value.size)

  /** 切换单张卡片选中态 */
  const toggleSelect = (id: string | number) => {
    const key = String(id)
    const next = new Set(selectedIds.value)
    if (next.has(key)) {
      next.delete(key)
    } else {
      next.add(key)
    }
    selectedIds.value = next
  }

  /** 批量勾选（全选场景） */
  const selectIds = (ids: (string | number)[]) => {
    const next = new Set(selectedIds.value)
    ids.forEach((id) => next.add(String(id)))
    selectedIds.value = next
  }

  /** 批量取消勾选（取消全选场景） */
  const unselectIds = (ids: (string | number)[]) => {
    const next = new Set(selectedIds.value)
    ids.forEach((id) => next.delete(String(id)))
    selectedIds.value = next
  }

  /** 清空选中集合 */
  const clearSelected = () => {
    selectedIds.value = new Set()
  }

  /** 进入批量态 */
  const enterBatchMode = () => {
    isSelectAllStatus.value = true
  }

  /** 退出批量态：清空选中集合，保留搜索词与高亮 */
  const exitBatchMode = () => {
    isSelectAllStatus.value = false
    clearSelected()
  }

  return {
    isSelectAllStatus,
    selectedIds,
    searchKey,
    selectedCount,
    toggleSelect,
    selectIds,
    unselectIds,
    clearSelected,
    enterBatchMode,
    exitBatchMode,
  }
}
