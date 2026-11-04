<template>
  <div class="freight-query">
    <div v-if="error" class="freight-query__error">{{ error }}</div>
    <component :is="shareComp" v-if="shareComp" @query="handleQuery" />
  </div>
</template>

<script setup lang="ts">
import { defineAsyncComponent, ref, shallowRef, type Component } from 'vue'
import { useRemoteComponent } from '@kye-netc/micro-module'

const emit = defineEmits<{
  (e: 'query', payload: Record<string, string>): void
  (e: 'load-error'): void
}>()

const error = ref('')

// 远程组件本体是子应用渲染的普通对象，用 shallowRef 存放避免被响应式代理
const shareComp = shallowRef()

// defineAsyncComponent 包装：加载报错时落在 errorComponent，同时记录到本组件 error
const loader = async (): Promise<Component> => {
  try {
    // 远程组件为子应用渲染的普通对象, 断言为组件类型(defineAsyncComponent loader 要求)
    return (await useRemoteComponent({ name: 'order-utils', component: 'freight-share' })) as Component
  } catch (err) {
    error.value = err instanceof Error ? err.message : String(err)
    emit('load-error')
    throw err
  }
}

shareComp.value = defineAsyncComponent({
  loader,
  // loadingComponent 为单根节点：子组件根元素会继承本组件 scopeId，
  // scoped 样式可命中；spinner 用 ::before 绘制，避免子组件内部元素拿不到 scopeId
  loadingComponent: { template: '<div class="freight-query__loading">运费时效查询组件加载中...</div>' },
  // 快于 200ms 不展示，避免闪烁
  delay: 200,
  errorComponent: { template: '<div class="freight-query__async-error">运费时效查询组件加载失败</div>' },
})

const handleQuery = (payload: Record<string, string>) => {
  // 查询按钮/地址校验/参数组装都在子应用 freight-share 内部，
  // 这里只透传给父组件统一 router.push('/admin/query')，data 由子应用查询页解析
  emit('query', payload)
}
</script>

<style lang="scss" scoped>
.freight-query__error {
  margin-bottom: 8px;
  font-size: 13px;
  color: #f23f31;
}

.freight-query__async-error {
  font-size: 13px;
  color: #f23f31;
}

.freight-query__loading {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 40px;
  font-size: 13px;
  color: #8c8f99;

  &::before {
    content: '';
    width: 14px;
    height: 14px;
    margin-right: 6px;
    border: 2px solid #e6e8ed;
    border-top-color: #7143f0;
    border-radius: 50%;
    animation: freight-query-spin 0.8s linear infinite;
  }
}

@keyframes freight-query-spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
