<template>
  <div class="icon-eye-hot-wrap">
    <span @click="onClick" class="icon-eye-content" :class="showPassword ? 'openicon' : 'closeicon'"></span>
  </div>
</template>

<script setup lang="ts">
/**
 * 密码可见切换图标(TS 版, 局部化)
 * 来源: customer-code 引用的 @views/login/components/icon-eye.vue (netc-pc-web)
 */
defineOptions({ name: 'icon-eye' })

withDefaults(defineProps<{ showPassword?: boolean }>(), {
  showPassword: false,
})

const emit = defineEmits(['onClick'])

const onClick = () => {
  emit('onClick')
}

const preloadImages = () => {
  const images = [
    'https://ic-img.ky-express.com/netc/20251224_51215_!!1766576852874_14_14.svg+xml',
    'https://ic-img.ky-express.com/netc/20251224_7951_!!1766576860126_14_14.svg+xml',
    'https://ic-img.ky-express.com/netc/20251224_49099_!!1766576878632_14_14.svg+xml',
    'https://ic-img.ky-express.com/netc/20251224_98528_!!1766576886332_14_14.svg+xml',
    'https://ic-img.ky-express.com/netc/20251224_9720_!!1766576835836_14_14.svg+xml',
    'https://ic-img.ky-express.com/netc/20251224_30436_!!1766576845558_14_14.svg+xml',
  ]
  images.forEach((src) => {
    const img = new Image()
    img.src = src
  })
}

preloadImages()
</script>

<style lang="scss" scoped>
.icon-eye-hot-wrap {
  display: flex;
  height: 40px;
  width: 40px;
  justify-content: center;
  align-items: center;
  cursor: pointer;
}
.icon-eye-content {
  height: 14px;
  width: 14px;
  &.openicon {
    background: url('https://ic-img.ky-express.com/netc/20251224_51215_!!1766576852874_14_14.svg+xml');
    background-size: 100% 100%;
    &:hover {
      background: url('https://ic-img.ky-express.com/netc/20251224_7951_!!1766576860126_14_14.svg+xml');
      background-size: 100% 100%;
    }
    &:active {
      background: url('https://ic-img.ky-express.com/netc/20251224_49099_!!1766576878632_14_14.svg+xml');
      background-size: 100% 100%;
    }
  }
  &.closeicon {
    background: url('https://ic-img.ky-express.com/netc/20251224_98528_!!1766576886332_14_14.svg+xml');
    background-size: 100% 100%;
    &:hover {
      background: url('https://ic-img.ky-express.com/netc/20251224_9720_!!1766576835836_14_14.svg+xml');
      background-size: 100% 100%;
    }
    &:active {
      background: url('https://ic-img.ky-express.com/netc/20251224_30436_!!1766576845558_14_14.svg+xml');
      background-size: 100% 100%;
    }
  }
}
</style>
