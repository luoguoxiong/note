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
            @click.stop="onClickAddressBook"
          />
          <KyReport
            v-if="addressVisible"
            eventCode="exp_express_single_choise_v1"
            regionCode="address"
            :otherParams="{
              button_name: `${dataValidate === 'receive.receive' ? '收件' : '寄件'}地址簿`,
              recognition_type: dataValidate === 'receive.receive' ? '收件' : '寄件',
            }"
          ></KyReport>
          <SvgIcon v-else class="arrow-r" name="order-miniapp-right-arrow" />
        </div>
        <div class="placeholder" :class="{ 'validate-error': popoverConfig?.content }" v-html="headerPlaceholder"></div>
      </div>
      <!-- 已填写 -->
      <div v-else class="right__filled" :data-validate="dataValidate">
        <div class="info">
          <div class="info__text" v-if="showPersonTips">
            <div class="name need_error ky-cell-disabled-title" :class="{ 'validate-error': popoverConfig?.content }">
              {{ showPersonTips }}
            </div>
          </div>
          <div class="info__text" v-else>
            <div class="name need_error ky-cell-disabled-title">{{ info.person }}</div>
            <div class="mobile need_error ky-cell-disabled-title">
              {{
                info.mobile?.replace(/\s/g, '') ||
                `${info.telephone?.replace(/\s/g, '')}${info.extension ? '-' + info.extension : ''}`
              }}
            </div>
          </div>
          <KyButton
            v-if="addressVisible"
            class="book-btn"
            text="地址簿"
            type="default"
            @click.stop="onClickAddressBook"
          />
          <KyReport
            v-if="addressVisible"
            eventCode="exp_express_single_choise_v1"
            regionCode="address"
            :otherParams="{
              button_name: `${dataValidate === 'receive.receive' ? '收件' : '寄件'}地址簿`,
              recognition_type: dataValidate === 'receive.receive' ? '收件' : '寄件',
            }"
          ></KyReport>
          <SvgIcon v-else class="arrow-r" name="order-miniapp-right-arrow" />
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
import SvgIcon from '../svg-icon/index.vue'
import SwitchSenderReceive from '../switch-sender-receive/index.vue'
import KyButton from '../../base/ky-button/index.vue'
import KyReport from '../../base/ky-report/index.vue'

// 类型
import { PropsType } from './types'
import { computed } from 'vue'
import { clk_express_single_choise_v1 } from './report'
import { debounce } from 'lodash-es'

// 常量枚举（原 @order-public/constants）
const AddressVisibleType = {
  ALL: 'all',
  DETAIL: 'detail',
  NAME: 'name',
} as const
const OrderPageType = {
  '单票': 'order',
  '返程单': 'order-back',
  '预览': 'order-preview',
  '批量寄': 'order-batch',
  '批量寄单票': 'order-batch-waybill',
} as const

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

// 原 showPersonTips 计算属性（依赖 schema 上下文，已注释）
// const showPersonTips = computed(() => {
//   try {
//     const { schema } = useSchemaContext()
//     const moduleName = props.iconText === '收' ? 'Receive' : 'Sender'
//     const configarr = schema.value?.module[moduleName]?.config?.fieldsConfig || []
//     const personAuth = configarr.find((v: any) => v.name === 'person').required && !props.info.person
//     const mobileAuth = configarr.find((v: any) => v.name === 'mobile').required && !props.info.mobile
//     const telephoneAuth = configarr.find((v: any) => v.name === 'telephone').required && !props.info.telephone
//     const companyNameAuth = configarr.find((v: any) => v.name === 'companyName').required && !props.info.companyName
//     if ((personAuth || mobileAuth || telephoneAuth || companyNameAuth) && moduleName === 'Receive') {
//       return '请完善' + props.headerText
//     }
//     if ((personAuth || mobileAuth || telephoneAuth || companyNameAuth) && moduleName === 'Sender') {
//       return '请完善' + props.headerText
//     }
//     return ''
//   } catch (e) {
//     return ''
//   }
// })

// 原 showAddressTips 计算属性（依赖 schema 上下文，已注释）
// const showAddressTips = computed(() => {
//   try {
//     const { schema } = useSchemaContext()
//     const moduleName = props.iconText === '收' ? 'Receive' : 'Sender'
//     const configarr = schema.value?.module[moduleName]?.config?.fieldsConfig || []
//     const addressAuth =
//       configarr.find((v: any) => v.name === 'address').required &&
//       (!props.info.province || !props.info.city || !props.info.detailAddress)
//     if (addressAuth) {
//       return '请完善' + props.iconText + '件地址'
//     }
//     return ''
//   } catch (e) {
//     return ''
//   }
// })

// 原 popoverConfig 计算属性（依赖 useValidate，已注释）
// const popoverConfig = computed(() => {
//   const { validateObj } = globalUseValidate()
//   return validateObj[props.dataValidate] || {}
// })

const showPersonTips = computed(() => '')
const showAddressTips = computed(() => '')
const popoverConfig = computed(() => ({}))

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

// 原 orderPageType（依赖 Store，已注释）
// const orderPageType = computed(() => piniaStore.root.getOrderPageType)
const orderPageType = computed(() => '')

/**
 * 点击块
 */
const onClick = () => {
  emit('onClick')
  // 原 removeValidateKey（依赖 useValidate，已注释）
  // removeValidateKey(props.dataValidate)
}

/**
 * 点击地址簿
 */
const onClickAddressBook = debounce(
  () => {
    try {
      clk_express_single_choise_v1(props.dataValidate)
    } catch (error) {
      console.log(error)
    }
    emit('onClickAddressBook')
  },
  500,
  {
    leading: true,
    trailing: false,
  },
)

/**
 * 点击地址切换
 */
const onSwitchAddress = () => emit('onSwitchAddress')
</script>

<style lang="scss">
@import '../../../styles/index.scss';
@import './index.scss';
</style>
