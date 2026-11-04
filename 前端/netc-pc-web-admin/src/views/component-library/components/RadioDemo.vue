<template>
  <div class="radio-demo">
    <div class="demo-row">
      <div class="demo-col">
        <h4>基础单选框</h4>
        <div class="radio-item">
          <KRadio v-model="selectedValue" :options="radioOptions">基础单选框</KRadio>
        </div>
        <p class="result-text">当前选中：{{ selectedValue }}</p>
      </div>

      <div class="demo-col">
        <h4>禁用单选框</h4>
        <div class="radio-item">
          <KRadio v-model="selectedValue" :options="radioOptions" disabled>禁用单选框</KRadio>
        </div>
      </div>
    </div>

    <div class="demo-row">
      <div class="demo-col">
        <h4>自定义选项</h4>
        <p class="desc-text">可以通过配置 options 数组来自定义选项，支持设置禁用状态</p>
        <div class="radio-item">
          <k-radio-group v-model="customSelected" :options="customOptions" />
        </div>
        <p class="result-text">当前选中：{{ customSelected }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { KRadio, KRadioGroup } from '@netc-design-pc/ui'
import { ref } from 'vue'

const selectedValue = ref('option2')

const radioOptions = ref([
  { value: 'option1', label: 'Option 1', disabled: false },
  { value: 'option2', label: 'Option 2', disabled: false },
  { value: 'option3', label: 'Option 3（禁用）', disabled: true },
])

const customSelected = ref('apple')

const customOptions = ref([
  { value: 'apple', label: '苹果', disabled: false },
  { value: 'banana', label: '香蕉', disabled: false },
  { value: 'orange', label: '橙子（缺货）', disabled: true },
])
</script>

<style scoped lang="scss">
.radio-demo {
  .demo-row {
    margin-bottom: 25px;

    &:last-child {
      margin-bottom: 0;
    }
  }

  .demo-col {
    margin-bottom: 20px;

    h4 {
      font-size: 14px;
      color: #606266;
      margin: 0 0 12px 0;
      font-weight: 500;
    }

    .desc-text {
      font-size: 13px;
      color: #909399;
      margin: 0 0 12px 0;
    }

    .radio-item {
      margin-bottom: 12px;
    }

    .result-text {
      font-size: 13px;
      color: #409eff;
      margin: 8px 0 0 0;
      padding: 8px 12px;
      background: #ecf5ff;
      border-radius: 4px;
      display: inline-block;
    }
  }
}
</style>
