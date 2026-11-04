<template>
  <div v-show="!isCollapse && !!curDepartmentName" class="department-switch">
    <!-- 部门 -->
    <div class="department-info">
      <el-tooltip
        popper-class="avatar-customer-short-name__popover"
        placement="top"
        effect="dark"
        :content="curDepartmentName"
        :disabled="curDepartmentName.length <= 5"
      >
        <div class="department-name">部门：{{ curDepartmentName }}</div>
      </el-tooltip>
      <!-- 不加 click.stop: 点击需冒泡到 document, 让其他侧边栏浮层的「点击外部关闭」生效(浮层互斥) -->
      <span class="switch-department-icon-wrapper" v-if="showSwitchDepartmentBtn && !showSwitchDepartmentGuidePopper()">
        <i class="switch-department-icon" @click="onDepartmentBtnClick" />
      </span>
      <!-- 切换部门引导气泡(老 department-table-popover + menu-popover) -->
      <el-popover
        v-if="showSwitchDepartmentGuidePopper()"
        :visible="guideVisible"
        placement="bottom-start"
        :width="200"
        popper-class="menu-popover avatar-switch-department-guide__popper"
      >
        <template #reference>
          <i v-if="showSwitchDepartmentBtn" class="switch-department-icon" @click="onDepartmentBtnClick" />
        </template>
        <div class="content">
          <span>您可在此选择下单的部门</span>
          <el-icon class="guide-close-icon" @click="closeSwitchDepartmentGuidePopover"><Close /></el-icon>
        </div>
      </el-popover>
    </div>

    <!-- 切换部门 popover -->
    <div v-show="departmentPopoverVisible" ref="popoverRef" class="popover-container department-popover">
      <div class="label">切换部门</div>
      <div class="list--wrapper">
        <div class="info-avatar-popover-close">
          <el-icon @click="departmentPopoverVisibleFn"><Close /></el-icon>
        </div>
        <div class="list-container">
          <div
            v-for="(item, index) in departmentList"
            :key="index"
            class="list-item"
            @click="handleChangeDepartment(item)"
          >
            <div class="list-item--info">
              <div class="info-customerName">{{ item.departmentName }}</div>
            </div>
            <span v-show="selectedDepartmentCode === item.departmentCode && isDepartmentLoading" class="binding">
              <img src="https://ic-img.ky-express.com/netc/20240907_82770395191_!!1725703577651_28_28.png" alt="" />
              切换中
            </span>
            <span v-if="item.current && !isDepartmentLoading && !isSwitching" class="cur-department"></span>
          </div>
        </div>
      </div>
      <div class="info-popover-arrow"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * 切换部门组件
 * 来源: netc-pc-web/src/views/layout/avatar.vue「部门」业务块
 * 迁移说明:
 *  - vue2 + element-ui -> vue3 script setup + element-plus
 *  - vuex permission/update_department_list -> 本目录 api.ts(uamDepartmentGetMoreDepartment 复用 pc-web deps)
 *  - $store.dispatch('permission/update_department_list') -> 本 hook fetchDepartmentList
 *  - department-table-popover 引导气泡(依赖老 menu-popover + permission guide store)
 *      -> el-popover 受控模式 + localStorage 引导标记(键名与老基座一致)
 *  - popover 定位: 相对组件根元素 absolute(默认展开在部门行右侧), 使用方可按容器场景覆盖 .department-popover 的 top/right
 */
import { onMounted, onUnmounted, ref } from 'vue'
import { Close } from '@element-plus/icons-vue'
import { useDepartmentSwitch } from './hooks/useDepartmentSwitch'

defineOptions({ name: 'DepartmentSwitch' })

interface Props {
  /** 侧边栏是否收起(收起时隐藏部门区域, 对齐老基座 avatar :is-collapse 行为) */
  isCollapse?: boolean
}
defineProps<Props>()

/** 切换部门列表 popover */
const popoverRef = ref<HTMLElement | null>(null)

const {
  departmentPopoverVisible,
  isDepartmentLoading,
  isSwitching,
  selectedDepartmentCode,
  curDepartmentName,
  showSwitchDepartmentBtn,
  guideVisible,
  departmentList,
  showSwitchDepartmentGuidePopper,
  closeSwitchDepartmentGuidePopover,
  onDepartmentBtnClick,
  departmentPopoverVisibleFn,
  handleChangeDepartment,
} = useDepartmentSwitch()

// 点击组件外区域/窗口失焦时关闭切换列表(对齐老基座 avatar handleClosePopover;
// 切换图标不加 click.stop, 点击冒泡到 document 后其他浮层的同名监听共同实现浮层互斥)
const onDocumentClick = (e: MouseEvent) => {
  const target = e.target as HTMLElement
  if (popoverRef.value?.contains(target)) return
  // 点击切换图标本身不在此关闭: 开/关由 onDepartmentBtnClick 切换,
  // 否则图标点击冒泡到 document 后刚打开的 popover 会被本监听立即关闭(表现为打不开)
  if (target.closest?.('.switch-department-icon')) return
  departmentPopoverVisible.value = false
}
const onWindowBlur = () => {
  departmentPopoverVisible.value = false
}
onMounted(() => {
  document.addEventListener('click', onDocumentClick)
  window.addEventListener('blur', onWindowBlur)
})
onUnmounted(() => {
  document.removeEventListener('click', onDocumentClick)
  window.removeEventListener('blur', onWindowBlur)
})
</script>

<style lang="scss" scoped>
$--color-item-border: #f4f6f7;

.department-switch {
  position: relative;
}

.department-info {
  line-height: 18px;
  font-size: 12px;
  color: #686b75;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;

  .department-name {
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    max-width: 85%;
  }

  .switch-department-icon {
    width: 16px;
    height: 16px;
    background: url('https://ic-img.ky-express.com/netc/20250630_87760_!!1751267862821_16_16.svg+xml') no-repeat;
    background-size: 16px 16px;
    cursor: pointer;

    &-wrapper {
      padding: 1px;
      display: flex;
      margin-left: 4px;
      border-radius: 4px;

      &:hover {
        background: #f0ecfd;
      }

      &:active {
        background: #d8c9fb;
      }
    }
  }
}

.department-popover {
  position: absolute;
  top: 0;
  right: -308px;
  z-index: 999;
  width: 308px;
  padding-bottom: 5px;
  background: #ffffff;
  border-radius: 4px;
  box-shadow: 0px 9px 28px 8px rgba(0, 0, 0, 0.05), 0px 6px 16px 0px rgba(0, 0, 0, 0.08),
    0px 3px 6px -4px rgba(0, 0, 0, 0.12);

  .label {
    height: 46px;
    line-height: 46px;
    background-color: #f7f8fa;
    padding: 0 15px;
    position: relative;
    font-weight: bold;
    font-size: 13px;
    color: #24262b;
  }

  .list--wrapper {
    overflow-y: auto;
    max-height: 328px;

    &::-webkit-scrollbar {
      width: 8px;
      opacity: 0;

      &:hover {
        width: 6px;
        opacity: 1;
        transition: opacity 0.1s;
      }
    }

    &::-webkit-scrollbar-thumb {
      background: rgba(36, 38, 43, 0.16);
      border-radius: 4px;
      background-clip: padding-box;

      &:hover {
        background-clip: border-box;
        background: rgba(36, 38, 43, 0.6);
      }
    }

    .info-avatar-popover-close {
      position: absolute;
      top: 0;
      right: 0;
      z-index: 11;
      width: 20px;
      height: 20px;
      text-align: right;
      cursor: pointer;
      .el-icon {
        width: 14px;
        height: 14px;
        color: #8c8f99;
        background: #eaebee;
        &:hover {
          color: #8a61f2;
        }

        &:active {
          color: #3e25e9;
        }
      }
    }

    .list-item {
      color: #24262b;
      display: flex;
      position: relative;
      cursor: pointer;
      user-select: none;
      padding: 12px 16px;
      box-sizing: border-box;

      &:not(:last-of-type):after {
        display: block;
        content: '';
        width: 276px;
        height: 1px;
        background: $--color-item-border;
        position: absolute;
        bottom: 0;
        left: 16px;
      }

      .list-item--info {
        flex: 1;
        max-width: 210px;
        font-size: 13px;
        font-family: PingFangSC, PingFangSC-Regular;
        color: #03050d;
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
      }

      .info-customerName {
        width: 100%;
        font-size: 13px;
        font-weight: 600;
        line-height: 20px;
        letter-spacing: 0px;
        color: #24262b;
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
      }

      &:focus,
      &:hover {
        background: rgba(36, 38, 43, 0.06);
      }

      @keyframes spin {
        0% {
          transform: rotate(0deg);
        }

        100% {
          transform: rotate(360deg);
        }
      }

      .binding {
        position: absolute;
        right: 16px;
        top: 50%;
        transform: translateY(-50%);
        color: #8c8f99;
        display: flex;
        align-items: center;

        img {
          width: 14px;
          height: 14px;
          margin-right: 4px;
          animation: spin 1s linear infinite;
        }
      }

      .cur-department {
        position: absolute;
        right: 16px;
        top: 50%;
        transform: translateY(-50%);
        height: 18px;
        width: 56px;
        background: url('https://ic-img.ky-express.com/netc/20250716_45348_!!1752668202722_112_36.png') no-repeat;
        background-size: 56px 18px;
        box-sizing: border-box;
      }
    }
  }

  .info-popover-arrow {
    position: absolute;
    top: 12px;
    left: -6px;
    border-color: transparent;
    border-right-color: #ffffff;
    border-style: solid;
    border-width: 6px;
    border-left-width: 0;
    display: block;
    width: 0;
    height: 0;
  }
}
</style>

<style lang="scss">
/* 部门名称气泡(与 customer-code 组件的 avatar-customer-short-name__popover 同类名同款式) */
.avatar-customer-short-name__popover.el-popper {
  max-width: 308px;
  padding: 4px 8px;
  line-height: 18px;
  box-sizing: border-box;
  margin-left: 0 !important;
  background: rgba(36, 38, 43, 0.9) !important;
  box-shadow: 0px 2px 4px -1px rgba(0, 0, 0, 0.12), 0px 4px 5px 0px rgba(0, 0, 0, 0.08),
    0px 1px 10px 0px rgba(0, 0, 0, 0.05);

  .el-popper__arrow::before {
    background: rgba(36, 38, 43, 0.9) !important;
    border: none;
  }
}

/* 切换部门引导气泡(老 menu-popover + avatar-switch-department-guide__popper 合并终态样式) */
.menu-popover.el-popover.el-popper {
  height: 38px;
  min-width: 200px !important;
  border: none !important;
  box-sizing: border-box !important;
  border-radius: 6px !important;
  padding: 0 10px !important;
  background: linear-gradient(90deg, #8a61f2 0%, #a27cff 100%) !important;
  box-shadow: 0px 9px 28px 8px rgba(0, 0, 0, 0.05), 0px 6px 16px 0px rgba(0, 0, 0, 0.08),
    0px 3px 6px -4px rgba(0, 0, 0, 0.12) !important;

  .content {
    font-size: 16px;
    font-weight: 600;
    text-align: left;
    color: #ffffff;
    line-height: 38px;
    display: flex;
    justify-content: space-between;
    align-items: center;

    .guide-close-icon {
      font-size: 12px;
      margin-left: 8px;
      cursor: pointer;
    }
  }

  .el-popper__arrow::before {
    background: #9073ff !important;
    border: none;
  }
}

/* 引导气泡箭头对准切换图标(老 transform: translate(-15px, 4px) + left: 16px 的 element-plus 适配) */
.avatar-switch-department-guide__popper {
  .el-popper__arrow {
    left: 16px !important;
  }
}
</style>
