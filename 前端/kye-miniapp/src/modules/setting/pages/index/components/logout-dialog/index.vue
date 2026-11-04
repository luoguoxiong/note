<template>
  <ky-dialog
    v-model:show="show"
    title="温馨提示"
    show-cancel-button
    confirm-button-text="退出"
    :before-close="beforeClose"
    :z-index="200"
  >
    <div class="add-label-container">您确定要退出登录吗？</div>
    <template v-slot:footer>
      <div class="label-footer-content">
        <div class="btn cancel" @click="close">取消</div>
        <div class="btn confirm" @click="confirm">
          <image
            src="https://ic-img.ky-express.com/netc/20260305_62789_!!1772701746355_56_56.png"
            v-if="loading"
            class="loading-img"
          ></image
          >确定
        </div>
      </div>
    </template>
  </ky-dialog>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { onUserLogout, logOutToast } from '@/modules/user/pages/login/hooks/useLogout'
import { appPushLogoutOff } from '@public/utils/appPush'
import { report_CLK_event } from '@public/utils/reportUtil'

const show = ref(false)
const loading = ref(false)

const emit = defineEmits(['confirm', 'edit'])

const open = () => {
  show.value = true
}
const close = () => {
  show.value = false
  // loading.value = false
}

const beforeClose = (action: string) => {
  if (action === 'confirm') {
    return true
  } else {
    return true
  }
}

const confirm = async () => {
  loading.value = true
  report_CLK_event('clk_mine_setting_button', {
    page_code: 'page_mine_seting',
    pageName: '设置页',
    button_name: '退出登录',
  })
  await onUserLogout()
    .catch(() => {
      // 忽略接口报错
    })
    .finally(() => {
      loading.value = false
    })
  logOutToast()
  // 退登-取消极光订阅
  appPushLogoutOff()
  emit('confirm')
  return false
}

defineExpose({
  open,
  close,
})
</script>

<style lang="scss">
@import './index.scss';
</style>
