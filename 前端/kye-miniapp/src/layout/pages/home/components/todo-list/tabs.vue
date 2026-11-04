<template>
  <view class="todo-tabs">
    <view class="todo-tabs__tabs">
      <view
        v-for="(tab, index) in tabs"
        :key="tab.value"
        :class="[
          'todo-tabs__tab',
          {
            ['todo-tabs__tab--prev']: tabs[index - 1] && tabs[index - 1].value === value,
            ['todo-tabs__tab--next']: tabs[index + 1] && tabs[index + 1].value === value,
            ['todo-tabs__tab--active']: tab.value === value,
          },
        ]"
        @click="handleTabClick(tab.value, tab.label)"
      >
        <TabItem :name="tab.label" :index="tab.value">
          {{ tab.label }}
          <text v-if="tab.showBadge && +(tab.total || 0) > 0" class="todo-tabs__count">
            {{ Number(tab.total) > 99 ? '99+' : tab.total }}
          </text>
        </TabItem>
      </view>
    </view>

    <view class="todo-tabs__content">
      <slot />
    </view>
    <slot name="footer" />
  </view>
</template>

<script lang="ts" setup>
import { PropType } from 'vue'
import './tabs.scss'
import TabItem from './tab-item.vue'
defineOptions({ name: 'todo-tabs' })

const emits = defineEmits(['update:value'])

const props = defineProps({
  tabs: {
    type: Array as PropType<Array<{ value: string; label: string; total?: Number; showBadge?: boolean }>>,
    default: () => [],
  },
  value: { type: String },
})

const handleTabClick = (tabValue: string, tabName: string) => {
  if (props.value !== tabValue) {
    emits('update:value', tabValue, tabName)
  }
}
</script>
