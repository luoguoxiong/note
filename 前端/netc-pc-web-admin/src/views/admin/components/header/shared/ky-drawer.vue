<!-- 不要再使用这个组件，直接使用 k-drawer 组件 -->
<template>
  <KDrawer
    class="ky-drawer ky-drawer__container"
    :class="{ 'with-footer': visibleFooter }"
    v-model="dialogVisible"
    :title="title"
    :size="width || size"
    append-to-body
    :has-footer="visibleFooter"
    :cancel-text="cancelText"
    :confirm-text="confirmText"
    :confirm-loading="loading"
    :confirm-disabled="confirmDisabled"
    @confirm="handleConfirm"
  >
    <template #header="{ close }">
      <slot name="title">
        <div class="ky-drawer__header">
          <div class="header-left">
            <span class="ky-drawer__close" @click="clickClose(close)">
              <el-icon class="ky-drawer__close-icon">
                <ArrowLeft v-if="visibleGoBack" />
                <Close v-else />
              </el-icon>
            </span>
            <span class="ky-drawer__title">{{ title }}</span>
            <slot name="title-tips"></slot>
          </div>

          <div class="header-right" v-if="$slots['header-right']">
            <slot name="header-right"></slot>
          </div>
        </div>
      </slot>
    </template>

    <slot></slot>

    <template v-if="visibleFooter && $slots['footer-left']" #defaultFooterLeft>
      <slot name="footer-left"></slot>
    </template>
    <!-- 外部传入 footer 插槽时覆盖默认按钮; 否则走 KDrawer 默认「取消/确定」 -->
    <template v-if="visibleFooter && $slots.footer" #footer>
      <slot name="footer"></slot>
    </template>
  </KDrawer>
</template>

<script setup lang="ts">
/**
 * KyDrawer 抽屉(老项目 ky-drawer 复刻)
 * 来源: netc-pc-web/src/components/ky-drawer/index.vue
 *
 * 内部基于 @netc-design-pc/ui KDrawer 实现(修复直接迁移 el-drawer 的布局错乱):
 * - KDrawer 自带头部/底部容器样式(theme-chalk), footer 不再用 fixed 定位
 * - 对外 API 保持不变: v-model:visible / visibleGoBack / visibleFooter /
 *   loading(映射 confirmLoading) / width(映射 size) / 各插槽, 使用方无需改动
 * - 头部仍用 #header 自定义复刻旧布局(关闭/返回图标 + 标题 + title-tips + header-right)
 * - KDrawer 默认取消按钮点击即关闭抽屉(经 update:visible 通知父级), 不再单独 emit cancel
 * - iconfont icon-close/icon-arrow-left -> @element-plus/icons-vue(新项目 iconfont 无对应字形)
 */
import { ref, watch } from 'vue'
import { ArrowLeft, Close } from '@element-plus/icons-vue'
import { KDrawer } from '@netc-design-pc/ui'

defineOptions({ name: 'ky-drawer' })

const props = withDefaults(
  defineProps<{
    loading?: boolean
    title?: string
    visible?: boolean
    // 是否显示回退图标
    visibleGoBack?: boolean
    // 是否显示底部
    visibleFooter?: boolean
    cancelText?: string
    confirmText?: string
    confirmDisabled?: boolean
    // 抽屉和footer的宽度
    width?: number
    // 有footer时，一定要设置width，size是为了兼容之前只设置了size的情况
    size?: number | string
  }>(),
  {
    loading: false,
    title: '',
    visible: false,
    visibleGoBack: false,
    visibleFooter: false,
    cancelText: '取消',
    confirmText: '确定',
    confirmDisabled: false,
  }
)

const emit = defineEmits(['update:visible', 'goBack', 'cancel', 'confirm'])

// visible -> dialogVisible 单向同步, 关闭时向父级 emit update:visible
const dialogVisible = ref(false)

watch(
  () => props.visible,
  (val) => {
    dialogVisible.value = !!val
  },
  { immediate: true }
)

watch(dialogVisible, (val) => {
  if (!val) {
    emit('update:visible', false)
  }
})

const clickClose = (close?: () => void) => {
  // 优先使用 KDrawer header 作用域提供的 close(内部走 beforeClose 等关闭流程)
  if (close) {
    close()
  } else {
    dialogVisible.value = false
  }
  emit('goBack')
}
const handleConfirm = () => {
  emit('confirm')
}
</script>

<style lang="scss" scoped>
.ky-drawer__header {
  display: flex;
  width: 100%;
  .header-left {
    display: flex;
    align-items: center;
    .ky-drawer__close {
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      .ky-drawer__close-icon {
        font-size: 16px;
      }
    }
    .ky-drawer__title {
      margin-left: 16px;
      font-size: 14px;
      color: #03050d;
      font-weight: bold;
    }
  }
  .header-right {
    margin-left: auto;
  }
}
</style>
