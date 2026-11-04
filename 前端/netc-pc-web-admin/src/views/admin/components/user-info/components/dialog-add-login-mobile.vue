<template>
  <div class="add-login-mobile__container">
    <KDialog
      v-model="state.dialogVisible"
      class="dialog-add-login-mobile"
      title="添加登录手机号"
      width="416"
      append-to-body
      :close-on-click-modal="false"
      :loading="state.loading"
      @close="handleClose('取消')"
      @confirm="handleConfirm()"
    >
      <div class="add-mobile-tips">
        <KIcon class="icon-warning" :size="13" color="#f57200"><WarningFilled /></KIcon>
        添加登录手机号成功后，将自动切换为当前登录
      </div>
      <k-form class="add-mobile-form" :model="state.formData" ref="formRef" label-position="top" @submit.prevent>
        <k-form-item label="手机号" prop="mobile" class="is-required" :error="state.formData.mobileErrorMsg">
          <KInput
            placeholder="请输入手机号"
            @keyup="handleKeyup('mobile', 11)"
            v-model="state.formData.mobile"
            @input="state.formData.mobileErrorMsg = ''"
            @blur="handleMobileBlur"
            clearable
          />
        </k-form-item>
        <k-form-item label="验证码" prop="smsCode" class="is-required" :error="state.formData.smsCodeErrorMsg">
          <KInput
            placeholder="请输入验证码"
            @keyup="handleKeyup('smsCode', 6)"
            @keyup.enter="handleConfirm()"
            @input="state.formData.smsCodeErrorMsg = ''"
            v-model="state.formData.smsCode"
            @blur="handleSmsCodeBlur"
          >
            <template #suffix>
              <div :class="['get-cms-btn', state.isCorrectMobile && 'is-correct']">
                <span v-if="state.timer" class="is-count-down">{{ state.countdownCount }}s后重新获取</span>
                <span v-else class="get-cms" @click="handleSmsCodeClick">获取验证码</span>
              </div>
            </template>
          </KInput>
        </k-form-item>
        <div class="agreement-area">
          <el-tooltip
            popper-class="switch-mobile-agreement-area__popper"
            v-model:visible="state.showAgreementPopoverTip"
            content="请先阅读协议并勾选条款"
            effect="dark"
            placement="top-start"
          >
            <span class="popover-refer"></span>
          </el-tooltip>
          <el-checkbox
            v-model="state.formData.isAgree"
            @change="handleChangeCheckbox"
            :class="[state.showAgreementPopoverTip && 'is-error']"
          >
            <span class="agreement-tips">我已阅读并同意</span>
          </el-checkbox>
          <span class="agreement-text" @click="handleOpenAgreement('user')">{{ AgreementLabel.USER_AGREEMENT }}</span>
          <span class="agreement-sub-text">和</span>
          <span class="agreement-text" @click="handleOpenAgreement('privacy')">
            {{ AgreementLabel.PRIVACY_AGREEMENT }}
          </span>
          <div class="regist-tips">未注册用户添加成功默认注册</div>
        </div>
      </k-form>
    </KDialog>

    <!-- 确认协议弹窗 -->
    <dialog-agreement-confirm @openAgreement="handleOpenAgreement" ref="DialogAgreementConfirmRef" />

    <!-- 协议弹窗 -->
    <dialog-agreement
      v-model:visible="state.dialogAgreementVisible"
      :agreementId="state.agreementId"
      @showDrawer="handleShowDrawer"
    />

    <k-drawer
      v-if="showHistoryDrawer"
      v-model="showHistoryDrawer"
      title="历史版本"
      custom-class="history-drawer-dialog"
      direction="rtl"
      :size="848"
      append-to-body
    >
      <template #header>
        <div class="history-drawer-title">
          <img
            src="https://ic-img.ky-express.com/netc/20250902_69662_!!1756804491247_32_32.png"
            @click="handleDrawerClose"
          />
          历史版本
        </div>
      </template>
      <div class="history-drawer-content">
        <h5>{{ drawerTitle }}</h5>
        <iframe ref="iframe" id="iframe" :src="distoryUrl" style="height: calc(100% - 36px); width: 100%"></iframe>
      </div>
    </k-drawer>
  </div>
</template>

<script setup lang="ts">
/**
 * 添加登录手机号弹窗
 * 来源: netc-pc-web/src/views/layout/switch-login-mobile/components/dialog-add-login-mobile.vue
 * 迁移说明: composition-api -> script setup; el-drawer visible.sync -> v-model; reportUtils -> 本目录 report.ts
 */
import { reactive, ref, watch } from 'vue'
import {
  KDialog,
  KMessage,
  KInput,
  KForm,
  KFormItem,
  KIcon,
  type KFormInstance,
  KDrawer,
  KMessageBox,
} from '@netc-design-pc/ui'
import { WarningFilled } from '@element-plus/icons-vue'
import DialogAgreement from './dialog-agreement.vue'
import DialogAgreementConfirm from './dialog-agreement-confirm.vue'
import {
  LoginSource,
  DefaultCountDown,
  ConfigFlag,
  SwitchLoginErrorCode,
  AgreementLabel,
  AgreementId,
  AddDialogCheckMessage,
  ErrorResultCode,
  VerifyDialogType,
  CAPTCHA_TYPE,
} from '../constants'
import { checkSwitchFlagApi, checkBindListApi, sendSmsCodeApi, switchLoginApi } from '../api'
import { generateBrowserUuid } from '@/stores/pc-web/deps/misc'
import { getToken } from '@/utils/auth'
import { showVerifyCodeDialog } from '@/views/home/module/module-customer-code/utils/verify-code'
import { useSwitchLoginSuccess } from '../hooks/useSwitchLoginSuccess'
import { isPROD } from '@/utils/env'
import { mobileNumber as MOBILE_REG } from '@/views/home/module/module-customer-code/utils/regular'
import { clkCenterMineAddPhonePopUpV1, expCenterMineAddPhonePopUpV1, otherCenterMineSwitchPhoneAddV1 } from '../report'

defineOptions({ name: 'DialogAddLoginMobile' })

/** 网页自定义设备类型(与 user-info/api.ts generatePcDeviceType 同逻辑) */
const generatePcDeviceType = () => {
  let pcDeviceType = localStorage.getItem('PC_DEVICE_TYPE')
  if (!pcDeviceType) {
    const date = new Date()
    const yearAndDate = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(
      date.getDate()
    ).padStart(2, '0')}`
    pcDeviceType = `PC-${yearAndDate}${String(date.getTime()).slice(-8)}`
    localStorage.setItem('PC_DEVICE_TYPE', pcDeviceType)
  }
  return pcDeviceType
}

const { MOBILE_EMPTY, MOBILE_LENGTH_CHECK, MOBILE_CHECK, SMS_CODE_EMPTY, SMS_CODE_CHECK } = AddDialogCheckMessage

const state = reactive({
  timer: null as ReturnType<typeof setInterval> | null,
  dialogVisible: false, // 是否显示弹窗
  countdownCount: DefaultCountDown, // 倒数计时数
  isCorrectMobile: false, // 是否输入的正确手机号
  agreementConfirmVisible: false, // 协议确认弹窗
  dialogAgreementVisible: false, // 用户协议弹窗
  agreementId: 0, // 协议id
  loading: false,
  smsCodeLock: false,
  showAgreementPopoverTip: true,
  hasConfirmUnbind: false,
  formData: {
    mobile: '',
    smsCode: '',
    mobileErrorMsg: '',
    smsCodeErrorMsg: '',
    isAgree: false,
  },
})

// 抽屉弹窗
const showHistoryDrawer = ref(false)
const distoryUrl = ref('')
const drawerTitle = ref('')

const formRef = ref<KFormInstance | null>(null)
const DialogAgreementConfirmRef = ref()

const { switchLoginSuccess } = useSwitchLoginSuccess()

const handleDrawerClose = () => {
  showHistoryDrawer.value = false
}

const handleShowDrawer = (isUser: boolean, code: string) => {
  drawerTitle.value = `《${isUser ? '用户协议' : '隐私政策'}》历史版本`
  distoryUrl.value = `https://uc${
    isPROD ? '' : '-uat'
  }.ky-express.com/netc-pc-web-tools-new/#/admin/article-history?agreementCode=${code}`
  showHistoryDrawer.value = true
}

// 打开弹窗
const showDialog = () => {
  state.dialogVisible = true
  state.showAgreementPopoverTip = false
  state.isCorrectMobile = false
  state.hasConfirmUnbind = false
  state.smsCodeLock = false
  expCenterMineAddPhonePopUpV1()
}

/** 输入框过滤 */
const handleKeyup = (type: 'mobile' | 'smsCode', length: number) => {
  state.formData[type] = state.formData[type].replace(/[^\d]/g, '')
  if (state.formData[type]?.length > length) {
    state.formData[type] = state.formData[type].slice(0, length)
  }
}

const handleMobileBlur = async () => {
  if (!state.formData.mobile) {
    state.formData.mobileErrorMsg = MOBILE_EMPTY
    return
  }
  if (state.formData.mobile.length !== 11) {
    state.formData.mobileErrorMsg = MOBILE_LENGTH_CHECK
    return
  }
  if (!MOBILE_REG.test(state.formData.mobile)) {
    state.formData.mobileErrorMsg = MOBILE_CHECK
    return
  }
  state.formData.mobileErrorMsg = ''
  try {
    await checkSwitchFlagApi({ phone: state.formData.mobile, from: LoginSource.PC_WEB })
  } catch (e: any) {
    console.log(e, ':>>> e')
    if (e?.code === SwitchLoginErrorCode.FORBID_SWITCH_LOGIN) {
      state.formData.mobileErrorMsg = e.msg
    }
  }
}

const handleSmsCodeBlur = () => {
  if (state.formData.smsCode && state.formData.smsCode?.length < 6) {
    state.formData.smsCodeErrorMsg = SMS_CODE_CHECK
  }
}

const handleChangeCheckbox = (val: any) => {
  state.showAgreementPopoverTip = !val
}

/** 打开协议弹窗 */
const handleOpenAgreement = (type: 'user' | 'privacy') => {
  console.log(type, ':>>> type')
  const { USER_AGREEMENT_ID, PRIVACY_AGREEMENT_ID } = AgreementId
  switch (type) {
    case 'user':
      state.agreementId = USER_AGREEMENT_ID
      break
    case 'privacy':
      state.agreementId = PRIVACY_AGREEMENT_ID
      break
  }
  state.dialogAgreementVisible = true
}

const getParams = (): Record<string, any> => {
  return {
    /* 验证码类型：12-切换登录手机号 .... */
    captchaType: CAPTCHA_TYPE.SWITCH_LOGIN_MOBILE,
    /* 登录手机号 */
    phone: state.formData.mobile,
    /* 来源：7-客户端 */
    from: LoginSource.PC_WEB,
    deviceCode: generateBrowserUuid(),
    configFlag: ConfigFlag.HAS_CONFIRM,
  }
}

// 点击发送短信验证码前，先校验是否有关联绑定的手机号
const handleSmsCodeClick = async () => {
  try {
    if (!state.isCorrectMobile) return
    // 用户协议确认校验
    if (!state.formData.isAgree) {
      const hasAgreed = await DialogAgreementConfirmRef.value.showDialog()
      if (!hasAgreed) {
        state.showAgreementPopoverTip = true
        return
      }
      state.formData.isAgree = true
      state.showAgreementPopoverTip = false
    }

    if (state.hasConfirmUnbind) {
      handleSendSmsCode()
      return
    }
    if (state.smsCodeLock) return
    state.smsCodeLock = true
    const params = {
      phone: state.formData.mobile,
      deviceCode: generateBrowserUuid(),
      configFlag: ConfigFlag.NOT_CONFITM,
    }
    const res = await checkBindListApi(params)
    state.smsCodeLock = false
    if (res.code === 0) {
      handleSendSmsCode()
    }
  } catch (err: any) {
    console.log(err, ':>>> err')
    state.smsCodeLock = false
    if (err?.code === SwitchLoginErrorCode.UNBIND_OTHER) {
      KMessageBox.confirm(err?.msg || '', '确定继续添加该手机号吗？', {
        type: 'warning',
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        closeOnClickModal: false,
      })
        .then(() => {
          state.hasConfirmUnbind = true
          handleSendSmsCode()
        })
        .catch((e) => {
          console.log(e, ':>>> e')
        })
    } else {
      if (err?.msg) KMessage.error(err?.msg)
      handleFail(err?.msg)
    }
  }
}

// 发送短信验证码
const handleSendSmsCode = async (safeVerifyId?: string) => {
  try {
    if (!state.isCorrectMobile || state.smsCodeLock) return
    state.smsCodeLock = true
    state.formData.smsCode = ''
    state.formData.smsCodeErrorMsg = ''
    const params = getParams()
    if (safeVerifyId) params.safeVerifyId = safeVerifyId
    const res = await sendSmsCodeApi(params)
    state.smsCodeLock = false
    if (res.code === 0) {
      // 发送短信成功开始倒计时
      startCountdown()
      KMessage.info('验证码已发送至您的手机，请注意查收')
    }
  } catch (err: any) {
    console.log(err, ':>>> err')
    state.smsCodeLock = false
    if (err?.code === ErrorResultCode.VERIFY_CODE) {
      // 触发风控校验
      const data = err.data || {}
      // 风控校验错误码，1-图形验证码，2-已锁定不需要弹窗图形验证，4-滑块
      if (data?.type === VerifyDialogType.HAS_LOCKED) {
        handleFail(data?.msg, 'warning')
      } else {
        const verifyResult = await showVerifyCodeDialog(
          {
            ruleId: data?.ruleId,
            strategyCode: data?.strategyCode,
            phone: state.formData.mobile,
          },
          { type: data.type, unToken: true }
        )
        if (verifyResult?.safeVerifyId) {
          handleSendSmsCode(verifyResult?.safeVerifyId)
        }
      }
    } else {
      if (err?.msg) {
        if (err.code === ErrorResultCode.FREQUENCY_TOO_FAST) {
          KMessage.warning(err?.msg)
        } else {
          KMessage.error(err?.msg)
          handleFail(err?.msg)
        }
      }
    }
  }
}

/** 错误异常处理 */
const handleFail = (msg?: string, type: 'error' | 'warning' = 'error') => {
  state.formData.smsCode = ''
  state.formData.smsCodeErrorMsg = msg || '验证码错误，请重新输入'
  KMessage({
    type,
    message: msg,
  })
}

// 短信倒计时
const startCountdown = () => {
  state.timer = setInterval(() => {
    if (state.countdownCount > 1) {
      state.countdownCount -= 1
    } else {
      handleReset()
    }
  }, 1000)
}

// 重置
const handleReset = () => {
  if (state.timer) clearInterval(state.timer)
  state.timer = null
  state.countdownCount = DefaultCountDown
}

// 关闭弹窗
const handleClose = (buttonname: string) => {
  formRef.value?.elFormRef.resetFields?.()
  state.dialogVisible = false
  state.formData.isAgree = false
  state.formData.mobileErrorMsg = ''
  state.formData.smsCodeErrorMsg = ''
  state.showAgreementPopoverTip = false
  clkCenterMineAddPhonePopUpV1({
    button_name: buttonname,
  })
  handleReset()
}

// 确定
// eslint-disable-next-line complexity
const handleConfirm = async (safeVerifyId?: string) => {
  if (!safeVerifyId) {
    clkCenterMineAddPhonePopUpV1({ button_name: '确定' })
  }
  try {
    if (!state.formData.mobile && !state.formData.smsCode) {
      state.formData.mobileErrorMsg = MOBILE_EMPTY
      state.formData.smsCodeErrorMsg = SMS_CODE_EMPTY
      KMessage.error(MOBILE_EMPTY)
      return
    }
    if (!state.formData.mobile) {
      state.formData.mobileErrorMsg = MOBILE_EMPTY
      KMessage.error(MOBILE_EMPTY)
      return
    }
    if (state.formData.mobile.length !== 11) {
      state.formData.mobileErrorMsg = MOBILE_LENGTH_CHECK
      KMessage.error(MOBILE_LENGTH_CHECK)
      return
    }
    if (!MOBILE_REG.test(state.formData.mobile)) {
      state.formData.mobileErrorMsg = MOBILE_CHECK
      KMessage.error(MOBILE_CHECK)
      return
    }
    if (!state.formData.smsCode) {
      state.formData.smsCodeErrorMsg = SMS_CODE_EMPTY
      KMessage.error(SMS_CODE_EMPTY)
      return
    }
    if (state.formData.smsCode?.length < 6) {
      state.formData.smsCodeErrorMsg = SMS_CODE_CHECK
      KMessage.error(SMS_CODE_CHECK)
      return
    }
    await handleMobileBlur()
    if (state.formData.mobileErrorMsg) {
      KMessage.error(state.formData.mobileErrorMsg)
      otherCenterMineSwitchPhoneAddV1({
        request_type: '添加手机号',
        request_result: '失败',
        failure_reason: state.formData.mobileErrorMsg,
      })
      return
    }
    if (!state.formData.isAgree) {
      const hasAgreed = await DialogAgreementConfirmRef.value.showDialog()
      if (!hasAgreed) {
        state.showAgreementPopoverTip = true
        return
      }
      state.formData.isAgree = true
      state.showAgreementPopoverTip = false
    }
    state.loading = true
    const params: Record<string, any> = {
      from: LoginSource.PC_WEB,
      phone: state.formData.mobile,
      equipmentCode: generateBrowserUuid(),
      deviceType: generatePcDeviceType(),
      smsCode: state.formData.smsCode,
      accessToken: getToken(),
    }
    if (safeVerifyId) {
      params.safeVerifyId = safeVerifyId
    } else {
      clkCenterMineAddPhonePopUpV1({ button_name: '确定' })
    }
    const res = await switchLoginApi(params)
    state.loading = false
    if (res.code === 0 && res.data) {
      handleClose('确定')
      KMessage.success('添加成功')
      otherCenterMineSwitchPhoneAddV1({
        request_type: '添加手机号',
        request_result: '成功',
        failure_reason: '',
      })
      switchLoginSuccess(res.data)
    }
  } catch (err: any) {
    console.log(err, ':>>> err')
    state.loading = false
    otherCenterMineSwitchPhoneAddV1({
      request_type: '添加手机号',
      request_result: '失败',
      failure_reason: err?.msg || '',
    })
    if (err?.code === ErrorResultCode.VERIFY_CODE) {
      // 触发风控校验
      const data = err.data || {}
      if (data?.type === VerifyDialogType.HAS_LOCKED) {
        handleFail(data?.msg, 'warning')
      } else {
        const verifyResult = await showVerifyCodeDialog(
          {
            ruleId: data?.ruleId,
            strategyCode: data?.strategyCode,
            phone: state.formData.mobile,
          },
          { type: data.type, unToken: true }
        )
        if (verifyResult?.safeVerifyId) {
          handleConfirm(verifyResult?.safeVerifyId)
        }
      }
    } else {
      if (err?.msg) KMessage.error(err?.msg)
    }
  }
}

watch(
  () => state.formData.mobile,
  (val) => {
    state.isCorrectMobile = MOBILE_REG.test(val)
    state.hasConfirmUnbind = false
    state.smsCodeLock = false
    handleReset()
  }
)

defineExpose({
  showDialog,
})
</script>

<style lang="scss" scoped>
:global(.dialog-add-login-mobile) {
  // 去除弹窗body默认的padding
  --k-dialog-body-padding: 0 0 12px;
}
.dialog-add-login-mobile {
  .add-mobile-tips {
    height: 32px;
    background: #fff3e5;
    color: #f57200;
    display: flex;
    align-items: center;
    padding-left: 16px;
    margin-bottom: 16px;

    .icon-warning {
      width: 13px;
      height: 13px;
      margin-right: 8px;
    }
  }

  .add-mobile-form {
    margin: 0 24px;
  }

  .get-cms-btn {
    .get-cms {
      color: #8c8f99;
      padding-right: 3px;
    }

    &.is-correct {
      .get-cms {
        color: #7143f0;
        cursor: pointer;
      }
    }
  }

  .agreement-area {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    :deep(.is-error) {
      .el-checkbox__inner {
        border-color: #f73f31;
      }
    }

    .popover-refer {
      transform: translateX(5px) translateY(-8px);
      display: inline-block;
      width: 1px;
      height: 1px;
    }

    .agreement-tips {
      color: #686b75;
      margin-left: 8px;
    }

    .agreement-text {
      color: #7143f0;
      cursor: pointer;
    }

    .agreement-sub-text {
      color: #686b75;
    }

    :deep(.el-checkbox__label) {
      padding-left: 0;
    }

    .regist-tips {
      margin-top: 8px;
      padding-left: 22px;
      background: url('https://ic-img.ky-express.com/netc/20240423_96562366155_!!1713866089919_14_14.svg+xml') no-repeat;
      height: 20px;
      line-height: 20px;
      background-size: 14px 14px;
      background-position: left center;
      color: #686b75;
    }
  }
}
</style>

<style lang="scss">
.switch-mobile-agreement-area__popper {
  font-size: 13px;
}
.history-drawer {
  &-dialog {
    .el-drawer__header {
      padding: 12px 24px;
      margin-bottom: 0;
      border-bottom: 1px solid #e6e8ed;
    }
  }
  &-title {
    display: flex;
    align-items: center;
    font-size: 15px;
    color: #24262b;
    font-weight: 600;
    line-height: 22px;
    img {
      display: block;
      width: 16px;
      height: 16px;
      margin-right: 8px;
      cursor: pointer;
    }
  }
  &-content {
    h5 {
      color: #333333;
      font-size: 15px;
      font-weight: 600;
      margin-bottom: 16px;
    }
    height: 100%;
    box-sizing: border-box;
    overflow-y: hidden;
  }
}
</style>
