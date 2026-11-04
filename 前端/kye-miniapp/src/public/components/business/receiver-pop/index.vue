<template>
  <ky-popup :show="show" safeAreaInsetBottom :closeOnClickOverlay="false" position="bottom">
    <view class="popup-box-receiver receiver-box">
      <view class="popup-box-receiver-title">
        <text
          >添加代收人<text class="waybill-text" v-if="originData.waybillNumber.length && hasBatch"
            >(共{{ originData.waybillNumber.length }}票)</text
          ></text
        >
        <view class="kye-miniapp-waybill-popup-close-box" @tap="handleCancelShow">
          <image
            class="kye-miniapp-waybill-popup-close"
            src="https://ic-img.ky-express.com/netc/20250726_41452_!!1753521106143_64_64.png"
          ></image>
        </view>
      </view>
      <view class="receiver-form">
        <ky-form ref="formRef" :model-value="formData">
          <ky-field
            v-model="formData.proxyPickupPerson"
            prop="proxyPickupPerson"
            clearable
            :maxlength="40"
            class="receiver-input"
            placeholder="请输入"
            ref="proxyPickupPerson"
            :rules="getRules('proxyPickupPerson')"
            @input="formData.proxyPickupPerson = formData.proxyPickupPerson.trim()"
            label="代收人姓名"
            :required="true"
            :always-embed="false"
            @blur="customBlurValidate('proxyPickupPerson')"
            :cursorSpacing="200"
          >
          </ky-field>
          <ky-field
            v-model="formData.proxyPickupMobile"
            prop="proxyPickupMobile"
            :maxlength="11"
            placeholder="请输入"
            clearable
            class="receiver-input"
            ref="proxyPickupMobile"
            :rules="getRules('proxyPickupMobile')"
            type="digit"
            :formatter="proxyPickupMobileFormatter"
            label="代收人手机号"
            :required="true"
            :always-embed="false"
            @blur="customBlurValidate('proxyPickupMobile')"
            :cursorSpacing="isWxAppAndroidEnv ? 136 : 200"
            :inputDebounce="400"
            :enableWxNative="true"
            :enableWxNativeFormatter="true"
          >
          </ky-field>
        </ky-form>
        <view class="record-box" @click="goRecordDialog" v-if="originData.hasProxyPickupRecord">
          <image src="https://ic-img.ky-express.com/netc/20250618_94416_!!1750220897626_56_56.png" alt="" />
          修改记录
        </view>
      </view>
      <view class="receiver__footer">
        <ky-button block type="primary" class="confirm-btn" @click="onConfirm" :loading="loading">确定</ky-button>
      </view>
    </view>

    <!-- 代收人修改记录弹窗 -->
    <ReceiverPopHistory ref="receiverPopHistoryRef" />

    <TaroToast />
  </ky-popup>
</template>
<script lang="ts" setup>
import Taro from '@tarojs/taro'
import './index.scss'
import { nextTick, ref, watch } from 'vue'
import * as Pattern from '@public/utils/pattern'
import { vaildSensitiveWord, updateProxyPickupInfo, getProxyPickupInfoResult } from '@public/apis/pop'
import { showDialog } from '@kye-netc/kye-miniui'
import { openURL } from '@/modules/webview/utils'
import ReceiverPopHistory from '@/public/components/business/receiver-pop-history/index.vue'
import TaroToast from '@public/components/base/toast/toast.vue'
import { isWxAppAndroidEnv } from '@public/utils'
import { useToast } from '@public/hooks/useToast'
const { showToast } = useToast()

const props = withDefaults(
  defineProps<{
    /** 弹窗提示需要挂载的元素 */
    dialogClass: string
  }>(),
  {
    dialogClass: 'waybill-route-page',
  },
)

const emit = defineEmits(['finish'])

const receiverPopHistoryRef = ref<InstanceType<typeof ReceiverPopHistory>>()

interface IOriginData {
  waybillNumber: Array<string>
  hasProxyPickupRecord: boolean
  hasBatch?: boolean
}

const show = ref<boolean>(false)
const originData = ref<IOriginData>({ waybillNumber: [], hasProxyPickupRecord: false })

const rules = ref({
  proxyPickupPerson: [
    { required: true, message: '请输入代收人姓名', trigger: 'blur' },
    {
      validator: async (value: string) => {
        return new Promise(async (resolve, reject) => {
          if (value.length < 2) {
            reject('代收人姓名不能少于两个字')
          }
          const res = await vaildSensitiveWord({ content: value })
          if (!res?.data) reject('存在敏感信息，请重新填写')
          resolve('')
        })
      },
    },
  ],
  proxyPickupMobile: [
    { required: true, message: '请输入代收人手机号', trigger: 'blur' },
    {
      validator: (value) => !value || Pattern.virtualPhone.test(value.replace(/\s|-/g, '')),
      message: '请输入正确的代收人手机号',
    },
  ],
})

const formData = ref({
  proxyPickupPerson: '',
  proxyPickupMobile: '',
})
const loading = ref(false)

const formRef = ref()
const cancelHandle = () => {
  formData.value.proxyPickupPerson = ''
  formData.value.proxyPickupMobile = ''
  formRef.value?.reset()
}
const initData = () => {
  cancelHandle()
}
const getRules = (name) => {
  return rules.value[name] || []
}

const proxyPickupMobileFormatter = (v: string) => String(v ?? '').replace(/\D/g, '').slice(0, 11)

const onConfirm = async () => {
  await nextTick()
  setTimeout(() => {
    formRef.value.validate().then(async ({ valid, errors }) => {
      if (valid) {
        loading.value = true
        const params = {
          waybillNumbers: originData.value.waybillNumber,
          clientType: 20,
          operateType: 10,
          proxyPickupInfo: {
            proxyPickupPerson: formData.value.proxyPickupPerson,
            proxyPickupMobile: formData.value.proxyPickupMobile,
          },
        }
        try {
          const { data } = await updateProxyPickupInfo(params)
          if (data) {
            // 代收人信息校验是否通过，1为成功，0为失败
            if (data?.passStatus === 0) {
              loading.value = false
              let failedMessages = data.failedMessages
              if (failedMessages?.length) {
                Taro.showToast({
                  title: data.failedMessages[0].message || '效验失败',
                  icon: 'none',
                })
              }
              return
            }
            // 是否还有更多其他的可添加或编辑的运单，0为否，1为是
            let hasAnyMore = data.hasAnyMore
            // 单票的情况
            if (data.successNum) {
              if (originData.value?.waybillNumber?.length === 1 && !hasBatch.value) {
                if (hasAnyMore === 1) {
                  showDialog({
                    parentClassName: props.dialogClass,
                    zIndex: 1000,
                    message: '是否添加更多运单的代收人？',
                    showCancelButton: true,
                    cancelButtonText: '取消',
                    confirmButtonText: '继续添加',
                    title: '添加成功',
                  })
                    .then(() => {
                      Taro.navigateTo({ url: '/modules/waybill-build/pages/batch-receiver/index' })
                    })
                    .catch(() => {
                      emit('finish')
                      show.value = false
                    })
                } else {
                  Taro.showToast({
                    title: '代收人已发起添加，请稍后刷新页面查看',
                    icon: 'none',
                    mask: true,
                  })
                }
              } else {
                Taro.showToast({
                  title: '提交成功',
                  icon: 'none',
                  mask: true,
                })
              }
              setTimeout(() => {
                show.value = false
              }, 1500)
            }
            // 批量的情况，asyncFlag是否转异步，0否，1是
            if (data.asyncFlag === 1 && originData.value.waybillNumber.length > 1 && data.taskId) {
              onLoopReceiverResult(data.taskId)
              return
            }
            loading.value = false
          } else {
            loading.value = false
          }
          emit('finish')
        } catch (error) {
          loading.value = false
          error.message && showToast({ title: error.message, icon: 'none' })
        }
      }
    })
  }, 500)
}
// 轮询代收结果
const onLoopReceiverResult = (taskId) => {
  if (!taskId) return
  setTimeout(async () => {
    try {
      const { data } = await getProxyPickupInfoResult({ taskId })
      if (data.continueLoop) {
        onLoopReceiverResult(data.taskId)
      } else {
        loading.value = false
        show.value = false
        if (data.totalNum === data.successNum) {
          Taro.showToast({
            title: '提交成功',
            icon: 'none',
          })
        } else {
          const message = `<div style="display: flex;justify-content: center;">共<span style="color: #ff9300">${data.totalNum}</span>票运单，其中<span style="color: #ff9300">${data.successNum}</span>票添加代收人成功</div>`
          await showDialog({
            parentClassName: props.dialogClass,
            zIndex: 1000,
            message,
            confirmButtonText: '我知道了',
            title: '温馨提示',
          })
        }
        emit('finish')
      }
    } catch (error) {}
  }, 500)
}
const goRecordDialog = () => {
  receiverPopHistoryRef.value?.openDialog(originData.value.waybillNumber?.[0])
}

const hasBatch = ref(false)

const openDialog = (queryParams: IOriginData) => {
  show.value = true
  originData.value = {
    ...originData.value,
    ...queryParams,
  }
  hasBatch.value = queryParams?.hasBatch || false
}

const handleCancelShow = () => {
  show.value = false
  initData()
}

// 失去焦点校验,单独校验
const customBlurValidate = (prop) => {
  formRef.value?.validate(prop).then(({ valid, errors }) => {
    if (valid) {
      console.log('success:', formData.value)
    } else {
      console.warn('error:', errors)
    }
  })
}

watch(
  show,
  (val) => {
    console.log('🚀 ~ val 123123123:', val)
    if (!val) {
      initData()
    }
  },
  { immediate: true },
)

defineExpose({
  openDialog,
  initData,
})
</script>
