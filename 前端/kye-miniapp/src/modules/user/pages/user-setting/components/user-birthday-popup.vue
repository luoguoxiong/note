<!-- 生日-年月日选项 -->
<template>
  <ky-timepicker
    title="请选择生日"
    :class="`${classPrefix}`"
    v-model:show="showTimePicker"
    v-model="val"
    :poppable="true"
    :min-date="minDateValue"
    :max-date="maxDateValue"
    :formatter="formatter"
    :three-dimensional="false"
    :safeAreaInsetBottom="true"
    @confirm="handleConfirm"
    :show-close="true"
  >
    <template #columns-top>
      <view class="birthday-popup__top-tip">为了不影响您的生日福利发放，请准确选择您的生日信息，设置后不可更改</view>
    </template>
  </ky-timepicker>
</template>
<script setup lang="ts">
import { onMounted, ref } from 'vue'
import './user-birthday-popup.scss'

const classPrefix = 'user-birthday-popup'
const emit = defineEmits(['onCancel', 'onConfirm'])

const minDateValue = ref(new Date())
const maxDateValue = ref(new Date())
const val = ref(new Date())

const showTimePicker = ref<boolean>(false)

/**
 * 初始化时间区域 + 默认值
 * @returns {{minDate: Date, maxDate: Date, initialDate: Date}}
 */
const getBirthdayRange = (): { minDate: Date; maxDate: Date; initialDate: Date } => {
  const today = new Date()
  const currentYear = today.getFullYear()
  // 最大日期：今年最后一天
  const maxDate = today

  // 最小日期：100年前的1月1日
  const minDate = new Date(currentYear - 100, 0, 1)
  // const initialDate = new Date(currentYear - 45, 0, 1)
  const initialDate = today

  // // 格式化为 YYYY-MM-DD
  // const formatDate = (date: Date) => {
  //   const yyyy = date.getFullYear()
  //   const mm = String(date.getMonth() + 1).padStart(2, '0') // 月份从0开始
  //   const dd = String(date.getDate()).padStart(2, '0')
  //   return `${yyyy}-${mm}-${dd}`
  // }

  return { minDate, maxDate, initialDate }
}

const formatter = (type, option) => {
  switch (type) {
    case 'year':
      option.text += '年'
      break
    case 'month':
      option.text += '月'
      break
    case 'day':
      option.text += '日'
      break
    case 'hour':
      option.text += '时'
      break
    case 'minute':
      option.text += '分'
      break
    default:
      option.text += ''
  }
  return option
}

/* 关闭popup */
const handleClose = () => {
  emit('onCancel')
}

const handleConfirm = (val, currentDate) => {
  console.log('handleConfirm', val)
  emit('onConfirm', val, currentDate)
}

const showPicker = () => {
  showTimePicker.value = true
}

const hidePicker = () => {
  showTimePicker.value = false
}

onMounted(() => {
  const { minDate, maxDate, initialDate } = getBirthdayRange()
  minDateValue.value = minDate
  maxDateValue.value = maxDate
  val.value = initialDate
})

defineExpose({
  showPicker,
  hidePicker,
})
</script>
