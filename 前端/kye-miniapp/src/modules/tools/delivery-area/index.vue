<template>
  <view class="delivery-area" @click="closeSearchResultLeadPopup">
    <view class="card">
      <view class="header">
        <view class="title">查询地区</view>
        <view class="btn" @click="showImageOcr = !showImageOcr">智能识别</view>
      </view>
      <!-- 智能识别 -->
      <view class="address-ocr" v-show="showImageOcr">
        <AddressOcr @getAddressOcrData="getAddressOcrData" />
      </view>
      <view :class="['delivery-area-card-content', address && 'address']" @click="selectAddress">
        {{ address || '请选择省/市/区/乡镇' }}
        <image src="https://ic-img.ky-express.com/netc/20260108_32722_!!1767845576820_51_51.png"></image>
      </view>
      <ky-button
        class="search-btn"
        :color="!(selectDistrict || selectSubDistrict) && '#D3D5DB'"
        :disabled="!(selectDistrict || selectSubDistrict)"
        type="primary"
        :loading="loading"
        @click="search"
      >
        查询
      </ky-button>
    </view>
    <!-- 四级地址选择器 -->
    <address-select
      :key="key"
      ref="addressSelectRef"
      v-model:show="showAddressSelect"
      @change="onAddressSelect"
    ></address-select>
    <view class="card" v-if="isSend !== 0">
      <view class="search-result-title">查询结果</view>
      <view class="search-result-address">
        <image src="https://ic-img.ky-express.com/netc/20260120_54615_!!1768914681117_44_52.png"></image>
        <view>{{ searchAddress }}</view>
      </view>
      <view class="loading" v-if="loading">
        <image src="https://ic-img.ky-express.com/netc/20260112_8352_!!1768199489942_56_56.png"></image>
      </view>
      <SearchResult
        ref="searchResultRef"
        :is-send="isSend"
        :sendList="sendList"
        :address="searchAddress"
        :is-new="leadIsNew"
        :has-lead-capture="leadHasLeadCapture"
        :lead-eligibility-loading="leadEligibilityLoading"
        :hide-result-action="hideLeadResultAction"
        :has-lead-capture-activity="leadHasLeadCaptureActivity"
        :activity-id="leadActivityId"
        v-else
      ></SearchResult>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useDidShow } from '@tarojs/taro'
import './index.scss'
import AddressSelect from './components/address-select/index.vue'
import SearchResult from './components/search-result/index.vue'
import AddressOcr from './components/address-ocr/index.vue'
import { getDelevery } from './apis'
import { canSendList } from './apis/types'
import { loggedUpdateUserInfo } from '@modules/user/pages/login/service'
import { useRoleFlags } from '@/layout/pages/home/hooks'
import { useNewUserActivity } from '@/store/useNewUserActivity'
import { useUserInfo } from '@/public/hooks'
import { checkLoginSingleForce } from '@/public/hooks/useCheckAutoLogin'
import { useCommonDataHook } from '@/public/storage/hooks/useCommonHook'
import { reportDeliveryAreaPageView, reportDeliveryAreaSearchClick } from './report'

type SearchResultExpose = {
  closeLeadPopupFromOutside: () => void
}

const addressSelectRef = ref()
const searchResultRef = ref<SearchResultExpose>()
const userActivity = useNewUserActivity()
const { isLogin, hasLeadCapture, hasLeadCaptureActivity, activityParams } = useRoleFlags()
const { userInfo } = useUserInfo()
const { onSwitchUserChange } = useCommonDataHook()

const key = ref(new Date().getTime())
const address = ref('')
const selectDistrict = ref('')
const selectSubDistrict = ref('')
const loading = ref(false)
const showAddressSelect = ref(false)
const showImageOcr = ref(false)
const isSend = ref(0)
const sendList = ref<string>('')
const searchAddress = ref('')
const leadIsNew = ref(false)
const leadHasLeadCapture = ref(true)
const leadEligibilityLoading = ref(false)
const hideLeadResultAction = ref(false)
const leadHasLeadCaptureActivity = ref(false)
const leadActivityId = ref<string | number>('')

let leadEligibilityRequestId = 0

const isSupportDelivery = (value: number) => value === 10 || value === 30

const getCustomerRole = () => `${userInfo.value?.isOldCustomer ?? ''}`

const hasCustomerRole = () => ['0', '1'].includes(getCustomerRole())

const isCurrentNewCustomer = () => isLogin.value && getCustomerRole() === '0'

const refreshCustomerRoleIfNeeded = async () => {
  if (!isLogin.value || hasCustomerRole()) return

  try {
    const res = await checkLoginSingleForce()
    if (res?.code === 0 && res.data) {
      loggedUpdateUserInfo(res.data)
    }
  } catch (error) {
    console.log(error)
  }
}

const resetLeadActivityFields = () => {
  leadActivityId.value = ''
}

const hideLeadEligibility = () => {
  leadIsNew.value = false
  leadHasLeadCapture.value = true
  hideLeadResultAction.value = false
  leadHasLeadCaptureActivity.value = false
  resetLeadActivityFields()
}

const resetLeadEligibility = () => {
  leadEligibilityRequestId += 1
  leadEligibilityLoading.value = false
  hideLeadEligibility()
}

const refreshLeadEligibility = async (nextIsSend: number, forceActivityRefresh = false) => {
  const requestId = ++leadEligibilityRequestId

  hideLeadEligibility()

  if (!isLogin.value) return

  leadEligibilityLoading.value = true

  try {
    await refreshCustomerRoleIfNeeded()

    if (requestId !== leadEligibilityRequestId || !isCurrentNewCustomer()) return

    const currentPhone = userInfo.value?.phone || ''

    await userActivity.getNewCustomerInfo(forceActivityRefresh)

    console.log('[delivery-area] activityParams', activityParams.value)
    console.log('[delivery-area] hasLeadCapture', hasLeadCapture.value)
    console.log('[delivery-area] hasLeadCaptureActivity', hasLeadCaptureActivity.value)

    if (requestId !== leadEligibilityRequestId || currentPhone !== (userInfo.value?.phone || '')) return
    if (!isCurrentNewCustomer()) return

    leadIsNew.value = true
    leadHasLeadCapture.value = hasLeadCapture.value
    hideLeadResultAction.value = !hasLeadCapture.value

    if (!isSupportDelivery(nextIsSend)) return

    leadHasLeadCaptureActivity.value = hasLeadCaptureActivity.value

    const { activityId } = activityParams.value
    if (activityId) {
      leadActivityId.value = activityId
    }
  } catch (error) {
    console.log(error)
    if (requestId === leadEligibilityRequestId) {
      hideLeadEligibility()
      hideLeadResultAction.value = isCurrentNewCustomer() && !isSupportDelivery(nextIsSend)
    }
  } finally {
    if (requestId === leadEligibilityRequestId) {
      leadEligibilityLoading.value = false
    }
  }
}

onSwitchUserChange(() => {
  resetLeadEligibility()
})

watch(
  () => `${userInfo.value?.phone || ''}_${userInfo.value?.customerCode || ''}_${userInfo.value?.isOldCustomer ?? ''}`,
  (newValue, oldValue) => {
    if (oldValue && newValue !== oldValue) {
      resetLeadEligibility()
    }
  },
)

useDidShow(() => {
  reportDeliveryAreaPageView()

  if (!isSend.value) return

  if (!isCurrentNewCustomer()) {
    resetLeadEligibility()
    return
  }

  void refreshLeadEligibility(isSend.value, true)
})

const search = async () => {
  reportDeliveryAreaSearchClick(address.value)
  resetLeadEligibility()
  loading.value = true

  try {
    const params = {
      disId: selectSubDistrict.value || selectDistrict.value,
      level: selectSubDistrict.value ? 4 : 3,
    }
    const data = await getDelevery(params)
    if (data.code === 0) {
      const nextIsSend = data.data.isSend
      isSend.value = nextIsSend
      sendList.value = (data.data.canSendList || []).map((item: canSendList) => item.street).join('、')
      searchAddress.value = address.value
      void refreshLeadEligibility(nextIsSend)
    }
  } catch (error) {
    console.log(error)
  } finally {
    loading.value = false
  }
}

const selectAddress = () => {
  showAddressSelect.value = true
}

const closeSearchResultLeadPopup = () => {
  searchResultRef.value?.closeLeadPopupFromOutside()
}

const onAddressSelect = (val, district, subDistrict) => {
  if (val[3] === '暂不选择') {
    address.value = val.slice(0, 3).join('/')
  } else {
    address.value = val.join('/')
  }
  selectDistrict.value = district
  selectSubDistrict.value = subDistrict
  showAddressSelect.value = false
}

const getAddressOcrData = (data) => {
  console.log(data)
  key.value = new Date().getTime()
  showImageOcr.value = false
  if (data) {
    let tempAddress = ''
    if (data.province) {
      tempAddress += data.province
    }
    if (data.city) {
      tempAddress += '/' + data.city
    }
    if (data.county) {
      tempAddress += '/' + data.county
    }
    if (data.town) {
      tempAddress += '/' + data.town
    }
    address.value = tempAddress
    selectDistrict.value = data.countyId
    selectSubDistrict.value = data.townId
  }
}
</script>
