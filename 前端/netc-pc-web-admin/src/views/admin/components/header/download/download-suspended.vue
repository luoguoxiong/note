<template>
  <div v-drag class="download-suspended__container" v-if="showDownloadSuspended">
    <div class="content">
      <el-progress
        type="circle"
        :percentage="downloadRrogress"
        :width="46"
        color="#7143F0"
        v-if="downloadRrogress < 100"
      ></el-progress>
      <img v-else src="./img/download-suc.png" alt="" class="download-suc" />
      <div class="open" @click="open">展开</div>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * 下载中心-可拖拽悬浮球(气泡被手动关闭且仍在导出时展示, 点击展开打开下载中心)
 * 来源: netc-pc-web/src/views/download/download-suspended.vue
 *
 * vuex -> Pinia 映射:
 *  - state.downloadCenter.downloadRrogress    -> usePcWebDownloadCenterStore().downloadRrogress
 *  - state.downloadCenter.showDownloadSuspended -> usePcWebDownloadCenterStore().showDownloadSuspended
 *
 * 其它替换:
 *  - $bus.emit('openDownloadDrawer') -> eventBus.emit(EE_EVENT.OPEN_DOWNLOAD_DRAWER)
 *  - $umpother(...) -> window.$umpOtherReport('CLK', ...) (event_type_id 2101 为旧体系字段, 新体系不带)
 *  - v-drag 指令: Vue2 bind -> Vue3 mounted
 *  - el-progress circle 轨道色 element-plus 无 define-back-color prop, 由下方样式 .el-progress-circle__track 控制
 */
import { computed, watch } from 'vue'
import { usePcWebDownloadCenterStore } from '@/stores/pc-web/downloadCenter'
import eventBus, { EE_EVENT } from '../eventBus'

defineOptions({ name: 'DownloadSuspended' })

const downloadCenterStore = usePcWebDownloadCenterStore()

const downloadRrogress = computed(() => downloadCenterStore.downloadRrogress)
const showDownloadSuspended = computed(() => downloadCenterStore.showDownloadSuspended)

watch(downloadRrogress, (val) => {
  if (val >= 100) {
    // 下载成功300ms后关闭悬浮球打开气泡提示
    if (showDownloadSuspended.value) {
      setTimeout(() => {
        downloadCenterStore.setShowDownloadSuspended(false)
        downloadCenterStore.setShowDownloadPopover(true)
      }, 300)
    }
    // 下载成功后3s关闭气泡提示
    setTimeout(() => {
      downloadCenterStore.setShowDownloadPopover(false)
    }, 3000)
  }
})

/** 旧 $umpother 悬浮球埋点 */
function reportSuspended(buttonName: string) {
  window.$umpOtherReport(
    'CLK',
    {
      eventCode: 'clk_exportbubble_floating_button_v1',
    },
    {
      event_code: 'clk_exportbubble_floating_button_v1',
      page_code: 'page_search_order_v1',
      export_status: downloadRrogress.value < 100 ? '导出中' : '已完成',
      button_name: buttonName,
    }
  )
}

function open() {
  reportSuspended('展开')
  eventBus.emit(EE_EVENT.OPEN_DOWNLOAD_DRAWER)
}

/** 纵向拖拽指令(限制在 header 以下、底栏以上) */
const vDrag = {
  mounted(el: HTMLElement) {
    el.onmousedown = (e: MouseEvent) => {
      const disY = e.clientY - el.offsetTop
      document.onmousemove = (moveEvent: MouseEvent) => {
        let top = moveEvent.clientY - disY
        if (top < 83) {
          top = 83
        }
        if (top + el.clientHeight > document.body.clientHeight - 60) {
          el.style.bottom = '60px'
          el.style.top = 'unset'
          return
        }
        el.style.top = `${top}px`
        el.style.bottom = 'unset'
      }
      document.onmouseup = () => {
        document.onmousemove = null
        document.onmouseup = null
      }
    }
  },
}
</script>

<style lang="scss" scoped>
.download-suspended__container {
  user-select: none;
  position: fixed;
  right: 8px;
  top: 83px;
  z-index: 1000;
  height: 82px;
  width: 48px;
  background: #ffffff;
  border-radius: 24px;
  box-shadow: 0px 4.5px 14px 4px rgba(0, 0, 0, 0.05), 0px 3px 8px 0px rgba(0, 0, 0, 0.08),
    0px 1.5px 3px -2px rgba(0, 0, 0, 0.12);
  transition: all 0.3s, top 0s, left 0s, right 0s, bottom 0s;

  .content {
    display: flex;
    flex-direction: column;
    align-items: center;
    height: 100%;
  }
  .open {
    position: absolute;
    bottom: 8px;
    width: 32px;
    height: 18px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 4px;
    cursor: pointer;
    color: var(--k-color-purple-05);
    font-size: var(--k-font-size-12);
    &:hover {
      background: var(--k-color-purple-01);
    }
  }
  :deep(.el-progress__text) {
    font-size: var(--k-font-size-12) !important;
    color: var(--k-color-purple-05) !important;
  }
  :deep(.el-progress-circle__track) {
    fill: var(--k-color-purple-01);
    stroke: var(--k-color-grey-02);
  }
  .download-suc {
    width: 40px;
    height: 40px;
    margin-top: 2px;
  }
}
</style>
