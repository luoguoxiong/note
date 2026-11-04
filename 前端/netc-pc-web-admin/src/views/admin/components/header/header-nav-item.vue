<template>
  <div class="header-nav-item">
    <template v-for="item in confList.filter((item) => item.show)" :key="item.value">
      <k-tooltip :disabled="item.disabledTooltip" placement="bottom" :content="item.label">
        <el-badge :is-dot="false" class="setting-dot">
          <k-button
            text
            style="color: #fff; padding: 8px"
            @click="onClick(item)"
            v-exposure-report="{
              eventCode: 'clk_home_topmenu_v1',
              region_code: 'top_navigation',
              otherParams: {
                pageCode: 'client_menu_v1',
                navigation_menu: item.label,
              },
            }"
          >
            <svg-icon :name="item.icon"></svg-icon>
            <span v-if="item.disabledTooltip" class="ml-4">{{ item.label }}</span>
          </k-button>
        </el-badge>
      </k-tooltip>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { reportHeaderClick } from './report'
import { usePcWebRootStore } from '@/stores/pc-web/root'
import { KButton, KTooltip } from '@netc-design-pc/ui'

defineOptions({
  name: 'header-nav-item',
})

/** 顶栏导航项 */
interface NavItem {
  label: string
  icon: string
  fnName: string
  show: boolean
  value: string
  disabledTooltip: boolean
}

const props = defineProps<{
  isMinWidth1280?: boolean
}>()

const emit = defineEmits(['onClick'])

const rootStore = usePcWebRootStore()

const confList = computed<NavItem[]>(() => {
  const disabledTooltip = !props.isMinWidth1280
  const list: NavItem[] = [
    // { label: '消息', icon: 'message-center', fnName: '1', show: true, value: 'message', disabledTooltip: true },
    // { label: '下载中心', icon: 'download-icon', fnName: '2', show: true, value: 'download', disabledTooltip },
    // 版本介绍入口隐藏 task#2128326
    // {
    //   label: '版本介绍',
    //   icon: 'version-icon',
    //   fnName: '3',
    //   show: true,
    //   value: 'version',
    //   disabledTooltip,
    // },
    {
      label: '关注公众号',
      icon: 'wechat',
      fnName: '8',
      show: rootStore.isShowWechat,
      value: 'wechat',
      disabledTooltip,
    },
    {
      label: '产品合集',
      icon: 'product-all',
      fnName: '4',
      show: true,
      value: 'all',
      disabledTooltip,
    },
    // 产品介绍入口隐藏 task#2128326
    // {
    //   label: '产品介绍',
    //   icon: 'product-introduce',
    //   fnName: '5',
    //   show: true,
    //   value: 'introduce',
    //   disabledTooltip,
    // },
    // { label: '设置', icon: 'setting-icon', fnName: '6', show: true, value: 'setting', disabledTooltip: false },
    // { label: '刷新', icon: 'refresh-icon', fnName: '7', show: true, value: 'refresh', disabledTooltip: false },
  ]
  return list
})

const onClick = (item: NavItem) => {
  reportHeaderClick(item.label)
  emit('onClick', item)
}
</script>

<style lang="scss" scoped>
.header-nav-item {
  display: flex;
  align-items: center;
  gap: var(--k-spacing-4);
  /* element-plus text 按钮(type="primary" text) 类名为 .el-button--primary.is-text, 等价老项目 .el-button--text */
  // :deep(.el-button--primary.is-text) {
  //   color: #fff;
  //   font-size: 13px;
  //   margin-left: 4px;
  //   padding: 8px;
  // }
  /* 交互态(hover/focus/active)由父级 header/index.scss 的 .menu 规则统一接管:
     其静态规则编译后为 .header .items .menu[data-v] .el-button.el-button(6 级),
     会压过本组件内的 hover 规则(5 级), 故此处不再重复定义 */
  // .custom-tooltip {
  //   cursor: pointer;
  // }
  .ml-4 {
    margin-left: 4px;
  }
}
</style>
