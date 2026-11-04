<template>
  <div class="message-center-list-item-wrapper">
    <div :class="['message-center-list-item', data.messageReadState === 0 && 'unread-item']">
      <el-checkbox v-show="showCheckBox" class="el-checkbox-message" :label="data.messageSerialNumber" />
      <div class="message-center-list-item__content" @click="handleItemClick">
        <p class="item-p1">
          <span class="item-title f_w_b ellipsis">{{ data.messageTitle }}</span>
          <span class="item-date">{{ messagePushTimeComputed }}</span>
        </p>
        <div class="item-p2">
          <div ref="descRef" :class="['item-desc', !showDescClamp && 'show-all']">
            {{ data.messageContent }}
          </div>
          <div v-if="isTextOverflow" class="message-center-list-item__more" @click.stop>
            <k-button link @click="isOpen = !isOpen">
              <span class="message-center-list-item__more--text" style="margin-right: var(--k-spacing-4)">{{
                isOpen ? '收起' : '展开'
              }}</span>
              <k-icon :class="['message-center-list-item__more--icon', { 'is-reverse': isOpen }]"
                ><ArrowDownGrey
              /></k-icon>
            </k-button>
          </div>
        </div>
      </div>
    </div>
    <!-- 未读消息分界线  -->
    <div class="message-center-list-item separate-line" ref="separateRef" v-if="hasSeparateLine">
      <span class="c_8f8fa8">以上都为新消息</span>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * 消息中心列表项
 * 来源: netc-pc-web/src/views/message-center-entry/components/message-center-list-item.vue
 * Vue3 适配:
 * - $refs.separateRef -> defineExpose 暴露(供 useMessageIntersection 视图监听)
 * - @/utils/formatDate.date -> 本地 dayjs 实现(YYYY-MM-DD)
 * - $native.isClientMode() -> @/native/electron isClientMode()
 * - $message.warning -> ElMessage
 */
import { computed, inject, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import dayjs from 'dayjs'
import { ElMessage } from 'element-plus'
import { isClientMode } from '@/native/electron'
import messageConst from '../consts'
import useMessageCenter from '../hooks/useMessageCenter'
import { messageCenterApi, type MessageRow } from '../service/messageApiService'
import { KButton, KIcon } from '@netc-design-pc/ui'
import { ArrowDownGrey } from '@netc-design-pc/icons'
import ResizeObserver from 'resize-observer-polyfill'

defineOptions({ name: 'message-center-list-item' })

const props = withDefaults(
  defineProps<{
    data: MessageRow
    // 是否展示checkbox
    showCheckBox?: boolean
    // 是否存在未读分界线
    hasSeparateLine?: boolean
  }>(),
  {
    showCheckBox: false,
    hasSeparateLine: false,
  }
)

const emit = defineEmits(['update:checklist'])

// 未读消息分界线 dom ref(暴露给父组件做视图监听)
const separateRef = ref<HTMLElement | null>(null)
const descRef = ref<HTMLElement | null>(null) // 文案 dom(用于测量是否超行)
const isOpen = ref(false) // 更多按钮展开状态
const isTextOverflow = ref(false) // 文案是否超出
const isMeasuring = ref(false) // 测量中(强制按截断态渲染)

/* 是否按 2 行截断渲染: 收起态或测量中 */
const showDescClamp = computed(() => isMeasuring.value || !isOpen.value)

/**
 * 判断文案是否超过两行
 * 原理: 2 行截断(-webkit-line-clamp)裁掉的内容仍参与布局, 故
 * scrollHeight(全文高度) > clientHeight(2 行可视高度); 减 1px 容错亚像素误差
 * 展开态下两者相等(测不出溢出), 所以测量前先强制回截断态, 测完再释放
 * 注意: 祖先 display:none 时两者都为 0(父级骨架屏 v-show="!skeletonLoading" 期间
 * 列表项就是这么挂载的), 此时测量无效, 跳过即可, 等容器可见后由下面的
 * ResizeObserver 触发重测
 */
const measureTextOverflow = async () => {
  console.log('measureTextOverflow')
  isMeasuring.value = true
  await nextTick()
  const el = descRef.value
  if (el && el.clientHeight) {
    isTextOverflow.value = el.scrollHeight - el.clientHeight > 1
  }
  isMeasuring.value = false
}

/* 宽度变化会重新折行(容器由隐藏变可见/勾选框占位/抽屉尺寸变化), 需重测 */
let observer: ResizeObserver | undefined
let lastDescWidth = 0

onMounted(() => {
  const el = descRef.value
  // lastDescWidth = el ? el.clientWidth : 0
  // measureTextOverflow()
  observer = new ResizeObserver((entries) => {
    const width = entries[0]?.contentRect.width ?? 0
    // 宽度为 0 说明仍不可见; 宽度未变说明只是高度变了(自身展开/收起引起), 均无需重测
    if (!width || width === lastDescWidth) return
    lastDescWidth = width
    measureTextOverflow()
  })
  if (el) {
    // polyfill 的 d.ts 里 observe 参数类型 Element 与 .vue 中解析到的 HTMLElement 不是同一处声明, 需断言
    observer.observe(el as Element)
  }
})

onBeforeUnmount(() => {
  observer?.disconnect()
  observer = undefined
})

/* 列表以 index 作 key, 复用实例时 data 会变: 重新测量并回到收起态 */
watch(
  () => props.data?.messageContent,
  () => {
    isOpen.value = false
    // 清空宽度记录: 若此刻容器仍隐藏(本次测不出), 可见后 ResizeObserver 能再触发一次
    lastDescWidth = 0
    measureTextOverflow()
  }
)

const switchVisibleCallback = inject<(val: boolean) => void>('switchVisibleCallback')

const { handleMessageNavigation, orderJump } = useMessageCenter({ switchVisibleCallback })

/* 时间YYYY-MM-DD(旧 formatDate.date) */
const messagePushTimeComputed = computed(() => {
  if (!props.data?.messagePushTime) {
    return ''
  }
  return dayjs(Number(props.data?.messagePushTime)).format('YYYY-MM-DD')
})

// 上报数据
const reportUserMsg = async () => {
  console.log('props.data', props.data)
  const { messagePushTime, messageSerialNumber, messageType, customParams } = props.data
  let parsedCustomParams: Record<string, unknown> = {}
  try {
    parsedCustomParams = JSON.parse(customParams || '{}')
  } catch (e) {
    /* ignore */ console.error(e)
  }

  if (!messageSerialNumber) {
    return
  }
  const params = {
    messagePushTime,
    messageSerialNumber,
    messageType,
    operatePort: 'PC',
    operatorSystem: isClientMode() ? 'pcClient' : 'pc',
    msgTaskCode: parsedCustomParams && parsedCustomParams['MSG_TASK_CODE'],
  }
  await messageCenterApi.userMessage_reportUserMsg(params)
}

const handleItemClick = () => {
  console.log('handleItemClick********************************')
  // 上报数据
  reportUserMsg()
  // 变更点击逻辑，管理状态下，只要选中不跳转
  if (props.showCheckBox) {
    emit('update:checklist', props.data.messageSerialNumber)
    return
  }
  // 自定义跳转逻辑
  if (orderJump(props.data)) return

  const { jumpRestrict } = props.data
  // <跳转限制，1：仅移动端跳转，2：仅PC端跳转，其他：无限制>
  switch (jumpRestrict) {
    case 1:
      ElMessage.warning(messageConst.h5CrossMessageTip)
      break
    case 2:
      handleMessageNavigation(props.data)
      break
    default:
      handleMessageNavigation(props.data)
  }
}

defineExpose({ separateRef })
</script>

<style lang="scss" scoped>
/* 老项目全局工具类, 新项目无全局定义, 此处补齐 */
.message-center-list-item__content {
  font-size: 12px;
  flex: 1;
  width: calc(100% - 26px);
  min-height: 63px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}
.f_w_b {
  font-weight: bold;
}
.ellipsis {
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}
.c_8f8fa8 {
  color: #8f8fa8;
}

.message-center-list-item {
  display: flex;
  align-items: center;
  border-bottom: 1px solid #e6e8ed;
  padding: 8px 0;
  cursor: pointer;

  &:not(.separate-line):hover {
    background: rgba(36, 38, 43, 0.03);
  }

  .el-checkbox-message {
    margin-right: 12px;

    :deep(.el-checkbox__label) {
      display: none;
    }
  }

  &__content {
    font-size: 12px;
    min-height: 63px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    font-size: 12px;
    flex: 1;
    width: calc(100% - 26px);

    .item-p1 {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 6px;
    }

    .item-title {
      font-weight: 600;
      line-height: 20px;
      letter-spacing: normal;
      color: #24262b;
      font-size: 13px;
    }

    .item-desc {
      line-height: var(--k-line-height-12);
      font-size: var(--k-font-size-12);
      color: var(--k-color-grey-08);
      -webkit-line-clamp: 2;
      display: -webkit-box;
      white-space: initial;
      -webkit-box-orient: vertical;
      overflow: hidden;
      &.show-all {
        overflow: unset;
        line-clamp: unset;
        -webkit-line-clamp: unset;
      }
    }

    .item-date {
      font-size: var(--k-font-size-12);
      line-height: var(--k-line-height-12);
      color: var(--k-color-grey-06);
    }
  }

  &__more {
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;

    &--text {
      margin-right: var(--k-space-4);
    }

    &--icon {
      transition: transform 0.3s;

      &.is-reverse {
        transform: rotateZ(180deg);
      }
    }
  }
}

.separate-line {
  display: block;
  text-align: center;
  padding: 24px 0;
  cursor: unset;
  font-size: var(--k-font-size-12);
}
</style>
