<template>
  <div class="network-pick-address_area" @click="openLocation">
    <image
      class="network-pick-address_img"
      src="https://ic-img.ky-express.com/netc/20250614_28462_!!1749864786331_56_56.png"
      alt=""
    />
    <div class="network-pick-content distance">{{ distance }}km</div>
  </div>
</template>
<script lang="ts" setup>
// import { isDesktopMiniprogram } from '@/utils/device'
import Taro from '@tarojs/taro'
import './index.scss'

const props = withDefaults(
  defineProps<{
    lng: number
    lat: number
    disabled: boolean
    branchName: string
    distance: number
    address: string
  }>(),
  {
    lng: 0,
    lat: 0,
    disabled: false,
  }
)

/**
 * @todo 完成经纬度调试
 */
const openLocation = async () => {
  // if (isDesktopMiniprogram()) {
  //   Taro.showToast({ title: '请前往手机端进行操作', icon: 'none' })
  //   return
  // }
  // await Taro.getLocation({
  //   type: 'wgs84',
  // })
  await Taro.openLocation({
    latitude: props.lat,
    longitude: props.lng,
    address: props.address,
    title: props.branchName,
    name: props.branchName,
  })
}
</script>

