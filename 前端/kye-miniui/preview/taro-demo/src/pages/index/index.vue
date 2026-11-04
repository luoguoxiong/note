<template>
  <view class="page-container">
    <view class="page-title">组件列表页</view>
    <view class="page-desc">ky-miniui-lib 组件列表</view>
    <view class="component-lists">
      <picker
        class="component-lists-picker"
        mode="selector"
        :range="componentRange"
        @change="onComponentPicker"
      >
        <view>选择组件：{{ currentDemo?.name }}</view>
      </picker>
    </view>
    <view class="component-preview-container">
      <text class="label">组件内容：</text>
      <component :is="currentDemo"></component>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
// import { demoComponents, demos } from '@/utils/demoImport'
import { components as demoComponents } from "@ky-miniui-lib/ky-miniui-lib";

import { usePreviewComponent } from "./hook/usePreviewComponent";
const { setListSelectComponent, getListSelectComponent } = usePreviewComponent();
defineOptions({
  name: "nc-view测试组件",
});

/* 当前预览组件 */
const currentDemo = ref<any>(demoComponents[0]);
console.log("currentDemo", currentDemo.value);

/* 预览组件列表 */
const componentRange = computed(() => {
  return demoComponents.map((demo) => demo.name);
});

onMounted(() => {
  const storageComponent = getListSelectComponent();
  if (storageComponent?.name) {
    currentDemo.value = demoComponents.find((f) => f.name === storageComponent.name);
  }
});

/* 选中指定组件 */
const onComponentPicker = async ($event) => {
  currentDemo.value = demoComponents[$event.detail.value];
  setListSelectComponent(currentDemo.value);
};
</script>
<style lang="scss">
.page-container {
  padding: 60px 30px;
}

.page-title {
  font-size: 36px;
  font-weight: bold;
}

.page-desc {
  color: #c9c9c9;
}

.component-lists {
  margin-top: 60px;
  &-picker {
    view {
      border: 1px solid red;
    }
  }
}

.component-preview-container {
  margin: 10px 0;
  padding: 0 10px;
  box-sizing: border-box;
  height: 800rpx;
  overflow: auto;
  .label {
    font-size: 36px;
    font-weight: bold;
  }
}
</style>
