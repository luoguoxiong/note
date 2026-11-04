<template>
  <div class="added-service-bottom-fee-popup-wrapper">
    <BottomPopup
      title="增值服务费"
      :zIndex="1002"
      class="added-service-bottom-fee-popup"
      v-model:show="detailPopupVisible"
      footer-text="确定"
      :show-footer="detailPopupVisible"
      @onConfirm="onConfirm"
      @onClose="onClose"
    >
      <template #tips>
        <span class="font-special ml-8 color-assist">({{ addedServiceFee?.addedValueDetailTipList?.length }}项)</span>
      </template>
      <div class="added-service-detail">
        <div
          class="added-service-detail-content"
          v-for="item in addedServiceFee?.addedValueDetailTipList"
          :key="item.sortId"
        >
          <div class="item" no-padding>
            <div class="title">{{ item.feeName }}</div>
            <div class="value">￥{{ handleMoneyAmountShow(item.feeAmount) }}</div>
          </div>
          <div class="desc" v-if="item.feeTips">
            <div class="added-service-detail-dot mr-8"></div>
            <div class="color-assist">{{ item.feeTips }}</div>
          </div>
        </div>
      </div>
      <template #footer>
        <BottomPopupBtn
          v-show="detailPopupVisible"
          :moduleStyle="moduleStyle || ''"
          @click="handleConfirm"
          :bottomPadding="true"
          :button-loading="btnLoading"
          :isUnfold="false"
        />
      </template>
    </BottomPopup>
  </div>
</template>

<script setup lang="ts">
import BottomPopup from '@order-public-sub-public/components/ui/bottom-popup/index.vue'
import BottomPopupBtn from '../bottom-popup-btn/index.vue'
import { useDetailPopupVisible } from '../../hooks/useVisible'
import { addedServiceFee } from '../../hooks/data'
import { useValidate } from '../../hooks/useValidate'
// import { AddedService, AddedServiceDimension, AreaAttributeDimension } from '@order-public-sub-public/types'
// import { ModuleType, AreaAttributeType } from '@order-public-sub-public/constants'
// import { useStore } from '@order-public-sub-public/store'
// import {
//   useReceiptFlag,
//   useReceiptProvider,
//   useReceiptCount,
//   useCollectionAmount,
//   useCollectionFee,
//   useWoodenFrame,
//   useGoodsControl,
// } from '../../hooks/useState'

//
defineProps<{ moduleStyle?: string; btnLoading: boolean }>()

const emit = defineEmits(['confirm'])

const handleConfirm = () => {
  emit('confirm')
}

const { detailPopupVisible, setDetailPopupVisible } = useDetailPopupVisible()

const { useAddedServiceValidate } = useValidate()

// const { setReceiptFlag } = useReceiptFlag()
// const { setReceiptProvider } = useReceiptProvider()
// const { setReceiptCount } = useReceiptCount()
// const { setCollectionAmount } = useCollectionAmount()
// const { setCollectionFee } = useCollectionFee()
// const { setWoodenFrame } = useWoodenFrame()
// const { setGoodsControl } = useGoodsControl()

const handlePopupVisible = (value: boolean) => {
  setDetailPopupVisible(value)
}

const onConfirm = async () => {
  handlePopupVisible(false)

  try {
    await useAddedServiceValidate({ field: 'collectionAmount' })
  } catch (error) {
    console.error(error)
  }
}

const onClose = async () => {
  handlePopupVisible(false)
  // TODO： 费用popup现在是盖在增值服务上面，关闭时不需要再调过程接口，逻辑代码先注释
  // const moduleFormData = piniaStore.order.moduleFormData(ModuleType['增值服务'])

  // const ModuleDimensionData = piniaStore.schema.moduleDimensionData(ModuleType['增值服务'])

  // const areaAttribute = piniaStore.schema.moduleDimensionData(
  //   ModuleType.区域属性
  // )?.feature

  // const hotZoneStore = piniaStore.extend.hotZoneStore

  // if (moduleFormData) {
  //   setReceiptFlag(moduleFormData?.receiptFlag || '')
  //   setReceiptProvider(moduleFormData?.receiptProvider || '')
  //   setReceiptCount(moduleFormData?.receiptCount || 1)
  //   if (areaAttribute === AreaAttributeType['自营区']) {
  //     setCollectionAmount(moduleFormData?.collectionAmount || '')
  //   } else {
  //     if (!hotZoneStore[ModuleType['收方信息']] && moduleFormData?.collectionAmount) {
  //       setCollectionAmount(moduleFormData?.collectionAmount)
  //     } else {
  //       setCollectionAmount('')
  //     }
  //   }
  //   setWoodenFrame(moduleFormData?.woodenFrame || '')
  //   setGoodsControl(moduleFormData?.goodsControl || '')
  // }
  // if (ModuleDimensionData) {
  //   setCollectionFee(ModuleDimensionData?.collectionAmount?.collectionFee)
  // }

  // try {
  //   await useAddedServiceValidate({ field: 'collectionAmount' })
  // } catch (error) {
  //   console.error(error)
  // }
}

const handleMoneyAmountShow = (v: number | undefined) => (v || 0)?.toFixed(2)
</script>

<style lang="scss">
@import '@order-global-package-order-sub/styles/index.scss';
@import './index.scss';
</style>
