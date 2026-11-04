<!--
  Tips 组件
  显示跨越速运的优势说明
-->
<template>
  <view class="tips">
    <view v-for="(item, index) in tipList" :key="index">
      <view class="tips__item">
        <view class="tips__item--title">{{ item.title }}</view>
        <view class="tips__item--desc">{{ item.desc }}</view>
      </view>
      <view v-if="index < tipList.length - 1" class="tips__divider">
        <view class="tips__divider--line"></view>
        <view class="tips__divider--line"></view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
defineOptions({ name: 'Tips' })

const tipList = [
  {
    title: '找跨越速运，时效之选',
    desc: '12架自有货运包机，全国机场全天候不间断航班，跨省最快8小时，一诺定达。',
  },
  {
    title: '找跨越速运，服务之选',
    desc: '管家式一对一服务，打通重组优势服务模块，信息全链条驱动打造柔性供应链。',
  },
  {
    title: '找跨越速运，安全之选',
    desc: '千万家企业都在用的专业物流承运商，直营管控，24小时响应客户需求。',
  },
  {
    title: '找跨越速运，科技之选',
    desc: '基于AI大数据等科技应用，突破了行业"动态路由"难题，驱动中台系统实时优化调整，企业效能倍增。',
  },
]
</script>

<style lang="scss">
@import './index.scss';
</style>
