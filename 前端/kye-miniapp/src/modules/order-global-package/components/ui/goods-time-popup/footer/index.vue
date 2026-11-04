<template>
  <!-- 货好时间选择底部操作栏 -->
  <div class="gt-footer">
    <!-- 稍后通知按钮 -->
    <div v-if="isShowNotifyLaterBtn" class="gt-footer__notify" @click="toNotifyLater">
      <SvgIcon class="gt-footer__icon" name="notify-later-people" />
      <span class="gt-footer__text">稍后通知</span>
    </div>

    <!-- 现在货好按钮 -->
    <div v-if="isShowGoodsCurrentTime" class="gt-footer__btn gt-footer__btn--now" @click="confirmNow">
      <template v-if="!isReturnSend">
        <span class="gt-footer__text">现在货好</span>
        <span class="gt-footer__tip">预计1小时内上门取货</span>
      </template>
      <template v-else>
        <span class="gt-footer__text">签收立即返</span>
      </template>
    </div>

    <!-- 确定按钮 -->
    <div class="gt-footer__btn gt-footer__btn--confirm" @click="confirm">确定</div>
  </div>
</template>

<script setup lang="ts">
import type { CrmGoodsTimeConfig, GoodsTimeConfig } from '../goods-time'
import SvgIcon from '../../svg-icon/index.vue'
import './index.scss'
import { clk_express_goods_now_v1, other_express_single_goods_times_v1 } from '../report'
import { computed } from 'vue'

/**
 * @description 组件属性接口
 */
interface PopupProps {
  config: CrmGoodsTimeConfig | GoodsTimeConfig | null // 货好时间配置
  selfSignFlag?: boolean // 是否支持自定义时间
  isReturnSend?: boolean // 是否为返程单
  isShowNotifyLaterBtn?: boolean // 是否显示稍后通知按钮
}

/**
 * @description 组件属性定义及默认值
 */
const props = withDefaults(defineProps<PopupProps>(), {
  selfSignFlag: true,
  isReturnSend: false,
  isShowNotifyLaterBtn: false,
})

/**
 * @description 组件事件定义
 */
const emits = defineEmits<{
  confirm: [] // 确定
  confirmNow: [] // 现在货好
  toNotifyLater: [] // 稍后通知
}>()

/**
 * @description 是否显示现在货好按钮
 */
const isShowGoodsCurrentTime = computed(() => {
  const goodsTimeFlag = props.config?.goodsTimeFlag
  if (typeof goodsTimeFlag === 'boolean') {
    return goodsTimeFlag
  }
  return false
})

/**
 * @description 点击"现在货好"
 */
const confirmNow = () => {
  emits('confirmNow')
  clk_express_goods_now_v1()
}

/**
 * @description 点击"确定"
 */
const confirm = () => {
  other_express_single_goods_times_v1()
  emits('confirm')
}

/**
 * @description 点击"稍后通知"
 */
const toNotifyLater = () => {
  emits('toNotifyLater')
}
</script>
