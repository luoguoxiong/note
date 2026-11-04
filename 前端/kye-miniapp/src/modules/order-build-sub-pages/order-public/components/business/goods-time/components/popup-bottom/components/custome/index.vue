<template>
  <div class="custome">
    <!-- 骨架屏 -->
    <div class="skeleton-content" v-if="showSkeleton">
      <Skeleton />
    </div>

    <!-- 时间选择控件 -->
    <template v-if="columns?.length && !showSkeleton">
      <div class="main-content">
        <div class="body-content">
          <ky-picker
            :poppable="false"
            title=""
            confirm-button-text=""
            cancel-button-text=""
            :swipe-duration="300"
            v-if="columns?.length"
            v-model="defaultValue"
            ref="customePickRef"
            :show-toolbar="false"
            :columns="columns"
            @confirm="confirm"
          >
          </ky-picker>
        </div>
      </div>
      <!--  使用自定义底部组件  -->
      <Footer @confirm="handelConfirm" :config="config" @confirmNow="confirmNow" />
    </template>

    <!-- 无数据 -->
    <div v-if="!showSkeleton && !columns?.length" class="empty-content">
      <KyEmpty class="body-content">
        <img class="empty-img" :src="emptyImg" />
        <template #test>
          <div class="des-text">{{ themeName }}已结束，如需要寄件请联系跨越商务~</div>
        </template>
      </KyEmpty>
    </div>
  </div>
</template>

<script setup lang="ts">
import dayjs from 'dayjs'
import { ref, computed, onMounted, watch } from 'vue'
import Footer from './footer/index.vue'
import { initDefaultColumns } from '@order-public-sub-public/components/business/goods-time/hooks/useCustomerColumns'
import { GoodsTimeDimension, GoodsTimeConfig, GoodsTime } from '@order-public-sub-public/types'
import { ModuleType, GoodsTimeFlag } from '@order-public-sub-public/constants'
import { type PickerInstance } from '@order-public-sub-public/hooks/useShowToast'
import { useStore } from '@order-public-sub-public/store'
import { checkDefaultValue } from '@order-public-sub-public/components/business/goods-time/hooks/checkDefaultValue'
import { useValidate } from '@order-public-sub-public/components/business/goods-time/hooks/useValidate'
import KyEmpty from '@order-public-sub-public/components/business/contact-business/components/empty/index.vue'
import Skeleton from '@order-public-sub-public/components/business/goods-time/components/skeleton/index.vue'
import { PickTime } from '@order-public-sub-public/components/business/goods-time/type'
import {
  confirmNowReport,
  confirmReport,
} from '@order-public-sub-public/components/business/goods-time/hooks/useReport'
const piniaStore = useStore()
interface PopupProps {
  config: GoodsTimeConfig
}
defineProps<PopupProps>()
const emits = defineEmits(['close', 'hideTips'])
const { confirmValidateCollection } = useValidate()
const emptyImg = 'https://ic-img.ky-express.com/netc/20250619_8744_!!1750300045789_560_552.png'
const showSkeleton = ref(true) // 骨架屏
const columns = ref<PickTime[]>() // 时间组装数据

const customePickRef = ref()
const defaultValue = ref<string[]>([])

const themeName = computed(() => {
  return piniaStore.schema.currentSchema?.themeName || '活动'
})

// 时间配置数据
const timeData = computed(() => {
  const checkData = piniaStore.schema.moduleDimensionData(ModuleType['货好时间'])
  if (checkData?.goodsTimeVo?.erpGoodsTimeConfig?.timeRangeList) {
    return checkData?.goodsTimeVo?.erpGoodsTimeConfig?.timeRangeList || []
  } else {
    return []
  }
})

const goodsTime = computed(() => {
  return piniaStore.order.moduleFormData(ModuleType['货好时间']).goodsTime
})

const setDefaultShow = () => {
  const timeStr = dayjs(goodsTime.value).format('YYYY/MM/DD HH:mm')
  defaultValue.value = checkDefaultValue(columns.value || [], timeStr, true)
}

watch(
  () => timeData.value,
  () => {
    if (timeData.value?.length) {
      columns.value = initDefaultColumns(timeData.value) || []
      console.log('货好时间组装数据')
      showSkeleton.value = false
      if (!defaultValue.value?.length) {
        setDefaultShow()
      }
    } else {
      columns.value = []
    }
    if (!columns.value || !columns.value.length) {
      emits('hideTips', true)
    } else {
      emits('hideTips', false)
    }
  },
  {
    immediate: true,
  },
)

const close = () => {
  // 校验
  confirmValidateCollection()
  emits('close')
}

const confirmNow = () => {
  piniaStore.order.updateOrderByType({
    type: ModuleType['货好时间'],
    data: {
      goodsTime: '',
      goodsTimeFlag: GoodsTimeFlag.NOW,
      urgentGoods: undefined,
    },
  })

  confirmNowReport()
  close()
}

const isValidDateStr = (str: string) => {
  return /[\/-]/.test(str)
}

const getSelectTime = (curselectList?: string[]) => {
  return curselectList?.reduce((pre, cur, index) => {
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
const handelConfirm = () => {
  customePickRef.value?.handleConfirm()
}

const confirm = (selectData) => {
  const selectList = selectData?.selectedValue || []
  console.log('confirm456789', selectData)

  // 时间拼接
  let selectTime = getSelectTime(selectList) || ''

  if (!selectTime) {
    return
  }

  // 基础组件有问题,只操作后两列,没有返回年月日选项
  if (isValidDateStr(selectTime)) {
    selectTime = dayjs(selectTime).format('YYYY-MM-DD HH:mm')
  } else if (selectData?.selectedOptions?.length) {
    const list = selectData?.selectedOptions.map((item) => item.value)
    selectTime = getSelectTime(list) || ''
    selectTime = dayjs(selectTime).format('YYYY-MM-DD HH:mm')
  } else {
    selectTime = ''
  }

  piniaStore.order.updateOrderByType({
    type: ModuleType['货好时间'],
    data: {
      goodsTime: selectTime,
      goodsTimeFlag: GoodsTimeFlag.NONE,
      urgentGoods: undefined,
    },
  })
  confirmReport(selectTime, '自定义时间') // 上报
  close()
}

onMounted(() => {
  console.log(123)
  setDefaultShow()
})
</script>

<style lang="scss">
@import '@order-global-package-order-sub/styles/index.scss';
@import './index.scss';
</style>
