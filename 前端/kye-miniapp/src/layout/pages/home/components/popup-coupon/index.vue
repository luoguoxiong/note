<template>
  <View className="ord" v-if="show">
    <View className="ord__warpper">
      <View class="ord__content">
        <View class="ord__title">优惠券即将过期提醒</View>
        <View className="ord__text">
          您有
          <Text>{{ count }}张优惠券</Text>
          即将过期请您尽快使用哦~
        </View>
        <image
          src="https://ic-h5.kye-erp.com/intro/miniprogram/coupon-look.png"
          className="ord__img-look"
          @tap="hanldeGoPage"
        />
      </View>
      <View className="ord__close">
        <image
          @tap="hadlePartClose"
          src="https://ic-img.ky-express.com/netc/20250708_97743_!!1751939581511_148_144.png"
        ></image>
      </View>
    </View>
  </View>
</template>

<script setup lang="ts">
import './index.scss'
import { computed, toRefs } from 'vue'
import { useHomeStore } from '../../store'
import { openURL } from '@/modules/webview/utils'

const homeStore = useHomeStore()

const { data, updateData } = toRefs(homeStore)

const couponPopup = computed(() => data.value.couponPopup)

const show = computed(() => couponPopup.value.show)

const count = computed(() => couponPopup.value.count)

const hanldeGoPage = () => {
  updateData.value({
    couponPopup: {
      show: false,
      count: 0,
    },
  })
  const url =
    process.env.TARO_APP_ENV === 'prod'
      ? 'https://open-h5.ky-express.com/crm/crm-marketing-coupons/my-coupon/home.html#/valid'
      : 'https://open-h5-uat.ky-express.com/crm/crm-marketing-coupons/my-coupon/home.html#/valid'
  openURL(url, {
    needLogin: true,
  })
}

const hadlePartClose = () => {
  updateData.value({
    couponPopup: {
      show: false,
      count: 0,
    },
  })
}
</script>
