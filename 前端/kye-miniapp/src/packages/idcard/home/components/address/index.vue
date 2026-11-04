<template>
  <view class="idcard-address">
    <view class="form-item">
      <view class="form-item__label">
        <text>公司地址</text>
        <image
          class="require-img"
          src="https://ic-img.ky-express.com/netc/20250207_4066301157_!!1738899886935_80_48.png"
        />
      </view>
      <view class="form-item__content" @tap="onOpenAddrDialog">
        <ky-input
          type="text"
          class="form-item__input form-item__input-rightText"
          disabled
          placeholder-class="holder"
          placeholder="请选择"
          v-model="addressText"
        />
        <image
          class="icon-arrow"
          src="https://ic-img.ky-express.com/netc/20250125_8366301149_!!1737787067925_64_64.png"
        ></image>
      </view>

      <view class="form-item__position" @tap="onOpenAddrPosition">
        <image
          class="position-icon"
          src="https://ic-img.ky-express.com/netc/20250125_72766301168_!!1737787602781_64_64.png"
        ></image>
        <text class="position-text">定位</text>
      </view>
    </view>

    <ky-popup
      class="idcard-address__address-popup"
      position="bottom"
      safe-area-inset-bottom
      :is-border-radius="true"
      :show="addrDialog"
      @tap-overlay="handleClickOverlay"
    >
      <view class="title-wrap">
        <view class="big-title idcard-address__address-popup-title">请选择省市区</view>
        <view class="close-img" @tap="onCloseAddrDialog">
          <image class="imgs" src="https://ic-img.ky-express.com/default/20250813_2964_!!1755087285512_32_32.svg+xml" />
        </view>
      </view>
      <AddrSelect @select="onSelect" :reset-address="resetAddress" :default-address="defaultAddress" />
    </ky-popup>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import Taro from '@tarojs/taro'
import { getLngLatAround } from '@/packages/idcard/api/index'
import { trackEvent } from './report'
import type { AddressData, PositionResult } from './types'
import AddrSelect from '../addr-select'

const emits = defineEmits(['tap-position', 'confirm-cb'])

const addrDialog = ref(false)
const addressText = ref('')
const resetAddress = ref(false)
const defaultAddress = ref<PositionResult | null>(null)

const onOpenAddrDialog = () => {
  trackEvent('clk_page_business_card_homepage_select_address', '选择地址')
  addrDialog.value = true
}

const onCloseAddrDialog = () => {
  addrDialog.value = false
}

const onSelect = (data: AddressData) => {
  try {
    console.log('🚀 ~ onSelect ~ data:', data)
    addressText.value = `${data.province.districtName}${data.city.districtName}${data.area.districtName}${data.street.districtName}`

    defaultAddress.value = {
      ...data,

      province: data.province.districtName,
      provinceId: data.province.districtID,

      city: data.city.districtName,
      cityId: data.city.districtID,

      county: data.area.districtName,
      countyId: data.area.districtID,

      town: data.street.districtName,
      townId: data.street.districtID,
    }

    console.log('defaultAddress.value >>> ', defaultAddress.value)

    // defaultAddress
    console.log('addressText.valu >>>>>>>>>> ', addressText.value)
    emits('confirm-cb', data)
    onCloseAddrDialog()
  } catch (error) {
    console.log('地址选择错误信息: ', error)
  }
}

const getLocation = async () => {
  try {
    const { authSetting } = await Taro.getSetting()

    // 2. 未授权时发起授权请求
    if (!authSetting['scope.userLocation']) {
      await Taro.authorize({ scope: 'scope.userLocation' })
    }

    const res = await Taro.getLocation({
      type: 'wgs84',
    })
    console.log('获取位置信息成功：', res)

    try {
      const { data: result } = await getLngLatAround({
        lng: res.longitude,
        lat: res.latitude,
      })
      if (result?.length) {
        const resultAddree = result[0]
        emits('tap-position', resultAddree)
        addressText.value = `${resultAddree.province}${resultAddree.city}${resultAddree.county}${resultAddree.town}`
        resetAddress.value = true
        defaultAddress.value = resultAddree
      }
    } catch (error) {
      console.log('请求经纬度接口 error', error)
    }
  } catch (err) {
    console.error('获取位置信息失败：', err)
    Taro.showToast({
      title: '定位失败，请检查权限',
      icon: 'none',
    })
  }
}

const onOpenAddrPosition = () => {
  trackEvent('clk_page_business_card_homepage_positioning', '快速定位')
  getLocation()
}
</script>

<style lang="scss">
@import './index.scss';
</style>
