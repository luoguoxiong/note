<template>
  <div
    :class="`detail-address-tips ${moduleStyle ? '' : `${props.type}-detail-address-tips`}`"
    v-if="checkResultListTipsPrompt"
    v-html="checkResultListTipsPrompt"
  ></div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { detailTipsReport } from '../../report'

// 常量枚举（原 @order-public/constants）
const ModuleStyle = {
  '平铺': 'unfold',
  '弹窗': 'popup',
  '跳转': 'page',
} as const
// 原 ModuleType 枚举值（从 @order-public/constants 迁移）
const ModuleType: Record<string, string> = { '寄方信息': 'Sender', '收方信息': 'Receive' }

// 原 ModulePageType.寄方 = 'sender'
const SENDER_PAGE_TYPE = 'sender'
// 原 ModuleTypeObj
const MODULE_TYPE_LABEL: Record<string, string> = { sender: '寄方信息', receiver: '收方信息' }

// 原 Store 逻辑（已注释，因深度耦合 @order-public/store）
// import { useStore } from '@order-public/store'
// const piniaStore = useStore()
// const orderPageType = piniaStore.root.getOrderPageType
// const checkResultList = orderPageType === 'order-batch'
//   ? piniaStore.order.batchCommonWaybill.checkResultList
//   : piniaStore.globalData.checkResultList

const props = defineProps({
  type: {
    type: String,
    default: '',
  },
  moduleStyle: {
    type: String,
    default: '',
  },
})

const checkResultListTipsPrompt = computed(() => {
  if (!props.type) return ''

  let result = ''
  // 原 Store 逻辑已注释
  // const orderPageType = piniaStore.root.getOrderPageType
  // const checkResultList =
  //   orderPageType === OrderPageType['批量寄']
  //     ? piniaStore.order.batchCommonWaybill.checkResultList
  //     : piniaStore.globalData.checkResultList
  // if (checkResultList && checkResultList.length > 0) {
  //   checkResultList.forEach((item) => {
  //     if (item.key === `${props.type}.address` && item.showType === 2) {
  //       result = item.content
  //     }
  //   })
  // }

  // 平铺场景下显示门牌提示
  if (!result && props.moduleStyle === ModuleStyle['平铺']) {
    const moduleName = props.type === SENDER_PAGE_TYPE ? MODULE_TYPE_LABEL.sender : MODULE_TYPE_LABEL.receiver
    // 原 Store 逻辑已注释
    // result = piniaStore.schema.moduleDimensionData(ModuleType[moduleName])?.addressIntegralityTips
    // if (result) {
    //   detailTipsReport(moduleName, result)
    // }
  }
  return result
})
</script>

<style lang="scss">
@import '../../../../../styles/index.scss';
@import './index.scss';
</style>
