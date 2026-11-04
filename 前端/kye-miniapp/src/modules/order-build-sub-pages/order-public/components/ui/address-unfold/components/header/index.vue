<template>
  <div class="address-unfold-header">
    <div class="header">
      <div class="header__left">
        <div class="header__left__icon" :style="`background-color:${iconColor}`">
          <span class="text">{{ iconText }}</span>
          <SwitchSenderReceive v-if="switchVisible" @onSwitchAddress="onSwitchAddress"></SwitchSenderReceive>
        </div>
        <div class="header__left__content">
          <span class="text">{{ title }}</span>
        </div>
      </div>

      <div class="header__right">
        <div v-if="showOcr" class="header__right__btn mr-16">
          <KyButton plain size="mini" type="default" text="智能识别" @click="onClickOcr" />
        </div>
        <div v-if="showWxAddress && isShowWxAddAddress" class="header__right__btn">
          <KyButton plain size="mini" type="default" class="mr-16" text="微信地址" @click="onClickAppAddress" />
        </div>
        <div v-if="addressVisible" class="header__right__btn" id="addressBookReport">
          <KyButton
            plain
            size="mini"
            type="default"
            class="mr-16"
            v-if="!isAliPayClient && !isAmapApp && !isWechatEnv && isShowContacts && !isH5FSEnv"
            text="通讯录"
            @click="onClickContact"
          />
          <KyButton plain size="mini" type="default" text="地址簿" @click="onClickAddressBook" />
          <KyReport
            v-if="!isAliPayClient && !isAmapApp && !isWechatEnv && isShowContacts && !isH5FSEnv"
            eventCode="exp_express_mobilebook_v1"
            :otherParams="{ button_name: '通讯录' }"
          ></KyReport>
        </div>
        <KyReport
          v-if="addressVisible"
          eventCode="exp_express_single_choise_v1"
          regionCode="address"
          :otherParams="{
            button_name: `${props.title === '寄件人信息' ? '寄件' : '收件'}地址簿`,
            recognition_type: props.title === '寄件人信息' ? '寄件' : '收件',
          }"
        ></KyReport>
        <div
          v-if="showContact && !isAliPayClient && !isAmapApp && !isWechatEnv && isShowContacts && !isH5FSEnv"
          class="header__right__btn"
        >
          <KyButton plain size="mini" type="default" class="mr-14" text="通讯录" @click="onClickContact" />
        </div>
        <div class="header__right__btn" v-if="showContact && showWxAddress && !isShowWxAddAddress">
          <KyButton plain size="mini" type="default" class="mr-14" text="微信地址" @click="onClickAppAddress" />
        </div>
        <KyReport
          eventCode="exp_express_mobilebook_v1"
          v-if="showContact && !isAliPayClient && !isAmapApp && !isWechatEnv && isShowContacts && !isH5FSEnv"
          :otherParams="{ button_name: '通讯录' }"
        ></KyReport>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
// 组件
import SwitchSenderReceive from '@order-public-sub-public/components/ui/switch-sender-receive/index.vue'
import KyButton from '@order-public-sub-public/components/base/ky-button/index.vue'

// 类型
import { HeaderPropsType } from '@order-public-sub-public/components/ui/address-unfold/types'
import { Address } from '@order-public-sub-public/constants'
import { exp_express_single_choise_v1 } from '@order-public-sub-public/components/business/address-book/page/report'
import { isAmapApp, isAliPayClient } from '@order-public-sub-public/utils'
import { isQw, isWechatEnv, isH5FSEnv } from '@/public/utils'
import KyReport from '@order-public-sub-public/components/base/ky-report/index.vue'

const props = withDefaults(defineProps<HeaderPropsType>(), {
  iconColor: '#6B37F9',
  iconText: '寄',
  title: '寄件人信息',
  required: false,
  addressOcrVisible: false,
  addressVisible: false,
  source: '',
  switchVisible: false,
  isShowWxAddAddress: false,
  isShowContacts: true,
})

const emit = defineEmits(['onClickOcr', 'onClickAddressBook', 'onSwitchAddress', 'onClickContact', 'onClickAppAddress'])

const onClickOcr = () => emit('onClickOcr')
const onClickAddressBook = () => emit('onClickAddressBook')
const onClickContact = () => emit('onClickContact')
const onClickAppAddress = () => emit('onClickAppAddress')
const onSwitchAddress = () => emit('onSwitchAddress')

const addressBookReport = () => {
  const dataValidate = props.title === '寄件人信息' ? 'sender.sender' : 'receive.receive'
  return exp_express_single_choise_v1(dataValidate)
}

// 是否显示地址簿按钮
const showOcr = computed(
  () => props?.addressOcrVisible && (props.source === Address.SENDER || props.source === Address.RECEIVE),
)
const showContact = computed(() => {
  return props.source === Address.SENDER_ADDRESS_BOOK_PAGE || props.source === Address.RECEIVE_ADDRESS_BOOK_PAGE
})

//显示微信地址簿
const showWxAddress = computed(() => {
  return isWechatEnv && !isQw
})
</script>

<style lang="scss">
@import '@order-global-package-order-sub/styles/index.scss';
@import './index.scss';
</style>
