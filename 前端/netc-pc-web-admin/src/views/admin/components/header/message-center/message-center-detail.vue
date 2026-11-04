<!-- 消息中心详情页 -->
<template>
  <div class="message-center-detail">
    <div class="message-center-detail__wrapper">
      <h3 class="message-center-detail__title">{{ state.messageData.messageTitle }}</h3>
      <div class="message-center-detail__content">
        <span>{{ state.messageData.messageContent }}</span>
      </div>
      <div class="message-center-detail__footer">
        <img
          class="message-center-detail__footer-img"
          src="https://ic-img.ky-express.com/netc/20240619_39621882334_!!1718787177572_844_216.png"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * message-center-detail 消息中心详情页 (/admin/message-center-detail 路由页)
 * 来源: netc-pc-web/src/views/message-center-entry/message-center-detail.vue
 *
 * 迁移说明:
 * - @vue/composition-api -> vue
 * - root.$route -> useRoute()
 * - root.$native.isClientMode() -> @/native/electron isClientMode()
 * - 老项目 watch(root.$route) -> watch(route.fullPath) (path+query 变更均触发, 行为等价)
 * - 老项目 KyUiImg 组件仅导入未使用, 不迁移
 */
import { onMounted, reactive, watch } from 'vue'
import { useRoute } from 'vue-router'
import { messageCenterApi } from './service/messageApiService'
import { isClientMode } from '@/native/electron'

defineOptions({ name: 'message-center-detail' })

interface MessageDetailData {
  messageTitle: string
  messageContent: string
  [key: string]: any
}

const route = useRoute()

const state = reactive<{ messageData: MessageDetailData }>({
  messageData: {
    messageTitle: '',
    messageContent: '',
  },
})

// 路由监听 <消息中心详情页>
watch(
  () => route.fullPath,
  () => {
    if (route.path === '/admin/message-center-detail') {
      handleDetail()
    }
  }
)

onMounted(() => {
  handleDetail()
})

/* 获取消息中心详情*/
const handleDetail = async () => {
  const { messagePushTime, messageSerialNumber, messageType } = route.query as Record<string, string>
  if (!messageSerialNumber) {
    return
  }
  const params = {
    messagePushTime,
    messageSerialNumber,
    messageType,
    operatePort: 'PC',
    operatorSystem: isClientMode() ? 'pcClient' : 'pc',
  }
  const res = await messageCenterApi.userMessage_getUserMessageDetail(params)
  if (res.code === 0 && res.data) {
    state.messageData = res.data
  }
}
</script>

<style lang="scss" scoped>
.message-center-detail {
  height: 100%;
  margin: auto;
  text-align: center;
  display: flex;
  flex-direction: column;
  background: #f5f7fb;

  &__title {
    word-break: break-all;
    text-align: center;
    font-weight: 700;
    font-size: 20px;
    margin: 28px 0 20px;
    line-height: 28px;
    color: rgba(51, 51, 51, 0.93);
  }

  &__wrapper {
    width: 486px;
    height: calc(100vh - 100px);
    display: flex;
    flex: 1;
    flex-direction: column;
    margin: 12px auto;
    padding: 10px 32px;
    border-radius: 5px;
    overflow: hidden;
    box-sizing: border-box;
    background: url('https://ic-img.ky-express.com/netc/20240619_85921882375_!!1718780174490_972_80.png') no-repeat top
      left;
    background-size: 100%;
    background-color: #ffffff;
  }

  &__content {
    flex: 1;
    color: rgba(51, 51, 51, 0.93);
    text-align: left;
    line-height: 20px;
    word-break: break-all;
    white-space: pre-wrap;
    overflow-y: auto;
  }
  &__footer {
    padding: 20px 0 22px;
    &-img {
      width: 100%;
    }
  }
}
</style>
