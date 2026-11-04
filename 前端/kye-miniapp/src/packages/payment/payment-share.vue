<template>
  <view class="payment-share">
    <view class="payment-share__warpper">
      <view class="payment-share__logo">
        <image src="https://ic-img.ky-express.com/netc/20230925_54221882348_!!1695651665110_388_96.png" />
      </view>
      <view class="payment-share__title">您有一条付款授权申请待处理</view>
      <view class="payment-share__btn">
        <image @tap="handleClick" :src="`${IMG_BASE_URL}/payment-auth-btn.png`" />
        <image @tap="handleClick" :src="`${IMG_BASE_URL}/payment-bixin.gif`" />
      </view>
    </view>
    <ShareAlert :show="isShowAlert" v-bind="alert" />
  </view>
</template>

<script setup>
import { ref } from 'vue'
import Taro, { useRouter, useShareAppMessage } from '@tarojs/taro'
import ShareAlert from './components/alert.vue'
import { useLogin } from '@/public/hooks'
import { openLoginPage } from '@/public/utils/request/useLogOutTip/openLogin'
import { useBindCustomer } from '@/public/hooks/useBindCustomer'
import { payAuthShareCheck } from './api/index'
import './payment-share.scss'

const IMG_BASE_URL = 'https://ic-h5.kye-erp.com/intro/miniprogram'

defineOptions({ name: 'PaymentShare' })

// 获取路由参数
const router = useRouter()
const params = router.params
// 响应式数据
const alert = ref({})
const isShowAlert = ref(false)
const showCustomerCode = ref(false)

const { isLogin } = useLogin()
const { openCustomerPage } = useBindCustomer()

// 分享配置
useShareAppMessage(() => {
  if (params.batchNo) {
    return {
      title: '您有一条付款授权申请待处理',
      path: `packages/payment/payment-share?batchNo=${params.batchNo}&ksPhone=${params.ksPhone}`,
      imageUrl: 'https://ic-h5.kye-erp.com/intro/miniprogram/share_payment.png',
    }
  } else {
    return {
      title: '您有一条付款授权申请待处理',
      path: `packages/payment/payment-share?authId=${params.authId}`,
      imageUrl: 'https://ic-h5.kye-erp.com/intro/miniprogram/share_payment.png',
    }
  }
})

// 分享去授权
const handleClick = () => {
  if (!isLogin.value) {
    openLoginPage()
    return
  }

  Taro.showLoading({ mask: true, title: '加载中...' })

  payAuthShareCheck({
    id: params.authId,
  })
    .then(({ data }) => {
      if (data.checkResult === 0) {
        Taro.hideLoading()
        Taro.redirectTo({
          url: `/modules/user/pages/payment-approve/index?authId=${params.authId}&ksPhone=${params.ksPhone || ''}&isKs=${!!params.batchNo}`,
        })
      } else if (data.checkResult === 1) {
        // 没有审批权限（去分享）
        Taro.hideLoading()
        isShowAlert.value = true
        alert.value = {
          title: '温馨提示',
          content: data.tips,
          confirmButtonText: '去分享',
          cancelButtonText: '取消',
          showShare: true,
          onCancel: () => {
            isShowAlert.value = false
          },
        }
      } else if (data.checkResult === 2) {
        // 未绑码
        Taro.hideLoading()
        isShowAlert.value = true
        alert.value = {
          title: '温馨提示',
          content: data.tips,
          confirmButtonText: '去绑码',
          cancelButtonText: '取消',
          showShare: false,
          onCancel: () => {
            isShowAlert.value = false
          },
          onConfirm: () => {
            isShowAlert.value = false
            showCustomerCode.value = true
          },
        }
      } else if (data.checkResult === 3) {
        // 未绑定付款方
        Taro.hideLoading()
        isShowAlert.value = true
        alert.value = {
          title: '温馨提示',
          content: data.tips,
          confirmButtonText: '去绑码',
          cancelButtonText: '取消',
          showShare: false,
          onCancel: () => {
            isShowAlert.value = false
          },
          onConfirm: () => {
            isShowAlert.value = false
            openCustomerPage()
          },
        }
      }
    })
    .catch((err) => {
      Taro.hideLoading()
      Taro.showToast({ icon: 'none', title: err.msg || '服务错误' })
    })
}
</script>
