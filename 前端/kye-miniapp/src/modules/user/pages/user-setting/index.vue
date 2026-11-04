<template>
  <ky-container v-bind="pageOptions" style="background-color: #fff" :class="`${classPrefix}`">
    <view :class="`${classPrefix}__container`">
      <!--  修改头像    -->
      <view :class="`${classPrefix}__header`">
        <view @tap.stop="handleUpdateAvatar" :class="`${classPrefix}__avatar`">
          <image mode="aspectFill" :src="showUserAvatar" :key="showUserAvatar" />
          <image
            v-if="supportUpdateAvatar"
            src="https://ic-img.ky-express.com/netc/20250725_41221_!!1753409753921_56_56.png"
          />
        </view>
        <text v-if="supportUpdateAvatar">修改头像</text>
      </view>
      <view :class="`${classPrefix}__content`">
        <!--   配置列表     -->
        <view :class="`${classPrefix}__config-lists`">
          <ky-cell-group>
            <ky-cell
              title="昵称"
              placeholder="请填写"
              @tap.stop="onEditUserName"
              isLink
              :value="userInfo?.userName"
            ></ky-cell>
            <ky-cell title="性别">
              <template #value>
                <ky-radio-group
                  class="ky-sex-radio-group"
                  type="check"
                  v-model="sex"
                  direction="horizontal"
                  @change="onUserSexChange"
                >
                  <ky-radio type="check" name="1">女</ky-radio>
                  <ky-radio type="check" name="2">男</ky-radio>
                </ky-radio-group>
              </template>
            </ky-cell>
            <ky-cell
              title="生日"
              placeholder="请选择"
              :isLink="!formInfo.birthday"
              :disabled="!!formInfo.birthday"
              @click="onShowBirthDayPicker"
              :value="formInfo.birthday"
            >
              <template #value v-if="userInfo.birthday">
                {{ userInfo.birthday }}
              </template>
            </ky-cell>
            <ky-cell class="current-company" title="当前绑定公司" placeholder="未绑码" isLink @click="handleCurrentCompany">
              <template #value v-if="customerInfo?.customerShortName">{{ customerInfo.customerShortName }}</template>
            </ky-cell>
            <ky-cell title="公司职务" placeholder="未选择" isLink @click="handleChangePosition">
              <template #value v-if="userInfo?.position">{{ userInfo.position }}</template>
            </ky-cell>
            <ky-cell title="手机号" :disabled="!!userInfo?.phone">
              <template #value>
                <text>{{ formatPhone(userInfo?.phone) }}</text>
              </template>
            </ky-cell>
            <ky-cell title="注册时间" class="register-cell" disabled>
              <template #value>
                <view class="register-time">
                  <view class="register-time-left">
                    <image
                      class="register-img"
                      src="https://ic-img.ky-express.com/netc/20250722_53934_!!1753174065666_181_58.png"
                    />
                  </view>

                  <view class="register-time-num">
                    <image
                      v-for="(item, index) in filterDay()"
                      :key="index"
                      :src="registerTimeImages[`img${item}`]"
                      class="register-time-num-item"
                    ></image>
                  </view>
                  <view class="register-time-day">
                    <image class="register-img" :src="registerTimeImages['day']" />
                  </view>
                  <view>({{ userInfo?.registrationTime || '--' }})</view>
                </view>
              </template>
            </ky-cell>
          </ky-cell-group>
        </view>

        <view :class="`${classPrefix}__group`"></view>

        <view v-if="realNameInfo" class="real-name-verify" @tap.stop="openRealNameVerify">
          <view class="real-name-verify__title">实名认证</view>
          <view class="real-name-verify__card">
            <view class="real-name-verify__title">
              <view class="real-name-verify__title-label">{{ realNameInfo.authFlagName }}</view>
              <view class="real-name-verify__title-btn">{{ realNameInfo.authButtonName }}</view>
            </view>
            <view class="real-name-verify__desc">{{ realNameInfo.authDesc }}</view>
          </view>
        </view>
        <!--  生日弹窗      -->
        <user-birthday-popup ref="userBirthDayPopRef" @onConfirm="handleBirthDayConfirm" />
      </view>
    </view>
    <ImageCropper
      v-model:show="showCropper"
      :img="cropperImage"
      :autoCropWidth="745"
      :autoCropHeight="300"
      @cancel="showCropper = false"
      @complete="handleCropperComplete"
    />
  </ky-container>
  <!-- 绑码组件弹窗 -->
  <CustomerBindDialog
    :expressType="expressType"
    :needAdjustPosition="true"
    v-model:visible="isShowCustomerBindDialog"
  ></CustomerBindDialog>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import Taro, { useDidShow } from '@tarojs/taro'
import { formatPhone, getUserAvatar, selectedValueToDateStr } from './utils'
import { registerTimeImages } from '@modules/user/pages/user-setting/constants'
import UserBirthdayPopup from '@modules/user/pages/user-setting/components/user-birthday-popup.vue'
import { modifyUserInfo, uploadUserAvatar } from '../../apis/user'
import { useBindCustomer } from '@/public/hooks/useBindCustomer'
import { navigateWithParams } from '@/layout/pages/home/hooks'
import { ApplicationCodeMap } from '@/public/utils/application/constants'
import ImageCropper from './components/cropper/index.vue'
import { getEnvConfig } from '@/public/constants'
import { reportUserSettingUv, report_EXP_page_edite_person_v1, reportCustomeCodeClick } from '../../report/user.ts'
import './index.scss'
import { useUpdateSomeUserInfoV1 } from '@/public/hooks/useUpdateSomeUserInfoV1'
import { storeToRefs } from 'pinia'
import { useGeneralDataHook } from '@public/storage/hooks/useGeneralDataHook'
import { getRedirectUrl } from '@/public/hooks/useRedirectH5ToNative'
import CustomerBindDialog from '@/modules/user/pages/customer-code/customer-code-popup/index.vue'

const { updateGlobalUserInfo } = useGeneralDataHook()

const { getSettingUserInfo, globalUserStore } = useUpdateSomeUserInfoV1()

const store = storeToRefs(globalUserStore)
const userInfo = computed(() => {
  return store.data.value.userInfo
})

const expressType = ref('个人中心绑码')

const customerInfo = computed(() => {
  return store.data.value.customerInfo
})

defineOptions({ name: 'user-setting' })

const classPrefix = 'user-setting'
const userAvatar = ref<string | null>('')
const isShowCustomerBindDialog = ref(false)
const showUserAvatar = computed(() => {
  if (userAvatar.value) return userAvatar.value
  if (userInfo.value?.headUrl) return userInfo.value.headUrl
  if (sex?.value + '' === '1') {
    return 'https://ic-img.ky-express.com/netc/20251121_90143_!!1763698418360_236_236.png'
  }
  if (sex?.value + '' === '2') {
    return 'https://ic-img.ky-express.com/netc/20251121_4860_!!1763698418364_236_236.png'
  }
  return 'https://ic-img.ky-express.com/netc/20251121_85958_!!1763698337365_236_236.png'
})

const pageOptions = ref({
  navBarOptions: { showPlatList: ['wx'], title: '' },
})

const formInfo = ref({ birthday: userInfo.value?.birthday || '' })

const sex = ref(userInfo.value?.sex + '' || '3')
const oldSex = ref(userInfo.value?.sex + '' || '3')

watch(userInfo, () => {
  sex.value = userInfo.value?.sex + ''
  oldSex.value = userInfo.value?.sex + ''
  console.log('onUserSexChangewatch', sex.value)
  formInfo.value.birthday = userInfo.value?.birthday || ''
})

const userBirthDayPopRef = ref<null | InstanceType<typeof UserBirthdayPopup>>(null)

const { openCustomerPage } = useBindCustomer({ openCustomerApi: false })

/* 切换性别 */
const onUserSexChange = (value) => {
  console.log('onUserSexChange', sex.value, value)
  if (oldSex.value === value) return

  sex.value = value
  oldSex.value = value
  modifyUserInfo({ sex: sex.value }).then(() => {
    Taro.showToast({ title: '设置成功', icon: 'none' })
    updateGlobalUserInfo({
      sex: value,
    })
  })
}

/* 展示生日选项弹窗 */
const onShowBirthDayPicker = () => {
  if (userInfo.value?.birthday || formInfo.value.birthday) {
    return
  }
  userBirthDayPopRef?.value?.showPicker()
}

/* 勾选生日日期 */
const handleBirthDayConfirm = async ({ selectedValue }, date) => {
  const res = await new Promise<{ confirm: boolean }>((success, fail) => {
    Taro.showModal({
      title: '温馨提示',
      content: '为了不影响您的生日福利发放，请准确选择您的生日信息，设置后不可更改，是否保存？',
      confirmColor: '#8365F6',
      cancelColor: '#999999',
      success,
      fail,
    })
  })
  if (!res?.confirm) return

  modifyUserInfo({ birthday: selectedValueToDateStr(selectedValue) }).then(() => {
    formInfo.value.birthday = selectedValueToDateStr(selectedValue)
    // Taro.showToast({ title: '修改成功' })
  })
}

/* 日期  */
const filterDay = () => {
  if (!userInfo.value?.registrationDay) return ['0']
  let registrationDay = userInfo.value?.registrationDay + ''
  return registrationDay.split('')
}

const cropper = ref()

const cropperImage = ref('')
const showCropper = ref(false)
const env = getEnvConfig()

const supportUpdateAvatar = computed(() => {
  // pc 企业微信 不支持
  if (env.isCompanyWx && env.isPc) return false
  return true
})

const handleUpdateAvatar = async () => {
  // pc 企业微信 不支持
  if (!supportUpdateAvatar.value) return

  const avatar = await getUserAvatar()

  if (!avatar) return

  cropperImage.value = avatar!
  showCropper.value = true
  cropper.value?.reInit()
}

const handleCropperComplete = async (base64: string) => {
  userAvatar.value = base64
  showCropper.value = false

  try {
    Taro.showLoading({ title: '上传中...' })
    await uploadUserAvatar({ base64: base64.toString(), phone: userInfo.value.phone })
    await getSettingUserInfo()
  } finally {
    Taro.hideLoading()
  }
}

useDidShow(async () => {
  reportUserSettingUv()
  report_EXP_page_edite_person_v1()
  await getSettingUserInfo()
})

const onEditUserName = () => {
  const name = userInfo.value?.userName ? encodeURIComponent(userInfo.value.userName) : ''
  Taro.navigateTo({
    url: `/modules/user/pages/userEdit/index?name=${name}`,
  })
}

const openPositionPage = () => {
  navigateWithParams(ApplicationCodeMap['用户-职务编辑'], { form: 9 })
}

const handleChangePosition = () => {
  if (customerInfo.value?.customerShortName) {
    openPositionPage()
  } else {
    Taro.showModal({
      title: '温馨提示',
      content: '请先绑定客户编码，再设置职务哦~',
      cancelColor: '#999999',
      confirmText: '去绑定',
      confirmColor: '#8365F6',
      cancelText: '我再想想',
      showCancel: true,
      success: (res) => {
        if (res.confirm) {
          reportCustomeCodeClick('职务')
          // openCustomerPage('个人中心职务')
          expressType.value = '个人中心职务'
          isShowCustomerBindDialog.value = true
        }
      },
    })
  }
}

// 点击当前绑定公司
const handleCurrentCompany = () => {
  reportCustomeCodeClick('绑定公司')
  expressType.value = '个人中心绑码'
  // openCustomerPage('个人中心绑码')
  isShowCustomerBindDialog.value = true
}

const openRealNameVerify = async () => {
  const url = await getRedirectUrl('/modules/user/pages/realname/home/index')
  if (url) {
    Taro.navigateTo({ url: url })
  } else {
    navigateWithParams(ApplicationCodeMap['实名认证'])
  }
}

const realNameInfo = computed(() => {
  const realNameInfo = store.data.value.real
  return realNameInfo?.personalPageRealNameTagVO as any
})
</script>
