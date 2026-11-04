<template>
  <div class="questionnaire-fee-content">
    <div>
      <div class="questionnaire-page-content">
        <div class="title-box">
          <div class="ttile">您对费用的疑惑是？</div>
          <div class="record" @click="toFeedbackRecord">反馈记录</div>
        </div>
        <div class="question-select-box">
          <div v-for="(item, index) of questionList" :key="item.value">
            <div
              :class="['question-item', index === questionList.length - 1 && 'last-question-item']"
              @click="toAddQuestion(item)"
            >
              <div class="lable">{{ item.label }}</div>
              <SvgIcon
                v-if="selectQuestionList.includes(item.value)"
                name="radio-checked"
                class="check-icon-box"
              ></SvgIcon>
              <SvgIcon v-else name="radio-unchecked" class="check-icon-box"></SvgIcon>
            </div>
            <div v-if="selectQuestionList.includes(OTHERKEY) && item.value === OTHERKEY">
              <KyTextarea
                data-validate="questionnaireFee.validate.other"
                :noPadding="true"
                @clear="onClear"
                @input="onInput"
                @focus="onFoucs"
                class="feeTextCustomClass"
                v-model="FeeQueText"
                :showWordLimit="true"
                :placeholder="placeholder"
                :rows="4"
                :maxlength="150"
                clearable
                v-bind="$attrs"
                ref="inputRef"
              />
            </div>
          </div>
        </div>
        <div :class="['submit-box', !selectQuestionList.length && 'disabled-submit']" @click="toSubmit">提交</div>
      </div>
      <div class="question-answer-box">
        <div class="title">快速解答</div>
        <div class="concat-box" @click="toContactPopup">
          <SvgIcon name="person-svg" class="person-icon"></SvgIcon>
          <span>联系商务</span>
        </div>
      </div>
    </div>
  </div>
  <PageCommon />
</template>

<script lang="ts" setup>
import { computed, ref } from 'vue'
import SvgIcon from '@order-public-sub-public/components/ui/svg-icon/index.vue'
import KyTextarea from '@order-public-sub-public/components/base/ky-textarea/index.vue'
import { showToast } from '@order-public-sub-public/hooks/useShowToast'
import useEffect from '@order-public-sub-public/validate'
import { localCheckResult } from '@order-public-sub-public/types'
import { contactPopup } from '@order-public-sub-public/components/business/contact-business'
import { useRouter, useRoute } from '@order-public-sub-public/vue-router/index'
import { getDeviceModel, isWxPcApplet, isIphone, isWxApplet } from '@order-public-sub-public/utils'
import { feeQuestionAddFeedback } from '@order-public-sub-public/apis/user'
import { useStore } from '@order-public-sub-public/store'
import { sleep } from '@order-public-sub-public/utils/sleep'
import { debounce } from 'lodash-es'
import { ModuleType } from '@order-public-sub-public/constants'
import PageCommon from '@order-public-sub-public/components/ui/page-common/index.vue'
import { openURL } from '@/modules/webview/utils'
import { getBaseUrl } from '@order-public-sub-public/utils/env'
import {
  isAliMiniApp,
  isAmapMiniApp,
  isWxAppAndroidEnv,
  isWxAppIosEnv,
  isWxAppOhosEnv,
  isWxPcAppletEnv,
  isH5FSEnv,
} from '@/public/utils'
import { sourceMap } from './const'

const piniaStore = useStore()
const router = useRouter()
const route = useRoute()

interface IQuestion {
  label: string
  value: number
}

const OTHERKEY = 999

const questionList = ref<IQuestion[]>([
  {
    label: '价格贵',
    value: 1,
  },
  {
    label: '价格和销售报价不一致',
    value: 2,
  },
  {
    label: '起重、起方是什么意思',
    value: 3,
  },
  {
    label: '不理解按抛重怎么算费',
    value: 4,
  },
  {
    label: '其他',
    value: OTHERKEY,
  },
])
const selectQuestionList = ref<number[]>([])

const FeeQueText = ref('')
const placeholder = ref('请填写对费用的疑问（必填）')

const toAddQuestion = (questionItem: IQuestion) => {
  if (!selectQuestionList.value.includes(questionItem.value)) {
    selectQuestionList.value.push(questionItem.value)
  } else {
    selectQuestionList.value = selectQuestionList.value.filter((v) => v !== questionItem.value)
  }
  if (questionItem.value === OTHERKEY) {
    placeholder.value = '请填写对费用的疑问（必填）'
  }
}

const onClear = () => {
  FeeQueText.value = ''
}

const onInput = () => {
  if (FeeQueText.value) {
    const val = FeeQueText.value.trim()
    if (val && val.length >= 150) {
      showToast('字数已达上限')
    }
  }
}

const onFoucs = () => {
  placeholder.value = '请填写对费用的疑问（必填）'
}

// 联系商务
const toContactPopup = () => {
  contactPopup()
}

const moduleData = computed(() => {
  return piniaStore.schema.moduleDimensionData(ModuleType['下单公司'])
})

const feedBackReq = debounce(async () => {
  const content = {
    selContent: '',
    putContent: '',
  }
  // value映射lable
  const labelMap = questionList.value.reduce((pre: any, item) => {
    pre[item.value] = item.label
    return pre
  }, {})
  // 过滤出 其他 并排序后拼接
  content.selContent =
    selectQuestionList.value
      ?.filter((v) => v !== OTHERKEY)
      ?.sort((a, b) => a - b)
      .map((v) => labelMap[v])
      ?.join('，') ?? ''

  // 如果选择了其他, 需要将填入输入框的内容放入
  if (selectQuestionList.value.includes(OTHERKEY)) {
    content.putContent = '其他：' + FeeQueText.value
  }

  let source = ''
  let channel = ''
  // 如果是微信小程序
  if (isWxApplet) {
    source = isWxPcAppletEnv ? sourceMap['PC-微信小程序'] : sourceMap['手机-微信小程序']
  } else {
    // source = 'app'
    if (isWxAppIosEnv) {
      source = sourceMap['苹果-APP']
    } else if (isWxAppAndroidEnv) {
      source = sourceMap['安卓-APP']
    } else if (isWxAppOhosEnv) {
      source = sourceMap['鸿蒙-APP']
    } else if (isAmapMiniApp) {
      source = sourceMap['手机-高德小程序']
    } else if (isAliMiniApp) {
      source = sourceMap['手机-支付宝小程序']
    } else if (isH5FSEnv) {
      source = sourceMap['手机-飞书小程序']
    }
  }

  if (isWxApplet) {
    channel = 'wechatApplet'
  } else {
    channel = isIphone ? 'ios' : 'android'
  }
  const userInfo = piniaStore.root.getUserInfo || {}
  const params = {
    content: JSON.stringify(content),
    feedbackType: '93',
    source,
    channel,
    device: getDeviceModel(),
    extCode: 2,
    phone: userInfo.phone,
    userName: userInfo.name ?? undefined,
    userCompanyName: moduleData.value?.customerName,
    waybillNo: route.query?.waybillNumber,
    activityCode: '',
  }
  console.log(params)

  try {
    await feeQuestionAddFeedback(params)
    showToast('提交成功，感谢您的反馈，我们收到后会尽快回复')

    // 置空
    selectQuestionList.value = []
    FeeQueText.value = ''

    await sleep(1000)
    router.back()
  } catch (error) {
    showToast(error.message)
  }
}, 300)

const toSubmit = async () => {
  if (!selectQuestionList.value?.length) return
  const { effectBubble } = useEffect()
  if (selectQuestionList.value.includes(OTHERKEY) && !FeeQueText.value?.trim()) {
    try {
      const list: localCheckResult[] = [
        {
          key: 'questionnaireFee.validate.other',
          passed: false,
          content: '请填写对费用的疑问',
          bubbleConfig: {
            placement: 'bottom-start',
            offset: [15, -95],
          },
        },
      ]
      await effectBubble(list)
    } catch (error) {
      console.log(error)
      placeholder.value = '请填写对费用的疑问'
    }
  } else {
    const reg = /[\u4e00-\u9fa5]/
    if (!reg.test(FeeQueText.value) && selectQuestionList.value.includes(OTHERKEY)) {
      showToast('请反馈有效的具体内容')
      return
    }
    // 校验通过 发起请求
    feedBackReq()
  }
}

// 跳转到反馈记录页面
const toFeedbackRecord = () => {
  const url = `${getBaseUrl()}/netc-h5-tools-optimize/function-feedback/function-feedback.html#/feedback-record`
  openURL(url, {
    needLogin: true,
  })
}
</script>
<style lang="scss">
@import '@order-global-package-order-sub/styles/index.scss';
@import './index.scss';
</style>
