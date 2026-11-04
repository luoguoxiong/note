<template>
  <ky-container class="user-edit-container" v-bind="pageOptions">
    <ky-field
      v-model="state.name"
      :formatter="valueFormater"
      :placeholder="router.params.flag ? '请输入公司名称' : '请输入中英文的昵称'"
      :type="inputType"
      :label="label"
      :maxlength="env.isPc ? undefined : router.params.flag ? 60 : 10"
      clearable
    >
      <template #right>
        <view>{{ state.name.length || 0 }}/{{ router.params.flag ? 60 : 10 }}</view>
      </template>
    </ky-field>
    <view class="user-edit-footer">
      <ky-button class="w-full" :loading="loading" size="large" type="primary" @tap.stop="handleSave">保存</ky-button>
    </view>
  </ky-container>
</template>

<script lang="ts" setup>
import { computed, reactive, ref } from 'vue'
import Taro, { useLoad, useRouter } from '@tarojs/taro'
import { modifyUserInfo } from '../../apis/user'
import { updateUserInfo } from '@/public/storage'
import { getEnvConfig } from '@/public/constants'
import './index.scss'

defineOptions({ name: 'UserEdit' })

const env = getEnvConfig()

const inputMaxLength = computed(() => (router.params.flag ? 60 : 10))

const router = useRouter()

const pageOptions = ref({
  navBarOptions: { showPlatList: [''], title: '修改昵称' },
})
const loading = ref(false)

const label = computed(() => (router.params.flag ? '公司名称' : '昵称'))
// const inputType = computed(() => (!router.params.flag ? 'nickname' : 'text'))
const inputType = computed(() => 'text')

const state = reactive({ name: '', error: '' })

const valueFormater = (value: string) => {
  // eslint-disable-next-line
  const enReg = /[`~!@$%^&*_+<>?:"{}\/;'[\]]/im // 英文特殊字符
  const cnReg = /[·！￥——：；“”‘’、|《》？、【】[\]]/im // 中文特殊字符
  const numbReg = /[0-9]/g // 数字正则
  const emojiReg =
    // eslint-disable-next-line
    /[\uD83C|\uD83D|\uD83E][\uDC00-\uDFFF][\u200D|\uFE0F]|[\uD83C|\uD83D|\uD83E][\uDC00-\uDFFF]|[0-9|*|#]\uFE0F\u20E3|[0-9|#]\u20E3|[\u203C-\u3299]\uFE0F\u200D|[\u203C-\u3299]\uFE0F|[\u2122-\u2B55]|\u303D|[\A9|\AE]\u3030|\uA9|\uAE|\u3030/gi // 表情正则
  const result = value.replace(numbReg, '').replace(emojiReg, '').replace(enReg, '').replace(cnReg, '')

  return result
}

useLoad(() => {
  const name = router.params.name ? decodeURIComponent(router.params.name) : ''
  state.name = name
  if (router.params.flag) {
    pageOptions.value.navBarOptions.title = '修改公司名称'
  } else {
    pageOptions.value.navBarOptions.title = '修改昵称'
  }
})

const getCharLen = (str: string) => {
  let len = 0
  for (let i = 0; i < str.length; i++) {
    if (str.charCodeAt(i) > 127 || str.charCodeAt(i) == 94) {
      len += 2
    } else {
      len++
    }
  }
  return len
}

const handleSave = async () => {
  if (state.name.length > inputMaxLength.value) {
    state.error = '名称不能超过' + inputMaxLength.value + '个字符'
    Taro.showToast({ title: state.error, icon: 'none' })
    return
  }
  // 请至少输入2个字才可保存
  // 请输入正确公司名称
  if (!state.name) {
    state.error = '名称不能为空'
    Taro.showToast({ title: state.error, icon: 'none' })
    return
  }
  if (state.name.length < 2) {
    state.error = '请至少输入2个字才可保存'
    Taro.showToast({ title: state.error, icon: 'none' })
    return
  }
  if (router.params.flag && (getCharLen(state.name) < 6 || getCharLen(state.name) > 60)) {
    state.error = '请输入正确的' + label.value
    Taro.showToast({ title: state.error, icon: 'none' })
    return
  }
  loading.value = true

  await modifyUserInfo({ name: state.name })
    .then(() => {
      updateUserInfo({ userName: state.name })
      Taro.navigateBack()
    })
    .finally(() => {
      loading.value = false
    })
}
</script>
