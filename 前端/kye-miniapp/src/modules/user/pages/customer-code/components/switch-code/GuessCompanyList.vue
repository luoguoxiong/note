<template>
  <view class="guess-company-list">
    <!-- 标题区域 -->
    <view class="guess-company-list__title">
      <text class="title-main">猜您需要绑定以下编码</text>
      <text class="title-sub">（近一个月下单过的公司）</text>
    </view>

    <!-- 推荐公司列表 -->
    <scroll-view v-if="companyList.length > 0" :scroll-y="true" :showScrollbar="false" class="guess-company-list__list">
      <view
        v-for="(item, index) in companyList"
        :key="index"
        class="guess-company-list__item"
        @tap="handleQuickBind(item)"
      >
        <view class="item-left">
          <text class="item-name">{{ item.customerName }}</text>
          <text class="item-code">客户编码：{{ item.customerCode }}</text>
        </view>

        <!-- 绑定中 loading -->
        <view v-if="isBinding(item)" class="item-loading">
          <ky-image
            src="https://ic-img.ky-express.com/netc/20220920_67251702288_!!1663639875854_96_96.png"
            mode="aspectFit"
            class="loading-icon"
          />
          <text class="loading-text">绑定中</text>
        </view>
      </view>
    </scroll-view>

    <!-- 空状态 -->
    <view v-else class="guess-company-list__empty">
      <text class="empty-text">暂无推荐公司</text>
    </view>

    <!-- 底部操作区 -->
    <view class="guess-company-list__operation">
      <view class="operation-hint">以上公司都不是您想绑定的</view>
      <view class="operation-box">
        <view class="operation-item">
          <text class="item-text">您有客户编码，赶快绑定吧~</text>
          <ky-button class="item-btn" size="small" type="default" @click="handleJumpBind"> 绑定客户编码 </ky-button>
        </view>
        <view class="operation-item">
          <text class="item-text">您没有客户编码，赶快申请吧~</text>
          <ky-button class="item-btn" size="small" type="default" @click="handleApply"> 申请客户编码 </ky-button>
        </view>
      </view>
    </view>

    <!-- 重复申请确认弹窗 -->
    <Alert
      :visible="showAlert"
      title="温馨提示"
      :content="alertContent"
      cancel-text="取消"
      confirm-text="继续"
      :show-cancel="true"
      @confirm="handleAlertConfirm"
      @cancel="showAlert = false"
      @close="showAlert = false"
    />
  </view>
</template>

<script setup lang="ts">
/**
 * 客户编码模块 - 猜您绑定组件 (type=120)
 *
 * 与 H5 bindCodeGuess 组件保持一致：
 * - 展示近一个月下单过的推荐公司列表
 * - 支持一键快速绑定（type=2）
 * - 支持跳转到手动绑码 / 申请客户编码
 * - 重复绑定冲突时弹窗提示确认
 */
import { ref, computed, onMounted } from 'vue'
import { showToast } from '@tarojs/taro'
import KyImage from '@/public/components/base/ky-image/index.vue'
import Alert from '../shared/Alert.vue'
import { useCustomerCodeStore } from '../../store/customerCode'
import { userBindCustomerCode } from '@modules/user/apis/customerCode'
import type { CompanyInfo } from '../../types/customer-code'
import { exp_customer_code_bind_page, clk_customer_code_button } from '../../report/index'
import './GuessCompanyList.scss'

interface Props {
  /** 绑定状态标识（H5兼容参数: 1=有推荐, 2=有关联, 3=更换） */
  status?: string | number
}

const props = withDefaults(defineProps<Props>(), {
  status: '1',
})

const emit = defineEmits<{
  (e: 'bind', data: Partial<CompanyInfo>): void
  (e: 'jumpBind'): void
  (e: 'apply'): void
}>()

const store = useCustomerCodeStore()

/** 公司列表（从 Store 获取） */
const companyList = computed(() => store.companyInfoList)

/** 正在绑定的公司 */
const bindingCompany = ref<CompanyInfo | null>(null)

/** 弹窗状态 */
const showAlert = ref(false)
const alertContent = ref('')
let pendingBindItem: CompanyInfo | null = null

/** 页面加载时触发埋点 */
onMounted(() => {
  exp_customer_code_bind_page()
})

/** 判断是否正在绑定中 */
const isBinding = (company: CompanyInfo): boolean => {
  return bindingCompany.value?.customerId === company.customerId
}

/**
 * 快速绑定推荐公司
 *
 * H5 原始实现: customerService.userBindCustomerCode({customerCode, customerPwd, type: 2})
 * - type=2 表示猜您推荐的快捷绑定
 */
const handleQuickBind = async (company: CompanyInfo) => {
  // 已是当前绑定，不重复操作
  if (company.isCurrBond === '1') return

  // 埋点：点击选择绑定公司
  clk_customer_code_button('选择绑定公司', { page_type: '切换客户编码' })

  bindingCompany.value = company

  try {
    const res = await userBindCustomerCode({
      customerCode: company.customerCode,
      customerPwd: company.customerPassword || '',
      type: 2,
    })

    const result: any = res?.data || res

    if (result.status === 1) {
      showToast({ title: '绑定成功', icon: 'none' })
      emit('bind', result.currentBind || company)
    } else if (result.errCompanyList && result.errCompanyList.length > 0) {
      // 有重复申请，弹窗提示
      pendingBindItem = company
      alertContent.value = `您已申请绑定${result.errCompanyList[0].customerShortName}(${result.errCompanyList[0].customerCode})${result.errCompanyList.length > 1 ? '等公司' : ''}，继续提交将取消申请。`
      showAlert.value = true
    } else {
      showToast({ title: '绑码异常', icon: 'none' })
    }
  } catch (error: any) {
    if (error?.code !== 100201) {
      showToast({ title: error?.msg || '服务错误', icon: 'none' })
    }
  } finally {
    bindingCompany.value = null
  }
}

/** 弹窗确认继续绑定 */
const handleAlertConfirm = async () => {
  if (!pendingBindItem) return

  clk_customer_code_button('继续', { page_type: '切换客户编码' })

  try {
    const res = await userBindCustomerCode({
      customerCode: pendingBindItem.customerCode,
      customerPwd: pendingBindItem.customerPassword || '',
      type: 2,
      cancelApplyFlag: true,
    })

    const result: any = res?.data || res

    if (result.status === 1) {
      showToast({ title: '绑码成功', icon: 'none' })
      showAlert.value = false
      emit('bind', result.currentBind || pendingBindItem)
    } else {
      showToast({ title: '绑码异常', icon: 'none' })
    }
  } catch (error: any) {
    if (error?.code !== 100201) {
      showToast({ title: error?.msg || '服务错误', icon: 'none' })
    }
  }
}

/** 跳转到手动绑定 */
const handleJumpBind = () => {
  clk_customer_code_button('去绑定', { page_type: '切换客户编码' })
  emit('jumpBind')
}

/** 跳转到申请客户编码 */
const handleApply = () => {
  clk_customer_code_button('申请客户编码', { page_type: '切换客户编码' })
  emit('apply')
}
</script>
