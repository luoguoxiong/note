<template>
  <div id="error-refresh">
    <div class="error-msg">
      <img src="https://ic-img.ky-express.com/netc/20240513_71670395169_!!1715601002016_80_80.png" class="error-img" />
      <div class="error-info">
        <div class="error-text">{{ errorText || '您可点击重新加载或刷新，重新获取数据' }}</div>
        <KButton
          plain
          type="default"
          style="height: 24px; margin-top: 8px; font-size: 12px; width: 76px"
          @click="refresh"
          >重新加载</KButton
        >
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { KButton } from '@netc-design-pc/ui'
interface ErrorRefreshProps {
  errorText?: string
}
defineProps<ErrorRefreshProps>()
const emit = defineEmits(['refresh'])

const refresh = () => {
  emit('refresh')
}
</script>
<style lang="scss" scoped>
#error-refresh {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}
.error-msg {
  width: 218px;
  height: 80px;
  display: flex;
  align-items: center;
}
.error-img {
  width: 80px;
  height: 80px;
}
.error-info {
  width: 138px;
  height: 100%;
  padding-left: 8px;
  box-sizing: border-box;
}
.error-text {
  margin-top: 14px;
  font-size: 13px;
  color: #686b75;
}
</style>
