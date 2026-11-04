<template>
  <div class="select-demo">
    <div class="demo-row">
      <div class="demo-col">
        <h4>基础选择器</h4>
        <div class="select-item">
          <KSelect
            valueFiled="value"
            v-model="select1"
            placeholder="请选择"
            :options="selectOptions"
            style="width: 240px"
          ></KSelect>
        </div>
      </div>

      <div class="demo-col">
        <h4>可清空选择器</h4>
        <div class="select-item">
          <KSelect
            valueFiled="value"
            clearable
            v-model="select1"
            placeholder="请选择"
            :options="selectOptions"
            style="width: 240px"
          ></KSelect>
        </div>
      </div>
    </div>

    <div class="demo-row">
      <div class="demo-col">
        <h4>禁用状态</h4>
        <div class="select-item">
          <KSelect
            valueFiled="value"
            :options="selectOptions"
            placeholder="禁用了"
            disabledTips="这是禁用原因"
            :disabled="true"
            style="width: 240px"
          ></KSelect>
        </div>
      </div>

      <div class="demo-col">
        <h4>错误状态</h4>
        <div class="select-item">
          <KSelect
            valueFiled="value"
            :options="selectOptions"
            v-model="select2"
            placeholder="错误样式"
            :isError="true"
            style="width: 240px"
          />
        </div>
      </div>
    </div>

    <div class="demo-row">
      <div class="demo-col">
        <h4>多选状态</h4>
        <div class="select-item">
          <KSelect
            valueFiled="value"
            collapse-tags
            multiple
            :options="selectOptions"
            v-model="select3"
            placeholder="多选状态"
            style="width: 300px"
          />
        </div>
      </div>

      <div class="demo-col">
        <h4>无边框样式</h4>
        <div class="select-item">
          <KSelect
            valueFiled="value"
            clearable
            :border="false"
            v-model="select5"
            :options="selectOptions"
            placeholder="请选择"
            style="width: 240px"
          ></KSelect>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { KSelect } from '@netc-design-pc/ui'
import { ref } from 'vue'

const selectOptions = [
  { value: '选项1', label: '黄金糕' },
  { value: '选项2', label: '双皮奶' },
  { value: '选项3', label: '蚵仔煎' },
  { value: '选项4', label: '龙须面' },
  { value: '选项5', label: '北京烤鸭' },
]

const select1 = ref('选项1')
const select2 = ref('')
const select3 = ref<string[]>([])
const select5 = ref('')
</script>

<style scoped lang="scss">
.select-demo {
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

    .select-item {
      margin-bottom: 12px;

      &:last-child {
        margin-bottom: 0;
      }
    }
  }
}
</style>
