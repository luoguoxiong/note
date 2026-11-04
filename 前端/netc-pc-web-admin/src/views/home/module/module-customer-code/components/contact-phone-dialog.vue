<template>
  <KDialog
    :title="titleLabel"
    class="contact-phone-dialog__container"
    v-model="dialogVisible"
    width="400px"
    :has-footer="!changePhoneVisible"
    @close="handleClose"
    :is-show-cancel="false"
    confirm-text="我知道了"
    @confirm="handleConfirm"
    append-to-body
  >
    <template #header>
      <div class="dialog-title">
        <el-icon v-show="changePhoneVisible" class="icon-return" @click="handleGoBack"><ArrowLeft /></el-icon>
        <span class="label">{{ titleLabel }}</span>
      </div>
    </template>
    <div class="contact-tips">
      <el-icon><InfoFilled /></el-icon>
      为了保护您的隐私，将会以虚拟号码联系{{ roleName == '商务' ? roleName : '他' }}。
    </div>

    <div class="contact__wrapper" v-show="!changePhoneVisible">
      <div class="contact--header">
        <span>{{ roleName === '商务' ? '跨越商务' : roleName }}</span>
      </div>
      <div class="contact--phone">
        <div>{{ roleName === '商务' ? '跨越商务' : roleName }}联系电话：</div>
        <div>
          {{ formatPhone }}
          <el-icon class="iconfont cursor" v-clipboard="virtualPhone || '95324'" @click="handleCopyTrack">
            <CopyDocument />
          </el-icon>
        </div>
        <div class="msg">用{{ filterMobliePhone(formData.curPhone) }}的手机号码，拨打联系{{ roleName }}</div>
        <div class="change-phone">
          其他手机号码拨打？
          <span @click="handleChangePhone">更换手机号码</span>
        </div>
      </div>
    </div>

    <div class="virtual-phone__wrapper" v-show="changePhoneVisible">
      <div class="navigate">
        <span>1</span>
        <span>2</span>
      </div>
      <div class="form-area">
        <el-form ref="formRef" :model="formData" :rules="rules" label-position="top">
          <el-form-item prop="phone" :label="`当前手机号码：${filterMobliePhone(formData.curPhone)}`">
            <el-input
              v-model="formData.phone"
              @input="handleInput"
              :maxlength="13"
              :clearable="true"
              placeholder="请输入您需要拨打的电话号码"
            ></el-input>
          </el-form-item>
          <el-form-item :label="`获取${roleName}号码`">
            <KButton
              type="primary"
              @click="handleGetBusinessPhone()"
              :loading="loading"
              :disabled="!formData.phone"
              @click.capture="handleGetPhoneTrack"
            >
              点击获取
            </KButton>
          </el-form-item>
        </el-form>
      </div>
    </div>
  </KDialog>
</template>

<script setup lang="ts">
/**
 * 联系电话弹窗(TS 版)
 * 来源: customer-code/components/contact-phone-dialog.vue
 *  - @vue/composition-api -> vue script setup
 *  - ky-dialog(:visible.sync + visibleFooter + confirm-text) -> KDialog(v-model + hasFooter + footer 插槽)
 *  - slot="title" -> #header 插槽; svg-icon icon-return -> el-icon + @element-plus/icons-vue
 *  - v-clipboard 全局指令 -> 本目录 directives/clipboard 局部指令
 *  - v-kytrack 指令 -> 本目录 report.ts 显式上报(事件码不变)
 *  - @utils/format / useGetVirtualPhone / REGULAR / storageUtil.getPhone / UserService.* -> 本目录 utils/hooks/api
 *  - window.report.sendClickEvent -> 本目录 report.reportClickEvent
 */
import { computed, reactive, ref, toRefs, watch } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowLeft, CopyDocument, InfoFilled } from '@element-plus/icons-vue'
import { KButton, KDialog } from '@netc-design-pc/ui'
import { getVirtualNum, uamGetBusinessVirtualMobile, getOtherBindVirtualNum } from '../api'
import { formatMobliePhone, filterMobliePhone } from '../utils/format'
import { mobileNumber } from '../utils/regular'
import useGetVirtualPhone from '../hooks/useGetVirtualPhone'
import useCustomerCodeStore from '../hooks/useCustomerCodeStore'
import clipboardDirective from '../directives/clipboard'
import { reportClickEvent } from '../report'
import type { VirtualNumData } from '../types'

defineOptions({ name: 'contact-phone-dialog' })

const vClipboard = clipboardDirective

const router = useRouter()
const { phone } = useCustomerCodeStore()
const { handleInputFormat } = useGetVirtualPhone()

const state = reactive({
  changePhoneVisible: false,
  virtualPhone: '',
  dialogVisible: false,
  loading: false,
  resolveResult: null as ((value: any) => void) | null,
  resultData: {} as Record<string, any>,
  roleName: '',
  customerCode: '',
  trackName: '',
  source: '',
  changeTrackName: '',
  formData: {
    phone: '',
    curPhone: formatMobliePhone(phone.value),
  },
})

const formRef = ref()
// 模板绑定所需的顶层引用
const { dialogVisible, changePhoneVisible, virtualPhone, roleName, loading, formData } = toRefs(state)

const formatPhone = computed(() => {
  return formatMobliePhone(state.virtualPhone) || '95324'
})

function showDialog(data: Record<string, any>) {
  state.dialogVisible = true
  state.resultData = data
  const { virtualNum = '', source = '2', role = '商务', customerCode = '', trackName = '', changeTrackName = '' } = data
  state.roleName = role
  state.source = source
  state.customerCode = customerCode
  state.trackName = trackName
  state.changeTrackName = changeTrackName
  if (!virtualNum) {
    handleGetBusinessPhone(formatMobliePhone(phone.value))
  } else {
    state.virtualPhone = virtualNum
  }
  return new Promise((resolve) => {
    state.resolveResult = resolve
  })
}

const titleLabel = computed(() => {
  let _title = ''
  if (state.changePhoneVisible) {
    _title = '更换手机号'
  } else {
    _title = state.roleName === '商务' ? '联系商务' : '联系他'
  }
  return _title
})

type Validator = (rule: unknown, value: string, callback: (error?: Error) => void) => void

const validatePhone: Validator = (_rule, value, callback) => {
  const reg = mobileNumber
  if (!/\S/.test(value)) {
    return callback(new Error('请输入您需要拨打的电话号码'))
  }
  if (!reg.test(value.replace(/\s+/g, ''))) {
    return callback(new Error('请输入正确的手机号'))
  }
  callback()
}

const rules = {
  phone: [{ validator: validatePhone, trigger: 'blur' }],
}

const handleConfirm = () => {
  state.dialogVisible = false
  reportClickEvent(state.trackName, {
    button_name: '我知道了',
  })
}

const handleClose = () => {
  state.dialogVisible = false
  state.changePhoneVisible = false
  const _trackName = state.changeTrackName || state.trackName
  if (_trackName) {
    reportClickEvent(_trackName, {
      button_name: '关闭',
    })
  }
}

// 更换手机号切换回联系商务
const handleGoBack = () => {
  formRef.value?.resetFields()
  state.changePhoneVisible = false
  reportClickEvent(state.changeTrackName, {
    button_name: '返回',
  })
}

const handleInput = () => {
  state.formData.phone = formatMobliePhone(handleInputFormat(state.formData.phone))
}

// 获取商务号码
const handleGetBusinessPhone = async (phoneNum = '') => {
  if (!phoneNum) {
    const valid = await formRef.value
      .validate()
      .then(() => true)
      .catch(() => false)
    if (!valid) return false
  }
  try {
    state.loading = true
    const contactPhone = phoneNum || state.formData.phone || ''
    const outPhone = contactPhone?.replace(/\s+/g, '')
    let res
    /**
     * 调用场景：
     * 1- 申请客户编码结果联系客服：uamGetBusinessVirtualMobile
     * 2- 忘记密码申请结果弹窗联系客服：getVirtualNum
     * 3- 申请关联账号权限审核结果弹窗联系客服：getOtherBindVirtualNum
     */
    switch (state.source) {
      case '1':
        res = await uamGetBusinessVirtualMobile({
          userInputMobile: outPhone,
          needVerifyAuthName: true,
        })
        break
      case '2':
        res = await getVirtualNum({
          customer: state.customerCode,
          outPhone,
          from: '10',
          needVerifyAuthName: true,
        })
        break
      case '3':
        res = await getOtherBindVirtualNum({ outPhone, needVerifyAuthName: true })
        break
      default:
        res = await getVirtualNum({
          outPhone,
          customer: state.customerCode,
          needVerifyAuthName: true,
        })
        break
    }
    if (res.code === 0 && res.data) {
      const resData = res.data as VirtualNumData | string
      if ((resData as VirtualNumData)?.needRealName) {
        router.push({
          path: '/admin/realname',
          query: {
            microForceUpdate: '10',
            needQuerySave: 'false',
            phone: outPhone,
            targetRoute: '/admin/user',
          } as any,
        })
        state.dialogVisible = false
        return
      }
      // 场景1 返回虚拟号字符串, 其余场景返回对象
      state.virtualPhone = state.source === '1' ? (resData as string) : (resData as VirtualNumData)?.virtualNum
      state.changePhoneVisible = false
      state.formData.curPhone = state.formData.phone || formatMobliePhone(phone.value)
    }
  } catch (e) {
    console.log(e)
  } finally {
    state.loading = false
  }
}

// 复制手机号点击上报(老 v-kytrack:[trackName]="'复制手机号'")
const handleCopyTrack = () => {
  reportClickEvent(state.trackName, {
    button_name: '复制手机号',
  })
}

// 获取号码点击上报(老 v-kytrack:[changeTrackName]="'点击获取'")
const handleGetPhoneTrack = () => {
  reportClickEvent(state.changeTrackName, {
    button_name: '点击获取',
  })
}

// 更换手机号码
const handleChangePhone = () => {
  reportClickEvent(state.trackName, {
    button_name: '更换手机号码',
  })
  state.changePhoneVisible = true
}

const resetState = () => {
  state.formData.phone = ''
  state.formData.curPhone = formatMobliePhone(phone.value)
  state.virtualPhone = ''
  state.changePhoneVisible = false
}

watch(
  () => state.dialogVisible,
  (val) => {
    if (!val) {
      setTimeout(() => {
        resetState()
      }, 1000)
      state.resolveResult && state.resolveResult(false)
    }
  }
)

defineExpose({
  showDialog,
})
</script>

<style lang="scss" scoped>
.contact-phone-dialog__container {
  .dialog-title {
    display: flex;
    align-items: center;
    border-bottom: 1px solid #eaeaeb;
    padding: 10px 16px 10px 20px;
    .icon-return {
      cursor: pointer;
      margin-right: 16px;
    }
    .label {
      font-size: 14px;
      font-weight: 600;
      color: #03050d;
      line-height: 15px;
    }
  }
  .contact-tips {
    padding-left: 12px;
    height: 30px;
    display: flex;
    align-items: center;
    background: #faf9ff;
    border-radius: 1px;
    color: #333333;
    // font-size: $--font-size-small;
    font-size: 12px;
    margin-bottom: 12px;
    & > .el-icon {
      margin-right: 8px;
      font-size: 14px;
      // color: $--color-primary;
      color: #7143f0;
    }
  }
  .virtual-phone__wrapper {
    display: flex;
    .navigate {
      width: 14px;
      height: 181px;
      display: flex;
      flex-direction: column;
      margin-right: 5px;
      > span {
        width: 14px;
        height: 14px;
        opacity: 0.3;
        background: #888ea6;
        border-radius: 50%;
        text-align: center;
        color: #fff;
        font-size: 12px;
        &:first-of-type {
          margin-bottom: 71px;
          &:after {
            content: '';
            display: block;
            border-left: 1px dashed #888ea6;
            height: 59px;
            transform: translateX(7px) translateY(8px);
          }
        }
      }
    }
    :deep(.form-area) {
      .el-form-item__label {
        margin-bottom: 5px;
        line-height: 1 !important;
        padding-bottom: 3px !important;
      }
      .el-input {
        width: 340px;
      }
      .el-form-item {
        margin-bottom: 20px;
      }
      .el-input__inner {
        width: 340px;
        height: 44px;
        // border: 1px solid #d9d9d9 !important;
        border-radius: 4px !important;
        padding: 10px 8px !important;
        font-size: 24px;
        &::-webkit-input-placeholder {
          font-size: 16px;
        }
        &:focus {
          outline: none;
          border-color: #8365f6 !important;
        }
      }
    }
  }
  .contact__wrapper {
    padding: 11px 5px 22px 24px;
    margin-top: 12px;
    background: url('../assets/contact-bg.png') no-repeat;
    background-position: right top;
    background-color: #f8f8f8;
    display: flex;
    .contact--header {
      width: 68px;
      height: 70px;
      margin-right: 18px;
      position: relative;
      display: inline-block;
      background: url('../assets/business-avatar.png') no-repeat;
      background-size: 68px 70px;
      & > span {
        position: absolute;
        bottom: 3px;
        left: 50%;
        transform: translateX(-50%);
        font-size: 12px;
        color: #ffffff;
        white-space: nowrap;
      }
    }
    .contact--phone {
      padding-top: 15px;
      & > div {
        &:first-of-type {
          // font-size: $--font-size-medium;
          font-size: 14px;
          // color: $--color-text-regular;
          color: #666666;
          line-height: 18px;
          margin-bottom: 8px;
        }
        &:nth-of-type(2) {
          font-size: 20px;
          font-weight: bold;
          // color: $--color-text-primary;
          color: #03050d;
          & > .el-icon {
            // color: $--color-primary;
            color: #7143f0;
            font-size: 16px;
          }
        }
      }
      .msg {
        margin: 8px 0;
        padding: 4px 8px;
        // color: $--color-warning;
        color: #f5644e;
        background-color: #ffedd0;
        border-radius: 2px;
        font-size: 12px;
        line-height: 16px;
      }
      .change-phone {
        font-size: 12px;
        > span {
          cursor: pointer;
          color: #8b60f0;
          font-size: 12px;
        }
      }
    }
  }
}
</style>
