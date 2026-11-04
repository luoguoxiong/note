<template>
  <div id="suggest" v-if="type === 'WAYBILL'">
    <div class="suggest-item" v-for="item in data" :key="item.keyword" @click="onSelect(item)">
      <span class="text-name" v-html="highlightText(item.keyword)"></span>
      <span class="type">{{ waybillType.get(item.keywordType) }}</span>
    </div>
  </div>
  <div id="suggest" v-else>
    <div class="suggest-item" v-for="item in data" :key="item.keyword" @click="jumpTo(item as applicationInfoVO)">
      <span class="text-name" v-html="highlightApp(item.keyword)"></span>
      <span class="type">{{ waybillType.get(item.keywordType) }}</span>
    </div>
  </div>
</template>
<script setup lang="ts">
import { applicationInfoVO, WaybillListRes } from '@/apis/home/types'
import { locationRouteV2 } from '@/utils/appBridge'
import { baseReportInstance } from '@/reportUmp'
interface WaybillSuggestProps {
  data: WaybillListRes[] | applicationInfoVO[]
  keyword: string
  type: 'WAYBILL' | 'APPLICATION'
}
const emit = defineEmits(['select-suggest', 'select-app'])

const onSelect = (keyword: WaybillListRes) => {
  emit('select-suggest', keyword)
}

const jumpTo = (item: applicationInfoVO) => {
  emit('select-app', item)
  const { keywordCode } = item
  if (keywordCode === 'contact') {
    return
  } else {
    locationRouteV2.push({
      path: keywordCode,
      query: {
        needQuerySave: 'false',
        pre_click_id: baseReportInstance.get('click_id'),
      },
    })
  }
}

const props = defineProps<WaybillSuggestProps>()
const waybillType = new Map([
  ['10', '运单号'],
  ['20', '订单号'],
  ['30', '手机号'],
  ['40', '自定义编码'],
  ['50', '封装号'],
  ['60', '标签'],
  ['70', '寄收公司'],
  ['80', '寄收公司'],
  ['90', '部门'],
  ['100', '应用'],
  ['110', '托寄物'],
  ['120', '姓名'],
  ['140', '签回联'],
  ['130', '收件城市'],
  ['131', '寄件城市'],
])

const highlightText = (item: string) => {
  const regExp = new RegExp(props.keyword, 'gi')
  return item.replace(regExp, '<span style="color:#7143F0">$&</span>')
}

const highlightApp = (item: string) => {
  const appName = item.split('】')[0] + '】'
  return item.replace(appName, '<span style="color:#7143F0">$&</span>')
}
</script>
<style lang="scss" scoped>
#suggest {
  margin-top: 2px;
  border: 1px solid #ebeef5;
  border-radius: 4px;
  overflow: hidden;
  background: #fff;
  cursor: pointer;
  position: relative;
  z-index: 10;
  padding: 4px 0;
  box-shadow: 0px 6px 18px 0px rgba(0, 0, 0, 0.12);
}
.suggest-item {
  height: 32px;
  font-size: 14px;
  padding: 0 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.suggest-item:hover {
  background-color: #f8f8f8;
}
.text-name {
  font-size: 13px;
  width: 360px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: #24262b;
}
.type {
  font-size: 12px;
  border-radius: 2px;
  height: 16px;
  color: #8a94a3;
  background: #edf0f5;
  padding: 2px 4px;
}
</style>
