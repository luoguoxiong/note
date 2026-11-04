<template>
  <div>
    <k-message-box-dialog
      title="您确定要返回旧版吗？"
      v-model="state.dialogVisible"
      :before-close="beforeClose"
      :close-on-click-modal="false"
      @close="closeDialog"
      @confirm="handleConfirm"
      append-to-body
    >
      <div class="dialog-content">
        <div class="feature-lists">
          <div>返回旧版本后，您将不可使用以下功能</div>
          <div class="feature-lists-content" v-html="state.versionContent"></div>
        </div>
        <div class="feature-tips">为了提升您的体验，您使用新版本时，有任何意见可向我们反馈</div>
        <k-input
          :clearable="true"
          v-model="state.reasonText"
          type="textarea"
          :rows="3"
          :autosize="{ minRows: 3, maxRows: 7 }"
          placeholder="请填写返回原因（选填）"
          resize="none"
          maxlength="150"
        />
      </div>
    </k-message-box-dialog>
    <!-- 返回旧版loading   -->
    <div class="back-version-loading" v-show="state.showVersionLoading">
      <div class="back-version-loading__content">
        <img src="https://uc.ky-express.com/loading.gif" />
        <p>正在返回旧版</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive } from 'vue'
import { debounce } from 'lodash-es'
import { KMessageBoxDialog, KInput, KMessage } from '@netc-design-pc/ui'
import { apiBackToVersionSubmit, apiBackToVersionVersionContent } from '@/views/admin/components/header/api'
import { clk_home_version_cancel_btn, clk_home_version_confirm_btn } from './report'
import { handleBackVersion } from './backVersionUtil'

defineOptions({
  name: 'back-version-dialog',
})

const state = reactive({
  dialogVisible: false,
  // 版本内容富文本
  versionContent: '',
  // 原因
  reasonText: '',
  // 是否展示版本loading
  showVersionLoading: false,
})

const handleVersionContent = async () => {
  const res = await apiBackToVersionVersionContent({ channelCode: 'pc' })
  if (res.code === 0 && res.data) {
    state.versionContent = res.data.versionContent
  }
}

const openDialog = () => {
  handleVersionContent()
  state.dialogVisible = true
}

const beforeClose = () => {
  onClear()
}

const onClear = () => {
  state.reasonText = ''
}

const closeDialog = debounce(() => {
  onClear()
  clk_home_version_cancel_btn()
}, 200)

// 提交按钮逻辑
const handleConfirm = () => {
  state.showVersionLoading = true
  apiBackToVersionSubmit({
    channelCode: 'pc',
    feedbackContent: state.reasonText,
    menuCode: 'M3057', // 主菜单 - 新
  })
    .then((res) => {
      if (res.code === 0 && res.data) {
        // 回到旧版版本跳转
        handleBackVersion(res.data)
        setTimeout(() => {
          KMessage.success('返回旧版成功')
        }, 500)
      } else {
        state.showVersionLoading = false
      }
    })
    .catch(() => {
      state.showVersionLoading = false
    })
  clk_home_version_confirm_btn()
}

defineExpose({
  openDialog,
})
</script>

<style lang="scss" scoped>
.dialog-content {
  font-size: var(--k-font-size-13);
  color: var(--k-color-text-primary);
  line-height: var(--k-line-height-13);
  .feature-lists {
    margin-top: 16px;
    max-height: 400px;
    overflow-y: auto;
  }

  .feature-tips {
    color: var(--k-color-grey-08);
    margin: var(--k-spacing-16) 0 var(--k-spacing-4);
  }
}

.back-version-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f4f4f4;
  z-index: 9999999;
  height: 100vh;
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;

  &__content {
    text-align: center;

    img {
      width: 300px;
      height: 150px;
    }

    p {
      padding-right: 48px;
    }
  }
}
</style>
