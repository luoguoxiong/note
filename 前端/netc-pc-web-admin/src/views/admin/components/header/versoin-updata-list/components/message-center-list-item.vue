<template>
  <div class="message-center-list-item-wrapper">
    <div :class="['message-center-list-item', data.messageReadState === 0 && 'unread-item']">
      <el-checkbox v-show="showCheckBox" class="el-checkbox-message" :label="data.messageSerialNumber" />
      <div class="message-center-list-item__content" @click="handleItemClick">
        <div>
          <p class="item-p1">
            <span class="item-title f_w_b ellipsis">{{ data.versionNo }}</span>
          </p>
          <p class="item-p2">
            <span class="item-desc ellipsis">更新日期：{{ messagePushTimeComputed }}</span>
          </p>
        </div>
        <div>
          <img
            class="item-arrow"
            src="https://ic-img.ky-express.com/netc/20240105_2511160536_!!1704447031487_32_32.png"
            alt=""
            srcset=""
          />
        </div>
      </div>
    </div>
    <!-- 未读消息分界线  -->
    <div class="message-center-list-item separate-line" ref="separateRef" v-if="hasSeparateLine">
      <span class="c_8f8fa8">以上都为新消息</span>
    </div>
    <!-- 详情页面 -->
    <versoin-updata-details :data="data" ref="versoinUpdataDetailsRef" />
  </div>
</template>

<script setup lang="ts">
/**
 * 版本更新列表项
 * 来源: netc-pc-web/src/views/versoin-updata-list/components/message-center-list-item.vue
 *
 * Vue3 适配:
 * - $refs.separateRef -> defineExpose 暴露(供 useMessageIntersection 视图监听)
 * - @/utils/formatDate.dateZW -> 本地 dayjs 实现(YYYY[年]MM[月]DD[日])
 */
import { computed, ref } from 'vue'
import dayjs from 'dayjs'
import VersoinUpdataDetails from '../details.vue'
import type { VersionRow } from '../types'

defineOptions({ name: 'message-center-list-item' })

const props = withDefaults(
  defineProps<{
    data: VersionRow
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

const versoinUpdataDetailsRef = ref<InstanceType<typeof VersoinUpdataDetails> | null>(null)

// 未读消息分界线 dom ref(供 useMessageIntersection 视图监听)
const separateRef = ref<HTMLElement | null>(null)

/* 时间YYYY年MM月DD日(旧 formatDate.dateZW) */
const messagePushTimeComputed = computed(() => {
  if (!props.data?.startupTime) {
    return ''
  }
  return dayjs(Number(props.data?.startupTime)).format('YYYY[年]MM[月]DD[日]')
})

const handleItemClick = () => {
  // 打开版本更新详情
  versoinUpdataDetailsRef.value?.showDrawer()
}

defineExpose({ separateRef })
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
.c_8f8fa8 {
  color: #8f8fa8;
}

.message-center-list-item {
  display: flex;
  align-items: center;
  border-bottom: 1px solid #e5e8ed;
  padding: 15px 0;
  cursor: pointer;

  &:not(.separate-line):hover {
    background: #eff1f6;
  }

  .el-checkbox-message {
    margin-right: 12px;

    :deep(.el-checkbox__label) {
      display: none;
    }
  }

  &__content {
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 12px;
    flex: 1;
    width: calc(100% - 26px);

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
}

.separate-line {
  display: block;
  text-align: center;
  padding: 24px 0;
  cursor: unset;
}
</style>
