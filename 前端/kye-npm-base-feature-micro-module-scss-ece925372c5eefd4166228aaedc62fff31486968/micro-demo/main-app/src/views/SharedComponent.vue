<template>
  <div class="official-freight">
    <div v-if="error" class="error">组件加载失败:{{ error }}</div>

    <div class="query-card">
      <div class="query-tabs">
        <span class="query-tab is-active">运费时效查询</span>
        <span class="query-tab">网点查询</span>
        <span class="query-tab">运单品查询</span>
      </div>

      <!-- 运费时效整体共享组件:寄/收/货好时间/查询按钮及全部逻辑均在子应用内闭环,
           点击查询由组件校验后按 data 协议整页跳转独立部署站,宿主零逻辑 -->
      <component :is="shareComp" v-if="shareComp" @query="handleQuery" />
    </div>
  </div>
</template>

<script>
import { defineAsyncComponent } from 'vue'
import { useRemoteComponent } from '@kye-netc/micro-module'

export default {
  name: 'OfficialFreightQuery',
  data() {
    return {
      error: '',
      shareComp: null,
      queryUrl: '',
    }
  },
  mounted() {
    // defineAsyncComponent 包装:加载报错时落在 errorComponent,同时记录到本页 error
    const loader = async () => {
      try {
        return await useRemoteComponent({ name: 'order-utils', component: 'freight-share' })
      } catch (err) {
        this.error = err && err.message ? err.message : String(err)
        throw err
      }
    }
    this.shareComp = defineAsyncComponent({
      loader,
      errorComponent: { template: '<div class="async-error">运费时效组件加载失败</div>' },
    })
  },
  methods: {
    // 组件校验通过、拼好跳转 URL 后通知宿主;跳转动作由组件自身完成
    handleQuery(url) {
      this.queryUrl = url
      console.log('[freight-share] 查询跳转:', url)
    },
  },
}
</script>

<style scoped>
.official-freight {
  min-height: 100%;
  padding: 24px;
  background: #f7f8fa;
}
.error {
  color: #f23f31;
  margin-bottom: 8px;
}
.query-card {
  background: #fff;
  border-radius: 8px;
  padding: 20px 24px;
  /* 容纳两列 607px 模块 + 24px 列间距 + 自身左右 padding */
  max-width: 1286px;
}
.query-tabs {
  display: flex;
  gap: 32px;
  border-bottom: 1px solid #e6e8ed;
  margin-bottom: 20px;
}
.query-tab {
  position: relative;
  padding: 0 4px 12px;
  font-size: 16px;
  color: #24262b;
  cursor: pointer;
}
.query-tab.is-active {
  font-weight: 600;
  color: #7143f0;
}
.query-tab.is-active::after {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  bottom: -1px;
  height: 2px;
  background: #7143f0;
  border-radius: 1px;
}
.async-error {
  color: #f23f31;
  font-size: 13px;
}
</style>
