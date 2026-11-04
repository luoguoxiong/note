<template>
  <div class="ky-calendar__header">
    <div class="ky-calendar__header-title" :class="{'ky-calendar__header-title-padding':popupable}">
      <div class="ky-calendar__header-title-range" v-if="type === 'range'">
        <div class="ky-calendar__header-title-text-start">
          <span class="ky-calendar__header-title-value" v-if="startDateLabel">{{ startDateLabel }}</span>
          <span class="ky-calendar__header-title-placeholder" v-show="!startDateLabel">{{ startPlaceholder }}</span>
        </div>
        <div class="ky-calendar__header-title-placeholder placeholder-connector">-</div>
        <div class="ky-calendar__header-title-text-end">
          <span class="ky-calendar__header-title-value" v-if="endDateLabel">{{ endDateLabel }}</span>
          <span class="ky-calendar__header-title-placeholder" v-show="!endDateLabel">{{ endPlaceholder }}</span>
        </div>
      </div>
      <span v-else class="ky-calendar__header-title-text">{{ title || computedTitle }}</span>
      <view class="ky-calendar__header-title-close-box"  @click="closePopup" v-if="popupable">
      <img
        class="ky-calendar__header-title-close"
        src="https://ic-img.ky-express.com/netc/20250118_42870395139_!!1737186469837_64_64.png"
      />
      </view>
    </div>
    <KyRadioGroup
      v-if="type === 'range' && !hideOptions"
      v-model="currentTab"
      direction="horizontal"
      class="ky-calendar__header-options"
      @update:modelValue="changeOptionTab"
    >
      <KyRadio
        v-for="option in options"
        :key="`options-${option.key}`"
        :name="option.key"
        type="button"
        checkedHighlight
        class="ky-calendar__header-option"
        >{{ option.label }}</KyRadio
      >
    </KyRadioGroup>
    <div class="ky-calendar__weekdays">
      <span v-for="weekday in weekdays" :key="`weekday-${weekday}`" class="ky-calendar__weekday">{{ weekday }}</span>
    </div>
  </div>
</template>

<script lang="ts" setup name="calendar-header">
import KyRadioGroup from '@ky-miniui-lib/radiogroup'
import KyRadio from '@ky-miniui-lib/radio'
import { ref, computed, inject, watch } from 'vue'
import { formatDate, compareDay } from '../utils'

function getDateRange(days) {
  const endDate = new Date()
  const startDate = new Date(endDate)
  startDate.setDate(endDate.getDate() - days + 1)

  return [startDate.getTime(), endDate.getTime()]
}

const props = withDefaults(
  defineProps<{
    title: string
    firstDayOfWeek: number
    hideOptions: boolean
    options: {
      label: string
      value: Date[]
    }[]
    startPlaceholder: string
    endPlaceholder: string
  }>(),
  {
    title: '',
    firstDayOfWeek: 0,
    hideOptions: false,
    options: [],
    startPlaceholder: '开始日期',
    endPlaceholder: '结束日期',
  },
)

const emit = defineEmits(['selectTime'])
const type = inject('type')
const currentDate = inject('currentDate')
const popupable = inject('popupable')
const closePopup = inject('closePopup')

const startDateLabel = ref<string>('')
const endDateLabel = ref<string>('')

/** 选项 */
const BASE_OPTIONS = [
  { label: '近7天', value: getDateRange(7), key: 'last7' },
  { label: '近30天', value: getDateRange(30), key: 'last30' },
  { label: '近60天', value: getDateRange(60), key: 'last60' },
]
const currentTab = ref('')
const options = computed(() => {
  return props.options.length ? props.options : BASE_OPTIONS
})

/* 默认option tab选项选中 */
const handleTabMatch = () => {
  if (Array.isArray(currentDate.value) && currentDate.value.length === 2) {
    const [startDate, endDate] = currentDate?.value
    // 判断当前时间是否是区间时间
    const currentOption =
      options.value?.filter((v) => {
        const [v1, v2] = v?.value
        const isSame1 = compareDay(v1, startDate)
        const isSame2 = compareDay(v2, endDate)
        return isSame1 === 0 && isSame2 === 0
      })?.[0] || null
    console.log('currentOption>>>', currentOption)
    currentTab.value = currentOption?.key ?? ''
  }
}

/** 标题 */
const computedTitle = computed(() => {
  let title = ''
  if (Array.isArray(currentDate.value) && currentDate.value.length === 2) {
    const [startDate, endDate] = currentDate.value
    title = [formatDate(startDate, 'yyyy/mm/dd'), formatDate(endDate, 'yyyy/mm/dd')].join(' - ')
    handleTabMatch()
  } else if (Array.isArray(currentDate.value) && currentDate.value.length === 1) {
    title = formatDate(currentDate.value[0], 'yyyy/mm/dd')
  } else if (Array.isArray(currentDate.value)) {
    title = currentDate.value.map((v) => formatDate(v, 'yyyy/mm/dd')).join(',')
  } else {
    title = formatDate(currentDate.value, 'yyyy/mm/dd')
  }

  return title
})

watch(
  () => currentDate.value,
  (val) => {
    console.log('currentDate.value', currentDate.value)
    if (Array.isArray(val) && val.length === 2) {
      const [startDate, endDate] = val
      startDateLabel.value = formatDate(startDate, 'yyyy/mm/dd')
      endDateLabel.value = formatDate(endDate, 'yyyy/mm/dd')
    } else if (Array.isArray(val) && val.length === 1) {
      startDateLabel.value = formatDate(val[0], 'yyyy/mm/dd')
      endDateLabel.value = ''
    } else if (val) {
      startDateLabel.value = formatDate(val[0], 'yyyy/mm/dd')
      endDateLabel.value = ''
    } else {
      startDateLabel.value = formatDate(val[0], 'yyyy/mm/dd')
      endDateLabel.value = ''
    }
    handleTabMatch()
  },
  {
    immediate: true
  }
)


const changeOptionTab = (key) => {
  currentTab.value = key
  const currentOption = options.value.filter((v) => v.key === key)?.[0] || null
  if (currentOption) {
    emit('selectTime', currentOption.value)
  }
}

/** 星期 */
const BASE_WEEK_DAYS = ['日', '一', '二', '三', '四', '五', '六']
const weekdays = computed(() => {
  return [...BASE_WEEK_DAYS.slice(props.firstDayOfWeek, 7), ...BASE_WEEK_DAYS.slice(0, props.firstDayOfWeek)]
})
</script>

<style lang="scss">
.ky-calendar__header {
  box-shadow: 0px 2px 8px 0px rgba(0, 0, 0, 0.05);

  .ky-calendar__header-title {
    padding: 26px 32px;
    border-bottom: 1px solid #e6e8ed;
    font-size: 32px;
    font-weight: 600;
    line-height: 46px;
    color: #24262b;
    display: flex;
    align-items: center;
    justify-content: space-between;

    .ky-calendar__header-title-text {
      flex: 1;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .ky-calendar__header-title-range {
      overflow: hidden;
      text-overflow: ellipsis;
      display: flex;
    }
    &-placeholder {
      color: #adb0b8;
      font-weight: normal;
    }
    .placeholder-connector {
      padding: 0 8px;
    }

.ky-calendar__header-title-close-box{
  width: 64px;
    height: 64px;
    display: flex;
    align-items: center;
    justify-content: center;
}
    .ky-calendar__header-title-close {
      // margin-left: 32px;
      width: 32px;
      height: 32px;
    }
  }

  .ky-calendar__header-title-padding {
padding: 17px 16px 17px 32px;
  }

  .ky-calendar__header-options {
    padding: 16px 32px;
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 16px;
    box-sizing: border-box;

    .ky-calendar__header-option.ky-radio {
      box-sizing: border-box;
      margin-right: 0;
      margin-bottom: 0;
      flex-shrink: 0;
      width: calc((100% - 32px) / 3);
      justify-content: center;
      height: 64px;
      border-radius: 16px;

      .ky-radio-text {
        flex: unset;
      }
    }
  }

  .ky-calendar__weekdays {
    padding: 0 32px;
    display: flex;
    align-items: center;

    .ky-calendar__weekday {
      padding: 12px 12px;
      flex: 1;
      font-size: 28px;
      line-height: 40px;
      text-align: center;
      color: #686b75;
    }
  }
}
</style>
