<template>
  <div
    class="clear-content"
    v-exposure-report="{
      pageCode: 'page_native_client_v1',
      page_code: 'page_native_client_v1',
      page_name: 'page_native_client_v1',
      eventCode: 'exp_page_native_client_clear_cache',
      region_code: 'clear_cache',
      event_type_id: 2201,
    }"
  >
    <div class="title">遇到加载缓慢/使用卡顿，可尝试清理缓存提升性能</div>
    <div class="desc">缓存是使用客户端过程中产生的临时数据，清空缓存不会影响正常使用</div>
    <div
      class="btn"
      @click="showSuccess"
      v-click-report="{
        pageCode: 'page_native_client_v1',
        page_code: 'page_native_client_v1',
        page_name: 'page_native_client_v1',
        eventCode: 'clk_page_native_client_clear_cache',
        region_code: 'clear_cache',
        event_type_id: 2101,
        button_name: '清除缓存',
      }"
    >
      <img
        src="https://ic-img.ky-express.com/netc/20240913_8577039516_!!1726197933838_32_32.png"
        alt=""
        v-show="loading"
      />
      清理缓存
    </div>
    <!-- <div class="model" v-if="isShowClear">
      <div class="clear-success">
        <img src="https://ic-img.ky-express.com/netc/20240912_2837039513_!!1726148856344_160_160.png" alt="" />
        <div class="clear-title">清理成功</div>
        <div class="clear-desc">需重新刷新页面才能生效</div>
        <div class="btn bg-btn" @click="refresh">立即刷新</div>
      </div>
    </div> -->
  </div>
</template>

<script setup lang="ts">
/**
 * 来源: netc-pc-web/src/views/new-client/setting/clear-tab.vue
 * 迁移说明:
 *  - Options API -> <script setup lang="ts">
 *  - this.$native.clearCache/reloadCurrentPage -> @/native/electron 同名方法
 *  - v-ump-exposure/v-ump-click -> v-exposure-report/v-click-report
 */
import { ref } from 'vue'
import { clearCache } from '@/native/electron'

defineOptions({ name: 'ClearTab' })

const loading = ref(false)

const showSuccess = () => {
  clearCache()
  loading.value = true
}
</script>

<style lang="scss" scoped>
.clear-content {
  border-radius: 4px;
  opacity: 1;
  background: #f5f7fa;
  width: 488px;
  padding: 16px;
}
.title {
  font-size: 15px;
  font-weight: 600;
  line-height: 22px;
  letter-spacing: 0px;
  color: #03050d;
}
.desc {
  font-size: 12px;
  line-height: 18px;
  color: #686b75;
  margin: 4px 0 8px;
}
.bg-btn {
  width: 116px;
  height: 36px;
  margin: 0 auto;
}
.btn {
  width: 80px;
  height: 32px;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 6px 0px;
  border-radius: 4px;
  background: #8365f6;
  font-size: 14px;
  font-weight: 600;
  line-height: 20px;
  text-align: center;
  letter-spacing: 0px;
  color: #ffffff;
  box-sizing: border-box;
  cursor: pointer;
  img {
    width: 16px;
    height: 16px;
    margin-right: 2px;
    animation: rotateAnimation 2s linear infinite;
  }
}

@keyframes rotateAnimation {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
.btn:hover {
  background: #a68fff;
}
.btn:active {
  background: #7051ed;
}
.model {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  background: rgba(36, 38, 43, 0.16);
  z-index: 99;
}
.clear-success {
  border-radius: 8px;
  width: 400px;
  height: 248px;
  padding: 24px;
  background: #ffffff;
  box-shadow: 0px 3px 6px -4px rgba(0, 0, 0, 0.12), 0px 6px 16px 0px rgba(0, 0, 0, 0.08),
    0px 9px 28px 8px rgba(0, 0, 0, 0.05);
  box-sizing: border-box;
  img {
    width: 80px;
    height: 80px;
    display: block;
    margin: 0 auto;
  }
  .clear-title {
    font-size: 20px;
    font-weight: 600;
    line-height: 24px;
    text-align: center;
    letter-spacing: 0px;
    color: #03050d;
  }
  .clear-desc {
    font-size: 14px;
    font-weight: normal;
    line-height: 20px;
    text-align: center;
    letter-spacing: 0px;
    color: #666666;
    padding: 8px 0 32px;
  }
}
</style>
