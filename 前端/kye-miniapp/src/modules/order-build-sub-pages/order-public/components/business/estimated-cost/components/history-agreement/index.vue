<template>
  <div class="history-agreement-content">
    <div class="history-agreement-box" @click="toJumpHistoryAgree">
      <SvgIcon
        name=""
        img-url="https://ic-img.ky-express.com/netc/20260122_22549_!!1769074530148_28_28.svg+xml"
      ></SvgIcon>
      查看历史版本
    </div>
  </div>
</template>

<script setup lang="ts">
import SvgIcon from '@order-public-sub-public/components/ui/svg-icon/index.vue'
import { openURL } from '@/modules/webview/utils'
import { urlContact } from '@public/utils'

const props = defineProps<{
  code: string
  name: string
}>()

const toJumpHistoryAgree = async () => {
  const url =
    process.env.TARO_APP_ENV !== 'prod'
      ? 'https://ic-h5-uat.kye-erp.com/netc-h5-modules/article-history/index.html'
      : 'https://ic-h5.kye-erp.com/netc-h5-modules/article-history/index.html'
  console.log(
    urlContact(url, {
      agreementCode: props.code,
      agreementName: props.name,
      needLogin: true,
    }),
  )
  openURL(
    urlContact(url, {
      agreementCode: props.code,
      agreementName: props.name,
      needLogin: true,
    }),
  )
}
</script>

<style lang="scss">
.history-agreement-content {
  display: flex;
}
.history-agreement-box {
  font-size: 28px;
  font-weight: normal;
  display: inline-block;
  height: 56px;
  line-height: 56px;
  padding: 0 16px;
  margin-top: 32px;
  margin-left: auto;
  &:active {
    border-radius: 8px;
    background: rgba(0, 0, 0, 0.04);
  }
  .svg-icon {
    margin-right: 3px;
    margin-top: -2px;
  }
}
</style>
