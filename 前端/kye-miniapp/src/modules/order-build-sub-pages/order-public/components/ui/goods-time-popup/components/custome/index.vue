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
            :swipe-duration="300"
            v-if="columns?.length"
            v-model="defaultValue"
            ref="customePickRef"
            :show-toolbar="false"
            :columns="columns"
          />
        </div>
      </div>
      <div class="footer">
        <div
          class="goods-current-time btn"
          v-if="goodsTimeConfig?.goodsTimeFlag"
          @click="confirmNow"
          v-click-report="{
            eventCode: 'clk_express_goods_now_v1',
          }"
        >
          <div class="text">现在货好</div>
          <div class="tip">预计1小时内上门取货</div>
        </div>
        <div class="confirm btn" @click="confirm">确定</div>
      </div>
    </template>

    <!-- 无数据 -->
    <div v-if="!showSkeleton && !columns?.length" class="empty-content">
      <KyEmpty class="body-content">
        <img class="empty-img" :src="emptyImg" />
        <template #test>
          <div class="des-text">{{ themeName || '活动' }}已结束，如需要寄件请联系跨越商务~</div>
        </template>
      </KyEmpty>
    </div>
  </div>
</template>

<script setup lang="ts">
import dayjs from 'dayjs'
import { ref, computed, onMounted, watch } from 'vue'
import { initDefaultColumns } from '@order-public-sub-public/components/business/goods-time/hooks/useCustomerColumns'
import { GoodsTimeConfig } from '@order-public-sub-public/types'
import { ModuleType, GoodsTimeFlag, UrgentGoods } from '@order-public-sub-public/constants'
import { type PickerInstance } from '@order-public-sub-public/hooks/useShowToast'
import { checkDefaultValue } from '@order-public-sub-public/components/business/goods-time/hooks/checkDefaultValue'
import KyEmpty from '@order-public-sub-public/components/business/contact-business/components/empty/index.vue'
import Skeleton from '@order-public-sub-public/components/business/goods-time/components/skeleton/index.vue'
import { PickTime } from '@order-public-sub-public/components/business/goods-time/type'
import {
  confirmNowReport,
  confirmReport,
} from '@order-public-sub-public/components/business/goods-time/hooks/useReport'
interface PopupProps {
  goodsTimeConfig: GoodsTimeConfig | null
  themeName?: string
  goodsTime?: string
  urgentGoods?: UrgentGoods
}

const emptyImg = 'https://ic-img.ky-express.com/netc/20250619_8744_!!1750300045789_560_552.png'
const props = defineProps<PopupProps>()
const emits = defineEmits(['close', 'hideTips', 'selectTime'])

const showSkeleton = ref(true) // 骨架屏
const columns = ref<PickTime[]>() // 时间组装数据
const customePickRef = ref<PickerInstance>()
const defaultValue = ref<string[]>([])

// 时间配置数据
const timeData = computed(() => {
  if (props.goodsTimeConfig?.timeRangeList) {
    return props.goodsTimeConfig?.timeRangeList || []
  } else {
    return []
  }
})

const setDefaultShow = () => {
  const timeStr = dayjs(props.goodsTime).format('YYYY/MM/DD HH:mm')
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
  emits('close')
}

const confirmNow = () => {
  emits('selectTime', {
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

const confirm = () => {
  const selectList = customePickRef.value?.getSelectedOptions() || []
  // 时间拼接
  let selectTime = selectList.reduce((pre, cur, index) => {
    if (index === 0) {
      pre += cur?.value
    } else if (index === 1) {
      pre += ` ${cur?.value}`
    } else if (index === 2) {
      pre += `:${cur?.value}`
    }
    return pre
  }, '')
  if (!selectTime) {
    return
  }
  selectTime = dayjs(selectTime).format('YYYY-MM-DD HH:mm')

  emits('selectTime', {
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
  setDefaultShow()
})
</script>

<style lang="scss" scoped>
@import '@order-global-package-order-sub/styles/index.scss';
@import './index.scss';
</style>
