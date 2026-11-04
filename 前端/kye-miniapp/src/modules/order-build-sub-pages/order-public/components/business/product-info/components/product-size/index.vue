<template>
  <div
    v-exposure-report="{
      eventCode: 'exp_express_single_consignment_size_v1',
    }"
    class="product-size"
    :class="[`product-size-${moduleStyle}`, { 'product-size-unfold': moduleStyle === 'unfold' }]"
    v-if="visible"
  >
    <div class="product-size-title font-level3 flex items-center space-between">
      <span v-if="moduleStyle !== 'unfold'"
        >尺寸(cm)<SvgIcon class="product-size-title-required" name="required" v-if="required"
      /></span>
      <div v-else></div>
      <template v-if="props.editable">
        <div
          class="history-size-tag flex items-center"
          v-if="isShowHistorySize && !isShowSelectSize"
          @click="handleToSelectSizePage"
          v-exposure-report="{
            eventCode: 'exp_express_goods_hsize_v1',
          }"
        >
          <SvgIcon class="history-size-icon mr-8" name="history-size" />历史尺寸
        </div>
        <div
          class="history-size-tag flex items-center"
          v-if="isShowSelectSize && isShowHistorySize"
          @click="handleToSelectSizePage"
        >
          <SvgIcon class="history-size-icon mr-8" name="history-size" />选择尺寸
        </div>
        <div
          class="history-size-tag flex items-center"
          v-if="isShowSelectSize && !isShowHistorySize"
          @click="handleToSelectSizePage"
        >
          <SvgIcon class="history-size-icon mr-8" name="history-size" />我的尺寸
        </div>
      </template>
    </div>
    <!-- <div class="product-size-desc font-level4 color-warning">
      请您填写尺寸，便于合理安排车辆取货及保证预估运费准确。
    </div> -->
    <div
      class="product-size-input"
      :data-validate="'productInfo.preWaybillGoodsSizeList'"
      id="productInfo_preWaybillGoodsSizeList"
    >
      <div v-for="(item, index) in preWaybillGoodsSizeList" :key="item.id">
        <div class="product-size-input-cell flex radius10">
          <span
            :data-validate="`productInfo.preWaybillGoodsSizeList-length-${index}`"
            :id="`productInfo_preWaybillGoodsSizeList-length-${index}`"
          >
            <KyInput
              :data-validate="`productInfo.preWaybillGoodsSizeList-length-${index}`"
              :class="`text-center ${item.count ? 'color-black' : ''}`"
              placeholder="长"
              :no-padding="true"
              :enableNative="false"
              :always-system="!isAmapApp"
              :adjust-position="false"
              :hold-keyboard="true"
              :inputDebounce="600"
              :disabled="!editable"
              type="digit"
              step="any"
              v-model="item.length"
              :formatter="formatterSize"
              @update="onProductSizeBlur"
              v-click-report="{
                eventCode: 'clk_express_single_consignment_size_v1',
                otherParams: () => ({
                  type: '长',
                }),
              }"
              @blur="requestUseOverLengthAndWeight($event, item.length, '长')"
              v-keyboard
            >
            </KyInput>
          </span>
          <SvgIcon class="product-size-join-icon" name="product-size-join" />
          <span
            :data-validate="`productInfo.preWaybillGoodsSizeList-width-${index}`"
            :id="`productInfo_preWaybillGoodsSizeList-width-${index}`"
          >
            <KyInput
              :data-validate="`productInfo.preWaybillGoodsSizeList-width-${index}`"
              :class="`text-center ${item.count ? 'color-black' : ''}`"
              placeholder="宽"
              :no-padding="true"
              :enableNative="false"
              :always-system="!isAmapApp"
              :adjust-position="false"
              :hold-keyboard="true"
              :disabled="!editable"
              step="any"
              type="digit"
              v-model="item.width"
              :formatter="formatterSize"
              @update="onProductSizeBlur"
              v-click-report="{
                eventCode: 'clk_express_single_consignment_size_v1',
                otherParams: () => ({
                  type: '宽',
                }),
              }"
              @blur="requestUseOverLengthAndWeight($event, item.width, '宽')"
              v-keyboard
            >
            </KyInput>
          </span>
          <SvgIcon class="product-size-join-icon" name="product-size-join" />
          <span
            :data-validate="`productInfo.preWaybillGoodsSizeList-height-${index}`"
            :id="`productInfo_preWaybillGoodsSizeList-height-${index}`"
          >
            <KyInput
              :data-validate="`productInfo.preWaybillGoodsSizeList-height-${index}`"
              :class="`text-center ${item.count ? 'color-black' : ''}`"
              placeholder="高"
              :no-padding="true"
              :enableNative="false"
              :always-system="!isAmapApp"
              :adjust-position="false"
              :hold-keyboard="true"
              :disabled="!editable"
              type="digit"
              step="any"
              v-model="item.height"
              :formatter="formatterSize"
              @update="onProductSizeBlur"
              v-click-report="{
                eventCode: 'clk_express_single_consignment_size_v1',
                otherParams: () => ({
                  type: '高',
                }),
              }"
              @blur="requestUseOverLengthAndWeight($event, item.height, '高')"
              v-keyboard
            >
            </KyInput>
          </span>
          <SvgIcon class="product-size-join-icon" name="product-size-join" v-if="editable" />
          <KyInput
            :class="`text-center ${item.count ? 'color-black' : ''}`"
            placeholder="件数"
            :no-padding="true"
            :enableNative="false"
            :always-system="!isAmapApp"
            :adjust-position="false"
            :hold-keyboard="true"
            :disabled="!editable"
            type="number"
            v-model.number="item.count"
            :maxlength="4"
            :formatter="formatterCount"
            @update="onProductSizeBlur"
            @input="countChange(item, $event)"
            v-click-report="{
              eventCode: 'clk_express_single_consignment_size_v1',
              otherParams: () => ({
                type: '件数',
              }),
            }"
            @blur="countBlur(item)"
            v-keyboard
          >
          </KyInput>
          <SvgIcon class="product-size-join-icon" name="product-size-join" />
          <KyInput
            :class="`text-center ${item.singleWeight ? 'color-black' : ''}`"
            placeholder="重量"
            :no-padding="true"
            :enableNative="false"
            :always-system="!isAmapApp"
            :adjust-position="false"
            :hold-keyboard="true"
            :disabled="!editable"
            type="digit"
            step="any"
            v-model="item.singleWeight"
            :formatter="formatterUnitWeight"
            @blur="unitWeightBlur(item, index)"
            v-click-report="{
              eventCode: 'clk_express_single_consignment_size_v1',
              otherParams: () => ({
                type: '单件重量',
              }),
            }"
            v-keyboard
          >
          </KyInput>
          <div
            class="product-size-sub-btn flex items-center justify-center"
            v-if="editable"
            :class="{ disabled: required && preWaybillGoodsSizeList.length === 1 }"
            @click="() => handleSubGoodsSizeList(index)"
            v-click-report="{
              eventCode: 'clk_consignmet_size_reduce_v1',
            }"
          >
            <SvgIcon
              v-show="required && preWaybillGoodsSizeList.length === 1"
              class="product-size-sub-btn-icon"
              name="del-disabled"
            />
            <SvgIcon
              v-if="!(required && preWaybillGoodsSizeList.length === 1)"
              class="product-size-sub-btn-icon"
              name="minus"
            />
          </div>
        </div>
        <div class="font-level4 over-weight-content">
          <div
            v-if="
              isShowOverLengthTip &&
              overLengthAndWeightFee?.overLengthTip &&
              overLengthAndWeightFee?.overLengthTip.length > 0
            "
          >
            <div
              v-for="(item, secIndex) in overLengthAndWeightFee?.overLengthTip"
              :key="secIndex"
              v-exposure-report="{
                eventCode: 'exp_express_goods_overlength_v1',
                otherParams: () => ({ content: item?.overLengthTips, no: item.index }),
              }"
            >
              <div
                class="flex items-center over-weight-content-tip reminder"
                v-if="Number(item.index) === index && item?.overLengthTips"
              >
                <SvgIcon class="mr-8 reminder__icon" name="dollar-reminder-line" />
                <span class="color-error">{{ item?.overLengthTips }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="product-size-unit-weight-tip font-level4 color-assist">
      长、宽、高单位为 cm；重量请输入单件重量，单位为kg
    </div>
    <div class="product-size-add flex justify-center" v-if="editable">
      <div
        v-click-report="{
          eventCode: 'clk_consignmet_size_add_v1',
        }"
        class="product-size-add-btn font-level4 flex justify-center items-center"
        @click="handleAddGoodsSizeList"
      >
        新增尺寸({{ preWaybillGoodsSizeList?.length }}/{{ maxOfGroup.最大 }})
      </div>
    </div>
    <div class="line"></div>
    <div class="product-size-bottom-desc font-level4 color-assist">
      <text class="product-size-bottom-desc-text"
        >注：重量小体积大时按“体积重量”收费。实际重量、体积以物品包装后收派员测量结果为准。</text
      >
      <span
        v-exposure-report="{
          eventCode: 'exp_express_goods_specsdesc_v1',
        }"
        v-click-report="{
          eventCode: 'clk_express_goods_specsdesc_v1',
        }"
        class="product-size-bottom-desc-btn"
        @click="handleClickTips"
      >
        了解计费规则 >
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, onBeforeUnmount } from 'vue'
import SvgIcon from '@order-public-sub-public/components/ui/svg-icon/index.vue'
import KyInput from '@order-public-sub-public/components/base/ky-input'
import { SubComponentsProps, AgentTipType } from '@order-public-sub-public/components/business/product-info/types'
import { usePreWaybillGoodsSizeList, useCount, useActualWeight, useVolumeSize } from '../../hooks/useState'
import { showToast } from '@order-public-sub-public/hooks/useShowToast'
import { useValidate } from '../../hooks/useValidate'
import { overLengthAndWeightFee, useOverLengthAndWeight } from '../../hooks/useOverLengthAndWeigth'
import { closeTippy, effectBubble } from '@order-public-sub-public/validate/effect/effectBubble'
import { getTotalCount, getListCount, isGoodsSizeEqual, conditionsGoodsSize } from '../../utils/index'
import { GoodsSize, ProductInfoDimension, ProductInfo } from '@order-public-sub-public/types'
import { productCountMax, maxOfGroup, ModuleType } from '@order-public-sub-public/constants'
import { getShowHistorySize, findPageSkuSize } from '@order-public-sub-public/apis/product-info/index'
import { useRouter } from '@order-public-sub-public/vue-router/index'
import { debounce } from 'lodash-es'
import vKeyboard from '@order-public-sub-public/directives/keyboard'
import { sessionStorage } from '@order-public-sub-public/utils/storage'
import { useDidShow } from '@tarojs/taro'
import { routerBackFromSizeType } from '../../hooks/state'
import { isAmapApp } from '@order-public-sub-public/utils'
import { useStore } from '@order-public-sub-public/store'
const piniaStore = useStore()

const props = defineProps<SubComponentsProps & { required: boolean; btnLoading?: boolean }>()

const isShowSelectSize = ref(false)

const isShowHistorySize = ref(false)

const router = useRouter()

// 表单初始化默认值
const defaultModuleFormData = computed(() => {
  return piniaStore.order.moduleFormData(ModuleType['货物信息'])
})

const fetchFindPageSkuSize = async () => {
  const { data } = await findPageSkuSize({ page: 1, pageSize: 10 })
  return data
}

const aiSizeRecommend = computed(() => {
  return piniaStore.schema.moduleDimensionData(ModuleType['货物信息'])?.aiSizeRecommend || {}
})

const fetchShowHistorySize = async () => {
  const { data } = await getShowHistorySize()
  return data
}

onMounted(async () => {
  try {
    Promise.all([fetchFindPageSkuSize(), fetchShowHistorySize()])
      .then((res) => {
        console.log(res)
        const [pageSKuSize, historySize] = res
        if (pageSKuSize && pageSKuSize.rowTotal > 0) {
          isShowSelectSize.value = true
        }
        isShowHistorySize.value = historySize as boolean
      })
      .catch((error) => {
        console.error(error)
      })
  } catch (error) {
    console.error(error)
  }
  const ishas = preWaybillGoodsSizeList.value.some((v) => v.height && v.length && v.width)
  const aiSizeRecommendShowHasChange = sessionStorage.getItem('aiSizeRecommendShow') !== piniaStore.order.waybillNumber
  if (aiSizeRecommend.value.aiSizeTips && props.moduleStyle !== 'popup' && !ishas && aiSizeRecommendShowHasChange) {
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
            page_style: '跳转',
          },
        )
        await effectBubble([
          {
            key: `productInfo.preWaybillGoodsSizeList-length-0`,
            passed: false,
            content: aiSizeRecommend.value.aiSizeTips,
            bubbleConfig: { placement: 'bottom-start', offset: [0, 8] },
            extraData: {
              type: 'info',
            },
            closeCallback: (isClosebtn) => {
              sessionStorage?.setItem('aiSizeRecommendShow', piniaStore.order.waybillNumber)
              if (isClosebtn) {
                window.$umpOtherReport(
                  'CLK',
                  {
                    eventCode: 'clk_express_single_goods_message_goods_ai_size_remind_v1',
                    regionCode: 'pop',
                  },
                  {
                    ai_strategy_code: aiSizeRecommend.value.strategyId,
                    page_style: '跳转',
                    button_name: isClosebtn ? '关闭按钮' : '自动关闭',
                  },
                )
              }
            },
          },
        ])
      } catch (error) {
        console.error(error)
      }
    }, 600)
  }
})

const { useProductInfoValidate } = useValidate()

const emit = defineEmits(['change', 'pageChange', 'delete'])

const { actualWeight, setActualWeight } = useActualWeight()
const { count, setCount } = useCount()
const { preWaybillGoodsSizeList, setPreWaybillGoodsSizeList } = usePreWaybillGoodsSizeList()
const { setVolumeSize, volumeSize } = useVolumeSize()

const isShowOverLengthTip = computed(() => {
  const agentType = overLengthAndWeightFee?.agent?.agentTipType
  if (!agentType) {
    return true
  }
  return agentType === AgentTipType.OVERWEIGHT
})

const handleAddGoodsSizeList = async () => {
  if (preWaybillGoodsSizeList.value?.length >= maxOfGroup.最大) {
    showToast(`最大添加${maxOfGroup.最大}组`)
    return
  }

  if (getListCount.value >= productCountMax.件数) {
    return showToast(`尺寸件数之和不能超过${productCountMax.件数}件`)
  }
  closeTippy()

  const result = [
    ...preWaybillGoodsSizeList.value,
    ...[{ width: '', height: '', length: '', count: 1, singleWeight: '' }],
  ]
  setPreWaybillGoodsSizeList(result)
  emit('change', result)
  // 处理跳页面点击尺寸滑动问题
  // emit('pageChange', preWaybillGoodsSizeList.value?.length)

  // await useProductInfoValidate('preWaybillGoodsSizeList')

  // if (!isGoodsSizeEqual(result)) {
  //   // 计算总体积
  //   sumVolumeSize()
  // }

  //计算数量
  sumCount()

  // 如果尺寸没有一条数据满足 不调用超长超重接口
  // if (conditionsGoodsSize()) {
  //   await useOverLengthAndWeight(
  //     count.value,
  //     actualWeight.value,
  //     preWaybillGoodsSizeList.value.map((item, index) => ({ ...item, index }))
  //   )
  // }
}

const handleSubGoodsSizeList = async (listIndex: number) => {
  if (props.required && preWaybillGoodsSizeList.value.length <= 1) {
    showToast('请完善尺寸')
    return
  }
  const subItemSize = preWaybillGoodsSizeList.value.find((_item, index) => index === listIndex)

  closeTippy()
  const result = preWaybillGoodsSizeList.value?.filter((_item, index) => index !== listIndex) || []
  setPreWaybillGoodsSizeList(result)

  const originalData = overLengthAndWeightFee.overLengthTip?.filter((_item, index) => index !== listIndex)
  overLengthAndWeightFee.overLengthTip = originalData
  emit('change', result)
  // 处理跳页面点击尺寸滑动问题
  emit('pageChange')

  // 计算件数箱数
  sumCount()

  if (result.length) {
    emit('delete')
  }
  // await useProductInfoValidate('preWaybillGoodsSizeList')

  if (subItemSize?.height && subItemSize.length && subItemSize.width && !isGoodsSizeEqual(result)) {
    // 计算总体积
    sumVolumeSize()
  }
  if (result.length === 0) {
    sumVolumeSize(true)
  }

  // 如果尺寸没有一条数据满足 不调用超长超重接口
  if (conditionsGoodsSize()) {
    await useOverLengthAndWeight(
      count.value,
      actualWeight.value,
      preWaybillGoodsSizeList.value.map((item, index) => ({ ...item, index })),
    )
  }
}

const onProductSizeBlur = debounce(async (callBackFun?: () => void) => {
  emit('change', preWaybillGoodsSizeList.value)
  try {
    // 计算总体积（有尺寸变化时）
    if (!isGoodsSizeEqual(preWaybillGoodsSizeList.value)) {
      sumVolumeSize()
    }

    // 计算件数箱数
    sumCount()

    // 回填总重量（单件重量*件数之和 ≥ 总重量时自动回填）
    syncUnitWeightToActualWeight()

    // 回调判断是否为函数
    if (callBackFun && typeof callBackFun === 'function') {
      try {
        callBackFun()
      } catch (error) {
        console.log(error)
      }
    }
  } catch (error) {
    console.error(error)
  }
}, 200)

const requestUseOverLengthAndWeight = (
  _e?: FocusEvent,
  value?: string | number,
  type?: '长' | '宽' | '高' | '件数',
) => {
  setTimeout(async () => {
    overLengthAndWeightFee.billableWeight.grossWeightTips = ''
    if (conditionsGoodsSize()) {
      await useOverLengthAndWeight(
        count.value,
        actualWeight.value,
        preWaybillGoodsSizeList.value.map((item, index) => ({ ...item, index })),
      )
    }
    if (type) {
      window.$umpOtherReport(
        'OTHER',
        { eventCode: 'other_express_single_consignment_size_v1' },
        { number_size: value, type },
      )
    }
  }, 10)
}
const formatterCount = (value: string) => {
  let result = value
  let regex = /^\d+(\.\d{0,1})?$/

  if (!regex.test(value) || Number(value) > 999.9) {
    result = value.slice(0, -1)
  }

  if (!Number(result)) {
    return ''
  }
  return result
}

const formatterSize = (value: string): string => {
  // 1. 如果为空或无效输入，返回空字符串
  if (!value || !value.trim()) {
    return ''
  }

  // 2. 去除首尾空格
  let input = value.trim()

  // 3. 移除非数字和小数点字符
  input = input.replace(/[^\d.]/g, '')

  // 4. 处理多个小数点：只保留第一个
  const dotCount = (input.match(/\./g) || []).length
  if (dotCount > 1) {
    const firstDotIndex = input.indexOf('.')
    input = input.substring(0, firstDotIndex + 1) + input.substring(firstDotIndex + 1).replace(/\./g, '')
  }

  // 新增：处理前导零 —— 开头最多一个0
  // 匹配 "001", "0005", "01.2" 等，但不匹配 "0.5" 或 "0"
  if (/^0+\d/.test(input)) {
    input = input.replace(/^0+(?=\d)/, '') // 去掉多余的前导零
  }

  // 5. 检查是否为有效数字格式（允许整数或一位小数）
  const validNumberPattern = /^\d+(\.\d{0,1})?$/
  if (!validNumberPattern.test(input)) {
    const match = input.match(/^\d+(\.\d{0,1})?/)
    if (match) {
      input = match[0]
    } else {
      return '' // 完全无效
    }
  }

  const num = Number(input)

  // 6. 处理边界：超过 1500 的情况
  if (num > 1500) {
    return '1500'
  }

  // 7. 特殊处理 1500：不能有小数位
  if (num === 1500) {
    return '1500'
  }

  // 8. 对于小于 1500 的数，保留一位小数（如果原来有）
  if (input.includes('.')) {
    const decimalPart = input.split('.')[1]
    if (decimalPart && decimalPart.length > 0) {
      return Number(num.toFixed(1)).toString()
    } else {
      return input // 如 "123." 保留原样
    }
  }

  return input
}

/**
 * @param unSetDefault 不用运单数据设置默认值
 */
const sumVolumeSize = (unSetDefault?: boolean) => {
  if (props.moduleStyle !== 'unfold') {
    const volumeSizeSum =
      preWaybillGoodsSizeList.value.reduce((pre, cur) => {
        pre += (+cur.length * +cur.width * +cur.height * (+cur.count || 1)) / 100 / 100 / 100
        if (Number(pre.toFixed(3)) <= 0) {
          return (pre = 0)
        }
        if (Number(pre) >= 10000) {
          return 9999.999
        }
        return Number(pre.toFixed(3))
      }, 0) || volumeSize.value
    // 如果尺寸列表算出的体积为0，且表格中的体积有值 则填充
    if (volumeSizeSum === 0 && defaultModuleFormData.value?.volumeSize && !unSetDefault) {
      setVolumeSize(defaultModuleFormData.value?.volumeSize)
    } else {
      setVolumeSize(volumeSizeSum)
    }
    emit('change', volumeSizeSum)
  }
}

const sumCount = async () => {
  let totalCount = count.value
  // getTotalCount.value > count.value
  if (props.moduleStyle !== 'unfold' && getTotalCount.value !== count.value && getTotalCount.value) {
    totalCount = getTotalCount.value ?? count.value
    setCount(totalCount)

    try {
      await useProductInfoValidate('count', true)
    } catch (error) {
      console.error(error)
    }

    emit('change', totalCount)
  }
}

const handleClickTips = () => {
  router.push({
    path: '/air-contraband',
    query: {
      type: 'weight-size',
    },
  })
}
//设置件数默认值为1
const countBlur = (item: GoodsSize) => {
  if (!item.count) {
    item.count = 1
  }
  requestUseOverLengthAndWeight(undefined, item.count, '件数')
}

const formatterUnitWeight = (value: string | number): string => {
  try {
    if (!value) return ''
    let str = String(value)
    // 非数字/小数点内容自动转换为空值
    if (!/^[0-9.]*$/.test(str)) {
      return ''
    }
    // 清理：去空格、去非数字字符
    str = str.replace(/\s/g, '').replace(/[^\d.]/g, '')
    if (!str) return ''
    // 只保留第一个小数点
    str = str.replace(/\.+/g, '.').replace(/^(\d+\.?\d*)\.?$/, '$1')
    // 限制最多两位小数
    const dotIndex = str.indexOf('.')
    if (dotIndex !== -1) {
      str = str.slice(0, dotIndex + 3)
    }
    return str
  } catch {
    return String(value)
  }
}

const unitWeightBlur = async (item: GoodsSize, index: number) => {
  // 1. 格式化单件重量
  if (item.singleWeight) {
    item.singleWeight = formatterUnitWeight(item.singleWeight as string)
  }

  // 4. 触发相关更新（回填总重量逻辑已在 onProductSizeBlur 中统一处理）
  onProductSizeBlur()
}

const syncUnitWeightToActualWeight = () => {
  // 条件1：仅计算长宽高完整的行
  const completeSizes = preWaybillGoodsSizeList.value.filter((item) => item.length && item.width && item.height)
  if (completeSizes.length === 0) return

  // 计算长宽高完整的行的 单件重量*件数之和
  const sum = completeSizes.reduce((pre, cur) => {
    const unitW = Number(cur.singleWeight) || 0
    const cnt = Number(cur.count) || 0
    return pre + unitW * cnt
  }, 0)

  // 条件2：单件重量*件数之和 ≥ 总重量才回填
  if (sum > 0 && sum >= actualWeight.value) {
    setActualWeight(Number(sum.toFixed(2)))
  }
}
// const setDefaultValue = (list: GoodsSize[]) => {
//   if (!Array.isArray(list)) {
//     return
//   }
//   list.forEach((i) => {
//     if (!i.count) {
//       i.count = 1
//     }
//   })
// }
//件数最大值限制
const countChange = (item: GoodsSize, e: Event) => {
  if (!e) {
    return
  }
  const { count } = item
  if (getListCount.value > productCountMax.件数) {
    item.count = String(count).slice(0, -1)
    showToast(`尺寸件数之和不能超过${productCountMax.件数}件`)
  }
}

const handleToSelectSizePage = () => {
  const isOnlyHistory = isShowHistorySize.value && !isShowSelectSize.value
  // 提交为loading状态时禁止跳转历史尺寸
  if (props?.btnLoading) return
  router.push({
    path: '/select-size',
    query: {
      isOnlyHistory: isOnlyHistory ? 'true' : '',
    },
  })
}

useDidShow(() => {
  if (['mySize', 'historySize'].includes(routerBackFromSizeType.value || '')) {
    setTimeout(() => {
      // 选中了历史尺寸之后逻辑处理
      onProductSizeBlur(() => {
        requestUseOverLengthAndWeight()
      })
    })
  }
  routerBackFromSizeType.value = undefined
})
// 下单小程序 TODO: 这段会报错TypeError: Cannot set property '__vnode' of null
// const cancelBeforeEach = router.beforeEach((to, from) => {
//   if (from.path === '/history-size' || from.path === '/select-size') {
//     setTimeout(() => {
//       // 选中了历史尺寸之后逻辑处理
//       onProductSizeBlur(() => {
//         requestUseOverLengthAndWeight()
//       })

//       if (to.path === '/product-info') {
//         cancelBeforeEach()
//       }
//     })
//   }
// })

onBeforeUnmount(() => {
  if (props.moduleStyle !== 'page') {
    // cancelBeforeEach()
  } else {
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
          page_style: '跳转',
        },
      )
    }
  }
})
</script>

<style lang="scss">
@import '@order-global-package-order-sub/styles/index.scss';
@import './index.scss';
</style>
