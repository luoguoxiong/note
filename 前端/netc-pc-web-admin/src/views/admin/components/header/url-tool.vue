<!-- 链接切换调试工具 仅用于客户端壳测试环境 -->
<template>
  <div class="url-tool" v-if="isTestScene && isClientMode">
    <el-input
      ref="input"
      size="small"
      placeholder="请输入版本链接url"
      v-model="inputValue"
      @blur="handleBlur"
      @input="handleInput"
      clearable
    ></el-input>
    <el-button type="default" size="small" @click="goVersion">切换版本</el-button>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { debounce } from 'lodash-es'
import fmkEnvUtil from './utils/fmkEnvUtil'
import { isClientMode as isClientModeFn } from '@/native/electron'

defineOptions({
  name: 'url-tool',
})

// 当前展示版本url
const inputValue = ref(window.location.href)

// 是否泳道环境(测试环境)
const isTestScene = fmkEnvUtil.isTestScene()

// 是否在客户端的原生模式
const isClientMode = isClientModeFn()

const handleBlur = () => {
  goVersion()
}

/**
 * 监听输入框
 */
const handleInput = debounce(() => {
  goVersion()
}, 2000)

/**
 * 跳转url页面
 */
const goVersion = () => {
  if (!inputValue.value || !/https|http/.test(window.location.protocol)) {
    return
  }
  const url = inputValue.value
  fmkEnvUtil.urlEnvIdCover(url)
  setTimeout(() => {
    window.location.href = url
  }, 100)
}
</script>

<style lang="scss" scoped>
.url-tool {
  position: fixed;
  left: 150px;
  top: 8px;
  width: 500px;
  z-index: 1000;
  display: flex;
  align-items: center;
  .el-button {
    margin-left: 8px;
  }
}
</style>
