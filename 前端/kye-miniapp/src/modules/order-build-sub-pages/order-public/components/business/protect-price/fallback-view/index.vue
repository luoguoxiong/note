<template>
  <div class="protect-price" v-if="visible">
    <div class="protect-price-input-wrapper">
      <div class="protect-price-input">
        <div class="flex items-center font-level3 space-between protect-price-input-title">
          <div class="title-label">
            <span>物品保价</span>
            <span class="tip-icon">
              <img
                class="icon-item"
                src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABwAAAAcCAMAAABF0y+mAAAAeFBMVEUAAABoa3Voa3Voa3Voa3Voa3Voa3Voa3Voa3Voa3Voa3Voa3Voa3Voa3Voa3Voa3Voa3Voa3Voa3Voa3Voa3Voa3Voa3Voa3Voa3Voa3Voa3Voa3Voa3Voa3Voa3Voa3Voa3Voa3Voa3Voa3Voa3Voa3Voa3Voa3UTizDBAAAAJ3RSTlMA0wSN+cFHOPXpzMcpEAmvmi7i3NiAIBXvqHsyGaWiiGtjSiW2W1GiRpRnAAABJklEQVQoz41S2YKDIAwU1BbQVut9Hz12/v8PV0EbWV+WB0iYMMkkOP9bj8ZPhUj95nGCWgVAKiUBBFcLKnpATeVqlpMC+oKwF4N6kvtkYK/duWWI70eie4xsv3jD/VuCi94YF/hcG1dfiuCjTe7jok/mmeJ/gCQBGiMMTMdjMIkk8pXPM9lqrIJGXEyNkHwJAdot2bjsWcUNUT4veweEJmu18nqBQ4tHYJsZeItIRAfsjWSXH+FmgzHSziHQoi2gSyRaJ5Ff/4qKWKpEU1kTosB4FUSd/UDeqLtaPvPC7wXazQw9ZjfeKeNp2anxpujxPLKahp3bWE7DdooUQ0dQNyAtyC0ZhBtupbgCqjzy8JkBrHbdej1nfvq5eSAAYX1q630YWm9+AfILFjMMNaUdAAAAAElFTkSuQmCC"
              />
            </span>
            <SvgIcon name="required" class="protect-price-input-required" v-if="required"></SvgIcon>
          </div>
          <div class="color-sub-title flex items-center">
            <span class="sub-title-text"> 保价声明 </span>
            <span class="desc-icon-span">
              <SvgIcon name="tip-label-color" class="desc-icon ml-8" />
            </span>
          </div>
        </div>
        <div class="protect-price-input-content">
          <KyInput
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
            @input="_onFormatter"
            v-keyboard
          >
            <template
              #right
              v-if="
                !(restrictData?.declarativeAccepted && restrictData?.insuranceAccepted) &&
                restrictData?.insuranceAccepted !== false
              "
            >
              <div class="boofee flex" v-if="freightLookAuthFlag === FreightLookAuthFlagEnum['有权限']">
                保费&nbsp;<span class="color-error">{{ premiumShow || '-- ' }}</span
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
                  v-show="Number(declared.toString().replace(/[^\d]/g, '')) > 9999"
                  class="item-insured-com-form-chinese font-special color-assist"
                  :style="{ left: (declaredLength * 20 + 5) / 7.5 + 'vw' }"
                >
                  {{ filterChinese(declared.toString().replace(/[^\d]/g, '')) }}
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
          class="protect-price-input-tips flex mt-16"
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
    </div>
  </div>
</template>

<script setup lang="ts">
import KyInput from '@order-public-sub-public/components/base/ky-input'
import { reactive, onMounted, computed } from 'vue'
import { useStore } from '@order-public-sub-public/store'
import SvgIcon from '@order-public-sub-public/components/ui/svg-icon/index.vue'
import {
  ProtectPriceDimension,
  AddedServiceDimension,
  ProtectPrice,
  ProtectPriceConfig,
  GoodsSupplementDimension,
  PickModule,
} from '@order-public-sub-public/types'
import { ModuleType } from '@order-public-sub-public/constants'
import { FreightLookAuthFlagEnum } from '@order-public-sub-public/components/business/added-service/types'
import { filterChinese } from '../utils/index'
import { useDeclared, usePremium, usePremiumType } from '../hooks/useState'
import { getUserSettingInfoByKey } from '@order-public-sub-root-pages/order-single/hooks/useInit'
import { debounce } from 'lodash-es'
import { getEnvConfig } from '@/public/config'
const piniaStore = useStore()
const props = defineProps<PickModule<ProtectPriceConfig>>()
interface InternalState {
  agreementSelected: boolean // 是否勾选过协议
}

const visible = computed(() => props?.config?.fieldsConfig?.[0]?.visible)
const { declared, setDeclared } = useDeclared()
const { premium, setPremium } = usePremium()
const { setPremiumType } = usePremiumType()

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

const freightLookAuthFlag = computed(() => {
  return piniaStore.schema.moduleDimensionData(ModuleType['增值服务'])?.freightLookAuthFlag
})

onMounted(() => {
  getDefaultSelect()
  if (moduleDimensionData.value) {
    setPremium(moduleDimensionData.value?.defaultPremium ? moduleDimensionData.value?.defaultPremium : '')
    setPremiumType(moduleDimensionData.value?.premiumType || null)
  }
  if (moduleFormData.value) {
    setPremiumType(moduleFormData.value?.premiumType || null)
    setDeclared(moduleFormData.value?.declarativeValue || '')
  }
})

const getDefaultSelect = async () => {
  const data = await getUserSettingInfoByKey('insuranceFeeSelectFlag')
  internalState.agreementSelected = data as boolean
}

const premiumShow = computed(() => {
  return premium.value ? (+premium.value).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',') : 0
})

const declaredLength = computed(() => {
  return declared.value ? declared.value.toString().replace(/[^\d]/g, '').length : 0
})
const formatter = (value: string | number) => {
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

const { platformInputDebounceTime } = getEnvConfig()

const _onFormatter = debounce((value) => {
  if (formatter) {
    setDeclared(formatter(value))
  }
}, platformInputDebounceTime)
</script>

<style lang="scss">
@import '@order-global-package-order-sub/styles/index.scss';
@import '../index.scss';
@import '../components/protect-price-input/index.scss';
</style>
