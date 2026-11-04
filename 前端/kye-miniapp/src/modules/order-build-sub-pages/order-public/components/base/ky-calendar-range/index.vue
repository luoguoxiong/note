<template>
  <div class="ky-calendar-range">
    <ky-popup
      duration="0"
      v-bind="$attrs"
      round
      position="bottom"
      :style="{ maxHeight: '80%' }"
      @click-overlay="onCloseDate"
    >
      <ky-calendar
        v-bind="$attrs"
        :defaultDate="defaultDate"
        type="range"
        row-height="14.28571vw"
        color="#8365F6"
        allow-same-day
        :lazy-render="false"
        ref="calendarRef"
        :show-subtitle="false"
        :poppable="false"
        @select="onSelect"
        @close="onCloseDate"
        @confirm="confirmCalendar"
      >
        <template v-slot:title>
          <div class="filter-three__header">
            <div class="flex">
              <ky-field v-model="state.startTime" :formatter="fieldFormatter" readonly placeholder="开始日期" />
              <div class="tip">-</div>
              <ky-field v-model="state.endTime" :formatter="fieldFormatter" readonly placeholder="结束日期" />
            </div>
            <div class="filter-three__close" @click="onCloseDate">
              <SvgIcon class="close-icon" name="close-icon-padding"></SvgIcon>
            </div>
          </div>
          <div></div>
        </template>
        <template v-slot:footer-tips>
          <slot name="footer-tips"></slot>
        </template>
        <template v-slot:footer>
          <slot name="footer"></slot>
          <KyButton block type="primary" class="confirm-btn" @click="onConfirmDate" :disabled="submitDisabled"
            >确定</KyButton
          >
        </template>
      </ky-calendar>
    </ky-popup>
  </div>
</template>

<script setup lang="ts">
import dayjs from 'dayjs'
import { computed, reactive, ref, watch } from 'vue'
import KyButton from '@order-public-sub-public/components/base/ky-button/index.vue'
import SvgIcon from '@order-public-sub-public/components/ui/svg-icon/index.vue'

const props = defineProps({
  defaultValue: {
    type: Array,
    default: () => null,
  },
  format: {
    type: String,
    default: 'YYYY/MM/DD',
  },
})
const emit = defineEmits(['onSelect', 'close', 'onConfirmDate'])
const onSelect = (date: any) => {
  const [startDate, endDate] = date
  if (startDate) {
    state.startTime = startDate
    state.endTime = ''
  }
  if (endDate) {
    state.endTime = endDate
  }
}

const onCloseDate = () => {
  console.log('onCloseDate')
  emit('close')
}
const state = reactive({
  startTime: '',
  endTime: '',
})
const defaultDate = ref()
watch(
  () => props.defaultValue,
  (val) => {
    console.log(val)
    if (val.length) {
      defaultDate.value = [val[0], val[1]]
    }
  },
  { immediate: true },
)

const submitDisabled = computed(() => {
  return !state.startTime || !state.endTime
})

const fieldFormatter = (value: string) => {
  if (value) {
    return dayjs(value).format('YYYY/MM/DD')
  } else {
    return ''
  }
}

const onConfirmDate = () => {
  emit('onConfirmDate', [state.startTime, state.endTime])
}

function formatDate(date: Date, format = 'yyyy/mm/dd'): string {
  if (!date) return ''
  date = new Date(date)

  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  const formatMap = {
    yyyy: year,
    mm: month,
    dd: day,
  }

  return format.replace(/yyyy|mm|dd/g, (match) => formatMap[match])
}

const confirmCalendar = (value) => {
  emit('onConfirmDate', [formatDate(value[0]), formatDate(value[1])])
}
</script>

<style lang="scss">
@import '@order-global-package-order-sub/styles/index.scss';
@import './index.scss';
</style>
