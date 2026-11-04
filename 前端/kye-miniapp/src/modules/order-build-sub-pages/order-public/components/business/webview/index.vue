<template>
  <web-view :id="id" :src="src" @message="onMessage" @load="onLoad" @error="onError" v-if="src" />
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useAutoLogin } from '@order-public-sub-public/utils/user/useAutoLogin'
import { getToken } from '@order-public-sub-public/storage/user'

const emit = defineEmits(['message', 'load', 'error', 'refresh'])

const props = defineProps<{ id?: string; src: string; query?: any }>()

onMounted(() => {
  const needLogin = props?.query?.needLogin
  if (needLogin && !getToken()) {
    const { autoLoginHook } = useAutoLogin()
    autoLoginHook({ needLogin: true }).then(() => {
      emit('refresh')
    })
  }
})

const onMessage = (e) => {
  emit('message', e)
}

const onLoad = (e) => {
  emit('load', e)
}

const onError = (e) => {
  emit('error', e)
}
</script>
