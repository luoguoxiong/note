<template>
  <div class="protect-price-input-wrapper" :class="{ disabled: disabled }" type="ProtectPrice" :visible="visible">
    <div class="protect-price-input">
      <div class="flex items-center font-level3 space-between protect-price-input-title">
        <div class="title-label" v-exposure-report="exp_express_single_value_v1()">
          <span>物品保价</span>
          <span class="tip-icon">
            <img
              class="icon-item"
              @click="handleClickTipsPrice"
              src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABwAAAAcCAMAAABF0y+mAAAAeFBMVEUAAABoa3Voa3Voa3Voa3Voa3Voa3Voa3Voa3Voa3Voa3Voa3Voa3Voa3Voa3Voa3Voa3Voa3Voa3Voa3Voa3Voa3Voa3Voa3Voa3Voa3Voa3Voa3Voa3Voa3Voa3Voa3Voa3Voa3Voa3Voa3Voa3Voa3Voa3Voa3UTizDBAAAAJ3RSTlMA0wSN+cFHOPXpzMcpEAmvmi7i3NiAIBXvqHsyGaWiiGtjSiW2W1GiRpRnAAABJklEQVQoz41S2YKDIAwU1BbQVut9Hz12/v8PV0EbWV+WB0iYMMkkOP9bj8ZPhUj95nGCWgVAKiUBBFcLKnpATeVqlpMC+oKwF4N6kvtkYK/duWWI70eie4xsv3jD/VuCi94YF/hcG1dfiuCjTe7jok/mmeJ/gCQBGiMMTMdjMIkk8pXPM9lqrIJGXEyNkHwJAdot2bjsWcUNUT4veweEJmu18nqBQ4tHYJsZeItIRAfsjWSXH+FmgzHSziHQoi2gSyRaJ5Ff/4qKWKpEU1kTosB4FUSd/UDeqLtaPvPC7wXazQw9ZjfeKeNp2anxpujxPLKahp3bWE7DdooUQ0dQNyAtyC0ZhBtupbgCqjzy8JkBrHbdej1nfvq5eSAAYX1q630YWm9+AfILFjMMNaUdAAAAAElFTkSuQmCC"
            />
          </span>
          <SvgIcon
            name="required"
            class="protect-price-input-required"
            v-if="required && ((restrictData && restrictData?.insuranceAccepted !== false) || !restrictData)"
          ></SvgIcon>
        </div>
        <div class="color-sub-title flex items-center" @click="handleClickTips">
          <span class="sub-title-text"> 保价声明 </span>
          <span class="desc-icon-span">
            <SvgIcon name="tip-label-color" class="desc-icon ml-8" />
          </span>
        </div>
      </div>
      <div
        class="protect-price-input-content"
        :data-validate="!visible ? 'protectPrice.declarativeValue' : ''"
        :id="visible ? '' : 'protectPrice_declarativeValue'"
        v-hotZone="{
          moduleType: ModuleType['物品保价'],
          visible: hotZoneVisible,
          validateCallback: validateCallback,
        }"
      >
        <div
          class="protect-price-input-overlay"
          v-if="!internalState.agreementSelected"
          v-click-report="{
            eventCode: 'clk_express_single_value_v1',
          }"
          @click="() => handlePopupVisible(true)"
        ></div>
        <div
          class="protect-price-input-overlay"
          v-if="restrictData?.insuranceAccepted === false"
          @click="handleShowToast"
        ></div>
        <KyInput
          :data-validate="!visible ? 'protectPrice.declarativeValue' : ''"
          noPadding
          show-border
          v-model.number="declared"
          type="number"
          clearable
          :enableNative="false"
          :enableWxNative="true"
          :inputDebounce="600"
          :placeholder="
            restrictData && restrictData?.insuranceAccepted === false ? restrictData?.tipMsg : '请输入声明价值'
          "
          :disabled="restrictData && restrictData?.insuranceAccepted === false"
          :maxlength="9"
          @input="_onInput"
          @update="onInput"
          @blur="onBlur"
          @focus="onFocus"
          @clear="onClear"
          v-keyboard
          ref="inputRef"
        >
          <template
            #right
            v-if="
              !(restrictData?.declarativeAccepted && restrictData?.insuranceAccepted) &&
              restrictData?.insuranceAccepted !== false
            "
          >
            <div class="boofee flex line-height-0" v-if="freightLookAuthFlag === FreightLookAuthFlagEnum['有权限']">
              保费&nbsp;<span class="color-error line-height-0">{{ premiumShow || '-- ' }}</span
              >元
            </div>
            <div v-else-if="freightLookAuthFlag === FreightLookAuthFlagEnum['无权限']" class="flex">
              <span class="color-primary">保费&nbsp;</span>
              <SvgIcon class="four-star-tips" name="four-star-tips"></SvgIcon>
              <span>元</span>
            </div>
            <div v-else class="flex"><span class="color-primary">保费&nbsp;</span>--</div>

            <div v-if="!(restrictData?.declarativeAccepted && restrictData?.insuranceAccepted)">
              <div
                v-show="Number(declaredLocal?.toString().replace(/[^\d]/g, '')) > 9999"
                class="item-insured-com-form-chinese font-special color-assist"
                :style="{ left: (declaredLocalLength * 19 + 40) / 7.5 + 'vw' }"
              >
                {{ filterChinese(declaredLocal?.toString().replace(/[^\d]/g, '')) }}
              </div>
            </div>
          </template>
        </KyInput>
      </div>
      <div
        class="protect-price-input-tips pt-16 font-level4"
        v-if="restrictData?.tipMsg && restrictData?.insuranceAccepted"
      >
        <span class="color-error protect-price-input-tips-content">{{ restrictData?.tipMsg }}</span>
      </div>
      <div
        class="protect-price-input-tips flex mt-8"
        v-else-if="moduleDimensionData?.reminderTips && !restrictData?.tipMsg"
      >
        <span class="icon-content">
          <SvgIcon name="dollar-reminder-line" class="icon font-level3"></SvgIcon>
        </span>
        <span class="text-content font-level4 color-error white-space-normal">{{
          moduleDimensionData?.reminderTips
        }}</span>
      </div>
      <div class="protect-price-input-tips flex" v-if="goodsSupplementProtectPriceTips">
        <span class="icon-content">
          <SvgIcon name="dollar-reminder-line" class="icon font-level3"></SvgIcon>
        </span>
        <span class="text-content font-level4 color-error">{{ goodsSupplementProtectPriceTips }}</span>
      </div>
    </div>
    <ProtectPriceDesc
      v-if="asynrender"
      :visible="visible"
      :required="required"
      :goodsSupplementProtectPriceTips="goodsSupplementProtectPriceTips"
      @close="handleClosePopup"
      @agreementSelectedChange="onAgreementSelectedChange"
      :key="key"
    ></ProtectPriceDesc>

    <ContactBusiness v-model:show="popupVisible" :phone="phone" />
  </div>
</template>

<script setup lang="ts">
import ContactBusiness from '@/public/components/business/contact-business/index.vue'
import KyInput from '@order-public-sub-public/components/base/ky-input'
import { reactive, onMounted, computed, watch, ref } from 'vue'
// import { useDidShow } from '@tarojs/taro'
import { useStore } from '@order-public-sub-public/store'
import SvgIcon from '@order-public-sub-public/components/ui/svg-icon/index.vue'
// import { getAgreementDefaultSelect } from '@order-public-sub-public/apis/waybill/agreement'
import ProtectPriceDesc from '../protect-price-desc/index.vue'
import { OrderSuccessPageConfig } from '@order-public-sub-public/types'
import {
  ProtectPriceDimension,
  AddedServiceDimension,
  ProtectPrice,
  ProtectPriceConfig,
  localCheckResult,
  GoodsSupplementDimension,
} from '@order-public-sub-public/types'
import { ModuleType, OrderPageType } from '@order-public-sub-public/constants'
import { useUpdateOrderStore } from '../../hooks/useModuleStore'
import { FreightLookAuthFlagEnum } from '@order-public-sub-public/components/business/added-service/types'
import { filterChinese } from '../../utils/index'
import { useDeclared, usePremium, useVisible, usePremiumType, useOriginalDeclared } from '../../hooks/useState'
import { useValidate } from '../../hooks/useValidate'
import { contactPopup } from '@order-public-sub-public/components/business/contact-business'
import { showToast } from '@order-public-sub-public/hooks/useShowToast'
import vKeyboard from '@order-public-sub-public/directives/keyboard'
import { useHotZone } from '@order-public-sub-public/hooks/useHotZone'
import { isNull, debounce } from 'lodash-es'
import { useRouter } from '@order-public-sub-public/vue-router/index'
import { getUserSettingInfoByKey } from '@order-public-sub-root-pages/order-single/hooks/useInit'
import { resetErrorClassByDom } from '@order-public-sub-public/validate/effect/effectBubble'
import { premiumType } from '../../hooks/state'
import useEffect from '@order-public-sub-public/validate'
import { localStorage } from '@order-public-sub-public/utils/storage'
import { asynrender } from '@order-public-sub-public/hooks/asynrender'
import { taroAutoScrollToPosition } from '@order-public-sub-public/validate/utils'
const piniaStore = useStore()
import {
  clk_express_single_insurance_statement_v1,
  exp_express_single_value_v1,
  other_express_insured_control_v1,
  other_express_single_value_v1,
  clk_express_insured_v1,
  exp_express_insured_popup_v1,
  clk_express_insured_notips_v1,
  protectpricePopoupClosedReport,
} from '@order-public-sub-public/components/business/protect-price/hooks/report'
import { getEnvConfig } from '@/public/config'
import Taro from '@tarojs/taro'

interface InternalState {
  agreementSelected: boolean // 是否勾选过协议
}
defineProps<{ disabled?: boolean }>()

const { validateCallback, hotZoneVisible } = useHotZone(ModuleType['物品保价'])

const router = useRouter()

const popupVisible = ref(false)
const { declared, setDeclared } = useDeclared()
const { premium, setPremium } = usePremium()
const { setPremiumType } = usePremiumType()
const { visible, setVisible } = useVisible()
const { setOriginalDeclared } = useOriginalDeclared()

const { useProtectPriceValidate } = useValidate()

const { remoteCheck } = useEffect()
const phone = ref()

const key = ref(0)
const declaredLocal = ref(declared.value || '')
const inputRef = ref()

const internalState: InternalState = reactive({
  agreementSelected: true,
})

const moduleDimensionData = computed(() => {
  return piniaStore.schema.moduleDimensionData(ModuleType['物品保价'])
})

const goodsSupplementProtectPriceTips = computed(() => {
  return piniaStore.schema.moduleDimensionData(ModuleType['是否裸货旧货'])?.goodsSupplementProtectPriceTips
})

const moduleFormData = computed(() => {
  return piniaStore.order.moduleFormData(ModuleType['物品保价'])
})

const required = computed(() => piniaStore.schema.moduleConfigData(ModuleType['物品保价'])?.fieldsConfig?.[0]?.required)

const restrictData = computed(() => {
  return piniaStore.globalData.restrictData?.insuranceRestrict
})

const onFocus = () => {
  taroAutoScrollToPosition('protectPrice_declarativeValue', 500)
  clk_express_insured_v1(declared.value)
}

const onClear = () => {
  declaredLocal.value = ''
}

/* 触发删除逻辑 */
// const handleDeclareClear = () => {
//   if (inputRef?.value?.inputRef?.clear) {
//     inputRef?.value?.inputRef?.clear()
//   }
//   onClear()
// }

watch(
  [restrictData, moduleDimensionData],
  () => {
    if (restrictData.value && restrictData.value?.insuranceAccepted === false) {
      useUpdateOrderStore({ declarativeValue: '' })
      setDeclared('')
      setPremium('')
      // 清除副作用
      setTimeout(() => {
        resetErrorClassByDom([{ key: 'protectPrice.declarativeValue', passed: true, content: '' }])
      })
    }
    if (moduleDimensionData.value) {
      setPremium(moduleDimensionData.value?.defaultPremium ? moduleDimensionData.value?.defaultPremium : '')
      setPremiumType(moduleDimensionData.value?.premiumType || null)
    }
  },
  { deep: true },
)

watch(
  moduleFormData,
  () => {
    if (moduleFormData.value) {
      setPremiumType(moduleFormData.value?.premiumType || null)
      setDeclared(moduleFormData.value?.declarativeValue || '')
      // 变更需要重新计算
      _onInput(moduleFormData.value?.declarativeValue)
    }
  },
  { deep: true },
)

const freightLookAuthFlag = computed(() => {
  return piniaStore.schema.moduleDimensionData(ModuleType['增值服务'])?.freightLookAuthFlag
})

onMounted(() => {
  getDefaultSelect()
  // 兼容批量寄
  const orderPageType = piniaStore.root.getOrderPageType
  if (orderPageType === OrderPageType.批量寄 || orderPageType === OrderPageType.批量寄单票) {
    if (moduleFormData.value) {
      setPremiumType(moduleFormData.value?.premiumType || null)
      setDeclared(moduleFormData.value?.declarativeValue || '')
    }

    if (restrictData.value && restrictData.value?.insuranceAccepted === false) {
      useUpdateOrderStore({ declarativeValue: '' })
      setDeclared('')
      // setPremium('')
    }
  }
  if (moduleDimensionData.value) {
    setPremium(moduleDimensionData.value?.defaultPremium ? moduleDimensionData.value?.defaultPremium : '')
    setPremiumType(moduleDimensionData.value?.premiumType || null)
  }
  if (moduleFormData.value) {
    setPremiumType(moduleFormData.value?.premiumType || null)
    setDeclared(moduleFormData.value?.declarativeValue || '')
    _onInput(moduleFormData.value?.declarativeValue)
  }
})

// 切换客户编码后需要执行的逻辑
watch(
  () => piniaStore.globalData.initDataPromise,
  async (promise) => {
    try {
      if (!isNull(promise)) {
        await promise

        if (moduleFormData.value) {
          setPremiumType(moduleFormData.value?.premiumType || null)
          setDeclared(moduleFormData.value?.declarativeValue || '')
        }
      }
    } catch (error) {
      console.log(error)
    }
  },
)

const handlePopupVisible = (value: boolean) => {
  if (restrictData.value?.insuranceAccepted === false) {
    return
  }
  if (value) {
    setOriginalDeclared(declared.value)
  }
  setVisible(value)
  key.value += 1
  exp_express_insured_popup_v1()
}

const handleShowToast = () => {
  if (restrictData.value?.insuranceAccepted === false) {
    showToast('您的货物暂不支持保价')
  }
}

const getDefaultSelect = async () => {
  // const { data } = await getAgreementDefaultSelect({ type: 1 })
  const data = await getUserSettingInfoByKey('insuranceFeeSelectFlag')
  internalState.agreementSelected = data as boolean
}
const onInput = debounce(async () => {
  useUpdateOrderStore({ declarativeValue: declared.value.toString().replace(/[^\d]/g, '') })
  try {
    await useProtectPriceValidate({
      field: 'protectPrice',
      isOnline: true,
    })
  } catch (error) {
    if (!(error as localCheckResult)?.passed) {
      // 远程校验
      await remoteCheck('protectPrice.declarativeValue', {
        protectPrice: {
          declarativeValue: declared.value.toString().replace(/[^\d]/g, ''),
          premiumType: premiumType.value,
        },
      })
    }
    console.error(error)
  }
}, 300)

const onBlur = async () => {
  other_express_insured_control_v1(declared.value.toString().replace(/[^\d]/g, ''))
  other_express_single_value_v1(declared.value.toString().replace(/[^\d]/g, ''))
  useUpdateOrderStore({ declarativeValue: declared.value.toString().replace(/[^\d]/g, '') })
  try {
    await useProtectPriceValidate({
      field: 'protectPrice',
    })
  } catch (error) {
    console.error(error)
  }
}

const onAgreementSelectedChange = (value: boolean) => {
  internalState.agreementSelected = value
  clk_express_insured_notips_v1()
}

const premiumShow = computed(() => {
  return premium.value ? (+premium.value).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',') : 0
})

const declaredLength = ref(0)
const declaredLocalLength = ref(0)
const _onInput = (value) => {
  declaredLocal.value = value
  declaredLocalLength.value = value ? value.toString().replace(/[^\d]/g, '').length : 0
  onFormatter(value)
}

const { platformInputDebounceTime } = getEnvConfig()

/* 格式化处理 */
const onFormatter = debounce((value) => {
  if (formatter) {
    const formatterValue = formatter(value)
    setDeclared(formatterValue)
    declaredLocal.value = formatterValue
  }
  declaredLength.value = value ? value.toString().replace(/[^\d]/g, '').length : 0
}, platformInputDebounceTime)

// const handleContactPhone = debounce(() => {
//   let _phone = ''
//   try {
//     // 解决跳转到下单成功页 是openWebview，导致store数据丢失没有手机号的场景
//     const configJson = localStorage?.getItem('configOrderSuccessPageConfig')
//     if (configJson) {
//       const config = JSON.parse(configJson) as OrderSuccessPageConfig
//       _phone = config?.phone || ''
//     }
//     phone.value = piniaStore.root.getUserInfo?.phone || _phone || ''
//     popupVisible.value = true
//   } catch (e) {
//     console.log(e)
//   }
// }, 300)

const handleClickTips = () => {
  clk_express_single_insurance_statement_v1()
  router.push({
    path: '/item-insured-new',
  })
}

const formatter = (value: string | number) => {
  if (!value) {
    return ''
  }
  // const pattern = /^(?!0$)\d*$/
  // if (!pattern.test(value.toString())) {
  //   return ''
  // }
  let maxNum = 300000000
  if (Number(value.toString().replace(/[^\d]/g, '')) > maxNum) {
    let _value = value.toString().slice(0, 9)
    if (Number(_value) === maxNum) {
      return maxNum
    }
    return Number(value.toString()[0]) >= 3 ? value.toString().slice(0, 8) : value.toString().slice(0, 9)
  }
  return value.toString().replace(/^0+/g, '') // 开头数字不能为0
}

const handleClosePopup = () => {
  setVisible(false)
  key.value += 1
  protectpricePopoupClosedReport()
}

const handleClickTipsPrice = () => {
  Taro.redirectTo({
    url: '/modules/order-build-sub-pages/pages/air-contraband/index?type=additionalService',
  })
}

// 下单小程序 TODO 路由处理
// router.beforeEach((_to, from) => {
//   if (from.path === '/order-back') {
//     setDeclared(moduleFormData.value?.declarativeValue || '')
//   }
// })
</script>

<style lang="scss">
@import '@order-global-package-order-sub/styles/index.scss';
@import './index.scss';
</style>
