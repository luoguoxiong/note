<template>
  <div
    id="order-page"
    class="page-product-info flex flex-column h-screen dialog_root_product_product_info_page"
    v-exposure-report="{
      eventCode: 'other_express_goods_perception_v1',
    }"
  >
    <ky-navbar :leftArrow="true" title="货物信息" v-if="isWxMiniApp"></ky-navbar>
    <div class="page-product-info-container" id="page-product-info-container">
      <scroll-view
        :scrollWithAnimation="true"
        scrollAnimationDuration="200"
        :scrollTop="productPageScrollTop"
        @scroll="handleScroll"
        :scroll-y="true"
        class="page-product-info-container-scroll-wrap"
        :showScrollbar="false"
      >
        <div class="container-block px-24">
          <template v-for="item in propsData?.fieldsConfig" :key="item.name">
            <ProductName
              v-if="item.name === 'cargoName'"
              v-bind="item"
              :btnLoading="btnLoading"
              module-style="page"
              :tip="propsData.tip"
            />
          </template>
        </div>
        <div class="container-block overflow-hidden page-product-info-block">
          <inboundOrderNumber module-style="page" />
          <template v-for="item in propsData?.fieldsConfig" :key="item.name">
            <ProductSpecPiece
              v-if="item.name === 'pieceCount'"
              v-bind="item"
              module-style="page"
              :editable="item.editable"
            />
            <ProductSpecWeight v-if="item.name === 'weightCount'" v-bind="item" module-style="page" />
            <ProductSpecVolume v-if="item.name === 'goodsVolume'" v-bind="item" module-style="page" />
            <ProductSize
              v-if="item.name === 'goodsSize'"
              v-bind="item"
              module-style="page"
              :required="item.required"
              @page-change="onGoodsSizeChange"
              @delete="onDelete"
            ></ProductSize>
          </template>
        </div>
      </scroll-view>
    </div>
    <div class="page-product-info-bottom-wrapper">
      <div class="page-product-info-bottom" id="order-footer-id">
        <KyButton @click="handleConfirm" :loading="btnLoading" loading-text="确定" />
      </div>
    </div>
    <PageCommon pageValidateName="productInfo" />
  </div>
</template>

<script setup lang="ts">
import { computed, watch, ref, onMounted, onBeforeMount } from 'vue'
import { useStore } from '@order-public-sub-public/store'
import { useRouter, onBeforeRouteLeave } from '@order-public-sub-public/vue-router/index'
import ProductName from '../../components/product-name/index.vue'
import inboundOrderNumber from '../../components/inbound-order-number/index.vue'
import ProductSpecPiece from '../../components/product-spec-piece/index.vue'
import ProductSpecWeight from '../../components/product-spec-weight/index.vue'
import ProductSpecVolume from '../../components/product-spec-volume/index.vue'
import ProductSize from '../../components/product-size/index.vue'
import KyButton from '@order-public-sub-public/components/base/ky-button/index.vue'
import PageCommon from '@order-public-sub-public/components/ui/page-common/index.vue'
import { ProductInfoConfig, ProductInfo, ProductInfoDimension, GoodsRestrict } from '@order-public-sub-public/types'
import { ModuleType, MAX_DELAY_TIME, MIN_DELAY_TIME } from '@order-public-sub-public/constants'
import {
  useGoodsType,
  useProductCode,
  usePreWaybillGoodsSizeList,
  useCount,
  useActualWeight,
  useVolumeSize,
  useMatchList,
  useLinkContentVisible,
  useSupplement,
} from '../../hooks/useState'
import { useUpdateStore } from '../../hooks/useModuleStore'
import { useValidate } from '../../hooks/useValidate'
import { closeTippy } from '@order-public-sub-public/validate/effect/effectBubble'
import useEffect from '@order-public-sub-public/validate'
import { useOverLengthAndWeight } from '../../hooks/useOverLengthAndWeigth'
import { confirmMasker } from '@order-public-sub-public/validate/effect/effectPopup'
import { exp_express_single_goods_message_goods_ai_weight_v1 } from '../report'
import { cloneDeep } from 'lodash-es'
import { goodsTypeBluring } from '@order-public-sub-public/components/business/product-info/components/product-name/state'
import { isWxMiniApp } from '@/public/utils'
import {
  productPageScrollTop,
  useProductPageScroll,
} from '@order-public-sub-public/components/business/product-info/page/hooks/useScroll'
const piniaStore = useStore()

const { goodsType, setGoodsType } = useGoodsType()
const { productCode, setProductCode } = useProductCode()
const { count, setCount } = useCount()
const { actualWeight, setActualWeight } = useActualWeight()
const { volumeSize, setVolumeSize } = useVolumeSize()
const { preWaybillGoodsSizeList, setPreWaybillGoodsSizeList } = usePreWaybillGoodsSizeList()
const { matchList, setMatchList } = useMatchList()
const { goodsSupplement, setGoodsSupplement } = useSupplement()
const { setLinkContentVisible } = useLinkContentVisible()
const { handleScroll } = useProductPageScroll()

const { useProductInfoValidate } = useValidate()

const { effectBubble } = useEffect()

const router = useRouter()

const btnLoading = ref(false)

const propsData = computed(() => piniaStore.schema.moduleConfigData(ModuleType['货物信息']))

const defaultModuleFormData = computed(() => piniaStore.order.moduleFormData(ModuleType['货物信息']))

const initData = () => {
  if (defaultModuleFormData.value) {
    setGoodsType(defaultModuleFormData.value?.goodsType || '')
    setProductCode(defaultModuleFormData.value?.productCode || '')
    setPreWaybillGoodsSizeList(
      cloneDeep(
        defaultModuleFormData.value?.preWaybillGoodsSizeList &&
          defaultModuleFormData.value?.preWaybillGoodsSizeList?.length > 0
          ? defaultModuleFormData.value?.preWaybillGoodsSizeList
          : [
              {
                width: '',
                height: '',
                length: '',
                count: 1,
                singleWeight: '',
              },
            ],
      ),
    )
    setCount(defaultModuleFormData.value?.count || 0)
    setActualWeight(defaultModuleFormData.value?.actualWeight || 0)
    setVolumeSize(defaultModuleFormData.value?.volumeSize || 0)
    setMatchList(defaultModuleFormData.value?.matchList || [])
    setGoodsSupplement(defaultModuleFormData.value?.goodsSupplement || { oldGoods: '', nudedGoods: '' })
  }
}

/**
 *  PC小程序场景：货物信息那里blur 有settimeout 200
 *    1.不失焦点击确定，弹窗无法关闭（blur的接口cancel掉了confirm）
 *    2.如果点击确定阻止blur事件，确认事件没有把填的数据带进去
 *  解决方案：PC小程序新增货物名称blur中标识
 * @param val
 */
const handleConfirm = (val: any) => {
  const timeoutValue = goodsTypeBluring.value ? 300 : MAX_DELAY_TIME
  btnLoading.value = true
  const { unmount } = confirmMasker('page-product-info-container')
  setLinkContentVisible(false)
  setTimeout(async () => {
    try {
      const processPromise = piniaStore.globalData.processPromise
      await processPromise
    } catch (e) {
      console.log('货物信息await processPromise', e)
    }
    try {
      closeTippy()
      try {
        const processPromise = piniaStore.globalData.processPromise
        if (processPromise && piniaStore.globalData.processLoading) {
          await processPromise
        }
      } catch (e) {
        console.error(e)
      }
      await useProductInfoValidate('productInfo')
      useUpdateStore({
        goodsType: goodsType.value,
        goodsSupplement: goodsSupplement.value,
        productCode: productCode.value,
        count: count.value,
        actualWeight: actualWeight.value,
        volumeSize: volumeSize.value,
        preWaybillGoodsSizeList: preWaybillGoodsSizeList.value?.filter(
          (item) => item.width && item.height && item.length && item.count,
        ),
        matchList: matchList.value,
      })
      // window.$umpOtherReport(
      //   'OTHER',
      //   {
      //     eventCode: 'other_express_single_goods_v1',
      //     regionCode: 'send_info',
      //   },
      //   {
      //     fill_goodsname: goodsType.value,
      //     fill_VIPreceiptno: productCode.value,
      //     number_quantity: count.value,
      //     number_weight: actualWeight.value,
      //     number_volume: volumeSize.value,
      //     number_size: preWaybillGoodsSizeList.value
      //       ?.filter((item) => item.width && item.height && item.length && item.count)
      //       .join(','),
      //     request_result: '成功',
      //     failure_reason: '',
      //   }
      // )
      console.log(val)
      router.back()
    } catch (error: any) {
      // window.$umpOtherReport(
      //   'OTHER',
      //   {
      //     eventCode: 'other_express_single_goods_v1',
      //     regionCode: 'send_info',
      //   },
      //   {
      //     fill_goodsname: goodsType.value,
      //     request_result: '失败',
      //     failure_reason: error?.content,
      //   }
      // )
      console.error(error)
    } finally {
      unmount()
      btnLoading.value = false
    }
  }, timeoutValue)
}

const onDelete = () => {
  // useProductInfoValidate('preWaybillGoodsSizeList')
}

const onGoodsSizeChange = () => {
  productPageScrollTop.value = productPageScrollTop.value + 1500
}

const aiWeightTips = computed(() => piniaStore.schema.moduleDimensionData(ModuleType['货物信息'])?.aiWeightTips || '')
const strategyId = computed(() => piniaStore.schema.moduleDimensionData(ModuleType['货物信息'])?.strategyId || '')

onMounted(async () => {
  const { forward } = history?.state || {}
  const isFromSize = forward?.includes('/select-size') || forward?.includes('/history-size')

  if (!isFromSize && !forward?.includes('/air-contraband')) {
    initData()
  }

  // 尺寸页面回来不走重置逻辑
  if (isFromSize) {
    return
  }

  await useOverLengthAndWeight(
    count.value,
    actualWeight.value,
    preWaybillGoodsSizeList.value.map((item, index) => ({ ...item, index })),
  )

  // 进入页面时需要判断是否展示ai提示语
  showAiWeightTips()
})

onBeforeMount(() => {
  productPageScrollTop.value = 0
})

watch(aiWeightTips, () => {
  showAiWeightTips()
})

const showAiWeightTips = async () => {
  if (aiWeightTips.value) {
    let key = 'productInfo.actualWeight'
    try {
      exp_express_single_goods_message_goods_ai_weight_v1(strategyId.value)
      await effectBubble([
        {
          key: key,
          passed: false,
          content: aiWeightTips.value,
          bubbleConfig: { offset: [0, 8] },
        },
      ])
    } catch (error) {
      console.error(error)
    }
  }
}
useUnload(() => {
  setTimeout(async () => {
    setGoodsType(defaultModuleFormData.value?.goodsType || '')
    // 清空包装电池
    const restrictData = piniaStore.globalData.restrictData
    piniaStore.globalData.setRestrictData({
      restrictData: {
        ...restrictData,
        goodsRestrict: { goodsRestrictPropertyList: [] } as unknown as GoodsRestrict,
      },
    })
    try {
      if (defaultModuleFormData.value?.goodsType) {
        await useProductInfoValidate('goodsType')
      }
    } catch (error) {
      console.error(error)
    }
  }, MIN_DELAY_TIME)
  initData()
  window.$umpOtherReport('CLK', { eventCode: 'clk_express_goods_control_v1' }, { button_name: '关闭' })
})
</script>

<style lang="scss">
@import '@order-global-package-order-sub/styles/index.scss';
@import './index.scss';
</style>
