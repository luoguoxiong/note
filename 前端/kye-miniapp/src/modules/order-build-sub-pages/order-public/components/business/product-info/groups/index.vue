<template>
  <div
    class="product-info-groups"
    data-validate="productInfo.productInfo"
    id="productInfo_productInfo"
    :type="type"
    :visbile="visible"
  >
    <KyCell
      :class="{ 'cell-padding': overweightOrLengthTips, 'goods-type-fee-tips': goodsTypeFeeTips }"
      placeholder="请选择"
      @click="handlePopupShow"
      no-padding
      :border="false"
      :value="cellValue"
    >
      <template #title>
        <div class="font-level3 flex items-center">
          货物信息<SvgIcon class="product-spec-required" name="required" />
        </div>
      </template>
      <template #extra>
        <p class="overweight-error-tips" v-if="overweightOrLengthTips">
          {{ overweightOrLengthTips }}
        </p>
        <WarnTips showIcon source="page" />
      </template>
    </KyCell>
    <BottomPopup
      lazy-render
      v-model:show="internalState.popupVisible"
      title="货物信息"
      class="product-info-groups-popup-groups"
      no-padding
      isMinHeight
      :style="{ height: '92%' }"
      :showFooter="false"
      @onClose="() => handlePopupVisible(false)"
    >
      <div class="product-info-groups-content" @scroll="handleScroll">
        <div class="product-info-groups-content-search">
          <KySearch
            noPadding
            clearable
            ref="searchRef"
            placeholder="请输入托寄物名称"
            v-model="internalState.keyWord"
            @update:model-value="onKeyWordChange"
          />
        </div>
        <div class="product-info-list-content" @touchstart.passive="onTouchstart">
          <div
            class="product-info-groups-list"
            v-if="internalState.productInfoList && internalState.productInfoList.length > 0"
          >
            <div class="groups-list-item-wrapper" v-for="item in internalState.productInfoList" :key="item.skuId">
              <div
                :class="`groups-list-item ${
                  skuId === item.skuId && !internalState.itemsLoading ? 'selected-item' : ''
                }`"
                @click="() => handleClick(item)"
              >
                <img
                  @click.stop="handleClickTips(item)"
                  v-if="overUtl(item)"
                  :class="{ 'long-size': item.overLengthWeightType === OverLengthWeightType.超长超重 }"
                  class="over-tips"
                  :src="overUtl(item)"
                />
                <div class="groups-list-item-title flex items-center">
                  <span class="font-level3 mr-8" v-html="highlightText(item.goodsType, internalState.keyWord)"></span>
                  <!-- <span class="font-level3 color-assist">{{ item.skuId }}</span> -->
                  <span class="default-tag" v-if="item.isDefault">默认</span>
                </div>
                <div class="groups-list-item-content flex pb-16">
                  <div class="groups-list-item-content-cell cell-left font-special">
                    <span class="font-special color-assist">件数：</span>
                    <span class="font-special">{{ item.count }}件</span>
                  </div>

                  <div class="groups-list-item-content-cell cell-right font-special">
                    <span class="font-special color-assist">体积：</span>
                    <span class="font-special">{{ item.volumeSize || '--' }}m³</span>
                  </div>
                </div>
                <div class="groups-list-item-content flex no-padding">
                  <div class="groups-list-item-content-cell cell-left font-special">
                    <span class="font-special color-assist">重量：</span>
                    <span class="font-special">{{ item.actualWeight }}kg</span>
                  </div>
                  <div class="groups-list-item-content-cell cell-right goods-size font-special">
                    <div class="font-special color-assist goods-size-label">尺寸：</div>
                    <div class="font-special goods-size-detail" v-if="showWaybillGoodsSizes(item)">
                      <span class="">{{ waybillGoodsSizesStr(item.waybillGoodsSizes) }}</span>
                    </div>
                    <span
                      v-if="item.waybillGoodsSizes?.length > 1"
                      class="goods-size-all"
                      @click.stop="() => handleClickAll(item)"
                      >全部 <SvgIcon name="right-arrow-blue" class="right-icon cell-right-arrow" />
                    </span>
                    <span class="font-special" v-if="!showWaybillGoodsSizes">--</span>
                  </div>
                </div>
                <div class="groups-list-item-content flex no-padding padding-top" v-if="goodsExtendsText(item)">
                  <div class="groups-list-item-content-cell cell-left font-special">
                    <span class="font-special color-assist">是否裸货旧货：</span>
                    <span class="font-special">{{ goodsExtendsText(item) }}</span>
                  </div>
                </div>

                <!-- TODO:选中加载样式 -->
              </div>
              <div
                class="groups-list-item-loading flex items-center justify-center"
                v-if="skuId === item.skuId && internalState.itemsLoading"
              >
                <KyLoading text="加载中…"></KyLoading>
              </div>
            </div>
          </div>
          <div v-if="!internalState.loading && internalState.productInfoList.length <= 0">
            <KyEmpty :type="EmptyTypeEnum.SEARCH" :description="internalState.keyWord ? '搜索无结果' : '暂无数据'" />
          </div>
          <div class="groups-list-loading"><KyLoading v-if="internalState.loading" text="加载中…"></KyLoading></div>
        </div>
      </div>
    </BottomPopup>
  </div>
  <div class="product-info-groups-dialog">
    <ky-dialog
      v-model:show="internalState.dialogVisible"
      title="温馨提示"
      :z-index="9999"
      :show-cancel-button="isShowCancelBtn"
      :confirm-button-text="confirmText"
      @confirm="handleDialogConfirm"
    >
      <div>
        <div class="dialog-cell" v-if="overLengthAndWeightFee.overWeightTips">
          <div class="dialog-cell-text">
            <span class="dialog-cell-left-text">
              {{ overLengthAndWeightFee.overLengthTip?.length ? '1.' : '' }}
              {{ overLengthAndWeightFee.goodsWeightDesc }},
            </span>
            <span class="color-error">{{ overLengthAndWeightFee.overWeightTips }}</span>
          </div>
        </div>
        <div class="dialog-cell" v-for="(item, index) in overLengthAndWeightFee.overLengthTip" :key="index">
          <div class="dialog-cell-text">
            <span class="dialog-cell-left-text">
              {{ index + (overLengthAndWeightFee.overWeightTips ? 2 : 1) }}.{{ item.goodsSizeDesc || '' }},
            </span>
            <span class="color-error">{{ item.overLengthTips }}</span>
          </div>
        </div>
      </div>
    </ky-dialog>
  </div>
  <div class="dialog-goods-sizes-item-dialog">
    <ky-dialog
      :z-index="9999"
      v-model:show="showSizesItemDialogVisible"
      title="尺寸(cm)"
      confirm-button-text="我知道了"
      class="dialog-goods-sizes-item-dialog"
      @confirm="handleIKnow"
    >
      <div class="dialog-goods-sizes-item" v-for="(x, i) in curWaybillGoodsSizes" :key="i">
        <span class="dialog-goods-sizes-item-index">0{{ i + 1 }}</span>
        <span class="dialog-goods-sizes-item-value">{{ x.length }}*{{ x.width }}*{{ x.height }}*{{ x.count }}</span>
      </div>
    </ky-dialog>
  </div>
</template>

<script setup lang="ts">
import { reactive, onMounted, computed, watch, ref } from 'vue'
import { showDialog } from '@order-public-sub-public/hooks/useShowToast'
import { useStore } from '@order-public-sub-public/store'
import KyCell from '@order-public-sub-public/components/base/ky-cell/index.vue'
import SvgIcon from '@order-public-sub-public/components/ui/svg-icon/index.vue'
import BottomPopup from '@order-public-sub-public/components/ui/bottom-popup/index.vue'
import KySearch from '@order-public-sub-public/components/base/ky-search/index.vue'
import KyLoading from '@order-public-sub-public/components/base/ky-loading/index.vue'
import { getGoodsInfoList } from '@order-public-sub-public/apis/product-info/index'
import { GoodsInfo, GoodsSize, OverLengthWeightType } from '@order-public-sub-public/apis/product-info/types'
import { debounce, throttle, cloneDeep } from 'lodash-es'
import highlightText from '@order-public-sub-public/utils/highlightText'
import { useUpdateStore } from '../hooks/useModuleStore'
import {
  ProductInfo,
  PickModule,
  ProductInfoConfig,
  GoodsSupplementEnum,
  CheckResponse,
  GoodsSupplement,
} from '@order-public-sub-public/types'
import { ModuleType, EmptyTypeEnum, MAX_DEBOUNCE_TIME, OrderPageType } from '@order-public-sub-public/constants'
import WarnTips from '../components/warn-tips/index.vue'

import {
  useGoodsType,
  useProductCode,
  usePreWaybillGoodsSizeList,
  useCount,
  useActualWeight,
  useVolumeSize,
  useMatchList,
  useSkuId,
  useSupplement,
} from '../hooks/useState'
import { useModuleHotZone } from '../hooks/useModuleHotZone'
// import SkeletonScreen from '../components/skeleton-screen/index.vue'
import KyEmpty from '@order-public-sub-public/components/ui/ky-empty/index.vue'
import { matchList } from '../hooks/state'
import { useValidate } from '../hooks/useValidate'
import { overLengthAndWeightFee, useOverLengthAndWeight } from '../hooks/useOverLengthAndWeigth'
import { closeTippy } from '@order-public-sub-public/validate/effect/effectBubble'
import { cellValue } from '../utils/index'
const piniaStore = useStore()

const overLength = 'https://ic-img.ky-express.com/netc/20250619_46847_!!1750314480609_160_64.png'
const overWeight = 'https://ic-img.ky-express.com/netc/20250619_83186_!!1750314492422_160_64.png'
const overLengthAndWeight = 'https://ic-img.ky-express.com/netc/20250619_472_!!1750314499988_240_64.png'
const { setGoodsType } = useGoodsType()
const { setProductCode } = useProductCode()
const { setCount } = useCount()
const { setActualWeight } = useActualWeight()
const { setVolumeSize } = useVolumeSize()
const { setPreWaybillGoodsSizeList } = usePreWaybillGoodsSizeList()
const { setGoodsSupplement } = useSupplement()
const { setMatchList } = useMatchList()
const { skuId, setSkuId } = useSkuId()

const { useProductInfoValidate } = useValidate()

const showSizesItemDialogVisible = ref(false)
const curWaybillGoodsSizes = ref<GoodsSize[]>([])

enum DialogType {
  '选中' = 1,
  '提示' = 0,
}

const dialogType = ref<DialogType>(DialogType.选中)

const imgMap = {
  [OverLengthWeightType.超长]: overLength,
  [OverLengthWeightType.超重]: overWeight,
  [OverLengthWeightType.超长超重]: overLengthAndWeight,
}

defineProps<PickModule<ProductInfoConfig>>()

const searchRef = ref<InstanceType<typeof KyInput>>()

const onTouchstart = () => {
  if (searchRef.value) {
    // searchRef.value?.$el.querySelector('input').blur()
  }
}
const isShowCancelBtn = computed(() => {
  return dialogType.value === DialogType.选中
})
const confirmText = computed(() => {
  return dialogType.value === DialogType.选中 ? '确定' : '我知道了'
})

interface InternalState {
  keyWord: string
  popupVisible: boolean
  productInfoList: GoodsInfo[]
  loading: boolean
  pageIndex: number
  pageSize: number
  hasMorePage: boolean
  dialogVisible: boolean
  selectedProduct: any
  itemsLoading: boolean
}

const internalState: InternalState = reactive({
  keyWord: '',
  popupVisible: false,
  productInfoList: [],
  loading: false,
  pageIndex: 1,
  pageSize: 20,
  hasMorePage: false,
  dialogVisible: false,
  selectedProduct: {},
  itemsLoading: false,
})
// 表单初始化默认值
const defaultModuleFormData = computed(() => {
  return piniaStore.order.moduleFormData(ModuleType['货物信息'])
})

const goodsTypeFeeTips = computed(() => {
  const restrictStoreData = piniaStore.globalData.restrictData
  return restrictStoreData?.goodsRestrict?.goodsTypeFeeTips
})

onMounted(() => {
  internalState.loading = true

  useModuleHotZone()
  const orderPageType = piniaStore.root.getOrderPageType
  if (orderPageType === OrderPageType.批量寄 || orderPageType === OrderPageType.批量寄单票) {
    initData()
  } else {
    initData()
    setSkuId(defaultModuleFormData.value?.skuId || '')
  }
})

watch(defaultModuleFormData, () => {
  initData()
})

const initData = () => {
  if (defaultModuleFormData.value) {
    setGoodsType(defaultModuleFormData.value?.goodsType)
    setProductCode(defaultModuleFormData.value?.productCode || '')
    setPreWaybillGoodsSizeList(
      cloneDeep(
        defaultModuleFormData.value?.preWaybillGoodsSizeList || [
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
    setVolumeSize(defaultModuleFormData.value?.volumeSize || 0)
    setMatchList(defaultModuleFormData.value?.matchList || [])
    setSkuId(defaultModuleFormData.value?.skuId || '')
  }
}

const handlePopupShow = () => {
  internalState.productInfoList = []
  internalState.keyWord = ''
  internalState.pageIndex = 1
  internalState.loading = true
  fetchGoodsInfoList()
  initData()
  handlePopupVisible(true)
}

const waybillId = computed(() => {
  return piniaStore.order.waybillId
})
const fetchGoodsInfoList = async () => {
  try {
    const { data } = await getGoodsInfoList({
      keyWord: internalState.keyWord,
      pageIndex: internalState.pageIndex,
      pageSize: internalState.pageSize,
      waybillId: waybillId.value,
      skuId: defaultModuleFormData.value?.skuId || undefined,
    })
    internalState.loading = false
    internalState.productInfoList = [...internalState.productInfoList, ...data]
    if (data.length > 0) {
      internalState.hasMorePage = true
      internalState.pageIndex = internalState.pageIndex + 1
    } else {
      internalState.hasMorePage = false
    }
  } catch (error) {
    internalState.loading = false
  }
}

const handleScroll = throttle((e: any) => {
  if (e.target?.scrollHeight - e.target?.scrollTop <= e.target?.clientHeight + 20) {
    if (internalState.hasMorePage) {
      fetchGoodsInfoList()
    }
  }
}, MAX_DEBOUNCE_TIME)

const onKeyWordChange = debounce(() => {
  // internalState.keyWord = value
  internalState.loading = true
  internalState.pageIndex = 1
  internalState.productInfoList = []
  fetchGoodsInfoList()
}, MAX_DEBOUNCE_TIME)

const handlePopupVisible = (visible: boolean) => {
  internalState.popupVisible = visible
}

const handleClickTips = async (item: GoodsInfo, isSelect?: boolean) => {
  if (isSelect) {
    dialogType.value = DialogType.选中
  } else {
    dialogType.value = DialogType.提示
  }

  let showTip = false
  // 超长超重费
  await useOverLengthAndWeight(
    item.count,
    item.actualWeight,
    item.waybillGoodsSizes.map((item, index) => ({ ...item, index })),
  )

  internalState.itemsLoading = false

  // 如果有超长超重就弹窗
  if (
    (overLengthAndWeightFee.overLengthTip && overLengthAndWeightFee.overLengthTip.length > 0) ||
    overLengthAndWeightFee.overWeightTips
  ) {
    internalState.dialogVisible = true
    showTip = true
  }
  return showTip
}

const handleClick = async (item: GoodsInfo) => {
  // 清空超长超重提示
  overLengthAndWeightFee.overLengthTip = []
  overLengthAndWeightFee.overWeightTips = ''

  internalState.itemsLoading = true

  setGoodsType(item.goodsType)
  setPreWaybillGoodsSizeList(item.waybillGoodsSizes)
  setCount(item.count)
  setActualWeight(item.actualWeight)
  setVolumeSize(item.volumeSize)
  setSkuId(item.skuId)
  setGoodsSupplement({ oldGoods: item.goodsExtends?.oldGoods || '', nudedGoods: item.goodsExtends?.nudedGoods || '' })

  const showTip = await handleClickTips(item, true)

  // 如果有超长超重就弹窗
  if (showTip) {
    internalState.selectedProduct = item
  } else {
    handleConfirm(item)
  }
}

const handleDialogConfirm = () => {
  if (dialogType.value === DialogType.提示) {
    return
  }
  handleConfirm(internalState.selectedProduct as GoodsInfo)
}

const handleConfirm = async (item: GoodsInfo) => {
  let tempData = {
    goodsType: item.goodsType,
    count: item.count,
    actualWeight: item.actualWeight as number,
    volumeSize: item.volumeSize,
    preWaybillGoodsSizeList: item.waybillGoodsSizes,
    matchList: matchList.value,
    skuId: item.skuId,
    goodsSupplement: {
      oldGoods: item.goodsExtends?.oldGoods || '',
      nudedGoods: item.goodsExtends?.nudedGoods || '',
    } as GoodsSupplement,
  }
  try {
    internalState.itemsLoading = true
    closeTippy()
    const { data } = (await useProductInfoValidate('productInfo')) as { data: CheckResponse }
    if (data?.waybillInfo?.productInfo) {
      tempData.goodsSupplement = (data.waybillInfo.productInfo.goodsSupplement || null) as GoodsSupplement
    }
  } catch (error) {
    console.error(error)
  } finally {
    useUpdateStore(tempData)
    internalState.itemsLoading = false
    handlePopupVisible(false)
  }
}

// 货物信息超长、超重给予提示
const overweightOrLengthTips = computed(() => {
  if (piniaStore.globalData.restrictData?.goodsRestrict?.goodsTypeFeeTips) {
    return false
  }
  return overLengthAndWeightFee?.agent?.agentOverTips || ''
})

const showWaybillGoodsSizes = (item: GoodsInfo) => {
  return (
    item.waybillGoodsSizes?.[0]?.length || item.waybillGoodsSizes?.[0]?.width || item.waybillGoodsSizes?.[0]?.height
  )
}

const handleIKnow = () => {
  showSizesItemDialogVisible.value = false
}

const handleClickAll = (item: GoodsInfo) => {
  console.log(item)
  curWaybillGoodsSizes.value = item.waybillGoodsSizes
  showSizesItemDialogVisible.value = true

  // let html = '<div>'
  // item.waybillGoodsSizes.forEach((x, i) => {
  //   html += `<div class="dialog-goods-sizes-item">
  //     <span class="dialog-goods-sizes-item-index">0${i + 1}</span>
  //     <span class="dialog-goods-sizes-item-value">${x.length}*${x.width}*${x.height}*${x.count}</span></div>`
  // })
  // html += '</div>'
  // showDialog({
  //   title: '尺寸(cm)',
  //   message: html,
  //   messageAlign: 'left',
  //   confirmButtonText: '我知道了',
  //   className: ['dialog-goods-sizes'],
  //   allowHtml: true,
  // })
}

const waybillGoodsSizesStr = (waybillGoodsSizes: GoodsSize[]) => {
  return waybillGoodsSizes.map((x) => `${x.length}*${x.width}*${x.height}*${x.count}`).join(';')
}

const overUtl = (item: GoodsInfo) => {
  if (item.overLengthWeightType && imgMap[item.overLengthWeightType]) {
    return imgMap[item.overLengthWeightType]
  }

  return ''
}

// 裸货旧货显示文案
const goodsExtendsText = (item: GoodsInfo) => {
  const oldGoodsText = item.goodsExtends?.oldGoods === GoodsSupplementEnum.选中 ? '旧货' : ''
  const nudedGoodsText = item.goodsExtends?.nudedGoods === GoodsSupplementEnum.选中 ? '裸货' : ''
  const spliceText = oldGoodsText && nudedGoodsText ? '，' : ''
  return `${nudedGoodsText}${spliceText}${oldGoodsText}`
}
</script>

<style lang="scss">
@import '@order-global-package-order-sub/styles/index.scss';
@import './index.scss';
</style>

<style lang="scss">
@import '@order-global-package-order-sub/styles/index.scss';
.dialog-goods-sizes {
  .van-dialog__message--has-title {
    padding: 36px 40px 28px;
  }
  &-item {
    display: flex;
    align-items: center;
    background: #f7f8fa;
    border-radius: 8px;
    margin-bottom: 28px;
    height: 52px;
  }
  &-item:last-child {
    margin-bottom: 14px;
  }
  &-item-index {
    display: inline-block;
    width: 36px;
    height: 36px;
    line-height: 36px;
    border-radius: 50%;
    text-align: center;
    background: #888ea6;
    color: #fff;
    font-size: 18px;
    margin: 0 12px 0 16px;
    opacity: 0.5;
  }
  &-item-value {
    font-size: 26px;
    color: #03050d;
  }
}
</style>
