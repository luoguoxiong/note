<template>
  <ky-drawer
    title="更新记录"
    :class="['message-center__drawer', isOldClient && 'message-center__drawer-hack']"
    v-model:visible="visible"
    :modal="false"
    :visibleGoBack="true"
    :size="540"
    :width="540"
    @confirm="handleConfirm"
  >
    <div v-if="visible" class="details-box">
      <div class="details-item__content">
        <div>
          <p class="item-p1">
            <span class="item-title f_w_b ellipsis">{{ data.versionNo }}</span>
          </p>
          <p class="item-p2">
            <span class="item-desc ellipsis">更新日期：{{ messagePushTimeComputed }}</span>
          </p>
        </div>
      </div>
      <div class="details-item_list ql-editor" v-html="htmlContent"></div>
    </div>
  </ky-drawer>
</template>

<script setup lang="ts">
/**
 * 版本更新详情抽屉
 * 来源: netc-pc-web/src/views/versoin-updata-list/details.vue
 *
 * Vue3 / element-plus 适配:
 * - @vue/composition-api -> vue script setup
 * - ky-drawer `:visible.sync` -> v-model:visible(本目录复刻组件)
 * - 全局 mixin isOldClientMode -> @/native/electron isOldClientMode()
 * - @/utils/formatDate.dateZW -> 本地 dayjs 实现(YYYY[年]MM[月]DD[日])
 * - 老模板 @click="handleItemClick" 引用未定义方法(运行时无操作), 已移除该绑定
 */
import { computed, provide, ref, watch } from 'vue'
import dayjs from 'dayjs'
import KyDrawer from '../shared/ky-drawer.vue'
import { isOldClientMode } from '@/native/electron'
import type { VersionRow } from './types'

defineOptions({ name: 'versoin-updata-details' })

const props = defineProps<{
  data: VersionRow
}>()

const visible = ref(false) // 抽屉是否展示

/* hack oldClient */
const isOldClient = isOldClientMode()

/* 时间YYYY年MM月DD日(旧 formatDate.dateZW) */
const messagePushTimeComputed = computed(() => {
  if (!props.data?.startupTime) {
    return ''
  }
  return dayjs(Number(props.data?.startupTime)).format('YYYY[年]MM[月]DD[日]')
})
// 富文本
const htmlContent = computed(() => {
  if (props.data?.htmlHead && props.data?.content && props.data?.htmlFooter) {
    return props.data?.htmlHead + `<div>${props.data?.content}<p><br></p></div>` + props.data?.htmlFooter
  }
  return ''
})
/**
 * 打开抽屉
 */
const showDrawer = () => {
  switchVisibleCallback(true)
}
const handleConfirm = function () {
  switchVisibleCallback(false)
}
/**
 * 切换是否展示弹窗
 * @param val Boolean
 */
const switchVisibleCallback = (val: boolean) => {
  visible.value = val
}

// 消息抽屉开关函数
provide('switchVisibleCallback', switchVisibleCallback)

watch(
  () => visible.value,
  (val) => {
    if (val) {
      pageInit()
    }
  }
)

/**
 * 初始化页面
 */
async function pageInit() {
  await Promise.resolve()
}

defineExpose({ showDrawer })
</script>

<style lang="scss" scoped>
/* 老项目全局工具类, 新项目无全局定义, 此处补齐 */
.f_w_b {
  font-weight: bold;
}
.ellipsis {
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.message-center__drawer {
  :deep(.ky-drawer__title) {
    font-size: 15px;
  }
  :deep() {
    .el-drawer__body {
      padding: 0 0 16px;
    }
  }

  /* hack oldClient */
  &.message-center__drawer-hack {
    :deep() {
      .el-drawer__body {
        overflow: hidden;
      }

      .message-center__list {
        height: calc(100vh - 176px) !important;
      }
    }
  }
  .details-box {
    padding: 0 24px;
  }
  .details-item__content {
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 12px;
    flex: 1;
    width: calc(100% - 0px);
    padding: 12px 0;
    border-bottom: 1px solid #e5e8ed;

    .item-p1 {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 6px;
    }

    .item-p2 {
      display: flex;
      width: calc(100% - 56px);
    }

    .item-title {
      width: 300px;
      font-size: 13px;
    }

    .item-desc {
      font-size: 12px;
      width: 300px;
      color: #999999;
    }
    .item-arrow {
      width: 16px;
      height: 16px;
      float: right;
    }

    .item-date {
      padding-left: 10px;
      color: #c8c8c8;
      white-space: nowrap;
    }
  }
  .details-item_list {
    margin-top: 24px;
  }
}
</style>
