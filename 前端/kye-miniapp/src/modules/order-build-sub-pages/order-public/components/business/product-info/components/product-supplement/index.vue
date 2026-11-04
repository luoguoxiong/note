<template>
  <!-- 托寄物补充-裸货旧货 -->
  <div class="product-supplement-content" v-if="visible">
    <div class="label">托寄物补充<SvgIcon @click="handleTips" name="tip-label-color" class="tip-icon" /></div>
    <div class="select-content">
      <custom-radio
        :checked="goodsSupplement.nudedGoods === GoodsSupplementEnum.选中"
        label="裸货"
        class="radio-item"
        @click="handleRadio($event, 'nudedGoods')"
      ></custom-radio>
      <custom-radio
        :checked="goodsSupplement.oldGoods === GoodsSupplementEnum.选中"
        label="旧货"
        class="radio-item old-goods"
        @click="handleRadio($event, 'oldGoods')"
      ></custom-radio>
    </div>
  </div>
</template>
<script setup lang="ts">
import SvgIcon from '@order-public-sub-public/components/ui/svg-icon/index.vue'
import CustomRadio from './radio/index.vue'
import { GoodsSupplement, GoodsSupplementDimension, GoodsSupplementEnum } from '@order-public-sub-public/types'
import { showKyDialog } from '@order-public-sub-public/validate/effect/effectDialog'
import { tipText } from '../../hooks/state'
import { computed } from 'vue'
import { useStore } from '@order-public-sub-public/store'
const piniaStore = useStore()

import { ModuleType, OrderPageType } from '@order-public-sub-public/constants'
const emits = defineEmits(['change'])
const props = defineProps<{ goodsSupplement: GoodsSupplement; waybillNumber?: string; orderPageType?: OrderPageType }>()

const curWaybillNumber = computed(() => {
  return props?.waybillNumber || undefined
})

const curOrderPageType = computed(() => {
  return props.orderPageType || piniaStore.root.getOrderPageType
})

const moduleDimensionData = computed(() =>
  piniaStore.schema.moduleDimensionData(ModuleType['是否裸货旧货'], curWaybillNumber.value, curOrderPageType.value),
)

const visible = computed(() => {
  return moduleDimensionData.value?.visible
})

const handleRadio = (isChecked: boolean, type: string) => {
  let { oldGoods, nudedGoods } = { ...props.goodsSupplement }
  if (type === 'oldGoods') {
    oldGoods = isChecked ? GoodsSupplementEnum.选中 : GoodsSupplementEnum.未选中
  }
  if (type === 'nudedGoods') {
    nudedGoods = isChecked ? GoodsSupplementEnum.选中 : GoodsSupplementEnum.未选中
  }

  emits('change', {
    oldGoods: oldGoods,
    nudedGoods: nudedGoods,
  })
}

const handleTips = () => {
  showKyDialog({
    zIndex: 1000,
    title: '温馨提示',
    message: tipText,
    confirmButtonText: '我知道了',
    showCancelButton: false,
  })
}
</script>
<style lang="scss">
@import '@order-global-package-order-sub/styles/index.scss';
@import './index.scss';
</style>

<style lang="scss">
@import '@order-global-package-order-sub/styles/index.scss';
.product-supplement-tip-dialog {
  .van-dialog__message {
    white-space: normal;
  }
}
.supplement-tip-item-content {
  display: flex;
  flex-direction: column;
  padding: 0 !important;
  margin: 0 !important;
  .supplement-tip-item-content-item {
    font-size: 28px;
    color: #24262b;
    font-weight: 600;
    padding-left: 30px;
    text-align: left;
    position: relative;
    .number {
      position: absolute;
      left: 0;
    }
    .text {
      font-weight: 400;
      text-align: left;
      color: #686b75;
    }
  }
}
</style>
