/**
 * 用户信息业务逻辑
 * 来源: netc-pc-web/src/views/layout/avatar.vue「用户信息」业务块(头像+实名+手机号 + 个人信息 popover)
 *
 * 依赖映射:
 *  - vuex userInfo/realNameInfo -> useUserStore(pinia).user(user + realNameInfo)
 *  - $store.getters['downloadCenter/isLocalDownloading'] -> usePcWebDownloadCenterStore().isLocalDownloading
 *  - $native.*(isClientMode/isOldClientMode/getVersion/isNewVersion/systemUpgrade) -> @/native/electron
 *  - @api/login.loginOut -> 本目录 api.ts(web.login.logout) + @/utils/iframeBridge/interaction userLogOut
 *  - formatUtil.encrptMobileGap -> 本 hook encrptMobileGap
 *  - views/layout/constants RealNameAuthFlag -> 本 hook RealNameAuthFlag
 *  - getLoginData()(ecasToken.whiteListUser/isBorrowTelNo) -> sessionStorage LOGIN_DATA(键名与老基座一致)
 *  - $reportUtils.clkCenterLoginpopupButton -> 本目录 report.ts(事件码不变)
 *  - 切换客户手机号(white-list -> 本目录 components/white-list-dialog.vue)
 *      /返回自己的手机号(mixins/switchBack -> 本目录 hooks/useSwitchBack.ts) 已迁移, 组件内聚处理
 *  - 下载新版客户端弹窗(NewClientPromotion) 新基座暂未迁移, 点击通过 options 回调上抛父级处理
 */
import { computed, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { KMessageBox } from '@netc-design-pc/ui'
import { useUserStore } from '@/stores/user'
import { usePcWebDownloadCenterStore } from '@/stores/pc-web/downloadCenter'
import { usePcWebRootStore } from '@/stores/pc-web/root'
import {
  isClientMode,
  isOldClientMode,
  getVersion,
  isNewVersion,
  systemUpgrade as nativeSystemUpgrade,
} from '@/native/electron'
import { userLogOut } from '@/utils/iframeBridge/interaction'
import { loginOutApi } from '../api'
import { clkCenterLoginpopupButton, getClickId, expCenterMineSwitchPhonePopUpV1 } from '../report'
import { refreshLoginApplication } from '@/utils/updateCheck/loginApplication'
import { useSwitchBack } from './useSwitchBack'

/** 实名认证标记(老 views/layout/constants RealNameAuthFlag) */
const RealNameAuthFlag = {
  NO_VERIFY: 10, // 未实名
  NO_PERSON_VERIFY: 20, // 未个人认证
  PERSON_VERIFY: 30, // 已个人认证
  ENTERPRISE_VERIFY: 40, // 已企业认证
  HAS_VERIFY: 50, // 已实名
} as const

/** 按性别区分的默认头像(与老基座 CDN 资源一致) */
const SEX_AVATAR_MAP: Record<number, string> = {
  1: 'https://ic-img.ky-express.com/netc/20251121_90143_!!1763698418360_236_236.png',
  2: 'https://ic-img.ky-express.com/netc/20251121_4860_!!1763698418364_236_236.png',
  3: 'https://ic-img.ky-express.com/netc/20251203_41092_!!1764724367216_236_236.png',
}

/** 手机号带空格脱敏(老 utils/format encrptMobileGap) */
const encrptMobileGap = (phone = '') => phone.replace(/^(\d{3})(\d{4})(\d+)/, '$1 **** $3')

/** 老基座登录缓存(切换客户手机号白名单数据源, 键名与老基座一致) */
const getLoginData = (): Record<string, any> => {
  try {
    return JSON.parse(sessionStorage.getItem('LOGIN_DATA') || '{}') || {}
  } catch (e) {
    return {}
  }
}

interface UseUserInfoOptions {
  /** 下载新版客户端(NewClientPromotion 弹窗待迁移, 上抛父级) */
  onDownloadNewClient?: () => void
}

export function useUserInfo(options: UseUserInfoOptions = {}) {
  const { onDownloadNewClient: emitDownloadNewClient } = options

  const router = useRouter()
  const userStore = useUserStore()
  const downloadCenterStore = usePcWebDownloadCenterStore()
  const rootStore = usePcWebRootStore()
  const { switchBack } = useSwitchBack()

  // ==================== 状态 ====================

  /** 是否显示个人信息 popover */
  const popoverVisible = ref(false)
  /** 切换客户手机号(白名单)弹窗显隐 */
  const whiteListVisible = ref(false)
  /** 点击开启标记(点击开启后鼠标移出不关闭) */
  const userInfoClickStatus = ref(false)
  /** 客户端版本号 */
  const clientVersion = ref('')
  /** 是否需要升级 */
  const needUpgrade = ref(false)

  /** 切换登录手机号 popover 显隐 */
  const switchLoginMobileVisible = ref(false)
  /** 切换登录手机号点击开启标记 */
  const switchLoginMobileClickStatus = ref(false)
  /** 切换登录手机号 popover 悬停标记 */
  const switchLoginMobileShowStatus = ref(false)

  /** 客户端模式(同步判定) */
  const isClientModeVal = isClientMode()
  /** 旧客户端(壳类型 1-4) */
  const isOldClientModeVal = isOldClientMode()

  // ==================== 数据源 ====================

  /** 当前用户信息 */
  const userInfo = computed(() => userStore.user)

  /** 本地是否有下载中文件 */
  const isLocalDownloading = computed(() => downloadCenterStore.isLocalDownloading)

  /** 实名认证标记名 */
  const authFlagName = computed(() => {
    return userInfo.value?.realNameInfo?.headImgRealNameTagVO?.authFlagName || '未实名'
  })

  /** 已实名认证 */
  const hasRealNameVerify = computed(() => {
    const { PERSON_VERIFY, ENTERPRISE_VERIFY, HAS_VERIFY } = RealNameAuthFlag
    const verifyFlags: number[] = [PERSON_VERIFY, ENTERPRISE_VERIFY, HAS_VERIFY]
    return verifyFlags.includes(userInfo.value?.realNameInfo?.headImgRealNameTagVO?.authFlag ?? 0)
  })

  /** 手机号带空格脱敏展示 */
  const formatPhone = computed(() => encrptMobileGap(userInfo.value?.phone || ''))

  /** 是否展示切换客户手机号(超级白名单且非借号登录, 对齐老基座 showWhiteList) */
  const showWhiteList = computed(() => {
    const data = getLoginData()
    return !!data.ecasToken?.whiteListUser && !data.isBorrowTelNo
  })

  /** 是否展示返回自己的手机号(借号登录, 对齐老基座 switchBack mixin) */
  const showSwitchBack = computed(() => !!getLoginData().isBorrowTelNo)

  /** 性别默认头像 */
  const defaulSextAvatar = computed(() => SEX_AVATAR_MAP[userInfo.value?.sex as number] || SEX_AVATAR_MAP[3])

  /** 新客户端(非旧壳) */
  const isNewClient = isClientModeVal && !isOldClientModeVal

  // ==================== 交互逻辑 ====================

  /** 头像点击(开关个人信息 popover) */
  const onUserInfoBtnClick = () => {
    userInfoClickStatus.value = true
    popoverVisible.value = !popoverVisible.value
  }

  /** 关闭个人信息 popover(右上角关闭按钮) */
  const onUserInfoPopoverClose = () => {
    clkCenterLoginpopupButton({ button_name: '关闭' })
    popoverVisible.value = false
    userInfoClickStatus.value = false
  }

  /** popover 鼠标移入保持展示 */
  const onUserInfoPopoverMouseenter = () => {
    popoverVisible.value = true
  }

  /** popover 鼠标移出(非点击开启场景 300ms 后关闭) */
  const onUserInfoPopoverMouseleave = () => {
    if (userInfoClickStatus.value) return false
    setTimeout(() => {
      popoverVisible.value = false
    }, 300)
  }

  /** 跳转个人中心 */
  const onJumpUserCenter = () => {
    popoverVisible.value = false
    clkCenterLoginpopupButton({ button_name: '个人中心' })
    router.push(`/admin/user?pre_click_id=${getClickId()}`)
  }

  /** 切换登录手机号菜单项点击 */
  const onSwitchLoginMobileBtnClick = () => {
    clkCenterLoginpopupButton({ button_name: '切换登录手机号' })
    switchLoginMobileClickStatus.value = true
    switchLoginMobileVisible.value = !switchLoginMobileVisible.value
  }

  /** 切换登录手机号菜单项鼠标移入(展开子 popover) */
  const onSwitchLoginMobileMouseenter = () => {
    switchLoginMobileVisible.value = true
    clkCenterLoginpopupButton({ button_name: '切换登录手机号' })
  }

  /** 切换登录手机号菜单项鼠标移出 */
  const onSwitchLoginMobileMouseleave = () => {
    if (switchLoginMobileClickStatus.value) return false
    setTimeout(() => {
      if (!switchLoginMobileShowStatus.value) {
        switchLoginMobileVisible.value = false
      }
    }, 300)
  }

  /** 切换登录手机号子 popover 鼠标移入(同时保持用户信息 popover) */
  const onLoginMobileMouseenterPopper = () => {
    switchLoginMobileVisible.value = true
    popoverVisible.value = true
    switchLoginMobileShowStatus.value = true
  }

  /** 切换登录手机号子 popover 鼠标移出 */
  const onLoginMobileMouseleavePopper = () => {
    if (switchLoginMobileClickStatus.value) return false
    switchLoginMobileVisible.value = false
    switchLoginMobileShowStatus.value = false
  }

  /** 切换登录手机号子 popover 关闭 */
  const onSwitchLoginMobileClose = () => {
    switchLoginMobileVisible.value = false
    switchLoginMobileClickStatus.value = false
  }

  /** 关闭用户信息 popover(切换成功等场景由子组件触发) */
  const closeUserInfo = () => {
    popoverVisible.value = false
  }

  /** 切换客户手机号(打开白名单弹窗) */
  const showUserList = () => {
    popoverVisible.value = false
    whiteListVisible.value = true
  }

  /** 返回自己的手机号(白名单一键切回) */
  const onSwitchBack = () => {
    popoverVisible.value = false
    switchBack()
  }

  /** 退出登录确认文案(本地下载中且非新壳时追加提示) */
  const getDialogContent = () => {
    let content = '是否确定退出账号？'
    if (!isLocalDownloading.value || isNewClient) return content // 新壳保存弹窗有bug，不需要提示
    content += '退出后，文件将停止下载'
    return content
  }

  /** 退出登录 */
  const logout = () => {
    clkCenterLoginpopupButton({ button_name: '退出登录' })
    // 后台刷新 APPLICATION_INFO，不阻塞当次退登跳转（仅更新缓存供后续使用）
    refreshLoginApplication()
    KMessageBox.confirm('', getDialogContent(), {})
      .then(() => {
        loginOutApi()
          .catch(() => {
            // 退出登录接口失败（含 token 已失效）不阻塞退登流程，错误静默
          })
          .finally(() => {
            userLogOut()
          })
      })
      .catch((e) => {
        console.log(e)
      })
      .finally(() => {
        popoverVisible.value = false
      })
  }

  /** 检查更新(客户端模式) */
  const onSystemUpgrade = () => {
    KMessageBox.confirm('确定要进行系统更新吗？', '温馨提醒', {})
      .then(async () => {
        await nativeSystemUpgrade()
      })
      .catch((e) => {
        console.log(e)
      })
  }

  /** 下载新版客户端入口(弹窗未迁移, 上抛父级) */
  const onDownloadNewClient = () => {
    emitDownloadNewClient?.()
  }

  // 关闭时重置状态(对齐老基座 watch)
  watch(popoverVisible, (val) => {
    if (!val) {
      userInfoClickStatus.value = false
      switchLoginMobileVisible.value = false
    }
  })

  // 切换登录手机号弹窗曝光(对齐老基座 avatar watch)
  watch(switchLoginMobileVisible, (val) => {
    if (val) {
      expCenterMineSwitchPhonePopUpV1()
    }
  })

  // 初始化客户端版本信息 + 切换手机号列表(对齐老基座 mounted/admin.vue created)
  onMounted(async () => {
    rootStore.setSwitchLoginMobileAction()
    if (!isClientModeVal) return
    clientVersion.value = await getVersion()
    needUpgrade.value = await isNewVersion()
  })

  return {
    // 状态
    popoverVisible,
    whiteListVisible,
    clientVersion,
    needUpgrade,
    isClientModeVal,
    isOldClientModeVal,
    switchLoginMobileVisible,
    // 数据
    userInfo,
    authFlagName,
    hasRealNameVerify,
    formatPhone,
    showWhiteList,
    showSwitchBack,
    defaulSextAvatar,
    // 方法
    onUserInfoBtnClick,
    onUserInfoPopoverClose,
    onUserInfoPopoverMouseenter,
    onUserInfoPopoverMouseleave,
    onJumpUserCenter,
    onSwitchLoginMobileBtnClick,
    onSwitchLoginMobileMouseenter,
    onSwitchLoginMobileMouseleave,
    onLoginMobileMouseenterPopper,
    onLoginMobileMouseleavePopper,
    onSwitchLoginMobileClose,
    closeUserInfo,
    showUserList,
    onSwitchBack,
    logout,
    onSystemUpgrade,
    onDownloadNewClient,
  }
}
