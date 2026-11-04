<template>
  <ky-popup :show="show" :closeOnClickOverlay="false" position="bottom">
    <view class="popup-box service-self-pickup">
      <view class="popup-box-title">
        <text>定时派送</text>
        <image
          class="popup-close"
          @tap="handleClose"
          src="https://ic-img.ky-express.com/netc/20250118_42870395139_!!1737186469837_64_64.png"
        ></image>
      </view>
      <view class="netc-time-popup__header" v-if="tips">
        <netc-svg-icon name="icon_tips" />
        <view>
          <view>
            1、我司将为您<text style="color: #ff8038">免费保管{{ cargoStorageInfo.freeDays }}天</text
            >，超期将收取货物保管费
          </view>
          <view>
            2、同笔运单还能修改<text style="color: #ff8038">{{ cargoStorageInfo.leftModifyTimes }}</text
            >次
          </view>
          <view v-if="cargoStorageInfo.waitNotificationTips" class="waitNotificationTipsContent">
            3、<text v-html="cargoStorageInfo.waitNotificationTips"></text>
          </view>
        </view>
      </view>

      <view>
        <view class="delivery-control-content">
          <view class="delivery-control-content-cell" v-if="cargoStorageInfo.waitShipEnableFlag !== 2">
            <view
              class="delivery-control-content-cell-content"
              @click="() => handleSelectType(30, 'waitShipEnableFlag', 'waitShipDisableTips')"
            >
              <view class="delivery-control-content-cell-cirle"></view>
              <view class="delivery-control-content-cell-label">等通知发运</view>
              <view class="delivery-control-content-cell-desc">快件暂停运输，需您通知后运输</view>
              <!-- 禁用 -->
              <view class="delivery-control-content-cell-checkbox" v-if="cargoStorageInfo.waitShipEnableFlag === 0">
                <img
                  class="delivery-control-content-cell-checkbox-img"
                  src="https://ic-img.ky-express.com/netc/20240227_11060601273_!!1709027039340_56_56.png"
                />
              </view>
              <!-- 非禁用 -->
              <view class="delivery-control-content-cell-checkbox" v-else>
                <Image
                  class="delivery-control-content-cell-checkbox-img"
                  :src="
                    selectType === 30 ? require('./assets/icon-select.png') : require('./assets/icon-not-select.png')
                  "
                />
              </view>
            </view>
          </view>
          <view class="delivery-control-content-cell" v-if="cargoStorageInfo.waitDeliveryEnableFlag !== 2">
            <view
              class="delivery-control-content-cell-content"
              @click="() => handleSelectType(40, 'waitShipEnableFlag', 'waitDeliveryEableTips')"
            >
              <view class="delivery-control-content-cell-cirle"></view>
              <view class="delivery-control-content-cell-label">等通知派送</view>
              <view class="delivery-control-content-cell-desc">派送时间未确定，等具体通知再派送</view>
              <view class="delivery-control-content-cell-checkbox" v-if="cargoStorageInfo.waitDeliveryEnableFlag === 0">
                <img
                  class="delivery-control-content-cell-checkbox-img"
                  src="https://ic-img.ky-express.com/netc/20240227_11060601273_!!1709027039340_56_56.png"
                />
              </view>
              <view class="delivery-control-content-cell-checkbox" v-else>
                <img
                  class="delivery-control-content-cell-checkbox-img"
                  :src="
                    selectType === 40 ? require('./assets/icon-select.png') : require('./assets/icon-not-select.png')
                  "
                />
              </view>
            </view>
          </view>
          <view class="delivery-control-content-cell">
            <view class="delivery-control-content-cell-content" @click="() => handleSelectType(50, '')">
              <view class="delivery-control-content-cell-cirle"></view>
              <view class="delivery-control-content-cell-label">指定时间派送</view>
              <view class="delivery-control-content-cell-desc">已和收方约定时间，设置具体时间派送</view>
              <view class="delivery-control-content-cell-checkbox">
                <Image
                  class="delivery-control-content-cell-checkbox-img"
                  :src="
                    selectType === 50 ? require('./assets/icon-select.png') : require('./assets/icon-not-select.png')
                  "
                />
              </view>
            </view>
          </view>
        </view>
        <!-- 时间组件 -->
        <view v-if="selectType === 50">
          <template v-if="showWaitNotification">
            <view class="netc-time-popup__btn" v-if="showWaitNotification">
              <view
                v-for="(item, i) in waitNotification"
                :key="i"
                @click="timeTypeChange(i + 1)"
                :class="{ active: tabIndex === i + 1, disabled: item.disabled }"
              >
                {{ item.name }}
              </view>
            </view>
            <view v-if="showTime" :class="{ 'disabled-time': tabIndex === 1 }" class="netc-time-popup__content">
              <text @click="startTimeHandle" class="time" :class="{ 'high-light': startTimeWatcher }">
                {{ startTimeWatcher || '选择开始时间' }}
              </text>
              <text class="line"></text>
              <text
                @click="endTimeHandle"
                :class="{ disabled: !startTimeWatcher, 'high-light': endTimeWatcher }"
                class="time"
                >{{ endTimeWatcher || '选择结束时间' }}</text
              >
            </view>
          </template>
          <!-- 可选精准时间 / 时间段功能逻辑 -->
          <template v-else-if="showTimeConfigOption">
            <view class="netc-time-popup__btn">
              <view
                v-for="(item, i) in timeConfigOption"
                :key="i"
                @click="timeConfigOptionChange(i + 1)"
                :class="{ active: tabIndex === i + 1, disabled: item.disabled }"
              >
                {{ item.name }}
              </view>
            </view>
            <view v-if="tabIndex === 1" class="netc-time-popup__content">
              <text @click="startTimeHandle" class="time" :class="{ 'high-light': startTimeWatcher }">
                {{ startTimeWatcher || '请选择时间' }}
              </text>
            </view>
            <view v-else-if="tabIndex === 2" class="netc-time-popup__content">
              <text @click="startTimeHandle" class="time" :class="{ 'high-light': startTimeWatcher }">
                {{ startTimeWatcher || '选择开始时间' }}
              </text>
              <text class="line"></text>
              <text
                @click="endTimeHandle"
                :class="{ disabled: !startTimeWatcher, 'high-light': endTimeWatcher }"
                class="time"
                >{{ endTimeWatcher || '选择结束时间' }}</text
              >
            </view>
          </template>
          <template v-else>
            <view :class="{ 'disabled-time': tabIndex === 1 }" class="netc-time-popup__content">
              <text @click="startTimeHandle" class="time" :class="{ 'high-light': startTimeWatcher }">
                {{ startTimeWatcher || '选择开始时间' }}
              </text>
              <text class="line"></text>
              <text
                @click="endTimeHandle"
                :class="{ disabled: !startTimeWatcher, 'high-light': endTimeWatcher }"
                class="time"
                >{{ endTimeWatcher || '选择结束时间' }}</text
              >
            </view>
          </template>
        </view>
      </view>

      <view class="netc-time-popup__footer">
        <van-button :class="{ disabled: disabledBtn }" block type="primary" class="confirm-btn" @click="onConfirm"
          >确定</van-button
        >
      </view>
    </view>
  </ky-popup>
</template>
<script lang="ts" setup>
import Taro from '@tarojs/taro'
import './index.scss'
import { ref, computed, watch } from 'vue'

const props = withDefaults(
  defineProps<{
    currentTabIndex: number
    startTime: string
    endTime: string
    tips: string
    waitNotification: any[]
    timeConfigOption: any[]
    templateTime: object
    cargoStorageInfo: object
  }>(),
  {
    cargoStorageInfo: {
      waitShipEnableFlag: 1,
    },
  }
)

const emit = defineEmits([
  'update:show',
  'startTimeTrigger',
  'endTimeTrigger',
  'deliveryControlConfirm',
  'confirm',
  'timeTypeChange',
  'timeConfigOptionChange',
])

const handleClose = () => {
  emit('update:show', false)
}

const callSource = ref('')
const tabIndex = ref(null)
const timeConfigOptionMap = ref({
  1: {
    startTimeWatcher: '',
    endTimeWatcher: '',
  },
  2: {
    startTimeWatcher: '',
    endTimeWatcher: '',
  },
})
// 30等通知发运 40等通知派送 50指定时间派送
const selectType = ref(50)
// 是否曝光
const isExp = ref(true)

const startTimeWatcher = computed(() => {
  const { startTime } = props.templateTime || {}
  if (showWaitNotification.value) {
    return startTime
  } else if (showTimeConfigOption.value) {
    return timeConfigOptionMap.value[tabIndex.value]?.startTimeWatcher
  }
  return startTime
})
const endTimeWatcher = computed(() => {
  const { endTime } = props.templateTime || {}
  if (showWaitNotification.value) {
    return endTime
  } else if (showTimeConfigOption.value) {
    return timeConfigOptionMap.value[tabIndex.value]?.endTimeWatcher
  }
  return endTime
})
const disabledBtn = computed(() => {
  if (!selectType.value) {
    return true
  } else {
    if (selectType.value === 50) {
      return disabledTimeBtn.value
    }
    return false
  }
})
const disabledTimeBtn = computed(() => {
  if (showWaitNotification.value) {
    return !startTimeWatcher.value || !endTimeWatcher.value || !tabIndex.value
  }
  // 可选精准时间 / 时间段功能逻辑
  else if (showTimeConfigOption.value) {
    if (tabIndex.value === 1) {
      return !startTimeWatcher.value
    } else {
      return !startTimeWatcher.value || !endTimeWatcher.value
    }
  }
  return !startTimeWatcher.value || !endTimeWatcher.value
})
const showWaitNotification = computed(() => {
  return props.waitNotification && props.waitNotification.length
})

const showTimeConfigOption = computed(() => {
  return props.timeConfigOption && props.timeConfigOption.length
})

const showTime = computed(() => {
  if (showWaitNotification.value) {
    return tabIndex
  } else {
    return true
  }
})

watch(
  () => props.templateTime?.startTime,
  (val) => {
    timeConfigOptionMap.value[tabIndex].startTimeWatcher = val
  }
)

watch(
  () => props.templateTime?.endTime,
  (val) => {
    timeConfigOptionMap.value[tabIndex].endTimeWatcher = val
  }
)

const setStartTime = (val) => {
  timeConfigOptionMap.value[tabIndex].startTimeWatcher = val
}
const startTimeHandle = () => {
  emit('startTimeTrigger', startTimeWatcher.value, tabIndex.value)
}
const endTimeHandle = () => {
  emit('endTimeTrigger', startTimeWatcher, tabIndex)
}
const onConfirm = () => {
  // 控货需求新增逻辑
  if (selectType.value !== 50) {
    emit('deliveryControlConfirm', selectType.value)
    return
  }
  let startTime = startTimeWatcher.value
  let endTime = endTimeWatcher.value
  if (showTimeConfigOption.value && tabIndex.value === 1) {
    endTime = ''
  }
  emit('confirm', {
    startTime,
    endTime,
    callSource: callSource.value,
    tabIndex: tabIndex.value,
  })
}
const open = ({ callSourceKey }) => {
  callSource.value = callSourceKey
  tabIndex.value = null

  // 等通知发运和等通知派送不能选择的情况下 自动选中指定派送时段
  if (props.cargoStorageInfo?.waitShipEnableFlag !== 1 && props.cargoStorageInfo?.waitDeliveryEnableFlag !== 1) {
    selectType.value = 50
  }
}
const initData = () => {
  tabIndex.value = props.currentTabIndex
  if (!tabIndex.value) {
    timeConfigOptionMap.value = {
      1: {
        startTimeWatcher: props.startTime,
        endTimeWatcher: '',
      },
      2: {
        startTimeWatcher: props.startTime,
        endTimeWatcher: props.endTime,
      },
    }
  } else if (tabIndex.value === 1) {
    timeConfigOptionMap.value = {
      1: {
        startTimeWatcher: props.endTime,
        endTimeWatcher: '',
      },
      2: {
        startTimeWatcher: '',
        endTimeWatcher: '',
      },
    }
  } else if (tabIndex.value === 2) {
    timeConfigOptionMap.value = {
      1: {
        startTimeWatcher: '',
        endTimeWatcher: '',
      },
      2: {
        startTimeWatcher: props.startTime,
        endTimeWatcher: props.endTime,
      },
    }
  }
}
const timeTypeChange = (index) => {
  if (tabIndex.value !== index) {
    tabIndex.value = index
    emit('timeTypeChange', index)
  }
}
const timeConfigOptionChange = (index) => {
  if (tabIndex.value !== index) {
    tabIndex.value = index
    emit('timeConfigOptionChange', timeConfigOptionMap.value[tabIndex.value], tabIndex)
  }
}
const handleSelectType = (value, type, tipsKey) => {
  if (type) {
    if (props.cargoStorageInfo[type] === 0) {
      Taro.showToast(props.cargoStorageInfo[tipsKey])
      return
    }
    selectType.value = value
  } else {
    selectType.value = value
  }
}

defineExpose({
  open,
})
</script>
