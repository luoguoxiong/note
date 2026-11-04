<template>
  <TodoTabs :tabs="showTabs" :value="selectedTab" @update:value="handleUpdateTab" v-if="!(isH5FSEnv || isH5Env)">
    <ThirdOrderContent v-if="selectedTab === 'wp_order'" />
    <PaymentContent v-if="selectedTab === 'payment'" />
    <WaybillContent @show-barcode="$emit('show-barcode', $event)" v-if="selectedTab === 'latest_waybill'" />
    <TodoContent v-if="selectedTab === 'pending_item'" />
  </TodoTabs>
  <FsTodoList @show-barcode="$emit('show-barcode', $event)" v-else />
</template>

<script lang="ts" setup>
import TodoTabs from './tabs.vue'
import PaymentContent from './payment/index.vue'
import ThirdOrderContent from './third-order/index.vue'
import TodoContent from './approval/index.vue'
import WaybillContent from './waybill/index.vue'
import FsTodoList from './fs/index.vue'
import { useHomeStore } from '../../store'
import { debounce } from 'lodash-es'
import './index.scss'
import { reportTodoTabClick } from '../../report'
import { TodoSelectedTab, getTodoAllTabs } from '../../utils/todoHelp'
import { computed } from 'vue'
import { isH5Env, isH5FSEnv } from '@/public/utils'

defineOptions({ name: 'todo-list' })

const store = useHomeStore()

const showTabs = computed(() => {
  const paymentTotal = store.data.paymentInfo?.count || 0
  const thirdOrderTotal = store.data.thirdOrderInfo?.count || 0
  const thirdOrderShow = store.data.thirdOrderInfo?.show || false
  const waybillTotal = store.data.newestWaybillInfo?.count || 0
  const todoTotal = store.data.todoList?.total || 0

  return getTodoAllTabs({ paymentTotal, thirdOrderTotal, waybillTotal, todoTotal, thirdOrderShow })
})

const selectedTab = computed(() => store.data.selectedTab)
const debounceUpdateTabData = debounce(
  () => {
    store.getTabsData()
  },
  8000,
  { leading: true, trailing: false },
)

const handleUpdateTab = (value: TodoSelectedTab, name: string) => {
  reportTodoTabClick(name)
  store.updateData({
    selectedTab: value,
  })
  debounceUpdateTabData()
}
</script>
