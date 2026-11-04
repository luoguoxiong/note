<template>
  <div
    class="shortcut"
    v-exposure-report="{
      pageCode: 'page_native_client_v1',
      eventCode: 'exp_page_native_client_shortcut_key',

      page_code: 'page_native_client_v1',
      page_name: 'page_native_client_v1',
      region_code: 'shortcut_key',
      event_type_id: 2201,
    }"
  >
    <div class="shortcut_header">
      <div>功能说明</div>
      <div>快捷键</div>
    </div>
    <div class="shortcut_list">
      <div class="shortcut_list_item" v-for="item in shortcutList" :key="item.name">
        <div>{{ item.name }}</div>
        <div>
          <div v-for="k in item.key" :key="k" class="item-cell">
            <span class="plus">+</span>
            <span class="key">{{ k }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * 来源: netc-pc-web/src/views/new-client/setting/shortcut.vue
 * 迁移说明:
 *  - Options API -> <script setup lang="ts">
 *  - v-ump-exposure -> v-exposure-report
 *  - v-for 补充 :key (Vue3 规范, UI 无变化)
 */
defineOptions({ name: 'ShortcutTab' })

const shortcutList = [
  {
    name: '放大界面',
    key: ['Ctrl', '+'],
  },
  {
    name: '缩小界面',
    key: ['Ctrl', '-'],
  },
  {
    name: '剪切',
    key: ['Ctrl', 'x'],
  },
  {
    name: '复制',
    key: ['Ctrl', 'c'],
  },
  {
    name: '粘贴',
    key: ['Ctrl', 'v'],
  },
]
</script>

<style scoped lang="scss">
.shortcut {
  width: 100%;
  .shortcut_header {
    display: flex;
    height: 28px;
    line-height: 28px;
    background: #f7f8fa;
    font-size: 14px;
    font-weight: 600;
    text-align: left;
    color: #666666;
    > div {
      flex: 1;
      &:first-child {
        padding-left: 35px;
      }
    }
  }
  .shortcut_list {
    width: 100%;
    overflow: auto;
    max-height: 200px;
    .shortcut_list_item {
      height: 32px;
      display: flex;
      align-items: center;
      color: #03050d;
      box-shadow: 0px -1px 0px 0px #f1f1f5 inset;
      .key {
        display: block;
        height: 20px;
        border: 1px solid #eaeaeb;
        border-radius: 4px;
        padding: 0 6px;
        font-size: 14px;
        color: #03050d;
        line-height: 20px;
        text-align: center;
      }
      .plus {
        margin: 0 4px;
        color: #999999;
      }
      > div {
        flex: 1;
        .item-cell {
          display: flex;
          align-items: center;
          &:first-child {
            .plus {
              width: 0;
              overflow: hidden;
              margin: 0;
            }
          }
        }
        &:first-child {
          padding-left: 35px;
        }
        &:last-child {
          display: flex;
        }
      }
    }
  }
}
</style>
