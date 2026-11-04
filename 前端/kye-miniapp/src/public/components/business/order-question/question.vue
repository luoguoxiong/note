<template>
  <view class="question-container">
    <!-- 顶部标题 -->
    <view class="question-header">
      <text class="question-title">{{ title }}</text>
    </view>

    <scroll-view :scroll-y="true" class="question-content">
      <!-- 问题类型 -->
      <view class="question-types">
        <view
          v-for="(type, index) in questionTypeList"
          :key="type.moduleType || index"
          class="question-type-btn"
          :class="{ selected: selectedQuestionType === type.moduleType }"
          @click="handleQuestionTypeClick(type)"
        >
          {{ type.moduleName }}
        </view>
      </view>

      <!-- 问题选项 -->
      <view class="question-answers">
        <view class="question-answers-icon"></view>
        <view v-for="(q, index) in questionList" :key="q.optionType || index" class="question-answers-item">
          <view v-if="q.showOption" class="custom-radio" @click="handleAnswerChange(q)">
            <image
              class="custom-radio-img"
              :src="
                q.optionType === selectedAnswer
                  ? 'https://ic-img.ky-express.com/netc/20250710_40259_!!1752112270906_28_28.svg+xml'
                  : 'https://ic-img.ky-express.com/netc/20250710_61075_!!1752112275289_28_28.svg+xml'
              "
            />
            <view class="custom-radio-label">{{ q.optionName }}</view>
          </view>
          <view v-show="q.optionType === selectedAnswer && q.needInput">
            <ky-textarea
              v-model="remark"
              :maxlength="500"
              :cursor-spacing="100"
              :isError="isError"
              :clearable="false"
              style="overflow: auto"
              :showWordLimit="true"
              :placeholder="q.placeHolder || `还有其他要反馈的内容可以填写到这里${q.inputRequire ? '(必填)' : ''}~`"
              @focus="handleFocus"
              @blur="() => (isInput = false)"
              @input="onRemarkInputChange"
            />
          </view>
        </view>
      </view>
    </scroll-view>

    <!-- 底部按钮 -->
    <view class="question-footer">
      <button :disabled="loading" @click="handleSkip">暂不反馈</button>
      <button :disabled="loading" @click="handleSubmit">确认提交</button>
    </view>

    <!-- 不再提醒 -->
    <view class="remind-container">
      <view class="remind-container_content" @click="!loading && (notRemind = !notRemind)">
        <image
          class="remind-container_content-img"
          :src="
            notRemind
              ? 'https://ic-img.ky-express.com/netc/20250807_38799_!!1754547172280_56_56.png'
              : 'https://ic-img.ky-express.com/netc/20250710_61075_!!1752112275289_28_28.svg+xml'
          "
        />
        <text class="remind-container_content-info">下次不再提醒</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import Taro from '@tarojs/taro'
import { updateBizStatus } from './api'
import './question.scss'
import { getEnvConfig } from '@/public/config'
import { isAliMiniApp, isAmapMiniApp, isH5Env, isH5FSEnv, isPcFSEnv, isWechatEnv, isWxMiniApp } from '@/public/utils'

// 接收 props
const props = defineProps({
  alertData: {
    type: Object,
    default: () => ({ orderId: '', title: '', moduleList: [], batchId: '' }),
  },
  closeDialog: Function,
})

const { orderId, title, moduleList, batchId } = props.alertData
// 状态定义
const questionTypeList = ref([])
const questionList = ref([])
const selectedQuestionType = ref(null)
const selectedAnswer = ref(null)
const notRemind = ref(false)
const remark = ref('')
const isInput = ref(false)
const isError = ref(false)
const loading = ref(false)

const isIos = ref(false)

// 生命周期
onMounted(async () => {
  const { systemType } = getEnvConfig()
  isIos.value = systemType === 'iOS'
  if (moduleList?.length) {
    questionTypeList.value = moduleList
    const sender = moduleList.find((v) => v.moduleType === 'sender')
    if (sender) {
      selectedQuestionType.value = sender.moduleType
      questionList.value = sender.optionList || []
    }
  }
})

const handleFocus = (e) => {
  isInput.value = true
  isError.value && (isError.value = false)
  if (isH5Env) {
    setTimeout(() => {
      e.target.parentNode.parentNode.scrollIntoView({ behavior: 'smooth', block: 'end' })
    }, 100)
  }
}

// 点击问题类型
function handleQuestionTypeClick(type) {
  if (type.moduleType === selectedQuestionType.value) return
  selectedQuestionType.value = type.moduleType
  questionList.value = type.optionList || []
  const find = type.optionList.find((v) => v.defaultSelected)
  selectedAnswer.value = find ? find.optionType : null
  remark.value = ''
  isError.value && (isError.value = false)
}

// 选中答案
function handleAnswerChange(question) {
  selectedAnswer.value = question.optionType
  remark.value = ''
  isError.value && (isError.value = false)
}

// 输入备注内容
function onRemarkInputChange(eventOrValue) {
  isError.value = false
  let cur = typeof eventOrValue === 'string' ? eventOrValue : eventOrValue.detail.value || ''
  if (cur.length > 500) cur = cur.slice(0, 500)
  remark.value = cur
}

// 提交
async function handleSubmit() {
  if (!selectedAnswer.value) {
    Taro.showToast({ icon: 'none', title: '请选择您要反馈的具体问题' })
    return
  }

  const question = questionList.value.find(
    (v) => v.optionType === selectedAnswer.value && v.needInput && v.inputRequire,
  )
  if (question && (!remark.value || !remark.value.trim())) {
    Taro.showToast({ icon: 'none', title: '请输入您要反馈的具体问题' })
    isError.value = true
    return
  }

  Taro.showLoading({ mask: true, title: '加载中...' })
  loading.value = true

  //   miniprogram--微信小程序
  // ios--IOS
  // android--安卓
  // aliPay--支付宝小程序
  // amap--高德小程序

  let source = 'miniprogram'
  const { isApp, systemType } = getEnvConfig()
  if (isWechatEnv) {
    source = 'miniprogram'
  } else if (isAliMiniApp && !isAmapMiniApp) {
    source = 'aliPay'
  } else if (isAmapMiniApp) {
    source = 'amap'
  } else if (isApp && systemType === 'iOS') {
    source = 'ios'
  } else if (isApp && systemType == 'Android') {
    source = 'android'
  } else if (isPcFSEnv) {
    source = 'lark_pc'
  } else if (isH5FSEnv) {
    source = 'lark_h5'
  }

  try {
    await updateBizStatus({
      source: source,
      bizSource: 'surveyQuestionnaire',
      bizData: {
        moduleType: selectedQuestionType.value,
        optionType: selectedAnswer.value,
        inputContent: remark.value,
        source: source,
        orderid: orderId,
        batchId: batchId,
        promptOptContext: '确认退出',
        confirm: '10',
        notRemind: notRemind.value,
      },
    })
    props.closeDialog?.()
  } catch (err) {
    //
  } finally {
    Taro.hideLoading()
    loading.value = false
  }
}

// 跳过
function handleSkip() {
  // otherService.updateBizStatus({
  //   source: 'miniprogram',
  //   bizSource: 'surveyQuestionnaire',
  //   bizData: {
  //     moduleType: selectedQuestionType.value,
  //     optionType: selectedAnswer.value,
  //     inputContent: remark.value,
  //     source: 'miniprogram',
  //     orderid: orderId,
  //     promptOptContext: '暂不反馈',
  //     confirm: '20',
  //     notRemind: notRemind.value,
  //   },
  // })
  props.closeDialog?.()
}
</script>
