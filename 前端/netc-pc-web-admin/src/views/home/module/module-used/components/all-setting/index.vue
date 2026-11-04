<template>
  <div class="all-setting">
    <div
      v-for="item in allData"
      :key="item.funcInfo.menuCode"
      :class="['item', item.isActive ? 'active' : '']"
      @click="addOrDelDrag(item)"
    >
      <img :src="item.isActive ? `./svg/_check.svg` : `./svg/uncheck.svg`" alt="" srcset="" />
      <span>{{ item.funcInfo.menuName }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { SettingDataVO } from '@/apis/home/types'
interface ModalState {
  // 常用功能信息
  funcInfo: SettingDataVO
  // 是否高亮
  isActive: boolean
}
interface AllSettingProps {
  allData: ModalState[]
}
defineProps<AllSettingProps>()

const emit = defineEmits(['addOrDelDrag'])

const addOrDelDrag = (item: ModalState) => {
  emit('addOrDelDrag', item)
  window.$umpOtherReport(
    'CLK',
    {
      eventCode: 'clk_homepage_quick_access_select_v1',
    },
    {
      region_code: 'quick_access',
    }
  )
}
</script>

<style scoped lang="scss">
.all-setting {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  grid-gap: 16px;
  .item {
    // 不设固定宽度：纵向滚动条出现会挤压内容区，固定 124px 会把 1fr 列撑溢出产生横向滚动条
    height: 32px;
    display: flex;
    justify-content: center;
    align-items: center;
    border: 1px solid #e6e8ed;
    border-radius: 4px;
    box-sizing: border-box;
    cursor: pointer;
    img {
      margin-right: 4px;
    }
    &.active {
      border: 1px solid #7143f0;
      color: #7143f0;
      background: #f0ecfd;
    }
  }
}
</style>
