<template>
  <div class="home">
    <div class="triangle"></div>
    <div class="item-list">
      <el-icon
        class="el-icon-setting"
        @click="emit('openSetting')"
        v-click-report="{
          pageCode: 'page_native_client_v1',
          eventCode: 'clk_native_client_menu_setting_v1',

          page_code: 'page_native_client_v1',
          page_name: 'page_native_client_v1',
          region_code: 'top_navigation',
          event_type_id: 2101,
          button_name: '本地客户端_设置_点击',
        }"
      >
        <Setting />
        <span class="version-icon" v-if="setNewIcon"></span>
      </el-icon>
      <el-icon class="el-icon-loading is-loading" v-if="refreshStatus"><Loading /></el-icon>
      <el-icon
        class="el-icon-refresh-right"
        v-else
        @click="emit('refresh')"
        v-click-report="{
          pageCode: 'page_native_client_v1',
          eventCode: 'clk_native_client_menu_refresh_v1',

          page_code: 'page_native_client_v1',
          page_name: 'page_native_client_v1',
          region_code: 'top_navigation',
          event_type_id: 2101,
          button_name: '本地客户端_刷新_点击',
        }"
        ><RefreshRight
      /></el-icon>
      <el-icon class="el-icon-minus" @click="emit('winBtnClick', 'minimize')"><Minus /></el-icon>
      <el-icon class="el-icon-close" @click="emit('winBtnClick', 'close')"><Close /></el-icon>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * 登录模式窗口控制条: 从 new-client/index.vue 拆出(原 .home 模板块及强相关样式)
 */
import { Close, Loading, Minus, RefreshRight, Setting } from '@element-plus/icons-vue'

defineOptions({ name: 'LoginToolbar' })

defineProps<{
  setNewIcon?: boolean
  refreshStatus?: boolean
}>()

const emit = defineEmits<{
  (e: 'openSetting'): void
  (e: 'refresh'): void
  (e: 'winBtnClick', btnName: 'minimize' | 'close'): void
}>()
</script>

<style lang="scss" scoped>
.home {
  display: flex;
  position: fixed;
  right: 0;
  top: 0;
  z-index: 1;
  color: #fff;
  .item-list {
    height: 26px;
    display: flex;
    align-items: center;
    background: rgba(0, 0, 0, 0.2);
    -webkit-app-region: no-drag;
    i {
      cursor: pointer;
      font-size: 16px;
      margin: 0 10px;
      position: relative;
    }
  }
  .triangle {
    width: 0;
    height: 0;
    border-left: 26px solid transparent;
    border-right: 26px solid rgba(0, 0, 0, 0.2);
    border-bottom: 26px solid transparent;
  }
}
.version-icon {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #ff605d;
  position: absolute;
  border: 1px solid #ffffff;
  right: -9px;
  top: -4px;
}
</style>
