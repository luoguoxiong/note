<template>
  <div v-show="!isCollapse" class="customer-code-trigger">
    <!-- 公司简称 + 添加/切换客户编码按钮 -->
    <div class="avatar-info-area">
      <!-- 不加 click.stop: 点击需冒泡到 document, 让其他侧边栏浮层的「点击外部关闭」生效(浮层互斥) -->
      <div ref="triggerRef" class="customer-info-and-handle-btn-content" @click="onBindCustomerCode">
        <div class="customer-info">
          <div class="company avatar-user-info__customer-code">
            <el-tooltip
              popper-class="avatar-customer-short-name__popover"
              effect="dark"
              :visible="showCustomerShortNameTooltip"
              :content="customerShortName"
              :disabled="customerShortNameDisabled"
              placement="right"
            >
              <div
                class="customer-short-name"
                :class="[customCode && 'hasCustomer']"
                @mouseenter="onCustomerShortNameMouseenter"
                @mouseleave="onCustomerShortNameMouseleave"
              >
                {{ customerShortName }}
              </div>
            </el-tooltip>
          </div>
        </div>

        <!-- 添加/切换客户编码按钮 -->
        <div class="customer-code-handle-btn">
          <span class="handle-btn-wrapper">
            {{ customerCodeBtnText }}
            <img
              class="svg-right"
              src="https://ic-img.ky-express.com/netc/20260115_33671_!!1768448791662_14_14.svg+xml"
              alt=""
            />
          </span>
        </div>
      </div>
    </div>

    <!-- 切换客户编码列表 popover -->
    <div
      v-show="popoverVisible && existedRelationBind"
      ref="popoverRef"
      class="popover-container customer-code-popover"
    >
      <div class="label">切换客户编码</div>
      <div class="list--wrapper">
        <div class="info-avatar-popover-close">
          <el-icon @click="customerCodePopoverVisibleFn"><Close /></el-icon>
        </div>
        <div class="list-container">
          <div
            v-for="(item, index) in sortedCustomerList"
            :key="index"
            class="list-item"
            @click="handleChangeCustomerCode(item)"
          >
            <div class="list-item--info">
              <div class="info-customerName">{{ item.customerName }}</div>
              <div class="info-customerCode">客户编码：{{ item.customerCode }}</div>
            </div>
            <span v-show="selectedCustomerCode === item.customerCode && loading" class="binding">
              <img src="https://ic-img.ky-express.com/netc/20240907_82770395191_!!1725703577651_28_28.png" alt="" />
              {{ isUnbinding ? '解绑中' : customCode ? '切换中' : '绑定中' }}
            </span>
            <span v-if="customCode === item.customerCode && !isChanging" class="cur-bind"></span>
          </div>
        </div>
      </div>
      <div v-if="existedRelationBind" class="add-customer-code__btn" @click="handleAddCustomerCode">
        <el-icon><Plus /></el-icon>
        <span class="add-text">添加客户编码</span>
      </div>
      <div class="info-popover-arrow"></div>
    </div>

    <!-- 客户编码弹窗集(添加/更换/忘记密码/关联账号申请流程, 来源 module-customer-code) -->
    <ModuleCustomerCode ref="moduleCustomerCodeRef" />
  </div>
</template>

<script setup lang="ts">
/**
 * 添加/切换客户编码按钮组件
 * 来源: netc-pc-web/src/views/layout/avatar.vue「添加/切换客户编码」业务块
 * 迁移说明:
 *  - vue2 + element-ui -> vue3 script setup + element-plus
 *    (el-tooltip :manual="true" + v-model -> :visible 受控模式, 字体图标 el-icon-plus/close -> @element-plus/icons-vue)
 *  - vuex -> pinia(useUserStore + module-customer-code useCustomerCodeStore)
 *  - $refs.CustomerCodeRef(添加/更换客户编码弹窗) -> module-customer-code(defineExpose handleAddCustomerCode/handleChangeCustomerCode)
 *  - $refs.relationAccountFlowRef(关联账号流程弹窗) -> module-customer-code 内集成 RelationAccountFlow(defineExpose showRelationAccountFlow)
 *  - popover 定位: 相对组件根元素 absolute(默认展开在按钮右侧), 使用方可按容器场景覆盖 .customer-code-popover 的 top/right
 */
import { onMounted, onUnmounted, ref } from 'vue'
import { Close, Plus } from '@element-plus/icons-vue'
import ModuleCustomerCode from '@/views/home/module/module-customer-code/index.vue'
import {
  useCustomerCodeButton,
  type ApplyRelationAccountPayload,
  type ModuleCustomerCodeExposed,
} from './hooks/useCustomerCodeButton'
defineOptions({ name: 'CustomerCodeButton' })

interface Props {
  /** 侧边栏是否收起(收起时隐藏按钮区域, 对齐老基座 avatar :is-collapse 行为) */
  isCollapse?: boolean
}
defineProps<Props>()

/** module-customer-code 弹窗实例 */
const moduleCustomerCodeRef = ref<ModuleCustomerCodeExposed | null>(null)
/** 按钮点击区域(点击组件外关闭列表时使用) */
const triggerRef = ref<HTMLElement | null>(null)
/** 切换客户编码列表 popover */
const popoverRef = ref<HTMLElement | null>(null)

/** 申请关联账号(切换返回 flowVisible -> 打开 module 内关联账号申请流程弹窗集, 对齐老基座 avatar relationAccountFlowRef.showDialog) */
const onApplyRelationAccount = (payload: ApplyRelationAccountPayload) =>
  moduleCustomerCodeRef.value?.showRelationAccountFlow(payload)

const {
  popoverVisible,
  loading,
  isChanging,
  isUnbinding,
  selectedCustomerCode,
  showCustomerShortNameTooltip,
  customCode,
  sortedCustomerList,
  existedRelationBind,
  customerShortName,
  customerShortNameDisabled,
  customerCodeBtnText,
  onBindCustomerCode,
  customerCodePopoverVisibleFn,
  onCustomerShortNameMouseenter,
  onCustomerShortNameMouseleave,
  handleAddCustomerCode,
  handleChangeCustomerCode,
} = useCustomerCodeButton({
  moduleCustomerCodeRef,
  onApplyRelationAccount,
})

// 点击组件外区域/窗口失焦时关闭切换列表(对齐老基座 avatar handleClosePopover;
// 触发按钮不加 click.stop, 点击冒泡到 document 后本函数与其他浮层的同名监听共同实现浮层互斥)
const onDocumentClick = (e: MouseEvent) => {
  const target = e.target as Node
  if (popoverRef.value?.contains(target) || triggerRef.value?.contains(target)) return
  popoverVisible.value = false
}
const onWindowBlur = () => {
  popoverVisible.value = false
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

.customer-code-trigger {
  position: relative;
  // 对齐老基座 .user-info 容器宽度与 body { line-height: 1 } 的继承效果
  width: 144px;
  line-height: 1;
}

// 对齐老基座 .avatar-info-area 包裹层
.avatar-info-area {
  border-radius: 4px;
  width: 144px;
  padding-bottom: 4px;

  .customer-info-and-handle-btn-content {
    background: linear-gradient(180deg, #e4e5ff 0%, rgba(221, 222, 255, 0) 100%);
    border-radius: 4px;
    padding: 4px 4px 2px 4px;
    box-sizing: border-box;
    cursor: pointer;

    .customer-info {
      width: 100%;
      height: auto;
      cursor: pointer;

      // 老基座该元素同时含 avatar-user-info__customer-code 与 company 两个类, 保持原级联顺序(company 的 display:block 生效)
      .avatar-user-info__customer-code {
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .company {
        text-align: center;
        display: block;

        .customer-short-name {
          font-size: 12px;
          color: #686b75;
          text-align: center;
          font-weight: normal;
        }

        .hasCustomer {
          overflow: hidden;
          white-space: nowrap;
          text-overflow: ellipsis;
          max-width: 144px;
          width: 100%;
          height: 18px;
          padding: 0 3px;
          box-sizing: border-box;
          line-height: 18px;
        }
      }
    }

    .customer-code-handle-btn {
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;

      .handle-btn-wrapper {
        color: #7143f0;
        font-size: 13px;
        font-weight: normal;
        line-height: 20px;
        padding: 2px 4px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 4px;
        box-sizing: border-box;

        .svg-right {
          height: 14px;
          width: 14px;
        }

        &:hover {
          background: #f0ecfd;
        }

        &:active {
          background: #d1c6f0;
        }
      }
    }
  }
}

.customer-code-popover {
  position: absolute;
  top: 4px;
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

      .info-customerCode {
        font-size: 13px;
        font-weight: normal;
        line-height: 20px;
        letter-spacing: 0px;
        color: #8c8f99;
      }

      &:focus,
      &:hover {
        background: rgba(36, 38, 43, 0.06);
      }

      /* 旋转动画 */
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

      .cur-bind {
        position: absolute;
        right: 16px;
        top: 50%;
        transform: translateY(-50%);
        height: 16px;
        width: 48px;
        background: url('https://ic-img.ky-express.com/netc/20240831_87921882344_!!1725104894645_112_36.png') no-repeat;
        background-size: 48px 16px;
        border-radius: 2px;
        color: #fff;
        box-sizing: border-box;
      }
    }
  }

  .add-customer-code__btn {
    height: 38px;
    box-sizing: border-box;
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
    color: #7143f0;

    .el-icon {
      font-size: 14px;
      font-weight: bold;
      margin-right: 4px;
    }

    &:hover {
      color: #8a61f2;
    }

    &:active {
      color: #3e25e9;
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
/* 客户编码简称气泡(老基座 avatar-customer-short-name__popover; element-plus popper 根类名为 el-popper) */
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
</style>
