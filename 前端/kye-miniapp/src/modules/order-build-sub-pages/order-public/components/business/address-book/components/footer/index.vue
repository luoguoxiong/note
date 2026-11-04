<template>
  <view class="clear-addr-box-f" v-if="isShowOneClearAddrTip && !isOperationLabel">
    <view class="clear-addr-box_tip">您有地址长时间未使用，是否需要清理</view>
    <view class="clear-addr-box_btn" @click="toClearAddr">去清理</view>
  </view>
  <view class="a-b-p-f" catchMove>
    <view class="wrap" v-if="!showBtnOne">
      <!-- 批量寄 两个按钮 -->
      <!-- <view v-if="batchSender" class="wrap__double">
        <KyButton plain text="新增地址" @click="onAddOrDeleteAll('新增地址')" />
        <KyButton
          :text="`确定(${batchSelectList.length}/${BATCH_MAX_LENGTH - batchWaybillInfoListLength})`"
          :disabled="disabled"
          @click="batchConfirm('确认')"
          :loading="batchLoading"
        />
      </view> -->
      <!-- 两个按钮 -->

      <view v-if="listLength > 0 && show" class="w__d_r">
        <view class="flex flex-center select-all" @click="toggleSelectAll">
          <SvgIcon v-if="selectAll" class="icon-select-all" :name="'radio-checked'" />
          <SvgIcon v-else class="icon-select-all" :name="'radio-unchecked'" />
          <span class="font-select-all">全选</span>
        </view>
        <KyButton plain text="完成" @click="onManage('完成')" />
        <KyButton class="button-delete" text="删除" @click="onAddOrDeleteAll('删除')" v-if="!isOperationLabel" />
        <KyButton class="ml-24 tag-opt-btn" v-else text="加入标签" @click="onAddOrDeleteAll('加入标签')" />
      </view>
      <view v-else-if="listLength > 0 && !show" class="wrap__double">
        <KyButton plain text="管理" @click="_onManage('管理')" />
        <KyButton text="新增地址" @click="onAddOrDeleteAll('新增地址')" />
      </view>

      <!-- 单个按钮 -->
      <view v-else-if="listLength <= 0" class="wrap__single">
        <KyButton text="新增地址" @click="onAddOrDeleteAll('新增地址')" v-if="!showManage" />
      </view>
    </view>
    <!-- <view class="wrap" v-else-if="!showManage || batchSender">
      <view :class="batchSender ? 'wrap__double' : 'wrap__single'">
        <KyButton
          text="新增地址"
          :plain="batchSender ? true : false"
          @click="onAddOrDeleteAll('新增地址')"
          v-if="!showManage"
        />
        <KyButton
          v-if="batchSender"
          :text="`确定(${batchSelectList.length}/${BATCH_MAX_LENGTH - batchWaybillInfoListLength})`"
          :disabled="disabled"
          @click="batchConfirm('确认')"
          :loading="batchLoading"
        />
      </view>
    </view> -->
  </view>
  <!-- 选择操作类型 -->
  <div>
    <BottomPopup
      v-model:show="operationPopupVisible"
      :show-footer="false"
      :show-title="false"
      :no-padding="true"
      class="f-o-p"
    >
      <div class="footer-operation-wrap">
        <div class="op-item border-bottom" @click="doOperation(OperationTypes.addAddress)">批量删除地址</div>
        <div class="op-item" @click="doOperation(OperationTypes.addLabel)">批量加入标签</div>
        <div class="op-item mr-top-8" @click="operationPopupVisible = false">取消</div>
      </div>
    </BottomPopup>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { clk_express_single_address_book_v1 } from '@order-public-sub-public/components/business/address-book/page/report/index'
// 组件
import KyButton from '@order-global-package-order-sub/components/base/ky-button/index.vue'
import SvgIcon from '@order-global-package-order-sub/components/ui/svg-icon/index.vue'
// import { BATCH_MAX_LENGTH } from '@order-public-sub-public/constants'

// import { batchLoading } from '../../page/hooks/useBatchLoading'
import { showOneCleanTipReport, clickOneCleanTipReport } from '../../report'
import { Address } from '@order-public-sub-public/constants/address'
// import { useStore } from '@order-public-sub-public/store'
import BottomPopup from '@order-public-sub-public/components/ui/bottom-popup/index.vue'
import { EAddressPermissionTab } from '../../types'

// const piniaStore = useStore()

// const batchWaybillInfoListLength = computed(() => piniaStore.order.batchWaybillInfoList?.length || 0)

const props = defineProps({
  disabled: {
    type: Boolean,
    default: false,
  },
  showManage: {
    type: Boolean,
    default: false,
  },
  showBtnOne: {
    type: Boolean,
    default: false,
  },
  isOperationLabel: {
    type: Boolean,
    default: false,
  },
  listLength: {
    type: Number,
    default: 0,
  },
  // 批量寄 标识
  batchSender: {
    type: Boolean,
    default: false,
  },
  // 已选中数量
  selectItemLength: {
    type: Number,
    default: 0,
  },
  selectAll: {
    type: Boolean,
    default: false,
  },
  batchSelectList: {
    type: Array,
    default: () => [],
  },
  // 是否展示 去清理的 bar
  isShowClearAddrBar: {
    type: Boolean,
    default: false,
  },
  // 寄件 收件
  addressType: {
    type: String,
    default: '',
  },
  shareAddressPermission: {
    type: String,
    default: EAddressPermissionTab.全部地址,
  },
})

const show = ref(props.showManage)

const emit = defineEmits([
  'onManage',
  'onAddOrDeleteAll',
  'batchConfirm',
  'selectAllRadio',
  'toClearAddr',
  'setOperationType',
  'clickOut',
])
const enum OperationTypes {
  addAddress = 10,
  addLabel = 20,
}

const operationPopupVisible = ref(false)
const _onManage = (name: string) => {
  clk_express_single_address_book_v1(name)
  operationPopupVisible.value = true
  emit('clickOut', {})
}
const doOperation = (type: OperationTypes) => {
  emit('setOperationType', type === OperationTypes.addLabel)
  operationPopupVisible.value = false
  onManage(type === OperationTypes.addLabel ? '加入标签' : '删除')
}

const onManage = (name: string) => {
  clk_express_single_address_book_v1(name)
  show.value = !show.value
  emit('onManage', show.value)
}

const toChangeShowStatus = (value: boolean) => {
  show.value = value
}

const onAddOrDeleteAll = (name: string) => {
  clk_express_single_address_book_v1(name)
  emit('onAddOrDeleteAll', { type: getType() })
  emit('clickOut', {})
}
// const batchConfirm = (name: string) => {
//   clk_express_single_address_book_v1(name)
//   emit('batchConfirm')
//   emit('clickOut', {})
// }

const getType = () => {
  if (show.value && props.listLength > 0) {
    if (props.isOperationLabel) {
      return 'addLabel'
    } else if (!props.batchSender) {
      return 'delete'
    }
  } else {
    return 'add'
  }
}

const toggleSelectAll = () => {
  emit('selectAllRadio')
}

const isShowOneClearAddrTip = computed(() => {
  let bool =
    props.isShowClearAddrBar &&
    show.value &&
    props.listLength > 0 &&
    [EAddressPermissionTab.共享地址, EAddressPermissionTab.全部地址, EAddressPermissionTab.我的地址].includes(
      props.shareAddressPermission as EAddressPermissionTab,
    )
  if (bool) {
    let recognition_type = Address.SENDER_ADDRESS_TYPE === props.addressType ? '寄件' : '收件'
    showOneCleanTipReport(recognition_type + '地址簿')
  }
  return bool
})

// 清理地址簿 弹窗
const toClearAddr = () => {
  let recognition_type = Address.SENDER_ADDRESS_TYPE === props.addressType ? '寄件' : '收件'
  clickOneCleanTipReport(recognition_type)
  emit('toClearAddr')
}

defineExpose({ toChangeShowStatus })
</script>

<style lang="scss">
@import '@order-global-package-order-sub/styles/index.scss';
@import './index.scss';
</style>
