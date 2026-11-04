<template>
  <!-- 未登录异常状态展示 -->
  <div class="dialog_root_clear_addr">
    <KyEmpty v-if="!isTokenAlive" :type="EmptyTypeEnum.CUSTOM" :custom-config="customConfig">
      <KyButton @click="login" size="small" class="login-btn" text="登录"></KyButton>
    </KyEmpty>
    <div class="clear-addr-box" v-else>
      <ky-navbar :leftArrow="true" title="地址详情" v-if="isWxMiniApp"></ky-navbar>
      <Empty
        v-if="!listLength && !addrListInfo.firstLoad"
        :errorText="addrListInfo.errorText || '暂无地址信息'"
        @onReLoad="onReLoad"
      />
      <div class="addr-detail-list-box" v-else>
        <ListRefreshLoad
          v-if="listLength > 0"
          :refreshing="addrListInfo.refreshing"
          :loading="addrListInfo.loading"
          :finished="addrListInfo.finished"
          :finishedText="finishedText"
          :offset="120"
          @onLoad="onLoad"
          @refresh="onRefresh"
        >
          <div class="addr-detail-list">
            <div class="top-tip">
              以下是超过{{ clearAddrInfo.cleanAddressType }}天未使用的地址，如您不想删除可取消选中：
            </div>
            <div
              v-for="item in addrListInfo.list"
              :key="item.id"
              class="addr-detail-card"
              @click="toSetNotDelete(item.id)"
            >
              <div class="select-box">
                <SvgIcon class="icon" name="no-check-icon" v-if="getIconName(item) === 'no-check-icon'" />
                <SvgIcon class="icon" name="check-icon" v-if="getIconName(item) === 'check-icon'" />
              </div>
              <div class="detail-info">
                <div class="person-mobile">
                  <text class="person">{{ item.contact }}</text>
                  <text class="mobile">{{ item.contactPhone }}</text>
                </div>
                <div>{{ item.telephone }}</div>
                <div class="companyName">{{ item.company }}</div>
                <div class="address">
                  <text class="item-part">{{ item.province || '' }}</text>
                  <text class="item-part">{{ item.city || '' }}</text>
                  <text class="item-part">{{ item.area || '' }}</text>
                  <text class="item-part">{{ item.address || '' }}</text>
                </div>
              </div>
            </div>
          </div>
        </ListRefreshLoad>
      </div>
      <div class="addr-footer-bottom">
        <div :class="['clear-addr-btn', clearAddrNum === 0 && 'clear-addr-btn-disabled']" @click="toClearAddr">
          一键清理<span v-if="clearAddrNum > 0">（{{ clearAddrNum }}）</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, computed, onMounted, ref, h } from 'vue'
import ListRefreshLoad from '@order-public-sub-public/components/ui/list-refresh-load/index.vue'
import Empty from '../components/empty/index.vue'
import SvgIcon from '@order-public-sub-public/components/ui/svg-icon/index.vue'
import KyButton from '@order-public-sub-public/components/base/ky-button/index.vue'
import KyEmpty from '@order-public-sub-public/components/ui/ky-empty/index.vue'

import { closeToast, showLoadingToast, showToast } from '@order-public-sub-public/hooks/useShowToast'
import { ClearAddrPagedQueryAddressRow } from '@order-public-sub-public/apis/address/types'
import { ClearAddrListReactiveType, RequestSource, CleanAddressTypeMap, cleanAddrType, MaxClearAddrNum } from '../types'
import { getClearAddressBookList, cleanAddressConfirm, getCleanResult } from '@order-public-sub-public/apis/address'

import { Address } from '@order-public-sub-public/constants/address'
import { EmptyTypeEnum } from '@order-public-sub-public/constants'
import { showKyDialog } from '@order-public-sub-public/validate/effect/effectDialog'
import { clickOneCleanAddrDetailReport, clickOneCleanDoubleConfReport, clickOneCleanRequestReport } from '../report'
import { EMPTY_CONFIGS } from '@order-public-sub-public/components/ui/ky-empty/config'
import { $native } from '@order-public-sub-public/utils'

import { useRoute, useRouter } from '@order-public-sub-public/vue-router/index'
import { reqPollingFunction } from '@order-public-sub-public/utils/index'
import { sleep } from '@order-public-sub-public/utils/sleep'
import { useStore } from '@order-public-sub-public/store'
import { routerBackIsHidePop } from '@public/hooks/order'
import { stopPullDownRefresh, useUnload } from '@tarojs/taro'
import { isWxMiniApp } from '@/public/utils'
const piniaStore = useStore()

const route = useRoute()
const router = useRouter()

const addrListInfo = reactive<ClearAddrListReactiveType>({
  refreshing: false,
  loading: false,
  finished: false,
  list: [],
  page: 0,
  pageSize: 20,
  pageTotal: 0,
  rowTotal: 0,
  errorText: '', // 接口异常
  firstLoad: true,
})

const backTag = ref(false)

const clearAddrInfo = ref<{
  cleanAddressType: string
  addressType: string
  addressShowType: string
}>({
  cleanAddressType: '',
  addressType: '',
  addressShowType: '',
})

let listLength = computed(() => addrListInfo.list.length)

// const notDeleteIdList = ref<Array<string>>([])
const notDeleteIdMap = ref<{
  [key: string]: boolean
}>({})

// 没有更多文案
const finishedText = computed(() => (listLength.value > 8 ? '没有更多了' : ''))

const handleCantcat = (str: string) => {
  return str?.length > 10 ? str?.slice(0, 10) + '...' : str
}

const onLoad = async (isRefresh: boolean) => {
  addrListInfo.page += 1
  addrListInfo.loading = !addrListInfo.refreshing && !isRefresh
  try {
    let { cleanAddressType, addressType, addressShowType } = clearAddrInfo.value
    let params = {
      cleanAddressType: CleanAddressTypeMap[cleanAddressType as cleanAddrType],
      addressType,
      addressShowType,
      page: addrListInfo.page,
      pageSize: addrListInfo.pageSize,
      requestSource: RequestSource.移动端, //40客户端，30移动端，
    }
    if (addrListInfo.firstLoad) {
      showLoadingToast({
        message: '加载中',
        duration: 0,
        forbidClick: true,
      })
    }

    const { data } = await getClearAddressBookList(params)
    if (addrListInfo.refreshing) {
      addrListInfo.list = []
      addrListInfo.refreshing = false
    }
    const tempList =
      data?.rows?.map((v) => {
        return {
          ...v,
          contact: handleCantcat(v.contact),
        }
      }) ?? []
    addrListInfo.list = addrListInfo.page === 1 ? tempList : [...addrListInfo.list, ...tempList]
    addrListInfo.rowTotal = data.rowTotal
    addrListInfo.refreshing = false
    addrListInfo.pageTotal = data?.pageTotal
    addrListInfo.finished = addrListInfo.page >= addrListInfo.pageTotal
  } catch (error) {
    addrListInfo.page -= 1
    addrListInfo.refreshing = false
    addrListInfo.finished = true
    console.log('error', 'error======', error)
    if ((error as any).code === 'ERR_NETWORK') {
      addrListInfo.errorText = '当前无网络，请检查后重试'
    } else {
      addrListInfo.errorText = (error as any).message || (error as any).msg
    }
  } finally {
    if (addrListInfo.firstLoad) {
      closeToast()
    }
    addrListInfo.firstLoad = false
    addrListInfo.loading = false
    stopPullDownRefresh()
  }
}

const onRefresh = () => {
  addrListInfo.page = 0
  addrListInfo.refreshing = true
  addrListInfo.loading = true
  return onLoad(false)
}

const onReLoad = () => {
  onRefresh()
}

// 去添加不用删除的id
const toSetNotDelete = (id: string) => {
  if (notDeleteIdMap.value[id]) {
    delete notDeleteIdMap.value[id]
    clickOneCleanAddrDetailReport('选中运单', addressTypeName.value)
  } else {
    notDeleteIdMap.value[id] = true
    clickOneCleanAddrDetailReport('取消选中运单', addressTypeName.value)
  }
}

// 获取选择图标的name
const getIconName = (item: ClearAddrPagedQueryAddressRow) => {
  return notDeleteIdMap.value[item.id] ? 'no-check-icon' : 'check-icon' // 没选
}

// 轮询
const pollingCheck = (taskNo: string) => {
  let timer: any = null
  // 轮询请求接口
  let stop = reqPollingFunction(
    async () => getCleanResult({ taskNo }),
    (res) => {
      let { data } = res ?? {}
      // 如果加载完成了
      if (data) {
        ;(async () => {
          closeToast()
          clearTimeout(timer)
          showToast('清理成功')
          await sleep(800)
          routerBackIsHidePop.value = true
          backTag.value = true
          router.back()
        })()
      }
      return !data
    },
    200,
  )

  // 等待20秒，20还没有请求完自动关闭弹窗
  timer = setTimeout(async () => {
    stop()
    closeToast()
    showToast('清理成功')
    await sleep(500)
    routerBackIsHidePop.value = true
    backTag.value = true
    router.back()
  }, 20000)

  return () => {
    closeToast()
    clearTimeout(timer)
    stop()
  }
}

const toClearAddr = async () => {
  clickOneCleanAddrDetailReport('一键清理', addressTypeName.value)
  if (clearAddrNum.value === 0) return
  const ids = Object.keys(notDeleteIdMap.value)
  let { cleanAddressType, addressType, addressShowType } = clearAddrInfo.value
  let params = {
    cleanAddressType: CleanAddressTypeMap[cleanAddressType as cleanAddrType],
    addressType,
    addressShowType,
    requestSource: RequestSource.移动端, //40客户端，30移动端，
    ids,
  }
  try {
    let message =
      addrListInfo.rowTotal > MaxClearAddrNum
        ? () =>
            h('div', [
              h('div', `您确定要清理超过${cleanAddressType}天未使用的地址？`),
              h('div', { style: { color: '#686B75' } }, `（一次最多可删除${MaxClearAddrNum}条）`),
            ])
        : `您确定要清理超过${cleanAddressType}天未使用的地址？`
    const showKyDialogParams = {
      message,
      title: '温馨提示',
      showCancelButton: true,
      showConfirmButton: true,
      cancelButtonText: '取消',
      confirmButtonText: '确定清理',
      zIndex: 1000,
    }
    await showKyDialog(showKyDialogParams)
    clickOneCleanDoubleConfReport('确认清理', addressTypeName.value)
    showLoadingToast({
      title: '清理中，请等待',
      duration: 0,
    })
    let taskNo = ''
    try {
      let { data } = await cleanAddressConfirm(params)
      taskNo = data.taskNo
      clickOneCleanRequestReport(addressTypeName.value, '成功')
    } catch (error) {
      clickOneCleanRequestReport(addressTypeName.value, '失败')
    }
    if (taskNo) {
      // 拿到taskId后需要轮询判断是否全部删除完成1
      pollingCheck(taskNo)
    }
  } catch (error) {
    // 如果点击的是取消 上报埋点
    if (error === 'cancel') {
      clickOneCleanDoubleConfReport('取消', addressTypeName.value)
    }
  }
}

const clearAddrNum = computed(() => {
  return addrListInfo.rowTotal - Object.keys(notDeleteIdMap.value).length
})

onMounted(() => {
  let { cleanAddressType, addressType, addressShowType } = route.query
  clearAddrInfo.value = {
    cleanAddressType: cleanAddressType as string,
    addressType: addressType as string,
    addressShowType: addressShowType as string,
  }
  onLoad(true)
})

const addressTypeName = computed(() => {
  let { addressType } = clearAddrInfo.value
  let tempMap: Record<string, any> = {
    [Address.SENDER_ADDRESS_TYPE]: '寄件地址簿',
    [Address.RECEIVE_ADDRESS_TYPE]: '收件地址簿',
  }
  return tempMap[addressType]
})

const customConfig = {
  image: EMPTY_CONFIGS.network.image,
  description: '用户信息已失效，请重新登录',
}

const isTokenAlive = computed(() => piniaStore.root.getIsTokenAlive)

/**
 * @description 登录
 */
const login = () => {
  $native?.login().then(() => {
    piniaStore.root.setTokenIsAlive(true)
  })
}
useUnload(() => {
  if (!backTag.value) {
    routerBackIsHidePop.value = false
  }
})
</script>

<style lang="scss">
@import '@order-global-package-order-sub/styles/index.scss';
@import './index.scss';
</style>
