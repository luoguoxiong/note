<template>
  <div
    id="order-page"
    class="custom-encode"
    :class="{ 'mini-isWechat': isWechat }"
    v-exposure-report="{
      eventCode: 'other_express_custom_perception_v1',
    }"
  >
    <scroll-view
      class="encode-cosntent"
      :scrollWithAnimation="true"
      scrollAnimationDuration="200"
      :scroll-y="true"
      :scrollTop="kaCustomerPageScrollTop"
      @scroll="handleScroll"
    >
      <!--      唯品会入库号-->
      <div class="item" v-if="showInboundOrderNumber()">
        <InboundOrderNumber @change="valueChange" :info="showInboundOrderNumber()" />
      </div>
      <div v-if="encodeSelect" class="item item-order">
        <OrderNumber :encodeSelect="encodeSelect" showType="dialog"></OrderNumber>
      </div>
      <div v-for="(item, index) in encodeList" :key="index" class="item">
        <EncodeItem @change="valueChange" :info="item" />
      </div>
    </scroll-view>
    <!--    <div class="encode-cosntent">-->
    <!--      -->
    <!--    </div>-->
    <div class="custom-encode-footer" id="order-footer-id">
      <KyButton
        v-click-report="{
          eventCode: 'clk_express_custom_encode_coding_confirm_v1',
        }"
        style="width: 100%"
        text="确定"
        loading-text="确定"
        :loading="loading"
        @click="onClick"
      />
    </div>
    <PageCommon pageValidateName="kaCustomerMap" />
  </div>
</template>

<script setup lang="ts">
import PageCommon from '@order-public-sub-public/components/ui/page-common/index.vue'
import KyButton from '@order-public-sub-public/components/base/ky-button/index.vue'
import { useStore } from '@order-public-sub-public/store'
import EncodeItem from './components/encode/index.vue'
import OrderNumber from './components/order-number/index.vue'
import InboundOrderNumber from './components/inbound-order-number/index.vue'
import { computed, onBeforeMount, onMounted, ref } from 'vue'
import { debounce } from 'lodash-es'
import { useRouter } from '@order-public-sub-public/vue-router/index'
import { submit } from '@order-public-sub-public/components/business/ka-customer-map/hooks/useConfirm'
import { loading } from '@order-public-sub-public/components/business/ka-customer-map/page/custom-encode/hooks/status'
import { YesOrNoString } from '@order-public-sub-public/constants'
import { kaCustomerMapItem } from '@order-public-sub-public/types'
import {
  kaCustomerPageScrollTop,
  useKaCustomerScroll,
} from '@order-public-sub-public/components/business/ka-customer-map/hooks/useScroll'
import { isWechat } from '@order-public-sub-public/utils'
const piniaStore = useStore()
// import useEffect from '@order-public-sub-public/validate'
// import { kaCustomerMapItem } from '@order-public-sub-public/types'
// const { remoteCheck } = useEffect()

const router = useRouter()

const { handleScroll } = useKaCustomerScroll()

/**
 * @description: 展示PO单号
 */
const encodeSelect = computed(() =>
  piniaStore.extend.kaCustomerMap?.find((x) => x.styleType === '20' && x.kyField === '50'),
)
/**
 * @description: 非PO单号展示（原自定义编码）
 */
const encodeList = computed(() => {
  const list = piniaStore.extend.kaCustomerMap?.filter(
    (x) => !(x.styleType === '20' && x.kyField === '50') && !showInboundOrderNumber(x),
  )
  console.log('encode', list)
  return list
})

//显示唯品会入库号
const showInboundOrderNumber = (item?: kaCustomerMapItem) => {
  const kaCustomerMapList = piniaStore.extend.kaCustomerMap
  const hasShowFun = (item?: kaCustomerMapItem) => {
    const isInboundOrderNumber = item?.kaTypeFlag === YesOrNoString.YES && item?.kyField === '220'
    return isInboundOrderNumber ? item : undefined
  }
  if (item) {
    return hasShowFun(item)
  }
  const list = kaCustomerMapList?.filter((x) => hasShowFun(x))
  return list[0]
}
const firstEnter = ref(1)
onMounted(() => {
  firstEnter.value = 1
})

const onClick = debounce(() => {
  // 更新数据到表单
  submit(async () => {
    try {
      // 解决小程序 多次点击，已经触发了router.back 由于界面卡顿，导致再次触发router.back
      if (firstEnter.value === 1) {
        router.back()
        firstEnter.value = 0
      }
    } catch (error) {
      console.log('error', error)
    } finally {
      loading.value = false
    }
  })
}, 300)

// 根据ID存储数据
const valueChange = (data: { customerFieldValue: string; kyField: string }) => {
  piniaStore.extend.updateKaCustomerById({
    data: {
      customerFieldValue: data.customerFieldValue,
      kyField: data.kyField,
    },
  })
}
onBeforeMount(() => {
  kaCustomerPageScrollTop.value = 0
})
</script>

<style lang="scss">
@import '@order-global-package-order-sub/styles/index.scss';
@import './index.scss';
</style>
