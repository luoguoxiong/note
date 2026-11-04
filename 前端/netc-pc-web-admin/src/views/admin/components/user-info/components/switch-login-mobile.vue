<template>
  <div class="avatar-switch-login-mobile__wrapper" @click.stop="handleClick">
    <div class="switch-login-mobile__label">切换登录手机号</div>
    <div class="switch-login-mobile__list">
      <el-scrollbar max-height="225px">
        <div
          :class="[
            'switch-login-mobile__item',
            isCurrentLogin(item) && 'is-current-login',
            isLoading(item) && 'is-loading-item',
          ]"
          v-for="item in switchList"
          :key="item.id"
          @click="handleSwitchLoginMobile(item)"
        >
          <div class="flex">
            <span class="login-mobile">{{ formatMobile(item.phone) }}</span>
            <span v-if="item.userName" class="user-name">{{ item.userName }}</span>
          </div>
          <i v-if="isCurrentLogin(item)" class="icon_current_login" />
          <span v-if="isLoading(item)" class="is-loading">
            <i class="loading-icon" />
            切换中
          </span>
        </div>
      </el-scrollbar>
    </div>
    <div v-if="showAddLoginMobileBtn" class="switch-login-mobile__add" @click="handleAddLoginMobile">
      <i class="icon_add" />
      <span class="add-text">添加登录手机号</span>
    </div>

    <!-- 添加登录手机号弹窗 -->
    <dialog-add-login-mobile ref="DialogAddLoginMobileRef" />

    <!-- 短信验证码弹窗(7天未登录场景) -->
    <ky-sms-code ref="KySmsCodeRef" />
  </div>
</template>

<script setup lang="ts">
/**
 * 切换登录手机号列表 popover
 * 来源: netc-pc-web/src/views/layout/switch-login-mobile/index.vue
 * 迁移说明: vuex loginMobileData -> usePcWebRootStore.loginMobileData; report -> 本目录 report.ts;
 *          $kye_message.confirm -> ElMessageBox; 风控验证码复用 module-customer-code verify-code
 */
import { computed, ref } from 'vue'
import axios from 'axios'
import { KMessage, KMessageBox } from '@netc-design-pc/ui'
import { usePcWebRootStore } from '@/stores/pc-web/root'
import { generateBrowserUuid, routerReload } from '@/stores/pc-web/deps/misc'
import { getToken } from '@/utils/auth'
import { switchLoginApi } from '../api'
import { useSwitchLoginSuccess } from '../hooks/useSwitchLoginSuccess'
import {
  LoginFlag,
  LoginSource,
  SwitchLoginErrorCode,
  ErrorResultCode,
  VerifyDialogType,
  CAPTCHA_TYPE,
} from '../constants'
import { clkCenterMineSwitchPhonePopUpV1, otherCenterMineSwitchPhoneAddV1 } from '../report'
import { showVerifyCodeDialog } from '@/views/home/module/module-customer-code/utils/verify-code'
import { isClientMode } from '@/native/electron'
import DialogAddLoginMobile from './dialog-add-login-mobile.vue'
import KySmsCode from './ky-sms-code.vue'

defineOptions({ name: 'SwitchLoginMobile' })

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'closeUserInfo'): void
}>()

/** 手机号 3-4-4 分组展示(老 utils/format formatMobliePhone) */
const formatMobile = (mobile = '') => {
  if (!mobile) return ''
  return mobile.replace(/^(\d{3})(\d{4})(\d{4})$/, '$1 $2 $3')
}

/** 网页自定义设备类型(与 user-info/api.ts 同逻辑) */
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

/** 获取设备 ID(老 utils/getDeviceId: 壳内取设备唯一 id; 网页端请求本机客户端服务 18099/18088 取 host_name, 失败返回空串) */
const getDeviceId = async (): Promise<string> => {
  if (isClientMode()) {
    // TODO: 壳内设备唯一 id 待 native 体系补齐 getUniqueId 后接入
    return ''
  }
  // 对齐老 utils/assetCode getAssetCode: 请求本机客户端服务获取资产号
  try {
    const res = await axios.get('http://localhost:18099', { timeout: 3000 })
    return res?.data?.data?.host_name || ''
  } catch (e) {
    try {
      const res = await axios.get('http://localhost:18088', { timeout: 3000 })
      return res?.data?.data?.host_name || ''
    } catch (err) {
      return ''
    }
  }
}

const rootStore = usePcWebRootStore()
const { switchLoginSuccess } = useSwitchLoginSuccess()

const loading = ref(false)
const currentChangeId = ref<string | number | null>(null)

const DialogAddLoginMobileRef = ref()
const KySmsCodeRef = ref()

const loginMobileData = computed(() => rootStore.loginMobileData || {})
const showAddLoginMobileBtn = computed(() => {
  return (loginMobileData.value.switchList?.length || 0) < (loginMobileData.value.switchCount || 0)
})
const switchList = computed(() => loginMobileData.value.switchList || [])

const handleClick = (event: MouseEvent) => {
  event.preventDefault()
}

// 关闭弹出框
const handleClose = () => {
  emit('close')
}

/** 是否当前登录手机号 */
const isCurrentLogin = (item: Record<string, any>) => {
  return item.loginFlag === LoginFlag.HAS_LOGIN
}

/** 是否加载中 */
const isLoading = (item: Record<string, any>) => {
  return loading.value && currentChangeId.value === item.id
}

// 添加登录手机号
const handleAddLoginMobile = () => {
  clkCenterMineSwitchPhonePopUpV1({ button_name: '添加手机号' })
  emit('closeUserInfo')
  DialogAddLoginMobileRef.value?.showDialog()
}

/** 切换登录手机号(对齐老基座复杂错误码分支) */
// eslint-disable-next-line complexity
const handleSwitchLoginMobile = async (item: Record<string, any>, safeVerifyId?: string) => {
  // 当前登录、切换中不允许切换
  if (isCurrentLogin(item) || loading.value) {
    return
  }
  loading.value = true
  currentChangeId.value = item.id
  const deviceId = await getDeviceId()
  try {
    const params: Record<string, any> = {
      from: LoginSource.PC_WEB,
      phone: item.phone,
      equipmentCode: generateBrowserUuid(),
      deviceType: generatePcDeviceType(),
      accessToken: getToken(),
    }
    if (isClientMode()) {
      params.guid = deviceId
    } else {
      params.deviceId = deviceId
    }
    if (safeVerifyId) {
      params.safeVerifyId = safeVerifyId
    } else {
      clkCenterMineSwitchPhonePopUpV1({ button_name: '切换手机号' })
    }
    const res = await switchLoginApi(params)
    loading.value = false
    if (res.code === 0 && res.data) {
      KMessage.success('切换成功')
      otherCenterMineSwitchPhoneAddV1({
        request_type: '切换手机号',
        request_result: '成功',
        failure_reason: '',
      })
      switchLoginSuccess(res.data)
    }
  } catch (err: any) {
    console.log(err, ':>>> err')
    loading.value = false
    otherCenterMineSwitchPhoneAddV1({
      request_type: '切换手机号',
      request_result: '失败',
      failure_reason: err?.msg || '',
    })
    if (err?.code === ErrorResultCode.VERIFY_CODE) {
      const data = err.data || {}
      // 风控校验错误码，1-图形验证码，2-已锁定不需要弹窗图形验证，4-滑块
      if (data?.type === VerifyDialogType.HAS_LOCKED) {
        if (data?.msg) KMessage.warning(data?.msg)
      } else {
        const verifyResult = await showVerifyCodeDialog(
          {
            ruleId: data?.ruleId,
            strategyCode: data?.strategyCode,
            phone: item.phone,
          },
          { type: data?.type, unToken: true }
        )
        if (verifyResult?.safeVerifyId) {
          handleSwitchLoginMobile(item, verifyResult?.safeVerifyId)
        }
      }
    } else if (err?.code === SwitchLoginErrorCode.EXPIRED_CODE) {
      KySmsCodeRef.value?.showDialog({
        phone: item.phone,
        captchaType: CAPTCHA_TYPE.SWITCH_LOGIN_MOBILE,
        title: `您已超过7天未登录该手机号，请先 获取验证码 进行短信验证，验证码将发送到手机号 ${item.phone}`,
        callback: () => handleSwitchLoginMobile(item),
      })
    } else if (err?.code === SwitchLoginErrorCode.SWITCH_HAS_UNBIND) {
      if (err?.msg) KMessage.error(err?.msg)
      setTimeout(() => {
        routerReload()
      }, 3000)
    } else if (err?.code === SwitchLoginErrorCode.FORBID_SWITCH_LOGIN) {
      await KMessageBox.alert(
        `手机号${item.phone}已设置禁止使用切换登录功能，暂不支持切换登录，如需登录可退登后使用账密或验证码进行登录`,
        '温馨提示',
        {
          // type: 'warning',
          confirmButtonText: '我知道了',
          // showCancelButton: false,
          // closeOnClickModal: false,
        }
      ).catch((e) => {
        console.log(e, ':>>> e')
      })
    } else {
      if (err?.msg) KMessage.error(err?.msg)
    }
  }
}

defineExpose({
  handleClose,
})
</script>

<style lang="scss" scoped>
.avatar-switch-login-mobile__wrapper {
  position: absolute;
  right: -244px;
  top: 0;
  width: 240px;
  background: #fff;
  border-bottom-left-radius: 4px;
  border-bottom-right-radius: 4px;
  box-shadow: 0px 8px 10px -5px rgba(0, 0, 0, 0.08), 0px 16px 24px 2px rgba(0, 0, 0, 0.04),
    0px 6px 30px 5px rgba(0, 0, 0, 0.05);
  z-index: 10;

  .switch-login-mobile {
    &__label {
      background: #f7f8fa;
      display: flex;
      align-items: center;
      justify-content: space-between;
      height: 48px;
      padding: 0 16px;
      font-size: 13px;
      border-top-left-radius: 4px;
      border-top-right-radius: 4px;
      font-weight: 600;
      color: #24262b;
    }

    &__item {
      height: 45px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      box-sizing: border-box;
      padding: 0 16px;
      position: relative;
      cursor: pointer;

      &::after {
        content: '';
        width: 87%;
        height: 1px;
        background-color: #e6e8ed;
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        margin: auto;
        box-sizing: border-box;
      }

      .flex {
        display: flex;
        align-items: center;
        min-width: 0;
      }

      .login-mobile {
        color: #24262b;
        font-weight: bold;
        margin-right: 8px;
      }

      .user-name {
        color: #24262b;
        max-width: 100px;
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
      }

      .icon_current_login {
        background: url('https://ic-img.ky-express.com/netc/20240831_34021882374_!!1725096867974_112_36.png') no-repeat;
        background-size: 48px 15px;
        width: 48px;
        height: 15px;
      }

      .is-loading {
        color: #00c58c;
        font-size: 12px;
        display: flex;
        align-items: center;

        .loading-icon {
          width: 13px;
          height: 13px;
          background: url('https://ic-img.ky-express.com/netc/20240429_21662366124_!!1714379163324_13_13.svg+xml')
            no-repeat;
          background-size: 13px 13px;
          animation: loading-rotate 2s linear infinite;
          margin-right: 4px;
        }
      }

      &.is-current-login,
      &.is-loading-item {
        .user-name {
          max-width: 55px;
        }
      }

      &:hover {
        background: rgba(36, 38, 43, 0.06);
        color: #7143f0;

        .login-mobile,
        .user-name {
          color: #7143f0;
        }
      }
    }

    &__add {
      height: 38px;
      box-sizing: border-box;
      display: flex;
      justify-content: center;
      align-items: center;
      cursor: pointer;

      .icon_add {
        width: 13px;
        height: 13px;
        background: url('https://ic-img.ky-express.com/netc/20240424_936236618_!!1713949748834_13_13.svg+xml') no-repeat;
        background-size: 13px 13px;
        margin-right: 8px;
      }

      .add-text {
        color: #7143f0;
      }
    }
  }
}

@keyframes loading-rotate {
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
}
</style>
