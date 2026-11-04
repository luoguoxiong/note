<template>
  <div class="area-floor-content">
    <div class="search-content">
      <ky-input
        clearable
        :placeholder="searchPlaceholder"
        :maxlength="30"
        v-model="keyword"
        v-keyboard
        @update:model-value="onSearch"
      >
        <template #left>
          <SvgIcon name="search-icon" class="search-icon" />
        </template>
      </ky-input>
    </div>
    <div class="select-content">
      <div class="label-title">
        <div class="title-item">{{ areaLabel }}</div>
        <div class="title-item">{{ floorLabel }}</div>
      </div>
      <ky-picker
        :poppable="false"
        :show-toolbar="false"
        :visible-option-num="6"
        v-model="selectValue"
        :columns="curColumns"
        @change="onChange"
      />
      <!-- 缺省页 -->
      <div class="empty-content" v-if="!curColumns.length" @click.stop>
        <KyEmpty :type="EmptyTypeEnum.SEARCH" description="搜索无结果" />
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { computed, ref } from 'vue'
import KyInput from '@order-public-sub-public/components/base/ky-input'
import KyEmpty from '@order-public-sub-public/components/ui/ky-empty/index.vue'
import { EmptyTypeEnum } from '@order-public-sub-public/constants'
import { convertTree } from '@order-public-sub-public/utils/pick'
import { selectValue } from '../../hooks/state'
import { cloneDeep, debounce } from 'lodash-es'
import SvgIcon from '@order-public-sub-public/components/ui/svg-icon/index.vue'
const props = defineProps<{ areaLabel: string; floorLabel: string; areaList: any }>()
const searchPlaceholder = computed(() => {
  return `请输入${props.areaLabel}/${props.floorLabel}搜索`
})

let curColumns = ref(
  cloneDeep(convertTree(props.areaList, { text: 'value', value: 'value', children: 'locationList' })),
)
let areaList = ref(cloneDeep(convertTree(props.areaList, { text: 'value', value: 'value', children: 'locationList' })))

const keyword = ref('')
const onChange = ({ selectedValue }) => {
  selectValue.value = selectedValue
}

const onSearch = debounce((value: string) => {
  if (!value) {
    curColumns.value = cloneDeep(areaList.value)
  } else {
    let isMatchFirstLevel = false
    curColumns.value =
      areaList.value?.filter((item) => {
        const selfInclode = item.value.includes(value)
        const childrenInclode = item.children.some((child) => child.value.includes(value))
        selfInclode && (isMatchFirstLevel = true)

        // 如果大厦包含搜索关键字,楼层默认选中第一个
        if (selfInclode) {
          const subValue = item.children[0]?.value || ''
          selectValue.value = [item.value || '', subValue]
        }
        return selfInclode || childrenInclode
      }) || []
    console.log('curColumns', isMatchFirstLevel, selectValue.value)
    // 如果是楼层匹配到的,默认选中该楼层
    if (!isMatchFirstLevel) {
      const curArea = areaList.value[0]?.children || []
      const subValue = curArea?.filter((item) => item.value.includes(value))[0]?.value || ''
      selectValue.value = [selectValue.value[0] || '', subValue]
    }
    console.log('curColumns', curColumns.value, selectValue.value)
  }
}, 300)
</script>
<style lang="scss">
@import '@order-global-package-order-sub/styles/index.scss';
@import './index.scss';
</style>
