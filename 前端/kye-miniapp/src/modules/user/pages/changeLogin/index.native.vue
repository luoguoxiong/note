<template>
  <ky-container v-bind="pageOptions">
    <view class="change-login-phone">
      <div v-if="pageLoading" class="skeleton">
        <div class="card">
          <div class="tit"></div>
          <div class="cont"></div>
        </div>
        <div class="card">
          <div class="tit"></div>
          <div class="cont"></div>
        </div>
      </div>

      <div v-else>
        <div class="header">
          <div class="tip">{{ tipText }}</div>
          <div class="btn" @click="changeMode">
            <span>管理</span>
            <img
              v-if="isDeleteMode"
              src="https://ic-img.ky-express.com/netc/20231127_71367128368_!!1701053416332_65_65.png"
              alt=""
            />
          </div>
        </div>

        <div v-if="isDeleteMode" class="desc">仅清除本地登录记录，不删除数据信息</div>

        <div class="content_box">
          <div
            v-for="(item, index) in switchList"
            :key="'switchList' + index"
            :class="['content_item', item.loginFlag == 1 && 'current-login', { disabled: isDisabled(item) }]"
            @click="onChange(item)"
          >
            <div v-if="item.loginFlag" :class="['current_flag', { disabled: isDisabled(item) }]">当前登录</div>
            <div class="item_left">
              <img
                :class="{ disabled: isDisabled(item) }"
                :src="
                  item.headImg || 'https://ic-img.ky-express.com/netc/20231127_57667128348_!!1701056727724_232_232.png'
                "
                alt=""
              />
              <div class="info">
                <div :class="['info_phone', { disabled: isDisabled(item) }]">{{ phoneFilter(item.phone) }}</div>
                <div v-if="item.userName" :class="['info_nickname', { disabled: isDisabled(item) }]">
                  {{ item.userName }}
                </div>
              </div>
            </div>
            <div class="item_right">
              <div v-if="item.isLoading" class="change_loading">
                <van-loading color="#8365F6" text-color="#888EA6" size="24px">切换中...</van-loading>
              </div>
              <div v-if="isShowDeleteBtn(item)" class="delete_btn" @click="onDelete(item, index)">删除</div>
            </div>
            <div class="forbid-switch-login-mobile__wrapper" v-if="item.loginFlag == 1">
              <div class="forbid-switch-login-mobile">
                <div class="label-desc">
                  手机号禁止他人切换<img
                    @click="onShowDescription(item)"
                    src="https://ic-img.ky-express.com/netc/20240905_14362366148_!!1725521150013_26_26.svg+xml"
                    alt=""
                  />
                </div>
                <div class="switch-btn" @click="onForbidLoginSwitch(item)">
                  <img
                    src="https://ic-img.ky-express.com/netc/20240905_81062366139_!!1725523173797_133_74.png"
                    alt=""
                    v-if="canSwitchFlag == 1"
                    class="icon-switch"
                  />
                  <img
                    src="https://ic-img.ky-express.com/netc/20240905_41862366113_!!1725523169659_133_74.png"
                    alt=""
                    v-else
                    class="icon-switch"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div v-if="isShowAddBtn" class="add_btn" @click="onAdd">
          <img src="https://ic-img.ky-express.com/netc/20231127_91267128311_!!1701066933141_81_81.png" alt="" />
          <span>添加登录手机号</span>
        </div>

        <div v-if="!isDeleteMode && descText" class="footer">
          {{ descText }}
        </div>
      </div>
    </view>
    <!--  腾讯风控弹窗组件  -->
    <Captcha ref="captchaRef" @getCode="getCode"></Captcha>
  </ky-container>
</template>
<script setup lang="ts">
import './index.scss'
import { ref, computed, onMounted } from 'vue'
import { useRouter } from '@tarojs/taro'
import { showToast } from '@public/hooks/useShowToast'
import { showDialog } from '@kye-netc/kye-miniui'
import { getSwitchList, switchLogin, deleteSwitch, setSwitchFlag } from '../../apis/changeLogin'
import { SMS_CODE_TYPE, VerifyDialogType, ErrorResultCode } from './constants'
import { report_CLK_event, report_other_event } from '@public/utils'
import kyeNavigate from '@public/utils/native/navigate'
import { useLoginPublicParmas } from '@modules/user/pages/login/components/phone-login/hooks'
import { getLoginFromType } from '@public/constants'
import { loginSuccess } from '@modules/user/pages/login/service'
import { getFromName } from '@modules/user/pages/changeLogin/utils'
import Captcha from '@public/components/base/captcha/index.vue'

const RE_LOGIN_CODE = [100201, 60010]
const EXPIRATION_DATE_CODE = 16004
const FORBID_SWITCH_LOGIN = 17021
// 埋点page_code
const page_code = 'page_mine_seting_account_Switch_login'
// container页面配置
const pageOptions = ref({
  navBarOptions: {
    showPlatList: ['wx'],
    title: '切换登录手机号',
  },
})

const router = useRouter()

const smsTitle = ref('')
const smsPhone = ref('') // 发送验证码的手机号
const effectiveDays = ref(0) // 有效期天数配置
const captchaType = ref(SMS_CODE_TYPE.CHANGE_LOGIN_PHONE) // 验证码类型：12-切换登录手机号
const smsCodeShow = ref(false) // 是否弹出短信验证码
const currentItem = ref<any>({}) // 当前切换项
const pageLoading = ref(true) // 页面首次加载
const isDeleteMode = ref(false) // 是否删除模式
const switchList = ref<any[]>([])
const canSwitchFlag = ref(1) // 手机号禁止他人切换： 1-允许切换，0-不允许切换
const switchCount = ref(0) // 可添加手机号数量
const descText = ref('') // 底部描述文案
const showDescription = ref(false) // 手机号禁止他人切换说明弹窗
const hasConfirmButton = ref(false) // 是否通过添加手机号跳转添加登录手机号
/* 腾讯风控 */
const captchaCode = ref('')
const captchaRef = ref()
const captchaItem = ref<any>({}) // 当前触发风控的item

const urlParams = ref({
  from: '',
  deviceCode: '',
})

const tipText = computed(() => (isDeleteMode.value ? '删除登录痕迹' : '点击卡片可切换登录手机号'))

const phoneFilter = (phone: string) => {
  return (' ' + phone).replace(/(.{4})/g, '$1 ').trim()
}

const isShowAddBtn = computed(() => !isDeleteMode.value && switchList.value.length < switchCount.value)

const isShowDeleteBtn = (item: any) => isDeleteMode.value && !item.loginFlag
const isDisabled = (item: any) => isDeleteMode.value && item.loginFlag
/**
 * 打开手机号禁止切换描述弹窗
 * @param {Object} item
 */
const onShowDescription = (item: any) => {
  console.log('onShowDescription')
  report_CLK_event('clk_mine_seting_account_Switch_login_button', {
    page_code,
    button_name: '禁止切换登录说明',
  })
  showDialog({
    parentClassName: 'change-login-phone',
    title: '温馨提示',
    message: `· 开启后，${item.phone}将不允许被其他手机号操作【一键切换登录】\n· 关闭后，${item.phone}将允许被其他手机号操作【一键切换登录】`,
    confirmButtonText: '我知道了',
  })
}
/**
 * 打开手机号禁止切换描述弹窗
 * @param {Object} item
 */
const onForbidLoginSwitch = async (item: any) => {
  try {
    const isForbid = canSwitchFlag.value === 1
    await showDialog({
      parentClassName: 'change-login-phone',
      title: `确定${isForbid ? '禁止' : '允许'}【${phoneFilter(item.phone)}】被切换登录吗？`,
      message: `确定后将进行短信验证，验证通过后该手机号将${isForbid ? '无法' : '可以'}被其他手机号【一键切换登录】`,
      showCancelButton: true,
      confirmButtonText: '确定',
      cancle: () => {
        console.log(11)
      },
      confirm: () => {
        console.log(22)
      },
    })
    console.log('>>>confirm')
    smsPhone.value = item.phone
    smsTitle.value = `验证码将发送到您手机号${item.phone}，请查看后输入`
    captchaType.value = isForbid ? SMS_CODE_TYPE.OPEN_LOGIN_MOBILE_SWITCH : SMS_CODE_TYPE.CLOSE_LOGIN_MOBILE_SWITCH
    smsCodeShow.value = true
  } catch (e) {
    console.log(e)
  }
}

const onSetSwitchLoginMobile = async () => {
  try {
    const isForbid = canSwitchFlag.value === 1
    const res = await setSwitchFlag({
      canSwitchFlag: isForbid ? 0 : 1,
      from: urlParams.value.from,
    })
    if (res.code === 0) {
      await getSwitchListApi()
      showToast(`${isForbid ? '开启' : '关闭'}成功`)
    } else if (res.msg) showToast(res.msg)
  } catch (e) {
    console.log(e)
  }
}

const onAdd = () => {
  hasConfirmButton.value = true
  // const deviceType = getSystemDeviceTypeQuery()
  // router.push({
  //   url: `/add?from=${urlParams.value.from}&deviceType=${encodeURIComponent(deviceType)}`,
  // })
  kyeNavigate.navigateTo({
    url: '/modules/user/pages/changeLoginAdd',
  })
}

const handleNext = () => {
  smsCodeShow.value = false
  if (captchaType.value === SMS_CODE_TYPE.CHANGE_LOGIN_PHONE) {
    onChange(currentItem.value)
  } else {
    onSetSwitchLoginMobile()
  }
}

/**
 * 切换成功需通知原生更新登录状态
 * @param info
 */
const refreshLoginStatus = (info: any) => {
  console.log('refreshLoginStatus', info)
  if (info) {
    loginSuccess(info)
  }
}
/* 获取关联手机号 */
const getSwitchListApi = async () => {
  const { code, data, msg } = await getSwitchList(urlParams.value)
  if (code === 0) {
    switchList.value = data.switchList
    descText.value = data.desc
    switchCount.value = data.switchCount
    effectiveDays.value = data.effectiveDays
    canSwitchFlag.value = data.canSwitchFlag
    pageLoading.value = false
  } else {
    showToast(msg || '请求异常，请重新操作')
  }
}
// 删除关联手机号
const deleteSwitchApi = async (id, idx) => {
  const { deviceType } = useLoginPublicParmas()
  const { from, deviceCode } = urlParams.value || {}
  const params = {
    id,
    from,
    deviceCode,
    deviceType,
  }
  const { code, msg } = await deleteSwitch(params)
  if (code === 0) {
    // 调删除接口成功后，前端手动删除数据
    switchList.value?.splice(idx, 1)
    showToast('删除成功')
    report_other_event('other_mine_seting_account_Switch_login_add', {
      page_code,
      request_type: '删除手机号',
      login_source: getFromName(from),
      request_result: '成功',
    })
  } else if (code && RE_LOGIN_CODE.includes(code)) {
    // 新原生逻辑-退登逻辑走公共即可
    // logoutTipApi()
  } else {
    showToast(msg || '请求异常，请重新操作')
    report_other_event('other_mine_seting_account_Switch_login_add', {
      page_code,
      request_type: '删除手机号',
      login_source: getFromName(from),
      request_result: '失败',
      failure_reason: msg,
    })
  }
}

const onChange = async (item, safeVerifyId = '') => {
  // 删除模式不可切换
  if (isDeleteMode.value) {
    return
  }
  // 有正在loading的不可切换
  const idx = switchList.value?.findIndex((item) => item.isLoading)
  if (idx > -1) {
    return
  }
  // 当前登录的不可切换
  if (item.loginFlag) {
    return
  }
  report_CLK_event('clk_mine_seting_account_Switch_login_button', {
    button_name: '切换手机号',
    page_code: page_code,
  })
  // 微信app匹配
  const targetParams = useLoginPublicParmas()
  const requestParams = {
    ...targetParams,
    from: urlParams.value.from,
    phone: item.phone, // 用户选择登录的手机号
    safeVerifyId: safeVerifyId || undefined, // 图形验证码验证接口返回
  }
  item.isLoading = true

  try {
    const res = await switchLogin(requestParams)
    if (res.code === 0) {
      showToast('切换成功')
      // 切换成功需通知原生更新登录状态
      refreshLoginStatus(res.data)

      // 关闭原有当前登录
      const loginItem = switchList.value.find((item) => item.loginFlag)
      loginItem.loginFlag = false

      // 手动设置当前登录
      item.loginFlag = true
      getSwitchListApi()

      report_other_event('other_mine_seting_account_Switch_login_add', {
        button_name: '切换手机号',
        page_code: page_code,
        request_result: '成功',
        login_source: getFromName(urlParams.value.from),
      })
    } else if (res.code === ErrorResultCode.VERIFY_CODE) {
      // 风控校验错误码，1-图形验证码，2-已锁定不需要弹窗图形验证，4-滑块
      if (res.data.type === VerifyDialogType.HAS_LOCKED) {
        showToast(res.data.msg)
      } else {
        if (!res.data.ruleId || !res.data.strategyCode) {
          return showToast('图形验证码参数错误')
        }
        // 打开腾讯风控弹窗
        captchaItem.value = item
        captchaRef.value?.showCaptcha(
          {
            ruleId: res.data.ruleId,
            strategyCode: res.data.strategyCode,
            phone: item.phone,
          },
          { type: res.data.type, unToken: true },
        )
        // 风控回调逻辑
        // if (verifyResult && verifyResult?.safeVerifyId) {
        //   item.isLoading = false
        //   onChange(item, verifyResult?.safeVerifyId)
        // }
      }
    } else if (res.code === EXPIRATION_DATE_CODE) {
      // 登录状态超出有效期，触发验证码组件
      currentItem.value = item
      smsPhone.value = item.phone
      smsTitle.value = ''
      captchaType.value = SMS_CODE_TYPE.CHANGE_LOGIN_PHONE
      smsCodeShow.value = true
    } else if (RE_LOGIN_CODE.includes(res.code)) {
      // 新原生逻辑-退登逻辑走公共即可
      // logoutTipApi()
    } else if (res.code === FORBID_SWITCH_LOGIN) {
      report_other_event('other_mine_seting_account_Switch_login_add', {
        request_type: '切换手机号',
        login_source: getFromName(urlParams.value.from),
        request_result: '失败',
        failure_reason: res.msg,
      })
      showDialog({
        parentClassName: 'change-login-phone',
        title: '温馨提示',
        message: `手机号${item.phone}已设置禁止使用切换登录功能，暂不支持切换登录，如需登录可退登后使用账密或验证码进行登录`,
        confirmButtonText: '我知道了',
        className: 'base-dialog',
        messageAlign: 'left',
      }).catch((e) => {
        console.log(e, ':>>> e')
      })
    } else {
      showToast(res.msg || '请求异常，请重新操作')
      report_other_event('other_mine_seting_account_Switch_login_add', {
        request_type: '切换手机号',
        login_source: getFromName(urlParams.value?.from),
        request_result: '失败',
        failure_reason: res.msg,
      })
    }
  } catch (err) {
  } finally {
    item.isLoading = false
  }
}

// 切换模式
const changeMode = () => {
  if (isDeleteMode.value) {
    report_CLK_event('clk_mine_seting_account_Switch_login_button', {
      button_name: '退出管理',
      page_code: page_code,
    })
  } else {
    report_CLK_event('clk_mine_seting_account_Switch_login_button', {
      button_name: '管理',
      page_code: page_code,
    })
  }
  isDeleteMode.value = !isDeleteMode.value
}

// 点击删除
const onDelete = (item, index) => {
  // 非删除模式不可删除
  if (!isDeleteMode.value) {
    return
  }
  report_CLK_event('clk_mine_seting_account_Switch_login_button', {
    button_name: '删除手机号',
    page_code,
  })
  showDialog({
    parentClassName: 'change-login-phone',
    title: `确认删除${item.phone}登录记录吗？`,
    message: '删除后，仅清除本地的登录记录，不删除手机号的数据信息。',
    confirmButtonText: '确定',
    messageAlign: 'left',
    className: 'delete_dialog',
  })
    .then(() => {
      deleteSwitchApi(item.id, index)
    })
    .catch(() => {})
}

/* 获取腾讯风控回调 */
const getCode = async (code: string) => {
  try {
    captchaCode.value = code
    const item = captchaItem.value
    if (code) {
      item.isLoading = false
      onChange(item, code)
    }
  } catch (error) {
    console.log(error)
    throw error
  }
}

/* 初始化平台字段 */
const initFrom = () => {
  const from = getLoginFromType()
  const { deviceCode } = useLoginPublicParmas() || {}
  urlParams.value = {
    from,
    deviceCode,
  }
}

onMounted(async () => {
  initFrom()
  await getSwitchListApi()
})
</script>
