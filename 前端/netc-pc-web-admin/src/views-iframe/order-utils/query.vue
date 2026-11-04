<!-- 运单查询（来源: netc-pc-web/src/views/micro-views/order-utils/query.vue） -->
<template>
  <div id="content">
    <Iframe menu-code="M3072" router-name="query" @message="getMessage"></Iframe>
  </div>
</template>

<script setup lang="ts">
import Iframe from '../components/iframe/index.vue'
import EE from '@/utils/eventemitter'

const getMessage = ({ type, data }: { type: string; data: any }) => {
  if (type === 'SWITCH_IFRAME_ROUTER_REFRESH') {
    EE.emit('SWITCH_IFRAME_ROUTER_REFRESH', {
      // 对齐新项目组件注册名(老项目为 orderConfigSingle，新项目路由/组件名为 order-config-single)
      name: 'order-config-single',
      tabReOpen: true,
      hasOpen: false,
    })
    return
  }

  console.error('type', type, data)
}
</script>

<style lang="scss" scoped>
#content {
  width: 100%;
  height: 100%;
}
</style>
