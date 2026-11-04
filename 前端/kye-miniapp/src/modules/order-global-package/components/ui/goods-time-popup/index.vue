<template>
  <!-- 货好时间选择弹窗 -->
  <BottomPopup
    :showFooter="false"
    class="goods-popup-bottom"
    v-model:show="visible"
    @onClose="visible = false"
    :title="config.alias"
  >
    <!-- 线上时间选择模式 -->
    <OnlineTime
      :goodsTimeConfig="config.crmGoodsTimeConfig"
      :goodsTime="goodsTime"
      :urgentGoods="urgentGoods"
      :selfSignFlag="selfSignFlag"
      :visible="visible"
      v-if="config.inputMode === 'online'"
      @selectTime="selectTime"
      @confirm="emits('confirm')"
      @confirmNow="emits('confirmNow')"
      @close="close"
    />

    <!-- 自定义时间选择模式 -->
    <CustomeTime
      :goodsTimeConfig="config.erpGoodsTimeConfig"
      :goodsTime="goodsTime"
      @hideTips="hideTips"
      @selectTime="selectTime"
      v-if="config.inputMode === 'custom'"
      @confirm="emits('confirm')"
      @confirmNow="emits('confirmNow')"
      @close="close"
    />
  </BottomPopup>
</template>

<script setup lang="ts">
import OnlineTime from './online/index.vue'
import CustomeTime from './custome/index.vue'
import { useModel, ref } from 'vue'
import BottomPopup from '../bottom-popup-ui/index.vue'
import { GoodsTime, GoodsTimeVo } from './goods-time'
import { UrgentGoods } from './goods-time'
import './index.scss'
import Taro from '@tarojs/taro'

/**
 * @description 是否隐藏提示（用于自定义时间模式下无可用时间时的状态管理）
 */
const isHideTips = ref(false)

/**
 * @description 组件属性接口
 */
interface PopupProps {
  visible?: boolean // 弹窗显示状态
  goodsTime?: string // 当前选中的货好时间
  selfSignFlag?: boolean // 是否支持自定义时间（时分秒选择）
  urgentGoods?: UrgentGoods // 是否急件
  config: GoodsTimeVo // 货好时间配置
}

/**
 * @description 隐藏提示回调
 */
const hideTips = (val: boolean) => {
  isHideTips.value = val
}

/**
 * @description 选择时间回调
 * @param timeData 选择的时间数据
 */
const selectTime = (timeData: { type: string; data: GoodsTime }) => {
  emits('selectTime', timeData)
}

/**
 * @description 组件事件定义
 */
const emits = defineEmits<{
  (event: 'update:visible', visible: boolean): void // 更新弹窗显示状态
  (event: 'selectTime', data: { type: string; data: GoodsTime }): void // 选择时间
  (event: 'confirmNow'): void // 更新弹窗显示状态
  (event: 'confirm'): void // 更新弹窗显示状态
}>()

/**
 * @description 组件属性定义及默认值
 */
const props = withDefaults(defineProps<PopupProps>(), {
  visible: false,
})

/**
 * @description 双向绑定visible状态
 */
const visible = useModel(props, 'visible')

/**
 * @description 关闭弹窗（主动关闭）
 */
const close = () => {
  isHideTips.value = false
  emits('update:visible', false)
}

/**
 * @description 关闭弹窗（弹窗外部点击关闭）
 */
const closePopup = () => {
  isHideTips.value = false
  emits('update:visible', false)
}

const showToast = () => {
  Taro.showToast({
    title: '贵司已备好货物的时间，跨越小哥上门后可顺利取货',
    icon: 'none',
  })
}
</script>
