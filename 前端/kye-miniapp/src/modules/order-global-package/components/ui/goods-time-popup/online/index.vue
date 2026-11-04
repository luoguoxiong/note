<template>
  <!-- 线上时间选择布局 -->
  <BaseLayout :theme-name="themeName" :isEmpty="columns.length === 0">
    <!-- 全天模式切换（仅急件且有批次时间时显示） -->
    <div class="gt-tool" v-if="showFullDayToggle">
      <div class="gt-tool--label">显示全天时间</div>
      <ky-switch active-color="#8365F6" :model-value="isFullDayMode" @change="handleModeChange" />
    </div>

    <!-- 时间选择器 -->
    <ky-picker
      :poppable="false"
      :swipe-duration="300"
      v-model="defaultValue"
      :show-toolbar="false"
      @change="handlePickerChange"
      :columns="columns"
    />

    <!-- 底部操作栏 -->
    <template #footer>
      <GoodsTimeFooter
        :config="{
          ...goodsTimeConfig,
          goodsTimeFlag: goodsTimeConfig.goodsTimeFlag && isFullDayMode,
        }"
        :self-sign-flag="selfSignFlag"
        :is-return-send="false"
        :is-show-notify-later-btn="goodsTimeConfig.goodsTimeNotifyLater"
        @confirm="confirm"
        @toNotifyLater="notifyLater"
        @confirm-now="confirmNow"
      />
    </template>
  </BaseLayout>
</template>

<script setup lang="ts">
import BaseLayout from '../base/index.vue'
import { ref, computed, onMounted, nextTick } from 'vue'
import { PickTime, CrmGoodsTimeConfig, GoodsTimeFlag, UrgentGoods } from '../goods-time'
import { initDefaultColumns } from '../hooks/useCustomerColumns'
import { initOnlineBatchColumns } from '../hooks/useOnlineBatchColumns'
import { checkDefaultValue } from '../utils'
import dayjs from 'dayjs'
import GoodsTimeFooter from '../footer/index.vue'
import './index.scss'
import { emit } from 'process'

/**
 * @description 组件属性接口
 */
interface PopupProps {
  goodsTimeConfig: CrmGoodsTimeConfig // CRM货好时间配置
  themeName?: string // 主题名称
  goodsTime?: string // 当前选中的货好时间
  urgentGoods?: UrgentGoods // 是否急件
  selfSignFlag?: boolean // 是否支持自定义时间
}

/**
 * @description 组件属性定义
 */
const props = defineProps<PopupProps>()

/**
 * @description 组件事件定义
 */
const emits = defineEmits(['close', 'selectTime', 'confirmNow', 'confirm'])

/**
 * @description 是否为全天模式（急件专用，可选择任意时间点）
 */
const isFullDayMode = ref(false)

/**
 * @description 时间选择器列数据
 */
const columns = ref<PickTime[]>([])

/**
 * @description 当前选中的值
 */
const defaultValue = ref<string[]>([])

/**
 * @description 当前选中的选项对象
 */
const selectedItems = ref<PickTime[]>([])

/**
 * @description 时间范围配置（从props计算获取）
 */
const timeRange = computed(() => props.goodsTimeConfig?.timeRange)

/**
 * @description 全天模式列数据（精确到分钟）
 */
const onlineDefaultColumns = ref<PickTime[]>([])

/**
 * @description 批次模式列数据（按批次时间选择）
 */
const onlineBatchColumns = ref<PickTime[]>([])

/**
 * @description 是否显示全天模式切换按钮
 */
const showFullDayToggle = computed(() => {
  return onlineBatchColumns.value.length > 0 && props.urgentGoods === UrgentGoods.URGENT
})

/**
 * @description 创建批次时间列数据
 */
const createOnlineBatchColumns = (): PickTime[] => {
  if (!props.goodsTimeConfig?.timeRange?.timeBatch) {
    return []
  }
  return initOnlineBatchColumns(timeRange.value)
}

/**
 * @description 创建全天模式时间列数据
 */
const createOnlineDefaultColumns = (): PickTime[] => {
  const { timeRange: range } = props.goodsTimeConfig || {}
  if (!range) {
    return []
  }
  const { startDate, startTime, endDate, endTime, timePeriodType } = range
  return initDefaultColumns([{ startDate, startTime, endDate, endTime, interval: 15, timePeriodType }])
}

/**
 * @description 切换全天/批次模式
 */
const handleModeChange = (value: boolean) => {
  isFullDayMode.value = value
  columns.value = value ? onlineDefaultColumns.value : onlineBatchColumns.value
  nextTick(() => {
    resetToFirstValue()
  })
}

/**
 * @description 重置为第一个可选值
 */
const resetToFirstValue = () => {
  if (!columns.value.length) {
    return
  }

  const firstDate = columns.value[0]
  if (isFullDayMode.value) {
    // 全天模式：日期 + 小时 + 分钟
    const firstHour = firstDate.children?.[0]
    const firstMinute = firstHour?.children?.[0]
    defaultValue.value = [firstDate.value, firstHour?.value, firstMinute?.value].filter(Boolean) as string[]
  } else {
    // 批次模式：日期 + 时分
    const firstTime = firstDate.children?.[0]
    defaultValue.value = [firstDate.value, firstTime?.value].filter(Boolean) as string[]
  }
  syncSelectedItems()
}

/**
 * @description 根据已有时间构建默认选中值
 */
const buildDefaultValue = () => {
  if (!props.goodsTime || !columns.value.length) {
    return
  }
  const timeStr = dayjs(props.goodsTime).format('YYYY/MM/DD HH:mm')
  defaultValue.value = checkDefaultValue(columns.value, timeStr, isFullDayMode.value)
}

/**
 * @description 同步选中选项对象
 */
const syncSelectedItems = () => {
  const values = defaultValue.value
  if (!values.length || !columns.value.length) {
    selectedItems.value = []
    return
  }

  const result: PickTime[] = []
  let currentColumn = columns.value

  for (const value of values) {
    const found = currentColumn.find((item) => item.value === value)
    if (found) {
      result.push(found)
      currentColumn = found.children || []
    } else {
      break
    }
  }

  selectedItems.value = result
}

/**
 * @description 关闭弹窗
 */
const close = () => {
  emits('close')
}

/**
 * @description 选择器值变更回调
 */
const handlePickerChange = (val: { selectedOptions: PickTime[]; selectedValue: string[] }) => {
  selectedItems.value = val.selectedOptions
  defaultValue.value = val.selectedValue
}

/**
 * @description 点击"现在货好"按钮
 */
const confirmNow = () => {
  emitSelectTime({
    goodsTime: '',
    goodsTimeFlag: GoodsTimeFlag.NOW,
    urgentGoods: isFullDayMode.value ? UrgentGoods.URGENT : undefined,
    selfSignFlag: true,
  })
  emits('confirmNow')
}

/**
 * @description 点击"稍后通知"按钮
 */
const notifyLater = () => {
  emitSelectTime({
    goodsTime: '',
    goodsTimeFlag: GoodsTimeFlag.LATER_NOTIFIED,
    urgentGoods: isFullDayMode.value ? UrgentGoods.URGENT : undefined,
    selfSignFlag: false,
  })
}

/**
 * @description 格式化选中的时间
 */
const formatSelectedTime = (items: PickTime[]): string => {
  return items.reduce((pre, cur, index) => {
    if (index === 0) {
      return cur.value
    } else if (index === 1) {
      return `${pre} ${cur.value}`
    } else if (index === 2) {
      return `${pre}:${cur.value}`
    }
    return pre
  }, '')
}

/**
 * @description 获取默认选择列表（优先已选，否则取第一个）
 */
const getDefaultSelectList = (): PickTime[] => {
  if (selectedItems.value.length > 0) {
    return selectedItems.value
  }

  if (columns.value.length === 0) {
    return []
  }

  const firstColumn = columns.value[0]
  const firstHour = firstColumn.children?.[0] as PickTime
  const firstMinute = firstHour?.children?.[0] as PickTime
  return [firstColumn, firstHour, firstMinute].filter((item) => !!item)
}

/**
 * @description 发射时间选择事件
 */
const emitSelectTime = (data: {
  goodsTime: string
  goodsTimeFlag: GoodsTimeFlag
  urgentGoods?: UrgentGoods
  selfSignFlag: boolean
}) => {
  emits('selectTime', {
    type: 'GoodsTime',
    data,
  })
  close()
}

/**
 * @description 点击确定按钮
 */
const confirm = () => {
  const selectList = getDefaultSelectList()
  const selectTime = formatSelectedTime(selectList)

  if (!selectTime) {
    return
  }

  const formattedTime = dayjs(selectTime).format('YYYY-MM-DD HH:mm')
  const isUrgent = isFullDayMode.value && showFullDayToggle.value

  emitSelectTime({
    goodsTime: formattedTime,
    goodsTimeFlag: GoodsTimeFlag.NONE,
    urgentGoods: isUrgent ? UrgentGoods.URGENT : undefined,
    selfSignFlag: showFullDayToggle.value && isFullDayMode.value,
  })
  emits('confirm')
}

/**
 * @description 初始化组件
 */
const initComponent = () => {
  onlineBatchColumns.value = createOnlineBatchColumns()
  onlineDefaultColumns.value = createOnlineDefaultColumns()

  // 判断是否应该启用全天模式
  const shouldEnableFullDay = onlineBatchColumns.value.length > 0 && props.selfSignFlag

  isFullDayMode.value = shouldEnableFullDay
  columns.value = shouldEnableFullDay ? onlineDefaultColumns.value : onlineBatchColumns.value

  buildDefaultValue()
  syncSelectedItems()
}

/**
 * @description 组件挂载时初始化
 */
onMounted(() => {
  initComponent()
})
</script>
