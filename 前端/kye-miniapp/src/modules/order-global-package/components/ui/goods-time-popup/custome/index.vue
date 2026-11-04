<template>
  <!-- 自定义时间选择布局 -->
  <BaseLayout :theme-name="themeName" :isEmpty="columns.length === 0">
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
        :config="goodsTimeConfig"
        :is-show-notify-later-btn="goodsTimeConfig?.goodsTimeNotifyLater"
        @confirm="confirm"
        @toNotifyLater="notifyLater"
        @confirm-now="confirmNow"
      />
    </template>
  </BaseLayout>
</template>

<script setup lang="ts">
import dayjs from 'dayjs'
import { ref, computed, watch, onMounted } from 'vue'
import BaseLayout from '../base/index.vue'
import { initDefaultColumns } from '../hooks/index'
import { GoodsTimeConfig, GoodsTimeFlag, UrgentGoods, PickTime } from '../goods-time'
import { checkDefaultValue } from '../utils'
import GoodsTimeFooter from '../footer/index.vue'

/**
 * @description 组件属性接口
 */
interface PopupProps {
  goodsTimeConfig: GoodsTimeConfig | null // ERP货好时间配置
  themeName?: string // 主题名称
  goodsTime?: string // 当前选中的货好时间
  urgentGoods?: UrgentGoods // 是否急件
}

/**
 * @description 组件属性定义
 */
const props = defineProps<PopupProps>()

/**
 * @description 组件事件定义
 */
const emits = defineEmits(['close', 'hideTips', 'selectTime', 'confirm', 'confirmNow'])

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
 * @description 根据已有时间初始化默认选中值
 */
const initDefaultValue = () => {
  if (!props.goodsTime || !columns.value.length) {
    return
  }

  // 格式化时间字符串
  const timeStr = dayjs(props.goodsTime).format('YYYY/MM/DD HH:mm')

  // 计算默认选中值
  const defaultVal = checkDefaultValue(columns.value, timeStr, true)
  defaultValue.value = defaultVal

  // 初始化 selectedItems，与 defaultValue 对应
  selectedItems.value = []

  if (defaultVal.length && columns.value.length) {
    let currentChildren = columns.value
    for (const val of defaultVal) {
      const selected = currentChildren.find((item) => item.value === val)
      if (selected) {
        selectedItems.value.push(selected)
        currentChildren = selected.children || []
      }
    }
  }
}

/**
 * @description 关闭弹窗
 */
const close = () => {
  emits('close')
}

/**
 * @description 发射时间选择事件
 */
const emitSelectTime = (data: { goodsTime: string; goodsTimeFlag: GoodsTimeFlag; urgentGoods?: UrgentGoods }) => {
  emits('selectTime', {
    type: 'GoodsTime',
    data,
  })
  close()
}

/**
 * @description 点击"现在货好"按钮
 */
const confirmNow = () => {
  emitSelectTime({
    goodsTime: '',
    goodsTimeFlag: GoodsTimeFlag.NOW,
  })
}

/**
 * @description 点击"稍后通知"按钮
 */
const notifyLater = () => {
  emitSelectTime({
    goodsTime: '',
    goodsTimeFlag: GoodsTimeFlag.LATER_NOTIFIED,
  })
}

/**
 * @description 选择器值变更回调
 */
const handlePickerChange = (val: { selectedOptions: PickTime[]; selectedValue: string[] }) => {
  selectedItems.value = val.selectedOptions
  defaultValue.value = val.selectedValue
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
  const firstHour = firstColumn.children?.[0]
  const firstMinute = firstHour?.children?.[0]
  return firstMinute ? [firstColumn, firstHour, firstMinute] : []
}

/**
 * @description 点击确定按钮
 */
const confirm = () => {
  const selectList = getDefaultSelectList()

  // 必须选择完整的日期+小时+分钟
  if (selectList.length < 3) {
    return
  }

  const selectTime = formatSelectedTime(selectList)

  if (!selectTime) {
    return
  }

  const formattedTime = dayjs(selectTime).format('YYYY-MM-DD HH:mm')

  emitSelectTime({
    goodsTime: formattedTime,
    goodsTimeFlag: GoodsTimeFlag.NONE,
  })
}

/**
 * @description 组件挂载时初始化默认值
 */
onMounted(() => {
  const timeRangeList = props.goodsTimeConfig?.timeRangeList || []
  columns.value = initDefaultColumns(timeRangeList) || []
  initDefaultValue()
})
</script>
