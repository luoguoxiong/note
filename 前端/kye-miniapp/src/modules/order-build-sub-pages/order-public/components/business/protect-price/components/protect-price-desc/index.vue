<template>
  <BottomPopup
    id="protect-price-desc"
    class="protect-price-desc-wrapper"
    :show="visible"
    title="物品保价"
    show-tips
    tip-icon="desc"
    tipText=""
    :noPadding="true"
    :style="{ height: '92%' }"
    @on-click-tips="handleClickTips"
    @open="onOpen"
    @beforeRouteClose="beforeRouteClose"
    @onClose="handleClosePopup()"
    @closed="closed"
  >
    <template #scroll-front>
      <div
        class="protect-price-desc pb-32 flex flex-column"
        v-exposure-report="{
          eventCode: 'other_express_protectprice_popup_perception_v1',
        }"
      >
        <div>
          <div class="flex items-center space-between protect-price-input-title">
            <div class="font-level3 left-title">声明价值</div>
            <div
              class="color-sub-title flex items-center font-level4"
              v-if="freightLookAuthFlag === FreightLookAuthFlagEnum['有权限']"
            >
              <span class="color-primary right-title">保费&nbsp;</span>
              <span class="color-error">{{ premiumShow || '--' }}</span>
              <span class="color-primary right-title">元</span>
            </div>
            <div
              class="color-sub-title flex items-center font-level4"
              v-else-if="freightLookAuthFlag === FreightLookAuthFlagEnum['无权限']"
            >
              <span class="color-primary right-title">保费&nbsp;</span>
              <SvgIcon class="four-star-tips" name="four-star-tips"></SvgIcon>
              <span class="color-primary right-title">元</span>
            </div>
            <div class="color-sub-title flex items-center font-level4" v-else>
              <span class="color-primary">保费&nbsp;</span>--
            </div>
          </div>
          <div
            class="protect-price-input-wrapper"
            :data-validate="visible ? 'protectPrice.declarativeValue' : ''"
            :id="visible ? 'protectPrice_declarativeValue' : ''"
          >
            <KyInput
              :data-validate="visible ? 'protectPrice.declarativeValue' : ''"
              noPadding
              show-border
              v-model.number="declared"
              clearable
              type="number"
              :enableNative="false"
              :enableWxNative="true"
              :inputDebounce="600"
              :placeholder="
                restrictData && restrictData?.insuranceAccepted === false ? restrictData?.tipMsg : '请输入声明价值'
              "
              :disabled="restrictData && restrictData?.insuranceAccepted === false"
              :maxlength="9"
              v-click-report="{
                eventCode: 'clk_express_insured_v1',
              }"
              @input="_onInput"
              @update="onInput"
              @blur="onBlur"
              @clear="onClear"
              v-keyboard
              ref="inputRef"
            >
              <template #right>
                <div
                  class="item-insured-chinese font-level3 color-assist"
                  v-show="Number(declaredLocal?.toString().replace(/[^\d]/g, '')) > 9999 && declaredLocalLength"
                  :style="{ left: (declaredLocalLength * 19 + 40) / 7.5 + 'vw' }"
                >
                  {{ filterChinese(declaredLocal?.toString().replace(/[^\d]/g, '')) }}
                </div>
              </template>
            </KyInput>
          </div>
          <div
            class="protect-price-input-tips font-level4"
            v-if="restrictData?.tipMsg && restrictData?.insuranceAccepted"
          >
            <span class="color-error protect-price-input-tips-content">{{ restrictData?.tipMsg }}</span>
          </div>
          <div
            class="protect-price-input-tips flex"
            v-else-if="moduleDimensionData?.reminderTips && !restrictData?.tipMsg"
          >
            <span class="icon-content">
              <SvgIcon name="dollar-reminder-line" class="icon font-level3"></SvgIcon>
            </span>
            <span class="text-content font-level4 color-error">{{ moduleDimensionData?.reminderTips }}</span>
          </div>
          <div class="protect-price-input-tips flex goods-price-tip" v-if="goodsSupplementProtectPriceTips">
            <span class="icon-content">
              <SvgIcon name="dollar-reminder-line" class="icon font-level3"></SvgIcon>
            </span>
            <span class="text-content font-level4 color-error">{{ goodsSupplementProtectPriceTips }}</span>
          </div>
        </div>
      </div>
    </template>
    <div
      class="protect-price-desc pb-32 flex flex-column"
      v-exposure-report="{
        eventCode: 'other_express_protectprice_popup_perception_v1',
      }"
    >
      <rich-text
        :class="[
          'font-special',
          showTips && 'show-tips',
          restrictData?.tipMsg && restrictData?.insuranceAccepted && 'insuranceAccepted',
        ]"
        :nodes="internalState.agreementContent"
      ></rich-text>
    </div>
    <template #footer>
      <div class="protect-price-desc-footer">
        <div class="flex justify-center items-center font-level4">
          <div class="color-sub-title">
            <KyRadio
              v-model="internalState.radioChecked"
              :radio-props="[{ name: true, text: '我已知晓，下次不再提醒', iconSize: '16px' }]"
              @click="handleRadio"
            />
          </div>
          <div class="font-level4 line-height-42">《保价声明》</div>
        </div>
        <div class="flex justify-center protect-price-desc-footer-btn">
          <KyButton
            id="protect-price-btn-cancel"
            class="btn"
            text="不保价"
            plain
            @click.stop="handleCancelPopup"
            :loading="loading"
            loadingType="plain"
            loading-text="不保价"
            v-if="required !== true"
          ></KyButton>
          <KyButton
            class="btn"
            id="protect-price-btn-confirm"
            :loading="internalState.buttonLoading"
            @click="handleConfirm"
            text="保价"
            :data-required="required"
          ></KyButton>
        </div>
      </div>
    </template>
  </BottomPopup>
  <ContactBusiness v-model:show="popupVisible" :phone="phone" />
</template>

<script setup lang="ts">
import { reactive, computed, onMounted, watch, ref, onBeforeUnmount } from 'vue'
import KyInput from '@order-public-sub-public/components/base/ky-input'
import { useStore } from '@order-public-sub-public/store'
import { useRouter } from '@order-public-sub-public/vue-router/index'
import BottomPopup from '@order-public-sub-public/components/ui/bottom-popup/index.vue'
import SvgIcon from '@order-public-sub-public/components/ui/svg-icon/index.vue'
import KyRadio from '@order-public-sub-public/components/base/ky-radio/index.vue'
import KyButton from '@order-public-sub-public/components/base/ky-button/index.vue'
import { agreementSave, getHelpContent } from '@order-public-sub-public/apis/waybill/agreement'
import { ProtectPriceDimension, AddedServiceDimension, ProtectPrice } from '@order-public-sub-public/types'
import { ModuleStyle, ModuleType } from '@order-public-sub-public/constants'
import { useUpdateOrderStore } from '../../hooks/useModuleStore'
import { filterChinese } from '../../utils/index'
import { useValidate } from '../../hooks/useValidate'
import { FreightLookAuthFlagEnum } from '@order-public-sub-public/components/business/added-service/types'
import { useDeclared, usePremium, useOriginalDeclared } from '../../hooks/useState'
import { initAgreeContentResquest } from '../../hooks/state'
import { clk_express_protectprice_control_v1, clk_express_single_insurance_statement_v1 } from '../../hooks/report'
import ContactBusiness from '@/public/components/business/contact-business/index.vue'
import { OrderSuccessPageConfig } from '@order-public-sub-public/types'
import { localStorage } from '@order-public-sub-public/utils/storage'
import Taro from '@tarojs/taro'
import { debounce } from 'lodash-es'
import { getEnvConfig } from '@/public/config'
const piniaStore = useStore()

interface Props {
  visible: boolean
  required: boolean
  goodsSupplementProtectPriceTips?: string
}

interface InternalState {
  radioChecked: boolean
  agreementContent: string
  buttonLoading: boolean
}

defineProps<Props>()

const isClosing = ref(false)
const loading = ref(false)
const popupVisible = ref(false)
const phone = ref()

const router = useRouter()

const { declared, setDeclared } = useDeclared()
const { premium, setPremium } = usePremium()
const { originalDeclared } = useOriginalDeclared()

const lastDeclared = ref()
const isBlur = ref(true)
const declaredLocal = ref(declared.value || '')

const { useProtectPriceValidate } = useValidate()

const internalState: InternalState = reactive({
  radioChecked: false,
  agreementContent: '',
  buttonLoading: false,
})

const showTips = computed(() => {
  return (
    (restrictData?.value?.tipMsg && restrictData?.value?.insuranceAccepted) ||
    (moduleDimensionData?.value?.reminderTips && !restrictData?.value?.tipMsg)
  )
})

const modifyHtmlString = (htmlString, tag, styleContent) => {
  if (typeof htmlString !== 'string') return ''

  // 正则表达式
  // 匹配 <tag 开头
  // 捕获 (style="[^"]*")? 来匹配可选的 style 属性及其内容
  // 捕获其余属性 .*?
  // 匹配 > 结尾
  const regex = new RegExp(`(<${tag}\\s*)(style="[^"]*")?([^>]*>)`, 'g')

  return htmlString.replace(regex, (match, p1, p2, p3) => {
    if (p2) {
      // 如果 style 属性已存在，合并内容
      const existingStyle = p2.substring('style="'.length, p2.length - 1)
      styleContent = `${existingStyle.trim()}; ${styleContent}`
    }

    // 确保 styleContent 不为空，避免生成 style=""
    const newStyleAttr = styleContent ? `style="${styleContent.trim()}"` : ''

    // 组合新的 tag 标签
    return `${p1} ${newStyleAttr} ${p3}`
  })
}

const isFormat: boolean = [Taro.ENV_TYPE.WEAPP, Taro.ENV_TYPE.ALIPAY].includes(Taro.getEnv())
const initAgreeContent = async () => {
  const { data } = await getHelpContent({ type: 1 })
  let content = data.content || ''
  content = content.replace(/text\-indent\:.*?pt;/g, '')
  // 支付宝小程序的 rich-text 渲染 table 需自行加入边框样式，否则无边框
  if (isFormat) {
    content = modifyHtmlString(content, 'table', 'border-collapse: collapse;')
    content = modifyHtmlString(content, 'th', 'border: 2px solid #000;')
    content = modifyHtmlString(content, 'td', 'border: 2px solid #000;')
  }
  internalState.agreementContent = content
}

onMounted(async () => {
  setTimeout(() => {
    if (initAgreeContentResquest.value) {
      initAgreeContent()
    }
    initAgreeContentResquest.value = false
  })
})

const handleRadio = async () => {
  internalState.radioChecked = !internalState.radioChecked
  await agreementSave({ type: 1, flag: internalState.radioChecked ? 1 : 0 })
  emit('agreementSelectedChange', internalState.radioChecked)
}

const emit = defineEmits(['close', 'agreementSelectedChange'])

const requestLoading = ref(false)
const inputRef = ref()

const handleClosePopup = async () => {
  if (isClosing.value) {
    return
  }
  isClosing.value = true
  isBlur.value = false
  requestLoading.value = true

  setDeclared(originalDeclared.value)
  // 这里重复触发过程中 使用store的数据
  try {
    useProtectPriceValidate({
      field: 'declared',
    })
  } catch (error) {
    console.error(error)
  } finally {
    console.log('----------close-------------')
    emit('close')
    requestLoading.value = false
    clk_express_protectprice_control_v1('关闭')
  }
}

const closed = () => {
  // protectpricePopoupClosedReport()
}

const beforeRouteClose = () => {
  emit('close')
}

const moduleDimensionData = computed(() => {
  return piniaStore.schema.moduleDimensionData(ModuleType['物品保价'])
})

const moduleFormData = computed(() => {
  return piniaStore.order.moduleFormData(ModuleType['物品保价'])
})

const restrictData = computed(() => {
  return piniaStore.globalData.restrictData?.insuranceRestrict
})

const freightLookAuthFlag = computed(() => {
  return piniaStore.schema.moduleDimensionData(ModuleType['增值服务'])?.freightLookAuthFlag
})

const onOpen = () => {
  isBlur.value = true
  isClosing.value = false
  lastDeclared.value = declared.value
  if (moduleFormData.value) {
    setDeclared(moduleFormData.value?.declarativeValue || '')
  }
  if (moduleDimensionData.value) {
    setPremium(moduleDimensionData.value?.defaultPremium || '')
  }
}

watch(
  [restrictData, moduleDimensionData],
  () => {
    if (restrictData.value && restrictData.value?.insuranceAccepted === false) {
      setDeclared('')
      setPremium('')
    }
    if (moduleDimensionData.value) {
      setPremium(moduleDimensionData.value?.defaultPremium ? moduleDimensionData.value?.defaultPremium : '')
    }
  },
  { deep: true },
)

const handleConfirm = async () => {
  if (loading.value || internalState.buttonLoading) return

  isBlur.value = false

  internalState.buttonLoading = true

  try {
    await useProtectPriceValidate({
      field: 'submit',
    })

    useUpdateOrderStore({ declarativeValue: declared.value.toString().replace(/[^\d]/g, '') })

    emit('close')
    clk_express_protectprice_control_v1('保价')
  } catch (error) {
    console.error(error)
    isBlur.value = true
  } finally {
    internalState.buttonLoading = false
  }
}

const declaredLength = computed(() => {
  return declared.value ? declared.value.toString().replace(/[^\d]/g, '').length : 0
})

const declaredLocalLength = computed(() => {
  return declaredLocal.value ? declaredLocal.value.toString().replace(/[^\d]/g, '').length : 0
})

const premiumShow = computed(() => {
  return premium.value ? (+premium.value).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',') : 0
})
const onInput = async () => {
  try {
    await useProtectPriceValidate({
      field: 'declared',
      isOnline: true,
    })
  } catch (error) {
    console.error(error)
  }
}
const onBlur = async () => {
  // if (declared.value === lastDeclared.value) {
  //   // 没有变更，无需重复触发
  //   return
  // }
  // lastDeclared.value = declared.value
  setTimeout(async () => {
    if (isBlur.value) {
      window.$umpOtherReport(
        'OTHER',
        {
          eventCode: 'other_express_insured_control_v1',
        },
        {
          amount: declared.value.toString().replace(/[^\d]/g, ''),
        },
      )
      window.$umpOtherReport(
        'OTHER',
        {
          eventCode: 'other_express_single_value_v1',
        },
        {
          value_price: declared.value.toString().replace(/[^\d]/g, ''),
          Input_method: '物品保价页',
          request_result: '成功',
          failure_reason: '',
        },
      )
      try {
        await useProtectPriceValidate({
          field: 'declared',
          moduleStyle: ModuleStyle.弹窗,
        })
      } catch (error) {
        console.error(error)
      }
    }
  }, 500)
}

const onClear = () => {
  declaredLocal.value = ''
}

const _onInput = (value) => {
  declaredLocal.value = value
  _onFormatter(value)
}

const { platformInputDebounceTime } = getEnvConfig()

const _onFormatter = debounce((value) => {
  // 写入formatter后数据
  if (formatter) {
    const formatValue = formatter(value)
    setDeclared(formatValue)
    declaredLocal.value = formatValue
  }
}, platformInputDebounceTime)

/* 触发删除逻辑 */
// const handleDeclareClear = () => {
//   if (inputRef?.value?.inputRef?.clear) {
//     inputRef?.value?.inputRef?.clear()
//   }
//   onClear()
// }

// const handleContactPhone = () => {
//   let _phone = ''
//   try {
//     // 解决跳转到下单成功页 是openWebview，导致store数据丢失没有手机号的场景
//     const configJson = localStorage?.getItem('configOrderSuccessPageConfig')
//     if (configJson) {
//       const config = JSON.parse(configJson) as OrderSuccessPageConfig
//       _phone = config?.phone || ''
//     }
//     phone.value = piniaStore.root.getUserInfo?.phone || _phone || ''
//     popupVisible.value = true
//   } catch (e) {
//     console.log(e)
//   }
// }

const handleClickTips = () => {
  clk_express_single_insurance_statement_v1()
  router.push({
    path: '/item-insured-new',
  })
}

const formatter = (value: string | number) => {
  if (!value) {
    return ''
  }
  // const pattern = /^(?!0$)\d*$/
  // if (!pattern.test(value.toString())) {
  //   return ''
  // }
  let maxNum = 300000000
  if (Number(value.toString().replace(/[^\d]/g, '')) > maxNum) {
    let _value = value.toString().slice(0, 9)
    if (Number(_value) === maxNum) {
      return maxNum
    }
    return Number(value.toString()[0]) >= 3 ? value.toString().slice(0, 8) : value.toString().slice(0, 9)
  }
  return value.toString().replace(/^0+/g, '') // 开头数字不能为0
}

const handleCancelPopup = async () => {
  if (loading.value || internalState.buttonLoading) return

  isBlur.value = false

  loading.value = true

  setDeclared('')
  useUpdateOrderStore({ declarativeValue: '' })
  clk_express_protectprice_control_v1('不保价')
  // 这里重复触发过程中 使用store的数据
  try {
    await useProtectPriceValidate({
      field: 'declared',
    })
  } catch (error) {
    console.error(error)
  } finally {
    emit('close')
    loading.value = false
  }
}

onBeforeUnmount(() => {
  initAgreeContentResquest.value = true
})
</script>

<style lang="scss">
@import '@order-global-package-order-sub/styles/index.scss';
@import './index.scss';
</style>
