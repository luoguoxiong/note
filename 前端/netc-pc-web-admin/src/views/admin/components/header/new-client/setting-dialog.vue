<template>
  <!-- 设置弹窗 -->
  <el-dialog title="设置" v-model="visible" width="700px" :append-to-body="true" :close-on-click-modal="false">
    <el-tabs tab-position="left" style="height: 320px" v-model="activeTab" @tab-click="onTabClick">
      <el-tab-pane :name="0">
        <template #label>
          <span class="label-item">
            <svg-icon v-show="activeTab == 0" name="proxy-tab-active" />
            <svg-icon v-show="activeTab != 0" name="proxy-tab" />
            网络设置
          </span>
        </template>
        <div class="right" :style="{ backgroundImage: 'url(' + getBgIcon + ')' }">
          <div class="right_title">网络设置</div>
          <proxy-tab></proxy-tab>
        </div>
      </el-tab-pane>
      <el-tab-pane :name="1">
        <template #label>
          <span class="label-item" :class="{ new_version: newClientVersion }">
            <svg-icon v-show="activeTab == 1" name="version-update-active" />
            <svg-icon v-show="activeTab != 1" name="version-update" />
            版本更新
          </span>
        </template>
        <div class="right right-update" :style="{ backgroundImage: 'url(' + getBgIcon + ')' }">
          <div class="right_title">版本更新</div>
          <update-tab @checkUpdate="emit('checkUpdate')" :newClientVersion="newClientVersion"></update-tab>
        </div>
      </el-tab-pane>
      <el-tab-pane :name="2">
        <template #label>
          <span class="label-item" :class="{ new_icon: showNewIcon }">
            <svg-icon v-show="activeTab == 2" name="shortcut-active" />
            <svg-icon v-show="activeTab != 2" name="shortcut" />
            快捷键
          </span>
        </template>
        <div class="right" :style="{ backgroundImage: 'url(' + getBgIcon + ')' }">
          <div class="right_title">快捷键</div>
          <shortcut></shortcut>
        </div>
      </el-tab-pane>
      <el-tab-pane :name="3" v-if="showClearCache">
        <template #label>
          <span class="label-item">
            <svg-icon v-show="activeTab == 3" name="clear-cache" />
            <svg-icon v-show="activeTab != 3" name="clear-cache-default" />
            清除缓存
          </span>
        </template>
        <div class="right">
          <div class="right_title">清除缓存</div>
          <clearTab></clearTab>
        </div>
      </el-tab-pane>
      <el-tab-pane :name="4" v-if="showAboutTab">
        <template #label>
          <span class="label-item">
            <svg-icon v-show="activeTab == 4" name="client-about-active" />
            <svg-icon v-show="activeTab != 4" name="client-about" />
            关于
          </span>
        </template>
        <div class="right" :style="{ backgroundImage: 'url(' + getBgIcon + ')' }">
          <div class="right_title">关于</div>
          <aboutTab></aboutTab>
        </div>
      </el-tab-pane>
    </el-tabs>
  </el-dialog>
</template>

<script setup lang="ts">
/**
 * 设置弹窗(网络/版本/快捷键/清缓存/关于): 从 new-client/index.vue 拆出
 * 显隐与激活tab通过 v-model / v-model:tab-index 与父组件双向同步
 */
import { computed } from 'vue'
import { isKuaShenClientMode } from '@/native/electron'
import shortcut from './setting/shortcut.vue'
import updateTab from './setting/update-tab.vue'
import proxyTab from './setting/proxy-tab.vue'
import aboutTab from './setting/about-tab.vue'
import clearTab from './setting/clear-tab.vue'

defineOptions({ name: 'SettingDialog' })

const props = defineProps<{
  modelValue?: boolean
  tabIndex?: number
  newClientVersion?: Record<string, any> | null
  showNewIcon?: boolean
  showClearCache?: boolean
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'update:tabIndex', value: number): void
  (e: 'tabChange', pane: { index?: string }): void
  (e: 'checkUpdate'): void
}>()

const visible = computed({
  get: () => props.modelValue ?? false,
  set: (value) => emit('update:modelValue', value),
})

const activeTab = computed({
  get: () => props.tabIndex,
  set: (value) => emit('update:tabIndex', Number(value)),
})

const showAboutTab = computed(() => {
  return isKuaShenClientMode()
})

const getBgIcon = computed(() => {
  const bgMap: Record<number, string> = {
    0: 'https://ic-img.ky-express.com/netc/20230203_22363189530_!!1675406879345_236_220.png',
    1: 'https://ic-img.ky-express.com/netc/20230203_1046318950_!!1675414893649_252_236.png',
    2: 'https://ic-img.ky-express.com/netc/20230203_90263189513_!!1675408701072_256_224.png',
    3: 'https://ic-img.ky-express.com/netc/20230725_37563189541_!!1690272316952_231_232.png',
  }
  return bgMap[props.tabIndex ?? 0]
})

function onTabClick(pane: { index?: string }) {
  emit('tabChange', pane)
}
</script>

<style lang="scss" scoped>
.label-item {
  position: relative;
  display: block;
  height: 40px;
  line-height: 40px;
  svg {
    width: 16px;
    height: 16px;
    margin-right: 12px;
    vertical-align: -0.2em;
  }
}
.right {
  padding: 24px 0 16px 14px;
  background-repeat: no-repeat;
  background-size: 118px 110px;
  background-position: 98% 95%;
  height: 320px;
  box-sizing: border-box;
  .right_title {
    height: 20px;
    line-height: 20px;
    font-size: 14px;
    font-weight: 600;
    text-align: left;
    color: #333333;
    padding-left: 6px;
    display: flex;
    align-items: center;
    margin-bottom: 20px;
    &::before {
      content: '';
      display: block;
      width: 3px;
      height: 12px;
      border-radius: 1.5px;
      background: #8365f6;
      margin-right: 6px;
    }
  }
}
.new_icon::after {
  position: absolute;
  left: 100%;
  top: 0;
  margin-left: 2px;
  content: '';
  width: 34px;
  height: 16px;
  text-align: center;
  background: url('https://ic-img.ky-express.com/netc/20230327_44363189554_!!1679898512700_68_32.png') no-repeat;
  border-radius: 8px 8px 8px 0px;
  font-size: 10px;
  font-weight: 500;
  color: #ffffff;
  background-size: contain;
}
.new_version::after {
  position: absolute;
  left: 100%;
  top: 50%;
  transform: translateY(-50%);
  margin-left: 2px;
  content: '新版本';
  width: 40px;
  height: 16px;
  line-height: 16px;
  text-align: center;
  border-radius: 2px;
  font-size: 12px;
  color: #ffffff;
  background: #ff706d;
  display: flex;
  align-items: center;
  justify-content: center;
}
:deep(.el-dialog) {
  border-radius: 4px;
  box-shadow: 0px 9px 28px 8px rgba(0, 0, 0, 0.05), 0px 6px 16px 0px rgba(0, 0, 0, 0.08),
    0px 3px 6px -4px rgba(0, 0, 0, 0.12);
}
:deep(.el-dialog__body) {
  padding: 0 20px;
}
:deep(.el-tabs--left .el-tabs__header .el-tabs__nav) {
  padding-top: 8px;
  margin-right: 28px;
}
:deep(.el-tabs__active-bar) {
  background: none;
}
/* element-plus 中 nav 的 z-index(normal+1) 高于灰色分隔线(normal), 激活项背景会盖住分隔线, 此处把分隔线提到最上 */
:deep(.el-tabs--left .el-tabs__nav-wrap.is-left::after) {
  z-index: calc(var(--el-index-normal) + 2);
}
:deep(.el-tabs__item) {
  padding: 0 30px 0 10px;
  display: flex;
  align-items: center;
  justify-content: flex-start !important;
  text-align: left !important;
  width: 150px;
  box-sizing: border-box;
  border-left: 3px solid transparent;
  &:hover {
    color: inherit;
  }
}
:deep(.el-tabs__item.is-active) {
  /* 分隔线画在 nav-wrap 右缘 2px, 激活项宽度需小于容器宽度, 否则激活背景会把分隔线盖住 */
  width: 147px;
  border-left: 3px solid #7556ed;
  background: linear-gradient(270deg, #f9f7ff, #e3deff);
}
/* element-plus 对左侧 tabs 默认 justify-content: flex-end(右对齐), 优先级更高, 需同前缀覆盖为左对齐 */
:deep(.el-tabs--left .el-tabs__item.is-left) {
  justify-content: flex-start;
  text-align: left;
}
:deep(.el-dialog__header) {
  background-size: cover;
  padding: 8px 16px;
  font-size: 16px;
}
:deep(.el-dialog__headerbtn) {
  top: 10px;
  right: 16px;
}
</style>
