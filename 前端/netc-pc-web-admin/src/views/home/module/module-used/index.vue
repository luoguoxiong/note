<template>
  <Content :is-loading="homeStatus.commonFunctionLoading">
    <template v-slot:title>
      <span class="text">常用功能</span>
    </template>
    <template v-slot:more>
      <div class="more_box" @click="onShow">
        <img :src="`./svg/setting.svg`" alt="" srcset="" />
        <span>设置常用</span>
      </div>
    </template>
    <template v-slot:content>
      <div
        ref="container"
        :class="['card-wrap', { narrow: isNarrow }]"
        v-if="commonFunction.length > 0"
        v-exposure-report="{
          eventCode: 'exp_homepage_quick_access_v1',
          region_code: 'quick_access',
          otherParams: () => {
            return {
              access_name: commonFunction.map((item) => item.menuName).join(','),
            }
          },
        }"
      >
        <div class="card-item" v-for="item in commonFunction" :key="item.menuName" @click="toMenuRouter(item)">
          <div class="icon-wrap">
            <img :src="getCommonFunctionIcon(item)" :alt="item.menuName" />
          </div>
          <div class="userd-name">{{ item.menuName }}</div>
        </div>
      </div>
      <Empty v-else></Empty>
    </template>
  </Content>

  <KDialog
    v-model="isShowDialog"
    :close-on-click-modal="false"
    class="module-used-dialog"
    max-height="80vh"
    title="设置常用"
    width="740"
    :loading="isSaving"
    confirm-text="保存"
    @confirm="onSave"
    @cancel="onCancle"
  >
    <div
      class="notice-title"
      v-exposure-report="{
        eventCode: 'exp_homepage_quick_access_setup_v1',
        region_code: 'quick_access',
        otherParams: () => {
          return {
            click_id: baseReportInstance.get('click_id'),
          }
        },
      }"
    >
      <img :src="'./svg/notice.svg'" />
      您可以自定义常用功能，便于您快捷访问功能模块
    </div>
    <div class="setting-content">
      <div class="tit_box">
        <span class="label_tit">已选功能</span>
        <span class="desc">（{{ selectedData.length }}/9）可拖动卡片进行排序</span>
      </div>
      <SelectedSetting :selectedData="selectedData" @delete="onDelete" @drag="onDrag" />
      <div class="tit_box">
        <span class="label_tit">可选功能</span>
      </div>
      <AllSetting :allData="totalData" @addOrDelDrag="addOrDelDrag" />
    </div>
  </KDialog>

  <KMessageBoxDialog
    v-model="showNotice"
    dialog-type="feedback"
    title="温馨提示"
    :message="`您的权限已变更，无法访问${activeName}，请刷新页面`"
    :is-show-cancel="false"
    confirm-text="我知道了"
    @confirm="iknow"
  />
</template>

<script setup lang="ts">
import { KMessage, KDialog, KMessageBoxDialog } from '@netc-design-pc/ui'
// import ButtonLoadingIcon from '@/components/button-loading-icon/index.vue'
// import whiteLoading from '@/assets/common-loading-white.png'
import { useHomeStore } from '@/hooks/useHomeStore'
import { locationRouteV2, parentMessageSend } from '@/utils/appBridge'
import Content from '@/views/home/components/content/index.vue'
import AllSetting from './components/all-setting/index.vue'
import SelectedSetting from './components/selected-setting/index.vue'
import { ref, computed } from 'vue'
import { queryCommonFunction, saveCommonFunction, checkMenu } from '@/apis/home'
import { SettingDataVO, LightApplicationInfoListVO } from '@/apis/home/types'
import Empty from './components/no-data/index.vue'
import { baseReportInstance } from '@/reportUmp'
import { useNarrowContainer } from '../hooks/useNarrowContainer'
import { getCommonFunctionIcon, sortCommonFunctionSettings } from './config'
const { store, commonFunction, homeStatus } = useHomeStore()
interface ModalState {
  // 常用功能信息
  funcInfo: SettingDataVO
  // 是否高亮
  isActive: boolean
}

const isShowDialog = ref(false)
const isSaving = ref(false)
const container = ref<HTMLElement>()
const isNarrow = useNarrowContainer(container)

const showNotice = ref(false)

const selectedData = ref<SettingDataVO[]>([])

const allData = ref<ModalState[]>([])

const activeName = ref('')

const onShow = async () => {
  window.$umpOtherReport(
    'CLK',
    {
      eventCode: 'clk_homepage_quick_access_setup_v1',
    },
    {
      region_code: 'quick_access',
    }
  )
  try {
    const { data } = await queryCommonFunction()
    selectedData.value = data.selectedMenuList
    allData.value = sortCommonFunctionSettings(data.allMenuList).map((item: SettingDataVO) => {
      return {
        funcInfo: item,
        isActive: false,
      }
    })
    isShowDialog.value = true
  } catch (error) {
    parentMessageSend({ type: 'error', message: '常用功能加载失败，请稍后重试' })
  }
}

const onDelete = (code: string) => {
  if (selectedData.value.length <= 6) {
    // KMessage 默认 zIndex 固定 2000，会被弹窗遮罩（自增 z-index）盖住，需显式抬高
    KMessage.warning({ message: '不能再删啦，功能不可少于6个', zIndex: 3000 })
    return
  }
  const index = selectedData.value.findIndex((item) => item.menuCode === code)
  if (index >= 0) selectedData.value.splice(index, 1)
}

const totalData = computed(() => {
  const mapIds = new Map()

  selectedData.value.forEach((item) => {
    mapIds.set(item.menuCode, true)
  })

  return allData.value.map((item) => {
    item.isActive = mapIds.get(item.funcInfo.menuCode) || false
    return item
  })
})

const onDrag = (list: SettingDataVO[]) => {
  // 当用户切换了成功再上报埋点事件
  if (!(selectedData.value === list)) {
    window.$umpOtherReport(
      'CLK',
      {
        eventCode: 'other_homepage_quick_access_selected_drag_v1',
      },
      {
        region_code: 'quick_access',
      }
    )
  }
  selectedData.value = list
}

const addOrDelDrag = (info: ModalState) => {
  if (info.isActive) {
    onDelete(info.funcInfo.menuCode)
  } else {
    if (selectedData.value.length >= 9) {
      KMessage.warning({ message: '最多设置9个常用功能，您可移除已选重新添加', zIndex: 3000 })
    } else {
      selectedData.value.push(info.funcInfo)
    }
  }
}

const onCancle = ({ action }: { action: 'close' | 'cancel' | undefined }) => {
  if (action === 'close') {
    window.$umpOtherReport(
      'CLK',
      {
        eventCode: 'clk_homepage_quick_access_submit_v1',
      },
      {
        region_code: 'quick_access',
        button_name: '取消',
      }
    )
  }
  // isShowDialog.value = false
}

const onSave = async () => {
  window.$umpOtherReport(
    'CLK',
    {
      eventCode: 'clk_homepage_quick_access_submit_v1',
    },
    {
      region_code: 'quick_access',
      button_name: '保存',
    }
  )
  const menuCodeList = selectedData.value.map((item) => item.menuCode)
  if (menuCodeList.length < 6 || menuCodeList.length > 9) {
    KMessage.warning({
      message: menuCodeList.length < 6 ? '不能再删啦，功能不可少于6个' : '最多设置9个常用功能，您可移除已选重新添加',
      zIndex: 3000,
    })
    return
  }
  if (menuCodeList.some((code) => !code) || new Set(menuCodeList).size !== menuCodeList.length) {
    parentMessageSend({ type: 'error', message: '常用功能数据异常，请重新选择' })
    return
  }
  try {
    isSaving.value = true
    await saveCommonFunction(menuCodeList)
    await store.getCommonFunction()
    isShowDialog.value = false
    parentMessageSend({ type: 'success', message: '保存成功' })
  } catch (error) {
    parentMessageSend({ type: 'error', message: '保存失败，请稍后重试' })
  } finally {
    isSaving.value = false
  }
}

const toMenuRouter = async (info: LightApplicationInfoListVO) => {
  window.$umpOtherReport(
    'CLK',
    {
      eventCode: 'clk_homepage_quick_access_button_v1',
    },
    {
      region_code: 'quick_access',
      access_name: info.menuName,
    }
  )
  sessionStorage.setItem('click_id', baseReportInstance.get('click_id'))
  try {
    const { data } = await checkMenu(info.menuCode)
    if (data) {
      locationRouteV2.push({
        path: info.routePath,
        query: {
          needQuerySave: 'false',
          pre_click_id: baseReportInstance.get('click_id'),
        },
      })
    } else {
      activeName.value = info.menuName
      showNotice.value = true
    }
  } catch (error) {
    parentMessageSend({ type: 'error', message: '权限校验失败，请稍后重试' })
  }
}

const iknow = () => {
  // showNotice.value = false
  window.parent.location.reload()
}
</script>

<style scoped lang="scss">
.setting-content {
  padding: 0 24px 16px;
}
.card-wrap {
  display: grid;
  grid-template-columns: repeat(3, 1fr); /* 一行三列 */
  grid-gap: 8px;
}
.card-wrap.narrow {
  grid-template-columns: repeat(2, 1fr);
}
.text {
  font-size: 18px;
  font-weight: 600;
  line-height: 26px;
  display: flex;
  align-items: center;
}
.more_box {
  display: flex;
  align-items: center;
  height: 24px;
  padding: 0 4px;
  border-radius: 4px;
  box-sizing: border-box;
  cursor: pointer;
  color: #7143f0;
  background: transparent;
  img {
    margin-right: 4px;
  }
  span {
    font-size: 13px;
  }
}
.more_box:hover {
  color: #7143f0;
  background: #f3efff;
}
.more_box:active {
  color: #7143f0;
  background: #e3d9ff;
}
.card-item {
  display: flex;
  min-width: 0;
  min-height: 64px;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  border-radius: 4px;
  padding: 4px;
  box-sizing: border-box;
  i {
    font-size: 32px;
  }
}
.card-item:hover {
  background: rgba(36, 38, 43, 0.03);
}
.card-item:active {
  background: rgba(36, 38, 43, 0.06);
}
.icon-wrap {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex: none;
  margin: 0 auto 4px;
  border: 0;
  border-radius: 0;
  background: transparent;
  img {
    width: 48px;
    height: 48px;
    object-fit: contain;
  }
}
.userd-name {
  width: 100%;
  height: 20px;
  line-height: 20px;
  font-size: 13px;
  color: #24262b;
  text-align: center;
}
:global(.module-used-dialog) {
  --k-dialog-body-padding: 0;
}
.module-used-dialog {
  .notice-title {
    height: 32px;
    padding: 0 24px;
    font-size: 13px;
    color: var(---C2-Orange-06-F57200-, rgba(245, 114, 0, 1));
    display: flex;
    align-items: center;
    background: var(---C2-Orange-01-FFF3E5-Bg, rgba(255, 243, 229, 1));
    margin-bottom: 8px;
    img {
      width: 13px;
      height: 13px;
      display: block;
      margin-right: 8px;
    }
  }
  .tit_box {
    padding: 6px 12px;
    position: relative;
    margin-bottom: 16px;
    display: flex;
    align-items: center;
    background: linear-gradient(270deg, rgba(247, 248, 250, 0) 0%, #f7f8fa 100%);
    &:before {
      content: '';
      display: block;
      position: absolute;
      width: 4px;
      height: 14px;
      background: #8365f6;
      top: 50%;
      left: 0;
      margin-top: -7px;
    }
    .label_tit {
      position: relative;
      font-weight: bold;
      line-height: 20px;
      font-size: 14px;
    }
    .desc {
      font-size: 13px;
      color: #686b75;
    }
  }
}
</style>
