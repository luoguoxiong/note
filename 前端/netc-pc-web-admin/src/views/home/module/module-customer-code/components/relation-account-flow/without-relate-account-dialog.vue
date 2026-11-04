<template>
  <KDialog v-model="dialogVisible" title="温馨提示" width="360px" append-to-body class="without-relate-account-dialog">
    <div class="tips-line">
      <el-icon class="icon-warn"><WarningFilled /></el-icon>
      <span>您暂不可{{ type === 'change' ? '切换' : '添加客户编码' }}，如需绑定多家公司可申请。</span>
    </div>
    <div class="tips-line next-line">
      <span>如需{{ type === 'change' ? '切换' : '添加' }}，可一键解绑再更换客户编码。</span>
    </div>
    <!-- KDialog 无 cancel 事件(仅 onClose/onClosed/onConfirm), 内置 footer 的一键解绑按钮无法触发回调,
         故关闭内置 footer 自绘双按钮(customer-approval-result-dialog 同款模式) -->
    <template #footer>
      <div>
        <KButton type="default" @click="handleUnbindAll">一键解绑</KButton>
        <KButton type="primary" @click="handleApplyBindCompany">去申请</KButton>
      </div>
    </template>
  </KDialog>
  <!-- 一键解绑二次确认(组件式, 对齐 permission-dialog 的 KMessageBoxDialog 用法) -->
  <KMessageBoxDialog
    v-model="confirmVisible"
    dialog-type="confirm"
    title="温馨提示"
    width="420px"
    type="warning"
    confirm-text="确定"
  >
    <div class="confirm-content">
      <p class="confirm-msg">将解绑以下{{ companyList?.length }}家公司：</p>
      <div class="confirm-list">{{ companyListNames }}</div>
      <p class="confirm-sub">{{ msg }}</p>
    </div>
    <template #footer>
      <KButton type="default" @click="confirmVisible = false">取消</KButton>
      <KButton type="primary" :loading="unbindLoading" @click="handleConfirmUnbind">确定</KButton>
    </template>
  </KMessageBoxDialog>
</template>

<script setup lang="ts">
/**
 * 没有关联账号权限切换/新增绑码提示弹窗(TS 版)
 * 来源: netc-pc-web/src/views/setting/user/components/customer-code-list/without-relate-account-dialog.vue
 *  - @vue/composition-api -> vue script setup
 *  - ky-dialog(:visible.sync + slot footer 双按钮) -> KDialog(#footer 插槽自绘双按钮)
 *    (KDialog 无 cancel 事件, 仅 onClose/onClosed/onConfirm)
 *  - iconfont icon-warn -> el-icon + @element-plus/icons-vue
 *  - root.$kye_message.$message(ElMessageBox 命令式确认) -> KMessageBoxDialog 组件式确认框
 *    (对齐 permission-dialog/index.vue 用法, default 插槽自定义内容 + #footer 双按钮)
 *  - userApi.unbindRelationCustomerCode -> 本目录 api.ts
 *  - storageUtil.setCustomerData / envSdk.routerReload -> deps storage/misc
 */
import { computed, reactive, toRefs, watch } from 'vue'
import { WarningFilled } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { KButton, KDialog, KMessageBoxDialog } from '@netc-design-pc/ui'
import { unbindRelationCustomerCode } from '../../api'
import { setCustomerData } from '@/stores/pc-web/deps/storage'
import { routerReload } from '@/stores/pc-web/deps/misc'

defineOptions({ name: 'without-relate-account-dialog' })
const state = reactive({
  dialogVisible: false,
  resolveResult: null as ((value: boolean) => void) | null,
  type: '',
  msg: '',
  companyList: [] as any[],
  confirmVisible: false as boolean,
  unbindLoading: false as boolean,
})
const { dialogVisible, type, companyList, msg, confirmVisible, unbindLoading } = toRefs(state)

/** 确认框名单文案(老 h 渲染的 _customerNameList) */
const companyListNames = computed(() => companyList.value.map((f) => f.customerShortName).join('、'))

/** 打开弹窗(返回 Promise: 去申请 true / 关闭或一键解绑 false) */
function showDialog(payload: { type?: string; companyList?: any[]; msg?: string } = {}) {
  state.dialogVisible = true
  state.type = payload.type || 'change'
  state.msg = payload.msg || ''
  state.companyList = payload.companyList || []
  return new Promise<boolean>((resolve) => {
    state.resolveResult = resolve
  })
}

/** 一键解绑: 关闭本弹窗并打开组件式确认框 */
function handleUnbindAll() {
  console.log(state.companyList, ':>> state.companyList')
  state.dialogVisible = false
  state.confirmVisible = true
}

/** 确认框-确定: 解绑关联绑定公司 */
async function handleConfirmUnbind() {
  console.log(state.companyList, ':>> state.companyList')
  state.unbindLoading = true
  try {
    const res = await unbindRelationCustomerCode({
      unbindList: state.companyList.map((f) => f.customerCode),
      operatorSource: '30',
    })
    if (res.code === 0) {
      state.confirmVisible = false
      ElMessage.success('解绑成功')
      setTimeout(() => {
        setCustomerData({})
        routerReload()
      }, 1000)
    }
  } catch (e) {
    console.log(e, ':>> e')
  } finally {
    state.unbindLoading = false
  }
}

/** 去申请开通关联账号权限 */
function handleApplyBindCompany() {
  state.resolveResult && state.resolveResult(true)
  state.dialogVisible = false
}

watch(dialogVisible, (val) => {
  if (!val) {
    state.resolveResult && state.resolveResult(false)
  }
})

defineExpose({
  showDialog,
})
</script>
<style lang="scss" scoped>
.without-relate-account-dialog {
  .tips-line {
    display: flex;
    align-items: flex-start;
    line-height: 20px;
    .icon-warn {
      color: #ff8038;
      margin-right: 8px;
      margin-top: 2px;
    }
    &.next-line {
      margin-top: 16px;
      margin-left: 24px;
    }
  }
}
// 一键解绑确认框内容(还原老 h 渲染样式)
.confirm-content {
  padding: 8px 8px 0;
  .confirm-msg {
    font-size: 13px;
    color: #03050d;
  }
  .confirm-list {
    background-color: #f0f1ff;
    border-radius: 3px;
    margin-top: 8px;
    margin-bottom: 8px;
    padding: 8px;
    font-size: 12px;
    color: #03050d;
    line-height: 18px;
    font-weight: bold;
    max-height: 128px;
    overflow-y: auto;
    white-space: pre-wrap;
  }
  .confirm-sub {
    color: #8f8fa8;
    font-size: 12px;
    line-height: 18px;
  }
}
</style>
