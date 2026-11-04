<template>
  <view class="apply-bind">
    <view class="apply-bind__header">
      <view class="tip">
        为保障客户信息安全，如需绑定多家公司下单，请填写相关信息，
        <text class="highlight">经跨越同意申请后即可完成绑定</text>
      </view>
    </view>

    <scroll-view scroll-y class="apply-bind__body" @scroll="onScroll">
      <view class="apply-content">
        <!-- 当前绑定公司 -->
        <view v-if="state.currentCode" class="apply-content__cur_code">
          <view class="title">当前绑定公司</view>
          <view class="add-normal">
            <view class="code">{{ state.currentCode }}</view>
          </view>
        </view>
        <ky-form ref="formRef" :model-value="state.localModel">
          <!-- 申请绑定公司列表 -->
          <view class="apply-content__code">
            <view class="add-top">
              <view class="add-top__num">
                申请绑定公司({{ addNum }}/9)
                <image
                  src="https://ic-img.ky-express.com/netc/20251125_85651_!!1764053762476_22_14.svg+xml"
                  mode="aspectFit"
                  class="required-icon"
                />
              </view>
            </view>

            <view class="code-list">
              <!-- 预渲染所有可能的输入框，用 v-show 控制显隐，避免 v-for 重建导致 input 值清空 -->
              <view v-for="key in allKeys" :key="key" v-show="state.visibleKeys.includes(key)" class="add-code">
                <view class="company-input">
                  <view class="input-wrapper">
                    <view class="input-content">
                      <ky-field
                        v-model="state.localModel[key]"
                        :prop="key"
                        :rules="customerCodeRules"
                        type="digit"
                        placeholder="请输入客户编码"
                        placeholder-style="z-index: 0;"
                        :clearable="true"
                        :inputDebounce="300"
                        :cursorSpacing="26"
                        @blur="handleFieldBlur(key)"
                      />
                    </view>

                    <view :class="['delete-btn', isCanRemove && 'delete-icon']" @tap.stop="removeCompany(key)"> </view>
                  </view>
                </view>
              </view>
            </view>

            <ky-button v-if="isCanAdd" class="add-button" type="default" size="large" @click="addCompany">
              新增申请绑定公司
            </ky-button>
          </view>

          <view class="apply-content__reason1">
            <ky-field
              :required="true"
              label="申请原因"
              prop="reason"
              :rules="[{ required: true, message: '请填写申请原因' }]"
              v-model="state.localModel.reason"
              :maxlength="150"
              :clearable="true"
              :inputDebounce="600"
              :cursorSpacing="26"
              placeholder="请输入申请原因"
              @blur="handleFieldBlur('reason')"
            />
          </view>
          <view class="apply-content__reason" v-if="false">
            <!-- 申请原因 -->
            <ky-field
              :required="true"
              label="申请原因"
              prop="reason"
              :rules="[{ required: true, message: '请填写申请原因' }]"
              v-model="state.localModel.reason"
            >
              <template #input="{ isError }">
                <ky-textarea
                  :isError="isError"
                  placeholder="请输入申请原因"
                  v-model="state.localModel.reason"
                  @blur="handleFieldBlur('reason')"
                  :maxlength="150"
                >
                </ky-textarea>
              </template>
            </ky-field>
          </view>
        </ky-form>
      </view>
    </scroll-view>

    <!-- 底部按钮 -->
    <view :class="['apply-bind__footer', 'fixed', isIosEnv && 'safe-area']">
      <ky-button class="submit-button" type="primary" size="large" :loading="state.loading" @click="onSubmit">
        确认
      </ky-button>
    </view>

    <!-- 图形验证码弹窗 -->
    <Captcha ref="captchaRef" @getCode="getCode" @handleClose="handleCaptchaClose" />
  </view>
</template>

<script setup lang="ts">
/**
 * 申请绑定其他公司页面
 *
 * 从 H5 项目 (netc-h5-modules) 迁移的申请绑定其他公司功能
 * 功能：用户可申请绑定多家公司，支持动态表单、联想推荐、实时校验、批量检查
 *
 * 转换要点：
 * - van-field → ky-field (miniUI组件库)
 * - van-button → ky-button (miniUI组件库)
 * - vue-router → Taro 路由
 * - Vant Dialog → Alert 组件
 * - 原生 DOM 操作 → Taro API 适配
 */
import { ref, onMounted, onBeforeUnmount, onUnmounted } from 'vue'
import Taro, { useDidShow, useRouter } from '@tarojs/taro'
// import { useCustomerInfo } from '@/public/storage/hooks/useCommonHook'
import { useUserGlobalStore } from '@/store/user'
import { storeToRefs } from 'pinia'
import { isIosEnv } from '@/public/utils/device'

import { useApplyBind } from './hooks/useApplyBind'
import { enableAlertUnload, disableAlertUnload } from '../hooks/useAlertBeforeUnload'
import { checkCustomerCode, applyBindOtherCustomerCheck } from '@modules/user/apis/customerCode'
import {
  exp_page_customer_code_bind_other_company,
  clk_customer_code_bind_other_company_apply_button,
} from '../report/index'

import './index.scss'
import './components/CompanyInput.scss'
import { debounce } from 'lodash-es'
import Captcha from '@/public/components/base/captcha/index.vue'

const userGlobalStore = useUserGlobalStore()
const { customerInfo } = storeToRefs(userGlobalStore)
const router = useRouter()
const params = router?.params || {}
const userInfo = userGlobalStore.userInfo

/** 滑块验证码 */
const captchaRef = ref(null)
const captchaCode = ref('')
/** 验证码信息缓存 */
const captchaInfoCache = ref<any>(null)
/** 表单引用（用于 ky-form 校验） */
const formRef = ref<any>(null)
/** 是否处于提交状态（用于区分失焦校验和提交校验） */
const isSubmitting = ref(false)
// 是否手触发表单失焦
const isHandBlur = ref(false)

// 是否正在验证码校验
const isInCaptcha = ref(false)

/**
 * 客户编码校验规则
 * 失焦时：触发单个校验接口（checkCustomerCode）
 * 提交时：仅做基本校验（非空、去重），跳过接口调用，由批量校验接口处理
 */
const customerCodeRules = [
  {
    validator: (val: string) => {
      return new Promise(async (resolve, reject) => {
        // 存在其他已填数据则跳过空值校验
        const hasValue = state.visibleKeys.some((k) => state.localModel[k]?.trim())
        if (!val?.trim()) {
          if (!hasValue) reject('请输入客户编码')
          else resolve('')
          return
        }

        // 仅通过 val 值判断是否重复（出现次数 > 1）
        const count = state.visibleKeys.filter((k) => state.localModel[k] === val).length
        if (count > 1) {
          reject('不可输入相同公司')
          return
        }

        // 提交时跳过单个接口校验，由 handleBatchCheck 批量处理
        if (isSubmitting.value) {
          resolve('')
          return
        }
        console.log(isHandBlur.value, '手触发表单失焦')
        if (isHandBlur.value) {
          resolve('')
          isHandBlur.value = false
          return
        }

        try {
          const res = await checkCustomerCode({
            customerCode: val,
            safeVerifyId: captchaCode.value || undefined,
          })
          console.log(res, '校验信息')
          if (res.code === 0) {
            // checkCustomerCode 通过后，再校验是否可申请绑定（与 H5 保持一致）
            try {
              const applyRes = await applyBindOtherCustomerCheck({
                customer: val,
              })
              if (applyRes.code === 0) {
                resolve('')
              } else {
                reject(applyRes?.msg || '该客户编码不可申请绑定')
              }
            } catch (err: any) {
              reject(err?.msg || '该客户编码不可申请绑定')
            }
          } else if (res.code === 264587) {
            isInCaptcha.value = true
            blurActiveField()
            disableAlertUnload()
            captchaRef.value?.showCaptcha(
              {
                ruleId: res.data.ruleId,
                strategyCode: res.data.strategyCode,
                phone: userInfo.phone,
              },
              { type: res.data.type, unToken: true },
            )
          } else {
            reject(res?.msg || '客户编码校验失败')
          }
        } catch (error: any) {
          console.log(error, '报错')
          if (error?.code === 264587) {
            isInCaptcha.value = true
            blurActiveField()
            disableAlertUnload()
            captchaRef.value?.showCaptcha(
              {
                ruleId: error?.data?.ruleId,
                strategyCode: error?.data?.strategyCode,
                phone: userInfo.phone,
              },
              { type: error?.data?.type, unToken: true },
            )
            // reject('验证码校验')
          } else {
            reject(error?.msg || '客户编码校验失败')
          }
        }
      })
    },
    message: '',
  },
]

const {
  state,
  isCanAdd,
  isCanRemove,
  addNum,
  addCompany: _addCompany,
  removeCompany: _removeCompany,
  handleSubmit,
} = useApplyBind(params.title || '3')

/** 所有可能的输入框 key（预渲染用，避免 v-for 重建导致 input 值清空） */
const allKeys = Array.from({ length: 9 }, (_, i) => `customerCode${i + 1}`)

/**
 * 表单是否有未提交数据（与 H5 onBeforeRouteLeave 判定对齐）
 *
 * H5: companyList[0].customerCode || companyList.length > 1 || reason
 * Taro 对应: 任一可见 key 有值 / visibleKeys > 1 / reason 有值
 */
const hasUnsavedData = () => {
  const hasCode = state.visibleKeys.some((k) => state.localModel[k]?.trim())
  const hasReason = !!state.localModel.reason?.trim()
  const hasMulti = state.visibleKeys.length > 1
  return hasCode || hasReason || hasMulti
}

/** 根据表单状态动态注册/解注册返回拦截 */
const syncAlertUnload = () => {
  if (hasUnsavedData() && !isInCaptcha.value) {
    enableAlertUnload('您有信息未保存，确定要退出吗？')
  } else {
    disableAlertUnload()
  }
}

/** 新增公司并清空校验 */
const addCompany = () => {
  clk_customer_code_bind_other_company_apply_button('新增')
  _addCompany()
  syncAlertUnload()
  setTimeout(() => {
    console.log(formRef.value, 'formRef.value')
    formRef.value?.reset()
  }, 100)
}

/** 删除公司并清空校验 */
const removeCompany = (key: string) => {
  clk_customer_code_bind_other_company_apply_button('删除')
  _removeCompany(key)
  state.localModel[key] = ''
  syncAlertUnload()
  setTimeout(() => {
    formRef.value?.reset()
  }, 100)
}

/** 单个字段 blur 校验 */
const handleFieldBlur = debounce((key: string) => {
  // 字段失焦后若已有值，同步返回拦截状态
  syncAlertUnload()
  captchaInfoCache.value = {
    key,
    type: 'customerCode',
  }
  formRef.value?.validate(key)
}, 300)

// const { customerInfo } = useCustomerInfo()

onMounted(() => {
  console.log(customerInfo.value, 'customerInfo.value')
  state.currentCode = customerInfo.value?.customerCode || ''
  // 页面曝光埋点
  exp_page_customer_code_bind_other_company()
  // 暂时没有推荐列表
  // fetchRecommendList()
})

useDidShow(() => {
  isInCaptcha.value = false
  isHandBlur.value = false
  syncAlertUnload()
})

// 页面卸载前解注册，避免污染其他页面
onBeforeUnmount(() => {
  disableAlertUnload()
})

onUnmounted(() => {
  setTimeout(() => {
    disableAlertUnload()
  }, 400)
})

/**
 * 提交表单（带 ky-form 校验）
 *
 * 流程：
 * 1. 调用 formRef.value?.validate() 进行整表校验
 * 2. 校验通过后调用 useApplyBind 的 handleSubmit 提交数据
 */
const onSubmit = async () => {
  clk_customer_code_bind_other_company_apply_button('提交')
  // 提交前先解注册返回拦截，避免提交成功跳转时被拦截
  disableAlertUnload()
  // 设置提交标志位，让校验规则跳过单个接口调用
  isSubmitting.value = true
  setTimeout(() => {
    try {
      // 使用 ky-form 的 validate 方法进行全量校验（仅基本校验，不调单个接口）
      formRef.value?.validate().then(async ({ valid, errors }) => {
        if (valid) {
          // 校验通过后提交表单（内部会调用 handleBatchCheck 批量校验）
          await handleSubmit(state.localModel)
        } else {
          console.warn('error:', errors)
          captchaInfoCache.value = {
            key: '',
            type: 'submit',
          }
        }
        // 恢复标志位
        isSubmitting.value = false
      })
    } catch (error) {
      console.error('表单校验失败:', error)
      Taro.showToast({
        title: '请完善表单信息',
        icon: 'none',
      })
      // 恢复标志位
      isSubmitting.value = false
    }
  }, 300)
}

/**
 * scroll-view 滚动时收起键盘，避免光标/文字悬浮
 */
const onScroll = () => {
  Taro.hideKeyboard()
}

/**
 * 让当前聚焦的表单失焦
 */
const blurActiveField = () => {
  // 方式1: 直接收起键盘
  Taro.hideKeyboard()
  isHandBlur.value = true

  // 方式2: 通过选择器获取当前聚焦的 input 并失焦（兼容性更好）
  setTimeout(() => {
    const query = Taro.createSelectorQuery()
    query
      .select('input:focus')
      .boundingClientRect((rect) => {
        if (rect) {
          query.select('input:focus').node().then((res: any) => {
            if (res?.[0]) {
              res[0].blur()
            }
          })
        }
      })
      .exec()
  }, 50)
}

/**
 * 图形验证码弹窗关闭时调用
 */
const handleCaptchaClose = () => {
  isInCaptcha.value = false
  isHandBlur.value = false
  console.log('验证码关闭')
  syncAlertUnload()
}

/**
 * 图形验证码成功回调
 */
const getCode = async (code: any) => {
  isInCaptcha.value = false
  isHandBlur.value = false
  console.log(code, '验证码关闭')
  syncAlertUnload()
  if (!code) return
  captchaCode.value = code
  if (captchaInfoCache.value?.type === 'customerCode') {
    formRef.value?.validate(captchaInfoCache.value.key)
  }
  if (captchaInfoCache.value?.type === 'submit') {
    formRef.value?.validate()
  }
  // 触发提交风控，则清空风控参数
  captchaInfoCache.value = null
  captchaCode.value = ''
}
</script>
