<template>
  <div class="popup-bottom">
    <BottomPopup :showFooter="false" v-model:show="visible" @onClose="closePopup" :title="config.alias || '货好时间'">
      <slot name="top"></slot>
      <!-- 按线上逻辑 -->
      <OnlineTime
        :goodsTimeConfig="goodsTimeVo.crmGoodsTimeConfig"
        v-if="packageGoodsTimeType === 'online'"
        @selectTime="selectTime"
        @close="close"
      />

      <!-- 自定义时间 -->
      <CustomeTime
        :goodsTimeConfig="goodsTimeVo.erpGoodsTimeConfig"
        @hideTips="hideTips"
        @selectTime="selectTime"
        v-if="packageGoodsTimeType === 'custom'"
        @close="close"
      />
    </BottomPopup>
  </div>
</template>

<script setup lang="ts">
import OnlineTime from './components/online/index.vue'
import CustomeTime from './components/custome/index.vue'
import { useModel, computed, ref } from 'vue'
import BottomPopup from '@order-public-sub-public/components/ui/bottom-popup/index.vue'
import { GoodsTime, GoodsTimeVo } from '@order-public-sub-public/types'
import { GoodsTimeType } from '@order-public-sub-public/constants'
const isHideTips = ref(false)
interface PopupProps {
  visible?: boolean
  config: {
    alias: string
    packageGoodsTimeType: GoodsTimeType
  }
  goodsTimeVo: GoodsTimeVo
}

const hideTips = (val: boolean) => {
  isHideTips.value = val
}

const selectTime = (timeData: { type: string; data: GoodsTime }) => {
  emits('selectTime', timeData)
}

const emits = defineEmits<{
  (event: 'update:visible', visible: boolean): void
  (event: 'selectTime', data: { type: string; data: GoodsTime }): void
}>()

const props = withDefaults(defineProps<PopupProps>(), {
  visible: false,
})

// 货好时间类型  online: 按线上逻辑 | custom: 自定义时间
const packageGoodsTimeType = computed(() => {
  return props.goodsTimeVo.inputMode || props.config.packageGoodsTimeType
})

const visible = useModel(props, 'visible')

const close = () => {
  isHideTips.value = false
  emits('update:visible', false)
}
const closePopup = () => {
  isHideTips.value = false
  emits('update:visible', false)
}
</script>

<style lang="scss" scoped>
@import '@order-global-package-order-sub/styles/index.scss';
@import './index.scss';
</style>
