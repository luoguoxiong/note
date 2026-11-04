<template>
  <view class="list-content">
    <!-- <ListStandard ref="listStandardRef" :fetch="listFetch">
      <template #default="{ data }">
        <view
          v-for="(item, index) in data"
          :key="item.id || index"
          class="item"
          @click.stop="scrollToTop"
        >
          <text class="item-title">{{ item.title }}</text>
          <text class="item-desc">{{ item.description }}</text>
        </view>
      </template>
    </ListStandard> -->
  </view>
</template>

<script lang="ts" setup>
// import "./index.scss";
// import { ListStandard } from "@ky-miniui-lib/ky-miniui-lib";
// import { ref } from "vue";

// const listStandardRef = ref();

// const total = 30;

// // Mock 数据生成函数
// // const buildMockData = (count = 30) => {
// //   return Array.from({ length: count }, (_, i) => ({
// //     id: i + 1,
// //     title: `标题 ${i + 1}`,
// //     description: `这是第 ${i + 1} 条数据的描述信息，用于测试虚拟列表。`,
// //   }));
// // };

// const buildMockData = (count = 30) => {

//   return Array.from({ length: count }, (_, i) => {
//     const descriptions = [
//       "这是一条简短描述。",
//       "这是一条中等长度的描述，包含一些额外的细节信息。",
//       `这是一条非常长的描述，包含大量详细信息。虚拟列表测试需要不同长度的文本内容来模拟真实场景，因此这条描述特意设计得比较长，以展示不同数据项的高度差异。第 ${i + 1} 条数据。`,
//       "短文本。",
//       `中等长度描述，包含一些测试数据。编号：${i + 1}`,
//       `超长文本测试：虚拟列表是一种高效渲染长列表的技术，它只渲染可见区域的内容，从而大大提高性能。这条描述用于测试虚拟列表处理不同高度项目的能力。当前是第 ${i + 1} 个项目。`
//     ];
//     const randomIndex = Math.floor(Math.random() * descriptions.length);
//     const randomDescription = descriptions[randomIndex].replace(/\${i \+ 1}/g, (i + 1));
//     return {
//       id: i + 1,
//       title: `标题 ${i + 1}`,
//       description: randomDescription,
//     };
//   });
// };

// // 模拟接口分页
// const fetchData = (pageNum: number) => {
//   return new Promise<any[]>((resolve, reject) => {
//     setTimeout(() => {
//       const data = buildMockData(10).map((item, i) => ({
//         ...item,
//         id: (pageNum - 1) * 10 + i + 1,
//         title: `标题 ${(pageNum - 1) * 10 + i + 1}`,
//         description: `这是第 ${(pageNum - 1) * 10 + i + 1} 条数据的描述信息`,
//       }));
//       if (pageNum <= 3) {
//         resolve(data);
//       } else {
//         reject("没有更多数据");
//       }
//     }, 500);
//   });
// };

// // ListStandard 的 fetch 方法
// const listFetch = async (page: number) => {
//   try {
//     const data = await fetchData(page);
//     return {
//       data,
//       total,
//     };
//   } catch (error) {
//     throw error;
//   }
// };

// // 滚动到顶部
// const scrollToTop = () => {
//   listStandardRef.value?.scrollToTop?.();
// };
</script>