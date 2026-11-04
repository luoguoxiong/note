<template>
  <div class="online">
    <!-- 骨架屏 -->
    <div class="skeleton-content" v-if="showSkeleton">
      <Skeleton />
    </div>

    <template v-if="columns?.length && !showSkeleton">
      <div class="main-content" v-exposure-report="{ eventCode: 'other_express_goodstime_popup_perception_v1' }">
        <div class="toogle-tool" v-if="isShowSwitch">
          <div class="label" v-exposure-report="{ eventCode: 'exp_express_goodsTime_urgent_v1' }">
            需要选择其他时间段上门取货
          </div>
          <div class="radio-content">
            <KySwitch size="19.8px" active-color="#8365F6" :model-value="selfSignFlag" @change="handleChange" />
          </div>
        </div>
        <div class="body-content">
          <ky-picker
            :swipe-duration="300"
            class="time-picker"
            ref="pickRef"
            v-model="defaultValue"
            :show-toolbar="false"
            :columns="columns"
          />
        </div>
      </div>
      <div class="footer">
        <div class="goods-current-time btn" v-if="goodsTimeConfig.goodsTimeFlag && selfSignFlag" @click="confirmNow">
          <div class="text">现在货好</div>
          <div class="tip">预计1小时内上门取货</div>
        </div>
        <div class="confirm btn" @click="confirm">确定</div>
      </div>
    </template>

    <!-- 无数据 -->
    <div v-if="!showSkeleton && !columns?.length" class="empty-content">
      <KyEmpty class="body-content">
        <LazyRender>
          <img class="empty-img" :src="emptyImg" />
        </LazyRender>
        <template #test>
          <div class="des-text">{{ themeName || '活动' }}已结束，如需要寄件请联系跨越商务~</div>
        </template>
      </KyEmpty>
    </div>
  </div>
</template>

<script setup lang="ts">
import KySwitch from '@order-public-sub-public/components/base/ky-switch/index.vue'
import { ref, computed, watchEffect, nextTick, onMounted } from 'vue'
import { PickTime } from '@order-public-sub-public/components/business/goods-time/type'
import { initDefaultColumns } from '@order-public-sub-public/components/business/goods-time/hooks/useCustomerColumns'
import { initOnlineBatchColumns } from '@order-public-sub-public/components/business/goods-time/hooks/useOnlineBatchColumns'
import { CrmGoodsTimeConfig } from '@order-public-sub-public/types'
import { ModuleType, GoodsTimeFlag, UrgentGoods } from '@order-public-sub-public/constants'
import { checkDefaultValue } from '@order-public-sub-public/components/business/goods-time/hooks/checkDefaultValue'
import { type PickerInstance } from '@order-public-sub-public/hooks/useShowToast'
import dayjs from 'dayjs'
import { debounce } from 'lodash-es'
import Skeleton from '@order-public-sub-public/components/business/goods-time/components/skeleton/index.vue'
import KyEmpty from '@order-public-sub-public/components/business/contact-business/components/empty/index.vue'
import LazyRender from '@order-public-sub-public/components/ui/lazy-render/index.vue'
import { confirmReport } from '@order-public-sub-public/components/business/goods-time/hooks/useReport'

interface PopupProps {
  goodsTimeConfig: CrmGoodsTimeConfig
  themeName?: string
  goodsTime?: string
  urgentGoods?: UrgentGoods
}

const emptyImg = 'https://ic-img.ky-express.com/netc/20250619_8744_!!1750300045789_560_552.png'
const props = defineProps<PopupProps>()

const isFirstInit = ref(true)
const showSkeleton = ref(true) // 骨架屏

const selfSignFlag = ref(false)
const columns = ref<PickTime[]>()
const pickRef = ref<PickerInstance>()

const defaultValue = ref<string[]>([])
const isShowSwitch = ref(false)
const emits = defineEmits(['close', 'selectTime'])

const timeRange = computed(() => {
  return props.goodsTimeConfig?.timeRange || undefined
})

// 构建批次时间控件数据
const onlineBatchColumns = computed(() => {
  if (timeRange.value?.timeBatch) {
    return initOnlineBatchColumns(timeRange.value)
  } else {
    return []
  }
})

// 构建紧急自定义时间数据
const onlineDefaultColumns = computed(() => {
  if (timeRange.value) {
    const { startDate, startTime, endDate, endTime, timePeriodType } = timeRange.value
    return initDefaultColumns([{ startDate, startTime, endDate, endTime, interval: 15, timePeriodType }])
  } else {
    return []
  }
})

// 切换时间模式
const handleChange = debounce((value: boolean) => {
  selfSignFlag.value = value
  buildDefaultValue()
  columns.value = selfSignFlag.value ? onlineDefaultColumns.value : onlineBatchColumns.value
  showSkeleton.value = false
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
  const timeStr = dayjs(props.goodsTime).format('YYYY/MM/DD HH:mm')
  buildDefaultValue(timeStr)
}

const close = () => {
  emits('close')
}

const getSelectTime = () => {
  const selectList = pickRef.value?.getSelectedOptions() || []

  // 根据返回值拼接成时间格式 YYYY/MM/DD HH:mm
  return selectList.reduce((pre, cur, index) => {
    if (index === 0) {
      pre += cur?.value
    } else if (index === 1) {
      pre += ` ${cur?.value}`
    } else if (index === 2) {
      pre += `:${cur?.value}`
    }
    return pre
  }, '')
}

// 现在货好按钮提交
const confirmNow = () => {
  emits('selectTime', {
    type: ModuleType['货好时间'],
    data: {
      goodsTime: '',
      goodsTimeFlag: GoodsTimeFlag.NOW,
      urgentGoods: isShowSwitch.value ? UrgentGoods.URGENT : undefined,
    },
  })
  close()
}

const confirm = () => {
  let selectTime = getSelectTime()
  if (!selectTime) {
    return
  }
  selectTime = dayjs(selectTime).format('YYYY-MM-DD HH:mm')

  emits('selectTime', {
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
    isShowSwitch.value = true
    if (String(props.urgentGoods) === UrgentGoods.URGENT) {
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

onMounted(() => {
  setDefaultShow()
  nextTick(() => {
    isFirstInit.value = false
  })
})
</script>

<style lang="scss" scoped>
@import '@order-global-package-order-sub/styles/index.scss';
@import './index.scss';
</style>
