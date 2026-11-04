<template>
  <div
    class="ka-customer-map-order-number"
    :class="props.showType !== 'page' ? 'ka-customer-map-order-number-page' : ''"
  >
    <KyCell
      :key="props.encodeSelect?.kyField"
      :no-bg-disabled="disabled"
      :required="props.encodeSelect?.requiredStatus"
      :title="props.encodeSelect?.customerFieldName || 'PO单号'"
      :value="kaCustomerMapValue"
      @click="clickHandel"
      placeholder="请选择"
    >
      <div style="height: 1px" :data-validate="`kaCustomerMap.customerFieldValue.${props.encodeSelect?.kyField}`"></div>
    </KyCell>
    <BottomPopup
      :show="showPopup"
      @onClose="close"
      :title="`请选择${props.encodeSelect?.customerFieldName || 'PO单号'}`"
      class="ka-customer-map-order-number-popup"
      :showFooter="false"
      :style="{ maxHeight: '82%' }"
    >
      <div class="field-content">
        <div v-for="item in options" :key="item.data" class="order-number-item-box" @click="selectItem(item.data)">
          <SvgIcon name="radio-checked" v-if="kaCustomerMapValueList.includes(item.data)" />
          <SvgIcon name="radio-unchecked" v-else />
          <div class="order-number-item-box-right">
            <div class="order-number-item_title">
              采购单号：
              <span>{{ item.data }}</span>
            </div>
            <div class="order-number-item_desc">
              下单时间：
              <span>{{ item.time }}</span>
            </div>
          </div>
        </div>
      </div>
      <div class="footer">
        <div class="order-footer-text">已选：{{ kaCustomerMapValueList.length }}个</div>
        <KyButton class="order-footer-btn" :loading="loading" text="确定" @click="onConfirm" />
      </div>
    </BottomPopup>
  </div>
</template>

<script setup lang="ts">
import { cloneDeep, debounce } from 'lodash-es'
import KyCell from '@order-public-sub-public/components/base/ky-cell/index.vue'
import BottomPopup from '@order-public-sub-public/components/ui/bottom-popup/index.vue'
import KyButton from '@order-public-sub-public/components/base/ky-button/index.vue'
import SvgIcon from '@order-public-sub-public/components/ui/svg-icon/index.vue'
import { KaCustomerMapDimension, kaCustomerMapItem } from '@order-public-sub-public/types'
import { computed, ref, watchEffect } from 'vue'
import { ModuleType } from '@order-public-sub-public/constants'
import { kaCustomerMapValue, kaCustomerMapValueList } from './hooks/useState'
import { submit } from '@order-public-sub-public/components/business/ka-customer-map/hooks/useConfirm'
import useEffect from '@order-public-sub-public/validate'
import { showToast } from '@order-public-sub-public/hooks/useShowToast'
import { useStore } from '@order-public-sub-public/store'
const piniaStore = useStore()

const showPopup = ref(false)
const loading = ref(false)
interface InfoProp {
  encodeSelect: kaCustomerMapItem // 传入的数据
  showType: string // 展示类型，page：页面展示，dialog：弹窗展示
  disabled?: boolean
}
const props = defineProps<InfoProp>()

/**
 * @description: 选择数据列表
 * @param {*} computed
 * @return {*}
 */
const options = computed(() => {
  let list = kaCustomerMapData.value?.rows?.find((x) => x.kyField === props.encodeSelect?.kyField)?.optionData || []
  return list
})

const kaCustomerMapData = computed(() => {
  return piniaStore.schema.moduleDimensionData(ModuleType['自定义编码'])
})

/**
 * @description: 选择数据
 * @param {*} data
 * @return {*}
 */
const selectItem = (data: string) => {
  if (kaCustomerMapValueList.value.includes(data)) {
    kaCustomerMapValueList.value = kaCustomerMapValueList.value.filter((x) => x !== data)
  } else {
    kaCustomerMapValueList.value.push(data)
  }
}

const kaCustomerMapExtendData = computed(() => {
  return piniaStore.extend.kaCustomerMap?.filter((x) => x.kyField === props.encodeSelect?.kyField)
})

/**
 * @description: 显示文案
 */
const kaCustomerMapText = (list: string[]) => {
  if (list?.length) {
    return `已选${list.length}个`
  } else {
    return ''
  }
}
/**
 * @description: 重置已选数据
 * @return {*}
 */
const resetCheckList = () => {
  let checkList = [] as string[]
  kaCustomerMapExtendData?.value.forEach((x) => {
    if (x.customerFieldValue) {
      if (x.customerFieldValue?.indexOf(',') > -1) {
        checkList = checkList.concat(x.customerFieldValue?.split(','))
      } else {
        checkList.push(x.customerFieldValue)
      }
    }
  })
  kaCustomerMapValue.value = kaCustomerMapText(checkList)
  kaCustomerMapValueList.value = checkList
}

watchEffect(() => {
  if (!kaCustomerMapExtendData?.value.length) {
    kaCustomerMapValue.value = kaCustomerMapText([])
    kaCustomerMapValueList.value = []
  } else {
    resetCheckList()
  }
})

const { remoteCheck } = useEffect()

/**
 * @description: 确定， 如果是page 需要调用过程接口保存，否则先存本地
 * @param {*} debounce
 * @return {*}
 */
const onConfirm = debounce(async () => {
  if (props?.encodeSelect?.requiredStatus && !kaCustomerMapValueList.value?.length) {
    showToast(`请选择${props?.encodeSelect?.customerFieldName}`)
    return
  }
  let itemList = [] as kaCustomerMapItem[]
  if (kaCustomerMapValueList.value?.length) {
    kaCustomerMapValueList.value.forEach((item) => {
      const obj = cloneDeep(props.encodeSelect)
      obj.customerFieldValue = item
      itemList.push(obj)
    })
  } else {
    // 兜底显示下拉框， 因为组件显示是根据kyField来的
    const obj = cloneDeep(props.encodeSelect)
    obj.customerFieldValue = ''
    itemList.push(obj)
  }
  // 更新value显示
  kaCustomerMapValue.value = kaCustomerMapText(kaCustomerMapValueList.value)
  const dataList = piniaStore.extend.kaCustomerMap?.filter((item) => item?.kyField !== props?.encodeSelect?.kyField)
  // 更新store数据
  piniaStore.extend.updateKaCustomerMap({ data: [...dataList, ...itemList] as any })
  if (props.showType === 'page') {
    submit(async () => {
      loading.value = true
      try {
        // 远程校验
        await remoteCheck('kaCustomerMap')
      } catch (error) {
        console.log('error', error)
      } finally {
        loading.value = false
      }
    })
  }
  close()
}, 300)

const close = () => {
  showPopup.value = false
}

/**
 * @description: 显示popup
 * @return {*}
 */
const clickHandel = () => {
  resetCheckList()
  showPopup.value = true
}
</script>

<style lang="scss">
@import '@order-global-package-order-sub/styles/index.scss';
@import './index.scss';
</style>
