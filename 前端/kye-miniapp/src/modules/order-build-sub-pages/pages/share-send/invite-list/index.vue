<template>
  <div class="invite-add-list" v-show="!isFirstLoading">
    <ListRefreshLoad
      :refreshing="refreshing"
      :loading="kyLoading"
      :finished="finished"
      :finishedText="finishedText"
      :showScrollbar="false"
      :isNeedRefresh="true"
      :enhanced="true"
      :offset="20"
      @onLoad="onLoad"
      @refresh="onRefresh"
      class="invite-refresh-list"
      v-if="inviteList.length"
    >
      <template v-for="(inviteItem, inviteIndex) of inviteList" :key="inviteItem.inviteCode">
        <InviteCard
          :inviteItem="inviteItem"
          @toChagneInviteStatus="(inviteInfo) => toChagneInviteStatus(inviteInfo, inviteIndex)"
          @setShareInvitInfo="() => setShareInvitInfo(inviteItem)"
        >
        </InviteCard>
      </template>
    </ListRefreshLoad>
    <div v-else class="invite-empty-box">
      <KyEmpty :type="EmptyTypeEnum.CUSTOM" :customConfig="customConfig" v-if="customConfig?.type">
        <ky-button
          type="primary"
          text="重新加载"
          loading-text="重新加载"
          loadingType="plain"
          @click="toReload"
          class="reload-btn"
        ></ky-button>
      </KyEmpty>
      <KyEmpty :type="EmptyTypeEnum.INVITE" description="暂无数据" v-else />
    </div>
  </div>
  <div class="invite-loading-box" v-show="isFirstLoading">
    <img src="https://ic-img.ky-express.com/netc/20260206_41864_!!1770346650124_320_344.png" alt="" />
  </div>
</template>

<script setup lang="ts">
import ListRefreshLoad from '@order-public-sub-public/components/ui/list-refresh-load/index.vue'
import KyEmpty from '@order-public-sub-public/components/ui/ky-empty/index.vue'
import KyButton from '@order-public-sub-public/components/base/ky-button/index.vue'
import InviteCard from './components/inviteCard/index.vue'
import { invitateList } from '@order-public-sub-public/apis/share'
import { IInviteList } from '@order-public-sub-public/apis/share/types'
import { onMounted, ref } from 'vue'
import { EmptyTypeEnum } from '@order-public-sub-public/constants'
import { useShareAppMessage } from '@tarojs/taro'
import dayjs from 'dayjs'
// import { InviteStatusEnum } from './type'

const refreshing = ref(false)
const finished = ref(false)
const finishedText = ref('没有更多了')
const kyLoading = ref(false)

const page = ref(0)
const totalPage = ref(10)
const pageSize = ref(30)

const isFirstLoading = ref(true)

const inviteList = ref<IInviteList[]>([])

const curInvitInfo = ref<IInviteList>()

const customConfig = ref()

const setShareInvitInfo = (inviteItem: IInviteList) => {
  console.log(inviteItem, 'inviteItem')
  curInvitInfo.value = inviteItem
}

useShareAppMessage(() => {
  const { senderInfo, inviteCode } = curInvitInfo.value!
  return {
    title: (senderInfo?.person || '') + '邀请您填写收件地址',
    path: 'modules/order-build-sub-pages/pages/share-send/share/index?inviteCode=' + inviteCode,
    imageUrl: 'https://ic-img.ky-express.com/netc/20260120_99759_!!1768893768252_450_360.png',
  }
})

const onLoad = async (isRefresh: Boolean) => {
  console.log(isRefresh, 'isRefresh')
  const pageRef = page.value
  if (pageRef + 1 > totalPage.value) {
    finished.value = true
    return
  }
  page.value = page.value + 1
  kyLoading.value = !refreshing.value && !isRefresh
  try {
    const response = await invitateList({ page: page.value, pageSize: pageSize.value, inviteType: '10' })
    totalPage.value = response?.data?.pageTotal
    const isResetList = isRefresh || response?.data?.page === 1
    const tempList = response.data.rows?.map((v) => {
      return {
        ...v,
        timeOutEndTimeNum: dayjs().add(v.timeOutEndTime, 'millisecond').valueOf(),
      }
    })
    inviteList.value = isResetList ? tempList : [...inviteList.value, ...tempList]
    if (page.value === response?.data?.pageTotal) {
      finished.value = true
    }
  } catch (error) {
    if (isRefresh) {
      customConfig.value = {
        description: '网络异常，请重试',
        type: 'networkError',
        image: 'https://ic-img.ky-express.com/netc/20250711_97982_!!1752226537213_280_280.png',
      }
    }
    finished.value = true
    console.log(error)
  } finally {
    kyLoading.value = false
    isFirstLoading.value = false
  }
}

const resetOptions = () => {
  page.value = 0
  totalPage.value = 10
  finished.value = false
}

const onRefresh = async () => {
  console.log('onRefresh')
  refreshing.value = true
  resetOptions()
  try {
    await onLoad(true)
  } catch (error) {
    console.log(error)
  } finally {
    refreshing.value = false
  }
}

const toChagneInviteStatus = (inviteInfo, index) => {
  console.log(inviteInfo, 'inviteInfo', index)
  inviteList.value[index] = inviteInfo
}

onMounted(() => {
  isFirstLoading.value = true
  onLoad(true)
})

const toReload = () => {
  isFirstLoading.value = true
  onLoad(true)
}
</script>

<style lang="scss">
page {
  background-color: #f1f2f7;
}
.invite-add-list {
  // padding: 16px 24px;
  .invite-refresh-list {
    height: calc(100vh - env(safe-area-inset-bottom));
    padding: 0;
  }
}

.invite-empty-box {
  display: flex;
  align-items: center;
  height: 100vh;
  justify-content: center;
  .ky-empty {
    transform: translateY(-50%);
  }
}

.invite-loading-box {
  background: #f1f2f7;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  img {
    width: 160px;
    height: 172px;
    transform: translateY(-50%);
  }
}

.reload-btn {
  width: 144px;
  height: 56px;
  font-size: 24px;
  padding: 0;
  font-weight: 500;
  border-radius: 8px;
}
</style>
