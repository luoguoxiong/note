<template>
  <view class="page">
    <scroll-view
      class="virtual-list"
      :scrollY="true"
      :style="{ height: containerHeight + 'px' }"
      @scroll="onScroll"
    >
      <view
        v-for="(item, index) in items"
        :key="item.id"
        class="card-wrapper"
        :style="{ height: item.height + 'px' }"
      >
        <!-- 可视区内渲染真实内容 -->
        <template v-if="index >= startIndex && index < endIndex">
          <view class="card">
            <view class="card-content">{{ item.title }}</view>
          </view>
        </template>

        <!-- 不在可视区，仅占位 -->
        <template v-else>
          <view class="placeholder"></view>
        </template>
      </view>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";

// 列表数据
const items = ref(
  Array.from({ length: 1000 }).map((_, i) => ({
    id: i,
    title: `第 ${i} 个卡片`,
    height: 50 + Math.random() * 100, // 不定高
  }))
);

const containerHeight = 600; // 容器高度
const scrollTop = ref(0);

const startIndex = ref(0);
const endIndex = ref(0);

// 记录累积高度，用于计算 startIndex / endIndex
const cumulativeHeights = ref<number[]>([]);

onMounted(() => {
  let sum = 0;
  cumulativeHeights.value = items.value.map((item) => {
    sum += item.height;
    return sum;
  });
  updateVisibleIndex();
});

// 根据 scrollTop 计算 startIndex 和 endIndex
const updateVisibleIndex = () => {
  const scroll = scrollTop.value;
  const buffer = 2; // 缓冲个数

  // 找到 startIndex
  let start = cumulativeHeights.value.findIndex((h) => h > scroll);
  if (start === -1) start = 0;
  startIndex.value = Math.max(0, start - buffer);

  // 找到 endIndex
  let end = cumulativeHeights.value.findIndex((h) => h > scroll + containerHeight);
  if (end === -1) end = items.value.length;
  endIndex.value = Math.min(items.value.length, end + buffer);
};

let timer: any;
const onScroll = (e: any) => {
  if (timer) clearTimeout(timer);
  timer = setTimeout(() => {
    scrollTop.value = e.detail.scrollTop;
    updateVisibleIndex();
  }, 50);
};
</script>

<style lang="scss">
.page {
  padding: 20px;
}
.virtual-list {
  border: 1px solid #ddd;
  background: #fff;
}
.card-wrapper {
  width: 100%;
}
.card {
  border: 1px solid #eee;
  background: #fafafa;
  padding: 8px;
}
.card-content {
  font-weight: bold;
}
.place-div {
  margin-top: 6px;
  padding: 4px;
  background: #dff6ff;
  border: 1px solid #a0e1ff;
}
.placeholder {
  background: #fafafa;
  width: 100%;
  height: 100%;
  border-bottom: 2px solid green;
  box-sizing: border-box;
}
</style>