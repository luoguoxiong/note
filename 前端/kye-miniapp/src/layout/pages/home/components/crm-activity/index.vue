<template>
  <View className="home_ispop" v-if="show">
    <network-image :src="imageUrl" @tap="handleBottomBannerJump"></network-image>
  </View>
</template>
<script lang="ts" setup>
import { computed, toRefs } from 'vue'
import { useHomeStore } from '../../store'
import './index.scss'
import { openURL } from '@/modules/webview/utils'
const homeStore = useHomeStore()

const { data } = toRefs(homeStore)

const show = computed(() => data.value.crmActivity.show)

const imageUrl = computed(() => data.value.crmActivity.imageUrl)

const url = computed(() => data.value.crmActivity.url)

const handleBottomBannerJump = () => {
  openURL(url.value, { needLogin: true })
}
</script>
