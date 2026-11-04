<template>
  <view class="date-radio-box">
    <scroll-view :scroll-y="true" class="date-radio-date">
      <view
        v-for="item in dateRadioList"
        :key="item.date"
        :class="['date-radio-date-item', { active: item.date === activeDate }]"
        @click.stop="changeDateRadio(item)"
      >
        {{ item.label }}
        <view class="date-radio-date-item-label">{{ WEEK_DAY_DIC?.[item.dayOfWeek] || '--' }}</view>
      </view>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
const emits = defineEmits(['update:activeDate', 'change'])

const WEEK_DAY_DIC = {
  1: '周一',
  2: '周二',
  3: '周三',
  4: '周四',
  5: '周五',
  6: '周六',
  7: '周日',
}

const props = withDefaults(
  defineProps<{
    activeDate: string
    dateRadioList: Array<{
      label: string
      date: string
      dayOfWeek: number
    }>
  }>(),
  {
    dateRadioList: () => [],
  },
)

const changeDateRadio = (item) => {
  if (item.date === props.activeDate) return
  emits('update:activeDate', item.date)
  emits('change', item.date)
}
</script>

<style lang="scss">
.date-radio-box {
  width: 267px;
  background-color: #f7f8fa;
  display: flex;
  flex-shrink: 0;
}
.date-radio-date {
  flex: 1;

  .date-radio-date-item:not(.ky-radio-item) {
    padding: 24px 32px;
    font-size: 28px;
    line-height: 40px;
    margin-bottom: 0;
    color: #24262b;
    display: flex;

    &.active {
      color: #8365f6;
      font-weight: 600;
      background: #ffffff;

      .date-radio-date-item-label {
        color: #8365f6;
      }
    }

    .date-radio-date-item-label {
      margin-left: 8px;
      color: #8c8f99;
      display: inline-block;
    }
  }
}
</style>
