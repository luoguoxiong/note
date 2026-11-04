<template>
  <div class="online">
    <!-- 骨架屏 -->
    <div class="skeleton-content" v-if="showSkeleton">
      <Skeleton />
    </div>

    <template v-if="columns?.length && !showSkeleton">
      <div
        class="main-content"
        v-exposure-report="{
          eventCode: 'other_express_goodstime_popup_perception_v1',
        }"
      >
        <div class="toogle-tool" v-if="isShowSwitch">
          <div
            class="label"
            v-exposure-report="{
              eventCode: 'exp_express_goodsTime_urgent_v1',
            }"
          >
            需要选择其他时间段上门取货
          </div>
          <div class="radio-content">
            <ky-switch
              size="medium"
              inactive-color="#ebedf5"
              active-color="#8365F6"
              :model-value="selfSignFlag"
              @change="handleChange"
            />
          </div>
        </div>
        <div class="body-content">
          <ky-picker
            title=""
            :showToolbar="false"
            confirm-button-text=""
            cancel-button-text=""
            :swipe-duration="300"
            :poppable="false"
            class="time-picker"
            ref="pickRef"
            v-model="defaultValue"
            :columns="columns"
            @confirm="confirm"
          >
          </ky-picker>
        </div>
      </div>
      <Footer
        :config="config"
        @confirm="handelConfirm"
        :selfSignFlag="selfSignFlag"
        :isReturnSend="isReturnSend"
        @confirmNow="confirmNow"
      />
    </template>

    <!-- 无数据 -->
    <div v-if="!showSkeleton && !columns?.length" class="empty-content">
      <KyEmpty class="body-content">
        <LazyRender>
          <img class="empty-img" :src="emptyImg" />
        </LazyRender>
        <template #test>
          <div class="des-text">{{ themeName }}已结束，如需要寄件请联系跨越商务~</div>
        </template>
      </KyEmpty>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watchEffect, nextTick, onMounted, watch } from 'vue'
import Footer from './footer/index.vue'
import { PickTime } from '@order-public-sub-public/components/business/goods-time/type'
import { initDefaultColumns } from '@order-public-sub-public/components/business/goods-time/hooks/useCustomerColumns'
import { initOnlineBatchColumns } from '@order-public-sub-public/components/business/goods-time/hooks/useOnlineBatchColumns'
import { GoodsTimeDimension, GoodsTimeConfig, GoodsTime } from '@order-public-sub-public/types'
import { ModuleType, GoodsTimeFlag, UrgentGoods } from '@order-public-sub-public/constants'
import { checkDefaultValue } from '@order-public-sub-public/components/business/goods-time/hooks/checkDefaultValue'
import { useValidate } from '@order-public-sub-public/components/business/goods-time/hooks/useValidate'
import { isReturnSend } from '@order-public-sub-public/components/business/goods-time/hooks/returnWaybill'
import dayjs from 'dayjs'
import { cloneDeep, debounce } from 'lodash-es'
import Skeleton from '@order-public-sub-public/components/business/goods-time/components/skeleton/index.vue'
import LazyRender from '@order-public-sub-public/components/ui/lazy-render/index.vue'
import KyEmpty from '@order-public-sub-public/components/business/contact-business/components/empty/index.vue'
import {
  confirmReport,
  onlineConfirmNowReport,
} from '@order-public-sub-public/components/business/goods-time/hooks/useReport'
import { openGoodsTimeByService } from '@order-public-sub-public/components/business/goods-time/hooks/state'
import { useStore } from '@order-public-sub-public/store'
const piniaStore = useStore()

interface PopupProps {
  config: GoodsTimeConfig
}
const emptyImg = 'https://ic-img.ky-express.com/netc/20250619_8744_!!1750300045789_560_552.png'
defineProps<PopupProps>()

const isFirstInit = ref(true)
const showSkeleton = ref(true) // 骨架屏

const currentSelectedTime = ref<string[]>([]) // 当前选中
const isGetBychange = ref(false) // 切换时间模式触发的确认(选中时间需要从确认方法里面拿)

const { confirmValidateCollection } = useValidate()

const selfSignFlag = ref(false)
const columns = ref<PickTime[]>()
const pickRef = ref()

const defaultValue = ref<string[]>([])
const isShowSwitch = ref(false)
const emits = defineEmits(['close'])

const goodsTimeOrderData = computed(() => {
  return piniaStore.order.moduleFormData(ModuleType['货好时间'])
})

const goodsTime = computed(() => {
  return piniaStore.order.moduleFormData(ModuleType['货好时间'])?.goodsTime
})

const themeName = computed(() => {
  return piniaStore.schema.currentSchema?.themeName || '活动'
})

// 构建批次时间控件数据
const onlineBatchColumns = computed(() => {
  const checkData = piniaStore.schema.moduleDimensionData(ModuleType['货好时间'])
  if (checkData?.goodsTimeVo?.crmGoodsTimeConfig?.timeRange?.timeBatch) {
    return initOnlineBatchColumns(checkData?.goodsTimeVo.crmGoodsTimeConfig.timeRange)
  } else {
    return []
  }
})

// 构建紧急自定义时间数据
const onlineDefaultColumns = computed(() => {
  const checkData = piniaStore.schema.moduleDimensionData(ModuleType['货好时间'])
  if (checkData?.goodsTimeVo?.crmGoodsTimeConfig?.timeRange) {
    const { startDate, startTime, endDate, endTime, timePeriodType } =
      checkData?.goodsTimeVo.crmGoodsTimeConfig.timeRange
    return initDefaultColumns([{ startDate, startTime, endDate, endTime, interval: 15, timePeriodType }])
  } else {
    return []
  }
})

const handelConfirm = () => {
  pickRef.value?.handleConfirm()
}

// 切换时间模式
const handleChange = debounce((value: boolean) => {
  isGetBychange.value = true
  pickRef.value?.handleConfirm()
  console.log('切换时间模式res')
  selfSignFlag.value = value
  buildDefaultValue()
  columns.value = selfSignFlag.value ? onlineDefaultColumns.value : onlineBatchColumns.value
  showSkeleton.value = false
  setTimeout(() => {
    isGetBychange.value = false
  }, 0)
}, 300)

/**
 * 设置默认选中状态
 * @param time 当前选中时间
 * 如果没有传时间，获取前时间模式选中的时间
 * 如果有时间，则作为默认时间
 */
const buildDefaultValue = (time?: string) => {
  const selectTime = time || getSelectTime()
  nextTick(() => {
    if (selfSignFlag.value) {
      defaultValue.value = checkDefaultValue(onlineDefaultColumns.value, selectTime, selfSignFlag.value)
    } else {
      defaultValue.value = checkDefaultValue(onlineBatchColumns.value, selectTime, selfSignFlag.value)
    }
  })
}

/**
 * 设置默认选中
 * 时间格式说明：UI显示以及构建时间选择器数据用的都是'YYYY/MM/DD HH:mm'
 * 保存到表单传给后端的为'YYYY-MM-DD HH:mm'，后端解析不了“/”
 */
const setDefaultShow = () => {
  const timeStr = dayjs(goodsTime.value).format('YYYY/MM/DD HH:mm')

  buildDefaultValue(timeStr)
}

const close = () => {
  confirmValidateCollection()
  emits('close')
}

const getSelectTime = (curselectList?: string[]) => {
  console.log('getSelectTime', curselectList)
  const selectList = curselectList || currentSelectedTime.value || []
  // 根据返回值拼接成时间格式 YYYY/MM/DD HH:mm
  return selectList.reduce((pre, cur, index) => {
    if (index === 0) {
      pre += cur
    } else if (index === 1) {
      pre += ` ${cur}`
    } else if (index === 2) {
      pre += `:${cur}`
    }
    return pre
  }, '')
}

// 现在货好按钮提交
const confirmNow = () => {
  piniaStore.order.updateOrderByType({
    type: ModuleType['货好时间'],
    data: {
      goodsTime: '',
      goodsTimeFlag: GoodsTimeFlag.NOW,
      urgentGoods: isShowSwitch.value ? UrgentGoods.URGENT : undefined,
    },
  })
  onlineConfirmNowReport(isReturnSend.value)
  close()
}

const isValidDateStr = (str: string) => {
  return /[\/-]/.test(str)
}

const confirm = (selectData) => {
  const selectList = selectData?.selectedValue || []
  currentSelectedTime.value = cloneDeep(selectList)

  // 切换触发的不需要提交
  if (isGetBychange.value) {
    return
  }

  let selectTime = getSelectTime(selectList) || ''
  if (!selectTime) {
    return
  }

  // 基础组件有问题,只操作后两列,没有返回年月日选项
  if (isValidDateStr(selectTime)) {
    selectTime = dayjs(selectTime).format('YYYY-MM-DD HH:mm')
  } else if (selectData?.selectedOptions?.length) {
    const list = selectData?.selectedOptions.map((item) => item.value)
    selectTime = getSelectTime(list)
    selectTime = dayjs(selectTime).format('YYYY-MM-DD HH:mm')
  } else {
    selectTime = ''
  }
  console.log(isShowSwitch.value)
  piniaStore.order.updateOrderByType({
    type: ModuleType['货好时间'],
    data: {
      goodsTime: selectTime,
      goodsTimeFlag: GoodsTimeFlag.NONE,
      urgentGoods: selfSignFlag.value && isShowSwitch.value ? UrgentGoods.URGENT : undefined,
    },
  })
  confirmReport(selectTime, selfSignFlag.value ? '自定义时间' : '货好批次')
  close()
}

watchEffect(() => {
  /**
   * 是否有批次数据
   *    是：
   *        时间类型为其他
   *            打开开关
   *            选项配置为其他列表
   *        时间类型为批次
   *            关闭开关
   *            选项配置为批次列表
   *    否：
   *        隐藏开关
   *        选项配置为其他列表
   */

  if (onlineBatchColumns.value.length) {
    if (openGoodsTimeByService.value) {
      columns.value = onlineBatchColumns.value
      selfSignFlag.value = false
      showSkeleton.value = false
      isShowSwitch.value = false
      return
    }
    isShowSwitch.value = true
    if (String(goodsTimeOrderData.value?.urgentGoods) === UrgentGoods.URGENT) {
      selfSignFlag.value = true
      columns.value = onlineDefaultColumns.value
      showSkeleton.value = false
    } else {
      columns.value = onlineBatchColumns.value
      selfSignFlag.value = false
      showSkeleton.value = false
    }
  } else {
    columns.value = onlineDefaultColumns.value
    showSkeleton.value = false
    isShowSwitch.value = false
    selfSignFlag.value = true
  }
})

const timeBatch = computed(() => {
  const goodsTimeSchema = piniaStore.schema.moduleDimensionData(ModuleType['货好时间'])
  return goodsTimeSchema?.goodsTimeVo?.crmGoodsTimeConfig?.timeRange?.timeBatch || []
})

/**
 * 需求：地址变更导致批次变化
 *  1.如果当前运单时间在批次内，使用批次，关闭加急标识
 *  2.如果有批次且不在批次内 则打开加急标识
 *  3.通知后台
 */
watch(
  () => timeBatch.value,
  () => {
    if (isFirstInit.value) return

    const timeHM = goodsTime.value?.split(' ')[1] || ''

    // 如果新的批次包含当前时间则采用批次，取消加急标识
    if ((timeHM && timeBatch.value.includes(timeHM)) || openGoodsTimeByService.value) {
      selfSignFlag.value = false
    } else {
      selfSignFlag.value = true
    }
    setTimeout(() => {
      setDefaultShow()
    }, 100)
  },
)

onMounted(() => {
  setDefaultShow()
  nextTick(() => {
    isFirstInit.value = false
  })
})
</script>

<style lang="scss">
@import '@order-global-package-order-sub/styles/index.scss';
@import './index.scss';
</style>
