<template>
  <div class="address-block">
    <div class="left" :style="`background-color:${iconColor}`">
      <span class="left__icon">{{ iconText }}</span>
      <SwitchSenderReceive v-if="switchVisible" @onSwitchAddress="onSwitchAddress"></SwitchSenderReceive>
    </div>
    <div class="right" :class="{ 'no-margin-bottom': orderPageType === OrderPageType.批量寄 }" @click.stop="onClick">
      <!-- 未填 写 -->
      <div
        v-if="!info.person && !info.mobile && !info.fullAddress"
        class="right__unfilled"
        :data-validate="dataValidate"
      >
        <div class="header">
          <div class="header__title">
            <span class="text" :class="{ 'validate-error': popoverConfig?.content }">{{ headerText }}</span>
            <SvgIcon v-if="required" class="required" name="required" />
          </div>
          <KyButton
            v-if="addressVisible"
            class="book-btn"
            text="地址簿"
            type="default"
            v-exposure-report="exp_express_single_choise_v1(dataValidate)"
            v-click-report="clk_express_single_choise_v1(dataValidate)"
            @click.stop="onClickAddressBook"
          />
          <SvgIcon v-else class="arrow" name="order-miniapp-right-arrow" />
        </div>
        <div class="placeholder" :class="{ 'validate-error': popoverConfig?.content }" v-html="headerPlaceholder"></div>
      </div>
      <!-- 已填写 -->
      <div v-else class="right__filled" :data-validate="dataValidate">
        <div class="info">
          <div class="info__text" v-if="showPersonTips">
            <div class="name need_error" :class="{ 'validate-error': popoverConfig?.content }">
              {{ showPersonTips }}
            </div>
          </div>
          <div class="info__text" v-else>
            <div class="name need_error">{{ info.person }}</div>
            <div class="mobile need_error">{{ info.mobile || info.telephone }}</div>
          </div>
          <KyButton
            v-if="addressVisible"
            class="book-btn"
            text="地址簿"
            type="default"
            v-exposure-report="exp_express_single_choise_v1(dataValidate)"
            v-click-report="clk_express_single_choise_v1(dataValidate)"
            @click.stop="onClickAddressBook"
          />
          <SvgIcon v-else class="arrow" name="order-miniapp-right-arrow" />
        </div>
        <div class="address need_error" v-if="showAddressTips">{{ showAddressTips }}</div>
        <template v-else>
          <div
            class="location-name need_error"
            :class="{ 'margin-style': shouldShowName && !shouldShowAddress }"
            v-if="shouldShowName && info.locationName"
          >
            {{ info.locationName }}
          </div>
          <div class="address need_error" v-if="shouldShowAddress">{{ info.fullAddress }}</div>
        </template>

        <!-- 限取限派创可贴 -->
        <slot name="restrictData" />
      </div>

      <!-- 展会展馆号 -->
      <slot name="exhibition" />

      <!-- 华强北组件 -->
      <slot name="projectLocation" />
    </div>
  </div>
  <!-- AI推荐 #585134 导致挪出去了 -->
  <slot name="aiAddress" />
</template>

<script setup lang="ts">
// 组件
import SvgIcon from '@order-public-sub-public/components/ui/svg-icon/index.vue'
import SwitchSenderReceive from '@order-public-sub-public/components/ui/switch-sender-receive/index.vue'
import KyButton from '@order-public-sub-public/components/base/ky-button/index.vue'
import { getFieldDomByKey } from '@order-public-sub-public/validate/utils'

// 类型
import { PropsType } from '@order-public-sub-public/components/ui/address-block/types'
import { computed } from 'vue'
import { AddressVisibleType, OrderPageType } from '@order-public-sub-public/constants'
import { useStore } from '@order-public-sub-public/store'
import {
  exp_express_single_choise_v1,
  clk_express_single_choise_v1,
} from '@order-public-sub-public/components/business/address-book/page/report/index'
import { useValidate as globalUseValidate } from '@order-public-sub-public/hooks/useValidate'
import { useSchemaContext } from '@order-public-sub-root-pages/order-single/hooks/useContext'
const piniaStore = useStore()

const { validateObj, removeValidateKey } = globalUseValidate()

const props = withDefaults(defineProps<PropsType>(), {
  iconText: '寄',
  iconColor: '#03050D',
  headerText: '寄件人信息',
  headerPlaceholder: `<span style="color: #8365F6">点击</span><span>此处填写，请输入真实姓名</span>`,
  addressVisible: false,
  required: false,
  exhibition: false,
  dataValidate: '',
  addressVisibleType: '',
  addressEdit: false,
  switchVisible: false,
  info: () => {
    return {
      person: '',
      mobile: '',
      fullAddress: '',
      locationName: '',
      companyName: '',
      province: '',
      city: '',
      county: '',
      detailAddress: '',
    }
  },
})
const { schema } = useSchemaContext()
/* eslint-disable */
const showPersonTips = computed(() => {
  try {
    const moduleName = props.iconText === '收' ? 'Receive' : 'Sender'
    const configarr = schema.value?.module[moduleName]?.config?.fieldsConfig || []
    const personAuth = configarr.find((v: any) => v.name === 'person').required && !props.info.person
    const mobileAuth = configarr.find((v: any) => v.name === 'mobile').required && !props.info.mobile
    const telephoneAuth = configarr.find((v: any) => v.name === 'telephone').required && !props.info.telephone
    const companyNameAuth = configarr.find((v: any) => v.name === 'companyName').required && !props.info.companyName

    if ((personAuth || mobileAuth || telephoneAuth || companyNameAuth) && moduleName === 'Receive') {
      return '请完善' + props.headerText
    }
    if ((personAuth || mobileAuth || telephoneAuth || companyNameAuth) && moduleName === 'Sender') {
      return '请完善' + props.headerText
    }
    return ''
  } catch (e) {
    return ''
  }
})
/* eslint-disable */
const showAddressTips = computed(() => {
  try {
    const moduleName = props.iconText === '收' ? 'Receive' : 'Sender'
    const configarr = schema.value?.module[moduleName]?.config?.fieldsConfig || []
    // bug#454433 不单独对区县进行校验
    const addressAuth =
      configarr.find((v: any) => v.name === 'address').required &&
      (!props.info.province || !props.info.city || !props.info.detailAddress)
    if (addressAuth) {
      return '请完善' + props.iconText + '件地址'
    }
    return ''
  } catch (e) {
    return ''
  }
})

const popoverConfig = computed(() => {
  return validateObj[props.dataValidate] || {}
})

// 展示名称
const shouldShowName = computed(() => {
  return (
    (props.addressEdit && props.addressVisibleType === AddressVisibleType.NAME) ||
    props.addressVisibleType === AddressVisibleType.ALL
  )
})

// 展示地址
const shouldShowAddress = computed(() => {
  return (
    !props.addressEdit ||
    props.addressVisibleType === AddressVisibleType.ALL ||
    (props.addressEdit && props.addressVisibleType === AddressVisibleType.DETAIL)
  )
})
const emit = defineEmits(['onClick', 'onClickAddressBook', 'onSwitchAddress'])

const orderPageType = computed(() => piniaStore.root.getOrderPageType)

/**
 * 点击块
 */
const onClick = () => {
  emit('onClick')
  // 获取公共方法清除错误信息
  removeValidateKey(props.dataValidate)
}

/**
 * 点击地址簿
 */
const onClickAddressBook = () => emit('onClickAddressBook')

/**
 * 点击地址切换
 */
const onSwitchAddress = () => emit('onSwitchAddress')
</script>

<style lang="scss">
@import '@order-global-package-order-sub/styles/index.scss';
@import './index.scss';
</style>
