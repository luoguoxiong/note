<template>
  <div class="product-info-popup" id="productInfo_productInfo">
    <KyCell
      data-validate="productInfo.productInfo"
      :class="{ 'cell-padding': overweightOrLengthTips, 'goods-type-fee-tips': goodsTypeFeeTips }"
      placeholder="请选择"
      @click="() => handlePopupVisible(true)"
      :border="false"
      :value="cellValue"
      title="货物信息"
    >
      <template #title>
        <div class="font-level3 flex items-center">
          货物信息<img
            class="product-spec-required"
            src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFAAAABQCAMAAAC5zwKfAAAAolBMVEUAAAD/h3H/h3D/h3D/h3L/hXL/h3L/hnT/h3L/iHL94OD/4uL/h3L/iHL/h3L/gGD/h3L/iHL/h3L/h3H/hnD94N/94eD/h3L94uD94eH94uD/h3L94OD/hnP/5OT/gGr/hnH/h3L/h3L/hnH/h3H/hXD/h3L/h3L/h3H/h3L/gHD+4eD+4eD/iHL/hnH/h3L/hnP/hnL/hXH/h3H94uH/h3Ktn1/aAAAANHRSTlMAvyBAn4BfFvnPMgjojsYIb++1Zx369dvZmZWVjCgmDFjz31NGMNethzkQ4MWmfHdQTCzjXNbewAAAArFJREFUWMPtl9l2qjAUhjcKkigzKI51HlunHv73f7WDDDZLoGW1ueS7IQH8zN47KyTU0NDQ0PBFdzTsR3+kPxx1M11vHEli3Et8H9Fg2u3RH+l1p4Po46EZR+9vJIW392gc5y8axD5JxkHUpVE0JWlMoxENY6k0utGQ+lFPnrAX9SmKSB6xrUzo61RBp6OLPVWtJTRh3CuEQFvoncFrCR0GTOy8Z5/XVUILk3ohf3KAf2YdDei8CpUUhjBrmd8LyZ4Ay1QTMFiFEeIV5UVYpLNEGo8KHAvCVoIPo5Wh/yikzzD58RFQq4qiCY9+FpKuXIjmIVw9vxGPBFi0WgHRRokxsBIyWC1sCVWYCG0VGas4IxBRKoX2i/AOnKlUKEi0b4TrpScKdQPhnKgQcn3hAVwQzi2w7UnbBa9FqR+ygokg3AMOBS68MuFKy1GqhXOGxZfQTGeMA9xehLVDvgH6U+gjG9oOK7soNNQcXi1UwZ9VdgArLcgGcIpCV8lZVQrtJS65MPbt9GdmXftXIfvALBOago/agFMQ8naOWinksCgV7gBLF9c94zfTZgGsMyGwT/InPHkK9euh5ggdl+dFgEk5J4oxsM+FnCGsm0N7RjFXBhzoiaHFsZv8nixpJmLCiapa4rR5tP2q1WZrAeKafwJu2TB9jhjvTm0UUcuFpwMDFFE4+1qwL4A7SaaB9sD0kounJpdbaciOAfxbt0ThBsjLHXB/LoQSskeij0t2rVqxO7GOHeakA76QcYNKsDUG9ngr2AN8Wy6cLbFPysLAN62UhYszFVmHgDVL2/Er7FJe5Xb2Tx4E2LGg23DAdZ7dwAK8glAk8BhyjA4VmBnM1EnAxPWnD734vS2yfb3dFkKWvp2TvuGUviWWvmmXfqyQffCRfjSTfXiUfbxtaGhoaHjyH3pRu/OA05k8AAAAAElFTkSuQmCC"
            v-if="orderPageType !== OrderPageType.批量寄"
          />
        </div>
      </template>
      <template #extra>
        <p class="overweight-error-tips" v-if="overweightOrLengthTips">
          <SvgIcon name="dollar-reminder-line" class="tips-icon" />
          {{ overweightOrLengthTips }}
        </p>
        <WarnTips showIcon source="popup" />
      </template>
    </KyCell>
    <BottomPopup
      v-if="asynrender"
      id="product-info-bottom-popup"
      v-model:show="popupVisible"
      class="product-info-bottom-popup-tpl"
      title="货物信息"
      footerText="确定"
      isMinHeight
      :loading="internalState.btnLoading"
      :scrollTop="scrollTop"
      scrollWithAnimation
      scrollAnimationDuration="500"
      @onClose="handleClose"
      @open="onPopupOpen"
      @onConfirm="handleConfirm"
      @closed="closed"
    >
      <div class="product-info-bottom-popup" v-if="loading">
        <template v-for="item in props?.config?.fieldsConfig" :key="item.name">
          <ProductName
            v-if="item.name === 'cargoName'"
            v-bind="item"
            module-style="popup"
            :tip="props?.config.tip"
            v-exposure-report="{
              eventCode: 'other_express_goods_popup_perception_v1',
            }"
          />
        </template>
        <inboundOrderNumber :module-style="'popup'" />
        <template v-for="item in props?.config?.fieldsConfig" :key="item.name">
          <ProductSpecPiece
            v-if="item.name === 'pieceCount'"
            v-bind="item"
            module-style="popup"
            :key="internalState.stepperKey"
          />
          <ProductSpecWeight
            v-if="item.name === 'weightCount'"
            v-bind="item"
            module-style="popup"
            :key="internalState.stepperKey"
          />
          <ProductSpecVolume
            v-if="item.name === 'goodsVolume'"
            v-bind="item"
            module-style="popup"
            :key="internalState.stepperKey"
          />
          <ProductSize
            v-if="item.name === 'goodsSize'"
            v-bind="item"
            module-style="popup"
            :required="item.required"
            :key="internalState.stepperKey"
            :btnLoading="internalState.btnLoading"
            @page-change="onGoodsSizeChange"
            @delete="onDelete"
          />
        </template>
      </div>
    </BottomPopup>
  </div>
</template>

<script setup lang="ts">
import { inject, reactive, computed, onMounted, watch, ref, onBeforeUnmount } from 'vue'
import { useStore } from '@order-public-sub-public/store'
import {
  PickModule,
  ProductInfoConfig,
  ProductInfo,
  ProductInfoDimension,
  GoodsRestrict,
  CheckResponse,
  GoodsSupplement,
} from '@order-public-sub-public/types'
import KyCell from '@order-public-sub-public/components/base/ky-cell/index.vue'
import SvgIcon from '@order-public-sub-public/components/ui/svg-icon/index.vue'
import BottomPopup from '@order-public-sub-public/components/ui/bottom-popup/index.vue'
import ProductName from '../components/product-name/index.vue'
import inboundOrderNumber from '../components/inbound-order-number/index.vue'
import ProductSpecPiece from '../components/product-spec-piece/index.vue'
import ProductSpecWeight from '../components/product-spec-weight/index.vue'
import ProductSpecVolume from '../components/product-spec-volume/index.vue'
import ProductSize from '../components/product-size/index.vue'
import WarnTips from '../components/warn-tips/index.vue'
import { asynrender } from '@order-public-sub-public/hooks/asynrender'
import { ModuleType, OrderPageType, MAX_DELAY_TIME, MIN_DELAY_TIME } from '@order-public-sub-public/constants'
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
} from '../hooks/useState'
import { useUpdateStore } from '../hooks/useModuleStore'
import { useValidate } from '../hooks/useValidate'
import { cloneDeep, debounce, isNull } from 'lodash-es'
import { useModuleHotZone } from '../hooks/useModuleHotZone'
import { usePopupVisible } from '../hooks/useVisible'
import { closeTippy } from '@order-public-sub-public/validate/effect/effectBubble'
import { getVolumeSize, cellValue } from '../utils/index'
import useEffect from '@order-public-sub-public/validate'
import { useValidate as globalUseValidate } from '@order-public-sub-public/hooks/useValidate'
import {
  overLengthAndWeightFee,
  resetOverLengthAndWeightFee,
  useOverLengthAndWeight,
} from '../hooks/useOverLengthAndWeigth'
import { useOverLengthAndWeightRequest } from '../hooks/state'
import { exp_express_single_goods_message_goods_ai_weight_v1 } from '../page/report'
import { goodsTypeBluring } from '@order-public-sub-public/components/business/product-info/components/product-name/state'
import { goodsPopupClosedReport } from '@order-public-sub-public/components/business/product-info/hooks/report'
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

const { useProductInfoValidate } = useValidate()

const { effectBubble } = useEffect()
const { removeValidateKeyByType } = globalUseValidate()

const { popupVisible, setPopupVisible } = usePopupVisible()

const props: PickModule<ProductInfoConfig> | undefined = inject('productInfoProps')

const isShowed = ref(false)
const scrollTop = ref(0)
const loading = ref(false)

interface InternalState {
  stepperKey: number
  btnLoading: boolean
}

const internalState: InternalState = reactive({
  stepperKey: 0,
  btnLoading: false,
})

// 表单初始化默认值
const defaultModuleFormData = computed(() => {
  return piniaStore.order.moduleFormData(ModuleType['货物信息'])
})

const handlePopupVisible = async (visible: boolean) => {
  setPopupVisible(visible)
  if (visible) {
    setTimeout(() => {
      loading.value = true
    }, 100)
  } else {
    setTimeout(() => {
      loading.value = false
    }, 200)
  }
}

const goodsTypeFeeTips = computed(() => {
  const restrictStoreData = piniaStore.globalData.restrictData
  return restrictStoreData?.goodsRestrict?.goodsTypeFeeTips
})

// 货物信息超长、超重给予提示
const overweightOrLengthTips = computed(() => {
  if (piniaStore.globalData.restrictData?.goodsRestrict?.goodsTypeFeeTips) {
    return false
  }
  return overLengthAndWeightFee?.agent?.agentOverTips || ''
})

watch(defaultModuleFormData, () => {
  initStateData()
})

const initStateData = () => {
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
              },
            ],
      ),
    )
    setCount(defaultModuleFormData.value?.count || 0)
    setActualWeight(defaultModuleFormData.value?.actualWeight || 0)
    setMatchList(cloneDeep(defaultModuleFormData.value?.matchList || []))
    setVolumeSize(
      defaultModuleFormData.value?.volumeSize || getVolumeSize(defaultModuleFormData.value?.preWaybillGoodsSizeList),
    )
    setGoodsSupplement(defaultModuleFormData.value?.goodsSupplement || { oldGoods: '', nudedGoods: '' })
  }
}

// 设置体积 只拿一次默认值
const watchVolumSize = watch(defaultModuleFormData, () => {
  if (defaultModuleFormData.value) {
    setVolumeSize(
      defaultModuleFormData.value?.volumeSize || getVolumeSize(defaultModuleFormData.value?.preWaybillGoodsSizeList),
    )
  }
  watchVolumSize()
})

// 切换客户编码后需要执行的逻辑
watch(
  () => piniaStore.globalData.initDataPromise,
  async (promise) => {
    try {
      if (!isNull(promise)) {
        await promise

        if (defaultModuleFormData.value) {
          setVolumeSize(
            defaultModuleFormData.value?.volumeSize ||
              getVolumeSize(defaultModuleFormData.value?.preWaybillGoodsSizeList),
          )
        }
      }
    } catch (error) {
      console.log(error)
    }
  },
)
const aiSizeRecommend = computed(() => {
  return piniaStore.schema.moduleDimensionData(ModuleType['货物信息'])?.aiSizeRecommend || {}
})
const onPopupOpen = async () => {
  console.log('打开货物信息弹窗')

  removeValidateKeyByType('productInfo')
  resetOverLengthAndWeightFee()
  internalState.stepperKey += 1
  initStateData()

  if (defaultModuleFormData.value) {
    setVolumeSize(
      defaultModuleFormData.value?.volumeSize || getVolumeSize(defaultModuleFormData.value?.preWaybillGoodsSizeList),
    )
  }

  await useOverLengthAndWeight(
    count.value,
    actualWeight.value,
    preWaybillGoodsSizeList.value.map((item, index) => ({ ...item, index })),
  )
  const validateElement = document.getElementById('product-info-bottom-popup')?.children?.[1]
  const ishas = preWaybillGoodsSizeList.value.some((v) => v.height && v.length && v.width)
  if (aiSizeRecommend.value.aiSizeTips && validateElement && !ishas && !isShowed.value) {
    setTimeout(async () => {
      try {
        window.$umpOtherReport(
          'EXP',
          {
            eventCode: 'exp_page_express_single_goods_message_goods_ai_size_remind_v1',
            regionCode: 'pop',
          },
          {
            ai_strategy_code: aiSizeRecommend.value.strategyId,
            page_style: '弹框',
          },
        )
        await effectBubble([
          {
            key: 'productInfo.preWaybillGoodsSizeList',
            passed: false,
            content: aiSizeRecommend.value.aiSizeTips,
            bubbleConfig: { placement: 'bottom-start', appendTo: validateElement, offset: [0, 8] },
            extraData: {
              type: 'info',
            },
            closeCallback: (isClosebtn) => {
              isShowed.value = true
              window.$umpOtherReport(
                'CLK',
                {
                  eventCode: 'clk_express_single_goods_message_goods_ai_size_remind_v1',
                  regionCode: 'pop',
                },
                {
                  ai_strategy_code: aiSizeRecommend.value.strategyId,
                  page_style: '弹框',
                  button_name: isClosebtn ? '关闭按钮' : '自动关闭',
                },
              )
            },
          },
        ])
      } catch (error) {
        console.error(error)
      }
    }, 300)
  }
}

const closed = () => {
  goodsPopupClosedReport()
}

onMounted(async () => {
  useModuleHotZone()

  // 兼容批量寄
  const orderPageType = piniaStore.root.getOrderPageType
  if (orderPageType === OrderPageType.批量寄 || orderPageType === OrderPageType.批量寄单票) {
    initStateData()
    // 体积处理
    if (defaultModuleFormData.value) {
      setVolumeSize(
        defaultModuleFormData.value?.volumeSize || getVolumeSize(defaultModuleFormData.value?.preWaybillGoodsSizeList),
      )
    }
  } else {
    initStateData()
  }

  setTimeout(async () => {
    const processPromise = piniaStore.globalData.initDataPromise
    if (processPromise) {
      await processPromise
    }
    if (useOverLengthAndWeightRequest.value) {
      useOverLengthAndWeightRequest.value = false
      await useOverLengthAndWeight(
        count.value,
        actualWeight.value,
        preWaybillGoodsSizeList.value.map((item, index) => ({ ...item, index })),
      )
    }
  })
})

/**
 *  PC小程序场景：货物信息那里blur 有settimeout 200
 *    1.不失焦点击确定，弹窗无法关闭（blur的接口cancel掉了confirm）
 *    2.如果点击确定阻止blur事件，确认事件没有把填的数据带进去
 *  解决方案：PC小程序新增货物名称blur中标识
 * @param val
 */
const handleConfirm = () => {
  const timeoutValue = goodsTypeBluring.value ? 300 : MAX_DELAY_TIME
  setTimeout(async () => {
    try {
      const processPromise = piniaStore.globalData.processPromise
      await processPromise
    } catch (e) {
      console.log('货物信息await processPromise')
    }
    setLinkContentVisible(false)
    // 处理数量未填设置默认值1
    // const originalData = preWaybillGoodsSizeList.value?.map((item) => {
    //   return { ...item, count: Number(item.count) || 1 }
    // })
    // setPreWaybillGoodsSizeList(originalData)
    // 电池包装要做特殊处理
    const originalMatchList = cloneDeep(matchList.value)

    internalState.btnLoading = true

    try {
      const processPromise = piniaStore.globalData.processPromise
      if (processPromise && piniaStore.globalData.processLoading) {
        await processPromise
      }
    } catch (e) {
      console.error(e)
    }
    try {
      closeTippy()
      const tempData = {
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
      }
      const { data } = (await useProductInfoValidate('productInfo')) as { data: CheckResponse }
      if (data?.waybillInfo?.productInfo) {
        tempData.goodsSupplement = (data.waybillInfo.productInfo.goodsSupplement || null) as GoodsSupplement
      }
      // 重新设置matchList
      setMatchList(originalMatchList)

      useUpdateStore(tempData)
      const ishas = preWaybillGoodsSizeList.value.some((v) => v.height && v.length && v.width)
      if (aiSizeRecommend.value.aiSizeTips && ishas) {
        window.$umpOtherReport(
          'CLK',
          {
            eventCode: 'other_express_single_goods_message_goods_ai_size_remind_use_v1',
            regionCode: 'pop',
          },
          {
            ai_strategy_code: aiSizeRecommend.value.strategyId,
            page_style: '弹框',
          },
        )
      }
      handlePopupVisible(false)
    } catch (error) {
      console.error(error)
    } finally {
      internalState.btnLoading = false
    }
  }, timeoutValue)
}

const onDelete = () => {
  // useProductInfoValidate('preWaybillGoodsSizeList')`
}

const onGoodsSizeChange = debounce((value) => {
  if (!value || value < 2) return
  scrollTop.value = 500 + (value || 0) * 60
}, 300)

const aiWeightTips = computed(() => piniaStore.schema.moduleDimensionData(ModuleType['货物信息'])?.aiWeightTips || '')

const strategyId = computed(() => piniaStore.schema.moduleDimensionData(ModuleType['货物信息'])?.strategyId || '')

watch([popupVisible, aiWeightTips], async () => {
  if (popupVisible.value && aiWeightTips.value) {
    let key = 'productInfo.actualWeight'
    const validateElement = document.getElementById('product-info-bottom-popup')?.children?.[1]
    try {
      window.$umpOtherReport('EXP', {
        eventCode: 'exp_ai_weight_v1',
      })
      exp_express_single_goods_message_goods_ai_weight_v1(strategyId.value)
      await effectBubble([
        {
          key: key,
          passed: false,
          content: aiWeightTips.value,
          bubbleConfig: { appendTo: validateElement, offset: [0, 8] },
        },
      ])
    } catch (error) {
      console.error(error)
    }
  }
})

const orderPageType = computed(() => piniaStore.root.getOrderPageType)

const handleClose = async () => {
  handlePopupVisible(false)
  console.log('下单_寄件页_货物信息_弹窗消失')
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
      if (goodsType.value) {
        await useProductInfoValidate('goodsType')
      }
    } catch (error) {
      console.error(error)
    }
  }, MIN_DELAY_TIME)
  initStateData()
  // 主动触发关闭后调用一次超长超重
  await useOverLengthAndWeight(
    defaultModuleFormData.value?.count,
    defaultModuleFormData.value?.actualWeight as number,
    defaultModuleFormData.value?.preWaybillGoodsSizeList?.map((item, index) => ({ ...item, index })),
  )
}

onBeforeUnmount(() => {
  useOverLengthAndWeightRequest.value = true
})
</script>

<style lang="scss">
@import '@order-global-package-order-sub/styles/index.scss';
@import './index.scss';
</style>
