<template>
  <div class="c-a-b-p-wrap">
    <BottomPopup
      title="清理地址"
      class="c-a-b-p"
      v-model:show="clearAddrPopupVisible"
      footer-text="一键清理"
      :show-footer="true"
      @onConfirm="onConfirm"
      @onClose="onClose"
      :buttonDisabled="isDisabledConfirm"
      @closed="closed"
    >
      <div
        v-for="item of props.addressInfoList"
        :key="item.type"
        :class="['clear-ranglist-item', handleClass(item)]"
        :style="setCardStyle(item.type)"
      >
        <div class="rl-i-l" @click="toSelectItem(item)">
          <SvgIcon class="icon" v-if="item.value === 0" name="radio-disabled-unchecked" />
          <SvgIcon class="icon" v-else-if="item.type === selectRangeType" name="radio-checked-circle" />
          <SvgIcon class="icon" v-else name="no-check-icon" />
          <div class="ranglist-item-title">超过{{ item.type }}天未使用地址</div>
          <span class="ranglist-item-tip">共{{ item.value }}条地址</span>
        </div>
        <div class="ranglist-item-btn" v-if="item.value > 0" @click="toJumpClearAddrList(item.type)">详情</div>
      </div>
      <div class="bottom-tip" v-if="isShowTip">暂不支持清理共享地址</div>
    </BottomPopup>
  </div>
</template>

<script setup lang="ts">
import { computed, h, useModel } from 'vue'
import BottomPopup from '@order-public-sub-public/components/ui/bottom-popup/index.vue'
import SvgIcon from '@order-public-sub-public/components/ui/svg-icon/index.vue'
import { showKyDialog } from '@order-public-sub-public/validate/effect/effectDialog'
import { IClearAddrInfo, EAddressPermission, MaxClearAddrNum, EAddressPermissionTab } from '../../types'
import { clickOneCleanPopReport, clickOneCleanDoubleConfReport } from '../../report'

import { Address } from '@order-public-sub-public/constants/address'

interface IPropsInfoType {
  visible: boolean
  // 30 60 90 数据信息
  addressInfoList: Array<IClearAddrInfo>
  // 是有展示下方的提示文案
  authFlag: string
  cleanAddressType: string
  addressShowType: string
  addressType: string
}

const props = withDefaults(defineProps<IPropsInfoType>(), {
  visible: false,
  addressInfoList: () => [],
  // 10 有权限 -> 不显示；
  // 20 无权限 -> 显示
  authFlag: EAddressPermission.有权限,
  cleanAddressType: '',
})

const emit = defineEmits(['toJumpClearAddrList', 'toClearAddr'])

let clearAddrPopupVisible = useModel(props, 'visible')

const selectRangeType = useModel(props, 'cleanAddressType')

let isDisabledConfirm = computed(() => {
  return !selectRangeType.value
})

// 获取选择图标的name
const getIconName = (item: IClearAddrInfo) => {
  if (item.value === 0) return 'radio-disabled-unchecked' // 禁用
  if (item.type === selectRangeType.value) return 'radio-checked-circle' // 选中
  return 'no-check-icon' // 没选
}

// 处理radio的class
const handleClass = (item: IClearAddrInfo) => {
  if (item.value === 0) return 'clear-ranglist-item-disabled' //禁用
  if (item.type === selectRangeType.value) return 'clear-ranglist-item-active' // 选中
}

let toSelectItem = (item: IClearAddrInfo) => {
  let button_name = `近${item.type}天未使用`
  clickOneCleanPopReport(button_name, addressTypeName.value, addressShowTypeName.value)
  if (item.value <= 0) return
  selectRangeType.value = item.type
}

let onConfirm = async () => {
  clickOneCleanPopReport('一键清理', addressTypeName.value, addressShowTypeName.value)
  try {
    let clearAddrInfo = props.addressInfoList.find((v: IClearAddrInfo) => {
      return v.type === selectRangeType.value
    })
    console.log(clearAddrInfo)
    let { type, value: clearAddNums } = clearAddrInfo!
    let message =
      clearAddNums > MaxClearAddrNum
        ? () =>
            h('div', [
              h('div', `您确定要清理超过${type}天未使用的地址？`),
              h('div', { style: { color: '#686B75' } }, `（一次最多可删除${MaxClearAddrNum}条）`),
            ])
        : `您确定要清理超过${type}天未使用的地址？`
    const showKyDialogParams = {
      message,
      title: '温馨提示',
      showCancelButton: true,
      showConfirmButton: true,
      cancelButtonText: '取消',
      confirmButtonText: '确定清理',
      zIndex: 1000,
    }
    await showKyDialog(showKyDialogParams)
    clickOneCleanDoubleConfReport('确认清理', addressTypeName.value)
    emit('toClearAddr', {
      cleanAddressType: selectRangeType.value,
    })
  } catch (error) {
    if (error === 'cancel') {
      clickOneCleanDoubleConfReport('取消', addressTypeName.value)
    }
  }
}
let onClose = () => {
  clearAddrPopupVisible.value = false
}

// 点击详情跳转
const toJumpClearAddrList = (cleanAddressType: string) => {
  clickOneCleanPopReport('详情', addressTypeName.value, addressShowTypeName.value)
  emit('toJumpClearAddrList', cleanAddressType)
}

const setCardStyle = (cleanAddressType: string) => {
  return `--active-bg:${cleanAddressType === selectRangeType.value ? '#f2effe' : 'rgba(0, 0, 0, 0.04)'}`
}

const closed = () => {
  clickOneCleanPopReport('取消', addressTypeName.value, addressShowTypeName.value)
}

const addressShowTypeName = computed(() => {
  console.log(props.addressShowType)
  let tempMap: Record<string, any> = {
    [EAddressPermissionTab.全部地址]: '全部地址',
    [EAddressPermissionTab.我的地址]: '我的地址',
  }
  console.log(tempMap[props.addressShowType], 'tempMap[props.addressShowType]')
  return tempMap[props.addressShowType]
})

const addressTypeName = computed(() => {
  let tempMap: Record<string, any> = {
    [Address.SENDER_ADDRESS_TYPE]: '寄件地址簿',
    [Address.RECEIVE_ADDRESS_TYPE]: '收件地址簿',
  }
  console.log(tempMap[props.addressType], 'tempMap[props.addressType]')
  return tempMap[props.addressType]
})

const isShowTip = computed(() => {
  // 如果 无权限 并且是 全部地址就展示 并且是 没有共享地址
  return props.authFlag === EAddressPermission.无权限 && props.addressShowType === EAddressPermissionTab.全部地址
})
</script>

<style lang="scss">
@import '@order-global-package-order-sub/styles/index.scss';
@import './index.scss';
</style>
