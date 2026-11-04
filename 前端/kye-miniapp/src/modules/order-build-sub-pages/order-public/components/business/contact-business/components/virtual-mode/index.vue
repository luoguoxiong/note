<template>
  <div class="virtual-mode">
    <BottomPopup no-padding v-model:show="visible" :title="`联系${props?.title}`" :show-footer="false" @onClose="close">
      <div class="out-content">
        <div class="phone-block" v-if="active">
          <!-- 联系方式 -->
          <div class="main-content">
            <div class="tip-text">将用此手机号码联系{{ props?.title }}</div>
            <div class="phone" v-if="!isShowInput">
              {{ formatterPhone(showTel || '') }}
              <span @click="editHandel" class="icon-edit-content">
                <SvgIcon name="icon-edit"></SvgIcon>
              </span>
            </div>
            <div class="input-content" data-validate="content.phone">
              <KyInput
                v-show="isShowInput"
                :showBorder="true"
                :autofocus="true"
                type="tel"
                :maxlength="13"
                v-model="tel"
                clearable
                placeholder="请输入手机号"
                :formatter="formatterPhone"
                @blur="checkPhone"
              />
            </div>
          </div>
          <div class="footer">
            <div v-if="!props.hideWeChat" class="btn-item wechat" @click="getWeChat">获取商务企业微信</div>
            <div class="btn-item call" :class="props.hideWeChat ? 'independent' : ''" @click.stop="callHandel">
              拨打
            </div>
          </div>
        </div>
        <!-- 企业微信 -->
        <div v-if="!active">
          <div class="main-content wachat-block">
            <template v-if="contactsInfo.enterpriseWeQrcode">
              <span class="tip">点击图片保存企业微信二维码至相册，7天内有效</span>
              <img :src="contactsInfo.enterpriseWeQrcode" alt="" @click="handlePreviewImg" />
            </template>
            <div class="empty" v-else>
              <EmptyBlock />
            </div>
          </div>
          <div class="footer">
            <div class="btn-item single" @click="getPhone">获取商务联系方式</div>
          </div>
          <ImagePreview
            v-model:show="showImagePre"
            :images="[contactsInfo.enterpriseWeQrcode]"
            :currentUrl="contactsInfo.enterpriseWeQrcode"
          ></ImagePreview>
        </div>
      </div>
    </BottomPopup>
  </div>
</template>

<script setup lang="ts">
import BottomPopup from '@order-public-sub-public/components/ui/bottom-popup/index.vue'
import { getContacts } from '@order-public-sub-public/apis/contasts/index'
import { Contacts } from '@order-public-sub-public/apis/contasts/types'
import ImagePreview from '@order-public-sub-public/components/business/image-preview/index.vue'
import { ref, onMounted, onUnmounted, watchEffect } from 'vue'
import KyInput from '@order-public-sub-public/components/base/ky-input'
import SvgIcon from '@order-public-sub-public/components/ui/svg-icon/index.vue'
import EmptyBlock from '../empty/index.vue'
import { callThePhone, formatterPhone } from '@order-public-sub-public/utils'
import useEffect from '@order-public-sub-public/validate'
import { virtualPhoneRealName } from '@order-public-sub-public/components/business/contact-business/utils'
import { debounce } from 'lodash-es'
import umpOtherReport from '@order-public-sub-public/reportUmp/sceneReport/umpotherReport'

export interface popupProps {
  close: () => void
  showTel: string
  title: string
  hideWeChat: boolean
  approvedBy: boolean
  scene?: string
}

const virtualPhone = /^1[3|4|5|6|7|8|9][0-9]\d{8}\d{0,4}$/
const props = defineProps<popupProps>()
const visible = ref(false)
const active = ref(true)
const tel = ref('')
const sceneType = {
  查找商务电话: '20',
  默认优先级: '10',
}
watchEffect(() => {
  if (props.showTel) {
    tel.value = props.showTel
  }
})
const isShowInput = ref(false)
const { effectBubble } = useEffect()
const showImagePre = ref(false)
let contactsInfo = ref<Contacts>({
  mobile: '',
  virtualMobile: '95324',
  enterpriseWeQrcode: '',
  marketName: '',
  employeNo: '',
  realMarketPhoneFlag: '',
})
const emits = defineEmits(['close'])
const getBusinessContact = async (phoneNum: string) => {
  let params = { outgoingMobile: phoneNum?.replace(/\s/g, '') || '', scene: sceneType.查找商务电话 }
  if (props.approvedBy) {
    params.scene = sceneType.默认优先级
  }
  const { data } = await getContacts({ ...params, scene: props?.scene || params.scene })
  contactsInfo.value = data
}

/**
 * 请求对应商务数据：
 *  1.如果有权限直接拨打电话
 *  2.如果没有权限：展示弹窗
 *  */
const initData = async () => {
  if (props.approvedBy) {
    visible.value = true
  } else {
    await getBusinessContact(tel.value)
    if (contactsInfo.value.realMarketPhoneFlag === '10') {
      callThePhone(contactsInfo.value.mobile)
      props.close()
    } else {
      visible.value = true
    }
  }
}

// 编辑号码
const editHandel = () => {
  isShowInput.value = true
}

const callHandel = debounce(async () => {
  console.log('即将跳转到虚拟电话实名认证')
  umpOtherReport(
    'CLK',
    {
      eventCode: 'clk_express_cost_commerce_already_v1',
      regionCode: 'fare',
    },
    { choice_result: '拨打电话' },
  )
  // 前置空校验
  const phone = tel.value?.replace(/\s/g, '')
  const appendTo = document.querySelector('.phone-block') || undefined
  if (!phone) {
    return effectBubble([
      {
        key: 'content.phone',
        passed: false,
        content: '请输入手机号',
        bubbleConfig: {
          appendTo: appendTo,
          placement: 'top-start',
        },
      },
    ])
  }

  // 校验格式
  const isOk = checkPhone()
  if (isOk) {
    try {
      await getBusinessContact(phone)
      if (contactsInfo.value.isNeedAuthenticate) {
        virtualPhoneRealName()
        return
      }
      callThePhone(contactsInfo.value.virtualMobile || '95324')
      props.close()
    } catch (error) {
      console.log('error', error)
    }
  }
}, 500)

const getWeChat = () => {
  umpOtherReport(
    'CLK',
    {
      eventCode: 'clk_express_cost_commerce_already_v1',
      regionCode: 'fare',
    },
    { choice_result: '获取商务企业微信' },
  )
  active.value = false
}

const getPhone = () => {
  active.value = true
}

/** 预览二维码 */
const handlePreviewImg = () => {
  showImagePre.value = true
}

const checkPhone = () => {
  const appendTo = document.querySelector('.phone-block') || undefined
  const phone = tel.value.replace(/\s/g, '')
  const result = phone.match(virtualPhone)
  if (!result && appendTo) {
    try {
      effectBubble([
        {
          key: 'content.phone',
          passed: false,
          content: '请输入正确的手机号',
          bubbleConfig: {
            appendTo: appendTo,
            offset: [12, 20],
          },
        },
      ])
    } catch (error) {
      console.log('error', error)
    }
    return false
  }
  return true
}

onMounted(() => {
  initData()
})

onUnmounted(() => {
  active.value = true
  visible.value = false
  isShowInput.value = false
  emits('close')
})
</script>

<style lang="scss" scoped>
@import '@order-global-package-order-sub/styles/index.scss';
@import '@order-global-package-order-sub/styles/index.scss';
@import './index.scss';
</style>
