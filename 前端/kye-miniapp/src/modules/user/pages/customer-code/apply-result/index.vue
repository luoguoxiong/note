<template>
  <view class="apply-bind-result">
    <!-- 头部状态区域 -->
    <view class="apply-bind-result__header">
      <view class="staus">
        <image :src="statusIconUrl" class="icon" mode="aspectFit" />
        <view class="text">{{ statusText }}</view>
      </view>
      <view class="apply-tip">{{ applyText }}</view>
    </view>

    <!-- 专属商务信息卡片 -->
    <view class="apply-bind-result__body" v-if="loading">
      <view class="title">专属商务</view>
      <view class="content" v-if="dataInfo.name">
        <view class="content__left">
          <image
            src="https://ic-img.ky-express.com/netc/20260630_7115_!!1782819432212_192_192.png"
            class="icon_service"
            mode="aspectFit"
          />
          <view class="info">
            <view class="name">{{ dataInfo.name }}</view>
            <view class="company">{{ dataInfo.customerName }}</view>
          </view>
        </view>
        <view class="content__right">
          <view class="item margin_sty" @tap="goWxPage">
            <view class="icon-bswechat"></view>
            <view class="label">企业微信</view>
          </view>
          <view class="item" @tap="goContact">
            <view class="icon-phone"></view>
            <view class="label">联系商务</view>
          </view>
        </view>
      </view>
      <view class="content" v-else>
        <view class="content__left">
          <image
            src="https://ic-img.ky-express.com/netc/20260630_7115_!!1782819432212_192_192.png"
            class="icon_service"
            mode="aspectFit"
          />
          <view class="empty-text">当前绑定公司暂未维护专属商务，请拨打95324咨询~~</view>
        </view>
        <view class="content__right">
          <view class="item" @tap="call">
            <image
              src="https://ic-img.ky-express.com/netc/20260122_68472_!!1769052510650_176_176.png"
              class="icon"
              mode="aspectFit"
            />
            <view class="label">拨打95324</view>
          </view>
        </view>
      </view>
    </view>

    <!-- 底部按钮 -->
    <view class="apply-bind-result__footer" @tap="goBack">
      <ky-button class="back-button" type="primary" size="large">{{ buttonText }}</ky-button>
    </view>

    <!-- 联系商务 -->
    <ContactBusiness
      v-model:show="showContact"
      :phone="userInfo?.phone || ''"
      :hideNeedClose="false"
      :offset-bottom="isH5Env ? 50 : 0"
    ></ContactBusiness>
  </view>
</template>

<script setup lang="ts">
/**
 * 客户编码申请绑定结果页面
 *
 * 从 H5 项目 (netc-h5-modules) 迁移的结果页
 * 功能：
 * - 显示申请状态（已提交成功/等待审批中）
 * - 显示专属商务信息（姓名、公司、联系方式）
 * - 提供联系商务的方式（企业微信、电话）
 * - 支持虚拟号拨打和实名认证跳转
 *
 * 转换要点：
 * - van-button → ky-button (KYE MiniUI组件库)
 * - contact-business → ky-popup (简化版弹窗)
 * - vue-router → Taro 路由系统
 * - window.location.href → Taro.makePhoneCall
 * - Toast from vant → showToast from @tarojs/taro
 */
import plateform from '@kye-netc/plateform'
import { ref, computed, onMounted } from 'vue'
import Taro, { useRouter } from '@tarojs/taro'
import { isH5Env } from '@/public/utils'
import { showToast } from '@tarojs/taro'
import { getVirtualNum, getOtherBindVirtualNum, applyResultCallPhoneReportApi } from '@modules/user/apis/customerCode'
import { useUserGlobalStore } from '@/store/user'
import ContactBusiness from '@/public/components/business/contact-business/index.vue'
import './index.scss'
import { getApplyStatusText } from '../constants/utils'
import {
  exp_page_customer_code_bind_other_company_sub,
  clk_customer_code_bind_other_company_sub_button,
} from '../report/index'

interface DataInfo {
  name?: string
  customerName?: string
  wechat?: string
  virtualNum?: string
  needRealName?: boolean
}

// const instance = getCurrentInstance()
const router = useRouter()
const params = router?.params || {}

const userStore = useUserGlobalStore()
const userInfo = userStore.userInfo

const showContact = ref(false)
const text = ref('联系商务')
const applyStatus = params.applyStatus || '0'
const { statusIconUrl, statusText } = getApplyStatusText({ applyStatus: params.applyStatus })

// 1：绑定客户编码 2:添加客户编码 3:更换客户编码 4:切换客户编码
const title = params.title || '3'

const dataInfo = ref<DataInfo>({})

const loading = ref(false)
const realNameUrl = ref('')

/** 用户手机号 */
const phone = ref('')

/**
 * 申请提示文本
 */
const applyText = computed(() => {
  return applyStatus == '0'
    ? '您已提交申请，请等待跨越审核，如需了解审批进度详询商务'
    : '请等待跨越审核，如需了解审批进度详询商务'
})

/**
 * 当前路径（用于埋点）
 */
const currentPath = computed(() => {
  return applyStatus == '0' ? '申请成功' : '等待审批'
})

/**
 * 按钮文本
 */
const buttonText = computed(() => {
  switch (+title) {
    case 1:
      return '返回绑定客户编码'
    case 2:
      return '返回添加客户编码'
    case 3:
      return '返回更换客户编码'
    case 4:
      return '返回切换客户编码'
    default:
      return '返回更换客户编码'
  }
})

/**
 * 格式化手机号显示
 */
const formatterPhone = (tel: string): string => {
  if (!tel) return ''
  return tel.replace(/[^\d]/g, '').replace(/(^\d{3})(\d{0,4})(\d{0,4})/, (_value, $1, $2, $3) => {
    return $3 ? `${$1} ${$2} ${$3}` : $2 ? `${$1} ${$2}` : `${$1}`
  })
}

/**
 * 拨打95324客服电话
 */
const call = () => {
  clk_customer_code_bind_other_company_sub_button('拨打95324', currentPath.value)

  plateform.makePhoneCall({ phoneNumber: '95324' })
}

/**
 * 跳转到企业微信二维码页面
 */
const goWxPage = () => {
  const workId = params.workId || ''

  clk_customer_code_bind_other_company_sub_button('企业微信', currentPath.value, workId)

  Taro.navigateTo({
    url: `/modules/user/pages/customer-code/apply-result/wechatwork-qrcode?imgUrl=${encodeURIComponent(dataInfo.value.wechat || '')}&customerName=${encodeURIComponent(userInfo.customerShortName || '')}&openKsNotice=true&workId=${workId}`,
  })
}

// 跨声消息异步调用(企业微信/电话联系)
const handleApproveAssAccount = () => {
  applyResultCallPhoneReportApi({
    customerName: dataInfo.value?.customerName,
  })
}

/**
 * 打开联系商务弹窗
 */
const goContact = () => {
  const workId = params.workId || ''

  clk_customer_code_bind_other_company_sub_button('联系商务', currentPath.value, workId)
  handleApproveAssAccount()
  showContact.value = true
}

/**
 * 返回上一页
 */
const goBack = () => {
  const workId = params.workId || ''

  clk_customer_code_bind_other_company_sub_button(buttonText.value, currentPath.value, workId)

  Taro.navigateBack({ delta: 1 })
}

/**
 * 获取虚拟号并处理拨打逻辑
 *
 * @param outPhone - 对方手机号
 * @param isCall - 是否立即拨打
 */
const handleMethod = async (outPhone: string, isCall: boolean) => {
  showToast({ title: '加载中', icon: 'loading', duration: 2000 })

  try {
    const { data } = await getOtherBindVirtualNum({
      outPhone,
      // customer: userInfo.customerCode,
      needVerifyAuthName: true,
    })

    dataInfo.value = data || {}

    if (isCall) {
      // 需要实名认证时跳转
      if (data?.needRealName) {
        showToast({ title: '需要实名认证后才能拨打', icon: 'none' })
        // TODO: 跳转实名认证页面
        // Taro.navigateTo({
        //   url: `/pages/real-name/index?phone=${outPhone}`,
        // })
        return
      }

      // 拨打虚拟号
      const virtualNum = data?.virtualNum || '95324'
      plateform.makePhoneCall({ phoneNumber: virtualNum })

      showContact.value = false
    }
  } catch (error: any) {
    console.error('获取虚拟号失败:', error)

    if (isCall) {
      // 使用默认号码拨打
      plateform.makePhoneCall({ phoneNumber: '95324' })
      showContact.value = false
    } else {
      showToast({ title: error.message || '获取信息失败', icon: 'none' })
    }
  } finally {
    loading.value = true
  }
}

/**
 * 页面初始化
 */
onMounted(async () => {
  console.log(params, 'params', userStore)
  try {
    showToast({ title: '加载中', icon: 'loading', duration: 2000 })

    if (userInfo && userInfo.phone) {
      phone.value = userInfo.phone
      await handleMethod(userInfo.phone, false)
    }

    const workId = params.workId || ''
    // 页面曝光埋点
    exp_page_customer_code_bind_other_company_sub(workId || undefined, applyStatus == '0' ? '申请成功' : '等待审批')
  } catch (error: any) {
    showToast({ title: error.message || '加载数据失败', icon: 'none' })
  }
})
</script>
