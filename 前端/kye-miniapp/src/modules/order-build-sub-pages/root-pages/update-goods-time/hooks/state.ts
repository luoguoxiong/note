import { GoodsTimeWaybillItem } from '@order-public-sub-public/apis/update-goods-time/type'
import { GoodsTime, GoodsTimeVo } from '@order-public-sub-public/types'
import { computed, ref } from 'vue'

export const loadingToast = ref<any>()
export const confirmLoading = ref(false)
export const isShowPageLoading = ref(false)
export const batchEditGoodsInfo = ref<{ newGoodsTime: GoodsTime; waybillNumbers: string[] }>()

// 列表状态数据
export const state = ref({
  refreshing: false,
  errorStatus: false,
  loading: false,
  initLoading: false,
  finished: false,
  showSkeleton: true,
  errorText: '',
  list: [] as GoodsTimeWaybillItem[],
  page: 0,
  pageSize: 20,
  pageTotal: 0,
})

export const showNoData = computed(() => {
  return !state.value.list.length && !state.value.showSkeleton && !state.value.loading
})

export const allCheckedStatus = ref(false)

export const MAX_SELECT_NUMBER = 100

/**
 * 场景一: 当前页 共十条,       手动选择了十条      全选按钮      [自动勾上]
 * 场景二: 当前页 共一百一十条,    手动选择了一百条  全选按钮      [不自动勾上]
 *
 * 场景三: 当前页 共十条,   点击了全选,   然后翻页 [保持全选状态] 并   [自动勾上下一页的数据]
 * 场景四: 当前页 共一百条, 点击了全选,  然后翻页 [保持全选状态]       [不自动勾上下一页的数据]  [不用给提示]
 */
export const isAllChecked = computed(() => {
  if (state.value.list.length <= MAX_SELECT_NUMBER) {
    return checkedList.value.length > 0 && checkedList.value.length === state.value.list.length
  }
  return allCheckedStatus.value
})

// 已选列表
export const checkedList = ref<GoodsTimeWaybillItem[]>([])

export const goodsTimeVo = ref<GoodsTimeVo>()

export const isShowUpdateTimeSuccess = ref(false)
