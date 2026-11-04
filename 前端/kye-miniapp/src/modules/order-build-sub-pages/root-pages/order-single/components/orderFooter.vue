<template>
  <AuditFooter v-if="isShowAuditFooter" />

  <div
    v-else
    :class="['order-footer', 'order-footer-ref', 'order-submit', footerClasses, iosClasses]"
    :style="footerStyle"
    id="order-footer-id"
  >
    <BatchFeeCard
      v-if="lowestWaybillContent && moduleVisible"
      :content="lowestWaybillContent"
      :key="lowestWaybillContent"
      ref="batchFeeCardRef"
    />
    <div class="flex items-center space-between order-submit-content" ref="footerRef">
      <div class="order-footer-cost">
        <EstimatedCost
          :footerSectionHeight="footerSectionHeight"
          @changeFooterStyle="changeFooterStyle"
          @changeFooterBatchFee="changeFooterBatchFee"
          @changeFooterClass="changeFooterClass"
        ></EstimatedCost>
      </div>
      <KyButton
        v-if="orderPageType === OrderPageType.批量寄单票"
        loading-text="确定"
        text="确定"
        class="button-submit"
        type="primary"
        @click="debounceBatchConfirm"
        :loading="loading"
      ></KyButton>
      <KyButton
        v-else
        :loading-text="confirmText"
        :text="confirmText"
        class="button-submit"
        type="primary"
        @click="debounceSubmit"
        v-click-report="{
          eventCode: enevtCode,
          regionCode: 'footer',
          otherParams: () => {
            return {
              button_name: confirmText,
              inform_type: goodsControlTypeEnum[goodsControl],
            }
          },
        }"
        :loading="btnLoading"
      >
      </KyButton>
      <div class="doubleIntegral" v-if="doubleIntegralFlag"></div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref, computed, CSSProperties, nextTick } from 'vue'
import AuditFooter from './audit-footer/index.vue'
import KyButton from '@order-public-sub-public/components/base/ky-button/index.vue'
import EstimatedCost from '@order-public-sub-public/components/business/estimated-cost/index.vue'
import BatchFeeCard from '@order-public-sub-public/components/business/estimated-cost/components/batch-fee-card/index.vue'
import { useSaveOrder } from '../hooks/useSaveOrder'
import { Channel, OrderPageType } from '@order-public-sub-public/constants'
import { getChannel } from '@order-public-sub-public/configs'
import { isAppiOS } from '@order-public-sub-public/utils/device'
import { goodsControlTypeEnum } from '@order-public-sub-public/components/business/added-service/types'

import { batchSaveLoading } from '../hooks/useBatchSaveOrder'
import { doubleIntegralFlag } from '../hooks/useFooter'
import { debounce, isEmpty } from 'lodash-es'
import { useGoodsControl } from '@order-public-sub-public/components/business/added-service/hooks/useState'
import {
  lowestWaybillContent,
  moduleVisible,
} from '@order-public-sub-public/components/business/estimated-cost/hooks/data'
import { AuditStateMap } from '@order-public-sub-public/types'
import { getTaroDom } from '@order-public-sub-public/utils/common'
import { useStore } from '@order-public-sub-public/store'
const piniaStore = useStore()

const footerStyle = ref({})
const footerClasses = ref({})
const footerRef = ref<HTMLDivElement | null>(null)
const footerSectionHeight = ref(64)

const { goodsControl } = useGoodsControl()
const iosClasses = computed(() => ({ isIos: isAppiOS }))

const changeFooterStyle = (style: CSSProperties) => {
  footerStyle.value = style
}

const changeFooterClass = async (classes: Record<string, any>) => {
  const dom = (await getTaroDom('.order-submit-content')) || {}
  if (dom?.height) {
    footerSectionHeight.value = Math.floor(dom.height)
  }
  if (!isEmpty(footerClasses.value)) {
    footerClasses.value = {
      ...footerClasses.value,
      ...classes,
    }
  } else {
    footerClasses.value = classes
  }
}

const orderPageType = computed(() => piniaStore.root.getOrderPageType)
const enevtCode = computed(() => {
  switch (orderPageType.value) {
    case OrderPageType.单票:
      return 'clk_single_sub_v1'
    case OrderPageType.返程单:
      return 'clk_express_return_msg_v1'
    default:
      return ''
  }
})
const batchWaybillInfoList = computed(() => piniaStore.order.batchWaybillInfoList)
// 按钮文案
const confirmText = computed(() => {
  const channel = getChannel()
  let text: string

  switch (channel) {
    case Channel.修改运单:
      text = '保存'
      break
    case Channel.返程单:
      text = '确定'
      break
    default:
      if (orderPageType.value === OrderPageType.批量寄 && batchWaybillInfoList.value?.length) {
        text = `下单(${batchWaybillInfoList.value.length || 0})`
      } else {
        text = '下单'
      }
      break
  }

  return text
})

const { loading, submit, batchConfirm } = useSaveOrder()

const orderStatusInfo = computed(() => {
  return piniaStore.order.auditFormData
})

const isShowAuditFooter = computed(() => {
  const channel = getChannel()

  // 可下单状态走正常下单逻辑
  if (channel === Channel.调价审核 && AuditStateMap[orderStatusInfo.value.auditState] === '可下单') {
    return false
  }
  return [Channel.运单审核, Channel.调价审核].includes(channel)
})

// 提交防抖
const debounceSubmit = debounce(submit, 350) //因为页面很多地方是300，所以这里大一点
const debounceBatchConfirm = debounce(batchConfirm, 500)

const btnLoading = computed(() => {
  return loading.value
})
const batchFeeCardRef = ref(null) // 最低批次费提示气泡提示ref

const changeFooterBatchFee = (params: Record<string, any>) => {
  nextTick(() => {
    if (params.show) {
      batchFeeCardRef.value && (batchFeeCardRef.value as any).handlerOpen()
    } else {
      batchFeeCardRef.value && (batchFeeCardRef.value as any).handlerHidden()
    }
  })
}
</script>
<style lang="scss">
@import '@order-global-package-order-sub/styles/index.scss';
@import '../index.scss';
// 样式不能放index,因为index有别的地方引用，且没有使用scoped，会有样式污染
.doubleIntegral {
  position: absolute;
  top: 2px;
  right: 4px;
  display: inline-block;
  width: 123.76px;
  height: 41.36px;
  background: url('https://ic-img.ky-express.com/netc/20250619_82152_!!1750300724263_124_42.png') no-repeat;
  background-size: 100%;
  vertical-align: text-bottom;
  transform: translateY(-3px);
}
.order-footer.order-submit {
  background: #fff;
  display: flex;
  flex-direction: column;
  // flex-direction: column;
  padding-left: 0;
  padding-right: 0;
  @include popup-footer-border;

  .order-submit-content {
    background: #fff;
    position: relative;
    min-height: $footer;
    padding-left: 32px;
    padding-right: 32px;
    height: 100%;
  }
  .order-footer-cost {
    padding: 18px 0;
  }
}
</style>
