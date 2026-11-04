<template>
  <div class="download_main">
    <!-- 导出进度气泡(挂在下载中心图标下方) -->
    <DownloadPopover placement="bottom" :unDownData="unDownData">
      <!-- 下载中心图标 -->
      <div @click="openDownload" id="download_animation">
        <!-- 图标 tooltip(旧代码"压缩中提示"状态段已注释, 仅保留 hover 一段) -->
        <section @mouseenter="onShowDownloadCenterTooltip" @mouseleave="onHideDownloadCenterTooltip">
          <k-tooltip
            :disabled="!isMinWidth1280"
            placement="bottom"
            v-model:visible="isShowDownloadCenterTooltip"
            :content="getTooltipContent"
          >
            <DownloadCenterIcon :showRedDot="showRedDot" :unDownData="unDownData" :isMinWidth1280="isMinWidth1280" />
          </k-tooltip>
        </section>
      </div>
    </DownloadPopover>
    <!-- 下载中心抽屉 -->
    <DownloadDrawer ref="downloadListRef" @close="closeDrawer" @user-action="onUserAction"></DownloadDrawer>
    <!-- 可拖拽悬浮球(气泡被手动关闭且仍在导出时展示) -->
    <DownloadSuspended />
  </div>
</template>

<script setup lang="ts">
/**
 * 下载中心入口(header 挂载, header 通过 import download from '.../download' 引入)
 * 来源: netc-pc-web/src/views/download/index.vue (2026-09 同步最新版)
 *
 * vuex -> Pinia 映射:
 *  - $store.state.common.downloadCenter.needUpdate         -> usePcWebCommonStore().downloadCenter.needUpdate
 *  - $store.commit('common/setDownloadCenterNeedUpdate')   -> usePcWebCommonStore().setDownloadCenterNeedUpdate
 *  - $store.state.downloadCenter.withoutCompress          -> usePcWebDownloadCenterStore().withoutCompress
 *  - $store.state.downloadCenter.isWaybillExportMultiple  -> usePcWebDownloadCenterStore().isWaybillExportMultiple
 *  - $store.state.downloadCenter.downloadRrogress         -> usePcWebDownloadCenterStore().downloadRrogress
 *  - $store.state.downloadCenter.showDownloadSuspended    -> usePcWebDownloadCenterStore().showDownloadSuspended
 *  - $store.commit('downloadCenter/setDownloadRrogress')                  -> setDownloadRrogress(val)
 *  - $store.commit('downloadCenter/setShowDownloadPopover')               -> setShowDownloadPopover(val)
 *  - $store.commit('downloadCenter/setShowDownloadSuspended')             -> setShowDownloadSuspended(val)
 *  - $store.commit('downloadCenter/setDownloadCenterWithoutCompress')      -> setDownloadCenterWithoutCompress
 *  - $store.commit('downloadCenter/downloadCenterIsWaybillExportMultiple') -> downloadCenterIsWaybillExportMultiple
 *
 * 其它替换:
 *  - $bus -> eventBus (eventemitter3, 事件名与老项目一致)
 *  - reportHeaderClick(老 @/views/layout/report) -> ../report (内部 window.$umpOtherReport)
 *  - 老全局 mixin data isClientMode -> isClientMode()(@/native/electron, setup 时一次性求值, 等效)
 *  - $message -> ElMessage
 *  - 导出进度气泡 DownloadPopover / 可拖拽悬浮球 DownloadSuspended 于 2026-09 一并迁移挂载
 */
import { computed, nextTick, onBeforeUnmount, onMounted, provide, ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import DownloadDrawer from './download.vue'
import DownloadPopover from './download-popover.vue'
import DownloadSuspended from './download-suspended.vue'
import DownloadNotification from './notification'
import DownloadCenterIcon from './download-center-icon.vue'
import * as downloadCenterApi from './api'
import { downloadFile } from './download-utils'
import { NOTIFICATION_MAX_POLLING_COUNT } from './consts'
import { reportHeaderClick } from '../report'
import eventBus, { EE_EVENT } from '../eventBus'
import { isClientMode } from '@/native/electron'
import { usePcWebCommonStore } from '@/stores/pc-web/common'
import { usePcWebDownloadCenterStore } from '@/stores/pc-web/downloadCenter'
import { KTooltip } from '@netc-design-pc/ui'

defineOptions({ name: 'index' })

withDefaults(
  defineProps<{
    isMinWidth1280?: boolean
  }>(),
  {
    isMinWidth1280: false,
  }
)

provide('timeDuration', 2000)

const commonStore = usePcWebCommonStore()
const downloadCenterStore = usePcWebDownloadCenterStore()

const downloadListRef = ref<InstanceType<typeof DownloadDrawer> | null>(null)

// 旧全局 mixin: data() { isClientMode: native.isClientMode() } 的一次性求值
const isClientModeVal = isClientMode()

const showTip = ref(false)
const isShowDownloadCenterTooltip = ref(false)
const pollingTime = ref(3000) // 压缩中的列表，轮询时间
const unDownData = ref<Record<string, any>>({}) // notification 新增的压缩任务，消息提醒等
const showRedDot = ref(false) // 展示红点
const polling = ref(false)
const pollingCount = ref(0) // 轮询次数
const showTipDelayTime = 10000
const isShowAllNotification = ref(true) // 是否全部展示完毕通知
const isUserDownloadListAction = ref(false) // 是否用户操作过
const errorPollingCount = ref(0) // 错误轮询次数
const errorMaxPollingCount = 30 // 错误最大轮询次数

// 非响应式实例属性(老代码未在 data 中声明)
let timer: ReturnType<typeof setTimeout> | null = null
// 最近一次「任务完成置 100」时的后端版本号(needUpdate 防重比对用)
let lastCompletedVersionId = ''

const drawerVisibleFlag = computed(() => downloadListRef.value?.drawerVisible)

/**
 * 是否显示下载中心提示信息
 * 接口返回的未下载的unDownCount标识 && 显示提示信息 && 没有运单列表导出小于等于200票不需要压缩的标识
 */
const isShowDownloadingTooltip = computed(() => {
  return Boolean(unDownData.value?.unDownCount && showTip.value && !downloadCenterStore.withoutCompress)
})

const getTooltipContent = computed(() => {
  // 最新代码: 压缩中文案分支已注释, tooltip 内容恒为「下载中心」
  return '下载中心'
})

watch(
  () => commonStore.downloadCenter.needUpdate,
  (newValue) => {
    if (newValue) {
      console.log('needUpdate::::', newValue)
      // needUpdate 防重: 任务完成后(进度仍为 100 且后端版本号未变)的重复触发,
      // 不再重置进度/弹提示/唤起气泡 —— 否则 100 被重置为 0 后, 轮询永远等不到完成事件,
      // 气泡会卡在「正在导出中 0%」。
      // 注: 若是紧随上个任务完成之后创建的真新任务(版本号尚未刷新), 此处会被误判为重复而跳过,
      //     由下方 handleUnDownTaskData 的新数据进度同步在 <=3s 内自行纠偏(重开气泡+同步进度)
      const currentVersionId = unDownData.value?.versionId || ''
      if (
        downloadCenterStore.downloadRrogress >= 100 &&
        currentVersionId &&
        currentVersionId === lastCompletedVersionId
      ) {
        showTips()
        pollingGetUnDownTask({ isResetPollingCount: true })
        return
      }
      if (downloadCenterStore.downloadRrogress >= 100) {
        downloadCenterStore.setDownloadRrogress(0)
      }
      ElMessage.success(`已为您成功创建下载任务`)
      if (!downloadCenterStore.showDownloadSuspended) {
        downloadCenterStore.setShowDownloadPopover(true)
      }
      showTips()
      pollingGetUnDownTask({ isResetPollingCount: true })
    }
  }
)

watch(
  () => downloadCenterStore.withoutCompress,
  (newValue) => {
    if (newValue) {
      pollingTime.value = 1500
    } else {
      pollingTime.value = 3000
      pollingGetUnDownTask({ isResetPollingCount: true })
    }
  }
)

watch(isShowDownloadingTooltip, (newValue) => {
  if (newValue) {
    eventBus.emit(EE_EVENT.SET_DOWNLOAD_CENTER_ANIMATION_FADE)
  }
})

onMounted(() => {
  // 通知实例: 最新代码已注释 add 分支, 仅实例化以挂接 onClick/onShowAll 回调(tooltip 展示门控仍依赖 onShowAll)
  new DownloadNotification({
    onClick: () => {
      openDownload()
    },
    onShowAll: (data) => {
      console.log('onShowAll::::', data)
      isShowAllNotification.value = data
    },
  })
  pollingGetUnDownTask()
  eventBus.on(EE_EVENT.OPEN_DOWNLOAD_DRAWER, () => {
    openDownload('outside')
  })
})

onBeforeUnmount(() => {
  eventBus.off(EE_EVENT.OPEN_DOWNLOAD_DRAWER)
})

// 注: 与老项目一致, @click 直接传事件对象 -> outside 为 truthy(等效跳过埋点);
// 如需在图标点击时埋点, 模板改为 @click="openDownload()"
function openDownload(outside?: unknown) {
  if (!outside) reportHeaderClick('下载中心')
  showTip.value = false
  showRedDot.value = false
  restartPolling()
  nextTick(() => {
    downloadListRef.value?.switchVisible({
      actionType: 'openDownload',
      needSelectRow: true,
    })
  })
}

/* 任务完成: 置 100 并记录后端版本号(供 needUpdate 防重比对), 气泡展示「任务已导出完成」后由悬浮球 watch 3s 自动关闭 */
function markTaskCompleted() {
  downloadCenterStore.setDownloadRrogress(100)
  lastCompletedVersionId = unDownData.value?.versionId || ''
}

/* 兜底自愈: 气泡仍开着, 但本响应已无进行中任务(无 process)、无未下载、无错误任务,
   且此前确实跟踪到过任务(旧数据有进度或有未下载数) -> 判定任务已结束, 置 100 走自动关闭流程。
   防御: needUpdate 误触发把 100 重置为 0 后, 轮询永远等不到完成事件导致气泡卡「正在导出中 0%」。
   (要求 oldProcess/oldUnDownCount 是为防"任务刚创建、后端记录尚未入库"的竞态误关气泡) */
function healPopoverIfIdle({
  data,
  unDownCount,
  errorTaskResponseList,
  oldProcess,
  oldUnDownCount,
}: {
  data: Record<string, any>
  unDownCount?: number
  errorTaskResponseList?: any[]
  oldProcess?: number
  oldUnDownCount: number
}) {
  const shouldHeal =
    downloadCenterStore.showDownloadPopover &&
    !data.process &&
    !unDownCount &&
    !errorTaskResponseList?.length &&
    (oldProcess || oldUnDownCount)
  if (shouldHeal) {
    markTaskCompleted()
  }
}

/* 处理轮询成功返回的未下载任务数据(由 pollingGetUnDownTask 回调提取,
   oldUnDownCount/oldProcess 为上次轮询的未下载数与进行中进度) */
function handleUnDownTaskData(data: Record<string, any>, oldUnDownCount: number, oldProcess?: number) {
  const { unDownCount, unDownTaskResponseList, errorTaskResponseList } = data
  if (unDownTaskResponseList?.length) {
    if (!data.process) {
      markTaskCompleted()
    }
    autoDownloadFile(unDownTaskResponseList)
    showTip.value = false
    downloadCenterStore.setDownloadCenterWithoutCompress(false)
    downloadCenterStore.downloadCenterIsWaybillExportMultiple(false)
  }
  if (errorTaskResponseList?.length) {
    // 先关闭悬浮球与气泡再中断动画
    downloadCenterStore.setShowDownloadSuspended(false)
    downloadCenterStore.setShowDownloadPopover(false)
    eventBus.emit(EE_EVENT.DOWNLOAD_INTERFACE_ERROR_INTERRUPT)
    // 产品需要先关闭动画再弹出提示toast
    setTimeout(() => {
      showErrorToast(errorTaskResponseList)
    }, 1000)
  }
  if (unDownTaskResponseList?.length || errorTaskResponseList?.length) {
    // 成功消息、错误消息标记已读
    markNotificationAsRead()
  }
  if (unDownCount) {
    showRedDot.value = false
  } else if (oldUnDownCount) {
    // 下载数从有到无
    showRedDot.value = true
  }
  // 新数据已带进行中进度: 以新数据为准同步进度并确保气泡展示
  // (needUpdate 防重误跳过新任务唤起时, 由轮询在 <=3s 内自行纠偏)
  if (data.process) {
    downloadCenterStore.setDownloadRrogress(data.process)
    if (!downloadCenterStore.showDownloadSuspended) {
      downloadCenterStore.setShowDownloadPopover(true)
    }
  }
  healPopoverIfIdle({ data, unDownCount, errorTaskResponseList, oldProcess, oldUnDownCount })
  if (isUserDownloadListAction.value) {
    isUserDownloadListAction.value = false
    resetVersionId()
  }
}

function pollingGetUnDownTask({ isResetPollingCount = false }: { isResetPollingCount?: boolean } = {}) {
  if (isResetPollingCount) {
    pollingCount.value = 0
    errorPollingCount.value = 0
  }
  if (polling.value) return
  if (pollingCount.value > NOTIFICATION_MAX_POLLING_COUNT) return
  if (errorPollingCount.value > errorMaxPollingCount) return
  polling.value = true
  downloadCenterApi
    .getUnDownTask({
      versionId: unDownData.value?.versionId || '',
    })
    .then(async (res) => {
      if (res.code === 0) {
        const oldUnDownCount = unDownData.value?.unDownCount || 0
        const oldProcess = unDownData.value?.process
        // 旧数据处理: 有进度则同步进度并展示气泡(悬浮球未展示时)
        if (oldProcess) {
          downloadCenterStore.setDownloadRrogress(oldProcess)
          if (!downloadCenterStore.showDownloadSuspended) {
            downloadCenterStore.setShowDownloadPopover(true)
          }
        }
        if (downloadCenterStore.downloadRrogress > 0 && !oldProcess) {
          downloadCenterStore.setDownloadRrogress(100)
        }
        const data = res.data || {}
        const { userDownStatus } = data
        // 版本号不一致才设置数据
        unDownData.value = data
        handleUnDownTaskData(data, oldUnDownCount, oldProcess)
        timer && clearTimeout(timer)
        timer = setTimeout(() => {
          polling.value = false
          if (userDownStatus) {
            pollingGetUnDownTask() // 用户7小时内是否有过创建下载任务
          }
        }, pollingTime.value)
      } else {
        // 注: 新请求层 code!==0 会 reject, 此分支由下方 catch 兜底(逻辑一致)
        errorPollingCount.value += 1
        timer && clearTimeout(timer)
        timer = setTimeout(() => {
          polling.value = false
          pollingGetUnDownTask() // 哪种失败都要继续重试
        }, pollingTime.value)
      }
    })
    .catch((e) => {
      console.error('pollingGetUnDownTask 错误', e)
      errorPollingCount.value += 1
      timer && clearTimeout(timer)
      timer = setTimeout(() => {
        polling.value = false
        pollingGetUnDownTask() // 哪种失败都要继续重试
      }, pollingTime.value)
    })
    .finally(() => {
      pollingCount.value += 1
      commonStore.setDownloadCenterNeedUpdate(false)
    })
}

function restartPolling() {
  if (pollingCount.value >= NOTIFICATION_MAX_POLLING_COUNT) {
    pollingGetUnDownTask({ isResetPollingCount: true }) // 打开文件中心，重置轮询次数
  }
}

function showTips() {
  console.log('showTips::::', showTip.value, isShowAllNotification.value)
  if (showTip.value || !isShowAllNotification.value) return // toast正在展示时不重复展示、通知消息还在展示时也不展示（否则tooltip会在通知上）。因为element的全局组件(tooltip、notification等组件)的z-index是自增的，后来的会盖住之前的
  setTimeout(() => {
    if (!drawerVisibleFlag.value) {
      showTip.value = true
    }
  }, 300)
  setTimeout(() => {
    showTip.value = false
  }, showTipDelayTime)
}

// 注: 最新代码已注释 showNotification(压缩完成 Notification 提醒)分支,
// DownloadNotification 实例保留(onClick/onShowAll 仍被 tooltip 展示逻辑使用), 暂不触发 add

function showErrorToast(list: any[] = []) {
  list?.forEach(async (item) => {
    ElMessage.error(item.message)
  })
}

async function markNotificationAsRead() {
  downloadCenterApi.readUnDownTask().catch((e) => {
    console.error('消息已读失败:::', e)
  })
}

// 返回新压缩完成任务时，自动下载最后一个消息(任务)的一个压缩包文件
async function autoDownloadFile(list: any[] = []) {
  if (list?.length) {
    const newList = [...list]
    const item = newList.pop()
    if (isClientModeVal && item?.fileName?.endsWith('.zip')) return
    await downloadFile(item)

    // downloadListRef.value?.onGoingRef?.userAction?.()
    // downloadListRef.value?.onDoneRef?.userAction?.()
  }
}

function onShowDownloadCenterTooltip() {
  isShowDownloadCenterTooltip.value = true
}

function onHideDownloadCenterTooltip(delay?: unknown) {
  console.log('onHideDownloadCenterTooltip', delay)
  if (delay) {
    // 老代码 @mouseleave 直接把 MouseEvent 传入 delay(setTimeout 按数字解析等效 0ms), 行为保持一致
    setTimeout(() => {
      isShowDownloadCenterTooltip.value = false
    }, Number(delay) || 0)
  } else {
    isShowDownloadCenterTooltip.value = false
  }
}

function closeDrawer() {
  showTip.value = false
  showRedDot.value = false
  closeTooltip()
  // 延时隐藏才有效果
  setTimeout(() => {
    // element-plus tooltip popper 类名为 .el-popper(旧 element-ui 为 .el-tooltip__popper)
    const list = document.querySelectorAll<HTMLElement>('.el-popper')
    let arr = Array.from(list)
    let el: HTMLElement | null = null
    arr.forEach((item) => {
      if (item.textContent === '下载中心') {
        el = item
      }
    })
    const target = el as HTMLElement | null
    if (target) {
      console.log('&&&&&&&&&&&&&', 'display')
      target.style.display = 'none'
    }
  }, 100)
}

// //关闭table上超出隐藏的toolTip,要不然鼠标一直在上面不会消失
function closeTooltip() {
  try {
    // element-plus tooltip popper 类名为 .el-popper(旧 element-ui 为 .el-tooltip__popper)
    // 注: 老代码 ['.xlsx','.zip'].includes(textContent) > -1 恒为 true(布尔值与 -1 比较), 实际隐藏了全部 tooltip;
    // 此处按其字面意图(隐藏 .xlsx/.zip 文件名超长溢出的 tooltip)实现, 避免误伤全站其它 popper(下拉/日期等也是 .el-popper)
    const myNodeList = document.querySelectorAll<HTMLElement>('.el-popper')
    myNodeList.forEach((i) => {
      if (i.textContent && ['.xlsx', '.zip'].includes(i.textContent)) {
        i.style.display = 'none'
        console.log('下载中心::::隐藏tooltip')
      }
    })
  } catch (e) {
    console.warn(e)
  }
}

function resetVersionId() {
  unDownData.value.versionId = `date-${Date.now()}`
}

function onUserAction() {
  isUserDownloadListAction.value = true
}
</script>

<style scoped lang="scss">
/* 组件根布局由 header/index.scss 的 .menu 规则统一接管, 组件内不再定义 */
</style>

<style lang="scss">
/* 下载中心完成通知样式(ElNotification 挂在 body 下, 需全局);
   element-plus 成功图标类名 .el-icon-success -> .el-notification--success */
.download-center-notification {
  .el-notification__title {
    line-height: 1.2;
  }
  &__btn {
    margin-top: 7px;
  }
  &.el-notification .el-notification--success {
    color: #41c381;
  }
}
</style>
