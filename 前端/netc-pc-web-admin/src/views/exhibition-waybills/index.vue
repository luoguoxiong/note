<!-- 国际会展运单（来源: netc-pc-web/src/views/exhibition-waybills/index.vue）
  Vue3 适配:
  - Vue2 element-ui -> Element Plus（组件由 unplugin 自动引入）
  - picker-options(onPick 限选 6 个月) -> calendar-change + disabled-date
  - dateRange 模型由 dayjs 对象改为 Date 对象（EP daterange 原生支持） -->
<template>
  <div class="exhibition-waybills-container">
    <div class="index-title">国际会展</div>
    <div class="search-condition">
      <div>
        <span>运单号</span>
        <el-input v-model="formData.waybillNumber" placeholder="运单号" style="width: 200px"></el-input>
      </div>
      <div>
        <span>寄件时间</span>
        <el-date-picker
          v-model="formData.dateRange"
          :editable="false"
          :clearable="false"
          type="daterange"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          :disabled-date="disabledDate"
          @calendar-change="onCalendarChange"
          format="YYYY/MM/DD"
          class="ky-date-picker"
          style="width: 264px"
        />
      </div>
      <el-button type="primary" round @click="queryData">查询</el-button>
      <el-button round :loading="loadingOfExport" @click="exportWaybillData">导出全部运单</el-button>
    </div>
    <div class="waybill-table-wrapper">
      <WaybillTable ref="waybillTable" :form-data="formData" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import dayjs from 'dayjs'
import WaybillTable from './components/WaybillTable.vue'

defineOptions({ name: 'exhibition-waybills' })

/** 已选中的起始日期（限选跨度 6 个月，对齐老 uiUtil.getPickerOptions(null, 6)） */
let pickedMinDate: number | null = null

const loadingOfExport = ref(false)
const waybillTable = ref<InstanceType<typeof WaybillTable>>()

const formData = reactive({
  waybillNumber: '',
  dateRange: [dayjs().add(-15, 'd').toDate(), dayjs().toDate()] as [Date, Date],
})

/** daterange 选中起始日期时记录（EP 以 calendar-change 取代老 onPick） */
const onCalendarChange = (dates: [Date, Date] | null) => {
  pickedMinDate = dates?.[0]?.getTime() ?? null
}

/** 起始日期选定后，仅可选其前后 6 个月 */
const disabledDate = (time: Date) => {
  if (pickedMinDate !== null) {
    const min = dayjs(pickedMinDate).add(-6, 'month')
    const max = dayjs(pickedMinDate).add(6, 'month')
    return time.getTime() < min.valueOf() || time.getTime() > max.valueOf()
  }
  return false
}

const queryData = () => {
  waybillTable.value?.queryData()
}

const exportWaybillData = async () => {
  loadingOfExport.value = true
  try {
    await waybillTable.value?.exportWaybillData()
  } finally {
    loadingOfExport.value = false
  }
}

onMounted(() => {
  queryData()
})
</script>

<style lang="scss" scoped>
.exhibition-waybills-container {
  height: 100%;

  .index-title {
    padding: 12px 20px 0;
    font-size: 16px;
    font-weight: bold;
    color: #333333;
  }

  .search-condition {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    padding: 8px 20px 20px;
    font-size: 14px;
    color: #333333;

    & > button {
      margin: 12px 0 0;
    }

    // 覆盖了 EP 的 .el-button + .el-button 连接间距，此处补回
    & > button + button {
      margin-left: 12px;
    }

    & > div {
      display: flex;
      align-items: center;
      padding-right: 12px;
      margin-top: 12px;

      & > :first-child {
        padding-right: 8px;
      }
    }

    :deep(.el-input) {
      display: inline-block;
      width: 166px;

      & > input {
        border: none;
        border-radius: 19px;
        padding: 0 12px;
        background: #eef3fc;
      }
    }

    .el-button.is-round {
      // 老 element-ui medium 为 10px 27px(36px 高)，EP 默认高度 32px，纵向保持默认仅加宽
      padding: 8px 27px;
    }
  }

  .waybill-table-wrapper {
    margin: 0 20px;
    padding-top: 20px;
    border-top: 1px solid #f1f1f5;
  }
}
</style>
