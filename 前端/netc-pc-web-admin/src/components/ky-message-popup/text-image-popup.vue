<template>
  <el-dialog
    v-model="dialogVisible"
    width="400px"
    title=""
    class="ky-text-image-popup"
    :close-on-click-modal="false"
    :show-close="false"
    append-to-body
  >
    <div ref="containerRef" :class="['main', messageModel?.posterLink ? 'picture-container' : 'default-set-container']">
      <div :class="['head-image', messageModel?.posterLink ? 'picture' : 'default-set']">
        <div v-if="!messageModel?.posterLink" class="little-monkey"></div>
      </div>
      <div class="container ql-editor">
        <div class="title">{{ messageModel?.title }}</div>
        <div class="content" v-html="htmlText"></div>
        <div class="down">
          <el-button
            v-for="(item, index) in messageModel?.buttonList"
            :key="index"
            :loading="loading"
            :type="isPrimary(index) ? 'primary' : ''"
            class="ky-button"
            @click="submit(item, index)"
          >
            {{ item.buttonText }}
          </el-button>
        </div>
      </div>
    </div>

    <div v-if="hasNoLongerRemind" class="tip" @click.stop="onToggleRemind">
      <img v-if="!selected" src="./imgs/unselected-icon.svg" alt="" />
      <img v-else src="./imgs/selected-icon.svg" alt="" />
      <span>{{ noLongerRemindDaysText }}</span>
    </div>

    <div v-if="showCloseButton" class="close-button" @click="handelClose">
      <img class="close-icon" src="./imgs/close-popup.svg" alt="" />
    </div>
  </el-dialog>
</template>

<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue'
import { eventReport } from '@/apis/home'
import type { AdvertisementButton, AdvertisementPopupDto, BannerDetailItem } from '@/apis/home/types'
import { runExitAnimation } from './animation'
import { usePopupActions } from './use-popup-actions'

defineOptions({ name: 'ky-text-image-popup' })

const dialogVisible = ref(false)
const containerRef = ref<HTMLElement | null>(null)
const messageModel = ref<AdvertisementPopupDto | null>(null)
const htmlText = ref('')
const advertisementCode = ref('')
const pushToStyle = ref(0)
const loading = ref(false)
const selected = ref(false)

const actions = usePopupActions()

const hasNoLongerRemind = computed(() => Number(messageModel.value?.noLongerRemind) === 1)
const noLongerRemindDaysText = computed(() => {
  const days = messageModel.value?.noLongerRemindDays
  return days ? days + '天不再提醒' : '不再提醒'
})
const showCloseButton = computed(() => messageModel.value?.configCloseButton === '1')
const isPrimary = (index: number) => {
  const buttonList = messageModel.value?.buttonList ?? []
  return buttonList.length === 1 || index === 1
}

async function showDialog(detail: BannerDetailItem): Promise<void> {
  const dto = detail.advertisementPopupDto ?? null
  messageModel.value = dto
  advertisementCode.value = detail.advertisementCode
  pushToStyle.value = detail.pushToStyle ?? 0
  htmlText.value = dto?.content ?? ''
  selected.value = false
  dialogVisible.value = true
  try {
    // 付款授权通知弹窗事件曝光埋点（旧实现 window.report.sendExpEvent，新项目用 $umpOtherReport）
    const buttonList = dto?.buttonList ?? []
    const pageGroupCodes = buttonList.map((f) => f.pageGroupCode)
    const isApplication = buttonList.some((f) => f.modelRoute === '/admin/payment-authorization?activeTab=30')
    if (pageGroupCodes.includes('PC_PAYMENT_AUTHORIZATION')) {
      const eventCode = isApplication ? 'exp_customer_code_bind_apply_notice' : 'exp_customer_code_bind_pay_notice'
      window.$umpOtherReport?.(
        'EXP',
        { eventCode },
        {
          button_name: '暂不处理，立即处理',
          page_name: 'page_customer_code_bind',
        }
      )
    }
    // eventType=3 在新项目 eventReport 内部直接 return 不再上报
    eventReport({ adCodes: [advertisementCode.value], eventType: 3 })
  } catch (e) {
    console.log(e, ':>> e')
  }
}

async function submit(button: AdvertisementButton, index: number): Promise<void> {
  loading.value = true
  try {
    const buttonList = messageModel.value?.buttonList ?? []
    const result = await actions.submit(button, {
      popupType: 'text-image',
      advertisementCode: advertisementCode.value,
      pushToStyle: pushToStyle.value,
      noLongerRemindSelected: selected.value,
      buttonList,
      clickEventType: 1,
      arrayIndex: index,
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
  } finally {
    loading.value = false
  }
}

async function handelClose(): Promise<void> {
  await actions.reportClose(advertisementCode.value, selected.value, undefined)
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

watch(htmlText, () => {
  nextTick(() => {
    const root = containerRef.value
    if (!root) return
    const anchors = root.querySelectorAll('a')
    anchors.forEach((el) => {
      const href = el.getAttribute('href')
      if (!href) return
      el.setAttribute('href', 'javascript:void(0);')
      el.addEventListener('click', (e: Event) => {
        e.preventDefault()
        // 旧实现：链接跳转后关闭弹窗
        if (href && actions.handleAnchorLink(href)) {
          dialogVisible.value = false
        }
      })
    })
  })
})

defineExpose<{
  showDialog: typeof showDialog
  dialogVisible: typeof dialogVisible
}>({
  showDialog,
  dialogVisible,
})
</script>

<style lang="scss" scoped>
.ky-text-image-popup {
  .main {
    background: white;
    border-radius: 4px;
    box-shadow: 0px 9px 28px 8px rgba(0, 0, 0, 0.05), 0px 6px 16px 0px rgba(0, 0, 0, 0.08),
      0px 3px 6px -4px rgba(0, 0, 0, 0.12);
    &.picture-container {
      box-shadow: none;
      background: none;
      .container {
        background: #ffffff;
        box-shadow: 0px 9px 28px 8px rgba(0, 0, 0, 0.05), 0px 6px 16px 0px rgba(0, 0, 0, 0.08),
          0px 3px 6px -4px rgba(0, 0, 0, 0.12);
        position: relative;
        z-index: 1;
      }
    }
  }
  .picture {
    height: 118px;
    width: 100%;
    background-size: cover;
    -webkit-background-size: cover;
    -o-background-size: cover;
    background-position: center 0;
    background-repeat: no-repeat;
  }
  .default-set {
    height: 94px;
    .little-monkey {
      position: absolute;
      top: -62px;
      background-image: url('~@/assets/image/little-monkey.png');
      background-position: center;
      background-size: 100%;
      background-repeat: no-repeat;
      width: 400px;
      height: 150px;
    }
  }
  .head-image {
    margin-bottom: -1px;
    position: relative;
    z-index: 2;
  }
  .container {
    padding-bottom: 24px;
    .title {
      font-size: 18px;
      font-weight: bold;
      text-align: center;
      color: #333333;
      line-height: 25px;
      white-space: pre-wrap;
      padding: 16px 20px 0 20px;
    }
    .content {
      margin: 20px 0 26px 0;
      padding: 0 20px;
      font-size: 13px;
      font-weight: 400;
      color: #333333;
      line-height: 1.6;
      white-space: pre-wrap;
      max-height: 204px;
      overflow-y: auto;
      @include scroll-bar;
    }
    .down {
      margin-bottom: 24px;
      text-align: center;
    }
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
</style>

<style lang="scss">
/* append-to-body 后弹窗 DOM 被传送到 body，scoped 的 :deep 选择器无法命中 .el-dialog；
   且 element-plus 会把 class 直接挂到 .el-dialog 元素自身（而非其父级），
   所以这里用复合选择器 .ky-text-image-popup.el-dialog 命中弹窗壳 */
.ky-text-image-popup.el-dialog {
  position: absolute;
  top: 50%;
  left: 50%;
  margin: 0 !important;
  transform: translate(-50%, -50%);
  box-shadow: none;
  background-color: transparent;
  /* element-plus 2.5.x 的 padding 在 .el-dialog 根元素上（旧版在 __body），必须一并清零，
     否则白色卡片被内缩为 368px，400px 宽的猴子 banner 会溢出错位 */
  padding: 0;
}
.ky-text-image-popup {
  .el-dialog__header {
    display: none;
  }
  .el-dialog__body {
    padding: 0;
  }
  .el-button {
    padding: 11px 30px;
  }
}
</style>
