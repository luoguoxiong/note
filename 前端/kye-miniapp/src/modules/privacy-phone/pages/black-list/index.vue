<template>
  <ListPageLayout
    alert-text="黑名单内号码寄件时，无法将您的手机号填写为收件人号码。"
    button-text="添加黑名单号码"
    @button-click="handleAddBlackPhone"
  >
    <ky-empty class="phone-list__empty" description="暂未添加黑名单号码" v-if="state.total === 0" />
    <template v-else>
      <view class="phone-list__total">共{{ state.total }}个</view>
      <ky-list
        class="phone-list__content"
        :isFinished="state.isFinished"
        v-model:refreshing="state.refreshing"
        v-model:loading="state.loading"
        :isEmpty="true"
        @refresh="onRefresh"
        disabled-load
      >
        <view class="phone-list__wrapper" v-for="item in state.list" :key="item.userTel">
          <view class="phone-list__item">
            <view class="phone-list-item__phone">
              <text>{{ phoneDisplayFormatter(item.userTel) }}</text>
              <image
                class="phone-list-item__delete-icon"
                mode="aspectFit"
                src="https://ic-img.ky-express.com/netc/20250716_11728_!!1752636002472_56_56.png"
                @tap="handleDelete(item.userTel!, item.id!)"
              />
            </view>
            <view class="phone-list-item__updated-at">
              <text>设置时间：</text>
              <text>{{ item.time }}</text>
            </view>
          </view>
        </view>
      </ky-list>
    </template>
    <add-phone-popup
      v-model:show="state.showAddPhonePopup"
      :loading="state.addLoading"
      @submit="handleSubmitBlackPhone"
      placeholder="请输入手机号或座机号"
      required-message="请输入手机号或座机号"
      title="添加黑名单号码"
      field-label="手机号/座机号"
      allowTel
    />
  </ListPageLayout>
</template>

<script lang="ts" setup>
import { reactive } from 'vue'
import Taro, { useDidShow } from '@tarojs/taro'
import { useUserInfo } from '@/public/hooks'
import { api, WebUamClientPhonePrivacyListOut } from '@/modules/privacy-phone/apis/index'
import ListPageLayout from '@/modules/privacy-phone/components/list-layout/index.vue'
import AddPhonePopup from '@/modules/privacy-phone/components/add-popup/index.vue'
import '@/modules/privacy-phone/styles/list.scss'
import { report_CLK_event, report_other_event, report_pv_event, report_wrapper } from '@/public/utils'
import { getPlatformSource, phoneDisplayFormatter } from '../../utils'
import { useAutoLogin } from '@/public/utils/user/useAutoLogin'
import { getToken } from '@/public/storage'
import { isAndroidAlipay } from '../../hooks/useState'

defineOptions({ name: 'BlackList' })

const SEND_RECEIVE_TYPE = 20
const { userInfo } = useUserInfo()

const state = reactive({
  loading: false,
  refreshing: false,
  isFinished: true,
  list: [] as WebUamClientPhonePrivacyListOut['rosters'],
  total: 0,

  showAddPhonePopup: false,
  addLoading: false,
})

const fetchList = async () => {
  state.loading = true
  try {
    const { data } = await api('web.uam.client.phonePrivacy.list', { sendReceiveType: SEND_RECEIVE_TYPE })
    state.list = data.rosters || []
    state.total = data.rosters?.length || 0
  } finally {
    state.loading = false
  }
}

const onRefresh = async () => {
  state.refreshing = true
  try {
    await fetchList()
  } finally {
    state.refreshing = false
  }
}
const { autoLoginHook } = useAutoLogin()
useDidShow(async () => {
  if (!getToken()) await autoLoginHook({ needLogin: true })

  const hasLoading = state.total === 0
  if (hasLoading) {
    Taro.showLoading({ title: '加载中...' })
  }
  fetchList().finally(() => {
    hasLoading && Taro.hideLoading()
  })
  report_pv_event('page_add_recipient_blacklist')
})

const handleDelete = report_wrapper(
  async (userTel: string, id: string) => {
    const { confirm } = await Taro.showModal({
      title: '确定删除吗?',
      content: `删除后，${userTel}下单可以填写您的账号${userInfo.value.phone}为收件号码给您寄件`,
      confirmText: '确定',
      cancelText: '取消',
      confirmColor: isAndroidAlipay.value ? '#fff' : '#8365F6',
      cancelColor: '#686B75',
      showCancel: true,
    })
    report_CLK_event('clk_add_recipient_blacklist_button', {
      page_code: 'page_add_recipient_blacklist',
      button_name: confirm ? '确定' : '取消',
    })
    if (!confirm) return
    await fetchList()

    await api('web.uam.client.phonePrivacy.delete', {
      sendReceiveType: String(SEND_RECEIVE_TYPE),
      userTel,
      id,
      source: getPlatformSource(),
    })
    Taro.showToast({ title: '删除收件黑名单号码成功', icon: 'none' })
    fetchList()
  },
  [
    'clk_add_mailing_whitelist_button',
    'CLK',
    {
      page_code: 'page_add_recipient_blacklist',
      button_name: '删除黑名单',
    },
  ],
)

const handleAddBlackPhone = report_wrapper(() => {
  state.showAddPhonePopup = true
}, [
  'clk_add_recipient_blacklist_button',
  'CLK',
  { page_code: 'page_add_recipient_blacklist', button_name: '添加黑名单' },
])

const handleSubmitBlackPhone = async (userTel: string) => {
  const isPhoneNumber = /^0-9+$/.test(userTel)
  state.addLoading = true

  await api('web.uam.client.phonePrivacy.add', {
    sendReceiveType: String(SEND_RECEIVE_TYPE),
    userTel,
    source: getPlatformSource(),
    addType: 10,
  })
    .catch((err) => {
      report_other_event('other_add_mailing_blacklist', {
        phone_number: isPhoneNumber ? userTel : '',
        landline_number: isPhoneNumber ? '' : userTel,
        request_result: '失败',
        failure_reason: err.msg,
        page_code: 'page_add_recipient_blacklist',
      })
      throw err
    })
    .finally(() => {
      state.addLoading = false
    })

  Taro.showToast({ title: '添加收件黑名单号码成功', icon: 'none' })

  state.showAddPhonePopup = false
  fetchList()
  report_other_event('other_add_mailing_blacklist', {
    phone_number: isPhoneNumber ? userTel : '',
    landline_number: isPhoneNumber ? '' : userTel,
    request_result: '成功',
    page_code: 'page_add_recipient_blacklist',
  })
}

const handleValidate = ({ valid, value }: { valid: boolean; value: string }) => {
  if (valid) return
  report_other_event('page_add_recipient_blacklist', {
    page_code: 'page_add_recipient_blacklist',
    failure_reason: '号码格式不对',
    request_result: '失败',
    phone_number: value,
  })
}
</script>
