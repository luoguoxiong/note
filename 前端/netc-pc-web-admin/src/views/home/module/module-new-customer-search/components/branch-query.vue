<template>
  <div class="branch-query">
    <div class="form-row">
      <div class="form-label">详细地址</div>
      <div class="form-fields">
        <div class="address-fields">
          <div class="area-select">
            <KAreaAddress
              ref="areaRef"
              v-model="regionValue"
              placeholder="请选择省市区"
              :title="regionText"
              gap-detect
              :get-province-list="getProvinceList"
              :get-children-list="getChildrenList"
              :get-hot-city-list="getHotCityList"
              :search-method="searchMethod"
              @change="handleAreaChange"
              @insufficient-space="onInsufficientSpace"
            />
          </div>
          <div ref="detailWrapRef" class="detail-wrap">
            <KInput
              ref="detailInputRef"
              v-model="detailAddress"
              class="detail-input"
              placeholder="请输入详细地址"
              @input="handleAddressInput"
              @focus="handleAddressFocus"
              @blur="handleAddressBlur"
              @click="ensurePanelVisible"
              @keydown="handleAddressKeydown"
            />
            <transition name="suggest-fade">
              <div v-if="suggestVisible && suggestList.length > 0" ref="suggestDropdownRef" class="suggest-dropdown">
                <div
                  v-for="(item, index) in suggestList"
                  :key="index"
                  class="suggest-item"
                  :class="{ 'is-active': suggestActive === index }"
                  @mousedown.prevent="selectSuggestion(item)"
                  @mouseenter="suggestActive = index"
                >
                  <div class="suggest-name">
                    <span
                      v-for="(seg, i) in splitByKeyword(item.title, currentKeyword)"
                      :key="i"
                      :class="{ 'keyword-hit': seg.hit }"
                      >{{ seg.text }}</span
                    >
                  </div>
                  <div class="suggest-address">
                    <span
                      v-for="(seg, i) in splitByKeyword(formatRegionPath(item), currentKeyword)"
                      :key="i"
                      :class="{ 'keyword-hit': seg.hit }"
                      >{{ seg.text }}</span
                    >
                  </div>
                </div>
              </div>
            </transition>
          </div>
        </div>
        <KButton class="query-btn" @click="handleQuery">查询</KButton>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  KAreaAddress,
  KButton,
  KInput,
  KMessage,
  KMessageBox,
  type KAreaHotCity,
  type KAreaItem,
  type KAreaSearchResult,
} from '@netc-design-pc/ui'
import { ref, computed, nextTick, onMounted, onUnmounted, watch } from 'vue'
import { debounce } from 'lodash-es'
import { getHotCityNameList, getMultiLevelSubList, mapAddressSearch, mapSearchSuggest } from '@/apis/home'
import type { MapAddressSearchItem, MultiLevelSubItem } from '@/apis/home/types'

const emit = defineEmits<{
  (e: 'query', payload: Record<string, string>): void
}>()

/** 省市区名称数组 [省, 市, 区]，与 KAreaAddress 的 v-model 契约对齐 */
const regionValue = ref<string[]>(['', '', ''])
const detailAddress = ref('')

// 组件实例：KAreaAddress/KInput 仅暴露内部 elInputRef，失焦需经其 blur 方法
const areaRef = ref<InstanceType<typeof KAreaAddress> | null>(null)
const detailInputRef = ref<InstanceType<typeof KInput> | null>(null)

// 省市区选择完成（change）：内容回填至地址框后选择框失焦；
// 清空流程组件内部会在 change 后重新 focus，不受影响
const handleAreaChange = () => {
  areaRef.value?.popoverRef?.elInputRef?.blur()
}

/**
 * 面板打开时下方空间不足：组件已禁用 flip / preventOverflow（面板保持显示
 * 在触发元素下方）并通知缺口 gap px，由使用方滚动页面补足。
 * 组件保证仅在面板刚打开时通知一次；关闭面板后重新打开才会再次通知。
 */
function onInsufficientSpace(gap: number) {
  console.log('下方空间不足，缺口', gap, 'px，页面滚动补足')
  const scrollContainer = document.getElementById('page-content')
  if (scrollContainer) scrollContainer.scrollBy({ top: gap, behavior: 'smooth' })
}

const regionText = computed(() => regionValue.value.filter(Boolean).join('/'))

// ===== 数据源注入（web.order.address.getMultiLevelSubList，逐级联动）=====
const toAreaItems = (list: MultiLevelSubItem[]): KAreaItem[] =>
  (list || []).map(({ districtID, districtName, initials }) => ({ districtID, districtName, initials }))

// 省列表缓存（缓存 Promise 避免面板打开与热门城市匹配并发时重复请求；失败后允许重试）
let provinceRequest: Promise<KAreaItem[]> | null = null
const loadProvinceList = (): Promise<KAreaItem[]> => {
  if (!provinceRequest) {
    provinceRequest = getMultiLevelSubList({ districtLevel: 'province' })
      .then(({ data }) => toAreaItems(data?.districtList || []))
      .catch((error) => {
        provinceRequest = null
        throw error
      })
  }
  return provinceRequest
}

const getProvinceList = (): Promise<KAreaItem[]> => loadProvinceList()

// 组件每次切换省份都会重新拉取市/区列表，这里按父级 ID 做请求缓存
const childrenCache = new Map<string, KAreaItem[]>()
const getChildrenList = async (_levelType: 'city' | 'zone', parentId: string): Promise<KAreaItem[]> => {
  const cached = childrenCache.get(parentId)
  if (cached) return cached
  const { data } = await getMultiLevelSubList({ commonDistrID: parentId })
  const items = toAreaItems(data?.districtList || [])
  childrenCache.set(parentId, items)
  return items
}

// ===== 热门城市（web.order.address.hotCityNameList，直接返回省/市 ID 对应关系）=====
const getHotCityList = async (): Promise<KAreaHotCity[]> => {
  const { data } = await getHotCityNameList()
  return (data || []).map(({ id, title, provinceId }) => ({ id, title, provinceId }))
}

// ===== 省市区面板内搜索联想（web.order.address.mapAddressSearch，districtName 即"省/市/区"完整路径）=====
const searchMethod = async (keyword: string): Promise<KAreaSearchResult[]> => {
  const { data } = await mapAddressSearch({ keyword })
  return (data?.districtVOList || [])
    .filter((item): item is MapAddressSearchItem & { districtName: string } => !!item.districtName)
    .map(({ districtName }) => ({ districtName }))
}

// ===== 详细地址联想（POI 接口：web.client.address.mapSearchSuggestFindsuggest）=====
/** POI 联想项（名称 + 完整地址 + 所属省市区，省市区可能缺失） */
interface PoiSuggestionItem {
  title: string
  address: string
  province?: string
  city?: string
  county?: string
}

/** POI 联想接口请求（region 传空串：联想结果需覆盖任意城市的地址，避免被已选省市区限制导致联想结果不对） */
const fetchPoiSuggestions = async (keyword: string): Promise<PoiSuggestionItem[]> => {
  if (!keyword.trim()) return []
  const res = await mapSearchSuggest({
    keyword: keyword.trim(),
    region: '',
    page_index: 1,
    page_size: 20,
  })
  return (res?.data?.data || [])
    .filter((item) => item.title)
    .map(({ title, address, province, city, county, district }) => ({
      title,
      address: address || '',
      province,
      city,
      county: county || district,
    }))
}

/** 下拉副标题：省/市/区 完整路径；接口未返回省市区时回退显示 address */
const formatRegionPath = (item: PoiSuggestionItem): string => {
  const path = [item.province, item.city, item.county].filter(Boolean).join('/')
  return path || item.address
}

// ===== 地址归属校验：输入地址丢失光标后或点击联想结果时，校验地址归属与已选三级地址是否一致，
// 不一致则弹确认弹窗（message-box-dialog）提示是否切换到 xx省/xx市/xx区 =====

/** 弹窗打开标记：避免失焦校验与联想点击校验叠加弹窗 */
let regionDialogOpen = false
/** 失焦校验令牌：重新聚焦或选中联想结果后，使未完成的失焦校验失效 */
let blurValidateToken = 0

type RegionLevel = 'province' | 'city' | 'district'

interface RegionMismatch {
  level: RegionLevel
  /** 不一致级别的地址归属名称，如「天河区」 */
  name: string
  /** 地址归属信息（含完整省市区，用于弹窗文案） */
  poi: PoiSuggestionItem
}

/** 转义 HTML 特殊字符，防止区域名称注入弹窗 HTML */
const escapeHtml = (str: string): string =>
  str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;')

/** 地址归属完整路径：省与市/区连写，如「广东省广州市天河区」（设计稿无空格） */
const formatPoiRegionText = (poi: PoiSuggestionItem): string => {
  return `${poi.province || ''}${poi.city || ''}${poi.county || ''}`
}

/** 省市区逐级比对（省→市→区优先级），返回首个不一致项；仅比对两侧都有值的级别 */
const findRegionMismatch = (poi: PoiSuggestionItem): RegionMismatch | null => {
  const pairs: Array<[RegionLevel, string, string]> = [
    ['province', regionValue.value[0], poi.province || ''],
    ['city', regionValue.value[1], poi.city || ''],
    ['district', regionValue.value[2], poi.county || ''],
  ]
  for (const [level, selected, poiName] of pairs) {
    if (selected && poiName && selected !== poiName) return { level, name: poiName, poi }
  }
  return null
}

/** 不一致确认弹窗：地址归属高亮展示，提示是否切换到xx省/市/区；返回是否确认切换 */
const confirmRegionSwitch = (mismatch: RegionMismatch): Promise<boolean> => {
  const suffix = { province: '省', city: '市', district: '区' }[mismatch.level]
  const target = mismatch.name.endsWith(suffix) ? mismatch.name : `${mismatch.name}${suffix}`
  const regionHtml = escapeHtml(formatPoiRegionText(mismatch.poi))
  return KMessageBox.confirm(
    `您选择的地址可能属于<span style="color: #7143f0">${regionHtml}</span>，是否需要切换到${target}？`,
    '温馨提示',
    {
      type: 'warning',
      showClose: true,
      closeOnClickModal: false,
      // 打开时不默认聚焦「切换」按钮（聚焦弹窗容器），避免回车误触确认
      autofocus: false,
      dangerouslyUseHTMLString: true,
      cancelButtonText: '不切换',
      confirmButtonText: '切换',
      // 自定义 class 与内置 k-message-box 合并，用于覆盖设计稿容器样式（见底部全局样式块）
      customClass: 'region-confirm-box',
    }
  )
    .then(() => true)
    .catch(() => false)
}

/** 将省市区切换为地址归属地（联想结果缺失的级别置空，与选中联想回填行为一致） */
const applyRegionSwitch = (item: PoiSuggestionItem) => {
  regionValue.value = [item.province || '', item.city || '', item.county || '']
}

/** 失焦校验：输入地址的归属地与已选三级地址不一致时，弹窗确认是否切换 */
const validateAddressRegionOnBlur = async () => {
  blurValidateToken += 1
  const token = blurValidateToken
  if (regionDialogOpen) return
  const keyword = detailAddress.value.trim()
  // 未选省市区时无从比对；未输入地址时无需校验
  if (!keyword || !regionValue.value.some(Boolean)) return
  // 复用当前关键词的联想结果，避免重复请求
  const list = currentKeyword.value === keyword ? suggestList.value : await fetchPoiSuggestions(keyword)
  // 等待期间重新聚焦/再次失焦则跳过，避免弹窗打断后续输入
  if (token !== blurValidateToken || regionDialogOpen) return
  const poi = list.find((item) => item.province || item.city || item.county)
  if (!poi) return
  const mismatch = findRegionMismatch(poi)
  if (!mismatch) return
  regionDialogOpen = true
  try {
    if (await confirmRegionSwitch(mismatch)) applyRegionSwitch(poi)
  } finally {
    regionDialogOpen = false
  }
}

// ===== 详细地址联想（POI 名称 + 省市区下拉，300ms 防抖）=====
const detailWrapRef = ref<HTMLElement | null>(null)
const suggestList = ref<PoiSuggestionItem[]>([])
const suggestVisible = ref(false)
const suggestActive = ref(-1)

/** 当前联想关键词（与 suggestList 同源，用于下拉名称命中高亮） */
const currentKeyword = ref('')

const queryPoiSuggestions = async (keyword: string) => {
  currentKeyword.value = keyword.trim()
  suggestList.value = await fetchPoiSuggestions(keyword)
}
const debouncedQueryPoi = debounce(queryPoiSuggestions, 300)

// ===== 面板滚动：下方可视空间不足时页面自动向上滚动（与违禁品查询 contraband-query 对齐）=====
// 注意：页面滚动容器是 #app（overflow: auto），而非 window
const PANEL_VIEWPORT_MARGIN = 24 // 滚动后面板底边与可视区底部保留 24px 间距

const suggestDropdownRef = ref<HTMLElement | null>(null)

// 向上查找最近的可滚动祖先（overflow-y 为 auto/scroll 且内容超高）
const getScrollParent = (el: HTMLElement): HTMLElement | null => {
  let node: HTMLElement | null = el.parentElement
  while (node) {
    const overflowY = getComputedStyle(node).overflowY
    if ((overflowY === 'auto' || overflowY === 'scroll') && node.scrollHeight > node.clientHeight) {
      return node
    }
    node = node.parentElement
  }
  return null
}

// 面板展开、以及已展开时内容更新（面板变高）后，都重新校验可视空间
const ensurePanelVisible = async () => {
  await nextTick()
  const panel = suggestDropdownRef.value as HTMLElement | null
  if (!panel) return
  const scroller = getScrollParent(panel)
  const viewportBottom = scroller ? scroller.getBoundingClientRect().bottom : window.innerHeight
  const overflow = panel.getBoundingClientRect().bottom + PANEL_VIEWPORT_MARGIN - viewportBottom
  if (overflow > 0) {
    if (scroller) {
      scroller.scrollBy({ top: overflow, behavior: 'smooth' })
    } else {
      window.scrollBy({ top: overflow, behavior: 'smooth' })
    }
  }
}

// 下拉实际渲染条件（与模板 v-if 一致），渲染及联想内容变化时重新校验
const suggestShown = computed(() => suggestVisible.value && suggestList.value.length > 0)

watch(suggestShown, (val) => {
  if (val) ensurePanelVisible()
})

watch(suggestList, () => {
  if (suggestShown.value) ensurePanelVisible()
})

/** 将文本按关键词切分为片段（hit 标记命中），用于下拉名称关键词高亮；忽略大小写 */
const splitByKeyword = (text: string, keyword: string): { text: string; hit: boolean }[] => {
  const kw = keyword.trim()
  if (!kw) return [{ text, hit: false }]
  const lowerText = text.toLowerCase()
  const lowerKw = kw.toLowerCase()
  const segments: { text: string; hit: boolean }[] = []
  let start = 0
  while (start <= text.length - kw.length) {
    const idx = lowerText.indexOf(lowerKw, start)
    if (idx === -1) break
    if (idx > start) segments.push({ text: text.slice(start, idx), hit: false })
    segments.push({ text: text.slice(idx, idx + kw.length), hit: true })
    start = idx + kw.length
  }
  if (start < text.length) segments.push({ text: text.slice(start), hit: false })
  return segments
}

const handleAddressInput = () => {
  suggestVisible.value = true
  suggestActive.value = -1
  debouncedQueryPoi(detailAddress.value)
}

const handleAddressFocus = () => {
  // 使未完成的失焦校验失效，避免重新聚焦后弹窗打断输入
  blurValidateToken += 1
  if (suggestList.value.length > 0) {
    suggestVisible.value = true
  }
}

const handleAddressBlur = () => {
  setTimeout(() => {
    suggestVisible.value = false
  }, 200)
  validateAddressRegionOnBlur()
}

const selectSuggestion = async (item: PoiSuggestionItem) => {
  suggestVisible.value = false
  // 选中联想结果后由这里接管校验，使待执行的失焦校验失效
  blurValidateToken += 1
  // 地址归属与已选三级地址不一致时，弹窗确认是否切换；取消则不应用该联想结果
  const mismatch = findRegionMismatch(item)
  if (mismatch) {
    regionDialogOpen = true
    try {
      if (!(await confirmRegionSwitch(mismatch))) return
    } finally {
      regionDialogOpen = false
    }
  }
  // 省市区填入省市区选择框
  applyRegionSwitch(item)
  // 详细地址只留去掉省市区前缀后的具体地址
  let detail = item.address || item.title
  for (const prefix of [item.province, item.city, item.county]) {
    if (prefix && detail.startsWith(prefix)) {
      detail = detail.slice(prefix.length)
    }
  }
  detailAddress.value = detail
  // 条目 mousedown.prevent 保持了输入框焦点，选中回填后需主动失焦
  detailInputRef.value?.elInputRef?.blur()
}

const handleAddressKeydown = (e: KeyboardEvent) => {
  if (!suggestVisible.value || suggestList.value.length === 0) return
  if (e.key === 'ArrowDown') {
    e.preventDefault()
    suggestActive.value = Math.min(suggestActive.value + 1, suggestList.value.length - 1)
  } else if (e.key === 'ArrowUp') {
    e.preventDefault()
    suggestActive.value = Math.max(suggestActive.value - 1, 0)
  } else if (e.key === 'Enter' && suggestActive.value >= 0) {
    e.preventDefault()
    selectSuggestion(suggestList.value[suggestActive.value])
  } else if (e.key === 'Escape') {
    suggestVisible.value = false
  }
}

const handleClickOutside = (e: MouseEvent) => {
  if (detailWrapRef.value && !detailWrapRef.value.contains(e.target as Node)) {
    suggestVisible.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
  debouncedQueryPoi.cancel()
})

// ===== 查询：省市区与详细地址均为空时 toast 提示，任一有值时跳转网点查询页 =====
const handleQuery = () => {
  const hasRegion = regionValue.value.some(Boolean)
  const address = detailAddress.value.trim()
  if (!hasRegion && !address) {
    // zIndex 3000：默认 2000 会被 el-dialog 遮罩（2001+）盖住
    KMessage.error({ message: '请输入省市区', zIndex: 3000 })
    return
  }

  const [province, city, district] = regionValue.value
  const query: Record<string, string> = {}
  if (province) query.province = province
  if (city) query.city = city
  if (district) query.district = district
  if (address) query.address = address

  emit('query', query)
}
</script>

<style lang="scss" scoped>
.form-row {
  display: flex;
  align-items: center;
  // label 与输入区间距 8px（QA1028：与违禁品查询统一，输入区到按钮 16px 在 .form-fields 内）
  gap: 8px;
}

.form-label {
  flex-shrink: 0;
  // 盒宽固定 56px；文字右对齐贴容器右缘，与输入区保持 8px 间距（QA1028）
  width: 56px;
  text-align: right;
  font-size: 13px;
  color: #24262b;
  line-height: 20px;
}

.form-fields {
  flex: 0 1 665px;
  display: flex;
  align-items: center;
  gap: 16px;
  min-width: 0;
}

.address-fields {
  flex: 1;
  display: flex;
  align-items: center;
  min-width: 0;

  :deep(.el-input) {
    --el-input-height: 40px;
  }

  // 两个输入框（省市区/详细地址）默认去掉圆角：radius 声明在 .el-input__wrapper 上，直接覆盖最稳妥；
  // 左右两侧圆角分别在 .area-select（左半）/.detail-input（右半）中恢复
  :deep(.el-input__wrapper) {
    border-radius: 0;
  }
}

.area-select {
  flex-shrink: 0;

  // 悬停/聚焦时拔高层级，让自身右侧边框完整盖住地址输入框负 margin 重叠进来的左边框
  :deep(.el-input__wrapper) {
    position: relative;
    // 左侧输入框：仅左侧两个角 4px 圆角
    border-radius: 4px 0 0 4px;

    &:hover,
    &:focus-within {
      z-index: 1;
    }
  }
}

.detail-wrap {
  position: relative;
  flex: 1;
  min-width: 0;
}

.detail-input {
  width: 100%;
  // 负 margin 让左边框与省市区输入框的右边框重叠，接缝处合并为 1px（默认按 DOM 顺序盖在其上）
  margin-left: -1px;

  // 聚焦时拔高层级，边框完整显示在最上层
  :deep(.el-input__wrapper) {
    position: relative;
    // 右侧输入框：仅右侧两个角 4px 圆角
    border-radius: 0 4px 4px 0;

    &:focus-within {
      z-index: 1;
    }
  }
}

// 详细地址联想下拉：宽度跟随输入框自适应，最小 340px
.suggest-dropdown {
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  z-index: 100;
  // 宽度跟随输入框，输入框过窄时保底 340px（省市区回填后地址可能较长）
  width: 100%;
  min-width: 340px;
  max-height: 320px;
  overflow-y: auto;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.12);
}

.suggest-item {
  padding: 10px 16px;
  cursor: pointer;

  &:hover,
  &.is-active {
    background: #f7f8fa;
  }

  + .suggest-item {
    border-top: 1px solid #f5f6fa;
  }
}

.suggest-name {
  font-size: 14px;
  font-weight: 600;
  color: #24262b;
  line-height: 20px;
}

.suggest-address {
  margin-top: 2px;
  font-size: 12px;
  color: #999;
  line-height: 17px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

// 命中输入关键词的文字统一高亮为品牌紫，与普通文字区分
.keyword-hit {
  color: #7143f0;
}

.suggest-fade-enter-active,
.suggest-fade-leave-active {
  transition: opacity 0.2s ease;
}

.suggest-fade-enter-from,
.suggest-fade-leave-to {
  opacity: 0;
}

.query-btn {
  flex-shrink: 0;
  width: 84px;
  height: 40px;
  padding: 0;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
}
</style>

<style lang="scss">
// 地址归属确认弹窗（KMessageBox 函数式挂载在 body 下，scoped 样式无法命中，需全局覆盖）
// 对齐设计稿（确认弹窗-带标题 4@2x，像素实测）：
//   容器 416x212、白底、圆角 8px、投影 0 4px 16px rgba(0,0,0,.08)
//   分区节奏 header 48 + 24 + 内容 60 + 24 + 按钮 56，标题/按钮区各有 1px #E6E8ED 分隔线
// 选择器带 .el-message-box 前缀提高优先级，压过内置 .k-message-box.message-box-confirm 规则
.el-message-box.k-message-box.region-confirm-box {
  // 容器内边距清零，改由各分区自持 padding（对应设计稿 padding: 0 + gap: 24px）
  --el-messagebox-padding-primary: 0px;

  // 容器背景（新设计稿无外边框，去掉内置 1px #E6E8ED 边框，总高 212 才能对上）
  background: #ffffff;
  border: none;
  --el-messagebox-border-radius: 8px;
  --el-messagebox-box-shadow: 0px 4px 16px 0px rgba(0, 0, 0, 0.08);

  // 标题区：15 + 22 + 10 + 1px 分隔线 = 48（图标 16px、标题 15/22/600 为内置样式）
  .el-message-box__header {
    padding: 15px 24px 10px;
    border-bottom: 1px solid #e6e8ed;
  }

  // 图标与标题间距 16px（内置 8px）
  .el-message-box__title {
    gap: 16px;
  }

  // 关闭按钮 40x40，top 4 使 X 与 48px 标题区垂直居中（内置 top 10 偏低）
  .el-message-box__headerbtn {
    top: 4px;
  }

  // 内容区：上距 24、左右 24、最小高 60（两行文案 40px 顶部对齐，底部留白）
  .el-message-box__content {
    margin-top: 24px;
    padding: 0 24px;
    min-height: 60px;
  }

  // 按钮区：上距 24 + 1px 分隔线 + 11/24/12 内边距（按钮 32 高，右对齐、间距 12 为内置样式）
  .el-message-box__btns {
    margin-top: 24px;
    padding: 11px 24px 12px;
    border-top: 1px solid #e6e8ed;
  }
}
</style>
