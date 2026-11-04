<template>
  <div class="kyemap">
    <div class="map-wrap" v-if="state.longitude && state.latitude">
      <map
        optimize
        id="map"
        style="width: 100%; height: 100%"
        :longitude="state.longitude"
        :latitude="state.latitude"
        :show-location="true"
        :scale="state.scale"
        enable-building
        @regionchange="regionchange"
      >
      </map>
      <img class="pointer-img" src="https://ic-img.ky-express.com/netc/20250714_8370_!!1752479729488_90_141.png" />
      <span class="amap-location" ref="getLocation" @click.stop="moveToInitLocation"> <i></i> </span>
    </div>

    <BottomSearch ref="bottomSearchRef" @select="select" @onConfirm="onConfirm" />
  </div>
</template>

<script setup>
import Taro from '@tarojs/taro'
import { debounce } from 'lodash-es'
import { computed, nextTick, onMounted, reactive, ref, watch } from 'vue'
import { calcText } from './utils/dom'
import BottomSearch from '@order-public-sub-public/components/business/map-position/components/bottom-search/index.vue'
import { systemPermissionToast } from '@order-public-sub-public/hooks/address/useCommon'
import { showToast } from '@order-public-sub-public/hooks/useShowToast'
import { getPositionDefault } from '@order-public-sub-public/hooks/address/useCommon'
import plateform from '@kye-netc/plateform'
const emit = defineEmits(['select', 'onConfirm', 'onGetCurrentLocation'])
const bottomSearchRef = ref()
const state = reactive({
  mapCtx: null,
  longitude: null,
  latitude: null,
  initLongitude: null,
  initLatitude: null,
  move: false, // 是否是移动地图
  loading: false, // 是否是移动地图
  scale: 15,
  isSelect: false, // 是不是点击操作，是就不执行查询了
})

/**
 * 设置初始化的地图中心点
 * @param longitude
 * @param latitude
 */
const init = (longitude, latitude) => {
  state.mapCtx = Taro.createMapContext('map')
  state.longitude = longitude
  state.latitude = latitude
  state.initLongitude = longitude
  state.initLatitude = latitude
  moveToLocation(longitude, latitude)
}
/**
 * 移动到初始
 */
const moveToInitLocation = async () => {
  try {
    if (state.initLongitude == '-9999999' || state.initLatitude == '-9999999') {
      showToast('您未开启定位权限，请前往设置开启')
      return
    }
    await getCurrentLocation()
    state.mapCtx.moveToLocation({
      longitude: state.initLongitude, // 中心经度
      latitude: state.initLatitude, // 中心纬度
    })
    updateComponents(state.initLongitude, state.initLatitude)
  } catch (error) {
    showToast(error)
  }
}

/**
 * 移动到指定位置
 */
const moveToLocation = (longitude, latitude) => {
  state.mapCtx.moveToLocation({
    longitude, // 中心经度
    latitude, // 中心纬度
  })
}

/**
 * 移动中心位置
 * @param longitude
 * @param latitude
 */
const updateComponents = (longitude, latitude) => {
  // 移动中心位置
  // moveToLocation(longitude, latitude)
  state.longitude = longitude
  state.latitude = latitude
}

const getCurrentLocation = async () => {
  const { defaultLng, defaultLat } = getPositionDefault()
  let res = {}
  try {
    emit('onGetCurrentLocation')
    if (process.env.TARO_ENV === 'weapp') {
      res = await plateform.getLocation({
        type: 'gcj02', // 或 'gcj02'
      })
    } else {
      res = await plateform.getLocation({
        type: 'wgs84', // 或 'gcj02'
      })
    }
    if (res?.longitude == '-9999999' || res?.latitude == '-9999999') {
      showToast('您未开启定位权限，请前往设置开启')
    }
  } catch (err) {
    console.error('获取定位失败', err)
    if ((err && err.errCode === 2) || err.error === 13) {
      showToast('您未开启定位权限，请前往设置开启')
      return
    }
    systemPermissionToast(err)
    // 获取失败默认给总部定位
    res.longitude = defaultLng
    res.latitude = defaultLat
  } finally {
    init(res?.longitude, res?.latitude)
    if (!bottomSearchRef.value?.getKeyword?.()) {
      console.log('获取定位>>', res?.longitude, res?.latitude)
      state.loading = true
      bottomSearchRef.value?.onSearch(res?.longitude, res?.latitude, () => {
        state.move = false
        setTimeout(() => {
          state.loading = false
        }, 1000)
      })
    }
  }
}

const select = (item, isInit) => {
  state.isSelect = true
  emit('select', item)
  updateComponents(item.location.lng, item.location.lat)
  setTimeout(() => {
    state.isSelect = false
  }, 500)
}

const onConfirm = (item) => emit('onConfirm', item)

const lastUpateTime = ref(0)
const regionchange = (e) => {
  if (state.isSelect === true || state.loading) return
  if (e.type === 'end') {
    state.move = true
    state.scale = e.scale || 15
    // 查询附近
    // Taro.showToast({ title: `${Date.now() - lastUpateTime.value}`, icon: 'none' })
    if (Date.now() - lastUpateTime.value > 1000) {
      lastUpateTime.value = Date.now()
      const longitude = e.longitude || e?.detail?.centerLocation?.longitude
      const latitude = e.latitude || e?.detail?.centerLocation?.latitude
      longitude && latitude && search(longitude, latitude)
    }
  }
}

const search = debounce((longitude, latitude) => {
  if (state.loading) return
  state.loading = true
  state.longitude = longitude
  state.latitude = latitude
  // 没有keyword
  // if (!bottomSearchRef.value?.getKeyword?.()) {
  bottomSearchRef.value?.resetKeyword()
  bottomSearchRef.value?.onSearch(longitude, latitude, () => {
    state.move = false
    state.loading = false
  })
  // } else {
  //   state.move = false
  //   state.loading = false
  // }
}, 500)

onMounted(() => {
  getCurrentLocation()
})
</script>

<style lang="scss">
@import '@order-global-package-order-sub/styles/index.scss';
@import './index.scss';
</style>
