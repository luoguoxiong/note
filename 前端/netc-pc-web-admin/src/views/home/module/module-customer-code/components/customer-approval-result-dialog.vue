<template>
  <KDialog
    class="forget-password-result"
    v-model="dialogVisible"
    title=""
    width="400px"
    append-to-body
    :has-footer="false"
    :show-close="false"
    :has-header="false"
  >
    <div class="result-body">
      <el-icon class="el-icon-close" @click="handleClose('关闭')"><Close /></el-icon>
      <div class="header-content">
        <img :src="isApproval ? approvalIcon : successIcon" alt="" />
      </div>
      <div class="result-content">
        <div :class="['result-text', isApproval && 'isApproval-text']">
          {{ isApproval ? '等待审批中' : '提交成功' }}
        </div>
        <template v-if="resultData.source === '2'">
          <div class="text-tip" v-if="isApproval">
            您已提交申请，可联系{{ resultData.role }}{{ resultData.name }}帮您审批
          </div>
          <div class="text-tip" v-else>
            请等待{{ resultData.role }}{{ resultData.name }}审批，审批通过后将帮您绑定{{ resultData.customerName }}
          </div>
        </template>
        <template v-else>
          <div class="text-tip" v-if="isApproval">您已提交申请，请等待跨越审核，如需了解审批进度详询商务</div>
          <div class="text-tip" v-else>请等待跨越审核，如需了解审批进度详询商务</div>
        </template>
      </div>
      <div class="contact-content">
        <template v-if="resultData.role">
          <div class="left-side">
            <div class="avatar">
              <span>{{ resultData.role === '商务' ? '专属商务' : resultData.role }}</span>
            </div>
            <div class="info-area">
              <div>{{ resultData.name }}</div>
              <div>{{ resultData.customerName }}</div>
            </div>
          </div>
          <div class="right-side">
            <div class="phone-call" @click="handlePhoneCall"></div>
            <div class="contact-text">联系{{ resultData.role === '商务' ? '商务' : '他' }}</div>
          </div>
        </template>
        <template v-else>
          <div class="left-side">
            <div class="avatar">
              <span>{{ resultData.role === '商务' ? '专属商务' : resultData.role || '跨越商务' }}</span>
            </div>
            <div class="empty-text">哎呀，该公司暂未维护专属商务，可拨打95324~</div>
          </div>
        </template>
      </div>
      <div class="btn-wrapper">
        <KButton type="primary" @click="handleClose('我知道了')">我知道了</KButton>
      </div>
    </div>
  </KDialog>
</template>

<script setup lang="ts">
/**
 * 绑码申请审批结果弹窗(TS 版)
 * 来源: customer-code/components/customer-approval-result-dialog.vue
 *  - @vue/composition-api -> vue script setup
 *  - ky-dialog(:visible.sync + 隐藏头尾样式 hack) -> KDialog(v-model + hasFooter/showClose props)
 *  - require('@/assets/...') -> import 本目录 assets 静态资源
 *  - el-icon-close 字体图标 -> el-icon + @element-plus/icons-vue
 *  - root.$reportUtils.* 与 v-kytrack 指令 -> 本目录 report.ts 显式上报(事件码不变)
 *  - root.$route/$router -> useRoute/useRouter
 */
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Close } from '@element-plus/icons-vue'
import { KButton, KDialog } from '@netc-design-pc/ui'
import { applyResultCallPhoneReportApi } from '../api'
import {
  clkCustomerCodeBindApplyCompanyPopupResultButton,
  clkCustomerCodeBindPasswordReviewpopupButton,
  clkCustomerCodeBindPasswordSubpopupButton,
  reportClickEvent,
} from '../report'
import approvalIcon from '../assets/approval-icon.png'
import successIcon from '../assets/success-icon.png'
import type { ApprovalFlowData } from '../types'

defineOptions({ name: 'forget-password-result' })

const route = useRoute()
const router = useRouter()

const dialogVisible = ref(false)
const trackName = ref('')
const resolveResult = ref<((value: any) => void) | null>(null)
const resultData = ref<ApprovalFlowData>({})

const isApproval = computed(() => Number(resultData.value.applyStatus) !== 0)

function showDialog(data: ApprovalFlowData) {
  dialogVisible.value = true
  resultData.value = data
  return new Promise((resolve) => {
    resolveResult.value = resolve
  })
}

function handleClose(buttonName = '我知道了') {
  dialogVisible.value = false
  // 老 v-kytrack:[trackName] 指令 -> 显式点击上报
  if (trackName.value) {
    reportClickEvent(trackName.value, { button_name: buttonName })
  }
  clkCustomerCodeBindApplyCompanyPopupResultButton({
    button_name: '我知道了',
    current_path: isApproval.value ? '等待审批' : '申请成功',
  })
}

async function handlePhoneCall() {
  if (resultData.value?.needRealName && route.query.realNameVerified !== 'true') {
    router.push({
      path: '/admin/realname',
      query: {
        microForceUpdate: '10',
        needQuerySave: 'false',
        targetRoute: '/admin/user',
      } as any,
    })
    dialogVisible.value = false
    return
  }
  dialogVisible.value = false
  resolveResult.value && resolveResult.value(true)
  handleApproveAssAccount()
  const _name = `联系${resultData.value.role === '商务' ? '商务' : '他'}`
  let _event = ''
  let _path = ''
  if (resultData.value.source === '2') {
    _event = isApproval.value
      ? 'clkCustomerCodeBindPasswordSubpopupButton'
      : 'clkCustomerCodeBindPasswordReviewpopupButton'
  } else if (resultData.value.source === '3') {
    _event = 'clkCustomerCodeBindApplyCompanyPopupResultButton'
    _path = isApproval.value ? '等待审批' : '申请成功'
  }
  // 老 root.$reportUtils[_event] 动态分发 -> 显式映射
  if (_event === 'clkCustomerCodeBindPasswordSubpopupButton') {
    clkCustomerCodeBindPasswordSubpopupButton({ button_name: _name, current_path: _path })
  } else if (_event === 'clkCustomerCodeBindPasswordReviewpopupButton') {
    clkCustomerCodeBindPasswordReviewpopupButton({ button_name: _name, current_path: _path })
  } else if (_event === 'clkCustomerCodeBindApplyCompanyPopupResultButton') {
    clkCustomerCodeBindApplyCompanyPopupResultButton({ button_name: _name, current_path: _path })
  }
}

// 跨声消息-调用
function handleApproveAssAccount() {
  applyResultCallPhoneReportApi({
    customerName: resultData.value?.customerName,
  })
}

watch(
  isApproval,
  (val) => {
    trackName.value = val
      ? 'clk_customer_code_bind_password_reviewpopup_button'
      : 'clk_customer_code_bind_password_subpopup_button'
  },
  { immediate: true }
)

watch(dialogVisible, (val) => {
  if (!val) {
    resolveResult.value && resolveResult.value(false)
  }
})

defineExpose({
  showDialog,
})
</script>

<style lang="scss" scoped>
:global(.forget-password-result) {
  // 去除弹窗body默认的padding
  --k-dialog-body-padding: 0 0 32px;
}
.forget-password-result {
  border-radius: 8px;
  .el-dialog__header {
    display: none;
  }

  .el-dialog__body {
    margin: 0 !important;
    padding: 0 0 32px;

    .el-icon-close {
      position: absolute;
      right: 16px;
      top: 11px;
      font-size: 16px;
      font-weight: bold;
      color: #666;
      cursor: pointer;
    }

    .header-content {
      width: 100%;
      height: 163px;
      background: url('../assets/forget-password-bg.png') no-repeat;
      background-position: left top;
      background-size: 400px 163px;
      text-align: center;
      box-sizing: border-box;
      padding-top: 38px;
      > img {
        width: 98px;
        height: 98px;
      }
    }

    .result-content {
      margin-bottom: 22px;
      text-align: center;
      transform: translateY(-3px);
      .result-text {
        color: #00c58c;
        font-size: 20px;
        font-weight: bold;
        margin-bottom: 16px;
        &.isApproval-text {
          color: #03050d;
        }
      }
      .text-tip {
        padding: 0 20px;
        line-height: 20px;
        color: #8f8fa8;
        font-size: 13px;
      }
    }

    .contact-content {
      width: 360px;
      height: 90px;
      background-color: #f8f8f8;
      background-size: 80px 60px;
      background-position: right top;
      border-radius: 4px;
      background-image: url('../assets/contact-bg.png');
      background-repeat: no-repeat;
      margin: 0 auto 32px;
      display: flex;
      justify-content: space-between;
      .left-side {
        padding: 8px 0 0 18px;
        display: flex;
        flex: 1;
        .avatar {
          margin-right: 10px;
          position: relative;
          background: url('../assets/business-avatar.png') no-repeat;
          background-size: 68px 70px;
          width: 68px;
          height: 70px;
          > span {
            position: absolute;
            bottom: 3px;
            left: 50%;
            transform: translateX(-50%);
            font-size: 12px;
            color: #ffffff;
            white-space: nowrap;
          }
        }
        .info-area {
          > div {
            &:nth-child(1) {
              color: #03050d;
              font-size: 20px;
              padding: 14px 0 10px;
              font-weight: bold;
            }
            &:nth-child(2) {
              color: #666666;
              font-size: 14px;
              line-height: 18px;
            }
          }
        }
        .empty-text {
          height: 70px;
          width: 211px;
          display: flex;
          align-items: center;
          line-height: 18px;
          font-size: 14px;
          color: #666666;
        }
      }
      .right-side {
        padding: 16px 19px 0 0;
        width: 48px;
        margin-left: 8px;
        box-sizing: content-box;
        .phone-call {
          margin-bottom: 6px;
          background: url('../assets/contact-phone.png') no-repeat center center;
          background-size: 38px 38px;
          height: 38px;
          cursor: pointer;
        }
        .contact-text {
          text-align: center;
          color: #666;
          font-size: 12px;
        }
      }
    }

    .btn-wrapper {
      text-align: center;
      .el-button {
        width: 124px;
        height: 44px;
        border-radius: 4px;
        span {
          font-size: 14px;
        }
      }
    }
  }
}
</style>
