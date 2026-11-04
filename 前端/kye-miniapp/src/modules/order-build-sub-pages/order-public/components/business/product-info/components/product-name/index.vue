<template>
  <div
    v-exposure-report="{
      eventCode: 'exp_express_single_consignment_v1',
    }"
    :class="`product-name product-name-${props?.moduleStyle}`"
    v-if="visible"
  >
    <div class="product-name-title flex items-center space-between">
      <div class="font-level3 flex items-center">
        托寄物<SvgIcon class="product-name-title-required" name="required" v-if="required" />
      </div>
      <div
        v-click-report="{
          eventCode: 'clk_express_goods_desc_v1',
          otherParams: () => {
            return {
              button_name: '危险品/禁寄品说明',
            }
          },
        }"
        class="product-name-title-desc font-level4 color-sub-title flex items-center"
        @click="handleClickTips"
      >
        危险品/禁寄品说明<SvgIcon name="tip-label-color" class="tip-icon" />
      </div>
    </div>
    <div class="product-name-desc font-level4" v-if="tip" v-html="tip"></div>
    <view
      class="product-name-input"
      id="productInfo_goodsType"
      data-validate="productInfo.goodsType"
      @click="handleProductNameInput"
    >
      <div class="product-name-input-content" id="productNameInputContent">
        <KyInput
          dataValidate="productInfo.goodsType"
          :disabled="!editable"
          placeholder="请输入托寄物名称"
          :no-padding="true"
          show-border
          :enableNative="false"
          :enableWxNative="true"
          v-model="goodsType"
          :maxlength="40"
          :inputDebounce="600"
          :show-word-limit="editable"
          :clearable="editable"
          @focus="onFocusGoodsTime"
          @update:model-value="onGoodsTypeChange"
          @blur="handleGoodsTimeBlur"
          @input="handleGoodsInput"
          v-click-report="{
            eventCode: 'clk_express_single_consignment_v1',
            regionCode: 'send_info',
          }"
          v-keyboard
        >
          <template #right>
            <span class="product-name-ext">{{ goodsType.length }}/40</span>
          </template>
        </KyInput>
      </div>
      <div
        v-exposure-report="{
          eventCode: 'exp_express_goods_assoc_v1',
          otherParams: () => {
            return {
              content: goodsType,
            }
          },
        }"
        class="product-name-link-content flex flex-column"
        v-show="linkContentVisible && isInFocus"
      >
        <div class="product-name-link-content-tag">
          <div
            class="product-name-link-name flex items-center space-between"
            v-for="item in internalState.linkGoodsList"
            :key="item.goodsCode"
            v-click-report="{
              eventCode: 'clk_express_goods_assoc_v1',
              otherParams: () => {
                return {
                  goods_name: item.goodsType,
                  goods_nature: item.nature,
                  goods_firstcat: item.firstCategory,
                }
              },
            }"
            @touchstart="() => handleLinkGoods(item.goodsType)"
          >
            <span
              class="font-level3 product-name-link-content-tag-name"
              v-html="highlightText(exceedLetter(item.goodsType, 10), goodsType)"
            ></span>
            <span class="font-level3 color-assist second_category">{{ exceedLetter(item.secondCategory, 7) }} </span>
          </div>
        </div>
        <div
          class="product-name-link-content-close font-level3 flex items-center justify-center"
          @click="handleCloseLinkGoods"
        >
          关闭
        </div>
      </div>
    </view>
    <SlideTag
      v-if="editable !== false && tagList.length"
      :tag-list="tagList"
      @click="handleTagClick"
      type="productName"
      class="slide-tag"
      :clearable="historyClearable"
      @clear="clearHistory"
      :showScrollBar="isDesktopMiniprogramFlag"
    />
    <!-- 托寄物补充: 裸货,旧货 -->
    <ProductSupplement v-if="goodsType" :goodsSupplement="goodsSupplement" @change="supplementChange" />
    <div v-if="props?.moduleStyle == 'unfold'">
      <WarnTips class="home-warn-tips" showIcon source="unfold" />
    </div>
    <div v-if="restrictData?.tips && restrictData?.tips.length > 0">
      <div :class="['product-info-restric-tips font-level4']" v-for="item in restrictTips" :key="item.type">
        <span class="icon-content" v-if="tipsIconName(item) && productNameTipsLength > 1">
          <SvgIcon :name="tipsIconName(item)" class="tips-icon" />
        </span>
        <span :class="tipsClassName(item)">{{ item.msg }}</span>
      </div>
    </div>
    <div class="product-name-package" v-for="item in restrictData?.goodsRestrictPropertyList" :key="item.code">
      <div :data-validate="`productInfo.${item.code}`" :id="`productInfo_${item.code}`">
        <div class="product-name-package-title font-level4 flex items-center">
          {{ item.name }}<SvgIcon class="product-name-package-title-required" name="required" v-if="item.require" />
        </div>
        <div class="product-name-package-content flex space-around">
          <div
            :class="`product-name-package-content-tag font-level4 ${
              radioChecked(item.code) === subItem.code ? 'product-name-package-selected' : ''
            } ${item?.subPropertyList?.length >= 3 ? 'min-width-tag' : 'auto-width-tag'}`"
            v-for="subItem in item.subPropertyList"
            :key="subItem.code"
            @click="() => handleMatchListClick(item.code, subItem.code)"
          >
            <div class="flex items-center">
              <div class="product-name-package-radio pl-16">
                <SvgIcon name="radio-checked" v-if="radioChecked(item.code) === subItem.code"></SvgIcon>
                <SvgIcon name="radio-unchecked" v-else></SvgIcon>
              </div>
              <div
                :class="`pl-8 ${radioChecked(item.code) === subItem.code ? 'radio-checked-text' : 'color-sub-title'}`"
              >
                {{ subItem.name }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, watch, ref, onUnmounted } from 'vue'
import {
  MatchItem,
  ProductInfoDimension,
  GoodsRestrict,
  ErrorType,
  GoodsSupplement,
} from '@order-public-sub-public/types'
import SlideTag from '@order-public-sub-public/components/ui/slide-tag/index.vue'
import { SlideTagDetail } from '@order-public-sub-public/components/ui/slide-tag/types'
import SvgIcon from '@order-public-sub-public/components/ui/svg-icon/index.vue'
import KyInput from '@order-public-sub-public/components/base/ky-input'
import { LinkGoods } from '@order-public-sub-public/apis/product-info/types'
import { SubComponentsProps } from '@order-public-sub-public/components/business/product-info/types'
import { ModuleType, MAX_DEBOUNCE_TIME, MIN_DELAY_TIME, ProductInfoTips } from '@order-public-sub-public/constants'
import { useGoodsType, useMatchList, useLinkContentVisible, useSupplement } from '../../hooks/useState'
import { debounce } from 'lodash-es'
import { getLinkGoods, deleteHistoryGoods } from '@order-public-sub-public/apis/product-info/index'
import { useValidate } from '../../hooks/useValidate'
import { showToast } from '@order-public-sub-public/hooks/useShowToast'
import { closeTippy, resetErrorClassByDom } from '@order-public-sub-public/validate/effect/effectBubble'
import vKeyboard from '@order-public-sub-public/directives/keyboard'
import highlightText from '@order-public-sub-public/utils/highlightText'
import WarnTips from '../warn-tips/index.vue'
import { useRouter } from '@order-public-sub-public/vue-router/index'
import { isDesktopMiniprogram } from '@order-public-sub-public/utils/native'
import { goodsTypeBluring } from './state'
import ProductSupplement from '../product-supplement/index.vue'
import { taroAutoScrollToPosition } from '@order-public-sub-public/validate/utils'
import { useValidate as globalUseValidate } from '@order-public-sub-public/hooks/useValidate'
import { getEnvConfig } from '@/public/config'
import { useStore } from '@order-public-sub-public/store'
const piniaStore = useStore()

type ProductNameProps = SubComponentsProps & {
  tip: string | undefined
  btnLoading?: boolean | undefined
}

const inputBlurTimer = ref<null | number>(null)
const props = defineProps<ProductNameProps>()
const isInFocus = ref(false)

const router = useRouter()

const { goodsType, originGoodsType, setGoodsType } = useGoodsType()
const { goodsSupplement, setGoodsSupplement } = useSupplement()
const { matchList, setMatchList } = useMatchList()
const { linkContentVisible, setLinkContentVisible } = useLinkContentVisible()
const { removeValidateKey } = globalUseValidate()

const { useProductInfoValidate } = useValidate()

const radioChecked = (code: string) => {
  let result = ''
  matchList.value?.forEach((item: MatchItem) => {
    if (item.code === code) {
      result = item.value
    }
  })
  return result
}

const emit = defineEmits(['change', 'matchListChange', 'setGoodsSupplementChange'])

const restrictTips = computed(() => {
  return restrictData.value?.tips?.filter((v) => v.type !== '40')
})

const restrictData = computed(() => {
  const restrictStoreData = piniaStore.globalData.restrictData
  return restrictStoreData?.goodsRestrict
})

const goodsTypeFeeTips = computed(() => {
  const restrictStoreData = piniaStore.globalData.restrictData
  return restrictStoreData?.goodsRestrict?.goodsTypeFeeTips
})

const productNameTipsLength = computed(() => {
  const feeTipsLength = goodsTypeFeeTips.value ? 1 : 0
  const restrictDataTipsLength = restrictData.value?.tips.length || 0
  return feeTipsLength + restrictDataTipsLength
})

// 判断是否有电池来调整样式
// const isPropertyList = computed(() => {
//   return restrictData.value?.goodsRestrictPropertyList && restrictData.value?.goodsRestrictPropertyList.length > 0
// })

interface InternalState {
  linkGoodsList: LinkGoods[]
}

const internalState: InternalState = reactive({
  linkGoodsList: [],
})

// 是否展示清空历史记录按钮
const historyClearable = ref(false)

let blurTimeout: number | null = null

const isDesktopMiniprogramFlag = isDesktopMiniprogram()

const formatterGoodsType = (value: string) => {
  let str = value
  str = str.replace(/[\r\n]/g, '')
  str = str.replace(/(\ud83c[\udf00-\udfff])|(\ud83d[\udc00-\ude4f\ude80-\udeff])|[\u2600-\u2B55]|/g, '')
  return str.trim()
}

const onGoodsTypeChange = debounce((value: string) => {
  fetchLinkGoods(value)
}, MAX_DEBOUNCE_TIME)

const supplementChange = (val: GoodsSupplement) => {
  setGoodsSupplement({
    ...val,
  })
  useProductInfoValidate('productInfo.goodsSupplement')
  emit('setGoodsSupplementChange', val)
}

const handleTagClick = async (value: string) => {
  setGoodsType(value)
  removeValidateKey('productInfo.goodsType')
  emit('change', value)

  // 清空matchList
  setMatchList([])
  emit('matchListChange', matchList.value)

  // 清空包装电池
  const restrictData = piniaStore.globalData.restrictData
  piniaStore.globalData.setRestrictData({
    restrictData: {
      ...restrictData,
      goodsRestrict: { goodsRestrictPropertyList: [] } as unknown as GoodsRestrict,
    },
  })

  if (props?.moduleStyle !== 'unfold') {
    closeTippy()
    try {
      await useProductInfoValidate('goodsType')
    } catch (error) {
      console.error(error)
    }
  }
  setTimeout(() => {
    removeValidateKey('productInfo.goodsType')
  }, 300)

  // fetchLinkGoods(value)
}

const handleDeleteHistory = async (waybillLogId?: string) => {
  try {
    await deleteHistoryGoods({
      waybillLogId,
    })
    showToast('删除成功')
  } catch (error) {
    console.error(error)
  }
}

const clearHistory = async (item: SlideTagDetail) => {
  const { type, waybillLogId = '' } = item || {}
  if (type === 1 || !waybillLogId) {
    await handleDeleteHistory(waybillLogId)
  }
  // 修改前端緩存的托寄物历史数据
  const goodsInfoList = moduleDimensionData.value?.goodsInfoList || []
  const newGoodsInfoList = waybillLogId ? goodsInfoList.filter((i) => i.waybillLogId !== waybillLogId) : []
  piniaStore.schema.updateModuleDimensionByType({
    type: ModuleType['货物信息'],
    data: { goodsInfoList: newGoodsInfoList },
  })
  const hiddenClear = newGoodsInfoList.filter((i) => i.type === 1)?.length === 0
  if (hiddenClear) {
    // 隐藏清空按钮
    historyClearable.value = false
  }
}

const fetchLinkGoods = async (value: string) => {
  if (value) {
    const { data } = await getLinkGoods({ goodsType: value })
    if (data && data?.length > 0) {
      setLinkContentVisible(true)
      if (props?.moduleStyle === 'unfold') {
        taroAutoScrollToPosition('productNameInputContent')
      }
      internalState.linkGoodsList = data
    } else {
      setLinkContentVisible(false)
      internalState.linkGoodsList = []
    }
  } else {
    // 清空输入框后，清空列表和隐藏浮层
    setLinkContentVisible(false)
    internalState.linkGoodsList = []
  }
}

const handleMatchListClick = (name: string, code: string) => {
  let result: MatchItem[] = []
  const keys = matchList.value.map((item) => item.code)
  if (keys.includes(name)) {
    result = matchList.value.map((item) => {
      if (item.code === name) {
        item.value = code
      }
      return item
    })
  } else {
    result = [...matchList.value, { code: name, value: code }]
  }
  setMatchList(result)

  // 选中电池包装后清除副作用
  setTimeout(() => {
    resetErrorClassByDom([{ key: `productInfo.${name}`, passed: true, content: '' }])
  })

  emit('matchListChange', matchList.value)
}

const moduleDimensionData = computed(() => piniaStore.schema.moduleDimensionData(ModuleType['货物信息']))

const tagList = computed(() => {
  const goodsInfoList = moduleDimensionData.value?.goodsInfoList || []
  let result: SlideTagDetail[] = []
  if (goodsInfoList && goodsInfoList?.length > 0) {
    result = goodsInfoList.map((item) => {
      if (item.type === 1) {
        // 有历史记录则显示清空按钮
        historyClearable.value = true
      }
      return {
        tagName: item.goodsType,
        strategyId: item.strategyId,
        waybillLogId: item.waybillLogId,
        type: item.type,
      }
    })
  }
  return result
})

watch(moduleDimensionData, () => {
  if (moduleDimensionData.value?.matchList && moduleDimensionData.value?.matchList.length > 0) {
    console.log(moduleDimensionData.value?.matchList)
    setMatchList(moduleDimensionData.value?.matchList)
    emit('matchListChange', matchList.value)
  }
})

const handleLinkGoods = (value: string) => {
  setGoodsType(value)
  emit('change', value)
  handleCloseLinkGoods()
  useProductInfoValidate('goodsType')
}

const handleCloseLinkGoods = () => {
  setLinkContentVisible(false)
}

const onGoodsTypeBlur = () => {
  console.log('onGoodsTypeBlur', originGoodsType.value, goodsType.value, !isDesktopMiniprogramFlag)

  // 没变失焦也不调接口
  if (originGoodsType.value === goodsType.value && !isDesktopMiniprogramFlag) {
    return
  }

  setGoodsType(goodsType.value)

  emit('change', goodsType.value)

  // 清空matchList
  setMatchList([])
  emit('matchListChange', matchList.value)
  // 清空包装电池
  const restrictData = piniaStore.globalData.restrictData
  piniaStore.globalData.setRestrictData({
    restrictData: {
      ...restrictData,
      goodsRestrict: { goodsRestrictPropertyList: [] } as unknown as GoodsRestrict,
    },
  })

  inputBlurTimer.value = setTimeout(async () => {
    isInFocus.value = false
    handleCloseLinkGoods()
    if (props?.moduleStyle !== 'unfold') {
      closeTippy()
      try {
        await useProductInfoValidate('goodsType')
      } catch (error) {
        console.error(error)
      }
    }
  }, MIN_DELAY_TIME)
}

const onFocusGoodsTime = () => {
  if (blurTimeout) {
    clearTimeout(blurTimeout)
    blurTimeout = null
  }
  isInFocus.value = true
}

const handleGoodsTimeBlur = () => {
  // 只有电脑小程序才需要延迟处理blur，正常不需要；一个字的时候也需要延迟blur
  if (!isDesktopMiniprogramFlag && goodsType.value && goodsType.value?.length > 1) {
    onGoodsTypeBlur()
  } else {
    goodsTypeBluring.value = true
    blurTimeout = setTimeout(() => {
      try {
        onGoodsTypeBlur()
      } finally {
        goodsTypeBluring.value = false
      }
    }, 150)
  }
  window.$umpOtherReport(
    'OTHER',
    { eventCode: 'other_express_single_consignment_v1' },
    { request_result: '', failure_reason: '' },
  )
}

const { platformInputDebounceTime } = getEnvConfig()
const handleGoodsInput = (value) => {
  _onFormatter(value)
}
/* 格式化数据 */
const _onFormatter = debounce((value) => {
  if (formatterGoodsType) {
    setGoodsType(formatterGoodsType(value), true)
  }
}, platformInputDebounceTime)

const handleProductNameInput = () => {
  if (!props.editable) {
    showToast('托寄物不可编辑')
  }
}

const exceedLetter = (item: string, number = 4) => {
  if (item?.length > number) {
    return item.substring(0, number) + '...'
  }
  return item
}

const handleClickTips = () => {
  router.push({
    path: '/air-contraband',
    query: {
      type: 'consignment',
    },
  })
}

/**
 * @description: 根据类型 变更svg
 */
const tipsIconName = (item: ErrorType) => {
  if (ProductInfoTips.未匹配 === item.type) {
    return ''
  }
  return 'tip-message-warn'
}
/**
 * @description: 根据类型 变更color
 */
const tipsClassName = (item: ErrorType) => {
  // 这里区分提示类型赋值颜色,目前最新UI要调整为一致,暂时保留该区分入口,一遍后续扩展
  return [ProductInfoTips.不承保, ProductInfoTips.未匹配].includes(item.type) ? 'color-warning' : 'color-warning'
}

// 组件销毁
onUnmounted(() => {
  handleCloseLinkGoods()
  if (inputBlurTimer.value) {
    clearTimeout(inputBlurTimer.value as number)
    inputBlurTimer.value = null
  }
})
</script>

<style lang="scss">
@import '@order-global-package-order-sub/styles/index.scss';
@import './index.scss';
</style>
