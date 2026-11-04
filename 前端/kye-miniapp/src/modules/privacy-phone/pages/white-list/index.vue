<template>
  <ListPageLayout
    alert-text="白名单号码下单时，可填写您的号码作为寄件号码"
    button-text="添加白名单号码"
    @button-click="handleAddWhitePhone"
  >
    <ky-empty class="phone-list__empty" description="暂未添加白名单号码" v-if="state.total === 0" />
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
        <view v-for="item in state.list" :key="item.userTel" class="phone-list__wrapper">
          <view class="phone-list__item">
            <view class="phone-list-item__phone">
              <text>{{ phoneDisplayFormatter(item.userTel) }}</text>
              <view :class="['phone-list-item__tag', { 'phone-list-item__tag--sms': Number(item.addType) !== 10 }]">{{
                Number(item.addType) === 10 ? '手动授权添加' : '短信验证添加'
              }}</view>
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
    <AddPhonePopup
      title="添加白名单号码"
      field-label="手机号"
      v-model:show="state.showAddPhonePopup"
      :loading="state.addLoading"
      :formatter="phoneFormatter"
      @validate="handleValidate"
      @submit="handleSubmitWhitePhone"
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

defineOptions({ name: 'WhiteList' })

const SEND_RECEIVE_TYPE = 10
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
  report_pv_event('page_add_mailing_whitelist')
})

const handleDelete = report_wrapper(
  async (userTel: string, id: string) => {
    const { confirm } = await Taro.showModal({
      title: '确定删除吗?',
      content: `删除后，${userTel}下单不可填写您的账号${userInfo.value.phone}为寄件号码`,
      confirmText: '确定',
      cancelText: '取消',
      confirmColor: isAndroidAlipay.value ? '#fff' : '#8365F6',
      cancelColor: '#686B75',
      showCancel: true,
    })

    report_CLK_event('clk_add_mailing_whitelist_button', {
      page_code: 'page_add_mailing_whitelist',
      button_name: confirm ? '确定' : '取消',
    })
    if (!confirm) return

    await api('web.uam.client.phonePrivacy.delete', {
      sendReceiveType: String(SEND_RECEIVE_TYPE),
      source: getPlatformSource(),
      userTel,
      id,
    })
    Taro.showToast({ title: '删除寄件白名单号码成功', icon: 'none' })
    fetchList()
  },
  ['clk_add_mailing_whitelist_button', 'CLK', { page_code: 'page_add_mailing_whitelist', button_name: '删除白名单' }],
)

const handleAddWhitePhone = report_wrapper(() => {
  state.showAddPhonePopup = true
}, ['clk_add_mailing_whitelist_button', 'CLK', { page_code: 'page_add_mailing_whitelist', button_name: '添加白名单' }])

const handleSubmitWhitePhone = async (userTel: string) => {
  state.addLoading = true
  await api('web.uam.client.phonePrivacy.add', {
    sendReceiveType: String(SEND_RECEIVE_TYPE),
    userTel,
    source: getPlatformSource(),
    addType: 10,
  })
    .catch((err) => {
      report_other_event('other_add_mailing_whitelist', {
        page_code: 'page_add_mailing_whitelist',
        failure_reason: err.msg,
        request_result: '失败',
        phone_number: userTel,
      })
      Taro.showToast({ title: err.msg || '添加失败', icon: 'none' })
      throw err
    })
    .finally(() => {
      state.addLoading = false
    })

  report_other_event('other_add_mailing_whitelist', {
    page_code: 'page_add_mailing_whitelist',
    request_result: '成功',
    phone_number: userTel,
  })
  fetchList()
  state.showAddPhonePopup = false
  Taro.showToast({ title: '添加寄件白名单号码成功', icon: 'none' })
}

const handleValidate = ({ error, value }: { error: string; value: string }) => {
  if (!error) return
  report_other_event('other_add_mailing_whitelist', {
    page_code: 'page_add_mailing_whitelist',
    failure_reason: '号码格式不对',
    request_result: '失败',
    phone_number: value,
  })
}

const phoneFormatter = (value: string) => {
  return value.replaceAll(/[^0-9]/g, '').slice(0, 11)
}
</script>
