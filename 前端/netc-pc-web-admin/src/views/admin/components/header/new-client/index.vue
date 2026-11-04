<template>
  <div class="new-client-container">
    <!-- 登录模式窗口控制条 -->
    <login-toolbar
      v-if="source === 'login'"
      :set-new-icon="setNewIcon"
      :refresh-status="refreshStatus"
      @open-setting="openSetting"
      @refresh="refresh"
      @win-btn-click="onWinBtnClick"
    />
    <!-- 页面模式操作区 -->
    <page-actions
      v-else
      :is-min-width-1280="isMinWidth1280"
      :set-new-icon="setNewIcon"
      :refresh-status="refreshStatus"
      :show-zoom-operate="showZoomOperate"
      @open-setting="openSetting"
      @refresh="refresh"
    />
    <!-- 设置弹窗 -->
    <setting-dialog
      v-model="settingPop"
      v-model:tab-index="tabIndex"
      :new-client-version="newClientVersion"
      :show-new-icon="showNewIcon"
      :show-clear-cache="showClearCache"
      @tab-change="tabChange"
      @check-update="startUpdate"
    />
    <update
      ref="refUpdate"
      :source="source"
      @updateLastVersion="updateLastVersion"
      @submitUpdate="settingPop = false"
    ></update>
    <zoom-panel v-if="showZoomPanel" :needWheel="needWheel" />
    <uninstall-old ref="uninstallOldRef" @uninstallClose="uninstallClose"></uninstall-old>
    <div id="download_animation"></div>
  </div>
</template>

<script setup lang="ts">
/**
 * 来源: netc-pc-web/src/views/new-client/index.vue
 * 迁移说明:
 *  - Options API -> <script setup lang="ts">
 *  - vuex mapState userInfo(root) -> usePcWebRootStore().userInfo(空对象时回退 getUserData)
 *  - API: @/services/api/{admin,preloadOrderData} -> ./api (getTencentSession -> getTencentSessionApi)
 *  - this.$bus -> eventBus(eventemitter3), EE_EVENT.WAYBILL_V3_OPEN_SETTING
 *  - this.$confirm -> ElMessageBox.confirm(取消时显式 return, 等价旧 reject 中断且避免 Vue3 全局错误上报)
 *  - this.$native.* -> @/native/electron (win[btnName] -> { minimize, close } 映射)
 *  - applicationUpdateCheck.applicationEnvValidate(未迁移的旧方法) -> 本地等价实现(已随 use-log-mission 拆出)
 *  - v-ump-click -> v-click-report; svg-icon icon-class -> name; slot="label" -> #label
 *  - :visible.sync -> v-model; el-button type="text" -> type="primary" text; /deep/ -> :deep()
 *  - el-icon-* 字体图标 -> el-icon + @element-plus/icons-vue (class 名保留)
 *  - 老代码遗留: isMinMediaWidth 从未定义(undefined), 刷新 tooltip 恒为禁用, 保持原行为(已随 page-actions 拆出);
 *    代理表单相关 data(requestUrl/proxyType 等)已随 proxy-tab 组件化, 未在本组件迁移
 * 拆分说明(行为不变):
 *  - hooks/use-zoom: zoom 展示组件显隐判断(setup 同步调用, 保持 zoom-panel/zoom-operate 挂载 window.showZoomPanel 时机)
 *  - hooks/use-log-mission: 日志任务轮询与上传
 *  - hooks/use-client-version: 壳版本/灰度检查/新版本图标
 *  - login-toolbar/page-actions/setting-dialog: 模板功能块(相关 scoped 样式随迁)
 */
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { KMessageBox } from '@netc-design-pc/ui'
import Update from './update.vue'
import uninstallOld from './uninstall-old.vue'
import zoomPanel from './zoom/zoom-panel.vue'
import LoginToolbar from './login-toolbar.vue'
import PageActions from './page-actions.vue'
import SettingDialog from './setting-dialog.vue'
import { pullFlushSinglePageData } from './api'
import { getCustomerCode, getPhone, getToken, getUserData } from '@/stores/pc-web/deps/storage'
import { compareVersions } from '@/utils'
import { initMenu } from './utils/menu'
import { usePcWebRootStore } from '@/stores/pc-web/root'
import eventBus, { EE_EVENT } from '@/views/admin/components/header/eventBus'
import { useZoom } from './hooks/use-zoom'
import { useLogMission } from './hooks/use-log-mission'
import { useClientVersion, type UpdateExpose } from './hooks/use-client-version'
import {
  checkOldClient,
  close as closeWindow,
  getClientFrameType,
  getState,
  getVersion,
  isKuaShenClientMode,
  minimize,
  openDevTools,
  reloadCurrentPage,
  setCacheInfo,
} from '@/native/electron'

defineOptions({ name: 'newClient' })

const props = defineProps<{
  source?: string
  isMinWidth1280?: boolean
}>()

const rootStore = usePcWebRootStore()

// ==================== data ====================
const refreshStatus = ref(false)
const winState = ref(2)
const settingPop = ref(false)
const tabIndex = ref(0)
const showClearCache = ref(false)

const refUpdate = ref<UpdateExpose | null>(null)
const uninstallOldRef = ref<{ switchDialog: (flag: boolean) => void } | null>(null)

// ==================== computed ====================
const userInfo = computed<Record<string, any>>(() => {
  return Object.keys(rootStore.userInfo).length ? rootStore.userInfo : getUserData() || {}
})

// ==================== 拆分逻辑块 ====================
const { showZoomOperate, showZoomPanel, needWheel } = useZoom(props)
const { getLogMissionFn } = useLogMission()
const {
  lastVersion,
  showNewIcon,
  newClientVersion,
  setNewIcon,
  fetchVersion,
  checkUpdate,
  startUpdate,
  initNewIcon,
  updateLastVersion,
} = useClientVersion(userInfo, refUpdate)

// ==================== 旧 created ====================
const frameType = getClientFrameType()
const newClientShow = frameType === 5 || frameType === 6

function onOpenSettingEvent() {
  tabIndex.value = 1
  openSetting()
}

eventBus.on(EE_EVENT.WAYBILL_V3_OPEN_SETTING, onOpenSettingEvent)
;(async () => {
  const version = await getVersion()
  showClearCache.value = compareVersions(version, 'V3.1.2') !== -1
})()

// ==================== methods ====================
async function handleInit() {
  const version = await getVersion()
  if (compareVersions(version, 'V2.0.0') === -1) return
  // 初始化右击菜单
  if (compareVersions(version, 'V2.1.2') || isKuaShenClientMode()) {
    initMenu()
  }
  // 检查旧壳
  const data = await checkOldClient()
  if (data && localStorage.getItem('noNeedUninstallOldClient') !== '1') {
    uninstallOldRef.value?.switchDialog(true)
    return
  }
  uninstallClose()
  if (!getPhone()) return
  setCacheInfo('userInfo', {
    phone: getPhone(),
    customerCode: getCustomerCode(),
    token: getToken(),
  })
}

function uninstallClose() {
  const loginVersionUpdate = sessionStorage.getItem('loginVersionUpdate')
  if (props.source === 'login' && !loginVersionUpdate) {
    refUpdate.value?.getVersionUpdate()
    sessionStorage.setItem('loginVersionUpdate', '1')
  }
  lastVersion.value = localStorage.getItem('lastVersion') || ''
}

function refresh() {
  pullFlushSinglePageData()
  setTimeout(() => {
    refreshStatus.value = true
    reloadCurrentPage()
  }, 500)
}

function openSetting() {
  settingPop.value = true
}

// 窗口按钮事件
async function onWinBtnClick(btnName: 'minimize' | 'close') {
  if (btnName === 'close') {
    // 取消时中止(旧代码依赖 $confirm reject 中断, 此处显式 return 等价且避免 Vue3 全局错误上报)
    try {
      await KMessageBox.confirm('', '确认退出应用吗？', {})
    } catch {
      return
    }
  }
  const winActions: Record<string, () => Promise<any>> = { minimize, close: closeWindow }
  await winActions[btnName]()
  winState.value = await getState()
}

/** 旧代码遗留: 调用壳注入的 window.submitUpdate(本组件内无调用方, 保留等价方法) */
function submitUpdate() {
  ;(window as any).submitUpdate()
}

// 绑定键盘(旧代码遗留, 无调用方, 保留等价方法)
function keyListen() {
  const BLACK_LIST = ['KeyI', 'KeyR']
  window.addEventListener(
    'keydown',
    (e) => {
      const { ctrlKey, code, shiftKey } = e
      if (ctrlKey && shiftKey && BLACK_LIST.includes(code)) {
        e.preventDefault()
      }
    },
    false
  )
  if (!newClientShow) return
  document.onkeydown = (ev) => {
    const e = ev || window.event
    switch (Number((e as KeyboardEvent).keyCode)) {
      case 37:
      case 39:
        openDevTools(undefined as any)
        break
    }
  }
}

function tabChange(e: { index?: string }) {
  if (e?.index === '2') {
    localStorage.setItem('electronNewIconFlag', '1')
    showNewIcon.value = false
  }
}

// ==================== 生命周期 ====================
onMounted(async () => {
  await fetchVersion()
  initNewIcon()
  checkUpdate()
  if (props.source !== 'login' && newClientShow) {
    getLogMissionFn()
    setInterval(() => {
      getLogMissionFn()
    }, 1000 * 60 * 10)
  }
  handleInit()
  // 壳子设置为主域名，解决iframe跨域
  document.domain = 'ky-express.com'
})

onBeforeUnmount(() => {
  eventBus.off(EE_EVENT.WAYBILL_V3_OPEN_SETTING)
})

defineExpose({ keyListen, submitUpdate })
</script>

<style lang="scss" scoped>
.custom-tooltip.el-tooltip__popper.is-light {
  color: #03050d;
}
.new-client-container {
  .item {
    cursor: pointer;
    color: #fff;
    margin-left: 34px;
  }
  .active {
    animation: fadenum linear 0.6s infinite;
  }
  @keyframes fadenum {
    100% {
      transform: rotate(360deg);
    }
  }
}
.title {
  height: 16px;
  line-height: 16px;
  font-size: 16px;
  font-weight: bold;
  padding-left: 5px;
  border-left: 3px solid #786ef1;
  margin-bottom: 30px;
}
.main .el-button {
  width: 90px;
  height: 32px;
}
#download_animation {
  position: fixed;
  right: 0;
  bottom: 0;
}
</style>
