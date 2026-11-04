<template>
  <KDialog
    v-model="dialogVisible"
    class="verify-code-dialog__container"
    title="图形验证码"
    width="360px"
    append-to-body
    :loading="loading"
    :is-show-cancel="false"
    :disable-submit-btn="isDisabled"
    confirm-text="确定"
    @confirm="handleConfirm"
  >
    <el-form :model="formData" ref="formRef" class="ruleForm">
      <el-form-item prop="verificationCode" :error="formData.errorImgCodeTips">
        <el-input
          type="text"
          ref="textInputRef"
          placeholder="请填写图形验证码"
          v-model="formData.verificationCode"
          @keyup="handleOnKeyUp"
          @change="formData.errorImgCodeTips = ''"
          :maxlength="4"
          clearable
        ></el-input>
        <div
          v-loading="imgCodeLoading"
          :class="['verify-code', imgCodeLoading && 'is-loading']"
          @click="handleRefreshImgCode()"
        >
          <img :src="imgCodeUrl" />
        </div>
        <el-button type="primary" text @click="handleRefreshImgCode()">换一张</el-button>
      </el-form-item>
    </el-form>
  </KDialog>
</template>

<script setup lang="ts">
/**
 * 图形验证码弹窗(TS 版, 局部化)
 * 来源: netc-pc-web/src/components/ky-verify-code/index.vue
 *  - ky-dialog(:visible.sync) -> KDialog(v-model)
 *  - element-ui el-button -> @netc-design-pc/ui KButton; el-button type="text" -> text
 *  - UserService.webUamRiskVerifyGetCheckInfo/UserCheck -> 本目录 api.ts
 *  - @keyup.native -> @keyup
 */
import { computed, nextTick, reactive, ref, toRefs, watch } from 'vue'
import { KDialog } from '@netc-design-pc/ui'
import { riskVerifyGetCheckInfo, riskVerifyUserCheck } from '../api'

defineOptions({ name: 'verify-code-dialog' })

const state = reactive({
  formData: {
    verificationCode: '', // 验证码code
    errorImgCodeTips: '', // 错误提示
  },
  loading: false, // 按钮点击loading
  imgCodeLoading: false, // 图形码loading
  resolveResult: null as ((value: any) => void) | null,
  preserveParams: {} as Record<string, any>, // 保存的传参
  configObj: {} as Record<string, any>,
  dialogVisible: false, // 弹窗显示
  imgCodeUrl: '', // 图形验证码
})

const textInputRef = ref()
// 模板绑定所需的顶层引用
const { formData, imgCodeLoading, imgCodeUrl, dialogVisible, loading } = toRefs(state)

// 确定按钮是否disabled
const isDisabled = computed(() => {
  return state.formData.verificationCode?.length < 4
})

/**
 * 打开弹窗
 * @param payload 风控校验入参
 * @param configObj { unToken?: boolean }
 */
const showDialog = (payload: Record<string, any> = {}, configObj: Record<string, any> = {}) => {
  state.imgCodeUrl = ''
  state.dialogVisible = true
  state.preserveParams = payload
  state.configObj = configObj
  handleRefreshImgCode(payload)
  return new Promise((resolve) => {
    state.resolveResult = resolve
  })
}

// 处理输入框去除空格，以及报错提示时候修改值时去掉校验
const handleOnKeyUp = () => {
  state.formData.verificationCode = state.formData.verificationCode.replace(/[^\d]/g, '')
  state.formData.errorImgCodeTips = ''
}

/**
 * 获取图形验证码
 * @param params 图形验证码入参
 */
const handleRefreshImgCode = async (params?: Record<string, any>) => {
  try {
    state.imgCodeLoading = true
    const res = await riskVerifyGetCheckInfo(params || state.preserveParams, !!state.configObj.unToken)
    state.imgCodeLoading = false
    if (res.code === 0 && res.data) {
      state.imgCodeUrl = `data:image/png;base64,${res.data.imgInfo?.base64}`
    } else {
      state.imgCodeUrl = ''
    }
  } catch (e) {
    console.log(e)
    state.imgCodeUrl = ''
    state.imgCodeLoading = false
  }
}

// 确认提交
const handleConfirm = async () => {
  try {
    const params = {
      ...state.preserveParams,
      imgInfo: { verifyCode: state.formData.verificationCode },
    }
    state.loading = true
    const res = await riskVerifyUserCheck(params, !!state.configObj.unToken)
    state.loading = false
    if (res.code === 0 && res.data) {
      resultCallback({ safeVerifyId: res.data.safeVerifyId })
      state.dialogVisible = false
    } else {
      if (res?.msg) state.formData.errorImgCodeTips = res.msg
    }
  } catch (e: any) {
    console.log(e)
    if (e?.msg) state.formData.errorImgCodeTips = e.msg
    state.loading = false
  }
}

const resultCallback = (type: any) => {
  state.resolveResult && state.resolveResult(type)
}

watch(
  () => state.dialogVisible,
  (flag) => {
    if (!flag) {
      resultCallback(false)
      state.formData.verificationCode = ''
      state.formData.errorImgCodeTips = ''
    } else {
      nextTick(() => {
        textInputRef.value?.focus()
      })
    }
  }
)

defineExpose({
  showDialog,
})
</script>

<style lang="scss" scoped>
.verify-code-dialog__container {
  :deep(.ruleForm) {
    padding: 20px 0 12px;
  }
  :deep(.el-form-item__content) {
    display: flex;
    align-items: center;
    .el-input {
      width: 172px;
      .el-input__inner {
        padding: 0 30px 0 8px;
        font-size: 14px;
      }
    }
    .el-form-item__error {
      color: #ff706d;
    }
    .verify-code {
      margin: 0 12px 0 8px;
      height: 40px;
      position: relative;
      &.is-loading {
        border-radius: 4px;
        background: #f9f9f9;
        border: 1px solid #d9d9d9;
        > img {
          border-radius: 4px;
        }
      }
      > img {
        width: 78px;
        height: 100%;
      }
      .el-loading-spinner i {
        color: #03050d;
        font-size: 16px;
      }
    }
  }
}
</style>
