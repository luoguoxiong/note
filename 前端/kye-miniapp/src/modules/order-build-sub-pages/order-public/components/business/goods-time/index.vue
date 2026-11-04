<template>
  <div id="GoodsTime" class="goods-time" :class="{ disabled: disabled }" :type="type" :visible="visible">
    <HotZone :moduleType="ModuleType['货好时间']" v-if="!isReturnWaybill"></HotZone>
    <div class="cell-content" v-if="timeModeVisible">
      <KyCell
        :required="required"
        :no-bg-disabled="disabled"
        id="goodsTime_goodsTime"
        class="background-transparent"
        data-validate="goodsTime.goodsTime"
        :title="config.alias || '货好时间'"
        label=""
        @click="clickHandel"
        v-click-report="clk_express_goodstime_v1()"
        v-exposure-report="{
          eventCode: 'exp_express_single_goodtime_v1',
          regionCode: 'send_info',
        }"
        placeholder="请选择"
      >
        <template #title>
          <div class="goods-time-title">
            <span class="title-text">{{ config.alias || '货好时间' }}</span>
            <LazyRender>
              <SvgIcon v-if="required" class="required-icon" name="required" />
            </LazyRender>
          </div>
        </template>
        <template #value v-if="goodsTime || isNowGoodsTime">
          <div class="value-content">
            <!-- 非现在货好显示时间 -->
            <span v-if="!isNowGoodsTime">
              <span class="time" v-if="goodsTime">{{ filterTime(goodsTime) }}</span>
              <span class="no-data" v-else>请选择</span>
            </span>

            <!-- 现在货好显示文案 -->
            <span v-if="isNowGoodsTime" class="now-goods-time">
              <template v-if="!isReturnSend">
                现在货好
                <span class="now-tips">(预计1小时内上门取货)</span>
              </template>

              <!-- 签收立即返显示文案 -->
              <template v-else>
                <span>签收立即返</span>
              </template>
            </span>
          </div>
        </template>
        <template #extra v-if="nightPickupFeeTips || goodsTimeOptimiTips">
          <!-- 夜间取货费/大票货 提示 -->
          <div class="warn-tips">
            <SvgIcon v-if="nightPickupFeeTips" class="warn-tips-icon" name="dollar-reminder-line" :class="iconStyle" />
            <span class="tips-text" :class="nightPickupFeeTips ? 'text' : ''">
              <rich-text :nodes="nightPickupFeeTips || goodsTimeOptimiTips"></rich-text>
            </span>
          </div>
        </template>
      </KyCell>
    </div>
    <BottomPopup v-model:visible="timeVisible" :config="config" v-if="asynrender" />
  </div>
</template>

<script setup lang="ts">
import KyCell from '@order-public-sub-public/components/base/ky-cell/index.vue'
import HotZone from '@order-public-sub-public/components/business/hot-zone/index.vue'
import BottomPopup from './components/popup-bottom/index.vue'
import { PickModule, GoodsTimeConfig } from '@order-public-sub-public/types'
import { computed, onMounted } from 'vue'
import { ModuleType, OrderPageType } from '@order-public-sub-public/constants'
import { useModuleHotZone } from './hooks/useModuleHotZone'
import { isReturnSend } from '@order-public-sub-public/components/business/goods-time/hooks/returnWaybill'
import SvgIcon from '@order-public-sub-public/components/ui/svg-icon/index.vue'
import dayjs from 'dayjs'
import { getQueryObject } from '@order-public-sub-public/utils'
import { onExternalExecuteFn } from '@order-public-sub-public/configs/waybillMerge'
import { clk_express_goodstime_v1 } from '@order-public-sub-public/components/business/goods-time/hooks/report'
import {
  timeVisible,
  goodsTime,
  isNowGoodsTime,
  nightPickupFeeTips,
  goodsTimeOptimiTips,
  iconStyle,
} from './hooks/state'
import { openGoodsTime } from './hooks/updateGoodsTime'
import { asynrender } from '@order-public-sub-public/hooks/asynrender'
import { initFinished } from '@order-public-sub-root-pages/order-single/hooks/routerStatus'
import { useStore } from '@order-public-sub-public/store'
const piniaStore = useStore()

const props = defineProps<PickModule<GoodsTimeConfig>>()

useModuleHotZone()
const dynamicConfig = computed(() => {
  return piniaStore.globalData.dynamicConfig('goodsTime') || undefined
})

const isReturnWaybill = computed(() => {
  return piniaStore.root.getOrderPageType === OrderPageType.返程单
})

// 根据动态配置判断显示条件
const timeModeVisible = computed(() => {
  // 特写：批量单条不要显示货好时间
  if (piniaStore.root.getOrderPageType === OrderPageType.批量寄单票) {
    return false
  } else if (dynamicConfig.value) {
    return dynamicConfig.value.visible
  } else {
    return props.visible
  }
})

const filterTime = (time: string) => {
  if (time) {
    return dayjs(time).format('YYYY/MM/DD HH:mm')
  }
  return '请选择'
}

const clickHandel = () => {
  openGoodsTime()
}

const autoOpenGoodsTime = async () => {
  if (!initFinished.value) {
    return
  }
  const query = getQueryObject()
  const { openGoodsTime } = query
  if (openGoodsTime + '' === '1') {
    const initPromise = piniaStore.globalData.initDataPromise
    try {
      await initPromise
    } catch (error) {
      console.log('initPromise error', error)
    }
    clickHandel()
  }
}
onMounted(() => {
  autoOpenGoodsTime()

  // 根据外链Url参数打开指定模块
  onExternalExecuteFn({
    kfUpdateGoodTime: clickHandel,
  })
})
</script>

<style lang="scss">
@import '@order-global-package-order-sub/styles/index.scss';
@import './index.scss';
</style>
