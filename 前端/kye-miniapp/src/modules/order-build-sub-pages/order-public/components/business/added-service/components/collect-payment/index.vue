<!-- 代收货款 -->
<template>
  <div :class="`collect-payment collect-payment-${moduleStyle}`" v-if="moduleVisible">
    <div class="flex items-center space-between collect-payment-title font-level3">
      <div
        class="left"
        v-if="isShowTitle"
        v-exposure-report="{
          eventCode: 'exp_express_receipt_angle_v1',
        }"
      >
        代收货款
      </div>
    </div>
    <div class="collect-payment-conent">
      <div class="edit-return-waybill" v-if="isEditAndReturnWaybill.key" @click="handleMask"></div>
      <div class="collect-payment-conent-overlayer" v-if="paymentDisabled" @click="() => showToast(disabledTips)"></div>
      <div
        class="collect-payment-conent-overlayer"
        v-if="!isPaymentAgreementSelected && !paymentDisabled"
        @click="showAgreementPopup"
      ></div>
      <KyInput
        :id="agreementVisible ? '' : 'addedService_collectionAmount'"
        data-validate="addedService.collectionAmount"
        :placeholder="disabledTips || '请输入金额'"
        no-padding
        show-border
        type="number"
        clearable
        v-model.number="collectionAmount"
        :disabled="paymentDisabled"
        :enableWxNative="true"
        :inputDebounce="800"
        :maxlength="6"
        :cursor-spacing="100"
        v-click-report="{
          eventCode: 'clk_express_single_insurance_content_v1',
          otherParams: () => {
            return {
              button_name: '代收货款输入框',
            }
          },
        }"
        @focus="clk_express_collection_v1()"
        @blur="onBlur"
        @input="_onInput"
      >
        <template #right v-if="areaAttribute === AreaAttributeType['自营区']">
          <div class="flex items-center">
            <span class="collect-payment-fee-label">服务费&nbsp;</span>
            <div class="flex items-center" v-if="freightLookAuthFlag === FreightLookAuthFlagEnum['有权限']">
              <span class="color-error mr-8">{{ collectionFee || '--' }}</span>
            </div>
            <span v-else class="no-auth-fee-icon"><SvgIcon name="four-star-tips" /></span>
            <span class="color-primary">元</span>
          </div>
          <div
            v-show="Number(collectionAmountLocal) > 9999"
            class="collect-payment-fee-extra font-special color-assist"
            :style="{ left: (collectionAmountLocalLength * 18 + 24) / 7.5 + 'vw' }"
          >
            {{ filterChinese(collectionAmountLocal.toString()) }}
          </div>
        </template>
      </KyInput>
    </div>
    <AgreementPopup
      :visible="agreementVisible"
      :defaultValue="collectionAmount"
      :defaultTips="collectionFee"
      :areaAttribute="areaAttribute"
      :freightLookAuthFlag="freightLookAuthFlag"
      @agreementSelectedChange="agreementSelectedChange"
      @close="handleCloseAgreement"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useStore } from '@order-public-sub-public/store'
import AgreementPopup from './agreement-popup/index.vue'
import KyInput from '@order-public-sub-public/components/base/ky-input'
import { FieldsConfig, AddedServiceDimension, AreaAttributeDimension } from '@order-public-sub-public/types'
import { useCollectionAmount, useCollectionFee } from '../../hooks/useState'
import { AreaAttributeType, ModuleType, OrderPageType } from '@order-public-sub-public/constants'
import { showToast } from '@order-public-sub-public/hooks/useShowToast'
import { useValidate } from '../../hooks/useValidate'
import useEffect from '@order-public-sub-public/validate'
import { FreightLookAuthFlagEnum } from '@order-public-sub-public/components/business/added-service/types'
import SvgIcon from '@order-public-sub-public/components/ui/svg-icon/index.vue'
import { filterChinese, isShowTitle } from '../../utils/index'
import {
  clk_express_collection_v1,
  other_express_collection_v1,
} from '@order-public-sub-public/components/business/added-service/hooks/report'
import { getDefaultSelect, useAgreementSelected } from './hooks/useState'
import { debounce } from 'lodash-es'
const piniaStore = useStore()
const { isPaymentAgreementSelected, setAgreementSelected } = useAgreementSelected()
// import { $native } from '@order-public-sub-public/utils'
// import { getOnlineH5Url } from '@order-public-sub-public/utils/env'

const props = defineProps<FieldsConfig & { moduleStyle: string }>()
const { effectBubble } = useEffect()
const { collectionAmount } = useCollectionAmount()
const { collectionFee } = useCollectionFee()

const { useAddedServiceValidate, useCollectionAmountValidatePassed } = useValidate()

const collectionAmountLocal = ref(collectionAmount.value) // 本地输入中金额

const areaAttribute = computed(() => piniaStore.schema.moduleDimensionData(ModuleType.区域属性)?.feature)

const freightLookAuthFlag = computed(() => {
  return piniaStore.schema.moduleDimensionData(ModuleType['增值服务'])?.freightLookAuthFlag
})

const addedServiceDimension = computed(() => {
  return piniaStore.schema.moduleDimensionData(ModuleType['增值服务'])
})

const orderPageType = computed(() => piniaStore.root.getOrderPageType)

const hotZoneStore = computed(() => {
  if (orderPageType.value === OrderPageType.批量寄单票) {
    return { [ModuleType['收方信息']]: true }
  } else {
    return piniaStore.extend.hotZoneStore
  }
})

const emit = defineEmits(['blur'])

const agreementVisible = ref(false)
const showAgreementPopup = () => {
  agreementVisible.value = true
}

const handleCloseAgreement = () => {
  agreementVisible.value = false
}

const agreementSelectedChange = (flag: boolean, amount: number) => {
  setAgreementSelected(flag)
  collectionAmount.value = amount
  collectionAmountLocal.value = amount
  onInput()
  setTimeout(() => {
    onBlur()
  }, 300)
}

const onInput = () => {
  try {
    useAddedServiceValidate({ field: 'collectionAmount', isOnline: true })
  } catch (error) {
    console.error(error)
  }
}

const onBlur = async () => {
  emit('blur')
  if (collectionAmount.value !== '' && Number(collectionAmount.value) === 0) {
    collectionAmount.value = '0'
    const result = await useCollectionAmountValidatePassed()
    effectBubble([result])
  }
  try {
    other_express_collection_v1(collectionAmount.value)
    await useAddedServiceValidate({ field: 'collectionAmount' })
  } catch (error) {
    console.error(error)
  }
}

const formatter = (value: string) => {
  let inputValue = value.trim()
  inputValue = inputValue.toString().replace(/^[。.]/, '')
  inputValue = inputValue.replace(/[^\d.]/g, '')

  const parts = inputValue.split('.')
  if (parts.length > 1) {
    parts[0] = parts[0].slice(0, 6)
    parts[1] = parts[1].slice(0, 2)
    inputValue = parts.join('.')
  } else {
    inputValue = inputValue.slice(0, 6)
  }

  return inputValue
}

const _onInput = (value) => {
  collectionAmountLocal.value = value
  _onFormatter(value)
}

/* 执行formatter处理 */
const _onFormatter = debounce((value) => {
  if (formatter) {
    collectionAmount.value = formatter(value)
  }
  onInput()
}, 1000)

const collectionAmountLength = computed(() => {
  return collectionAmount.value ? collectionAmount.value.toString().length : 0
})

const collectionAmountLocalLength = computed(() => {
  return collectionAmountLocal.value ? collectionAmountLocal.value.toString().length : 0
})

const isEditAndReturnWaybill = computed(
  () => piniaStore.globalData.returnEditDisableInfo('addedServiceExtraInfo', 'collectionPayment') || {},
)

const handleMask = () => {
  showToast(isEditAndReturnWaybill.value.tips || '不可修改')
}
const checkAreaAttribute = computed(() => {
  return areaAttribute.value !== AreaAttributeType['自营区'] && hotZoneStore.value[ModuleType['收方信息']]
})

const moduleVisible = computed(() => {
  let authVisible = true
  // 组件数据新增禁用标识,兼容新老数据才有此判断
  if (
    addedServiceDimension.value?.collectionAmount &&
    addedServiceDimension.value?.collectionAmount?.visible !== undefined
  ) {
    authVisible = addedServiceDimension.value?.collectionAmount?.visible
  }
  return props.visible && orderPageType.value !== OrderPageType.批量寄 && authVisible
})

const paymentDisabled = computed(() => {
  let authDidsbled = false
  // 组件数据新增禁用标识,兼容新老数据才有此判断
  if (
    addedServiceDimension.value?.collectionAmount &&
    addedServiceDimension.value?.collectionAmount?.disabled !== undefined
  ) {
    authDidsbled = addedServiceDimension.value?.collectionAmount?.disabled
  }
  return authDidsbled || checkAreaAttribute.value
})

const disabledTips = computed(() => {
  if (paymentDisabled.value) {
    return addedServiceDimension.value?.collectionAmount?.disabledTips || '该收件地址不支持代收货款'
  }
  return ''
})

onMounted(() => {
  getDefaultSelect()
})
</script>

<style lang="scss">
@import '@order-global-package-order-sub/styles/index.scss';
@import './index.scss';
</style>
