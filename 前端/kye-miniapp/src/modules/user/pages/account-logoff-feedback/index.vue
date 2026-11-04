<template>
  <ky-container v-bind="pageOptions" class="account-cancellation__feedback">
    <div class="account-cancellation__feedback-bg"></div>
    <div class="account-cancellation__feedback-reason">
      <ky-radio-group v-model="state.reasonRadio" style="width: 100vw">
        <ky-cell-group>
          <ky-cell><span class="reason-label">注销原因</span></ky-cell>
          <ky-cell
            v-for="(item, index) in state.reasonOptions"
            :key="index"
            :title="item.label"
            clickable
            @click="state.reasonRadio = item.value!"
          >
            <template #value>
              <ky-radio type="check" :name="item.value" checked-color="#9673F6" :icon-size="16"> </ky-radio>
            </template>
          </ky-cell>
        </ky-cell-group>
      </ky-radio-group>
    </div>
    <div class="account-cancellation__feedback-division"></div>
    <div class="account-cancellation__feedback-desc">
      <div class="logoff-desc">注销描述</div>
      <ky-textarea
        v-model="state.logoffDesc"
        rows="5"
        :enableNative="false"
        :cursor-spacing="100"
        placeholder="请输入您对跨越速运的反馈或意见吧～"
        :maxlength="150"
      />
    </div>

    <view class="account-cancellation__feedback-footer--holder"></view>
    <view class="account-cancellation__feedback-footer">
      <ky-button class="cancellation-submit-btn" type="primary" :disabled="btnIsDisabled" @click="handleConfirm">
        <!-- <ky-loading v-show="state.loading" size="24px" color="#ffffff" /> -->
        确定注销
      </ky-button>
    </view>
  </ky-container>
</template>
<script lang="ts" setup>
import Taro from '@tarojs/taro'
import { reactive, computed, onMounted, ref } from 'vue'
import { useLoginPublicParmas } from '@modules/user/pages/login/components/phone-login/hooks'
import { loginFromType } from '@/public/constants'
import { api, WebSsoUserLogOffIn } from '../../apis/account-logoff'
import '../account-logoff/index.scss'
import './index.scss'
import { clearUserCache } from '@/public/storage'
import { openLoginPage } from '@/public/utils/request/useLogOutTip/openLogin'

defineOptions({ name: 'AccountCancellationFeedback' })

const pageOptions = ref({
  navBarOptions: { showPlatList: ['wx'], title: '注销反馈' },
})

const { deviceType, deviceCode } = useLoginPublicParmas()

const state = reactive({
  loading: false,
  reasonRadio: '',
  logoffDesc: '',
  reasonOptions: [] as Array<{ label?: string; value?: string }>,
})

const btnIsDisabled = computed(() => {
  return !state.reasonRadio
})

onMounted(() => {
  fetchReasonList()
})

// 获取注销原因列表
const fetchReasonList = async () => {
  try {
    const res = await api('web.order.getDataDictionaryByCode', { dictionaryCode: 'eam_user_logoff_reason' })
    if (res.code === 0 && res.data) {
      state.reasonOptions = res.data.map((f) => {
        return { label: f.lookupValue, value: f.lookupCode }
      })
    }
  } catch (e) {
    state.reasonOptions = []
  }
}

// 确定注销
const handleConfirm = async () => {
  try {
    state.loading = true
    const params = { type: state.reasonRadio!, reason: state.logoffDesc!, from: loginFromType!, deviceType, deviceCode }
    const res = await api('web.ssoUser.logOff', params as unknown as WebSsoUserLogOffIn)
    state.loading = false
    if (res.code === 0) {
      clearUserCache()
      Taro.showToast({ icon: 'none', title: '注销成功' })
      setTimeout(() => {
        Taro.switchTab({ url: '/layout/pages/home/index' })
        Taro.showModal({
          title: '温馨提示',
          content: '该账号已注销，请重新登录',
          showCancel: false,
          confirmText: '去登录',
          success: () => {
            openLoginPage()
          },
        })
      }, 1800)
    }
  } catch (e) {
    state.loading = false
  }
}
</script>
