<template>
  <div class="product-info-unfold" :type="props?.type" :visible="props?.visible">
    <template v-for="item in props?.config?.fieldsConfig" :key="item.name">
      <div class="product-info-unfold-product-name">
        <ProductName
          v-if="item.name === 'cargoName'"
          v-bind="item"
          module-style="unfold"
          :btn-loading="btnLoading"
          :tip="props?.config.tip"
          @setGoodsSupplementChange="(value: GoodsSupplement) => fieldsChange('goodsSupplement', value)"
          @change="(value: string) => fieldsChange('goodsType', value)"
          @match-list-change="(value: MatchItem[]) => fieldsChange('matchList', value)"
        />
      </div>
    </template>

    <div class="product-info-unfold-inbound">
      <inboundOrderNumber :module-style="'unfold'" @change="(value: string) => fieldsChange('productCode', value)" />
    </div>
    <template v-for="item in props?.config?.fieldsConfig" :key="item.name">
      <ProductSpecPiece
        v-if="item.name === 'pieceCount'"
        v-bind="item"
        module-style="unfold"
        @change="(value: number) => fieldsChange('count', value)"
      />
      <ProductSpecWeight
        v-if="item.name === 'weightCount'"
        v-bind="item"
        module-style="unfold"
        @change="(value: number) => fieldsChange('actualWeight', value)"
      />
      <ProductSpecVolume
        v-if="item.name === 'goodsVolume'"
        v-bind="item"
        module-style="unfold"
        @change="(value: number) => fieldsChange('volumeSize', value)"
      />
      <div v-if="item.name === 'goodsSize' && item.visible" id="productInfo_preWaybillGoodsSizeList">
        <div
          class="product-info-unfold-size"
          id="product-info-unfold-size"
          data-validate="productInfo.preWaybillGoodsSizeList"
        >
          <KyCell
            placeholder="请填写"
            :value="cellSizeValue"
            @click="() => handlePopupVisible(true)"
            data-validate="productInfo.preWaybillGoodsSizeList"
          >
            <template #title>
              <div class="font-level3 flex items-center">
                尺寸(cm)<SvgIcon class="product-spec-required" name="required" v-if="item.required" />
              </div>
            </template>
          </KyCell>
        </div>
        <div class="product-info-unfold-size-popup-wrapper">
          <BottomPopup
            class="product-info-unfold-size-popup"
            id="product-info-unfold-size-popup"
            v-model:show="unfoldSizeVisible"
            scrollWithAnimation
            scrollAnimationDuration="500"
            title="尺寸(cm)"
            show-tips
            tipText=""
            tip-icon="desc"
            :loading="btnLoading"
            footerText="确定"
            @on-click-tips="handleClickTips"
            @onClose="onPopupClose"
            @open="onPopupOpen"
            @onConfirm="handleConfirm"
          >
            <ProductSize
              v-if="item.name === 'goodsSize'"
              v-bind="item"
              module-style="unfold"
              :required="item.required"
              :btnLoading="btnLoading"
              @delete="onDelete"
            ></ProductSize
          ></BottomPopup>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { inject, computed, onMounted, watch, ref, onBeforeUnmount, nextTick } from 'vue'
import { useStore } from '@order-public-sub-public/store'
import { useRouter } from '@order-public-sub-public/vue-router/index'
import {
  PickModule,
  ProductInfoConfig,
  ProductInfo,
  GoodsSize,
  MatchItem,
  ProductInfoDimension,
  localCheckResult,
  GoodsSupplement,
} from '@order-public-sub-public/types'
import ProductName from '../components/product-name/index.vue'
import inboundOrderNumber from '../components/inbound-order-number/index.vue'
import ProductSpecPiece from '../components/product-spec-piece/index.vue'
import ProductSpecWeight from '../components/product-spec-weight/index.vue'
import ProductSpecVolume from '../components/product-spec-volume/index.vue'
import ProductSize from '../components/product-size/index.vue'
import { ModuleType, OrderPageType } from '@order-public-sub-public/constants'
import {
  useGoodsType,
  useProductCode,
  usePreWaybillGoodsSizeList,
  useCount,
  useActualWeight,
  useVolumeSize,
  useMatchList,
  useUnfoldSizeVisible,
  useSupplement,
} from '../hooks/useState'
import { useUpdateStore } from '../hooks/useModuleStore'
import BottomPopup from '@order-public-sub-public/components/ui/bottom-popup/index.vue'
import KyCell from '@order-public-sub-public/components/base/ky-cell/index.vue'
import SvgIcon from '@order-public-sub-public/components/ui/svg-icon/index.vue'
import { useValidate, FieldKey } from '../hooks/useValidate'
import { cloneDeep, debounce, isNull } from 'lodash-es'
import { useModuleHotZone } from '../hooks/useModuleHotZone'
import { closeTippy, removeErrClassByDataValidate } from '@order-public-sub-public/validate/effect/effectBubble'
import { getVolumeSize, getTotalCount, isGoodsSizeEqual } from '../utils/index'
import useEffect from '@order-public-sub-public/validate'
import { useOverLengthAndWeight, overLengthAndWeightFee } from '../hooks/useOverLengthAndWeigth'
import { useOverLengthAndWeightRequest } from '../hooks/state'
import { exp_express_single_goods_message_goods_ai_weight_v1 } from '../page/report'
import { sessionStorage } from '@order-public-sub-public/utils/storage'
const piniaStore = useStore()

const { goodsType, setGoodsType } = useGoodsType()
const { goodsSupplement, setGoodsSupplement } = useSupplement()
const { productCode, setProductCode } = useProductCode()
const { count, setCount } = useCount()
const { actualWeight, setActualWeight } = useActualWeight()
const { volumeSize, setVolumeSize } = useVolumeSize()
const { preWaybillGoodsSizeList, setPreWaybillGoodsSizeList } = usePreWaybillGoodsSizeList()
const { matchList, setMatchList } = useMatchList()
const { unfoldSizeVisible, setUnfoldSizeVisible } = useUnfoldSizeVisible()
const props: PickModule<ProductInfoConfig> | undefined = inject('productInfoProps')

const router = useRouter()

const btnLoading = ref(false)

const { useProductInfoValidate } = useValidate()

const { effectBubble, remoteCheck } = useEffect()

onMounted(async () => {
  useModuleHotZone()
  initStateData()
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

// 表单初始化默认值
const defaultModuleFormData = computed(() => piniaStore.order.moduleFormData(ModuleType['货物信息']))
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
    setMatchList(defaultModuleFormData.value?.matchList || [])
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

const fieldsChange = async (name: string, value: string | number | GoodsSize[] | MatchItem[] | GoodsSupplement) => {
  useUpdateStore({ [name]: value })
  if (name === 'matchList') {
    if (props?.moduleStyle === 'unfold') {
      closeTippy()
      await useProductInfoValidate('goodsType')
    }
    return
  }
  setTimeout(async () => {
    try {
      closeTippy()
      await useProductInfoValidate(name as FieldKey)
    } catch (error) {
      console.error(error)
      const { key } = error as localCheckResult
      if (key === 'productInfo.actualWeight' || key === 'productInfo.count' || key === 'productInfo.volumeSize') {
        await remoteCheck(key, {
          productInfo: {
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
          },
        })
      }
    }
  })
}

const handlePopupVisible = (visible: boolean) => {
  setUnfoldSizeVisible(visible)
}

const onPopupOpen = async () => {
  const moduleFormData = piniaStore.order.moduleFormData(ModuleType['货物信息'])
  if (moduleFormData) {
    const deepCloneSizeList = cloneDeep(
      moduleFormData?.preWaybillGoodsSizeList && moduleFormData?.preWaybillGoodsSizeList?.length > 0
        ? moduleFormData?.preWaybillGoodsSizeList
        : [
            {
              width: '',
              height: '',
              length: '',
              count: 1,
            },
          ],
    )
    setPreWaybillGoodsSizeList(deepCloneSizeList)
  }

  overLengthAndWeightFee.overLengthTip = []

  try {
    await useOverLengthAndWeight(
      count.value,
      actualWeight.value,
      preWaybillGoodsSizeList.value.map((item, index) => ({ ...item, index })),
    )
  } catch (error) {
    console.error(error)
  }
}

const handleConfirm = async () => {
  overLengthAndWeightFee.billableWeight.grossWeightTips = ''
  // 处理数量未填设置默认值1
  const originalData = preWaybillGoodsSizeList.value?.map((item) => {
    return { ...item, count: Number(item.count) || 1 }
  })
  setPreWaybillGoodsSizeList(originalData)

  try {
    btnLoading.value = true
    closeTippy()

    if (!isGoodsSizeEqual(originalData)) {
      // 计算总体积
      const volumeSizeTotal = sumVolumeSize()
      setVolumeSize(volumeSizeTotal)
    }

    // 体积标红时需要调用此方法移除标红
    removeErrClassByDataValidate('productInfo.volumeSize')

    // 计算件数
    if (getTotalCount.value !== count.value && getTotalCount.value) {
      setCount(getTotalCount.value)
    }

    await useOverLengthAndWeight(
      count.value,
      actualWeight.value,
      preWaybillGoodsSizeList.value.map((item, index) => ({ ...item, index })),
    )

    await useProductInfoValidate('preWaybillGoodsSizeList')

    useUpdateStore({
      preWaybillGoodsSizeList: preWaybillGoodsSizeList.value?.filter(
        (item) => item.width && item.height && item.length && item.count,
      ),
      volumeSize: volumeSize.value,
      count: count.value,
    })
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
          page_style: '平铺',
        },
      )
    }

    handlePopupVisible(false)
  } catch (error) {
    scrollTop.value = 0
    setTimeout(() => {
      scrollTop.value = 1
    })
    console.error(error)
  } finally {
    btnLoading.value = false
  }
}

const cellSizeValue = computed(() => {
  const moduleFormData = piniaStore.order.moduleFormData(ModuleType['货物信息'])
  const result = moduleFormData?.preWaybillGoodsSizeList?.filter(
    (item) => item.count && item.height && item.length && item.width,
  )
  const length = result?.length || 0
  return length ? `已添加${length.toString()}组尺寸` : ''
})

const handleClickTips = () => {
  router.push({
    path: '/air-contraband',
    query: {
      type: 'weight-size',
    },
  })
}

const aiSizeRecommend = computed(
  () => piniaStore.schema.moduleDimensionData(ModuleType['货物信息'])?.aiSizeRecommend || {},
)

watch(aiSizeRecommend, () => {
  const ishas = preWaybillGoodsSizeList.value.some((v) => v.height && v.length && v.width)
  const aiSizeRecommendShowHasChange = sessionStorage.getItem('aiSizeRecommendShow') !== piniaStore.order.waybillNumber
  if (aiSizeRecommend.value.aiSizeTips && !ishas && aiSizeRecommendShowHasChange) {
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
            page_style: '平铺',
          },
        )
        await effectBubble([
          {
            key: 'productInfo.preWaybillGoodsSizeList',
            passed: false,
            content: aiSizeRecommend.value.aiSizeTips,
            bubbleConfig: { placement: 'top-end', offset: [0, 8] },
            extraData: {
              type: 'info',
            },
            closeCallback: (isClosebtn) => {
              sessionStorage?.setItem('aiSizeRecommendShow', piniaStore.order.waybillNumber)
              window.$umpOtherReport(
                'CLK',
                {
                  eventCode: 'clk_express_single_goods_message_goods_ai_size_remind_v1',
                  regionCode: 'pop',
                },
                {
                  ai_strategy_code: aiSizeRecommend.value.strategyId,
                  page_style: '平铺',
                  button_name: isClosebtn ? '关闭按钮' : '自动关闭',
                },
              )
            },
          },
        ])
      } catch (error) {
        console.error(error)
      }
    }, 1500)
  }
})
const aiWeightTips = computed(() => piniaStore.schema.moduleDimensionData(ModuleType['货物信息'])?.aiWeightTips || '')
const strategyId = computed(() => piniaStore.schema.moduleDimensionData(ModuleType['货物信息'])?.strategyId || '')

const setAiWeightTips = async () => {
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

watch(
  aiWeightTips,
  async () => {
    setAiWeightTips()
  },
  { immediate: true },
)

const onDelete = () => {
  // useProductInfoValidate('preWaybillGoodsSizeList')
}

const onPopupClose = async () => {
  // 防止输入框变红需要删除校验错误类
  closeTippy()
  const domList = Array.from(
    document
      .getElementsByClassName('product-size-unfold')[0]
      .children?.[1]?.getElementsByClassName('product-size-input-cell'),
  )
  domList.forEach((item) => {
    item.classList.remove('validate-error')
  })
  handlePopupVisible(false)
}

const sumVolumeSize = () => {
  const volumeSizeTotal = preWaybillGoodsSizeList.value.reduce((pre, cur) => {
    pre += (+cur.length * +cur.width * +cur.height * (+cur.count || 1)) / 100 / 100 / 100
    if (Number(pre.toFixed(3)) <= 0) {
      return (pre = 0)
    }
    if (Number(pre) >= 10000) {
      return 9999.999
    }
    return Number(pre.toFixed(3))
  }, 0)
  return volumeSizeTotal
}

onBeforeUnmount(() => {
  useOverLengthAndWeightRequest.value = true
})
</script>

<style lang="scss">
@import '@order-global-package-order-sub/styles/index.scss';
@import './index.scss';
</style>
