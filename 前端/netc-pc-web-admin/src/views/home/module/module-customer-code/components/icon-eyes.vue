<template>
  <k-button link :icon="showPassword ? View : Hide" @click.stop="onClick" />
</template>

<script setup lang="ts">
import { KButton } from '@netc-design-pc/ui'
import { Hide, View } from '@netc-design-pc/icons'
/**
 * 密码可见切换图标(TS 版, 局部化)
 * 来源: customer-code 引用的 @views/login/components/icon-eye.vue (netc-pc-web)
 */
defineOptions({ name: 'icon-eyes' })

withDefaults(defineProps<{ showPassword?: boolean }>(), {
  showPassword: false,
})

const emit = defineEmits(['onClick'])

const onClick = () => {
  emit('onClick')
}
</script>
