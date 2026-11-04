<template>
  <div class="network-pick-address_area" @click.stop="openLocation">
    <SvgIcon v-if="props.disabled" name="navigation-icon-gray" class="navigation-icon" />
    <SvgIcon v-else name="navigation-icon" class="navigation-icon" />
    <div class="network-pick-content distance">{{ distance }} km</div>
  </div>
</template>
<script setup lang="ts">
import SvgIcon from '@order-public-sub-public/components/ui/svg-icon/index.vue'
import { isWxPcApplet } from '@order-public-sub-public/utils/device'
import { showToast } from '@order-public-sub-public/hooks/useShowToast'
import Taro from '@tarojs/taro'
import { isEmptyText } from '@order-public-sub-public/utils'
import { getPositionDefault, systemPermissionToast } from '@order-public-sub-public/hooks/address/useCommon'
import { getEnvConfig } from '@public/constants'

interface IProps {
  lng: number
  lat: number
  branchName: string
  distance: number
  address: string
  disabled: boolean
}
const props = defineProps<IProps>()

const openLocation = async () => {
  if (props.disabled) return
  const { isPc } = getEnvConfig()
  if (isWxPcApplet || isPc) {
    // PC微信小程序 不支持定位功能
    showToast('当前登录设备，暂不支持查看位置功能')
    return
  }
  let lat = props.lat
  let lng = props.lng
  const { defaultLng, defaultLat } = getPositionDefault()
  if (isEmptyText(props.lat) || isEmptyText(props.lng)) {
    // 和寄收一样 使用总部位置兜底
    lat = defaultLat
    lng = defaultLng
  }
  try {
    await Taro.getLocation({
      type: 'wgs84',
    })
    await Taro.openLocation({
      latitude: lat,
      longitude: lng,
      address: props.address,
      title: props.branchName || '[位置]',
      name: props.branchName || '[位置]',
      scale: 16,
    })
  } catch (error) {
    console.log('获取位置失败', error)
    systemPermissionToast(error)
    // return
  }
}
</script>
<style lang="scss">
@import '@order-global-package-order-sub/styles/index.scss';
@import './index.scss';
</style>
