<template>
  <view
    id="todo-permission-auth-ex"
    v-exposure
    :exposure-report="{
      eventCode: 'exp_homepage_permission_approval_v1',
      otherParams: {
        page_code: 'page_homepage_v1',
        event_name: '客户端首页_待办事项_权限审批_曝光',
        region_code: 'authority_approval_todo',
        region_name: '待办事项_权限审批',
      },
    }"
  >
    <view v-if="permissionApproval">
      <view class="todo-permission-auth">
        <view class="todo-permission-auth__header">
          <ky-lazy-image
            :delay="500"
            src="https://ic-img.ky-express.com/netc/20250707_72967_!!1751870617841_80_80.png"
          />
          {{ '申请' + permissionApproval.applyAuth }}
        </view>
        <view class="todo-permission-auth__form">
          <view class="todo-permission-auth__form__item">
            <text>申请时间：</text>
            <text>{{ formatterDateTime(permissionApproval.applyTime, 'YYYY/MM/DD HH:mm:ss') || '--' }}</text>
          </view>
          <view class="todo-permission-auth__form__item">
            <text>申请人：</text>
            <text>{{
              [permissionApproval.applyUser, permissionApproval.applyPhone].filter(Boolean).join('/') || '--'
            }}</text>
          </view>

          <!-- 申请下单权限，无需显示部门 -->
          <view v-if="Number(permissionApproval.type) !== 70" class="todo-permission-auth__form__item">
            <text>部门名称：</text>
            <text>{{ permissionApproval.departmentName || '--' }}</text>
          </view>

          <view class="todo-permission-auth__form__item">
            <text>申请原因：</text>
            <text>
              {{ permissionApproval.applyReason || '--' }}
            </text>
          </view>
        </view>
        <view class="todo-permission-auth__footer">
          <ky-button class="mr-16" size="small" @tap="handleReject" plain>拒绝</ky-button>
          <ky-button size="small" type="primary" @tap="handleAgree" plain>同意</ky-button>
        </view>
      </view>
      <load-more @load-more="handleNavigateToList" />
    </view>
    <ky-empty v-else description="暂无数据" />
  </view>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { useHomeStore } from '../../../store'
import { formatterDateTime } from '../formatter'

import LoadMore from '../load-more.vue'
import './permission-auth.scss'
import { navigateWithParams } from '../../../hooks'
import { ApplicationCodeMap } from '@/public/utils/application/constants'
import { reportAuthClick, reportAuthDetailClick } from '../../../report'
import { useExposureReport } from '@/public/hooks/useExposureReport'

useExposureReport(['todo-permission-auth-ex'])

defineOptions({ name: 'todo-permission-auth' })

const store = useHomeStore()

// const titleTextMap = {
//   10: '申请查看运费',
//   40: '申请绑定客户编码',
//   50: '申请对账开票',
//   60: '申请查看账单',
//   70: '申请下单权限',
//   80: '申请查部门运单',
//   90: '申请查公司运单',
// }

const permissionApproval = computed(() => {
  return store.data.todoList.permissionApproval?.itemDetail
})

const handleReject = () => {
  reportAuthClick('拒绝')
  navigateWithParams(ApplicationCodeMap['首页-权限审批'], {
    tab: 20,
    operateType: 2,
    id: permissionApproval.value?.id,
  })
}

const handleAgree = () => {
  reportAuthClick('同意')
  navigateWithParams(ApplicationCodeMap['首页-权限审批'], {
    tab: 20,
    operateType: 1,
    id: permissionApproval.value?.id,
  })
}

const handleNavigateToList = () => {
  reportAuthDetailClick()
  navigateWithParams(ApplicationCodeMap['首页-权限审批'], { tab: 20 })
}
</script>
