<template>
  <div
    :class="['select-size-page h-full dialog_root_product_selectsize', { 'has-footer': showFooter }]"
    id="other_express_goods_hsize_perception_v1"
    :exposure-report="{
      eventCode: 'other_express_goods_hsize_perception_v1',
    }"
  >
    <div
      :class="`select-size-header ${
        tabsActived === 'select-size' ? 'select-size-header-select' : 'select-size-header-history'
      }`"
    >
      <div class="select-size-tabs flex items-center justify-center">
        <div
          :class="`tabs-items ${tabsActived === 'select-size' ? 'selected' : ''}`"
          @click="() => handleTabs('select-size')"
        >
          {{ mySizeTabText }}
        </div>
        <div
          :class="`tabs-items ${tabsActived === 'history-size' ? 'selected' : ''}`"
          @click="() => handleTabs('history-size')"
        >
          {{ historySizeTabText }}
        </div>
      </div>
      <div class="select-size-search">
        <KySearch
          clearable
          :placeholder="placeholder"
          :modelValue="goodsType"
          id="exp_express_select_size_history_size_search_v1"
          :exposure-report="{
            eventCode: 'exp_express_select_size_history_size_search_v1',
          }"
          v-click-report="{
            eventCode: 'clk_express_select_size_history_size_search_v1',
          }"
          @update:model-value="onSearch"
          v-keyboard
        />
      </div>
    </div>
    <!-- <HistorySizeSkeletonScreen v-if="skeletonLoading"></HistorySizeSkeletonScreen> -->
    <ListRefreshLoad
      v-if="showList"
      :refreshing="refreshing"
      :loading="kyLoading"
      :finished="finished"
      :finishedText="finishedText"
      :isNeedRefresh="true"
      :offset="20"
      @onLoad="onLoad"
      @refresh="onRefresh"
    >
      <!-- 我的尺寸 -->
      <MySize
        v-if="tabsActived === 'select-size'"
        sizeType="my-size"
        :selectSkuSize="selectSkuSize"
        :searchKey="goodsType"
        :isSelectAllStatus="isSelectAllStatus"
        :selectedIds="selectedIds"
        :canDelete="canAddSize"
        :batchDisabled="batchDisabled"
        @handleSelect="handleSelect"
        @handleDelete="handleDeleteMySize"
        @toggleBatch="handleToggleBatchMode"
      />
      <!-- 历史尺寸 -->
      <HisTorySize
        v-else
        :historySizeList="historySizeList"
        :searchKey="goodsType"
        :isSelectAllStatus="isSelectAllStatus"
        :selectedIds="selectedIds"
        :batchDisabled="batchDisabled"
        @handleDelete="handleDelete"
        @handleSelectHistory="handleSelectHistory"
        @handleRename="handleHistoryRename"
        @toggleBatch="handleToggleBatchMode"
      />
    </ListRefreshLoad>
    <SelectSizeFooter
      v-if="showFooter"
      :isBatch="isSelectAllStatus"
      :activeTab="tabsActived"
      :selectedCount="selectedCount"
      :isAllSelected="isAllSelected"
      :canAddSize="canAddSize"
      @toggleSelectAll="handleToggleSelectAll"
      @confirm="handleBatchConfirm"
      @addSize="handleAddSize"
    />
    <!-- 我的尺寸空态：缺省文案 + 新增尺寸按钮 -->
    <KyEmpty
      v-if="showEmpty && tabsActived === 'select-size'"
      class="select-size-empty"
      :type="EmptyTypeEnum.DATA"
      description="暂无我的尺寸数据"
    >
      <KyButton v-if="canAddSize" size="small" class="empty-add-btn" text="新增尺寸" @click="handleAddSize"></KyButton>
    </KyEmpty>
    <!-- 历史尺寸空态：缺省图，无新增按钮 -->
    <KyEmpty
      class="select-size-empty"
      :type="EmptyTypeEnum.DATA"
      description="暂无历史尺寸数据"
      v-if="showEmpty && tabsActived !== 'select-size'"
    />
    <PageCommon pageValidateName="edit" />
  </div>
</template>

<script setup lang="ts">
import { useOrderExposureReport } from '@order-public-sub-public/report/exposureReport'
import Taro, { useDidShow } from '@tarojs/taro'

import { ref, onMounted, computed } from 'vue'
import KySearch from '@order-public-sub-public/components/base/ky-search/index.vue'
import ListRefreshLoad from '@order-public-sub-public/components/ui/list-refresh-load/index.vue'
import PageCommon from '@order-public-sub-public/components/ui/page-common/index.vue'
import {
  getCustomerSkuInfo,
  findPageSkuSize,
  deleteHistorySize,
  getHistorySizeByPage,
  deleteCustomerSku,
} from '@order-public-sub-public/apis/product-info/index'
import { SelectSize, HistorySizeList } from '@order-public-sub-public/apis/product-info/types'
import { GoodsSize } from '@order-public-sub-public/types'
import { showKyDialog } from '@order-public-sub-public/validate/effect/effectDialog'
import { useRouter } from '@order-public-sub-public/vue-router/index'
import { debounce } from 'lodash-es'
import KyEmpty from '@order-public-sub-public/components/ui/ky-empty/index.vue'
import HisTorySize from './components/historySize/index.vue'
import MySize from './components/mySize/index.vue'
import SelectSizeFooter from './components/footer/index.vue'
import { useSelectSizeBatch, mySizeKey, historySizeKey } from './hooks/useSelectSizeBatch'
import { EmptyTypeEnum, MAX_DELAY_TIME, MIN_DEBOUNCE_TIME, maxOfGroup } from '@order-public-sub-public/constants'
import { getQueryObject, aliPayOrAMapApp } from '@order-public-sub-public/utils'
import {
  apiResultReport,
  clk_select_size_batch_toggle_v1,
  clk_select_size_batch_selectall_v1,
  clk_select_size_batch_confirm_v1,
  clk_select_size_addsize_v1,
  clk_select_size_delete_v1,
} from '@order-public-sub-public/components/business/product-info/hooks/report'
import { showToast } from '@order-global-package-order-sub/hooks/useShowToast'
import { routerBackFromSizeType, selectSizeRefreshType } from '../../hooks/state'
import { stopPullDownRefresh } from '@tarojs/taro'
import umpOtherReport from '@order-public-sub-public/reportUmp/sceneReport/umpotherReport'
import KyButton from '@order-global-package-order-sub/components/base/ky-button/index.vue'

const router = useRouter()
useOrderExposureReport(['other_express_goods_hsize_perception_v1', 'exp_express_select_size_history_size_search_v1'])

/**
 * 跨包回填：子包无法直接修改 order-build 货物信息状态，
 * 经事件通知 product-size 组件（order-build）覆盖/追加尺寸组
 */
const setPreWaybillGoodsSizeList = (list: GoodsSize[], type: string) => {
  Taro.eventCenter.trigger('toSetPreWaybillGoodsSizeList', {
    list,
    type,
  })
}

// 批量多选状态（page 级持有，切 tab 保留选中与搜索词，退出批量清空选中，页面销毁自动重置）
const {
  isSelectAllStatus,
  selectedIds,
  searchKey: goodsType,
  selectedCount,
  toggleSelect,
  selectIds,
  unselectIds,
  enterBatchMode,
  exitBatchMode,
} = useSelectSizeBatch()

const selectSkuSize = ref<SelectSize[]>([])

const historySizeList = ref<HistorySizeList[]>([])

/**
 * 选中卡片数据快照（key -> 尺寸组列表）：
 * 搜索/切 tab 会整体替换当前渲染列表，selectedIds 只保留勾选标识，
 * 勾选时同步快照数据，批量确定时从快照取数，
 * 保证非搜索状态下勾选的数据在搜索状态下点击确定仍可回填
 */
const selectedDataMap = new Map<string, GoodsSize[]>()

const placeholder = computed(() => {
  return tabsActived.value === 'select-size' ? '请输入托寄物名称' : '请输入历史尺寸名称'
})

const page = ref(0)

const totalPage = ref(10)

const pageSize = ref(10)

const skeletonLoading = ref(true) // 骨架屏
const refreshing = ref(false)
const finished = ref(false)
const finishedText = ref('没有更多了')
const showEmpty = computed(() => {
  return (
    !skeletonLoading.value &&
    !kyLoading.value &&
    (tabsActived.value === 'select-size' ? selectSkuSize.value.length === 0 : historySizeList.value.length === 0)
  )
})
const getQueryObjects = () => {
  const query = getQueryObject()
  const { currentCount } = query

  // 进入页面时货物信息尺寸组数快照（空尺寸按 0 条计，由跳转方计算）
  currentCountRef.value = Number(currentCount) || 0
}

const tabsActived = ref('select-size')

const kyLoading = ref(false)

/** 货物信息当前尺寸组数快照 */
const currentCountRef = ref(0)

/** 货物信息已达上限时禁止进入批量态 */
const batchDisabled = computed(() => currentCountRef.value >= maxOfGroup.最大)

/** 我的尺寸 tab 文案（含条数统计） */
const mySizeTabText = computed(() => (mySizeCount.value === null ? '我的尺寸' : `我的尺寸(${mySizeCount.value})`))

/** 历史尺寸 tab 文案（含条数统计） */
const historySizeTabText = computed(() =>
  historySizeCount.value === null ? '历史尺寸' : `历史尺寸(${historySizeCount.value})`,
)

/** 我的尺寸列表全部卡片标识（按前缀隔离） */
const mySizeIds = computed(() => selectSkuSize.value.map((item) => mySizeKey(item.id)))

/** 历史尺寸列表全部卡片标识（按前缀隔离） */
const historySizeIds = computed(() => historySizeList.value.map((item) => historySizeKey(item.batchId)))

/**
 * 全选状态按 tab 独立缓存：
 * 每个 tab 的全选 computed 仅在自身列表或选中集合变化时重新遍历，
 * 频繁切换 tab 只读取缓存值，不重复循环
 */
/** 我的尺寸是否全选（手动取消一项即回退未选中态） */
const isMySizeAllSelected = computed(
  () => mySizeIds.value.length > 0 && mySizeIds.value.every((id) => selectedIds.value.has(id)),
)

/** 历史尺寸是否全选（手动取消一项即回退未选中态） */
const isHistorySizeAllSelected = computed(
  () => historySizeIds.value.length > 0 && historySizeIds.value.every((id) => selectedIds.value.has(id)),
)

/** 当前 tab 是否全选：随 tabsActived 取对应缓存值 */
const isAllSelected = computed(() =>
  tabsActived.value === 'select-size' ? isMySizeAllSelected.value : isHistorySizeAllSelected.value,
)

/** Footer 显隐：仅当前 tab 有数据时才展示；批量态常驻（同样需有数据） */
const showFooter = computed(
  () =>
    (tabsActived.value === 'select-size' ? selectSkuSize.value.length > 0 : historySizeList.value.length > 0) &&
    (isSelectAllStatus.value || (showList.value && tabsActived.value === 'select-size' && canAddSize.value)),
)

/** 是否展示新增尺寸入口：mySizeOptFlag true-可操作展示（默认），false-不可操作隐藏；接口报错置 false 不展示；支付宝/高德端隐藏 */
const canAddSize = computed(() => {
  return mySizeOptFlag.value && !aliPayOrAMapApp
})

/** tab 条数统计 */
const mySizeCount = ref<number | null>(null)
const historySizeCount = ref<number | null>(null)
const mySizeOptFlag = ref(false)

const getCustomerSkuInfoData = async () => {
  try {
    const { data } = await getCustomerSkuInfo()
    mySizeOptFlag.value = data?.mySizeOptFlag === true
  } catch (error) {
    // 接口报错：置 false（不可操作），新增尺寸入口不展示
    mySizeOptFlag.value = false
    console.error(error)
  }
}

/**
 * 批量操作/退出操作切换
 */
const handleToggleBatchMode = () => {
  if (!isSelectAllStatus.value) {
    if (batchDisabled.value) {
      showToast(`最大添加${maxOfGroup.最大}组`)
      return
    }
    clk_select_size_batch_toggle_v1('enter')
    enterBatchMode()
    return
  }
  // 退出批量态：清空选中集合与数据快照，保留搜索词与高亮
  clk_select_size_batch_toggle_v1('exit')
  exitBatchMode()
  selectedDataMap.clear()
}

/** 全选/取消全选（仅作用于当前 tab 列表，同步快照数据） */
const handleToggleSelectAll = () => {
  const tabIds = tabsActived.value === 'select-size' ? mySizeIds.value : historySizeIds.value
  if (isAllSelected.value) {
    clk_select_size_batch_selectall_v1('cancel')
    unselectIds(tabIds)
    tabIds.forEach((id) => selectedDataMap.delete(id))
  } else {
    clk_select_size_batch_selectall_v1('all')
    selectIds(tabIds)
    if (tabsActived.value === 'select-size') {
      selectSkuSize.value.forEach((item) => selectedDataMap.set(mySizeKey(item.id), buildMySizeData(item)))
    } else {
      historySizeList.value.forEach((item) =>
        selectedDataMap.set(historySizeKey(item.batchId), buildHistorySizeData(item)),
      )
    }
  }
}

/** 我的尺寸组数据：1 卡 = 1 组（勾选时快照） */
const buildMySizeData = (item: SelectSize): GoodsSize[] => [
  {
    length: item.goodsLength,
    width: item.goodsWidth,
    height: item.goodsHeight,
    count: 1,
    singleWeight: item.goodsWeight || '',
  },
]

/** 历史尺寸组数据：1 卡 = N 组（勾选时快照） */
const buildHistorySizeData = (item: HistorySizeList): GoodsSize[] =>
  (item.goodsSizes || []).map((secItem) => ({
    length: secItem.length,
    width: secItem.width,
    height: secItem.height,
    count: secItem.count,
    singleWeight: secItem.singleWeight || '',
  }))

/**
 * 批量确定回填：
 * - 数据取自勾选时快照 selectedDataMap（不依赖当前搜索/分页列表）
 * - 复用 sliceSelectedByRemaining 以剩余可添加数量截断（支持卡片内部分截断）
 * - 仅回填尺寸数据（不回填托寄物）
 */
const handleBatchConfirm = () => {
  const selectedGoodsSizes: GoodsSize[] = []
  selectedDataMap.forEach((goodsSizes) => {
    selectedGoodsSizes.push(...goodsSizes)
  })
  if (selectedGoodsSizes.length === 0) {
    showToast('请先选择尺寸')
    return
  }
  const result = sliceSelectedByRemaining(selectedGoodsSizes)
  if (!result) return
  clk_select_size_batch_confirm_v1(result.length)
  setPreWaybillGoodsSizeList(result, 'mySize')
  setTimeout(() => {
    routerBackFromSizeType.value = 'mySize'
    router.back()
  }, MAX_DELAY_TIME)
}

/** 新增尺寸入口：直接进入新增尺寸页（20 组上限在新增尺寸页内拦截） */
const handleAddSize = () => {
  clk_select_size_addsize_v1()
  router.push({ path: '/add-my-size' })
}

/**
 * 删除我的尺寸：
 * - CRM 客户后台同步数据置灰，点击 toast 提示
 * - 自有数据二次确认后调用删除接口并刷新
 */
const handleDeleteMySize = async (id: string) => {
  const item = selectSkuSize.value?.find((v) => String(v.id) === String(id))
  if (!item) return
  if (!item.deleteEnable) {
    showToast('后台维护的尺寸数据无法删除')
    return
  }
  await showKyDialog({
    zIndex: 1000,
    title: '温馨提示',
    message: '确定要删除该尺寸吗，删除后将不可恢复，请谨慎操作',
    cancelButtonText: '取消',
    showCancelButton: true,
    confirmButtonText: '确定',
  })
  clk_select_size_delete_v1('mySize')
  try {
    await deleteCustomerSku({ id: Number(id) })
    // 删除后不本地过滤：重置分页重新请求当前 tab 列表，数据与条数（rowTotal）以接口为准
    resetOptions()
    await onLoad(false)
    // 已删除卡片若在选中集合中则同步移除（含数据快照）
    unselectIds([mySizeKey(id)])
    selectedDataMap.delete(mySizeKey(id))
    showToast('删除成功')
  } catch (error) {
    console.error(error)
  }
}

const handleTabs = (type: string) => {
  skeletonLoading.value = true
  tabsActived.value = type
  resetOptions()
  onLoad(true)
}

const getSelectSkuSize = async (isRefresh?: boolean) => {
  const pageRef = page.value
  if (pageRef + 1 > totalPage.value) {
    finished.value = true
    return
  }
  page.value = page.value + 1
  kyLoading.value = !refreshing.value && !isRefresh
  try {
    const response = await findPageSkuSize({ page: page.value, pageSize: pageSize.value, goodsType: goodsType.value })
    totalPage.value = response?.data?.pageTotal
    // tab 条数统计取分页接口 rowTotal
    mySizeCount.value = response?.data?.rowTotal ?? 0
    const isResetList = isRefresh || response?.data?.page === 1
    selectSkuSize.value = isResetList ? response.data.rows : [...selectSkuSize.value, ...response.data.rows]
    if (page.value === response?.data?.pageTotal) {
      finished.value = true
    }
  } catch (error) {
    finished.value = true
    console.error(error)
  } finally {
    skeletonLoading.value = false
    kyLoading.value = false
  }
}

const resetOptions = () => {
  page.value = 0
  totalPage.value = 10
  finished.value = false
}

const showList = computed(() => {
  if (tabsActived.value === 'select-size') {
    return selectSkuSize.value.length > 0 && !skeletonLoading.value
  } else {
    return historySizeList.value.length > 0 && !skeletonLoading.value
  }
})

const onSearch = debounce(async (value?: string) => {
  goodsType.value = value || ''
  resetOptions()
  await onLoad(true, true)
}, MIN_DEBOUNCE_TIME)

const onRefresh = async () => {
  refreshing.value = true
  resetOptions()
  try {
    await onLoad(true)
  } catch (error) {
    console.log(error)
  } finally {
    refreshing.value = false
  }
}

const fetchHistorySizeList = async (isRefresh?: boolean, report?: boolean) => {
  const pageRef = page.value
  if (pageRef + 1 > totalPage.value) {
    finished.value = true
    return
  }
  page.value = page.value + 1
  kyLoading.value = !refreshing.value && !isRefresh
  const eventCode = 'other_express_select_size_history_size_search_v1'
  try {
    const { data } = await getHistorySizeByPage({
      sourceId: 20,
      page: page.value,
      pageSize: pageSize.value,
      searchContent: goodsType.value,
    })
    totalPage.value = data?.pageTotal
    // tab 条数统计取分页接口 rowTotal
    historySizeCount.value = data?.rowTotal ?? 0
    const isResetList = isRefresh || data.page === 1
    historySizeList.value = isResetList ? data?.rows : [...historySizeList.value, ...data?.rows]
    if (report) {
      apiResultReport(true, eventCode)
    }
    if (page.value === data?.pageTotal) {
      finished.value = true
    }
  } catch (error) {
    finished.value = true
    console.error(error)
    if (report) {
      apiResultReport(false, eventCode, error)
    }
  } finally {
    skeletonLoading.value = false
    kyLoading.value = false
  }
}

/**
 * 按剩余可添加数量截断选中尺寸
 * - 子包无法直接读取 order-build 货物信息尺寸组，使用进入页面时的 currentCount 快照
 * - 选择数量大于剩余可添加数量时，截断取前 N 条
 */
const sliceSelectedByRemaining = (selected: GoodsSize[]) => {
  const currentCount = currentCountRef.value
  const remaining = maxOfGroup.最大 - currentCount
  if (remaining <= 0) {
    showToast(`最大添加${maxOfGroup.最大}组`)
    return null
  }
  if (selected.length > remaining) {
    // showToast(`已达最大数量限制，已添加${remaining}组`)
    return selected.slice(0, remaining)
  }
  return selected
}

const handleSelect = (id: string) => {
  // 批量态：点击整卡切换选中态（同步快照数据，搜索后仍可回填）
  if (isSelectAllStatus.value) {
    const key = mySizeKey(id)
    // 已选组数（货物信息已有 currentCount + 本页勾选 selectedCount）达到上限：仅拦截新增勾选，取消勾选不受限
    if (!selectedIds.value.has(key) && currentCountRef.value + selectedCount.value >= maxOfGroup.最大) {
      showToast(`最大添加${maxOfGroup.最大}组`)
      return
    }
    toggleSelect(key)
    if (selectedIds.value.has(key)) {
      const item = selectSkuSize.value.find((i) => String(i.id) === String(id))
      if (item) selectedDataMap.set(key, buildMySizeData(item))
    } else {
      selectedDataMap.delete(key)
    }
    return
  }
  const selectSize = selectSkuSize.value?.filter((item) => item.id === id)
  // SKU尺寸回填重量
  const resultHistorySize = selectSize?.map((item) => ({
    length: item.goodsLength,
    width: item.goodsWidth,
    height: item.goodsHeight,
    count: 1,
    singleWeight: item.goodsWeight || '',
  }))
  console.log(resultHistorySize, 'resultHistorySize')
  const result = sliceSelectedByRemaining(resultHistorySize)
  if (!result) return
  setPreWaybillGoodsSizeList(result, 'mySize')
  setTimeout(() => {
    routerBackFromSizeType.value = 'mySize'
    router.back()
  }, MAX_DELAY_TIME)
}

const handleSelectHistory = (batchId: number) => {
  // 批量态：点击整卡切换选中态（同步快照数据，搜索后仍可回填）
  if (isSelectAllStatus.value) {
    const key = historySizeKey(batchId)
    // 已选组数（货物信息已有 currentCount + 本页勾选 selectedCount）达到上限：仅拦截新增勾选，取消勾选不受限
    if (!selectedIds.value.has(key) && currentCountRef.value + selectedCount.value >= maxOfGroup.最大) {
      showToast(`最大添加${maxOfGroup.最大}组`)
      return
    }
    toggleSelect(key)
    if (selectedIds.value.has(key)) {
      const item = historySizeList.value.find((i) => i.batchId === batchId)
      if (item) selectedDataMap.set(key, buildHistorySizeData(item))
    } else {
      selectedDataMap.delete(key)
    }
    return
  }
  const selectHistorySize = historySizeList.value?.filter((item) => item.batchId === batchId)?.[0]?.goodsSizes
  // 历史尺寸回填单件重量
  const resultHistorySize = selectHistorySize?.map((item) => ({
    length: item.length,
    width: item.width,
    height: item.height,
    count: item.count,
    singleWeight: item.singleWeight || '',
  }))
  const result = sliceSelectedByRemaining(resultHistorySize)
  if (!result) return
  setPreWaybillGoodsSizeList(result, 'historySize')
  setTimeout(() => {
    routerBackFromSizeType.value = 'historySize'
    router.back()
  }, MAX_DELAY_TIME)
}

const handleDelete = async (batchId: number) => {
  await showKyDialog({
    zIndex: 1000,
    title: '温馨提示',
    message: '确定要删除此条历史尺寸吗？',
    cancelButtonText: '取消',
    showCancelButton: true,
    confirmButtonText: '确定',
  })
  clk_select_size_delete_v1('historySize')
  const selectHistorySize = historySizeList.value?.filter((item) => item.batchId === batchId)?.[0]
  try {
    await deleteHistorySize({ batchIdList: [selectHistorySize.batchId] })
    const resultHistoryList = historySizeList.value.filter((item) => item.batchId !== batchId)
    historySizeList.value = resultHistoryList
    // 删除后实时更新 tab 条数统计（本地减数）
    historySizeCount.value = Math.max((historySizeCount.value ?? 0) - 1, 0)
    // 已删除卡片若在选中集合中则同步移除（含数据快照）
    unselectIds([historySizeKey(batchId)])
    selectedDataMap.delete(historySizeKey(batchId))
  } catch (error) {
    console.error(error)
  }
}

/**
 * 历史尺寸编辑成功：搜索态下保留搜索条件重查历史列表
 * （改名后可能不再命中当前搜索词，或其他记录变为命中，本地更新无法反映）
 */
const handleHistoryRename = async () => {
  if (!goodsType.value) return
  resetOptions()
  await fetchHistorySizeList(true)
}

/** 是否首次展示（useDidShow 首次触发与 onMounted 并存，初始化收敛到 useDidShow 单路径，避免重复请求） */
let isFirstShow = true

onMounted(() => {
  getQueryObjects()
})

useDidShow(() => {
  umpOtherReport('EXP', {
    eventCode: 'page_express_goods_hsize_v1',
  })
  // 从新增尺寸页返回：回到我的尺寸 tab 并刷新列表与条数统计
  if (selectSizeRefreshType.value === 'mySize') {
    selectSizeRefreshType.value = undefined
    tabsActived.value = 'select-size'
    skeletonLoading.value = true
    resetOptions()
    onLoad(true)
    getCustomerSkuInfoData()
    return
  }
  // 首次展示：初始化列表与条数统计（仅执行一次），并预取另一 tab 条数保证两个数量都有
  if (isFirstShow) {
    isFirstShow = false
    onLoad(true)
    getCustomerSkuInfoData()
    preloadAnotherTabCount()
  }
})

/**
 * 预取另一 tab 的条数统计：
 * 一进页面两个 tab 数量都要展示，但 onLoad 只请求当前高亮 tab；
 * 条数取自分页接口 rowTotal，这里仅请求首页（pageSize=1）读取 rowTotal，不影响当前 tab 分页状态
 */
const preloadAnotherTabCount = async () => {
  try {
    if (tabsActived.value === 'select-size') {
      const { data } = await getHistorySizeByPage({ sourceId: 20, page: 1, pageSize: 1, searchContent: '' })
      historySizeCount.value = data?.rowTotal ?? 0
    } else {
      const response = await findPageSkuSize({ page: 1, pageSize: 1, goodsType: '' })
      mySizeCount.value = response?.data?.rowTotal ?? 0
    }
  } catch (error) {
    console.error(error)
  }
}

const onLoad = async (isRefresh: boolean, report?: boolean) => {
  if (tabsActived.value === 'select-size') {
    await getSelectSkuSize(isRefresh)
  }
  if (tabsActived.value === 'history-size') {
    await fetchHistorySizeList(isRefresh, report)
  }
  stopPullDownRefresh()
}
</script>

<style lang="scss">
@import '@order-global-package-order-sub/styles/index.scss';
@import './index.scss';
</style>
