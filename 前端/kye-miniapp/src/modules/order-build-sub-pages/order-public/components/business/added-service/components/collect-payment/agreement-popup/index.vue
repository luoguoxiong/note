<template>
  <BottomPopup
    id="agreement-popup-desc"
    class="agreement-popup-desc-wrapper"
    :show="visible"
    title="代收货款"
    tipText=""
    :noPadding="true"
    :style="{ height: '82%' }"
    @open="onOpen"
    @beforeRouteClose="beforeRouteClose"
    @onClose="handleClosePopup()"
    @closed="closed"
    :show-footer="true"
  >
    <div
      class="agreement-popup-desc pb-32 flex flex-column"
      v-exposure-report="{
        eventCode: 'other_express_protectprice_popup_perception_v1',
      }"
    >
      <div class="pb-32 collect-payment-conent">
        <KyInput
          :id="visible ? 'addedService_collectionAmount' : ''"
          data-validate="addedService.collectionAmount"
          placeholder="请输入金额"
          no-padding
          show-border
          type="number"
          clearable
          v-model.number="collectionAmount"
          :enableWxNative="true"
          :inputDebounce="800"
          :maxlength="6"
          v-click-report="{
            eventCode: 'clk_express_single_insurance_content_v1',
            otherParams: () => {
              return {
                button_name: '代收货款输入框',
              }
            },
          }"
          @update="onInput"
          @blur="onBlur"
          @input="_onInput"
          ref="paymentInputRef"
        >
          <template #right v-if="areaAttribute === AreaAttributeType['自营区']">
            <div class="flex items-center-wrap" @click="handlePaymentClear">
              <div class="h5-view ky-input--clear" v-show="collectionAmount">
                <div class="ky-input--clear-icon"></div>
              </div>
              <span class="collect-payment-fee-label">服务费</span>
              <div class="flex items-center" v-if="freightLookAuthFlag === FreightLookAuthFlagEnum['有权限']">
                <span class="color-error mr-8">{{ collectionFee || '--' }}</span>
                <span class="color-primary">元</span>
              </div>
              <span v-else class="flex items-center">
                <span class="no-auth-fee-icon"><SvgIcon name="four-star-tips" /></span>
                <span>元</span>
              </span>
            </div>
            <div
              v-show="Number(collectionAmountLocal) > 9999"
              class="collect-payment-fee-extra font-special color-assist"
              :style="{ left: (collectionAmountLocalLength * 18 + 24) / 7.5 + 'vw' }"
              @click.stop="handlePaymentClear"
            >
              {{ filterChinese(collectionAmountLocal.toString()) }}
            </div>
          </template>
        </KyInput>
      </div>
      <scroll-view :scroll-y="true" :showScrollbar="false" class="font-special special-span">
        <div v-html="internalState.agreementContent"></div>
      </scroll-view>
    </div>
    <template #footer>
      <div class="agreement-popup-desc-footer">
        <div class="flex justify-center items-center font-level4">
          <div class="color-sub-title">
            <KyRadio
              v-model="internalState.radioChecked"
              :radio-props="[{ name: true, text: '我已知晓，下次不再提醒', iconSize: '16px' }]"
              @click="handleRadio"
            >
              <template #icon>
                <SvgIcon class="mr-2" name="check-icon" v-if="internalState.radioChecked" />
                <SvgIcon class="mr-2" name="no-check-icon" v-else /> </template
            ></KyRadio>
          </div>
          <div>《代收货款服务协议》</div>
        </div>
        <div class="flex justify-center agreement-popup-desc-footer-btn">
          <KyButton
            id="protect-price-btn-cancel"
            text="不同意"
            plain
            @click.stop="handleCancelPopup"
            :loading="loading"
            loadingType="plain"
            loading-text="不同意"
          ></KyButton>
          <KyButton
            id="protect-price-btn-confirm"
            :loading="internalState.buttonLoading"
            @click="handleConfirm"
            text="同意"
          ></KyButton>
        </div>
      </div>
    </template>
  </BottomPopup>
</template>

<script setup lang="ts">
import { reactive, onMounted, ref, computed } from 'vue'
import BottomPopup from '@order-public-sub-public/components/ui/bottom-popup/index.vue'
import KyRadio from '@order-public-sub-public/components/base/ky-radio/index.vue'
import KyButton from '@order-public-sub-public/components/base/ky-button/index.vue'
import KyInput from '@order-public-sub-public/components/base/ky-input/input.vue'
import SvgIcon from '@order-public-sub-public/components/ui/svg-icon/index.vue'
import { FreightLookAuthFlagEnum } from '@order-public-sub-public/components/business/added-service/types'
import { AreaAttributeType } from '@order-public-sub-public/constants'
import { agreementSave, getHelpContent } from '@order-public-sub-public/apis/waybill/agreement'
import { filterChinese } from '../../../utils'
import { isHidePopupConfirmBtn } from '../../../hooks/state'

import { addedServiceFeeProcess } from '@order-public-sub-public/apis'
import { debounce } from 'lodash-es'
import { useValidate } from '../../../hooks/useValidate'
import { effectBubble, resetErrorClassByDom } from '@order-public-sub-public/validate/effect/effectBubble'
import { useStore } from '@order-public-sub-public/store'
const piniaStore = useStore()

interface Props {
  visible: boolean
  goodsSupplementProtectPriceTips?: string
  areaAttribute: AreaAttributeType | string
  freightLookAuthFlag: string
  defaultValue: number | string
  defaultTips: number
}

interface InternalState {
  radioChecked: boolean
  agreementContent: string
  buttonLoading: boolean
}

const props = defineProps<Props>()

const collectionAmount = ref('')
const collectionAmountLocal = ref('') // 代收货款输入中数据
const collectionFee = ref()

const loading = ref(false)

const paymentInputRef = ref() // 代收货款input

const internalState: InternalState = reactive({
  radioChecked: false,
  agreementContent: '',
  buttonLoading: false,
})

const { useCollectionAmountValidatePassed } = useValidate()

const collectionAmountLength = computed(() => {
  return collectionAmount.value ? collectionAmount.value.toString().length : 0
})

const collectionAmountLocalLength = computed(() => {
  return collectionAmountLocal.value ? collectionAmountLocal.value.toString().length : 0
})

const initAgreeContent = async () => {
  const { data } = await getHelpContent({ type: 5 })
  internalState.agreementContent = data.content.replace(/&nbsp;/g, ' ')
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

onMounted(async () => {
  setTimeout(() => {
    initAgreeContent()
  })
})

const resetData = () => {
  collectionAmount.value = ''
  collectionAmountLocal.value = ''
  collectionFee.value = ''
}

const handleRadio = async () => {
  internalState.radioChecked = !internalState.radioChecked
}

const emit = defineEmits(['close', 'agreementSelectedChange'])

const handleClosePopup = async () => {
  closed()
}

const closed = () => {
  isHidePopupConfirmBtn.value = false
  emit('close')
  resetErrorClassByDom([
    {
      key: 'addedService.collectionAmount',
      passed: true,
    },
  ])
}

const beforeRouteClose = () => {
  closed()
}

const onOpen = () => {
  isHidePopupConfirmBtn.value = true
  collectionAmount.value = props.defaultValue as string
  collectionFee.value = props.defaultTips
}

const handleConfirm = async () => {
  const result = await useCollectionAmountValidatePassed(collectionAmount.value)
  await effectBubble([result])
  emit('agreementSelectedChange', internalState.radioChecked, collectionAmount.value)
  closed()
  await agreementSave({ type: 5, flag: internalState.radioChecked ? 1 : 0 })
}

const orderInfo = computed(() => {
  // 处理运单数据orderInfo
  let storeOrderFormData = piniaStore.order.orderState
  const addedServiceData = {
    ...storeOrderFormData.addedService,
    collectionAmount: collectionAmount.value,
  }
  return Object.assign({}, storeOrderFormData, { addedService: addedServiceData })
})

const onInput = debounce(async () => {
  const processQuery = {
    orderInfo: orderInfo.value,
    typeList: ['addedService.collectionAmount'],
    elementsChange: [undefined],
    moduleStyle: '',
  }
  const { data } = await addedServiceFeeProcess(processQuery)
  collectionFee.value = data?.collectionAmount?.collectionFee || ''
}, 300)

const onBlur = async () => {
  console.log('onBlur', typeof collectionAmount.value, collectionAmount.value)
  if (collectionAmount.value !== '' && Number(collectionAmount.value) === 0) {
    collectionAmount.value = '0'
    const result = await useCollectionAmountValidatePassed(collectionAmount.value)
    effectBubble([result])
  }
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
}, 1000)

/* 清空代收货款输入框 */
const handlePaymentClear = () => {
  if (paymentInputRef?.value?.inputRef?.clear) {
    paymentInputRef?.value?.inputRef?.clear()
  }
}

const handleCancelPopup = async () => {
  resetData()
  closed()
  emit('agreementSelectedChange', internalState.radioChecked, '')
  await agreementSave({ type: 5, flag: internalState.radioChecked ? 1 : 0 })
}
</script>

<style lang="scss">
@import './index.scss';
</style>
