<template>
  <div
    class="ka-customer-map-notepad"
    id="other_express_custom_notepad_perception_v1"
    :exposure-report="{
      eventCode: 'other_express_custom_notepad_perception_v1',
    }"
  >
    <!-- <ky-navbar :leftArrow="true" title="自定义编码记事本" v-if="isWxMiniApp"></ky-navbar> -->
    <!-- 缺省状态 -->
    <div class="empty-content" v-if="isEmpty">
      <kyEmpty :type="emptyType" />
    </div>

    <!-- 骨架屏 -->
    <!-- <div class="skeleton" v-if="isShowSkeleton">
      <Skeleton />
    </div> -->

    <!-- 记事本列表 -->
    <div class="list-content" v-if="list?.length">
      <div v-for="(item, index) in list" :key="index">
        <NotepadItem :info="item" @edit="edit" :index="index" @select="select" @reload="reload" />
      </div>
    </div>

    <!-- 底部按钮 -->
    <div class="ka-customer-map-notepad_footer" v-if="!isShowSkeleton">
      <KyButton text="新增" @click="onClick" />
    </div>
  </div>
  <BottomPopup @reload="reload" v-if="visible" v-model:visible="visible" :info="editItem" @submit="confirm" />
</template>

<script setup lang="ts">
import { useOrderExposureReport } from '@order-public-sub-public/report/exposureReport'

import KyButton from '@order-global-package-order-sub/components/base/ky-button/index.vue'
// import Skeleton from './components/skeleton/index.vue'
import kyEmpty from '@order-public-sub-public/components/ui/ky-empty/index.vue'
import BottomPopup from './components/bottom-popup/index.vue'
import { notepadList } from '@order-public-sub-public/apis/notepad/index'
import { NotepadItemConfig } from '@order-public-sub-public/apis/notepad/type'
import NotepadItem from './components/notepad-item/index.vue'
import { ref } from 'vue'
import { EmptyTypeEnum } from '@order-public-sub-public/constants'
import { showToast } from '@order-global-package-order-sub/hooks/useShowToast'
import { useRoute, useRouter } from '@order-public-sub-public/vue-router/index'
// import { isWxMiniApp } from '@/public/utils'
import { useStore } from '@order-public-sub-public/store'
const piniaStore = useStore()

const route = useRoute()
const router = useRouter()
useOrderExposureReport(['other_express_custom_notepad_perception_v1'])

const isShowSkeleton = ref(true)
const isEmpty = ref(false)

const emptyType = EmptyTypeEnum.DATA
const visible = ref(false)
const editItem = ref<NotepadItemConfig>()
let list = ref<NotepadItemConfig[]>()
const kyField = ref('')
kyField.value = route.query?.kyField as string
const getNotepadList = async () => {
  let res = await notepadList()
  list.value = res.data
  if (!list.value || !list.value.length) {
    isEmpty.value = true
  } else {
    isEmpty.value = false
  }
  isShowSkeleton.value = false
}

const onClick = () => {
  if (list?.value && list.value.length >= 5) {
    showToast('最多添加5个模板')
    return
  }
  visible.value = true
  editItem.value = {}
}

const reload = () => {
  getNotepadList()
  editItem.value = {}
}

const edit = (data: NotepadItemConfig) => {
  editItem.value = { ...data }
  visible.value = true
}

const select = (data: NotepadItemConfig) => {
  if (kyField.value) {
    piniaStore.extend.updateKaCustomerById({
      data: {
        kyField: kyField.value || '',
        customerFieldValue: data.content || '',
      },
    })
    router.back()
  }
}

const confirm = () => {
  console.log(123)
}

getNotepadList()
</script>

<style lang="scss">
@import '@order-global-package-order-sub/styles/index.scss';
@import './index.scss';
</style>
