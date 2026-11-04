<template>
  <div class="print-management">
    <div v-for="item in printManagementList" :key="item.title" class="item" @click="item.action">
      <div class="left-connect">
        <SvgIcon class="left-connect-icon" v-if="item?.iconName" :name="item?.iconName"></SvgIcon>
        <div>
          <div class="title">{{ item?.title }}</div>
          <div class="describe">{{ item?.describe }}</div>
        </div>
      </div>
      <div class="flex right-arrow">
        <SvgIcon class="right-arrow-icon" name="right-arrow"></SvgIcon>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import SvgIcon from '@order-public-sub-public/components/ui/svg-icon/index.vue'
import { $native } from '@order-public-sub-public/utils'
// import { printCheckBluetooth } from '@order-public-sub-public/utils/print'
import { debounce } from 'lodash-es'

import { useRouter } from '@order-public-sub-public/vue-router/index'
import { ref, onMounted } from 'vue'
import { umpOtherReport } from '@order-public-sub-public/reportUmp'
const router = useRouter()
const loading = ref(false)
const printManagementList = [
  {
    title: '批量打印',
    describe: '运单可批量选择打印面单',
    iconName: 'printer-batch',
    action: () => {
      router.push({
        name: 'print-batch',
      })
      reportDate('批量打印')
    },
  },
  {
    title: '连接打印机',
    describe: '连接蓝牙打印机',
    iconName: 'printer-icon',
    action: () => {
      onSearch()
      reportDate('连接打印机')
    },
  },
  {
    title: '打印记录',
    describe: '查询7天内打印记录',
    iconName: 'print-records-icon',
    action: () => {
      console.log('查询7天内打印记录')
      router.push({
        name: 'print-records',
      })
      reportDate('打印记录')
    },
  },
]
const onSearch = debounce(async () => {
  loading.value = true
  try {
    $native.jumpBluetoothDeviceList({
      traceId: '',
    })
  } finally {
    loading.value = false
  }
}, 300)

const reportDate = (buttonName: string) => {
  umpOtherReport(
    'CLK',
    {
      eventCode: 'clk_kyeprint_button_v1',
    },
    {
      button_name: buttonName,
    },
  )
}
onMounted(() => {
  umpOtherReport('EXP', {
    eventCode: 'exp__kyeprint_v1',
  })
})
</script>

<style scoped lang="scss">
@import '@order-global-package-order-sub/styles/index.scss';

@import './index.scss';
</style>
