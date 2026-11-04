<template>
  <div class="input-demo">
    <div class="demo-row">
      <div class="demo-col">
        <h4>基础输入框</h4>
        <div class="input-item">
          <KInput placeholder="请输入内容"></KInput>
        </div>
        <div class="input-item">
          <KInput placeholder="数字类型" type="number" v-model="numberValue"></KInput>
        </div>
      </div>

      <div class="demo-col">
        <h4>可清空输入框</h4>
        <div class="input-item">
          <KInput v-model="clearableValue" clearable placeholder="可清空输入框"></KInput>
        </div>
      </div>
    </div>

    <div class="demo-row">
      <div class="demo-col">
        <h4>状态展示</h4>
        <div class="input-item">
          <KInput v-model="errorValue" isError placeholder="错误状态"></KInput>
        </div>
        <div class="input-item">
          <KInput disabled placeholder="禁用状态"></KInput>
        </div>
        <div class="input-item">
          <KInput
            v-model="disabledValue"
            clearable
            disabled
            :disabledTips="disabledValue"
            placement="top-end"
            effect="light"
          ></KInput>
        </div>
      </div>

      <div class="demo-col">
        <h4>前后缀插槽</h4>
        <div class="input-item">
          <KInput v-model="prefixSuffixValue" clearable style="width: 250px">
            <template #prefix>http://</template>
            <template #suffix>.com</template>
          </KInput>
        </div>
      </div>
    </div>

    <div class="demo-row">
      <div class="demo-col">
        <h4>格式化输入</h4>
        <div class="input-item">
          <KInput v-model="formatValue" :formatter="formatter" placeholder="自动格式化（中文句号转小数点）"></KInput>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { KInput } from '@netc-design-pc/ui'
import { ref } from 'vue'

const numberValue = ref(666)
const clearableValue = ref('清空按钮')
const errorValue = ref('错误提示')
const disabledValue = ref('禁用且有值')
const prefixSuffixValue = ref('example')
const formatValue = ref('。。。')

const formatter = (value: string) => {
  let inputValue = value.trim()
  inputValue = inputValue?.toString().replace(/\u3002+/g, '.') // 将中文句号转换成小数点
  if (inputValue && !/^\d*\.?\d*$/.test(inputValue)) {
    return value
  }
  return inputValue
}
</script>

<style scoped lang="scss">
.input-demo {
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

    .input-item {
      margin-bottom: 12px;

      &:last-child {
        margin-bottom: 0;
      }
    }
  }
}
</style>
