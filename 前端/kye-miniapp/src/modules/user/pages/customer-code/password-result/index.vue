<template>
  <view class="result-wrap">
    <!-- 头部状态区域 -->
    <view class="result-wrap__header">
      <view class="staus">
        <image :src="statusIconUrl" class="icon" mode="aspectFit"></image>
        <view class="text">{{ statusText }}</view>
      </view>
      <view class="apply-tip">{{ applyText }}</view>
    </view>

    <!-- 审批人信息卡片 -->
    <view class="result-wrap__body">
      <view class="approver-card">
        <view class="identity">{{ dataInfo.role === '商务' ? '专属商务' : dataInfo.role || '' }}</view>
        <view class="content">
          <view class="content__left">
            <image
              src="https://ic-img.ky-express.com/netc/20260630_36642_!!1782797091977_192_192.png"
              class="icon_head"
              mode="aspectFill"
            ></image>
            <view class="info">
              <view class="name">{{ dataInfo.name || '' }}</view>
              <view class="company">{{ dataInfo.customerName || '' }}</view>
            </view>
          </view>
          <view class="content__right" @tap="handleContact">
            <!-- https://ic-img.ky-express.com/netc/20260630_5389_!!1782796679954_88_88.svg+xml -->
            <image
              src="https://ic-img.ky-express.com/netc/20260714_48619_!!1784028686328_176_176.png"
              class="icon_phone"
              mode="aspectFit"
            ></image>
            <view class="text">{{ isBusiness ? '联系商务' : '联系他' }}</view>
          </view>
        </view>
      </view>
    </view>

    <!-- 底部按钮 -->
    <view class="result-wrap__footer">
      <ky-button class="back-button" type="primary" size="large" @click="handleBack">
        {{ buttonText }}
      </ky-button>
    </view>

    <!-- 联系商务弹窗 -->
    <!-- <ky-popup
      :show="showContactPopup"
      position="bottom"
      round
      :close-on-click-overlay="true"
      @close="showContactPopup = false"
    >
      <view class="contact-popup">
        <view class="contact-popup__title">{{ isBusiness ? '联系商务' : '联系他' }}</view>

        <view class="contact-popup__phone">
          <text class="label">联系电话</text>
          <text class="phone">{{ formatterPhone(phone) }}</text>
        </view>

        <view class="contact-popup__actions">
          <ky-button class="action-btn" type="primary" size="large" @tap="handleCallPhone"> 拨打电话 </ky-button>
        </view>
      </view>
    </ky-popup> -->
    <!-- 联系商务 -->
    <ContactBusiness
      v-model:show="showContactPopup"
      :roleName="isBusiness ? '商务' : '他'"
      :phone="userInfo?.phone || ''"
      :hideNeedClose="false"
      :managerInfo="dataInfo"
      :offset-bottom="isH5Env ? 50 : 0"
      @editPhone="editPhone"
      @toCall="toCall"
      @change="handleContactBusinessChange"
    ></ContactBusiness>
  </view>
</template>

<script setup lang="ts">
/**
 * 密码申请结果页面 - 申请结果展示
 *
 * 从 H5 项目 (netc-h5-modules) 迁移的结果页
 * 功能：显示申请状态、审批人信息、联系方式
 *
 * 转换要点：
 * - van-button → ky-button (miniUI组件库)
 * - contact-business → ky-popup (简化版)
 * - vue-router → Taro 路由
 * - window.location.href → Taro.makePhoneCall
 */
import { ref, computed, onMounted } from 'vue'
import Taro, { getCurrentInstance } from '@tarojs/taro'
import { showToast } from '@tarojs/taro'
import { getVirtualNum } from '@modules/user/apis/customerCode'
import { isH5Env } from '@/public/utils'
import { useUserGlobalStore } from '@/store/user'
import ContactBusiness from '../components/contact-business/index.vue'
import './index.scss'
import { getApplyStatusText } from '../constants/utils'
import {
  exp_customer_code_password_page,
  other_customer_code_password_apply_success,
  clk_customer_code_password_sub_button,
  clk_customer_code_call_popup,
  clk_customer_code_password_business_popup_button,
  setExpressType,
} from '../report/index'

interface DataInfo {
  role?: string
  name?: string
  customerName?: string
  wechat?: string
  virtualNum?: string
  needRealName?: boolean
}

// interface Props {
//   /** 页面类型: 1=绑定, 2=添加, 3=更换, 4=切换 */
//   title?: string | number
//   /** 申请状态: 0=新申请, 其他=等待审批 */
//   applyStatus?: string | number
//   /** 客户编码 */
//   customerCode?: string
// }

// const props = withDefaults(defineProps<Props>(), {
//   title: '1',
//   applyStatus: '',
//   customerCode: '',
// })

const emit = defineEmits<{
  (e: 'back'): void
}>()

const instance = getCurrentInstance()
const router = instance.router
const params = router?.params || {}

const { statusIconUrl, statusText } = getApplyStatusText({ applyStatus: params.applyStatus })

const userStore = useUserGlobalStore()
const userInfo = userStore.userInfo
/** 审批人信息 */
const dataInfo = ref<DataInfo>({})

/** 是否显示联系弹窗 */
const showContactPopup = ref(false)

/** 用户手机号（用于获取虚拟号） */
const phone = ref('')

/** 实名认证URL */
const realNameUrl = ref('')

/**
 * 按钮文本
 */
const buttonText = computed(() => {
  switch (+params.title) {
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
 * 申请提示文本
 */
const applyText = computed(() => {
  if (params.applyStatus == 0) {
    // 第一次申请
    return `请等待${dataInfo.value.role || ''}${dataInfo.value.name || ''}审批，审批通过后将帮您绑定${
      dataInfo.value.customerName || ''
    }公司`
  } else {
    return `您已提交申请，${dataInfo.value.role || ''}尚未审批，可联系${dataInfo.value.role || ''}${
      dataInfo.value.name || ''
    }帮您审批`
  }
})

/**
 * 是否是商务
 */
const isBusiness = computed(() => {
  return dataInfo.value.role === '商务'
})

/**
 * 格式化手机号
 */
const formatterPhone = (tel: string): string => {
  if (!tel) return ''
  return tel.replace(/[^\d]/g, '').replace(/(^\d{3})(\d{0,4})(\d{0,4})/, (_value, $1, $2, $3) => {
    return $3 ? `${$1} ${$2} ${$3}` : $2 ? `${$1} ${$2}` : `${$1}`
  })
}

/**
 * 处理返回操作
 */
const handleBack = () => {
  clk_customer_code_password_sub_button(buttonText.value, params.applyStatus == 0 ? '提交成功' : '审核中')

  emit('back')
  Taro.navigateBack({ delta: 1 })
}

/**
 * 打开联系弹窗
 */
const handleContact = () => {
  showContactPopup.value = true

  clk_customer_code_password_sub_button(
    isBusiness.value ? '联系商务' : '联系他',
    params.applyStatus == 0 ? '提交成功' : '审核中',
  )
}

/** 联系商务弹窗关闭回调 */
const handleContactBusinessChange = (val: boolean) => {
  if (!val) {
    if (isBusiness.value) {
      clk_customer_code_password_business_popup_button('关闭')
    } else {
      clk_customer_code_call_popup('关闭', '忘记客户编码页')
    }
  }
}

/**
 * 联系商务弹窗拨打回调
 */
const toCall = () => {
  if (isBusiness.value) {
    clk_customer_code_password_business_popup_button('拨打')
  } else {
    clk_customer_code_call_popup('拨打', '忘记客户编码页')
  }
}

/**
 * 联系商务弹窗编辑号码回调
 */
const editPhone = () => {
  if (isBusiness.value) {
    clk_customer_code_password_business_popup_button('修改')
  } else {
    clk_customer_code_call_popup('修改', '忘记客户编码页')
  }
}
/**
 * 拨打电话
 */
const handleCallPhone = async () => {
  if (!phone.value) {
    showToast({ title: '请先登录', icon: 'none' })
    return
  }

  const cleanPhone = phone.value.replace(/\s/g, '')

  try {
    // TODO: 显示加载状态
    // Toast.loading('加载中')

    const { data } = await getVirtualNum({
      outPhone: cleanPhone,
      customer: params.customerCode,
      needVerifyAuthName: true,
    })

    dataInfo.value = data || {}

    // 如果需要实名认证
    if (data?.needRealName) {
      showToast({ title: '需要实名认证后才能拨打', icon: 'none' })
      // TODO: 跳转实名认证页面
      // Taro.navigateTo({ url: `${realNameUrl.value}?phone=${cleanPhone}` })
      return
    }

    // 拨打虚拟号
    const virtualNum = data?.virtualNum || '95324'
    Taro.makePhoneCall({
      phoneNumber: virtualNum,
      success: () => {
        console.log('拨打成功')
      },
      fail: (err) => {
        console.log('拨打失败:', err)
        showToast({ title: '拨打失败', icon: 'none' })
      },
    })

    showContactPopup.value = false
  } catch (error: any) {
    console.error('获取虚拟号失败:', error)

    // 使用默认号码拨打
    Taro.makePhoneCall({
      phoneNumber: '95324',
      fail: (err) => {
        console.log('拨打失败:', err)
      },
    })

    showContactPopup.value = false
  }
}

/**
 * 获取审批人信息和虚拟号
 *
 * @param userPhone - 用户手机号
 * @param isCall - 是否立即拨打
 */
const fetchApproverInfo = async (userPhone: string, isCall = false) => {
  if (!userPhone || !params.customerCode) return

  phone.value = userPhone

  try {
    const { data } = await getVirtualNum({
      outPhone: userPhone,
      customer: params.customerCode,
      needVerifyAuthName: true,
    })

    dataInfo.value = data || {}
    dataInfo.value.customerCode = params.customerCode
    // 埋点：申请成功上报（匹配审批人成功）
    other_customer_code_password_apply_success('匹配成功')
  } catch (error: any) {
    console.error('获取审批人信息失败:', error)
    // 埋点：申请成功上报（匹配审批人失败）
    other_customer_code_password_apply_success('匹配失败')
    showToast({ title: error.message || '获取信息失败', icon: 'none' })
  }
}

/**
 * 根据路由 title 参数映射来源页面名称（用于 express_type 上报）
 * title: 1=绑定客户编码, 2=添加客户编码, 3=更换客户编码, 4=切换客户编码
 */
const getExpressTypeByTitle = (title: string | number): string => {
  const titleMap: Record<number, string> = {
    1: '绑定客户编码',
    2: '添加客户编码',
    3: '更换客户编码',
    4: '切换客户编码',
  }
  return titleMap[+title] || '更换客户编码'
}

/**
 * 页面初始化
 */
onMounted(() => {
  // 根据来源页面设置 express_type，供申请结果埋点上报使用
  params.title && setExpressType(getExpressTypeByTitle(params.title))

  // 从路由参数或 store 获取用户信息
  // TODO: 从用户 store 或全局状态获取手机号
  // const userInfo = useUserGlobalStore()
  // const userPhone = userInfo.userInfo?.phone

  // 暂时从路由参数获取（实际应从 store 获取）
  const userPhone = params.phone || ''

  console.log(params, '这是路由参数看看')
  if (userPhone && params.customerCode) {
    fetchApproverInfo(userPhone, false)
  }

  // 页面曝光埋点
  exp_customer_code_password_page()
})
</script>
