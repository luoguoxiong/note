<template>
  <div
    class="header"
    :class="[!newClientShow ? 'drag-header' : 'no-drag-header', orderConfigModal && 'header-modal-show']"
  >
    <!-- LOGO -->
    <img
      class="logo"
      :class="{ 'drag-header': newClientShow }"
      src="@/assets/image/admin/kye_logo.png"
      @click="handleClickLogo"
    />
    <!-- 测试环境切换url工具  -->
    <url-tool />
    <!-- 功能 -->
    <div class="items">
      <!--  回到旧版按钮  -->
      <back-version-button v-if="backVersionFlag" @click="handleBtn" />
      <!-- 窗体按钮 -->
      <div class="window" v-if="isClientModeVal">
        <i class="iconfont icon-window-minimize" @click="onWinBtnClick('minimize')"></i>
        <i v-show="winState != 1" class="iconfont iconwindow-maximize" @click="onWinBtnClick('maximize')"></i>
        <i v-show="winState == 1" class="iconfont icon-window-resume" @click="onWinBtnClick('resume')"></i>
        <i class="iconfont icon-window-close" @click="onWinBtnClick('close')"></i>
      </div>
      <new-client :isMinWidth1280="isMinWidth1280" v-if="newClientShow" />
      <!-- 辅助功能 -->
      <div class="menu">
        <slot></slot>
        <!--  消息中心    -->
        <message-center-button
          :isMinWidth1280="isMinWidth1280"
          @click="handleBtn"
          v-exposure-report="{
            pageCode: 'client_menu_v1',
            event_type_id: 2201,
            eventCode: 'clk_home_topmenu_v1',
            region_code: 'top_navigation',
            navigation_menu: '消息',
          }"
        />
        <!--下载中心-->
        <download
          :isMinWidth1280="isMinWidth1280"
          v-exposure-report="{
            pageCode: 'client_menu_v1',
            event_type_id: 2201,
            eventCode: 'clk_home_topmenu_v1',
            region_code: 'top_navigation',
            navigation_menu: '下载中心',
          }"
        ></download>
        <!-- 导航 -->
        <nav-item :isMinWidth1280="isMinWidth1280" @onClick="onButtonClick"></nav-item>
      </div>

      <!-- 公告 -->
      <Notice></Notice>
      <div
        class="drag-container"
        v-if="clientDrag"
        @mousedown.self="headerMousedown"
        @mouseup.self="headerMouseUp"
        @mouseleave="headerMouseLeave"
        @dblclick="dragDblClick"
      ></div>
    </div>
    <qrcode-dialog ref="qrcodeDialogRef" />
    <!-- 关注公众号弹窗 -->
    <wechat-dialog ref="wechatDialogRef" />
    <!--  消息中心抽屉  -->
    <message-center-entry ref="messageCenterRef" />
    <!-- 版本更新列表抽屉 -->
    <versoin-updata-list ref="versoinUpdataListRef" />
    <!-- 回到旧版弹窗 -->
    <back-version-dialog ref="backVersionDialogRef" />
  </div>
</template>

<script setup lang="ts">
/**
 * 顶栏 Header
 * 来源: netc-pc-web/src/views/layout/header-new.vue
 * 迁移说明: UI 与功能保持一致, element-ui -> element-plus / vuex -> pinia / $native -> @/native/electron
 */
import { computed, nextTick, onMounted, onUnmounted, ref } from 'vue'
import { KMessageBox } from '@netc-design-pc/ui'
import UrlTool from './url-tool.vue'
import Notice from './notice.vue'
import NavItem from './header-nav-item.vue'
import NewClient from './new-client/index.vue'
import Download from './download/index.vue'
import QrcodeDialog from './qrcode-dialog/index.vue'
import WechatDialog from './wechat-dialog.vue'
import MessageCenterEntry from './message-center/index.vue'
import MessageCenterButton from './message-center/components/message-center-button.vue'
import VersoinUpdataList from './versoin-updata-list/index.vue'
import BackVersionButton from './back-version-dialog/back-version-button.vue'
import BackVersionDialog from './back-version-dialog/index.vue'
import { reportHeaderClick } from './report'
import eventBus, { EE_EVENT } from './eventBus'
import useMessageCenter from './message-center/hooks/useMessageCenter'
import EE from '@/utils/eventemitter'
import {
  getClientFrameType,
  getVersion,
  getState,
  minimize,
  maximize,
  resume,
  close as winClose,
  windowMove,
  nativeBrowserOpenUrl,
  isClientMode,
  isOldClientMode,
  isElectronClientMode,
  isKuaShenClientMode,
} from '@/native/electron'
import { compareVersions } from '@/utils'
import { isPROD } from '@/utils/env'
import { getSelectionWord } from './new-client/utils/menu'
import { usePcWebRootStore } from '@/stores/pc-web/root'
import { usePcWebDownloadCenterStore } from '@/stores/pc-web/downloadCenter'
import { usePcWebOrderConfigStore } from '@/stores/pc-web/orderConfig'
import { getUserInfoByPhone } from '@/apis/user'

defineOptions({ name: 'AppHeader' })

const rootStore = usePcWebRootStore()
const downloadCenterStore = usePcWebDownloadCenterStore()
const orderConfigStore = usePcWebOrderConfigStore()

const qrcodeDialogRef = ref<InstanceType<typeof QrcodeDialog> | null>(null)
const wechatDialogRef = ref<InstanceType<typeof WechatDialog> | null>(null)
const messageCenterRef = ref<InstanceType<typeof MessageCenterEntry> | null>(null)
const versoinUpdataListRef = ref<InstanceType<typeof VersoinUpdataList> | null>(null)
const backVersionDialogRef = ref<InstanceType<typeof BackVersionDialog> | null>(null)

const isClientModeVal = isClientMode()
// 新客户端(壳类型 5/6)才显示 new-client 组件
const newClientShow = [5, 6].includes(getClientFrameType() as number)

const winState = ref<number | string>(1)
const clientDrag = ref(false)
const isMinWidth1280 = ref(false)

let closeMovetimer: ReturnType<typeof setTimeout> | null = null

// 返回旧版标识
const backVersionFlag = computed(() => rootStore.visibleControl?.backVersionFlag)
// 下单配置弹窗遮罩
const orderConfigModal = computed(() => orderConfigStore.orderConfigModal)
// 本地是否有下载中文件
const isLocalDownloading = computed(() => downloadCenterStore.isLocalDownloading)

// ==================== 窗口拖拽 ====================

const changeMoveStatus = (flag: boolean) => {
  let moveStartParam: any = { move: true }
  let moveEndParam: any = { move: false }
  if (isKuaShenClientMode()) {
    moveStartParam = JSON.stringify(moveStartParam)
    moveEndParam = JSON.stringify(moveEndParam)
  }
  windowMove((flag ? moveStartParam : moveEndParam) as any)
}

const dragDblClick = () => {
  if (String(winState.value) === '1') {
    resume()
    return
  }
  maximize()
}

const initClientDrag = async () => {
  let clientDragFlag = false
  const clientVersion = await getVersion()
  if (String(getClientFrameType()) === '5') {
    clientDragFlag = compareVersions(clientVersion, 'V2.0.0') !== -1
  }
  if (String(getClientFrameType()) === '6') {
    clientDragFlag = true
  }
  clientDrag.value = clientDragFlag
}

const headerMousedown = (event: MouseEvent) => {
  event = event || (window.event as MouseEvent)
  if (event.stopPropagation) event.stopPropagation()
  if (event.preventDefault) event.preventDefault()
  if (event.button === 0) {
    changeMoveStatus(true)
  }
  if (event.button === 2 && isElectronClientMode()) {
    changeMoveStatus(false)
  }
}

const headerMouseLeave = () => {
  if (isKuaShenClientMode()) {
    return
  }
  if (closeMovetimer) {
    clearTimeout(closeMovetimer)
  }
  closeMovetimer = setTimeout(() => {
    changeMoveStatus(false)
  }, 500)
}

const headerMouseUp = (e: MouseEvent) => {
  e = e || (window.event as MouseEvent)
  if (e.stopPropagation) e.stopPropagation()
  if (e.preventDefault) e.preventDefault()
  if (getSelectionWord()) {
    return
  }
  if (e.button === 0 || isElectronClientMode()) {
    changeMoveStatus(false)
  }
}

// ==================== 窗口按钮 ====================

// 窗口按钮事件
const winApiMap: Record<string, () => any> = {
  minimize,
  maximize,
  resume,
  close: winClose,
}

const onWinBtnClick = async (btnName: string) => {
  if (btnName === 'close') {
    try {
      await KMessageBox.confirm('', getDialogContent(), {})
    } catch {
      return // 用户取消关闭
    }
  }
  await winApiMap[btnName]()
  const winStateRes = await getState()
  if (winStateRes !== '0') {
    winState.value = winStateRes
  }
}

const getDialogContent = () => {
  let content = '是否确定退出系统？'
  const isNewClient = isClientModeVal && !isOldClientMode()
  if (!isLocalDownloading.value || isNewClient) return content // 新壳保存弹窗有bug，不需要提示
  content += '退出后，文件将停止下载'
  return content
}

// ==================== 功能按钮 ====================

const handleClickLogo = () => {
  if (!isClientModeVal) {
    if (['uc-uat.ky-express.com', 'uc-dev.ky-express.com'].includes(window.location.hostname)) {
      window.location.href = 'http://www-dev.ky-express.com/'
    } else {
      window.location.href = 'https://www.ky-express.com'
    }
  }
}

// 按钮点击后失焦处理，避免切换浏览器tab 再次显示tooltip
const handleBlurButton = (e?: MouseEvent) => {
  nextTick(() => {
    ;(e?.currentTarget as HTMLElement | null)?.blur?.()
  })
}

// 下载入口弹窗
const openDownloadDialog = () => {
  qrcodeDialogRef.value?.openDialog()
}

// 关注公众号弹窗
const openWechatDialog = () => {
  wechatDialogRef.value?.showDialogVisible()
}

// 版本更新记录
const handleVersionList = (e?: MouseEvent) => {
  versoinUpdataListRef.value?.showDrawer()
  handleBlurButton(e)
}

// 打开官网产品介绍
const openIntroductionH5 = () => {
  const url = isPROD ? 'https://www.ky-express.com/183.html' : 'https://www-uat.ky-express.com/183.html'
  nativeBrowserOpenUrl(url, '_blank')
}

/**
 * 打开按钮
 * @param type
 */
const handleBtn = (type: string) => {
  switch (type) {
    case 'message-center-button':
      messageCenterRef.value?.showDrawer()
      reportHeaderClick('消息')
      break
    case 'back-version-button':
      backVersionDialogRef.value?.openDialog()
      break
    default:
      break
  }
}

// 导航点击(nav-item 分发: 4-产品合集 8-关注公众号; 3-版本介绍/5-产品介绍入口已隐藏 task#2128326)
const onButtonClick = (item: { fnName: string }) => {
  const mapFn: Record<string, () => void> = {
    3: handleVersionList,
    4: openDownloadDialog,
    5: openIntroductionH5,
    8: openWechatDialog,
  }
  mapFn[item.fnName]?.()
}

// ==================== 环境监听 ====================

// 判断窗口是否小于1280px
const getMediaWidth = () => {
  const minWidth = '(max-width: 1280px)'
  isMinWidth1280.value = window.matchMedia(minWidth).matches
}

// 消息跳转(供 iframeBridge 消息单条触发使用, 需在 setup 上下文调用 useRouter)
const { handleMessageNavigation } = useMessageCenter()

// EE消息监听
const onEventMessage = () => {
  eventBus.on(EE_EVENT.OPEN_MESSAGE_CENTER, () => {
    handleBtn('message-center-button')
  })
  ;(window as any).parentShowMessageCenter = () => {
    handleBtn('message-center-button')
  }
  // iframeBridge 轻应用消息事件(对齐老项目 header.vue/header-new.vue, 走 utils/eventemitter)
  EE.on('FUNCTION_MESSAGE_CENTER_LIST_OPEN', () => {
    handleBtn('message-center-button')
  })
  EE.on('FUNCTION_MESSAGE_CENTER_ITEM_NAVIGATION', (params: Record<string, any>) => {
    handleMessageNavigation(params)
  })
}

const onResize = async () => {
  winState.value = await getState()
}

// 关注公众号入口显隐：未关注或未登录时显示(来源: 旧项目 avatar.vue getUserInfo)
const updateShowWxFlagAction = async () => {
  try {
    const res = await getUserInfoByPhone()
    if (res.code === 0 && res.data) {
      rootStore.updateShowWxFlag(!res.data.subscribe || !res.data.loginStatus)
    }
  } catch {
    // 拉取失败不阻塞主流程
  }
}

onMounted(() => {
  if (isClientModeVal) {
    onResize()
    window.addEventListener('resize', onResize)
  }
  initClientDrag()
  onEventMessage()
  getMediaWidth()
  updateShowWxFlagAction()
  window.addEventListener('resize', getMediaWidth)
})

onUnmounted(() => {
  if (isClientModeVal) {
    window.removeEventListener('resize', onResize)
  }
  window.removeEventListener('resize', getMediaWidth)
  if (closeMovetimer) {
    clearTimeout(closeMovetimer)
  }
})
</script>

<style lang="scss" scoped>
@import './index.scss';
</style>

<style lang="scss">
.custom-tooltip.el-tooltip__popper.is-light {
  color: #03050d;
}

.el-popover__content {
  font-size: 12px;
  padding: 0 16px;
}

.el-popover__title {
  padding-left: 16px;
}

.el-popover {
  border-radius: 8px;
  box-shadow: 0px 9px 28px 8px rgba(0, 0, 0, 0.05), 0px 6px 16px 0px rgba(0, 0, 0, 0.08),
    0px 3px 6px -4px rgba(0, 0, 0, 0.12);
}
</style>
