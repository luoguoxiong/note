<template>
  <div class="checkbox-manage">
    <div class="checkbox-manage__selection checkbox-manage-view" v-if="status === 'view'">
      <el-button type="primary" link size="small" @click="emit('switch-status', 'edit')">
        <el-icon class="fs_13"><Setting /></el-icon>
        <span>管理</span>
      </el-button>
    </div>
    <div class="checkbox-manage__selection checkbox-manage-edit" v-else-if="status === 'edit'">
      <el-checkbox :model-value="checkboxAll" :indeterminate="indeterminate" @change="emit('all-change', $event)">
        全选
      </el-checkbox>
      <div class="checkbox-manage-btn-list">
        <el-button type="default" size="small" @click="emit('cancel')">取消</el-button>
        <el-button
          class="btn-delete"
          type="default"
          size="small"
          :class="[delDisabled && 'is-disabled']"
          @click="emit('delete')"
        >
          <span>确认删除</span>
          <span class="num">({{ checkListNum }})</span>
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * 消息中心列表-管理操作条(管理/全选/取消/删除)
 * 纯展示组件, 从 message-center-list.vue 模板块抽取, 渲染结果保持不变
 */
import { Setting } from '@element-plus/icons-vue'

defineOptions({ name: 'message-center-manage-bar' })

defineProps<{
  // checkbox管理状态 <view,edit>
  status: string
  // 是否全选
  checkboxAll: boolean
  // checkbox 部分选中
  indeterminate: boolean
  // 删除按钮是否置灰
  delDisabled: boolean
  // 选中数量
  checkListNum: number
}>()

const emit = defineEmits<{
  (e: 'switch-status', val: string): void
  (e: 'all-change', val: any): void
  (e: 'cancel'): void
  (e: 'delete'): void
}>()
</script>

<style lang="scss" scoped>
/* 老项目全局工具类, 新项目无全局定义, 此处补齐 */
.fs_13 {
  font-size: 13px;
}
.mr_4 {
  margin-right: 4px;
}

/* 管理 */
.checkbox-manage {
  background: #f5f7fb;
  padding: 0 24px;
  margin-bottom: 4px;
  box-sizing: border-box;

  &__selection {
    height: 36px;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  &-view {
    justify-content: flex-end;
  }

  &-edit {
    display: flex;
  }

  &-btn-list {
    .el-button {
      padding: 5px 15px;
    }

    .btn-delete {
      &:not(.is-disabled) {
        border-color: #dad1fc;
        background-color: #f3f0fe;
        color: #8365f6;
      }
    }
  }
}
</style>
