<!-- 会展运单表格（来源: netc-pc-web/src/views/exhibition-waybills/components/WaybillTable.vue）
  Vue3 适配:
  - Vue2 options ky-table(内置分页) -> el-table + KPagination(项目内 download-list 同模式)
  - v-loading 全局指令 -> ElLoading.directive 局部注册
  - 导出: 壳内走 native.exportTable(与老 clientUtil.exportExcel 壳分支一致);
    浏览器端老实现依赖 xlsx/file-saver(新项目未引入), 以 CSV(带 BOM) 替代 -->
<template>
  <div class="element-table" v-loading="loading">
    <el-table :data="tableData" height="calc(100vh - 366px)">
      <el-table-column
        v-for="(col, index) in tableColumns"
        :key="col.prop + index"
        show-overflow-tooltip
        :prop="col.prop"
        :label="col.text"
        :min-width="col.width"
      />
    </el-table>
    <div class="pagination-style">
      <div class="pagination-style__total-num">总共：{{ pagination.totalCount || 0 }}条</div>
      <k-pagination
        :current-page="pagination.pageIndex"
        :page-size="pagination.pageSize"
        :page-sizes="[10, 15, 20, 30, 50]"
        :total="Number(pagination.totalCount)"
        layout="prev, pager, next, jumper, sizes"
        @size-change="onSizeChange"
        @current-change="onPageCurrentChange"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { ElLoading, ElMessage } from 'element-plus'
import { KPagination } from '@netc-design-pc/ui'
import dayjs from 'dayjs'
import native from '@/utils/native'
import { Any } from '@/types'
import {
  getWaybillListByProjectName,
  type ExhibitionWaybill,
  type WaybillListByProjectNameParams,
} from '@/apis/exhibition'

defineOptions({ name: 'exhibition-waybill-table' })

// 局部注册 v-loading 指令(与老项目 v-loading 行为一致)
const vLoading = ElLoading.directive

const props = defineProps<{
  formData: { waybillNumber: string; dateRange: [Date, Date] }
}>()

interface TableColumn {
  prop: keyof ExhibitionWaybill
  text: string
  width: number
}

const tableColumns: TableColumn[] = [
  { prop: 'waybillNumber', text: '运单号', width: 160 },
  { prop: 'deliveryCustomerName', text: '寄件公司', width: 180 },
  { prop: 'fairCode', text: '会展编码', width: 120 },
  { prop: 'deliveryAddress', text: '寄件地址', width: 300 },
  { prop: 'pickupAreaCode', text: '收件区号', width: 100 },
  { prop: 'actualWeight', text: '重量', width: 100 },
  { prop: 'pickupTime', text: '寄件时间', width: 150 },
  { prop: 'waybillAmount', text: '运费', width: 120 },
  { prop: 'sendAreaCode', text: '寄件区号', width: 120 },
]

const loading = ref(false)
const tableData = ref<ExhibitionWaybill[]>([])
const pagination = reactive({
  pageIndex: 1,
  pageSize: 10,
  totalCount: 0,
})

const getParams = (pageIndex: number, pageSize: number): WaybillListByProjectNameParams => ({
  waybillNumber: props.formData.waybillNumber,
  projectName: '20', // 会展撤展项目
  beginTime: dayjs(props.formData.dateRange[0]).format('YYYY-MM-DD 00:00:00'),
  endTime: dayjs(props.formData.dateRange[1]).format('YYYY-MM-DD 23:59:59'),
  page: pageIndex,
  pageSize,
})

const queryData = async () => {
  const params = getParams(pagination.pageIndex, pagination.pageSize)
  loading.value = true
  try {
    const res = await getWaybillListByProjectName(params)
    if (res.code === 0) {
      tableData.value = res.data.rows || []
      pagination.totalCount = res.data.rowTotal
    }
  } finally {
    loading.value = false
  }
}

/** CSV 单元格转义（逗号/引号/换行包裹双引号） */
const escapeCsvCell = (value: Any) => {
  const str = String(value === 0 ? 0 : value ?? '')
  return /[",\n\r]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str
}

/** 浏览器端导出 CSV（带 BOM，Excel 可直接打开） */
const exportCsv = (theadColumns: TableColumn[], jsonData: ExhibitionWaybill[], filename: string) => {
  const rows = [
    theadColumns.map((c) => escapeCsvCell(c.text)).join(','),
    ...jsonData.map((r) => theadColumns.map((c) => escapeCsvCell(r[c.prop])).join(',')),
  ]
  const blob = new Blob([`\uFEFF${rows.join('\r\n')}`], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = `${filename}.csv`
  link.click()
  URL.revokeObjectURL(link.href)
}

/**
 * 导出 Excel（对齐老 clientUtil.exportExcel）：
 * 壳内走 native.exportTable（列名映射 + 结果提示），浏览器端导出 CSV
 */
const exportWaybillExcel = async (theadColumns: TableColumn[], jsonData: ExhibitionWaybill[], filename: string) => {
  if (native.isClientMode()) {
    const tableDataForNative = jsonData.map((r) => {
      const row: Record<string, Any> = {}
      theadColumns.forEach((c) => {
        row[c.text] = r[c.prop] === 0 ? 0 : r[c.prop] || ''
      })
      return row
    })
    // 各壳返回值形态不一（miniBlink 已 parse / webview2 返回字符串），兼容两种
    const raw = await native.exportTable(tableDataForNative, filename)
    const result = typeof raw === 'string' ? JSON.parse(raw) : raw
    if (result) {
      if (Number(result.code) === 0 && result.msg) {
        ElMessage.success(result.msg)
      } else if (Number(result.code) !== 0 && result.msg) {
        ElMessage.error(result.msg)
      }
    }
    return
  }
  exportCsv(theadColumns, jsonData, filename)
}

/** 导出全部运单：按 500 条/页拉全量后本地导出（对齐老实现） */
const exportWaybillData = async () => {
  const res = await getExportWaybillData(1)
  if (res.code === 0) {
    let data: ExhibitionWaybill[] = []
    if (res.data.pageTotal < 1) {
      ElMessage('未查询到数据')
      return
    } else if (res.data.pageTotal === 1) {
      data = res.data.rows
    } else {
      data = res.data.rows
      const promiseList = []
      for (let i = 2; i <= res.data.pageTotal; i++) {
        promiseList.push(getExportWaybillData(i))
      }
      const resList = await Promise.all(promiseList)
      if (resList.every((r) => r.code === 0)) {
        resList.forEach((r) => data.push(...r.data.rows))
      }
    }
    try {
      await exportWaybillExcel(tableColumns, data, `国际会展运单${dayjs().format('YYYY-MM-DD HHmmss')}`)
    } catch (ex) {
      console.log('exportWaybillData :>> ', ex)
    }
  }
}

const getExportWaybillData = (pageIndex: number) => {
  const params = getParams(pageIndex, 500)
  return getWaybillListByProjectName(params)
}

const onSizeChange = (val: number) => {
  pagination.pageSize = val
  pagination.pageIndex = 1
  queryData()
}

const onPageCurrentChange = (val: number) => {
  pagination.pageIndex = val
  queryData()
}

defineExpose({
  queryData,
  exportWaybillData,
})
</script>

<style lang="scss" scoped>
.element-table {
  .pagination-style {
    margin-top: 16px;
    display: flex;
    align-items: center;
    justify-content: space-between;

    &__total-num {
      font-size: var(--k-font-size-13);
      line-height: var(--k-line-height-13);
      color: var(--k-color-grey-09);
    }
  }
}
</style>
