<template>
  <!-- KPopover 基于 el-popover 封装(attrs 全透传, popper-class 合并 k-popover 前缀),
       manual 受控模式: visible 由 store 的 showDownloadPopover 驱动 -->
  <KPopover
    :visible="showDownloadPopover"
    :placement="placement"
    :popper-options="popperOptions"
    :disabled="disabled"
    :offset="4"
    width="auto"
    popper-class="download-popover"
  >
    <div class="content">
      <el-progress
        type="circle"
        :percentage="downloadRrogress"
        :width="48"
        color="#7143F0"
        v-if="downloadRrogress < 100"
      ></el-progress>
      <img src="./img/download-suc.png" alt="" class="download-suc" v-else />
      <div class="text">
        <div class="text-info" v-if="downloadRrogress < 100">
          正在导出中共{{ unDownData.totalCount || 0 }}个文件,剩余:
          <span class="un_downCount">{{ unDownData.unDownCount || 0 }}</span>
          个
        </div>
        <div class="text-info" v-else>任务已导出完成</div>
        <div class="text-task">
          <div v-if="downloadRrogress < 100">可在【下载中心】查看任务，</div>
          <div v-else>文件将保留7天，请尽快下载，</div>
          <div class="text-task__btn" @click="open">
            <span>下载中心</span>
            <k-icon><ArrowRight /></k-icon>
          </div>
        </div>
      </div>
      <div class="close-icon" @click="toggleVisible">
        <k-icon><Close /></k-icon>
      </div>
    </div>
    <template #reference>
      <slot />
    </template>
  </KPopover>
</template>

<script setup lang="ts">
/**
 * 下载中心-导出进度气泡(挂在下载中心图标下方)
 * 来源: netc-pc-web/src/views/download/download-popover.vue
 *
 * vuex -> Pinia 映射:
 *  - state.downloadCenter.downloadRrogress   -> usePcWebDownloadCenterStore().downloadRrogress
 *  - state.downloadCenter.showDownloadPopover -> usePcWebDownloadCenterStore().showDownloadPopover
 *  - commit('downloadCenter/setShowDownloadPopover')  -> setShowDownloadPopover(val)
 *  - commit('downloadCenter/setShowDownloadSuspended')-> setShowDownloadSuspended(val)
 *
 * 其它替换:
 *  - $bus.emit('openDownloadDrawer') -> eventBus.emit(EE_EVENT.OPEN_DOWNLOAD_DRAWER)
 *  - $umpother(...) -> window.$umpOtherReport('CLK', ...) (event_type_id 2101 为旧体系字段, 新体系不带)
 *  - el-popover -> KPopover(@netc-design-pc/ui); iconfont/el-icon -> k-icon + @netc-design-pc/icons
 *  - el-progress circle 轨道色 element-plus 无 stroke-color prop, 由下方样式 .el-progress-circle__track 控制
 */
import { computed } from 'vue'
import { KPopover, KIcon } from '@netc-design-pc/ui'
import { ArrowRight, Close } from '@netc-design-pc/icons'
import { usePcWebDownloadCenterStore } from '@/stores/pc-web/downloadCenter'
import eventBus, { EE_EVENT } from '../eventBus'

defineOptions({ name: 'DownloadPopover' })

export interface DownloadPopoverUnDownData {
  totalCount?: number
  unDownCount?: number
  [key: string]: any
}

withDefaults(
  defineProps<{
    placement?: string
    popperOptions?: Record<string, any>
    disabled?: boolean
    unDownData?: DownloadPopoverUnDownData
  }>(),
  {
    placement: 'bottom',
    popperOptions: () => ({
      gpuAcceleration: false,
    }),
    disabled: false,
    unDownData: () => ({}),
  }
)

const downloadCenterStore = usePcWebDownloadCenterStore()

const downloadRrogress = computed(() => downloadCenterStore.downloadRrogress)
const showDownloadPopover = computed(() => downloadCenterStore.showDownloadPopover)

/** 旧 $umpother 气泡埋点 */
function reportExportBubble(buttonName: string) {
  window.$umpOtherReport(
    'CLK',
    {
      eventCode: 'clk_exportbubble_button_v1',
    },
    {
      event_code: 'clk_exportbubble_button_v1',
      page_code: 'page_search_order_v1',
      export_status: downloadRrogress.value < 100 ? '导出中' : '已完成',
      button_name: buttonName,
    }
  )
}

function toggleVisible() {
  reportExportBubble('关闭')
  downloadCenterStore.setShowDownloadPopover(false)
  // 手动关闭浮窗后如果还在下载要打开悬浮窗
  if (downloadRrogress.value < 100) {
    downloadCenterStore.setShowDownloadSuspended(true)
  }
}

function open() {
  reportExportBubble('下载中心')
  // 下载成功后点击下载中心要关闭气泡提示
  if (downloadRrogress.value >= 100) {
    downloadCenterStore.setShowDownloadPopover(false)
  }
  eventBus.emit(EE_EVENT.OPEN_DOWNLOAD_DRAWER)
}
</script>

<style lang="scss">
/* 气泡挂 body 下(popper), 需全局; element-plus 箭头类名为 .el-popper__arrow(旧 element-ui 为 .popper__arrow) */
.download-popover {
  height: 82px;
  border: none !important;
  min-width: 324px !important;
  padding: var(--k-spacing-16) !important;

  .el-progress__text {
    font-size: var(--k-font-size-12) !important;
    color: var(--k-color-purple-05) !important;
  }
  .el-progress-circle__track {
    fill: var(--k-color-purple-01);
    stroke: var(--k-color-grey-02);
  }

  .content {
    position: relative;
    display: flex;
    align-items: center;

    .close-icon {
      display: flex;
      justify-content: center;
      align-items: center;
      position: absolute;
      top: -10px;
      right: -8px;
      cursor: pointer;
      border-radius: 4px;
      width: 16px;
      height: 16px;
      &:hover {
        background: var(--k-color-interaction-08);
      }
    }
    .text {
      margin-left: 8px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }
    .text-info {
      font-size: var(--k-font-size-15);
      font-weight: var(--k-font-weight-bold);
      line-height: var(--k-line-height-15);
      color: var(--k-color-grey-09);
      // text-align-last: left;
      .un_downCount {
        color: var(--k-color-orange-05);
        font-weight: var(--k-font-weight-bold);
      }
    }
    .text-task {
      display: flex;
      align-items: center;
      flex-wrap: nowrap;
      font-size: var(--k-font-size-12);
      line-height: var(--k-line-height-13);
      color: var(--k-color-grey-07);
      &__btn {
        font-size: var(--k-font-size-13);
        width: 74px;
        height: 24px;
        display: flex;
        align-items: center;
        justify-content: center;
        line-height: 1;
        border-radius: var(--k-border-radius-4);
        cursor: pointer;
        color: var(--k-color-purple-05);
        &:hover {
          background: #f0ecfd;
        }
        .k-icon {
          margin-left: 2px;
        }
      }
    }
  }

  .download-suc {
    width: 48px;
    height: 48px;
  }
}
</style>
