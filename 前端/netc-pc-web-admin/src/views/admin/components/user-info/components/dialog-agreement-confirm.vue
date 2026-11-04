<template>
  <KDialog
    v-model="dialogVisible"
    class="dialog-agreement-confirm"
    width="524"
    append-to-body
    :close-on-click-modal="false"
    title="温馨提示"
    cancel-text="不同意"
    confirm-text="同意并继续"
    @close="handleAgreementCheck"
    @confirm="handleAgreementCheck(true)"
  >
    <div class="agreement-content">
      <p>感谢您使用跨越寄件！</p>
      <p class="text-indent">
        我们非常重视用户的隐私和个人信息保护，希望您仔细阅读{{ AgreementLabel.USER_AGREEMENT }}和{{
          AgreementLabel.PRIVACY_AGREEMENT
        }}，详细了解我们对信息的收集、使用方式，以便您更好地了解我们的服务并作出适当的选择。如您同意隐私政策和用户协议，请点击“同意并继续”并开始使用我们的产品及服务。若点击“不同意”则相关服务不可用。
      </p>
      <p class="text-indent">
        点击查看完整的
        <span class="agreement-text" @click="handleOpenAgreement('user')">{{ AgreementLabel.USER_AGREEMENT }}</span>
        和
        <span class="agreement-text" @click="handleOpenAgreement('privacy')">
          {{ AgreementLabel.PRIVACY_AGREEMENT }}
        </span>
      </p>
    </div>
  </KDialog>
</template>

<script setup lang="ts">
/**
 * 协议确认弹窗
 * 来源: netc-pc-web/src/views/layout/switch-login-mobile/components/dialog-agreement-confirm.vue
 */
import { computed, reactive, watch } from 'vue'
import { KDialog } from '@netc-design-pc/ui'
import { AgreementLabel } from '../constants'

defineOptions({ name: 'DialogAgreementConfirm' })

const emit = defineEmits<{
  (e: 'openAgreement', type: 'user' | 'privacy'): void
}>()

const state = reactive({
  dialogVisible: false,
  resolveResult: null as ((value: boolean) => void) | null,
})

const dialogVisible = computed({
  get: () => state.dialogVisible,
  set: (val) => {
    state.dialogVisible = val
  },
})

// 打开弹窗
const showDialog = () => {
  state.dialogVisible = true
  return new Promise<boolean>((resolve) => {
    state.resolveResult = resolve
  })
}

/** 打开协议弹窗 */
const handleOpenAgreement = (type: 'user' | 'privacy') => {
  emit('openAgreement', type)
}

const handleAgreementCheck = (check = false) => {
  if (check) resolveResultCallback(true)
  state.dialogVisible = false
}

const resolveResultCallback = (type: boolean) => {
  state.resolveResult && state.resolveResult(type)
}

watch(
  () => state.dialogVisible,
  (val) => {
    if (!val) resolveResultCallback(false)
  }
)

defineExpose({
  showDialog,
})
</script>

<style lang="scss" scoped>
.dialog-agreement-confirm {
  .agreement-content {
    line-height: 26px;
    color: #24262b;

    .agreement-text {
      color: #7143f0;
      cursor: pointer;
    }

    .text-indent {
      text-indent: 2em;
    }
  }
}
</style>
