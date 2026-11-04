<template>
  <div class="printer-popup">
    <div class="box-content">
      <div class="title">运单数量:</div>
      <div class="content">{{ props.waybillNumberList.length }}票</div>
    </div>
    <!-- <div class="box-content">
      <div class="title">运单号</div>
      <div class="content">
        {{ props.waybillNumberList.join('；') }}
      </div>
    </div> -->
    <div class="box-content" v-if="formData.templateList.length">
      <div class="title">面单类型:</div>
      <div class="content">
        <div class="contentitem" v-for="(item, index) in formData.templateList" :key="index">
          {{ item.typeName }}
          <div class="contentdes">{{ item.typeNameDes }}</div>
        </div>
      </div>
    </div>
    <div class="box-content" v-if="formData.tagList.length">
      <div class="title">打印标签:</div>
      <div class="content">
        <div class="contentitem" v-for="(item, index) in formData.tagList" :key="index">
          {{ item.typeName }}
          <div class="contentdes">{{ item.typeNameDes }}</div>
        </div>
      </div>
    </div>
    <div class="box-content" v-if="formData.isMother">
      <div class="title">同时打印子母单</div>
    </div>
    <div class="box-content" v-if="formData.count && !isMotherVisible">
      <div class="title">打印件数:</div>
      <div class="content">
        <div class="contentitem">{{ formData.count }}件</div>
      </div>
    </div>
    <div class="box-content" v-if="formData.mdList.length">
      <div class="title">面单范围:</div>
      <div class="content">
        <div class="contentitem" v-if="formData.pageSize && pageSizeVisible">面单页码({{ formData.pageSize }})</div>
        <div class="contentitem" v-else>全部面单</div>
      </div>
    </div>
    <div class="box-content" v-if="formData.markFont">
      <div class="title">备注字号:</div>
      <div class="content">
        <div class="contentitem">{{ formData.markFont }}号字体</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { printerFormType } from '../hooks/type'

interface PropsType {
  formData: printerFormType
  waybillNumberList: string[]
  isMotherVisible: boolean
  pageSizeVisible: boolean
}
const props = withDefaults(defineProps<PropsType>(), {
  formData: () => {
    return {} as printerFormType
  },
  waybillNumberList: () => {
    return []
  },
  isMotherVisible: false,
  pageSizeVisible: false,
})
</script>
<style lang="scss">
@import '@order-global-package-order-sub/styles/index.scss';

.printer-popup {
  margin-top: -32px;
  .box-content {
    padding: 32px 0;
    border-bottom: 1px solid #e6e8ed;
    display: flex;

    &:last-child {
      border-bottom: none;
    }
    .title {
      font-size: 26px;
      min-width: 124px;
      color: #8c8f99;
    }
    .content {
      font-size: 26px;
      font-weight: 400;
      flex: 1;
      color: #24262b;
      font-size: 28px;
      .contentitem {
        display: inline-block;
        color: #24262b;
        font-size: 28px;
        &:last-child {
          &::after {
            content: '';
          }
        }
        &::after {
          display: inline-block;
          font-size: 26px;
          content: '；';
        }
        .contentdes {
          display: inline-block;
          color: #8c8f99;
        }
      }
    }
  }
}
</style>
