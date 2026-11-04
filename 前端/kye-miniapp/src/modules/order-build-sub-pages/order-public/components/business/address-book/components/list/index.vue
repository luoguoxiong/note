<template>
  <view class="add-b-p-l" id="exp_express_ai_label_v1">
    <KyReport
      eventCode="exp_express_ai_label_v1"
      :otherParams="expReport(item, justAddedFlagId, addressType)"
      v-if="expReport(item, justAddedFlagId, addressType)?.ai_label_status === '常用'"
    ></KyReport>
    <!-- 地址待完善标签曝光 -->
    <KyReport
      v-if="needCorrection"
      eventCode="exp_express_address_correction_tips_v1"
      :otherParams="{ recognition_type: recognitionType, waybill_number: '' }"
    ></KyReport>
    <ky-swipe-cell
      @touchstart.passive="() => (isTouch = true)"
      @touchend.passive="() => (isTouch = false)"
      @open="open(item.id)"
      @close="close"
      :disabled="disabledSwipe"
      :name="item.id"
    >
      <template v-if="showManage || batchCanSelect">
        <view
          class="address-list"
          :class="{
            'select-active': selectActive,
            'border-style': openId === item.id,
            item_disabled: disabledComp,
          }"
        >
          <view v-if="needCorrection" class="address-list__correction-tag">
            <image
              class="address-list__correction-tag__icon"
              src="https://ic-img.ky-express.com/netc/20260812_5143_!!1786520860724_23_23.png"
            />
            <text>地址待完善</text>
          </view>
          <view
            class="address-list__item"
            @click.stop="showManage || batchCanSelect ? onSelectRadio() : onSelectItem()"
          >
            <SvgIcon v-if="disabledComp" class="address-list__item__icon" name="radio-disabled-unchecked" />
            <template v-else>
              <SvgIcon v-if="item.isSelectItem" class="address-list__item__icon" name="radio-checked" />
              <SvgIcon v-else class="address-list__item__icon" name="radio-unchecked" />
            </template>
            <view class="address-list__item__base">
              <view class="info">
                <view class="info__name" v-html="highlightText(item.person, keyword)"></view>
                <view v-if="item.mobile" class="info__mobile" v-html="highlightText(item.mobile, keyword)"></view>
                <view v-else class="info__mobile">{{ telephone }}</view>
                <view v-if="item.defaultFlag && showSaveAddressBookBtn" class="info__flag default">默认</view>
                <view v-if="item.commonFlag" class="info__flag common">常用</view>
                <view v-if="justAddedFlagId === item.id" class="info__flag justAddedFlag">刚刚新增</view>
                <div v-if="item.labelName" class="info__flag customFlag">{{ item.labelName }}</div>
              </view>
              <view v-if="telephone && item.mobile" class="telephone" v-html="highlightText(telephone, keyword)"></view>
              <view
                v-if="item.companyName"
                class="companyName"
                v-html="highlightText(item.companyName, keyword)"
              ></view>
              <view class="addressdetail" v-html="highlightText(fullAddress, keyword)"></view>
              <view class="create-info">
                创建信息：<span
                  class="create"
                  v-if="shareAddressAuth === EAddressPermission.有权限"
                  v-html="highlightText(item.createdBy, keyword)"
                ></span
                ><span class="creat-time">{{ timeFormat(item.createTime) }}</span>
              </view>
            </view>
          </view>
          <!--
            v-if="!isNetworkQueryAddress"
           -->
          <view
            class="address-list__operate"
            :class="{ 'list-operate-disabled': showManage, 'flex-style': !showSaveAddressBookBtn || showManage }"
          >
            <view
              v-show="showSaveAddressBookBtn && !showManage"
              class="save"
              :class="{ 'edit-disabled': !item.updateFlag || showManage }"
              @click.stop="onDefault"
            >
              <SvgIcon v-if="!item.updateFlag || showManage" class="save__icon" name="radio-disabled-unchecked" />
              <SvgIcon v-else class="save__icon" :name="item.defaultFlag ? 'radio-checked' : 'radio-unchecked'" />
              <view class="save__text">默认寄件地址</view>
            </view>
            <div class="btn" :class="{ disabled: showManage }">
              <div
                class="btn__text delete"
                :class="{ 'delete-disabled': !item.deleteFlag || showManage }"
                @click.stop="onDelete"
              >
                <span>删除</span>
              </div>
              <div
                class="btn__text copy"
                :class="{ 'copy-disabled': showManage }"
                v-copy="onCopy(item)"
                @touchend="copyEnd"
              >
                <span>复制</span>
              </div>
              <div
                v-if="needCorrection"
                class="btn__text correction"
                :class="{ 'correction-disabled': showManage || modifying }"
                @click.stop="onCorrection"
              >
                <span>完善</span>
              </div>
              <div
                v-else
                class="btn__text edit"
                :class="{ 'edit-disabled': !item.updateFlag || showManage }"
                @click.stop="onEdit"
              >
                <span>编辑</span>
              </div>
            </div>
          </view>
        </view>
      </template>
      <template v-else>
        <view class="address-list" :class="{ 'select-active': selectActive, 'border-style': openId === item.id }">
          <view v-if="needCorrection" class="address-list__correction-tag">
            <image
              class="address-list__correction-tag__icon"
              src="https://ic-img.ky-express.com/netc/20260812_5143_!!1786520860724_23_23.png"
            />
            <text>地址待完善</text>
          </view>
          <view
            class="address-list__item"
            @click.stop="showManage || batchCanSelect ? onSelectRadio(true) : onSelectItem(true)"
          >
            <view class="address-list__item__base">
              <view class="info">
                <view class="info__name" v-html="highlightText(item.person, keyword)"></view>
                <view v-if="item.mobile" class="info__mobile" v-html="highlightText(item.mobile, keyword)"></view>
                <view v-else class="info__mobile">{{ telephone }}</view>
                <view v-if="item.defaultFlag && showSaveAddressBookBtn" class="info__flag default">默认</view>
                <view v-if="item.commonFlag" class="info__flag common">常用</view>
                <view v-if="justAddedFlagId === item.id" class="info__flag justAddedFlag">刚刚新增</view>
                <div v-if="item.labelName" class="info__flag customFlag">{{ item.labelName }}</div>
              </view>
              <view v-if="telephone && item.mobile" class="telephone" v-html="highlightText(telephone, keyword)"></view>
              <view
                v-if="item.companyName"
                class="companyName"
                v-html="highlightText(item.companyName, keyword)"
              ></view>
              <view class="addressdetail" v-html="highlightText(fullAddress, keyword)"></view>
              <view class="create-info">
                创建信息：<span
                  class="create"
                  v-if="shareAddressAuth === EAddressPermission.有权限"
                  v-html="highlightText(item.createdBy, keyword)"
                ></span
                ><span class="creat-time">{{ timeFormat(item.createTime) }}</span>
              </view>
            </view>
          </view>
          <!--
            v-if="!isNetworkQueryAddress"
           -->
          <view
            class="address-list__operate"
            :class="{ disabled: showManage, 'flex-style': !showSaveAddressBookBtn || showManage }"
          >
            <view
              v-show="showSaveAddressBookBtn && !showManage"
              class="save"
              :class="{ 'edit-disabled': !item.updateFlag || showManage }"
              @click.stop="onDefault"
            >
              <SvgIcon v-if="!item.updateFlag || showManage" class="save__icon" name="radio-disabled-unchecked" />
              <template v-else>
                <SvgIcon v-if="item.defaultFlag" class="save__icon" name="radio-checked" />
                <SvgIcon v-else="item.defaultFlag" class="save__icon" name="radio-unchecked" />
              </template>
              <view class="save__text">默认寄件地址</view>
            </view>
            <view class="btn" :class="{ disabled: showManage }">
              <view
                class="btn__text delete"
                :class="{ 'delete-disabled': !item.deleteFlag || showManage }"
                @click.stop="onDelete"
              >
                <span>删除</span>
              </view>
              <view
                class="btn__text copy"
                :class="{ 'copy-disabled': showManage }"
                v-copy="onCopy(item)"
                @touchend="copyEnd"
              >
                <span>复制</span>
              </view>
              <view
                v-if="needCorrection"
                class="btn__text correction"
                :class="{ 'correction-disabled': showManage }"
                @click.stop="onCorrection"
              >
                <span>完善</span>
              </view>
              <view
                v-else
                class="btn__text edit"
                :class="{ 'edit-disabled': !item.updateFlag || showManage }"
                @click.stop="onEdit"
              >
                <span>编辑</span>
              </view>
            </view>
          </view>
        </view>
      </template>
      <template #right>
        <div class="address-list-delete" @click="onDelete">删除</div>
      </template>
    </ky-swipe-cell>

    <!-- 地址校正温馨提示弹窗 -->
    <AddressCorrectionDialog
      v-model:show="dialogVisible"
      :type="correctionType"
      :currentAddress="currentAddress"
      :suggestedAddress="suggestedAddress"
      @confirm="onCorrectionConfirm"
      @cancel="onCorrectionCancel"
    />
  </view>
</template>

<script setup lang="ts">
// 组 件
import { expReport, clkReport } from '@order-public-sub-public/components/business/address-book/components/list/report/index'
import SvgIcon from '@order-global-package-order-sub/components/ui/svg-icon/index.vue'
import { ListItem, EAddressPermissionTab, EAddressPermission } from '../../types'
import vCopy from '@order-public-sub-public/directives/copy'
import AddressCorrectionDialog from '@order-public-sub-public/components/business/address-correction/dialog/index.vue'
// import KySwipeCell from '@order-public-sub-public/components/ui/swipe-cell/index.vue'

import { computed, ref, watch } from 'vue'
import highlightText from '@order-global-package-order-sub/utils/highlightText'

import { clk_express_single_address_book_v1 } from '@order-public-sub-public/components/business/address-book/page/report/index'
import { showToast } from '@order-global-package-order-sub/hooks/useShowToast'
import { isNetworkQueryAddress } from '@order-public-sub-public/hooks/useGlobalVariable'
import {
  AddressTypeStr,
  Address,
  AddressCompleteFlag,
  CompleteAddressSceneType,
} from '@order-public-sub-public/constants'
import { updateAddress } from '@order-public-sub-public/apis/address'
import type { CompleteAddressResult } from '@order-public-sub-public/apis/address/types'
import { useCompleteAddress } from '@order-public-sub-public/components/business/address-correction/hooks/useCompleteAddress'
import { buildCompleteAddressParams } from '@order-public-sub-public/components/business/address-correction/utils'
import { formatDate } from '@order-public-sub-public/components/business/pickup-information/components/upload-file/utils'
import { useOrderExposureReport } from '@order-public-sub-public/report/exposureReport'
import KyReport from '@order-public-sub-public/components/base/ky-report/index.vue'
import umpOtherReport from '@order-public-sub-public/reportUmp/sceneReport/umpotherReport'

// useOrderExposureReport(['exp_express_ai_label_v1'])

const props = defineProps({
  showSaveAddressBookBtn: {
    default: () => false,
    type: Boolean,
  },
  showManage: {
    type: Boolean,
  },
  batchCanSelect: {
    type: Boolean,
  },
  keyword: {
    type: String,
    default: () => '',
  },
  item: {
    type: Object,
    default: () => ({}),
  },
  // item: any[]
  justAddedFlagId: {
    type: String,
  },
  batchSelectList: {
    type: Array,
  },
  addressType: {
    type: String,
  },
  shareAddressPermission: {
    type: String,
  },
  disabledSelectItem: {
    type: Boolean,
  },
  shareAddressAuth: {
    type: EAddressPermission,
  },
  isOperationLabel: {
    type: Boolean,
  },
})

const isTouch = ref(false)
const selectActive = ref(false)
const openId = ref('')

const swipeLock = ref(false)
const emit = defineEmits(['onDefault', 'onSelectItem', 'onDelete', 'onEdit', 'onSelectRadio'])

const onDefault = () => {
  try {
    clk_express_single_address_book_v1('设为默认')
  } catch (error) {
    console.log(error)
  }
  emit('onDefault')
}
// 禁用逻辑 删除 + 标签
// 删除时候用deleteFlag(false代表禁用) 标签的时候用 addressLabelAble（true代表禁用）
const disabledComp = computed(() =>
  props.isOperationLabel
    ? props.item?.addressLabelAble === true && props.showManage
    : !props.item.deleteFlag && props.showManage,
)

const onSelectItem = (bool?: boolean) => {
  try {
    if (bool) {
      clkReport(props.item, props.justAddedFlagId, props.addressType)
    }
  } catch (error) {
    console.log(error)
  }
  //#444281 PC小程序滑动时不允许选中
  if (swipeLock.value) {
    return
  }
  if (props.disabledSelectItem) {
    // 禁用点击
    return
  }
  selectActive.value = !selectActive.value
  emit('onSelectItem')
}

const open = (id: string) => {
  openId.value = id
  swipeLock.value = true
}

const close = () => {
  openId.value = ''
  swipeLock.value = false
}

const onDelete = () => {
  try {
    clk_express_single_address_book_v1('删除')
  } catch (error) {
    console.log(error)
  }
  // bug#447283
  if (disabledComp.value) {
    const tips = props.item?.cannotDeleteAbleTips || '此地址仅支持创建人删除'
    const tipsLabel = props.item?.cannotAddAddressLabelTips || '仅支持创建人加入地址标签'
    return showToast(props.isOperationLabel ? tipsLabel : tips)
  }
  emit('onDelete')
}

const onEdit = () => {
  try {
    clk_express_single_address_book_v1('编辑')
  } catch (error) {
    console.log(error)
  }
  emit('onEdit')
}

const timeFormat = (time: string) => {
  if (!time) return ''
  try {
    return formatDate(time, 'YYYY/MM/DD HH:mm') || ''
  } catch (error) {
    console.log(error)
    return ''
  }
}

/**
 * 是否显示创建信息
 *  1.个人中心入口
 *  2.共享地址权限
 *  3.寄件/收件
 */
const isShowCreateInfo = computed(() => {
  return (
    props.shareAddressAuth === EAddressPermission.有权限 &&
    [AddressTypeStr.SENDER, AddressTypeStr.RECEIVE].includes(props.addressType as AddressTypeStr) &&
    !props.batchCanSelect
  )
})

// const isChecked = (item: ListItem) => {
//   return props.batchSelectList.filter((e) => e.onlyMd5UniqueId === item.onlyMd5UniqueId).length > 0 || item.isSelectItem
// }
const onSelectRadio = (bool?: boolean) => {
  try {
    if (bool) {
      clkReport(props.item, props.justAddedFlagId, props.addressType)
    }
  } catch (error) {
    console.log(error)
  }
  if (disabledComp.value) {
    const tips = props.item?.cannotDeleteAbleTips || '此地址仅支持创建人删除'
    const tipsLabel = props.item?.cannotAddAddressLabelTips || '仅支持创建人加入地址标签'
    return showToast(props.isOperationLabel ? tipsLabel : tips)
  }
  selectActive.value = !selectActive.value
  emit('onSelectRadio')
}

// 固定电话和分机号
const telephone = computed(() => {
  let str = props.item?.telephone || ''
  if (str && props.item?.extension) {
    str = `${str}-${props.item?.extension}`
  }

  return str
})

const fullAddress = computed(() => {
  const { province, city, county, detailAddress } = props.item || {}
  return `${province || ''}${city || ''}${county || ''}${detailAddress || ''}`
})

const radioIcon = computed(() => {
  const item = props.item
  let iconName = item.isSelectItem ? 'radio-checked' : 'radio-unchecked'
  // bug#447283
  // iconName = !item.deleteFlag ? 'radio-disabled-unchecked' : iconName
  return iconName
})

// 地址待完善：addressCompleteFlag 为 10 时展示标签与完善按钮
const needCorrection = computed(() => props.item?.addressCompleteFlag === AddressCompleteFlag['待完善'])

// 把 addressType（'10' 寄件 / '20' 收件）转换为 dialog 需要的 'sender' / 'receive'
const correctionType = computed<'sender' | 'receive'>(() => {
  return props.addressType === Address.SENDER_ADDRESS_TYPE ? 'sender' : 'receive'
})

// 埋点：寄/收件来源识别类型
const recognitionType = computed(() => (correctionType.value === 'sender' ? '寄件' : '收件'))

// 地址校正弹窗按钮点击埋点
const reportCorrectionButtonClick = (buttonName: string) => {
  umpOtherReport(
    'CLK',
    { eventCode: 'clk_express_address_correction_confirm_button_v1' },
    { button_name: buttonName, waybill_number: '' },
  )
}

const onCorrectionConfirm = () => {
  reportCorrectionButtonClick('确定修改')
  onDialogConfirm()
}

const onCorrectionCancel = () => {
  reportCorrectionButtonClick('暂不修改')
  onDialogCancel()
}

/**
 * 隐藏"地址待完善"标签与完善按钮
 */
const hideCorrection = () => {
  props.item.addressCompleteFlag = ''
}

/**
 * 用完善地址接口返回的数据更新列表项地址
 */
const updateItemAddress = (suggested: CompleteAddressResult, fullAddress: string) => {
  props.item.province = suggested.province || props.item.province
  props.item.city = suggested.city || props.item.city
  props.item.county = suggested.county || props.item.county
  props.item.detailAddress = suggested.detailAddress || props.item.detailAddress
  props.item.fullAddress = fullAddress
}

// 地址校正公共流程
const {
  dialogVisible,
  currentAddress,
  suggestedAddress,
  modifying,
  trigger,
  onDialogConfirm,
  onDialogCancel,
} = useCompleteAddress({
  buildParams: () =>
    buildCompleteAddressParams({
      side: correctionType.value,
      sceneType: CompleteAddressSceneType.地址簿,
      source: props.item,
      addressId: props.item.id,
    }),
  onNoPopup: (res) => {
    // type=20 异常：兜底提示当前地址已完善，用接口返回的数据更新列表项，同时隐藏标签和完善按钮
    showToast('当前地址已完善')
    updateItemAddress(res.afterAddress || {}, res.afterAddress?.fullAddress || '')
    hideCorrection()
  },
  onConfirm: async (suggested, { close }) => {
    await updateAddress({
      addressType: props.addressType as string,
      id: props.item.id,
      person: props.item.person,
      mobile: props.item.mobile,
      telephone: props.item.telephone,
      extension: props.item.extension,
      companyName: props.item.companyName,
      province: suggested.province || props.item.province,
      city: suggested.city || props.item.city,
      county: suggested.county || props.item.county,
      detailAddress: suggested.detailAddress || props.item.detailAddress,
    })
    showToast('保存成功')
    // 用完善地址接口返回的数据更新列表项
    updateItemAddress(suggested, suggestedAddress.value)
    hideCorrection()
    close()
  },
})

// 点击完善：埋点后调用完善地址接口，正常返回弹出完善地址弹窗
const onCorrection = () => {
  try {
    clk_express_single_address_book_v1('完善')
  } catch (error) {
    console.log(error)
  }
  trigger()
}

const onCopyClick = () => {
  try {
    clk_express_single_address_book_v1('复制')
  } catch (error) {
    console.log(error)
  }
}

const copyEnd = () => {
  try {
    clk_express_single_address_book_v1('复制')
  } catch (error) {
    console.log(error)
  }
}

// 复制
const onCopy = (item) => {
  const { person, mobile, companyName } = item || {}
  const parts = []
  if (person) parts.push(person)
  if (mobile) parts.push(mobile)
  if (telephone.value) parts.push(telephone.value)
  if (companyName) parts.push(companyName)
  if (fullAddress.value) parts.push(fullAddress.value)

  return parts.join('\n')
}
/**
 * @description: 禁用滑动删除
 */
const disabledSwipe = computed(() => {
  return props?.shareAddressPermission === EAddressPermissionTab.共享地址 || isNetworkQueryAddress.value
})
</script>

<style lang="scss">
@import '@order-global-package-order-sub/styles/index.scss';
@import './index.scss';
</style>
