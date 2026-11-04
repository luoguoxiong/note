<template>
  <k-dialog
    class="common-contact--container"
    title="联系商务"
    width="360px"
    :hasFooter="false"
    @update:modelValue="updateModelValue"
    :model-value="visible"
  >
    <div class="mobile-container" v-if="status !== 'error'">
      <div class="mobile-btns" v-if="businessWxShow">
        <el-button-group>
          <KButton
            type="default"
            v-for="(item, index) in tabs"
            :key="item.label"
            :class="[
              {
                cur: index === curTab,
              },
            ]"
            @click="onTabClick(index)"
          >
            {{ item.label }}
          </KButton>
        </el-button-group>
      </div>
      <!-- 商务手机号码 -->
      <div class="mobile-content" v-if="curTab === MOBILE_TAB">
        <div class="mobile-phone">
          <div class="mobile-content__title">输入您用来拨号的手机号或座机号，为您获取商务号码</div>
          <div class="mobile--wrapper">
            <!-- <el-input v-model="formattedPhoneNumber" @input="handleInput" maxlength="13" />
            <el-button type="primary" @click="getVirtualMobile">获取商务号码</el-button> -->
            <el-form ref="mobileFormRef" :model="ruleForm" :rules="rules">
              <el-form-item label="" prop="mobile">
                <el-input
                  v-model="ruleForm.mobile"
                  @input="handleInput"
                  maxlength="21"
                  size="small"
                  placeholder="请输入手机号或座机号"
                  clearable
                />
              </el-form-item>
            </el-form>
            <KButton @click="getVirtualMobile">获取商务号码</KButton>
          </div>
          <div class="virtal-mobile--wrapper" v-if="businessVirtualMobile">
            <div>
              <span class="text">商务电话：</span>
              <span class="mobile">{{ formatPhoneNumber(businessVirtualMobile) }}</span>
              <img src="./copy.svg" class="icon-copy" @click="copyText(businessVirtualMobile)" />
            </div>
            <!-- <div>用您输入的手机号码，拨打该号码联系商务</div> -->
            <div class="desc">
              为保障您的隐私安全，请用您输入的{{
                `${!isPhone(currentMobile) ? '座机号' : '手机号'}${currentMobile}`
              }}，拨打商务电话
            </div>
          </div>
        </div>
      </div>

      <!-- 商务企业微信 -->
      <div class="mobile-content" v-if="curTab === WX_WORK_TAB && businessWxShow">
        <div class="wxwork-qrcode">
          <div v-if="status === 'loaded' && businessWxWorkQRCode">
            <div class="wxwork-qrcode__title">微信扫描二维码，添加商务微信</div>
            <div class="wxwork-qrcode__qrcode">
              <img :src="businessWxWorkQRCode" alt="企业微信二维码" />
            </div>
          </div>
          <div v-else-if="status === 'loaded' && !businessWxWorkQRCode">
            <div class="wxwork-qrcode__noresult">
              <result text="暂无企业微信，请拨打95324进行咨询" />
            </div>
          </div>
          <div v-else-if="status === 'error'">
            <div class="wxwork-qrcode__noresult">
              <result text="获取数据出错，请稍后再试" />
            </div>
          </div>
          <img src="./load.svg" v-else-if="status === 'loading'" class="loading-img" alt="" />
        </div>
      </div>
    </div>
    <div class="mobile-container apply-customer-code" v-else>
      <img class="image" src="@/assets/contact-none.png" />
      <div>
        <p class="title">暂未匹配到商务</p>
        <p class="text">
          您可拨打
          <span class="highlight">95324</span>
          {{ `联系人工客服咨询，或点击【${isExclusive ? '申请专属商务' : '申请客户编码'}】为您匹配专属商务` }}
        </p>
      </div>
      <KButton class="btn" type="primary" @click="handleApplyCustomerCode">
        {{ isExclusive ? '申请专属商务' : '申请客户编码' }}
      </KButton>
    </div>
  </k-dialog>
</template>

<script setup lang="ts">
import { KButton, KDialog } from '@netc-design-pc/ui'
import { useCopyText } from '@/hooks/useCopyText'
import { ref, computed, watch, reactive } from 'vue'
import { getMarketVirtualContact } from '@/apis/waybillApi'
import result from './result.vue'
import auth from '@/utils/auth'
import { parentMessageSend } from '@/utils/appBridge'
import { useLinkTo } from '@/hooks'
const props = defineProps({
  visible: {
    type: Boolean,
    default: false,
  },
  isExclusive: {
    type: Boolean,
    default: false,
  },
})

const { linkToApplyCustomerCode } = useLinkTo()

const WX_WORK_TAB = 0
const MOBILE_TAB = 1
const DEFAULT_TAB = WX_WORK_TAB

const { copyText } = useCopyText()

const tabs = ref([
  {
    label: '商务企业微信',
  },
  {
    label: '商务手机号码',
  },
])

const businessVirtualMobile = ref('')

const businessWxWorkQRCode = ref('')
const status = ref('ready')
const curTab = ref(DEFAULT_TAB)

/**
 * 校验手机号或座机号
 * @param {string} value - 用户输入的电话号码
 * @returns {boolean} 是否合法
 */
// eslint-disable-next-line complexity
const validatePhoneOrLandline = (value: string): boolean => {
  if (!value) return false
  // 去除所有空格
  let str = value.replace(/\s+/g, '')

  // 1. 先校验手机号（11位，1开头）
  const mobileReg = /^1[3-9]\d{9}$/
  if (mobileReg.test(str)) {
    return true
  }

  // 2. 校验 400/800 客服热线、三位数区号
  // 支持：4001234567、400-1234567、8001234567、800-1234567
  const hotlineReg = /^(400|800)(-)?\d{5,10}$/
  if (hotlineReg.test(str)) {
    // 检查总长度是否 <= 21
    const digitsOnly = str.replace(/-/g, '')
    if (digitsOnly.length <= 21) {
      return true
    }
  }

  // 3. 处理座机号（含区号）
  let hasHyphen = str.includes('-')
  let areaCode = ''
  let phoneNumber = ''

  if (hasHyphen) {
    // 3.1 带横杠的情况：必须只有1个横杠
    if ((str.match(/-/g) || []).length !== 1) {
      return false
    }
    const parts = str.split('-')
    if (parts.length !== 2) return false
    areaCode = parts[0]
    phoneNumber = parts[1]

    // 区号必须以0开头，3-4位数字
    if (!/^0\d{2,3}$/.test(areaCode)) {
      return false
    }
    // 座机号必须是7-8位数字
    if (!/^\d{7,8}$/.test(phoneNumber)) {
      return false
    }
  } else {
    // 3.2 不带横杠：尝试自动分割区号
    if (!/^\d+$/.test(str)) {
      return false // 必须全是数字
    }

    // 如果以0开头，且长度 >= 10（3位区号+7位号码）或 >=11（4位区号+7位）
    if (str.startsWith('0')) {
      // 尝试按4位区号分割（优先）
      if (str.length >= 11 && str.length <= 12) {
        areaCode = str.slice(0, 4)
        phoneNumber = str.slice(4)
      }
      // 尝试按3位区号分割
      else if (str.length >= 10 && str.length <= 11) {
        areaCode = str.slice(0, 3)
        phoneNumber = str.slice(3)
      } else {
        return false // 长度不符合
      }

      // 验证区号和号码
      if (!/^0\d{2,3}$/.test(areaCode)) return false
      if (!/^\d{7,8}$/.test(phoneNumber)) return false
    } else {
      // 不以0开头：视为无区号座机号（7-8位）
      if (/^\d{7,8}$/.test(str) && !str.startsWith('1')) {
        return true
      } else {
        return false
      }
    }
  }

  return true
}

const isPhone = (str: string) => {
  const phone = (str + '').replace(/\D/g, '')
  const mobileReg = /^1[3-9]\d{9}$/
  if (mobileReg.test(phone)) {
    return true
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const validatePass = (_: any, value: string, callback: any) => {
  const flag = validatePhoneOrLandline(value)
  if (value === '') {
    callback(new Error('请输入手机号或座机号'))
  } else if (!flag) {
    if (!value.startsWith('1')) {
      callback(new Error('请输入正确的座机号'))
    } else {
      callback(new Error('请输入正确的手机号'))
    }
  } else {
    callback()
  }
}
// 手机号码
const currentMobile = ref('') // 当前选中的手机号码
const ruleForm = reactive({ mobile: '' })
const rules = reactive({
  mobile: [
    { required: true, message: '请输入手机号或座机号', trigger: ['blur', 'change'] },
    { validator: validatePass, trigger: ['blur', 'change'] },
  ],
})

const emits = defineEmits(['close'])

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const getMarketVirtualContacts = async (mobile: any, isFirst: boolean) => {
  if (['loading'].includes(status.value)) return
  try {
    status.value = 'loading'
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, code } = (await getMarketVirtualContact(mobile)) as any
    if (code === 0 && data) {
      if (!isFirst) {
        businessVirtualMobile.value = data?.virtualPhone || ''
      }
      businessWxWorkQRCode.value = data?.qrcode || ''
      if (isFirst) {
        curTab.value = businessWxWorkQRCode.value ? WX_WORK_TAB : MOBILE_TAB
      }
      // if (!isFirst) {
      //   businessVirtualMobile.value = '18888888888'
      // }
      // businessWxWorkQRCode.value = 'https://ic-img.ky-express.com/netc/20221224_79163213438_!!1671891849145_364_364.png'
      status.value = 'loaded'
    } else {
      status.value = 'error'
      curTab.value = MOBILE_TAB
    }
  } catch (err) {
    curTab.value = MOBILE_TAB
    status.value = 'error'
  }
}

const phoneNumber = ref(sessionStorage.getItem('PHONE'))

const businessWxShow = computed(() => {
  return !!businessWxWorkQRCode.value
})

const formattedPhoneNumber = computed({
  get() {
    return formatPhoneNumber(phoneNumber.value)
  },
  set(value) {
    phoneNumber.value = value
  },
})

watch(
  [props],
  async () => {
    if (props.visible) {
      curTab.value = DEFAULT_TAB
      const userInfoAsync = await auth.getUserInfoApi()

      if (userInfoAsync.phone) {
        ruleForm.mobile = formatPhoneNumber(userInfoAsync.phone)
        phoneNumber.value = formatPhoneNumber(userInfoAsync.phone)
        getMarketVirtualContacts(userInfoAsync.phone, true)
      }
    }
  },
  {
    immediate: true,
  }
)

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function formatPhoneNumber(number: any) {
  const reg = /^1[3456789]\d{9}$/
  if (!reg.test(`${number}`)) {
    return number
  }
  const cleaned = ('' + number).replace(/\D/g, '') // 去掉非数字字符
  if (cleaned.length <= 7) {
    return cleaned.replace(/(\d{3})(\d{1,4})/, '$1 $2')
  } else {
    return cleaned.replace(/(\d{3})(\d{4})(\d{1,4})/, '$1 $2 $3')
  }
}
function threeAreaCode(str: string) {
  const area = ['400', '800', '010', '022', '024', '021', '025', '027', '020', '028', '029', '023']
  return area.some((i: string) => str.startsWith(i))
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function handleInput(event: any) {
  let val = event
  // 区号与座机号间无 -
  if (
    val.startsWith('0') &&
    !threeAreaCode(val) &&
    (val.match(/-/g) || []).length === 0 &&
    val.length >= 4 &&
    formattedPhoneNumber.value.length < val.length
  ) {
    val = val.slice(0, 4) + '-' + val.slice(4)
  }
  // 400和800客服热线与座机号间无 -
  if (
    threeAreaCode(val) &&
    (val.match(/-/g) || []).length === 0 &&
    val.length >= 3 &&
    formattedPhoneNumber.value.length < val.length
  ) {
    val = val.slice(0, 3) + '-' + val.slice(3)
  }
  // 限制输入一个 -
  if ((val.match(/-/g) || []).length > 1 && val.slice(-1) === '-') {
    val = val.slice(0, -1)
  }
  formattedPhoneNumber.value = val
  ruleForm.mobile = formattedPhoneNumber.value
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const onTabClick = (index: any) => {
  if (status.value === 'loading') return
  curTab.value = index
  if (index === WX_WORK_TAB) {
    const phoneNum = ('' + phoneNumber.value).replace(/\D/g, '') // 去掉非数字字符
    getMarketVirtualContacts(phoneNum, false)
  }
}
const getVirtualMobile = async () => {
  let phoneNun = '' + phoneNumber.value
  const flag = validatePhoneOrLandline(phoneNun)
  if (!flag) {
    parentMessageSend({
      message: '请输入正确的手机号或座机号',
      type: 'warning',
    })
  } else {
    phoneNun = ('' + phoneNun).replace(/\D/g, '')
    currentMobile.value = ruleForm.mobile
    getMarketVirtualContacts(phoneNun, false)
  }
}

const updateModelValue = (value: boolean) => {
  !value && onClose()
}

const onClose = () => {
  emits('close')
  businessVirtualMobile.value = ''
}
const handleApplyCustomerCode = () => {
  onClose()
  linkToApplyCustomerCode()
}
</script>

<style lang="scss" scoped>
@import './common-contact.scss';
</style>
<style lang="scss">
.common-contact--container {
  .desc {
    margin-top: 16px;
    line-height: 20px;
    font-size: 13px;
    font-weight: normal;
    line-height: normal;
    color: #686b75;
  }
}
.mobile--wrapper {
  display: flex;
  padding-top: 23px;

  button {
    margin-left: 12px;
  }
  .el-input__wrapper {
    input {
      height: 30px;
    }
  }
  .el-button--small {
    padding: 9px 17px;
  }
}

.apply-customer-code {
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-items: center;
  .title {
    font-size: 13px;
    font-weight: 600;
    color: #24262b;
    text-align: center;
    line-height: 20px;
    margin-bottom: 6px;
  }
  .text {
    text-align: center;
    font-size: 12px;
    line-height: 18px;
    width: 256px;
    color: #8c8f99;
    .highlight {
      color: #ff8c00;
    }
  }
  .btn {
  }
  .image {
    width: 120px;
    height: 120px;
  }
}
</style>
