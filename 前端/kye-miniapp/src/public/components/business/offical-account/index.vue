<template>
  <View class="home-official">
    <View class="home-official__close" @click="handleOfficialClose">
      <Image src="https://ic-img.ky-express.com/netc/20250708_57848_!!1751965664195_64_64.png"/>
    </View>
    <official-account  @error="handleOfficialError" @load="handleOfficialLoad"></official-account>
  </View>
</template>
<script setup lang="ts">
import { ref } from 'vue'
import './index.scss'

const showOfficial = ref(true)

const handleOfficialClose = () => {}

const handleOfficialError = () => {
  console.error(11)
}

const handleOfficialLoad = () => {
  console.error(22)
}
</script>
