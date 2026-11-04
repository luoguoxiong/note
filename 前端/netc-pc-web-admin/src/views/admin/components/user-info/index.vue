<template>
  <div class="user-info-root">
    <!-- 用户信息: 头像+实名+手机号(折叠时仅展示头像) -->
    <div class="user-info" :class="{ 'user-info--collapse': isCollapse }">
      <!-- 头部信息: 头像+手机号 -->
      <div ref="triggerRef" class="user-info-avatar" @click="onUserInfoBtnClick">
        <div class="avatar">
          <img :onerror="defaultAvatar" :src="userInfo?.headUrl || defaulSextAvatar" />
        </div>
        <template v-if="!isCollapse">
          <div :class="[hasRealNameVerify ? 'real-name' : 'no-real-name']">{{ authFlagName }}</div>
          <div class="info">
            <div class="info-phone">
              <span :class="['info-username', userInfo?.userName && 'isUserName']">
                {{ userInfo?.userName || formatPhone }}
              </span>
              <k-icon v-if="userInfo?.userName || formatPhone" color="var(--k-color-purple-05)">
                <ArrowRightGrey />
              </k-icon>
            </div>
          </div>
        </template>
      </div>
    </div>

    <!-- 个人信息popover -->
    <div
      v-show="popoverVisible"
      ref="popoverRef"
      class="info-popover-container avatar-user-info__popper"
      @mouseenter="onUserInfoPopoverMouseenter"
      @mouseleave="onUserInfoPopoverMouseleave"
    >
      <div class="content">
        <div class="info-avatar-popover-close">
          <k-icon @click="onUserInfoPopoverClose"><CloseGrey /></k-icon>
        </div>
        <div class="info-area" @click="onJumpUserCenter">
          <div class="avatar">
            <img :onerror="defaultAvatar" :src="userInfo?.headUrl || defaulSextAvatar" />
          </div>
          <div>
            <p class="name">
              <span>{{ userInfo?.userName || '未填写昵称' }}</span>
              <span>
                <span :class="['name_userinfo', hasRealNameVerify ? 'realname' : 'norealname']">
                  {{ authFlagName }}
                </span>
              </span>
            </p>
            <p class="phone">{{ formatPhone }}</p>
            <k-icon class="arrow-right-icon"><ArrowRightGrey /></k-icon>
          </div>
        </div>
        <div class="menu">
          <p
            class="menu-item menu-item--switch-login-mobile"
            v-if="!showSwitchBack"
            @click="onSwitchLoginMobileBtnClick"
            @mouseenter="onSwitchLoginMobileMouseenter"
            @mouseleave="onSwitchLoginMobileMouseleave"
          >
            <k-icon class="menu-icon"><SwitchPhone /></k-icon>
            <span class="title">切换登录手机号</span>
            <k-icon class="menu-icon"><ArrowRightGrey /></k-icon>
            <!-- 切换登录手机号列表 popover -->
            <SwitchLoginMobile
              v-show="switchLoginMobileVisible"
              @mouseenter="onLoginMobileMouseenterPopper"
              @mouseleave="onLoginMobileMouseleavePopper"
              @close="onSwitchLoginMobileClose"
              @closeUserInfo="closeUserInfo"
            />
          </p>
          <p class="menu-item" v-if="showWhiteList" @click="showUserList">
            <k-icon class="menu-icon"><Switch /></k-icon>
            <span class="title">切换客户手机号</span>
          </p>
          <p class="menu-item" v-if="showSwitchBack" @click="onSwitchBack">
            <k-icon class="menu-icon"><Back /></k-icon>
            <span class="title">返回自己的手机号</span>
          </p>
          <p class="menu-item" @click="logout">
            <k-icon class="menu-icon"><Logout /></k-icon>
            <span class="title">退出登录</span>
          </p>
        </div>
      </div>
      <div v-if="isClientModeVal" class="system-version">
        <div>
          版本号:
          <span class="version-color">{{ clientVersion }}</span>
        </div>
        <div class="upgrade" v-if="needUpgrade">
          <k-button size="small" type="default" @click="onSystemUpgrade">检查更新</k-button>
        </div>
      </div>
      <!-- 下载新版客户端入口(老 download-new-client-link-btn, NewClientPromotion 弹窗待迁移, 上抛父级) -->
      <div v-if="isOldClientModeVal" class="version-update" @click="onDownloadNewClient">
        <span>版本更新</span>
      </div>
      <div class="info-popover-arrow"></div>
    </div>

    <!-- 切换客户手机号(白名单)弹窗 -->
    <WhiteListDialog v-model="whiteListVisible" />
  </div>
</template>

<script setup lang="ts">
/**
 * 用户信息组件
 * 来源: netc-pc-web/src/views/layout/avatar.vue「用户信息」业务块(头像+实名+手机号 + 个人信息 popover)
 * 迁移说明:
 *  - vue2 + element-ui -> vue3 script setup + element-plus(字体图标 -> @element-plus/icons-vue)
 *  - vuex userInfo/realNameInfo -> useUserStore(pinia); downloadCenter getter -> usePcWebDownloadCenterStore
 *  - $native.* -> @/native/electron; loginOut -> 本目录 api.ts(web.login.logout) + userLogOut
 *  - 切换客户手机号(white-list -> WhiteListDialog)/返回自己的手机号(switchBack -> useSwitchBack) 已迁移, 组件内聚处理
 *  - 下载新版客户端弹窗(NewClientPromotion) 新基座暂未迁移, 点击通过事件上抛父级处理
 *  - popover 定位: 相对组件根元素 absolute(默认展开在头像右侧), 使用方可按容器场景覆盖 .info-popover-container 的 top/right
 */
import { onMounted, onUnmounted, ref } from 'vue'
import defaultAvatarImg from '@/assets/image/admin/avatar_img_new.png'
import SwitchLoginMobile from './components/switch-login-mobile.vue'
import WhiteListDialog from './components/white-list-dialog.vue'
import { useUserInfo } from './hooks/useUserInfo'
import { KIcon, KButton } from '@netc-design-pc/ui'
import { SwitchPhone, ArrowRightGrey, Switch, Logout, Back, CloseGrey } from '@netc-design-pc/icons'

defineOptions({ name: 'UserInfo' })

interface Props {
  /** 侧边栏是否收起(收起时仅展示头像, 对齐老基座 avatar :is-collapse 行为) */
  isCollapse?: boolean
}
defineProps<Props>()

const emit = defineEmits<{
  (e: 'downloadNewClient'): void
}>()

/** 头像加载失败兜底(老 defaultAvatar onerror) */
const defaultAvatar = `this.src="${defaultAvatarImg}"`

/** 头像点击区域(点击组件外关闭 popover 时使用) */
const triggerRef = ref<HTMLElement | null>(null)
/** 个人信息 popover */
const popoverRef = ref<HTMLElement | null>(null)

const {
  popoverVisible,
  whiteListVisible,
  clientVersion,
  needUpgrade,
  isClientModeVal,
  isOldClientModeVal,
  switchLoginMobileVisible,
  userInfo,
  authFlagName,
  hasRealNameVerify,
  formatPhone,
  showWhiteList,
  showSwitchBack,
  defaulSextAvatar,
  onUserInfoBtnClick,
  onUserInfoPopoverClose,
  onUserInfoPopoverMouseenter,
  onUserInfoPopoverMouseleave,
  onJumpUserCenter,
  onSwitchLoginMobileBtnClick,
  onSwitchLoginMobileMouseenter,
  onSwitchLoginMobileMouseleave,
  onLoginMobileMouseenterPopper,
  onLoginMobileMouseleavePopper,
  onSwitchLoginMobileClose,
  closeUserInfo,
  showUserList,
  onSwitchBack,
  logout,
  onSystemUpgrade,
  onDownloadNewClient,
} = useUserInfo({
  onDownloadNewClient: () => emit('downloadNewClient'),
})

// 点击组件外区域/窗口失焦时关闭 popover(对齐老基座 avatar handleClosePopover)
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
.user-info-root {
  position: relative;
}

.user-info {
  padding-bottom: 4px;

  &:not(.user-info--collapse) {
    width: 144px;
  }

  display: flex;
  flex-direction: column;
  align-items: center;

  .user-info-avatar {
    cursor: pointer;
    padding-top: 4px;
    text-align: center;
    width: 100%;

    &:hover {
      background: rgba(36, 38, 43, 0.03);
      border-radius: 4px;
    }
  }

  .avatar {
    height: 42px;

    img {
      width: 42px;
      height: 42px;
      border-radius: 50%;
      object-fit: cover;
    }
  }

  .real-name {
    margin: 0 auto;
    height: 16px;
    padding: 0 4px;
    border-radius: 2px;
    opacity: 1;
    background: #ff8c00;
    font-size: 12px;
    font-weight: normal;
    line-height: 16px;
    color: #ffffff;
    display: inline-block;
  }

  .no-real-name {
    margin: 0 auto;
    height: 16px;
    padding: 0 4px;
    display: flex;
    justify-content: center;
    align-items: center;
    border-radius: 2px;
    opacity: 1;
    background: #adb0b8;
    font-size: 12px;
    font-weight: normal;
    line-height: 16px;
    color: #ffffff;
    display: inline-block;
  }

  .info {
    padding: 2px 0;
    user-select: none;

    &-phone {
      height: 22px;
      font-size: 15px;
      font-weight: 600;
      color: #24262b;
      text-align: center;
      cursor: pointer;
      display: flex;
      justify-content: center;
      align-items: center;

      .info-username {
        line-height: 1.4;
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
        font-weight: 600;
        color: #24262b;
        font-size: 15px;
        margin-right: 2px;

        &.isUserName {
          max-width: 92px;
        }
      }
    }
  }
}

.info-popover-container {
  right: -308px;
  top: 0;
  z-index: 999;
  box-shadow: 0px 5px 5px -3px rgba(0, 0, 0, 0.1), 0px 8px 10px 1px rgba(0, 0, 0, 0.06),
    0px 3px 14px 2px rgba(0, 0, 0, 0.05);
  position: absolute;
  background: #ffffff;
  border-radius: 4px;
  width: 308px;

  .content {
    position: relative;
    cursor: pointer;

    .info-avatar-popover-close {
      position: absolute;
      top: 0;
      right: 0;
      z-index: 11;
      width: 20px;
      height: 20px;
      text-align: right;
      cursor: pointer;

      .k-icon {
        font-size: 14px;
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

    .info-area {
      position: relative;
      z-index: 10;
      padding: 16px;
      display: flex;
      align-items: center;
      background: #f7f8fa;

      &:hover {
        background: #f7f8fa;
      }

      .avatar {
        margin-right: 8px;

        img {
          width: 40px;
          height: 40px;
        }
      }

      .name {
        display: flex;
        justify-content: center;
        align-items: center;

        > span {
          &:first-of-type {
            color: #24262b;
            font-size: 14px;
            margin-right: 10px;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            display: inline-block;
            max-width: 84px;
            font-weight: 600;
          }
        }
      }

      .phone {
        color: #8f8fa8;
        font-size: 12px;
        line-height: 1;
        margin-top: 8px;
      }

      .arrow-right-icon {
        position: absolute;
        right: 16px;
        top: 25px;
        color: #24262b;
      }
    }

    .menu {
      &-item {
        height: 44px;
        display: flex;
        align-items: center;
        gap: 6px;
        color: var(--k-color-text-primary);
        font-size: 13px;
        padding: 0 16px;
        position: relative;
        box-sizing: border-box;

        &:hover {
          background: var(--k-color-interaction-06);
          color: var(--k-color-purple-05);

          &:hover {
            .menu-icon {
              color: var(--k-color-purple-05);
            }
          }
        }

        &::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          margin: auto;
          width: 90%;
          height: 1px;
          background-color: #f4f6f7;
        }

        .title {
          flex: 1;
        }

        .menu-icon {
          color: #686b75;
        }

        .arrow-right {
          position: absolute;
          right: 16px;
          top: 50%;
          margin-top: -7px;
        }
      }
    }
  }

  .system-version {
    font-size: 12px;
    font-family: PingFangSC, PingFangSC-Regular;
    font-weight: 400;
    color: #8f8fa8;
    padding: 13px 0;
    margin: 0 15px;
    border-top: 1px solid #f5f5f5;

    .version-color {
      font-size: 13px;
      font-family: PingFangSC, PingFangSC-Semibold;
      font-weight: 600;
      text-align: left;
      color: #03050d;
    }

    .upgrade {
      padding-top: 12px;
    }
  }

  .version-update {
    padding: 13px 0;
    margin: 0 15px;
    border-top: 1px solid #f5f5f5;
    text-align: center;

    span {
      cursor: pointer;
      font-family: PingFangSC, PingFangSC-Regular;
      font-size: 13px;
      font-weight: 600;
      color: #8b60f0;
    }
  }

  .info-popover-arrow {
    top: 30px;
    left: -6px;
    margin-bottom: 3px;
    border-color: transparent;
    border-right-color: #ffffff;
    border-style: solid;
    border-width: 6px;
    border-left-width: 0;
    position: absolute;
    display: block;
    width: 0;
    height: 0;
  }
}

.name_userinfo {
  height: 16px;
  border-radius: 2px;
  opacity: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 12px;
  font-weight: normal;
  line-height: 12px;
  letter-spacing: 0px;
  color: #ffffff;
  padding: 0 4px;
}

.realname {
  background: #ff8c00;
}

.norealname {
  background: #adb0b8;
}
</style>
