<template>
  <el-dialog
    v-model="dialogVisible"
    width="400px"
    title=""
    class="ky-activity-popup"
    :close-on-click-modal="false"
    :show-close="false"
    append-to-body
  >
    <div ref="containerRef" class="container">
      <div class="content" :style="posterStyle" @click="jumpToTarget"></div>

      <div v-if="hasNoLongerRemind" class="tip" @click.stop="onToggleRemind">
        <img v-if="!selected" src="./imgs/unselected-icon.svg" alt="" />
        <img v-else src="./imgs/selected-icon.svg" alt="" />
        <span>{{ noLongerRemindDaysText }}</span>
      </div>

      <div v-if="showCloseButton" class="close-button" @click="handelClose">
        <img class="close-icon" src="./imgs/close-popup.svg" alt="" />
      </div>
    </div>
  </el-dialog>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { eventReport } from '@/apis/home'
import type { AdvertisementPopupDto, BannerDetailItem } from '@/apis/home/types'
import { runExitAnimation } from './animation'
import { usePopupActions } from './use-popup-actions'

defineOptions({ name: 'ky-activity-popup' })

const dialogVisible = ref(false)
const containerRef = ref<HTMLElement | null>(null)
const messageModel = ref<AdvertisementPopupDto | null>(null)
const advertisementCode = ref('')
const pushToStyle = ref(0)
const selected = ref(false)

const actions = usePopupActions()

const hasNoLongerRemind = computed(() => Number(messageModel.value?.noLongerRemind) === 1)
const noLongerRemindDaysText = computed(() => {
  const days = messageModel.value?.noLongerRemindDays
  return days ? days + '天不再提醒' : '不再提醒'
})
const showCloseButton = computed(() => messageModel.value?.configCloseButton === '1')
const posterStyle = computed(() => {
  const url = messageModel.value?.posterLink
  return url ? { backgroundImage: 'url(' + url + ')' } : {}
})

async function showDialog(detail: BannerDetailItem): Promise<void> {
  messageModel.value = detail.advertisementPopupDto ?? null
  advertisementCode.value = detail.advertisementCode
  pushToStyle.value = detail.pushToStyle ?? 0
  selected.value = false
  dialogVisible.value = true
  // eventType=3 在新项目 eventReport 内部直接 return 不再上报
  eventReport({ adCodes: [advertisementCode.value], eventType: 3 })
}

async function jumpToTarget(): Promise<void> {
  const buttonList = messageModel.value?.buttonList ?? []
  const firstButton = buttonList[0]
  if (!firstButton) return

  const result = await actions.submit(firstButton, {
    popupType: 'activity',
    advertisementCode: advertisementCode.value,
    pushToStyle: pushToStyle.value,
    noLongerRemindSelected: selected.value,
    buttonList,
    clickEventType: 4,
    arrayIndex: 0,
    // 旧实现交互：二次确认时先隐藏弹窗，取消后恢复
    onTwoConfirmHide: () => {
      dialogVisible.value = false
    },
    onTwoConfirmRestore: () => {
      dialogVisible.value = true
    },
  })
  if (result.shouldClose) {
    dialogVisible.value = false
  }
}

async function handelClose(): Promise<void> {
  // 旧实现 confirmByUser(2) 内部 buttonIndex 硬编码取 buttonList[0].buttonIndex
  const buttonIndex = messageModel.value?.buttonList?.[0]?.buttonIndex
  await actions.reportClose(advertisementCode.value, selected.value, buttonIndex)
  try {
    if (pushToStyle.value) {
      await runExitAnimation(containerRef.value)
    }
  } finally {
    dialogVisible.value = false
  }
}

function onToggleRemind(): void {
  selected.value = !selected.value
}

defineExpose<{
  showDialog: typeof showDialog
  dialogVisible: typeof dialogVisible
}>({
  showDialog,
  dialogVisible,
})
</script>

<style lang="scss" scoped>
.ky-activity-popup {
  .container {
    .content {
      background-repeat: no-repeat;
      height: 512px;
      cursor: pointer;
      background-size: cover;
      -webkit-background-size: cover;
      -o-background-size: cover;
      background-position: center 0;
    }

    .tip {
      font-size: 13px;
      color: #fff;
      text-align: center;
      margin-top: 16px;
      cursor: pointer;
      img {
        vertical-align: bottom;
        margin-right: 4px;
      }
    }

    .close-button {
      margin-top: 16px;
      text-align: center;
      .close-icon {
        width: 32px;
        height: 32px;
        cursor: pointer;
      }
    }
  }
}
</style>

<style lang="scss">
/* append-to-body 后弹窗 DOM 被传送到 body，scoped 的 :deep 选择器无法命中 .el-dialog；
   且 element-plus 会把 class 直接挂到 .el-dialog 元素自身（而非其父级），
   所以这里用复合选择器 .ky-activity-popup.el-dialog 命中弹窗壳 */
.ky-activity-popup.el-dialog {
  position: absolute;
  top: 50%;
  left: 50%;
  margin: 0 !important;
  transform: translate(-50%, -50%);
  border-radius: 4px;
  box-shadow: none;
  background-color: transparent;
  /* element-plus 2.5.x 的 padding 在 .el-dialog 根元素上（旧版在 __body），必须一并清零 */
  padding: 0;
}
.ky-activity-popup {
  .el-dialog__header {
    display: none;
  }
  .el-dialog__body {
    padding: 0;
  }
}
</style>
