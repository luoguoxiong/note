<template>
  <view class="scan-code">
    <view v-if="!isLoading" class="scan-code__wrapper">
      <!-- 内容 -->
      <view class="scan-code__content">
        <!-- 背景图 -->
        <image
          v-if="isQrCodeValid && isBindSuc && userInfo.customerShortName"
          class="scan-code__bgImage"
          src="https://ic-img.ky-express.com/netc/20221228_4596384140_!!1672216606059_1356_516.png"
        />
        <image
          v-else
          class="scan-code__bgImage"
          src="https://ic-img.ky-express.com/netc/20221228_56163841470_!!1672216599969_1356_516.png"
        />

        <!-- 二维码有效 绑定成功信息 -->
        <view v-if="isQrCodeValid && isBindSuc && userInfo.customerShortName" class="scan-code__box">
          <view class="scan-code__login-account">您的登录账号</view>
          <view class="scan-code__phoneNumber">{{ filterPhone() }}</view>

          <view
            v-if="userInfo.customerCode && userInfo.customerCode !== customerCode"
            class="scan-code__textWrap t_a_c f_w_400 f_s_32 scan-code__texts"
          >
            由
            <text class="c_333 f_w_600 m_l_12 m_r_24">
              {{ userInfo.customerShortName || '' }}
            </text>
            换绑为
            <text class="c_333 f_s_32 f_w_600 m_l_24">
              {{ userInfo.customerShortName || '' }}
            </text>
          </view>
          <view v-else class="scan-code__textWrap t_a_c f_w_400 f_s_32 scan-code__text">
            已成功绑定
            <text class="c_333 f_w_600 m_l_24">{{ userInfo.customerShortName || '' }}</text>
          </view>
        </view>

        <!-- 失效二维码 | 绑定失败 -->
        <view v-else class="scan-code__failWrap">
          <image
            class="qrImage"
            src="https://ic-img.ky-express.com/netc/20221224_726384143_!!1671870917440_656_656.png"
          />
          <view :class="`vaildText ${!userInfo.customerShortName ? 'alignCenter' : ''}`"> 二维码已失效 </view>
          <view class="contactText">
            {{
              userInfo.customerShortName
                ? `您当前已绑定【${userInfo.customerShortName}】可以点击去寄件或联系商务重新获取二维码`
                : '可联系商务重新获取'
            }}
          </view>
        </view>
      </view>

      <!-- 按钮 -->
      <view v-if="!userInfo.customerShortName" class="scan-code__footer">
        <view class="scan-code__btn" @click="toContact"> 联系商务 </view>
      </view>
      <view v-else class="scan-code__footer pd60">
        <view class="scan-code__btn" @click="handleGoHome"> 去寄件 </view>
        <!-- 失效二维码 | 有效二维码绑定失败 -->
        <view
          v-if="(!isQrCodeValid || (isQrCodeValid && !isBindSuc)) && userInfo.customerShortName"
          class="contactBtn"
          @click="toContact"
        >
          <image
            class="phoneIcon"
            src="https://ic-img.ky-express.com/netc/20221210_84763841458_!!1670643995829_144_144.png"
          />
          联系商务
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue'
import Taro, { useDidShow, useRouter } from '@tarojs/taro'
import { useBindCustomer } from '@/public/hooks/useBindCustomer'
import { useUserInfo } from '@/public/hooks'
import { bindCodeToScanCRMQrcode, getAppletQrcodeParameter, getBindCustomerVirtualMobile } from '../api'
import { useGeneralDataHook } from '@public/storage/hooks/useGeneralDataHook'
import { useAutoLogin } from '@/public/utils/user/useAutoLogin'
import { getToken } from '@/public/storage'
import kyeNavigate from '@/public/utils/native/navigate'
import './index.scss'

defineOptions({ name: 'ScanCodeNew' })

const params = useRouter().params

// 响应式数据
const isLoading = ref(true)
const isBindSuc = ref(false) // 是否绑定成功
const isQrCodeValid = ref(false) // 二维码是否有效
const virtualContactPhone = ref('') // 联系电话
const customerCode = ref('') // 需换绑的客户编码

const { customerInfo } = useBindCustomer()
const { userInfo } = useUserInfo()
const { fetchGlobalData } = useGeneralDataHook()
const { autoLoginHook } = useAutoLogin()

// 失效二维码逻辑
const handleInvalidQrCode = async (appletId) => {
  getVirtualContactPhone(appletId)
  isQrCodeValid.value = false
  Taro.hideLoading()
  isLoading.value = false
}

// 绑定客户编码
const bindScanCRMQrcode = (val) => {
  Taro.removeStorageSync('configdata')
  Taro.showLoading({ mask: true, title: '加载中...' })

  bindCodeToScanCRMQrcode({ customerCode: val })
    .then(async () => {
      await fetchGlobalData()
      isBindSuc.value = true
      // 加载完成
      Taro.hideLoading()
      isLoading.value = false
    })
    .catch((err) => {
      isBindSuc.value = false
      if (err.code !== 100201) {
        Taro.showModal({
          title: '温馨提示',
          content: err.message || '当前绑定客户编码失败',
          showCancel: false,
          confirmText: '知道了',
        })
      }
      // 加载完成
      Taro.hideLoading()
      isLoading.value = false
    })
}

// 页面初始化逻辑
const initPage = async () => {
  if (userInfo.value.phone) {
    Taro.showLoading({ mask: true, title: '加载中...' })
    isLoading.value = true

    const scene = decodeURIComponent(params.scene).split(',')
    const appletId = scene[0]

    // 获取扫取的二维码参数
    getAppletQrcodeParameter({
      appletId,
      appletMd5: scene[1],
    })
      .then(async ({ data }) => {
        // 有效二维码
        isQrCodeValid.value = true
        // 获取扫码的客户编码
        let qrCodeData = data.urlParameter.find((item) => item.key === 'CustomerCode' || item.key === 'customerCode')
        customerCode.value = qrCodeData.value

        // 获取已绑定的客户编码
        let dataBinded = customerInfo.value
        if (dataBinded) {
          // 已绑定的数据
          userInfo.value = dataBinded
          // 要换绑的数据

          if (dataBinded.customerCode === qrCodeData.value) {
            // 当前绑定的客户编码等于扫取的客户编码
            isBindSuc.value = true
            // 加载完成
            Taro.hideLoading()
            isLoading.value = false
            return
          }
        }
        // 去绑定要更换的客户编码
        bindScanCRMQrcode(qrCodeData.value)
      })
      .catch(async () => {
        // 失效二维码
        handleInvalidQrCode(appletId)
      })
  }
}

// 获取联系商务电话
const getVirtualContactPhone = (appletId) => {
  getBindCustomerVirtualMobile({ appletId })
    .then(({ data }) => {
      if (data) {
        const phone = data.virtualPhone || ''
        virtualContactPhone.value = phone
      } else {
        virtualContactPhone.value = '95324'
      }
    })
    .catch(() => {
      virtualContactPhone.value = '95324'
    })
}

// 去联系商务
const toContact = () => {
  wx.makePhoneCall({
    phoneNumber: virtualContactPhone.value,
  })
}

// 格式化手机号
const filterPhone = () => {
  let phone = userInfo.value.phone
  return phone ? phone.substring(0, 3) + ' ' + phone.substring(3, 7) + ' ' + phone.substring(7) : ''
}

// 页面显示时执行
useDidShow(async () => {
  if (!getToken()) {
    await autoLoginHook({ needLogin: true })
    return
  }
  initPage()
})

function handleGoHome() {
  kyeNavigate.navigateBefore('navigateTo', {
    url: '/modules/order-build/pages/order/index',
  })
}
</script>
