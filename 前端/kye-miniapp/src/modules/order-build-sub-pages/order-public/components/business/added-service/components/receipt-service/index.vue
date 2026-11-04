<!-- 回单服务 -->
<template>
  <div class="receipt-service" v-if="visible">
    <div class="edit-return-waybill" v-if="isEditAndReturnWaybill.key" @click="handleMask"></div>
    <div
      class="font-level3 receipt-service-type-title"
      id="exp_express_receipt_v1"
      :exposure-report="exp_express_receipt_v1()"
    >
      <span v-if="isShowTitle && moduleStyle !== 'unfold'">回单服务</span>
      <span v-else></span>
      <span class="receipt-fee" v-if="receiptFlag && receiptFeeData && receiptFeeData.feeTip">
        <SvgIcon class="mr-4 color-error mt--2" name="dollar-reminder-line" />
        {{ receiptFeeData.feeTip || '' }}
      </span>
    </div>
    <div class="receipt-service-type flex items-center space-between" :class="receiptFlag ? 'pb-24' : ''">
      <template v-for="item in moduleDimensionData?.receiptServiceList" :key="item.type">
        <div class="receipt-service-item-wrap">
          <KyButtonRadio
            :class="[
              'receipt-service-type-tag flex items-center justify-center column font-level3',
              receiptFlag === item.type ? 'tag-selected' : 'tag-not-selected',
              { 'tag-disabled': item.disabled },
              serviceRadioStyle,
            ]"
            :disabled="item.disabled"
            :isChecked="receiptFlag === item.type"
            :disabledIcon="item.disabled"
            needChecked
            plain
            @click="handleReceiptService(item)"
          >
            <template #default>
              <span>{{ item.typeName }}</span>
              <div v-if="item.receiptTypeUrgentState" class="flex items-center fix-top-right">
                <SvgIcon name="urgent-icon-new" class="font-level4" />
              </div>
            </template>
          </KyButtonRadio>
          <div v-if="item.disabled" @click="showToast(item.tipsMsg)" class="receipt-service-item-disabled"></div>
        </div>
      </template>
    </div>
    <div
      class="receipt-service-options font-special"
      v-if="receiptFlag === ReceiptType['ORIGIN'] || receiptFlag === ReceiptType['IMAGE']"
    >
      <div
        class="receipt-service-options-cell flex items-center space-between"
        data-validate="addedService.receiptProvider"
        id="addedService_receiptProvider"
        v-if="receiptProviderList.length > 0"
      >
        <div class="cell-left flex items-center">
          <span>回单提供方</span><SvgIcon class="cell-left-required" name="required" />
          <KyReport eventCode="exp_express_receipt_provider_v1"></KyReport>
        </div>
        <div class="cell-right flex">
          <KyRadio
            class="radio-item"
            :class="{ 'radio-item-two': receiptProviderList.length === 2 }"
            checkedIcon="checked-round"
            :radio-props="receiptProviderList"
            :showCheckErrorTip="showCheckErrorTip"
            size="small"
            v-model="receiptProvider"
            @click="handleRadio"
            @change="handleRadioChange"
            direction="horizontal"
            checkedHighlight
          ></KyRadio>
        </div>
      </div>

      <!-- 上传资料-跨越代打专用 -->
      <div
        class="receipt-service-info kye-pinchhit"
        @click="handleToReceiptResources"
        v-click-report="{
          eventCode: 'clk_express_receipt_v1',
        }"
        v-if="receiptFlag && receiptProvider === ReceiptProviderType['KYEPINCHHIT']"
      >
        <div class="receipt-service-info-cell flex items-center space-between">
          <div class="info-cell-left flex items-center">
            <img :src="uploadFileIcon" class="info-cell-left-icon" />
            <span class="font-special">回单资料</span>
            <SvgIcon class="cell-left-required" name="required" v-if="required" />
          </div>
          <div class="info-cell-right flex items-center" v-if="uploadListLen <= 0" id="addedService_receiptFile">
            <span class="font-special color-assist" id="addedService_receiptProvider">请上传回单文件/图片</span>
            <SvgIcon name="right-arrow" class="ml-8 font-level3" />
          </div>
          <div class="info-cell-right flex items-center" v-else>
            <span class="font-special">已上传{{ uploadListLen }}张</span>
            <SvgIcon name="right-arrow" class="ml-8 font-level3" />
          </div>
        </div>
      </div>
      <div
        class="receipt-service-options-cell flex items-center space-between"
        v-if="receiptProvider !== ReceiptProviderType['KYEPINCHHIT']"
      >
        <div class="cell-left flex items-center">
          <span>回单张数</span><SvgIcon class="cell-left-required" name="required" />
        </div>
        <div class="cell-right">
          <KyStepper
            input-stuffix="张"
            v-model.number="receiptCount"
            type="number"
            :maxlength="3"
            :max="999"
            :min="1"
            :defaultInputValue="1"
            data-validate="addedService.receiptCount"
            id="addedService_receiptCount"
            :focusClearZone="true"
            :formatter="formatter"
            @focus="clk_express_receipt_number_v1()"
            @blur="onReceiptCountChange('blur')"
            @plus="onReceiptCountChange('plus')"
            @minus="onReceiptCountChange('minus')"
          />
        </div>
      </div>

      <div
        class="receipt-service-options-cell"
        v-if="
          moduleDimensionData?.receiptCheckType?.visible &&
          (receiptFlag === ReceiptType['ORIGIN'] || receiptFlag === ReceiptType['IMAGE'])
        "
        id="exp_express_single_receipt_requirement_v1"
        :exposure-report="exp_express_single_receipt_requirement_v1(orderPageTypeName)"
      >
        <div class="flex items-center space-between">
          <div class="cell-left flex items-center">
            <span>回单要求</span>
          </div>
          <div class="cell-right flex">
            <div
              v-if="moduleDimensionData.receiptCheckType?.receiptCheckTipsType === ReceiptCheckTipsType.不可选"
              class="receipt-checkTips-value"
            >
              {{ moduleDimensionData.receiptCheckType?.crmSelectedReceiptChecks }}
            </div>
            <ky-checkbox-group
              v-else
              v-model="receiptCheckType"
              direction="horizontal"
              type="check"
              size="small"
              class="flex jsx-receipt-check-type"
            >
              <ky-checkbox
                v-for="(item, index) in receiptCheckTypeList"
                :name="item.name"
                :key="index"
                @click="receiptCheckTypeReport(item)"
              >
                <span :class="receiptCheckType.includes(item.name as string) ? 'item-checked-text' : ''">{{
                  item.text
                }}</span>
              </ky-checkbox>
            </ky-checkbox-group>
          </div>
        </div>
        <div class="receipt-checkTips" v-if="moduleDimensionData.receiptCheckType.receiptCheckTips">
          {{ moduleDimensionData.receiptCheckType.receiptCheckTips }}
        </div>
      </div>

      <div
        class="receipt-service-options-cell flex items-start space-between"
        id="exp_express_single_urgent_return_v1"
        :exposure-report="exp_express_single_urgent_return_v1(orderPageTypeName)"
        v-if="moduleDimensionData?.receiptUrgentReturn?.visible && receiptFlag === ReceiptType['ORIGIN']"
      >
        <div class="cell-left flex items-center">
          <span class="lh20">是否加急返</span>
        </div>
        <div class="cell-right" style="text-align: right">
          <KyRadio
            class="radio-item radio-item2"
            direction="horizontal"
            checkedIcon="checked-round"
            :radio-props="receiptUrgentReturnList"
            :showCheckErrorTip="false"
            size="small"
            v-model="receiptUrgentReturn"
            @click="handleRadio_receiptUrgentReturnList"
            checkedHighlight
          ></KyRadio>
          <div
            v-if="moduleDimensionData?.receiptUrgentReturn?.tipsMsg && receiptUrgentReturn === 'urgent'"
            class="returnTips"
          >
            <span class="icon-tips">
              <SvgIcon name="dollar-reminder-line" class="icon-item mt--2" />
            </span>
            <span>{{ moduleDimensionData.receiptUrgentReturn.tipsMsg }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 上传资料-电子回单专用 -->
    <div
      class="receipt-service-info"
      @click="handleToReceiptResources"
      v-click-report="{
        eventCode: 'clk_express_receipt_v1',
      }"
      v-if="receiptFlag === ReceiptType['ELECTRON']"
    >
      <div class="receipt-service-info-cell flex items-center space-between">
        <div class="info-cell-left flex items-center">
          <img :src="uploadFileIcon" class="info-cell-left-icon" />
          <span class="font-special">回单资料</span>
          <SvgIcon class="cell-left-required" name="required" v-if="required" />
        </div>
        <div class="info-cell-right flex items-center" v-if="uploadListLen <= 0" id="addedService_receiptFile">
          <span class="font-special color-assist" id="addedService_receiptProvider">请上传回单文件/图片</span>
          <SvgIcon name="right-arrow" class="ml-8 font-level3" />
        </div>
        <div class="info-cell-right flex items-center" v-else>
          <span class="font-special">已上传{{ uploadListLen }}张</span>
          <SvgIcon name="right-arrow" class="ml-8 font-level3" />
        </div>
      </div>
      <div
        class="flex items-center pt-16"
        v-if="!isReceiptFile && uploadListLen <= 0 && receiptFlag === ReceiptType.ELECTRON"
      >
        <SvgIcon name="icon-tips" class="mr-8 font-level3 mt--2" />
        <span class="font-level4 color-warning">请尽快上传回单资料，避免影响取货时效</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useOrderExposureReport } from '@order-public-sub-public/report/exposureReport'
import Taro from '@tarojs/taro'

import { useDidShow } from '@tarojs/taro'
import { debounce } from 'lodash-es'
import { computed, ref, watch, onMounted } from 'vue'
import { useRouter } from '@order-public-sub-public/vue-router/index'
import { useStore } from '@order-public-sub-public/store'
import {
  ModuleType,
  ReceiptType,
  ReceiptProviderType,
  OrderPageType,
  MaterialTypes,
} from '@order-public-sub-public/constants'
import SvgIcon from '@order-public-sub-public/components/ui/svg-icon/index.vue'
import KyRadio from '@order-public-sub-public/components/base/ky-radio/index.vue'
import KyButtonRadio from '@order-public-sub-public/components/base/ky-button-radio/index.vue'
import KyReport from '@order-public-sub-public/components/base/ky-report/index.vue'
import {
  FieldsConfig,
  AddedServiceDimension,
  AiItems,
  ReceiptService,
  ReceiptCheckTipsType,
  AddedService,
  AddedServiceConfig,
  ReceiptFee,
} from '@order-public-sub-public/types'
import {
  useReceiptFlag,
  useReceiptProvider,
  useReceiptCount,
  useReceiptCheckType,
  useReceiptUrgentReturn,
} from '../../hooks/useState'
import { showToast } from '@order-public-sub-public/hooks/useShowToast'
import { KyRadioProps } from '@order-public-sub-public/components/base/ky-radio/types'
import { getFileByMultiBizCodeAndBizId } from '@order-public-sub-public/apis/pickup/index'
import { fileType } from '@order-public-sub-public/apis/pickup/type'
import { useValidate } from '../../hooks/useValidate'
import { useUpdateOrderStore } from '../../hooks/useModuleStore'
import KyStepper from '@order-public-sub-public/components/ui/stepper/index.vue'
import { closeTippy } from '@order-public-sub-public/validate/effect/effectBubble'
import { isShowTitle } from '../../utils/index'
import { popupVisible, unfoldReceiptVisible, useDetailPopupVisible } from '../../hooks/useVisible'
import {
  clk_express_single_insurance_content_v1,
  exp_ai_receipt_v1,
  exp_express_single_receipt_requirement_v1,
  clk_express_single_receipt_requirement_v1,
  exp_express_single_urgent_return_v1,
  clk_express_single_urgent_return_v1,
  exp_express_receipt_v1,
  exp_express_receipt_provider_v1,
  clk_express_receipt_number_v1,
  other_express_receipt_number_v1,
  clk_express_receipt_number_add_v1,
  clk_express_receipt_number_reduce_v1,
  clk_express_receipt_v1,
} from '@order-public-sub-public/components/business/added-service/hooks/report'
import { sourceActionReportMap } from '@order-public-sub-public/configs/report'
import { handleGlobalSourceReport } from '@order-public-sub-public/utils/reportConfig'
import { useInitMulitFielConfigChild } from '@order-public-sub-public/hooks/useInitFile'
import umpOtherReport from '@order-public-sub-public/reportUmp/sceneReport/umpotherReport'
const piniaStore = useStore()
const uploadFileIcon = 'https://ic-img.ky-express.com/netc/20251021_62038_!!1761032163104_88_88.png'
const emit = defineEmits(['receiptProviderClick'])

const createPageObserve = useOrderExposureReport([
  'exp_express_receipt_v1',
  'exp_express_receipt_provider_v1',
  'exp_express_single_receipt_requirement_v1',
  'exp_express_single_urgent_return_v1',
])

const isReceiptFile = computed(() => {
  const fieldsConfig = piniaStore.schema.moduleConfigData(ModuleType['增值服务'])?.fieldsConfig || []
  const isReceiptFileList = fieldsConfig.filter((item) => item.name === 'receiptFile' && item.visible)

  return isReceiptFileList.length > 0
})

const required = computed(() => {
  return (
    ([ReceiptType.IMAGE, ReceiptType.ORIGIN].includes((receiptFlag.value + '') as ReceiptType) &&
      receiptProvider.value === ReceiptProviderType.KYEPINCHHIT) ||
    (receiptFlag.value === ReceiptType.ELECTRON && isReceiptFile.value)
  )
})

const orderPageType = computed(() => piniaStore.root.getOrderPageType)

const { getData } = useInitMulitFielConfigChild()

const orderPageTypeName = computed(() => {
  const { sourceAction } = handleGlobalSourceReport()
  return sourceActionReportMap[sourceAction as keyof typeof sourceActionReportMap]
})
const router = useRouter()
const aiItem = computed(() => {
  const arr = piniaStore.schema.moduleDimensionData(ModuleType['增值服务']).aiItems || []
  return arr.find((v) => v.type === 'receipt') || ({} as AiItems)
})
const { useAddedServiceValidate, getReceiptFee } = useValidate()

const props = defineProps<FieldsConfig & { moduleStyle: string; showCheckErrorTip?: boolean }>()

const receiptProviderList = ref<KyRadioProps[]>([])
const receiptCheckTypeList = ref<KyRadioProps[]>([])
const receiptUrgentReturnList = ref<KyRadioProps[]>([])

const uploadList = ref<fileType[]>([]) // 电子回单-上传的文件列表
const kyeUploadList = ref<fileType[]>([]) // 跨越代打-上传的文件列表

const { receiptFlag, setReceiptFlag } = useReceiptFlag()
const { receiptProvider, setReceiptProvider } = useReceiptProvider()
const { receiptCount, setReceiptCount } = useReceiptCount()
const { receiptCheckType } = useReceiptCheckType()
const { receiptUrgentReturn, setReceiptUrgentReturn } = useReceiptUrgentReturn()
const uploadListLen = computed(() => {
  let len = 0
  if (receiptFlag.value === ReceiptType['ELECTRON']) {
    len = uploadList.value?.length || 0
  } else if (receiptProvider.value === ReceiptProviderType['KYEPINCHHIT']) {
    len = kyeUploadList.value?.length || 0
  } else {
    len = 0
  }
  return len
})

// 回单费用 - 单纯展示
const receiptFeeData = computed(() => {
  return piniaStore.schema.moduleDimensionData(ModuleType['增值服务'])?.receiptFee || {}
})

const orderFormData = computed(() => piniaStore.order.moduleFormData(ModuleType['增值服务']))

// 动态设置回单服务Class
const serviceRadioStyle = computed(() => {
  return {
    'tag-unfold': props.moduleStyle === 'unfold',
    'single-btn-tag': !(isShowTitle.value && props.moduleStyle !== 'unfold'),
    'check-result-tips': checkResultListTips.value,
  }
})

const formatter = (value: number | string) => {
  let str = value?.toString()?.replace(/[^\d]/g, '')
  str = str?.replace(/^0+/, '') || '1'
  return str
}

// 添加popupVisible.value的监听，处理跨越代打的再来一单的时候，
// 第一次进来会判断是是否有文件没有会会设置默认值，
// 第二次进来由于组件加载过不会走onMounted导致跨越代打又被回填了
// 下单小程序 TODO 路由处理
watch(
  () => [popupVisible.value],
  () => {
    getUploadList()
    getReceiptFeeFn()
  },
)
// eslint-disable-next-line complexity
const getUploadList = async (initKyePost = false) => {
  try {
    const isKye =
      receiptProvider.value === ReceiptProviderType['KYEPINCHHIT'] && receiptFlag.value !== ReceiptType['ELECTRON']

    const { configData, getBizCode } = await getData()

    let listParams = [
      {
        bizId: configData?.value?.bizId,
        bizCode: getBizCode(isKye || initKyePost ? MaterialTypes.跨越代打 : MaterialTypes.电子回单),
      },
    ]
    const { data } = await getFileByMultiBizCodeAndBizId({
      list: listParams,
    })
    if (isKye || initKyePost) {
      kyeUploadList.value = data || []
    } else {
      uploadList.value = data || []
    }
  } catch (error) {
    console.log('error>>', error)
  }

  // if (!kyeUploadList?.value?.length && receiptProvider.value === ReceiptProviderType['KYEPINCHHIT']) {
  //   let filterDefaultSelfProvider =
  //     receiptProviderList?.value.filter((f) => f?.name === ReceiptProviderType['MYSELF']) || []
  //   let providerKey = filterDefaultSelfProvider.length ? ReceiptProviderType['MYSELF'] : ''
  //   setReceiptProvider(providerKey)
  // }
}

const watchBizId = watch([popupVisible, unfoldReceiptVisible], () => {
  if (popupVisible.value) {
    getUploadList(false)
    getUploadList(true)
  }
  watchBizId()
})

watch(
  () => popupVisible.value,
  (val) => {
    if (val) {
      moduleDimensionData.value?.receiptServiceList?.forEach((v) => {
        exp_ai_receipt_v1(aiItem.value, v)
      })
    }
  },
)

// 平铺增值服务-回单提供方获取上传资料使用mounted请求接口
useDidShow(() => {
  getUploadList(false)
  getUploadList(true)
})

onMounted(() => {
  getUploadList(false)
  getUploadList(true)
  getReceiptFeeFn()
})

const receiptProviderClick = () => {
  emit('receiptProviderClick')
}

const moduleDimensionData = computed(() => {
  return piniaStore.schema.moduleDimensionData(ModuleType['增值服务'])
})

const { detailPopupVisible } = useDetailPopupVisible()
// 回单提供方-默认选中自行提供
const setDefaultSelfReceiptProvider = () => {
  const isHasSelfProvider = receiptProviderList.value.filter((f) => f.name === ReceiptProviderType['MYSELF'])

  if (receiptFlag.value !== ReceiptType['ELECTRON'] && !receiptProvider.value && isHasSelfProvider.length) {
    setReceiptProvider(ReceiptProviderType['MYSELF'])
    // 只有在表单填写时才给出默认值写入store，原来只要触发都会写入store，会导致首次点击回单时无法选中
    if (!(popupVisible.value || detailPopupVisible.value)) {
      useUpdateOrderStore({ receiptProvider: ReceiptProviderType['MYSELF'] })
    }
  }
}

watch(
  [receiptFlag, moduleDimensionData],
  () => {
    if (moduleDimensionData.value) {
      moduleDimensionData.value?.receiptServiceList?.forEach((item) => {
        exp_ai_receipt_v1(aiItem.value, item)
        if (item.disabled && item.type === receiptFlag.value) {
          setReceiptFlag('')
          useUpdateOrderStore({ receiptFlag: undefined })
        }
        if (item.type === receiptFlag.value) {
          let radioPropsList: KyRadioProps[] = []
          if (item.receiptProviderList && item.receiptProviderList.length > 0) {
            radioPropsList = item.receiptProviderList.map((item) => {
              return {
                name: item.provider,
                text: item.providerName,
                disabled: item.disabled,
                tipsMsg: item.tipsMsg,
                default: item.default,
              }
            })
          }
          receiptProviderList.value = radioPropsList
        }
      })
      receiptCheckTypeList.value = (moduleDimensionData.value?.receiptCheckType?.receiptCheckTypeList || []).map(
        (item) => {
          return {
            name: item.checkType,
            text: item.checkTypeName,
            disabled: item.disabled,
          }
        },
      )
      receiptUrgentReturnList.value = (moduleDimensionData.value?.receiptUrgentReturn?.urgentList || []).map((item) => {
        return {
          name: item.urgentType,
          text: item.urgentName,
          disabled: item.disabled,
        }
      })
    }
    setDefaultSelfReceiptProvider()
  },
  { immediate: true },
)

const handleReceiptService = async (item: ReceiptService) => {
  const value: string = item.type
  clk_express_single_insurance_content_v1(aiItem.value, item)

  if (receiptFlag.value === value) {
    setReceiptFlag('')
  } else {
    setReceiptFlag(value)
  }

  // 如果运单数据中没有回单服务和回单提供方,当用户操作回单原件/回单照片时默认选中寄方提供
  const orderReceiptFlag = orderFormData.value.receiptFlag
  const orderReceiptProvider = orderFormData.value.receiptProvider
  if (
    [ReceiptType['IMAGE'], ReceiptType['ORIGIN']].includes(receiptFlag.value as ReceiptType) && // 当前选择的回单服务是回单原件/回单照片
    ![ReceiptType['IMAGE'], ReceiptType['ORIGIN']].includes(orderReceiptFlag as ReceiptType) && // 运单数据中默认值不是回单原件/回单照片
    !orderReceiptProvider && // 运单数据中没有回单提供方
    !receiptProvider.value && // 当前没有选中回单提供方
    orderPageType.value !== OrderPageType.批量寄
  ) {
    setReceiptProvider(ReceiptProviderType.SENDER)
  }

  // 清空回单张数
  if (!receiptFlag.value) {
    setReceiptCount(1)
  }
  setTimeout(() => {
    createPageObserve()
  }, 300)

  await getUploadList()
  if (
    (receiptFlag.value === ReceiptType['ORIGIN'] || receiptFlag.value === ReceiptType['IMAGE']) &&
    !receiptCount.value
  ) {
    setReceiptCount(1)
    await useAddedServiceValidate({ field: 'receiptCount', cancelProcess: true })
  }
  try {
    getReceiptFeeFn()
    await useAddedServiceValidate({ field: 'receiptFlag' })
  } catch (error) {
    console.error(error)
  }
}

const handleToReceiptResources = debounce(() => {
  clk_express_receipt_v1()
  if (receiptFlag.value !== ReceiptType['ELECTRON'] && receiptProvider.value === ReceiptProviderType['KYEPINCHHIT']) {
    // router.push({
    //   path: '/receipt-resources',
    //   query: {
    //     isKYEPinchHit: ReceiptProviderType['KYEPINCHHIT'],
    //   },
    // })
    Taro.navigateTo({
      url:
        '/modules/order-build-sub-pages/order-public/components/business/added-service/components/receipt-resources/index?isKYEPinchHit=' +
        ReceiptProviderType['KYEPINCHHIT'],
    })
  } else {
    // router.push({
    //   path: '/receipt-resources',
    // })
    Taro.navigateTo({
      url: '/modules/order-build-sub-pages/order-public/components/business/added-service/components/receipt-resources/index',
    })
  }
}, 500)

const handleRadio = async (value: string, _event: MouseEvent, radioProps: KyRadioProps) => {
  const { disabled, tipsMsg, name, text } = radioProps
  console.log('showCheckErrorTip', props.showCheckErrorTip, radioProps)
  umpOtherReport(
    'CLK',
    {
      eventCode: 'clk_express_single_insurance_content_v1',
    },
    {
      button_name: text,
    },
  )
  if (disabled) {
    showToast(tipsMsg)
    return
  }
  if (receiptProvider.value === value) {
    // 反选
    receiptProviderClick()
  } else {
    // 选中
    setReceiptProvider(value)
    if (name === ReceiptProviderType['KYEPINCHHIT'] && !kyeUploadList.value?.length) {
      handleToReceiptResources()
    }
    receiptProviderClick()

    // 选择跨越打单需要清空回单张数并且设置为null
    if (name === ReceiptProviderType['KYEPINCHHIT']) {
      setReceiptCount(null)
    } else {
      setReceiptCount(1)
    }

    try {
      await useAddedServiceValidate({ field: 'receiptProvider' })
    } catch (error) {
      console.error(error)
    }
  }
}

const handleRadioChange = (name) => {
  if (name) {
    setReceiptProvider(name)
  }
}

const handleRadio_receiptUrgentReturnList = async (value: string, _event: MouseEvent, radioProps: KyRadioProps) => {
  const { disabled, tipsMsg } = radioProps
  console.log(radioProps)
  if (disabled) {
    showToast(tipsMsg)
    return
  }
  // 选中
  setReceiptUrgentReturn(value)
  clk_express_single_urgent_return_v1(
    orderPageTypeName.value,
    receiptUrgentReturnList.value.find((v) => v.name === value)?.text || '',
  )
  try {
    await useAddedServiceValidate({ field: 'receiptUrgentReturn' })
    getReceiptFeeFn()
  } catch (error) {
    console.error(error)
  }
}

const onReceiptCountChange = async (eventType?: string) => {
  if (!receiptCount.value) {
    setReceiptCount(1)
  }

  switch (eventType) {
    case 'blur':
      other_express_receipt_number_v1(receiptCount.value)
      break
    case 'plus':
      clk_express_receipt_number_add_v1(receiptCount.value)
      break
    case 'minus':
      clk_express_receipt_number_reduce_v1(receiptCount.value)
      break
  }

  try {
    closeTippy()
    await useAddedServiceValidate({ field: 'receiptCount' })
  } catch (error) {
    console.error(error)
  }
}

const checkResultListTips = computed(() => {
  let result = ''
  const checkResultList = piniaStore.globalData.checkResultList
  if (checkResultList && checkResultList.length > 0) {
    checkResultList.forEach((item) => {
      if (item.key === 'addedService.receiptFlag' && item.showType === 2) {
        result = item.content
      }
    })
  }
  return result
})

const isEditAndReturnWaybill = computed(
  () => piniaStore.globalData.returnEditDisableInfo('addedServiceExtraInfo', 'recoveryReceipt') || {},
)

const handleMask = () => {
  showToast(isEditAndReturnWaybill.value.tips || '不可修改')
}
const receiptCheckTypeReport = (item: KyRadioProps) => {
  clk_express_single_receipt_requirement_v1(
    orderPageTypeName.value,
    item.text,
    receiptCheckType.value.includes(item.name as string) ? '选中' : '取消选中',
  )
}

const getReceiptFeeFn = () => {
  if (receiptFlag.value) {
    // 获取回单费 -- 为了不增加 useAddedServiceValidate 的业务逻辑，并且获取费用功能比较独立，单独抽离出来
    getReceiptFee()
  }
}
</script>

<style lang="scss">
@import '@order-global-package-order-sub/styles/index.scss';
@import './index.scss';
</style>
