<template>
  <!--  切换客户手机号弹窗  -->
  <ky-popup
    v-model:show="show"
    :closeOnClickOverlay="false"
    @click="handleClose"
    :class="`${classPrefix} user-bottom-popup`"
    :style="{ maxHeight: isH5FSEnv ? '100%' : '80%' }"
    safeAreaInsetBottom
    position="bottom"
  >
    <view :class="`${classPrefix}__header`">
      <view :class="`${classPrefix}__header-title`">切换客户手机号</view>
      <view :class="`${classPrefix}__header-close`" @click="handleClose">
        <view class="close-icon"></view>
      </view>
    </view>

    <view :class="`${classPrefix}__content container`">
      <view :class="`${classPrefix}__form`" id="white-input">
        <view :class="`${classPrefix}__form--label`">填写手机号</view>
        <view :class="[`${classPrefix}__form--value`, validPopoverShow && `${classPrefix}__form--error`]">
          <ky-input
            v-model="inputPhone"
            placeholder="填写客户手机号查看数据"
            :maxlength="11"
            type="number"
            @blur="onBlur"
            @clear="onBlur"
            @input="onInput"
            :cursor-spacing="180 + Math.ceil(whiteList.length / 3) * 60"
          ></ky-input>
          <!--          <ky-popover-->
          <!--            ref="popoverValid"-->
          <!--            location="bottom-left"-->
          <!--            :show="validPopoverShow"-->
          <!--            theme="dark"-->
          <!--            listenClickId="globalClickId"-->
          <!--            v-if="show"-->
          <!--          >-->
          <!--            <template #reference>-->
          <!--              <ky-input-->
          <!--                v-model="inputPhone"-->
          <!--                placeholder="填写客户手机号查看数据"-->
          <!--                maxLength="11"-->
          <!--                type="number"-->
          <!--                @blur="onBlur"-->
          <!--                @clear="onBlur"-->
          <!--              ></ky-input>-->
          <!--            </template>-->
          <!--            <template #content>-->
          <!--              <view>{{ validPopoverContent }}</view>-->
          <!--            </template>-->
          <!--          </ky-popover>-->
        </view>
      </view>
      <view :class="`${classPrefix}__form--popover-error`">
        {{ validPopoverContent }}
      </view>
      <view v-if="whiteList.length" :class="`${classPrefix}__list`">
        <view :class="`${classPrefix}__list--title`">历史填写手机号</view>
        <view :class="`${classPrefix}__list--list`">
          <view
            v-for="(item, index) in whiteList"
            :key="index"
            :class="[`${classPrefix}__list--item`, checkedItem?.phone === item?.phone ? 'checked-item' : '']"
            @click="() => handleClickItem(item)"
          >
            <view>
              <view>{{ item.phone }}</view>
              <view>{{ item.customerShortName || '' }}</view>
            </view>
          </view>
        </view>
      </view>
    </view>

    <view :class="`${classPrefix}__footer`" @click="handleConfirm">
      <ky-button type="primary" size="large">确定</ky-button>
    </view>
  </ky-popup>
</template>

<script setup lang="ts">
import './index.scss'
import { ref, watch } from 'vue'
import Taro from '@tarojs/taro'
import { getLoginFromType } from '@public/constants'
import { loginSuccess } from '@modules/user/pages/login/service'
import { ssoChangeAccountLoginApi } from '@modules/setting/apis'
import useWhiteListValid from '@modules/setting/pages/index/components/white-list/useWhiteListValid'
import { triggerSwitchUserChange } from '@public/storage'
import { isH5FSEnv } from '@/public/utils'

const classPrefix = 'user-white-list'

const show = ref<boolean>(false)
const whiteList = ref<Array<{ phone: string; customerShortName?: string }>>(Taro.getStorageSync('white-list') || [])
const checkedItem = ref({})
const inputPhone = ref('')
// const popoverValid = ref()
const emit = defineEmits(['onConfirm', 'onCancel'])

const { validPopoverShow, validPopoverContent, handleValidPopover, validPopoverSet, handleValidPopoverClear } =
  useWhiteListValid()
/* 失去焦点事件 - 支付宝存在兼容问题,待公共组件修复 */
const onBlur = () => {
  handleValidPopoverClear()
}

const rpxToPx = (val: number) => {
  const windowWidth = Taro.getSystemInfoSync().windowWidth
  const rpx = windowWidth / 750
  return val / rpx
}

const onInput = () => {
  if (validPopoverShow.value) {
    handleValidPopoverClear()
  }
}

/* 关闭popup */
const handleClose = () => {
  emit('onCancel')
  closeDialog()
  handleDialogRest()
}

// const handleShowPopover = () => {
//   popoverValid.value?.showPopover('popoverValid', {
//     location: 'bottom',
//     theme: 'dark',
//   })
// }
/* 触发确定  */
const handleConfirm = async () => {
  const valid = handleValidPopover(inputPhone.value)
  if (!valid) {
    // handleShowPopover()
    return
  }

  Taro.showLoading({ mask: true, title: '加载中...' })
  handleWhiteListRecord({})
  try {
    const data = await ssoChangeAccountLogin(inputPhone.value)
    handleWhiteListRecord(data)
    closeDialog()
    emit('onConfirm')
  } catch (e) {
    if (e && e.code !== 100201 && e.msg) {
      validPopoverSet(e.msg)
    }
    console.log(e)
  } finally {
    setTimeout(() => {
      Taro.hideLoading()
    }, 1000)
  }
}

/* 切换客户手机登录 */
const ssoChangeAccountLogin = (borrowTelNo) => {
  return new Promise(async (resolve, reject) => {
    try {
      const from = getLoginFromType()
      const { code, data } = await ssoChangeAccountLoginApi({
        loginRequest: {
          from,
        },
        from,
        borrowTelNo,
      })
      if (code !== 0) {
        reject(data)
      }
      if (data) {
        await loginSuccess(data as any)
        // 全局通知-切换用户手机
        triggerSwitchUserChange(data)
      }
      resolve(data)
    } catch (e) {
      reject(e)
    }
  })
}

/* 切换历史选中 */
const handleClickItem = (item) => {
  inputPhone.value = item?.phone
  checkedItem.value = item
}
/* 记录白名单历史-本地缓存 */
const handleWhiteListRecord = (res) => {
  let list = []
  whiteList.value?.forEach((item) => {
    if (item.phone !== inputPhone.value) {
      list.push(item)
    }
  })
  if (list.length === whiteList.value.length) {
    if (list.length >= 12) {
      list.slice(0, -1)
    }
  }
  list.unshift({
    phone: inputPhone.value,
    customerCode: res?.customerCode || '',
    customerShortName: res?.customerShortName || '',
  })
  Taro.setStorageSync('white-list', list)
}
/* 弹窗重置 */
const handleDialogRest = () => {
  handleValidPopoverClear()
  inputPhone.value = ''
}

/* 关闭底部弹窗 */
const closeDialog = () => {
  show.value = false
  inputPhone.value = ''
  checkedItem.value = {}
}

/* 打开底部弹窗 */
const openDialog = () => {
  show.value = true
}
defineExpose({
  openDialog,
})
</script>
