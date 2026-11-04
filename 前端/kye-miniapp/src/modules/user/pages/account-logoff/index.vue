<template>
  <ky-container v-bind="pageOptions" style="background-color: #fff">
    <view class="account-cancellation__container">
      <view class="account-cancellation__container-tips">
        <image
          class="warning-icon"
          src="https://ic-img.ky-express.com/netc/20231023_79162366186_!!1698050209279_128_130.svg+xml"
          alt=""
        />
        <view class="user-label">尊敬的用户</view>
        <view class="confirm-warning">如注销请确认以下内容并谨慎操作</view>
      </view>

      <view class="account-cancellation__container-desc">
        <view class="desc-item">
          <view class="desc-item-label">无法再使用该账号</view>
          <view>跨越旗下多项产品将无法再使用此账号，如跨越速运APP、跨越寄件小程序、跨越速运客户端、跨越速运官网等</view>
        </view>

        <view class="desc-item">
          <view class="desc-item-label">账号信息清空且无法找回</view>
          <view>清除账号信息、身份信息等，且无法找回</view>
        </view>
      </view>

      <view class="account-cancellation__container-contact">
        注销过程中如有任何疑问，可致电<text class="contact-phone" @tap="handleContact">95324</text>
      </view>

      <view class="account-cancellation__footer">
        <view class="cancellation-agreement">
          <ky-popover
            class="agreement-popover-tip"
            v-model:show="state.popoverTipShow"
            location="top-start"
            theme="dark"
            teleport
            :offset="[-14, 4]"
            trigger="manual"
            :close-on-click-outside="false"
          >
            <template #reference>
              <ky-checkbox
                type="check"
                :modelValue="state.agreementChecked"
                checked-color="#9673F6"
                :icon-size="16"
                @update:modelValue="handleCheckAgreement"
              >
                <view class="cancellation-submit-popovers">
                  我已阅读并同意
                  <view class="agreement-btn" @tap.stop="handleAgreementShow">《注销协议》</view>
                </view>
              </ky-checkbox>
            </template>

            <template #content>
              <view>请先阅读并勾选协议</view>
            </template>
          </ky-popover>
        </view>
        <ky-button type="primary" class="cancellation-submit-btn" :disabled="btnIsDisabled" @tap="handleConfirm">
          已清楚风险，确定注销
        </ky-button>
      </view>

      <SmsCodePopup :captchaType="captchaType" v-model:show="state.smsCodeShow" @next="handleNext"></SmsCodePopup>
      <AgreementPopup
        title="注销协议"
        agreed-text="我知道了"
        v-model:show="state.agreementShow"
        :agreement-code="agreementCode"
        :page-code="pageCode"
        :disabled-text="disabledText"
        :enabled-text="enabledText"
        :agreed="state.agreementChecked"
        @confirm="handleAgreementConfirm"
      />
    </view>
  </ky-container>
</template>
<script lang="ts" setup>
import Taro from '@tarojs/taro'
import SmsCodePopup from '@/modules/user/components/sms-code-popup/index.vue'
import AgreementPopup from '@/modules/user/components/agreement-popup/index.vue'
import { reactive, computed, watch, ref, onMounted } from 'vue'
import { useUserInfo } from '@/public/hooks'
import { AGREEMENT_ID, SMS_CODE_TYPE } from '../../constants'
import './index.scss'
import plateform from '@kye-netc/plateform'
import { getEnvConfig } from '@/public/constants'

const pageOptions = ref({
  navBarOptions: { showPlatList: ['wx'], title: '注销账号' },
})

const captchaType = 11

defineOptions({ name: 'AccountCancellation' })

const state = reactive({
  agreementId: AGREEMENT_ID.LOG_OFF,
  agreementShow: false,
  agreementDialogAgreed: false,
  agreementChecked: false,
  smsCodeShow: false,
  popoverTipShow: false,
  firstChecked: false,
  captchaType: SMS_CODE_TYPE.LOG_OFF,
})

const disabledText = '滑动阅读此协议'
const enabledText = '同意此协议，下次不再提醒'

// 按钮是否可以点击，协议弹窗里面点击同意过 && 已阅读并同意check了才可以点击注销协议按钮
const btnIsDisabled = computed(() => {
  return !state.agreementDialogAgreed || !state.agreementChecked
})

watch(
  () => state.agreementChecked,
  (val) => {
    state.popoverTipShow = !val
  },
)
const { userInfo } = useUserInfo()
const storageKey = computed(() => {
  return 'agreementDialogAgreed' + userInfo.value.id
})

onMounted(() => {
  state.agreementDialogAgreed = Taro.getStorageSync(storageKey.value) || false
})

const getUserPhone = () => {
  return userInfo.value.phone
}

// 点击拨打电话
const handleContact = () => {
  plateform.makePhoneCall({ phoneNumber: '95324' })
}

// 协议弹窗点击同意注销按钮
const handleAgreementConfirm = () => {
  state.popoverTipShow = false
  state.agreementShow = false
  state.agreementDialogAgreed = true
  state.agreementChecked = true
  Taro.setStorageSync(storageKey.value, true)
}

// 勾选协议
const handleCheckAgreement = (value) => {
  if (!value) {
    state.agreementChecked = false
    return
  }

  if (state.agreementDialogAgreed) {
    state.agreementChecked = true
  } else {
    state.agreementShow = true
  }
}

// 短信验证通过后下一步跳转注销反馈页面
const handleNext = () => {
  state.smsCodeShow = false
  Taro.navigateTo({ url: '/modules/user/pages/account-logoff-feedback/index' })
}

// 确定注销
const handleConfirm = async () => {
  const phone = getUserPhone()
  if (!phone) {
    Taro.showToast({ title: '用户信息获取失败', icon: 'none' })
  }
  state.smsCodeShow = true
}

const handleAgreementShow = () => {
  state.agreementShow = true
}

const { isProd } = getEnvConfig()

const pageCode = computed(() => {
  return isProd ? 'KY01_0004' : 'KY35_0004'
})

const agreementCode = computed(() => {
  return isProd ? 'KY_2507090001' : 'KY_2507040003'
})
</script>
