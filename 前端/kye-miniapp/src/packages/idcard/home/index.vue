<template>
  <scroll-view
    class="id-card-page"
    show-scrollbar="false"
    enable-flex
    :scroll-y="isCanScroll"
    :class="{ 'id-card-page__without-paddingbottom': isWithOutPaddingbottom }"
    :enhanced="true"
    :bounces="false"
  >
    <IdcardEditTitle v-if="isEdit" :applyStatus="applyStatus" :hrUserId="baseInfoHrUserId" :code="code" />

    <IdcardEditStatus v-if="isSalesInApplyingStatus" />

    <HomeIdcard
      v-if="info"
      :baseInfo="info"
      :code="code"
      :innerEmployInfo="innerEmployInfo"
      :isInnerEmployee="isInnerEmployee"
      :isSales="isSales"
      @updateShow="handleUpdateShow"
    />

    <template v-if="isLoadJson">
      <view>
        <template v-for="(item, index) in data" :key="item.templateId">
          <!-- v-if="item.templateId === 'businessCard_person-introduce_json'" -->
          <CardVideoIntroduce
            v-if="item.templateId === Template_ID_MAP.个人介绍视频"
            :title="item.title"
            :data="{
              videoInfo: {
                ...videoInfo,
                status: videoStatus,
              },
              code,
              idCardId,
              isLogin,
            }"
            :employeeId="baseInfoHrUserId"
            :progress="progress"
            :isOpen="item.isOpen"
            :isFirst="index === 0"
            :isLast="index === data.length - 1"
            :isEdit="isEdit"
            @update:progress="setProgress"
            @updateVideoStatus="updateVideoStatus"
            @switch="(e) => onSwitch(e, index, '1')"
            @move="(e) => onMove(e, item.templateId, index, '1')"
            @updateVideoInfo="updateVideoInfo"
          />

          <!-- v-else-if="item.templateId === 'businessCard_wx-video_json' && !(isQw && !isInnerEmployee)" -->
          <CardVideo
            v-else-if="item.templateId === Template_ID_MAP.微信视频号 && !(isQw && !isInnerEmployee)"
            :isOpen="item.isOpen"
            :title="item.title"
            :data="item.data"
            :isFirst="index === 0"
            :isLast="index === data.length - 1"
            :isEdit="isEdit"
            :employeeId="baseInfoHrUserId"
            @switch="(e) => onSwitch(e, index, '2')"
            @move="(e) => onMove(e, item.templateId, index, '2')"
          />

          <!-- v-else-if="item.templateId === 'businessCard_company-info_json'" -->
          <CardRichTextInfo
            v-else-if="item.templateId === Template_ID_MAP.公司简介"
            :isOpen="item.isOpen"
            :title="item.title"
            :defaultHeight="508"
            :data="Array.isArray(item.data) ? item.data[0] : {}"
            :isFirst="index === 0"
            :isLast="index === data.length - 1"
            :isEdit="isEdit"
            :employeeId="baseInfoHrUserId"
            @switch="(e) => onSwitch(e, index, '3')"
            @move="(e) => onMove(e, item.templateId, index, '3')"
          />

          <!-- 行业解决方案 -->
          <!-- v-else-if="item.templateId === 'businessCard_industry-solutions_json'" -->

          <CardFunc
            v-else-if="item.templateId === Template_ID_MAP.行业解决方案"
            :isOpen="item.isOpen"
            :title="item.title"
            :isFirst="index === 0"
            :isLast="index === data.length - 1"
            :data="{
              data: item.data,
              businessCardId: idCardId,
              originData: item.originData || [],
              menuId: item.menuId,
            }"
            :employeeId="baseInfoHrUserId"
            :isEdit="isEdit"
            @switch="(e) => onSwitch(e, index, '4')"
            @move="(e) => onMove(e, item.templateId, index, '4')"
          />
          <!-- v-else-if="item.templateId === 'businessCard_company-honors_json'" -->

          <CardRichTextInfo
            v-else-if="item.templateId === Template_ID_MAP.企业荣誉"
            :isOpen="item.isOpen"
            :defaultHeight="508"
            :data="Array.isArray(item.data) ? item.data[0] : {}"
            :isFirst="index === 0"
            :isLast="index === data.length - 1"
            :title="item.title"
            :isEdit="isEdit"
            :employeeId="baseInfoHrUserId"
            @switch="(e) => onSwitch(e, index, '5')"
            @move="(e) => onMove(e, item.templateId, index, '5')"
          />
          <!-- v-else-if="item.templateId === 'businessCard_service-style_json'" -->
          <CardServiceInfo
            v-else-if="item.templateId === Template_ID_MAP.服务方式"
            :isOpen="item.isOpen"
            :title="item.title"
            :data="item.data"
            :isEdit="isEdit"
            :isFirst="index === 0"
            :isLast="index === data.length - 1"
            :employeeId="baseInfoHrUserId"
            @switch="(e) => onSwitch(e, index, '6')"
            @move="(e) => onMove(e, item.templateId, index, '6')"
          />

          <!-- v-else-if="item.templateId === 'businessCard_custom-style_json'" -->
          <CardRichTextInfo
            v-else-if="item.templateId === Template_ID_MAP.激情广告"
            :isOpen="item.isOpen"
            :data="Array.isArray(item.data) ? item.data[0] : {}"
            :isFirst="index === 0"
            :defaultHeight="508"
            :isLast="index === data.length - 1"
            :title="item.title"
            :isEdit="isEdit"
            :employeeId="baseInfoHrUserId"
            @switch="(e) => onSwitch(e, index, '7')"
            @move="(e) => onMove(e, item.templateId, index, '7')"
          />
        </template>

        <view class="idcard-home-logo-warp">
          <image
            class="logo-style"
            src="https://ic-img.ky-express.com/netc/20250218_866630115_!!1739851870460_376_94.png"
          />
        </view>

        <!-- 底部按钮原本位置 -->
      </view>
    </template>

    <template v-if="!isRender">
      <view></view>
    </template>
    <ProgressWarp ref="progressRef" />

    <!-- Comp 网络错误 -->
    <NetworkError v-if="!isRenderSuccess" @reload="onReload" />

    <!-- Comp 账号信息不一致 -->
    <NoticePage v-if="isShowNotice" />
  </scroll-view>
  <template v-if="isLoadJson">
    <BottomBtn
      :baseInfo="info"
      :isSales="isSales"
      :isEdit="isEdit"
      :qrCode="qrCode"
      :innerEmployInfo="innerEmployInfo"
      :isInnerEmployee="isInnerEmployee"
      :code="code"
      :hasNewVisData="hasNewVisData"
      @submit="handleSubmit"
      @edit="handleEdit"
      @cancel="handleCancle"
      @visitor="handleVisitor"
    />
  </template>
  <canvas type="2d" id="idcardCanvas" class="idcard_canvas_poster_1" />
  <canvas type="2d" id="idcardCanvas2" className="idcard_canvas_poster_2" />
</template>

<script setup lang="ts">
import Taro, { useDidShow, useRouter, useShareAppMessage, useDidHide } from '@tarojs/taro'
import { cloneDeep, findIndex, isEmpty } from 'lodash-es'
import { computed, nextTick, onMounted, ref } from 'vue'
// 常量
import { isQw } from '@/packages/idcard/utils/idcard-device'
import { lastModifyWorkOrderStatusMap, Template_ID_MAP } from '../const/index'
import type { TemplateValueType } from '../const/index'
// type
import type {
  IdcardHomeDetailTypes,
  getDetailForEmployeeTypes,
  menuEditRequestTypes,
} from '@/packages/idcard/api/types/index'
// 接口
import { getDetail, getDetailForEmployee, menuEdit, getVisitFlag } from '@/packages/idcard/api/index'
// 组件
import BottomBtn from './components/bottom-btn'
import CardFunc from './components/card-func'
import CardRichTextInfo from './components/card-richtext-info'
import CardServiceInfo from './components/card-service'
import CardVideo from './components/card-video'
import CardVideoIntroduce from './components/card-video-introduce'
import HomeIdcard from './components/home-idcard'
import NetworkError from './components/network-error'
import NoticePage from './components/notice-page'
import IdcardEditTitle from './components/idcard-edit-title'
import IdcardEditStatus from './components/idcard-edit-status'
import ProgressWarp from './components/loading-warp'
// hooks
import { shareInfo, usePreloadShareData } from './hook/usePreloadShareData'
import { statusMap } from './hook/useVideo'
import { useUserInfo } from '@/public/hooks'

// 曝光
import {
  ModuleMap,
  reportCardDetail,
  reportEditMode,
  reportEditModeRecord,
  reportPagesFn,
  trackEvent,
  uploadReportOpenid,
} from './report'
// store相关
import { useIdCardStore } from '../store/idcard'
import { useAutoLogin } from '@public/utils/user/useAutoLogin'
const { autoLoginHook } = useAutoLogin()

let isShowLiZhi = false

const router = useRouter()
const { preloadShareData } = usePreloadShareData()
const { id: code, bcSource, edit, type: shareType } = router.params

const isFirstFetch = ref<boolean>(false)
const progress = ref<number>(0)
const applyStatus = ref()
const isFirst = ref<boolean>(true)
const isLoadJson = ref<boolean>(false)
const isRender = ref<boolean>(false)

const isRenderSuccess = ref<boolean>(true)
const idCardId = ref('')
const isSales = ref<boolean>(`${bcSource}` === '1')

const videoInfo = ref({
  fileId: '',
  mp4Link: '',
  rejectReason: null,
  workOrderStatus: null,
  videoLikeAmount: 0,
  isVideoLike: true,
})

const videoStatus = ref(statusMap.isVideo)
const qrCode = ref('')
const info = ref(null)
const isShowNotice = ref<boolean>(false)
const isEdit = ref<boolean>(`${edit}` === '1')
const data = ref([])
const innerEmployInfo = ref()
const isInnerEmployee = ref<boolean>(false)

const hasNewVisData = ref<boolean>(false)

const homeIdCardStore = useIdCardStore()

const { userInfo } = useUserInfo()

const isLogin = computed(() => !!userInfo.value?.phone)

const isWithOutPaddingbottom = computed(() => {
  return !isRender.value || !isRenderSuccess.value || isShowNotice.value
})

const updateVideoInfo = (newData) => {
  videoInfo.value = {
    ...videoInfo.value,
    ...newData,
  }
}

const updateVideoStatus = (newStatus) => {
  videoStatus.value = newStatus
}

const progressRef = ref()

/**
 * 处理首页数据
 * @param {Array} menuList - 用户个人资料菜单配置列表
 * @param {Object} responseData - 接口返回的完整响应数据
 * @param {boolean} [isUpdate=false] - 是否为更新操作，默认为false
 */
const handleHomeData = async (menuList, responseData, isUpdate = false) => {
  try {
    // 1. 解构并处理基础数据
    const { baseInfo, id, lastModifyWorkOrderStatus } = responseData

    // 设置应用状态
    applyStatus.value = lastModifyWorkOrderStatus

    // 构建用户信息对象
    setUserInfo(responseData)

    // 2. 获取并处理CMS数据
    const processedMenuData = await processMenuData(menuList)

    // 3. 更新UI状态和数据
    updateUIStates(baseInfo, id, processedMenuData, isUpdate)

    // 4. 预加载分享数据
    scheduleShareDataPreload()

    reportPages()
  } catch (error) {
    handleError(error)
    isRender.value = true
    isRenderSuccess.value = false
  }
}

// ============= 辅助函数 - 开始 ============= //

/**
 * 设置用户信息
 */
const setUserInfo = (responseData) => {
  info.value = {
    id: responseData.id,
    isSales: isSales.value,
    canSubmitCustomerResource: responseData.canSubmitCustomerResource,
    ...responseData.innerEmployInfo,
    ...responseData.baseInfo,
    baseInfo: {
      ...responseData.baseInfo,
      innerEmployInfo: responseData.innerEmployInfo,
    },
    innerEmployInfo: isSales.value ? true : responseData.isInnerEmployee,
  }

  innerEmployInfo.value = responseData.innerEmployInfo
  isInnerEmployee.value = isSales.value ? true : responseData.isInnerEmployee
}

/**
 * 处理菜单数据
 */
const processMenuData = async (menuList) => {
  // 1. 并行获取所有CMS数据
  const cmsRequests = menuList.map((menu) => fetchCmsJson(menu.link))
  const cmsResults = await Promise.all(cmsRequests)

  // 2. 处理每个菜单项
  return menuList.map((menu, index) => {
    // 解构菜单项配置
    const { contentList, menuId, templateCode, showSwitch, title } = menu
    // 获取对应的CMS返回数据
    const cmsData = cmsResults[index] || []

    // 3. 过滤和匹配有效内容
    const validContents = contentList
      // 3.1 先过滤出需要显示的内容项配置
      .filter((item) => item.showSwitch)
      // 3.2 根据contentId匹配对应的CMS数据
      .map((content) => {
        return cmsData.find((item) => item.contentId === content.contentId)
      })
      // 3.3 过滤掉未匹配到的项
      .filter(Boolean) // 过滤掉undefined

    // 4. 返回处理后的菜单数据结构
    return {
      menuId, // 菜单ID
      templateId: templateCode, // 模板代码
      isOpen: showSwitch, // 是否展开
      title, // 菜单标题
      contentList, // 原始内容配置
      data: validContents, // 过滤后的有效内容数据
      originData: cmsData, // 原始CMS数据（用于可能的后继处理）
    }
  })
}

/**
 * 更新UI状态
 */
const updateUIStates = (baseInfo, id, menuData, isUpdate) => {
  // 设置页面标题
  Taro.setNavigationBarTitle({
    title: isSales.value ? '我的名片' : `${baseInfo.employeeName}的名片`,
  })

  // 设置加载状态
  isLoadJson.value = true
  isFirst.value = false
  isRender.value = true

  // 设置视频信息（仅在非更新时）
  if (!isUpdate) {
    videoStatus.value = baseInfo.profileVideo?.fileId ? statusMap.isVideo : statusMap.isUpLoadWaiting

    videoInfo.value = {
      isVideoLike: baseInfo.isVideoLike,
      videoLikeAmount: baseInfo.videoLikeAmount,
      ...baseInfo.profileVideo,
    }
  }

  // 设置其他数据
  idCardId.value = id
  data.value = menuData
  qrCode.value = baseInfo.qrCode
  queryVisitFlag(baseInfo.hrUserId)
}

const queryVisitFlag = async (salesId) => {
  try {
    const res = await getVisitFlag({
      salesId: salesId,
    })
    console.log('queryVisitFlag', res)
    hasNewVisData.value = res.data
  } catch (error) {
    console.error(error)
  }
}

/**
 * 安排分享数据预加载
 */
const scheduleShareDataPreload = () => {
  nextTick(() => {
    preloadShareData({ info: info.value, code })
  })
}

/**
 * 错误处理
 */
const handleError = (error) => {
  console.error('处理首页数据出错:', error)
  reportCardDetail(
    'idcard_handleHomeData_error',
    { error_msg: error.message || JSON.stringify(error), sales_id: baseInfoHrUserId.value },
    isSales.value,
  )
}

// ============= 辅助函数 - 结束 ============= //

const getInfo = async () => {
  try {
    if (isFirst.value) {
      Taro.showLoading({
        title: '加载中...',
      })
    }
    reportCardDetail('idcard_request_start', { sales_id: baseInfoHrUserId.value }, isSales.value)

    const { data: res }: IdcardHomeDetailTypes.IdcardHomeDetailResponse = await getDetail({ code })

    reportCardDetail('idcard_request_success', { sales_id: baseInfoHrUserId.value }, isSales.value)
    const { materialList } = res
    if (!isSales.value && res.innerEmployInfo.inOffice === 20) {
      Taro.showModal({
        title: '温馨提示',
        content: handoverPersonDialogText(res.innerEmployInfo),
        confirmText: '我知道了',
        confirmColor: '#8365F6',
        showCancel: false,
        success: () => {},
      })
    }
    await handleHomeData(materialList, res)
    // 接口请求完成
    progressRef.value.finish()
    Taro.hideLoading()
  } catch (error) {
    console.log('获取信息失败1', error)
    reportCardDetail(
      'idcard_request_fail',
      { error_msg: JSON.stringify(error), sales_id: baseInfoHrUserId.value },
      isSales.value,
    )
    Taro.hideLoading()
    progressRef.value.finish()
    isRender.value = true
    isRenderSuccess.value = false
  } finally {
    progressRef.value.finish()
  }
}

const getSaleData = async (type) => {
  if (isFirst.value) {
    Taro.showLoading({
      title: '加载中...',
    })
  }
  try {
    const { data: res }: getDetailForEmployeeTypes.getDetailForEmployeeResponse = await getDetailForEmployee({
      code: code,
      origin: type === 1 ? 'edit' : undefined,
    })
    const { materialList, personMaterialList } = res
    const userPersonMater = (type === 1 ? materialList : personMaterialList) || []
    await handleHomeData(userPersonMater, res)
    // 接口请求完成
    progressRef.value.finish()
    isShowNotice.value = false
    Taro.hideLoading()
  } catch (error) {
    isRender.value = true
    if (error.code === 20001) {
      isShowNotice.value = true
    } else {
      console.log('获取信息失败2', error)
      isRenderSuccess.value = false
    }
    Taro.hideLoading()
    progressRef.value.finish()
  } finally {
    progressRef.value.finish()
  }
}

const fetchCmsJson = (json) => {
  return new Promise((resolve) => {
    const startTime = new Date().getTime()
    Taro.request({
      url: json,
      method: 'GET',
      success: (res) => {
        const endTime = new Date().getTime()
        reportCardDetail(
          'idcard_request_cms_success',
          { duration: endTime - startTime, json_url: json, sales_id: baseInfoHrUserId.value },
          isSales.value,
        )
        resolve(res.data)
      },
      fail: () => {
        console.log('获取信息失败3')
        isRenderSuccess.value = false

        reportCardDetail('idcard_request_cms_fail', { json_url: json, sales_id: baseInfoHrUserId.value }, isSales.value)
        resolve(null)
      },
    })
  })
}

const init = async () => {
  try {
    if (isSales.value) {
      await getSaleData(isEdit.value ? 1 : 2)
    } else {
      await getInfo()
    }
    Taro.hideLoading()
  } catch (error) {
    Taro.hideLoading()
  } finally {
    // Taro.hideLoading()
  }
}

const onSwitch = (e, index, moduleIndex) => {
  const clkCode = `clk_business_card_${e ? 'open' : 'close'}_module`
  trackEvent(clkCode, ModuleMap[moduleIndex], {
    page_name: 'page_business_card_edit',
    employee_id: baseInfoHrUserId.value,
    sales_id: baseInfoHrUserId.value,
  })
  const newData = cloneDeep(data.value) as any
  newData[index].isOpen = e
  data.value = newData
}

const onMove = (e, templateId: TemplateValueType, index, moduleIndex) => {
  const isUp = e > 0

  try {
    const clkCode = `clk_business_card_move_${isUp ? 'up' : 'down'}_module`
    trackEvent(clkCode, ModuleMap[moduleIndex], {
      page_name: 'page_business_card_edit',
      employee_id: baseInfoHrUserId.value,
      sales_id: baseInfoHrUserId.value,
    })
  } catch (error) {
    console.log('移动埋点错误: error ', error)
  }

  if (isUp && index > 0) {
    const newData = [...data.value]
    ;[newData[index], newData[index - 1]] = [newData[index - 1], newData[index]]
    data.value = newData
  } else if (!isUp && index < data.value.length - 1) {
    const newData = [...data.value]
    ;[newData[index], newData[index + 1]] = [newData[index + 1], newData[index]]
    data.value = newData
  }
}

const handleSubmit = async () => {
  trackEvent('clk_business_card_edit_save', '保存', {
    page_name: 'page_business_card_edit',
    employee_id: baseInfoHrUserId.value,
    sales_id: baseInfoHrUserId.value,
  })
  try {
    if (videoStatus.value === statusMap.isUploading) {
      Taro.showToast({
        title: '视频上传中，不可操作',
        icon: 'none',
        duration: 2000,
      })
      return
    }
    Taro.showLoading({
      title: '保存中...',
    })
    let sort = data.value.length
    const menuList = data.value.map((item: any) => {
      return {
        menuId: item.menuId,
        showSwitch: item.isOpen,
        sort: sort--,
      }
    }) as menuEditRequestTypes.MenuEditMenuItem[]

    await menuEdit({
      businessCardId: idCardId.value,
      menuList,
    } as menuEditRequestTypes.MenuEditRequest)
    await getSaleData(2)
    isEdit.value = false
    Taro.hideLoading()
  } catch (error) {
    console.error(error)
  } finally {
    Taro.hideLoading()
  }
}

const handleCancle = async () => {
  trackEvent('clk_business_card_edit_cancel', '取消', {
    page_name: 'page_business_card_edit',
    employee_id: baseInfoHrUserId.value,
    sales_id: baseInfoHrUserId.value,
  })

  if (videoStatus.value === statusMap.isUploading) {
    Taro.showToast({
      title: '视频上传中，不可操作',
      icon: 'none',
      duration: 2000,
    })
    return
  }
  Taro.showModal({
    title: '提示',
    content: '内容未保存，是否退出?',
    confirmColor: '#8365F6',
    cancelColor: '#686B75',
    success: async function (res) {
      if (res.confirm) {
        try {
          Taro.showLoading({
            title: '加载中...',
          })
          await getSaleData(2)
          isEdit.value = false
          Taro.hideLoading()
        } catch (error) {
          console.error(error)
        } finally {
          Taro.hideLoading()
        }
      } else if (res.cancel) {
        console.log('用户点击取消')
      }
    },
  })
}

const handleEdit = async () => {
  reportEditModeRecord({ info: info.value })
  Taro.showLoading({
    title: '加载中...',
  })
  await getSaleData(1)
  isEdit.value = true
  reportEditMode()
  Taro.hideLoading()
}

const handleVisitor = () => {
  Taro.navigateTo({
    url: `/packages/idcard/visitor/index?salesId=${baseInfoHrUserId.value}`,
  })
  trackEvent('clk_business_card_preview_data', '访客数据', {
    page_name: 'page_business_card_preview',
    employee_id: baseInfoHrUserId.value,
    sales_id: baseInfoHrUserId.value,
  })
}

const updateData = async (type) => {
  try {
    Taro.showLoading({
      title: '加载中...',
    })
    const { data: res } = await getDetailForEmployee({
      code: code,
      origin: type === 1 ? 'edit' : undefined,
    })
    const { materialList, personMaterialList } = res
    const userPersonMater = (type === 1 ? materialList : personMaterialList) || []

    const userPersonMaterMap = userPersonMater.reduce((acc, item) => {
      acc[item.menuId] = item
      return acc
    }, {})

    const originData = data.value
    const sortedArr = originData.map((item: any) => {
      return {
        ...userPersonMaterMap[item.menuId],
        isOpen: item.isOpen,
        showSwitch: item.isOpen,
      }
    })

    await handleHomeData(sortedArr, res, true)
    isShowNotice.value = false
  } catch (error) {
    console.error(error)
    if (error.code === 20001) {
      isShowNotice.value = true
    }
  } finally {
    Taro.hideLoading()
  }
}

const handoverPersonDialogText = (infow) => {
  if (infow && !isShowLiZhi) {
    isShowLiZhi = true
    if (infow.handover === '系统') {
      return '该联系人岗位变动，暂无相关人员为您提供服务。'
    } else {
      return `该联系人岗位变动，现由【${infow.handover}】继续为您提供服务。`
    }
  } else {
    return '该联系人岗位变动，暂无相关人员为您提供服务。'
  }
}

const reportPages = () => {
  reportPagesFn(
    {
      isSales: isSales.value,
      isEdit: isEdit.value,
    },
    {
      employee_id: baseInfoHrUserId.value,
      sales_id: baseInfoHrUserId.value,
      share_style: shareType ? '名片链接' : '名片二维码',
    },
  )
}

const getInitData = async () => {
  isRenderSuccess.value = true
  try {
    if (!isLogin.value && isSales.value) {
      Taro.navigateTo({ url: '/modules/user/pages/login/index' })
      homeIdCardStore.updateFresh(true)
    }
    if (!isLogin.value && !isSales.value) {
      await autoLoginHook()
    }
  } catch (error) {
    console.error(error)
  }
  // await init()
  try {
    if (isFirst.value) {
      await init()
      return
    }
    if (!isFirst.value && isSales.value && isEdit.value) {
      await updateData(isEdit.value ? 1 : 2)
      Taro.hideLoading()
    }
    if (isShowNotice.value || (!isSales.value && !isFirst.value)) {
      await init()
    }
  } catch (error) {
    Taro.hideLoading()
  }
}

const onReload = async () => {
  isRender.value = false
  isFirst.value = true
  isRenderSuccess.value = true
  await getInitData()
}

useDidShow(async () => {
  try {
    // 开始
    progressRef.value.start()

    returnFromOtherPageFn()

    reportPages()
    // target1-分享数据, 如果info不为空，则直接加载
    // 否则搜索 target2 接口请求数据后再提前加载分享数据
    if (!isEmpty(info.value)) {
      // preloadShareData({ info: info.value, code })
      scheduleShareDataPreload()
    }

    if (!isFirstFetch.value) {
      if (!homeIdCardStore.needFresh) {
        return
      }
      await getInitData()
      uploadReportOpenid()
    }

    setTimeout(() => {
      progressRef.value.finish()
    }, 1800)
    if (info.value?.baseInfo?.hrUserId) {
      queryVisitFlag(info.value.baseInfo.hrUserId)
    }
  } catch (error) {
    console.log('展示error', error)
  }
})

onMounted(async () => {
  if (isFirstFetch.value) {
    await getInitData()
    isFirstFetch.value = false
  }
  uploadReportOpenid()
})

// 同步返回
useShareAppMessage(() => {
  return shareInfo.value
})

const hasApplyData = computed(
  () => +applyStatus.value === +lastModifyWorkOrderStatusMap.padding || +videoInfo.value?.workOrderStatus === 1,
)

const isSalesInApplyingStatus = computed(() => hasApplyData.value && !isEdit.value && isSales.value)

const baseInfoHrUserId = computed(() => info?.value?.baseInfo?.hrUserId)

const setProgress = (e) => {
  // 转换为number
  progress.value = +e
}

const isCanScroll = ref(true)

const handleUpdateShow = (val) => {
  isCanScroll.value = !val
}

const isReturnFromOtherPage = ref(false)

const returnFromOtherPageFn = () => {
  console.log('页面显示')

  // 判断是否是从其他页面返回
  if (isReturnFromOtherPage.value) {
    console.log('检测到从其他页面返回')
    // 执行返回后的逻辑
    handlePageReturn()
    // 重置状态
    isReturnFromOtherPage.value = false
  }
}

useDidHide(() => {
  console.log('页面隐藏')
  // 页面隐藏时标记可能返回
  isReturnFromOtherPage.value = true
})

const handlePageReturn = () => {
  try {
    // 处理返回后的业务逻辑
    console.log('执行返回后的数据刷新等操作')
    // 例如：刷新数据、更新状态等
    trackEvent('clk_page_business_card_homepage_click_on_personal_return', '返回首页', {
      page_name: 'page_business_card_homepage',
      employee_id: baseInfoHrUserId.value,
      sales_id: baseInfoHrUserId.value,
    })
  } catch (error) {
    console.log('返回的埋点上报: error', error)
  }
}
</script>

<style lang="scss">
@import './index.scss';
</style>
