<template>
  <div class="zoom-container">
    <div class="zoom-main">
      <div
        class="decrease operator"
        :class="{ disabled: zoomDecreaseDisabled }"
        @click="controlZoom('decrease')"
        v-click-report="{
          pageCode: 'page_native_client_v1',
          eventCode: 'clk_native_client_menu__zoom_v1',

          page_code: 'page_native_client_v1',
          page_name: 'page_native_client_v1',
          region_code: 'top_navigation',
          event_type_id: 2101,
          button_name: '缩小',
        }"
      >
        <el-icon class="el-icon-minus"><Minus /></el-icon>
      </div>
      <div class="num">{{ zoomRatio }}</div>
      <div
        class="add operator"
        :class="{ disabled: zoomAddDisabled }"
        @click="controlZoom('add')"
        v-click-report="{
          pageCode: 'page_native_client_v1',
          eventCode: 'clk_native_client_menu__zoom_v1',

          page_code: 'page_native_client_v1',
          page_name: 'page_native_client_v1',
          region_code: 'top_navigation',
          event_type_id: 2101,
          button_name: '放大',
        }"
      >
        <el-icon class="el-icon-plus"><Plus /></el-icon>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * 来源: netc-pc-web/src/views/new-client/zoom/zoom-operate.vue
 * 迁移说明:
 *  - Options API -> <script setup lang="ts">
 *  - this.$native.getZoom/switchZoom/isKuaShenClientMode -> @/native/electron 同名方法
 *  - this.$umpother({...}) (默认 OTHER) -> window.$umpOtherReport('OTHER', { eventCode, region_code }, {...其余字段})
 *  - v-ump-click -> v-click-report (参数格式一致)
 *  - el-icon-minus/el-icon-plus 字体图标 -> el-icon + @element-plus/icons-vue (class 名保留)
 */
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { Minus, Plus } from '@element-plus/icons-vue'
import { getZoom, isKuaShenClientMode, switchZoom } from '@/native/electron'

defineOptions({ name: 'ZoomOperate' })

const zoomRatio = ref('100%')
const isFirst = ref(true)

const zoomDecreaseDisabled = computed(() => parseFloat(zoomRatio.value) <= 25)
const zoomAddDisabled = computed(() => parseFloat(zoomRatio.value) >= 200)

const initZoomRatio = async () => {
  let res = await getZoom()
  if (res && typeof res === 'object') {
    res = JSON.stringify(res)
  }
  showZoomPanel(res)
}

const showZoomPanel = (zoom: any) => {
  if (isKuaShenClientMode() && typeof zoom === 'string') {
    zoom = JSON.parse(zoom).data
  }
  let base = 1
  if (isKuaShenClientMode()) {
    zoom = Math.abs(zoom)
    base = 0
  }
  const ratio = (base + zoom) * 100 + '%'
  console.error('this.isFirst', isFirst.value)
  if (isFirst.value) {
    isFirst.value = false
    window.$umpOtherReport(
      'OTHER',
      {
        eventCode: 'other_native_client_menu_zoom_ratio_v1',
        region_code: 'top_navigation',
      },
      {
        pageCode: 'page_native_client_v1',
        page_name: 'page_native_client_v1',
        page_code: 'page_native_client_v1',
        event_type_id: 19999,
        event_code: 'other_native_client_menu_zoom_ratio_v1',
        ratio,
      }
    )
  }
  if (ratio === zoomRatio.value) {
    return
  }
  zoomRatio.value = ratio
}

// 监听鼠标和ctr
const wheelHandler = (event: WheelEvent) => {
  if (event?.ctrlKey) {
    if (event?.deltaY > 0) {
      controlZoom('decrease')
    } else {
      controlZoom('add')
    }
  }
}

const listenMouse = () => {
  window.addEventListener('wheel', wheelHandler)
}

// 控制缩放
const controlZoom = async (operate: string) => {
  try {
    await switchZoom(operate)
    await initZoomRatio()
    window.$umpOtherReport(
      'OTHER',
      {
        eventCode: 'other_native_client_menu_zoom_ratio_v1',
        region_code: 'top_navigation',
      },
      {
        pageCode: 'page_native_client_v1',
        page_name: 'page_native_client_v1',
        page_code: 'page_native_client_v1',
        event_type_id: 19999,
        event_code: 'other_native_client_menu_zoom_ratio_v1',
        ratio: zoomRatio.value,
      }
    )
  } catch (e) {
    console.warn(e)
  }
}

initZoomRatio()

onMounted(() => {
  window.showZoomPanel = showZoomPanel
  listenMouse()
})

onBeforeUnmount(() => {
  window.removeEventListener('wheel', wheelHandler)
})
</script>

<style scoped lang="scss">
.zoom-container {
  display: inline-block;
  margin-left: 16px;
  .zoom-main {
    display: flex;
    align-items: center;
    justify-content: center;
    color: #ffffff;
    height: 24px;
    border-radius: 4px;
    box-sizing: border-box;
    background: rgba(255, 255, 255, 0.1);
    > div {
      display: flex;
      align-items: center;
      justify-content: center;
      line-height: 0;
      height: 100%;
      overflow: hidden;
    }
  }
  .decrease {
    border-bottom-left-radius: 4px;
    border-top-left-radius: 4px;
  }
  .add,
  .decrease {
    box-sizing: border-box;
    border: 1px solid rgba(255, 255, 255, 0.2);
    font-size: 22px;
    &:not(.disabled) {
      &:hover {
        background: #b294fb;
        border: 1px solid #b294fb;
      }
      &:active {
        background: #a785fa;
        border: 1px solid #a785fa;
      }
    }
  }
  .add {
    border-bottom-right-radius: 4px;
    border-top-right-radius: 4px;
  }
  .operator {
    width: 24px;
    font-size: 24px;
    cursor: pointer;
    i {
      font-size: 10px;
      line-height: 10px;
    }
  }
  .num {
    font-size: 14px;
    width: 50px;
    text-align: center;
    line-height: 24px;
    border-top: 1px solid rgba(255, 255, 255, 0.2);
    border-bottom: 1px solid rgba(255, 255, 255, 0.2);
    box-sizing: border-box;
  }
  .disabled {
    background: rgba(154, 121, 249, 0.4);
    cursor: not-allowed;
    color: #cab5ff;
  }
}
</style>
