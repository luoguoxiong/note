<template>
  <div
    v-if="visible"
    class="exhibition"
    :class="{ hasTip: isRevicer, 'padding-style': !isUnfold && isRevicer }"
    @click.stop
    v-exposure-report="{
      eventCode: 'exp_sender_pavilion_tips_v1',
      regionCode: 'send_info',
      otherParams: () => {
        return { address_type: type, pavilion_number: exhibitionNumber, Booth_number: exhibitionSiteNumber }
      },
    }"
  >
    <div class="exbibition-container">
      <!-- 展馆号 -->
      <div class="exbibition-container-left" @click="open">
        <KyCell
          :data-validate="`${type}.exhibitionNumber`"
          :id="`${type}_exhibitionNumber`"
          class="exhibitionNumber-pos"
          :required="required"
          requiredDirection="left"
          v-exposure-report="exp_express_sender_exhibition_v1()"
        >
          <template #title>
            <div class="placeholder" :class="{ 'validate-error': popoverConfig?.content }" v-if="!exhibitionNumber">
              请选择展馆号
            </div>
            <div v-else class="exhibition-number">{{ exhibitionNumber }}</div>
          </template>
        </KyCell>
      </div>
      <!-- <div class="line"></div> -->
      <!-- 展位号 -->
      <div class="exbibition-container-right" :id="`${type}_exhibitionSiteNumber`">
        <ky-field
          :data-validate="`${type}.exhibitionSiteNumber`"
          placeholder="请填写展位号"
          clearable
          :maxlength="20"
          :inputDebounce="600"
          :enableWxNative="true"
          v-model="exhibitionSiteNumber"
          border="bottom"
          @input="onInput"
          @blur="onBlur"
          :requiredTag="required"
          class="position-number"
          :formatter="formatter"
        />
      </div>
    </div>

    <!-- 展馆号弹窗 -->
    <BottomPopup v-model:show="state.show" title="展馆号" @onClose="state.show = false" :showFooter="false">
      <div class="exhibitionlist">
        <div
          v-for="(item, index) in state.list"
          :key="index"
          class="exhibitionlist__item"
          :class="{ active: state.exhibitionNumber === item.exhibitionNumber }"
          @click="onSelect(item)"
        >
          {{ item.exhibitionNumber }}
        </div>
      </div>
    </BottomPopup>
  </div>
  <div class="exhibition-tooltip-error" v-if="exhibitionTips && isRevicer">
    {{ exhibitionTips }}
  </div>
</template>

<script setup lang="ts">
import { reactive, computed } from 'vue'
import { debounce } from 'lodash-es'

// 组件
// import KyField from '@order-public-sub-public/components/base/ky-field/index.vue'
import KyCell from '@order-public-sub-public/components/base/ky-cell/index.vue'
import BottomPopup from '@order-public-sub-public/components/ui/bottom-popup/index.vue'
import KyField from '@order-public-sub-public/components/base/ky-field/index.vue'

// 方法
import { queryExhibition } from '@order-public-sub-public/apis/address'
import { filterAllSpace } from '@order-public-sub-public/utils'
import { filterEmojis } from '@order-public-sub-public/utils/pattern'
import {
  ListItem,
  ReactiveType,
  ExhibitionProps,
  ModulePageType,
  getExhibitionData,
  useUpdateDataFun,
  useValidate,
  senderVisible,
  receiveVisible,
} from '@order-public-sub-public/components/business/exhibition/hooks/data-config'

import { Address, OrderPageType, ModuleType } from '@order-public-sub-public/constants'
import { useStore } from '@order-public-sub-public/store'
import { PickUp } from '@order-public-sub-public/types'
import SvgIcon from '@order-public-sub-public/components/ui/svg-icon/index.vue'
import {
  clk_express_sender_exhibition_v1,
  exp_express_sender_exhibition_v1,
  other_express_sender_exhibition_v1,
  exp_express_sender_booth_v1,
  clk_express_sender_booth_v1,
  other_express_sender_booth_v1,
} from '@order-public-sub-public/components/business/exhibition/hooks/report'
import { useValidate as globalUseValidate } from '@order-public-sub-public/hooks/useValidate'
import { closeTippy, resetErrorClassByDom } from '@order-public-sub-public/validate/effect/effectBubble'

import { reportPerception } from '@order-public-sub-public/reportUmp/util/index'
import { getEnvConfig } from '@/public/config'
const piniaStore = useStore()

const { validateObj } = globalUseValidate()

const props = defineProps<ExhibitionProps>()
const useUpdateData = useUpdateDataFun(props.type)
const { exhibitionNumber, exhibitionCode, exhibitionSiteNumber, exhibitionProject } = getExhibitionData(props.type)
const { checkValidate } = useValidate(props.type)()

const isRevicer = computed(() => props.type === ModulePageType.收方)
const visible = computed(() => {
  if (props.type === ModulePageType.寄方) {
    return senderVisible.value
  } else {
    return receiveVisible.value
  }
})
const state = reactive<ReactiveType>({
  show: false,
  exhibitionNumber: '',
  list: [],
  result: {
    exhibitionCode: '',
    exhibitionNumber: '',
  },
})

const popoverConfig = computed(() => {
  return validateObj[`${props.type}.exhibitionNumber` as keyof validateObj] || {}
})

// 展位号格式化
const formatter = (value: string): string => filterAllSpace(value.replace(filterEmojis, ''))

const { isApp } = getEnvConfig()
const inputDebounceTime = isApp ? 800 : 500

const onInput = debounce((value: string) => {
  exhibitionSiteNumber.value = value
  let moduleStyle = Address.SENDER
  if (props.type === ModulePageType.收方) {
    moduleStyle = Address.RECEIVE
  }
  useUpdateData({ moduleStyle: moduleStyle }).setStoreValue()
}, inputDebounceTime)

const open = async () => {
  await getQueryExhibition()
  state.exhibitionNumber = exhibitionNumber.value
  state.show = true
  clk_express_sender_exhibition_v1(props.type)
  console.log('收寄方>>>', props.type)
  if (props.type === ModulePageType.寄方) {
    resetErrorClassByDom([{ key: 'sender.exhibitionNumber', passed: true, content: '' }])
    closeTippy()
    reportPerception('other_express_sender_exhibition_perception_v1')
  }

  if (props.type === ModulePageType.收方) {
    reportPerception('other_express_sreceiver_exhibition_perception_v1')
  }
}

// 选中
const onSelect = (item: ListItem) => {
  state.show = false
  other_express_sender_exhibition_v1(props.type, item.exhibitionNumber)
  state.exhibitionNumber = item.exhibitionNumber
  exhibitionCode.value = item.exhibitionCode
  exhibitionNumber.value = item.exhibitionNumber
  exhibitionProject.value = item.expoCode || ''

  let moduleStyle = Address.SENDER
  if (props.type === ModulePageType.收方) {
    moduleStyle = Address.RECEIVE
  }
  useUpdateData({ moduleStyle: moduleStyle }).setStoreValue()
  onClickExhibitionNumber(item)
}

/**
 * 获取展馆号
 */
const getQueryExhibition = async () => {
  const sourceFlagObj = {
    sender: '10',
    receive: '20',
  }
  const orderPageType = piniaStore.root.getOrderPageType

  try {
    const { data } = await queryExhibition({
      sourceFlag: sourceFlagObj[props.type] || '',
      waybillId: orderPageType === OrderPageType.批量寄 ? '0' : '1',
    })
    state.list = data || []
  } catch (error) {
    console.log('error', error)
  }
}

const sendRequired = computed(() => {
  return piniaStore.globalData.dynamicConfig('extractShow')?.required || false
})

const exhibitionTips = computed(() => {
  return (
    piniaStore.globalData.dynamicConfig('extractShow')?.exhibitionTips ||
    piniaStore.globalData.dynamicConfig('receiveExtractShow')?.exhibitionTips
  )
})

const reactiveRequired = computed(() => {
  return piniaStore.globalData.dynamicConfig('receiveExtractShow')?.required || false
})

const required = computed(() => {
  if (props.type === ModulePageType.寄方) {
    return sendRequired.value
  } else {
    return reactiveRequired.value
  }
})
// 展位号校验
const onBlur = async () => {
  const receiveFormData = piniaStore.order.moduleFormData(ModuleType['收方信息'])
  const senderFormData = piniaStore.order.moduleFormData(ModuleType['寄方信息'])
  const moduleFormData = props.type === ModulePageType.寄方 ? senderFormData : receiveFormData
  const dataValidate = props.type === ModulePageType.寄方 ? 'sender.exhibitionNumber' : 'receive.exhibitionNumber'
  if (exhibitionNumber.value) {
    await checkValidate({
      required: props.type === ModulePageType.寄方 ? visible.value : false,
      fieldKey: 'exhibitionSiteNumber',
      value: exhibitionSiteNumber.value,
      originalData: moduleFormData,
      needRemoteCheck: true,
      exhibitionInfo: { exhibitionSiteNumber: exhibitionSiteNumber.value },
    })
  } else {
    if (exhibitionSiteNumber.value) {
      await checkValidate({
        required: Boolean(exhibitionNumber.value) || visible.value,
        fieldKey: 'exhibitionNumber',
        value: exhibitionNumber.value || '',
        originalData: moduleFormData,
        needRemoteCheck: true,
        exhibitionInfo: { exhibitionNumber: exhibitionNumber.value },
      })
    } else {
      // 清除展馆号报错
      resetErrorClassByDom([{ key: dataValidate, passed: true, content: '' }])
    }
  }
  other_express_sender_booth_v1(props.type, exhibitionSiteNumber.value)
}

// 未选展馆号，点击展位号需要气泡提示
const onClickExhibitionNumber = async (item?: any) => {
  const moduleName = props.type === ModulePageType.收方 ? '收方信息' : '寄方信息'
  const moduleFormData = piniaStore.order.moduleFormData(ModuleType[moduleName])
  await checkValidate({
    required: visible.value,
    fieldKey: 'exhibitionNumber',
    value: exhibitionNumber.value || '',
    originalData: moduleFormData,
    needRemoteCheck: exhibitionSiteNumber.value ? true : false,
    exhibitionInfo: item || {},
  })

  // if (props.type === ModulePageType.收方) {
  // 新增需求: 选择展馆号而且未选展位号，需要校验展位号，展位号需要本地校验与远程校验
  checkExhibitionSiteNumberValidate(moduleFormData)
  // }

  return false
}

// 新增需求: 选择展馆号而且未选展位号，需要校验展位号，展位号需要本地校验与远程校验
const checkExhibitionSiteNumberValidate = async (moduleFormData: any) => {
  await checkValidate({
    required: Boolean(exhibitionNumber.value) || visible.value,
    fieldKey: 'exhibitionSiteNumber',
    value: exhibitionSiteNumber.value,
    originalData: moduleFormData,
    needRemoteCheck: false,
    exhibitionInfo: { exhibitionSiteNumber: exhibitionSiteNumber.value },
  })
}
</script>

<style lang="scss">
@import '@order-global-package-order-sub/styles/index.scss';
@import './index.scss';
</style>
