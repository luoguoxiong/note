<template>
  <view class="other-sub-tabs">
    <view class="other-sub-tabs__tabs" v-if="showTabs.length > 1">
      <view
        v-for="tab in showTabs"
        :key="tab.value"
        :class="[
          'other-sub-tabs__tab',
          {
            'other-sub-tabs__tab--active': tab.value === selected,
          },
        ]"
        @click="handleTabClick(tab)"
      >
        <text>{{ Number(tab.count) > 99 ? '99+' : tab.count }}</text>
        <text>{{ tab.label }}</text>
      </view>
    </view>
    <view v-if="showTabs.length === 1" class="other-sub-tabs__single-tab">
      {{ showTabs[0]?.label }}
    </view>
    <view class="other-sub-tabs__content">
      <PaymentAuth v-if="selected === '10'" />
      <PermissionAuth v-if="selected === '20'" />
      <WaybillAuth v-if="selected === '30'" />
      <AdjustAuthNew v-if="selected === '40'" />
    </view>
  </view>
</template>

<script lang="ts" setup>
import { computed, UnwrapRef } from 'vue'
import PaymentAuth from './payment-auth.vue'
import PermissionAuth from './permission-auth.vue'
import WaybillAuth from './waybill-auth.vue'
import AdjustAuthNew from './adjust-auth-new.vue'
import { useHomeStore } from '../../../store'
import { debounce } from 'lodash-es'
import './index.scss'
import { reportTodoSmallTabClick } from '../../../report'
import { getTodoAllSubTabs } from '../../../utils/todoHelp'

defineOptions({ name: 'todo-approval' })

const store = useHomeStore()

const adjustPriceInfo = computed(() => {
  return store.data.todoList.adjustPriceApproval?.itemDetail
})

const selected = computed(() => {
  return store.data.selectedSubTab
})

const showTabs = computed(() => {
  return getTodoAllSubTabs(store.data.todoList)
})

const handleTabClick = (tab: UnwrapRef<typeof showTabs>[number]) => {
  reportTodoSmallTabClick(tab.label)
  store.updateData({
    selectedSubTab: tab.value,
  })
  debounceUpdatePendingItem(tab.value)
}
const debounceUpdatePendingItem = debounce(
  (itemCode: string) => {
    store.getHomepagePendingItem(itemCode)
  },
  8000,
  { trailing: false, leading: true },
)
</script>
