<template>
  <view class="page-container">
    <view class="page-title">组件预览页</view>
    <view class="page-desc">demo列表来自doc/demos目录vue单文件</view>
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
      <scroll-view
        :scroll-y="true"
        style="height: calc(100vh - 200px)"
        :using-sticky="true"
      >
        <component :is="currentDemo?.component"></component>
      </scroll-view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
// import ViewCompTestDemo from '@packages/view-comp-test/src/view-comp-test.demo.vue'
import { demoComponents } from "@/utils/demoImport";

import { usePreviewComponent } from "./hook/usePreviewComponent";
const { setPreviewComponent, getCurrentPreviewComponent } = usePreviewComponent();
defineOptions({
  name: "nc-view测试组件",
});

/* 当前预览组件 */
const currentDemo = ref<any>(demoComponents[0]);
console.log("currentDemo", currentDemo.value);

/* 预览组件列表 */
const componentRange = computed(() => {
  console.log("dididi", demoComponents);
  return demoComponents.map((demo) => demo.name);
});

onMounted(() => {
  const storageComponent = getCurrentPreviewComponent();
  if (storageComponent?.component) {
    currentDemo.value = demoComponents.find((f) => f?.name === storageComponent?.name);
  }
})

/* 选中指定组件 */
const onComponentPicker = async ($event) => {
  currentDemo.value = demoComponents[$event.detail.value];
  console.log("onComponentPicker", currentDemo.value);
  setPreviewComponent(currentDemo.value);
}
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
  .label {
    font-size: 36px;
    font-weight: bold;
  }
}
</style>
