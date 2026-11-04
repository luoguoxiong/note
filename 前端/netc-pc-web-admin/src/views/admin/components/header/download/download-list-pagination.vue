<template>
  <div class="pagination-style">
    <!-- <div class="pagination-style__select-total">已选：0条</div> -->
    <div class="pagination-style__total-num">总共：{{ pagination.totalCount || 0 }}条</div>
    <k-pagination
      :current-page="pagination.pageIndex"
      :page-size="pagination.pageSize"
      :page-sizes="pagination.pageSizes || [10, 15, 20, 30, 50]"
      :total="Number(pagination.totalCount)"
      :pager-count="Number(pagination.pagerCount) || 7"
      layout="prev, pager, next, jumper, sizes"
      @size-change="onSizeChange"
      @current-change="onPageCurrentChange"
    />
    <!-- <el-pagination
      class="pagination pagination-display"
      background
      :current-page="pagination.pageIndex"
      :page-size="pagination.pageSize"
      :page-sizes="pagination.pageSizes || [10, 15, 20, 30, 50]"
      :layout="'total, ->,prev, pager, next,jumper,slot,sizes'"
      :total="Number(pagination.totalCount)"
      :pager-count="Number(pagination.pagerCount) || 7"
      @size-change="onSizeChange"
      @current-change="onPageCurrentChange"
    /> -->
  </div>
</template>

<script setup lang="ts">
import { KPagination } from '@netc-design-pc/ui'
/**
 * 下载中心-任务列表分页栏
 * 从 download-list.vue 抽取(行为不变重构), 旧 ky-table 分页容器结构内联还原:
 *  - pagination 分页状态由宿主传入(reactive 对象, v-model 直改属性与原实现一致)
 *  - size-change / current-change 透传给宿主(旧 ky-table 分页交互)
 */
interface PaginationState {
  pageIndex: number
  pageSize: number
  totalCount: number
  pageSizes?: number[]
  pagerCount?: number
}

defineProps<{
  pagination: PaginationState
}>()

const emit = defineEmits<{
  (e: 'sizeChange', val: number): void
  (e: 'currentChange', val: number): void
}>()

function onSizeChange(val: number) {
  emit('sizeChange', val)
}

function onPageCurrentChange(val: number) {
  emit('currentChange', val)
}
</script>

<style lang="scss" scoped>
// 旧 ky-table 容器样式( scoped 部分 );
// 原 .element-table :deep() 中两条分页规则随分页迁入(分页仅在表格容器内渲染, 等效)
.pagination-style {
  margin-top: 16px;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;

  // .pagination {
  //   margin: 0;
  // }

  // &__select-total {
  //   position: absolute;
  //   top: 50%;
  //   transform: translateY(-50%);
  //   font-size: 12px;
  //   font-weight: 400;
  //   color: #333333;
  // }

  &__total-num {
    font-size: var(--k-font-size-13);
    line-height: var(--k-line-height-13);
    color: var(--k-color-grey-09);
  }
}
</style>
