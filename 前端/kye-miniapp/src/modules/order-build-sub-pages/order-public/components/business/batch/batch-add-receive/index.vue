<template>
  <div
    class="batch-add-receive"
    type="BatchAddReceive"
    :visible="true"
    v-if="batchWaybillInfoList?.length < BATCH_MAX_LENGTH"
    v-hotZone="{
      moduleType: ModuleType['批量新增收件人'],
      visible: hotZoneVisible,
      validateCallback: validateCallback,
    }"
  >
    <div class="batch-add-receive-btn flex items-center font-level3 color-primary">
      <div @click="addRecipient('add')" class="btn-item btn-item-add" data-validate="batchAddReceive">
        <LazyRender>
          <SvgIcon
            :name="hasError ? 'batch-add-receive-error' : 'batch-add-receive'"
            class="batch-add-receive-icon"
          ></SvgIcon>
        </LazyRender>
        新增收件人({{ batchWaybillInfoList?.length }}/{{ BATCH_MAX_LENGTH }})
      </div>
      <!-- 地址组合维护 不展示批量智能识别 -->
      <div class="btn-item recognize" @click="addRecipient('ocr')" v-if="!total">
        <LazyRender>
          <SvgIcon name="batch-ocr-add" class="batch-add-receive-icon"></SvgIcon>
        </LazyRender>
        智能识别
      </div>
    </div>

    <!-- 指定地址弹窗 -->
    <SpecifyAddress
      key="batch-add-receive"
      ref="specifyAddressRef"
      :addressType="AddressType.RECEIVE"
      :addressVisibleType="addressVisibleType"
      :fieldsConfigType="addressProps.fieldsConfigType"
      :recommendByUserLocation="addressProps.recommendByUserLocation"
      :batchLoading="batchReceiveLoading"
      :batchSelect="true"
      @onSelect="onSelectSpecifyAddress"
      @onBatchSelect="onBatchReceiveConfirm"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref } from 'vue'

import { useRouter } from '@order-public-sub-public/vue-router/index'
import SvgIcon from '@order-public-sub-public/components/ui/svg-icon/index.vue'
import { BATCH_MAX_LENGTH, ModuleType, Address, AddressType } from '@order-public-sub-public/constants'
import { useHotZone } from '@order-public-sub-public/hooks/useHotZone'
import useInitConfig from '@order-public-sub-public/hooks/address/receive/useInitConfig'
import { useSpecifyAddress } from '@order-public-sub-public/hooks/address/receive/useFields'
import SpecifyAddress from '@order-public-sub-public/components/business/specify-address/index.vue'
import LazyRender from '@order-public-sub-public/components/ui/lazy-render/index.vue'
import { Module, OrderInfo } from '@order-public-sub-public/types'
import { ConfigAddress } from '@order-public-sub-public/apis/address/types'
import { checkSenderAddressRestrict } from '../batch-waybill-list/hooks/utils'
import { addReceive } from './hooks/utils'
import { batchSelectList } from '../../address-book/page/hooks/useState'
import { useStore } from '@order-public-sub-public/store'
const piniaStore = useStore()

const { validateCallback, hotZoneVisible } = useHotZone(ModuleType['批量新增收件人'])

const router = useRouter()

const batchReceiveLoading = ref(false)

const hasError = ref(false)

// 来源标识
const moduleStyle = { moduleStyle: Address.RECEIVE_PAGE }

// 初始化数据
const { addressProps, addressVisibleType } = useInitConfig(moduleStyle)

const { specifyAddressRef, onSelectSpecifyAddress, onClickSpecifyAddress } = useSpecifyAddress(moduleStyle)

const batchWaybillInfoList = computed(() => piniaStore.order.batchWaybillInfoList || [])

const total = computed(() => {
  let result: boolean | string = ''
  const receiveModuleConfig: any = piniaStore.schema.moduleConfigData(ModuleType['收方信息'], true)
  receiveModuleConfig?.config?.fieldsConfig?.forEach((item: any) => {
    if (item.name === 'address') {
      result = item.total
    }
  })
  return result
})

const add = () => {
  batchSelectList.value = []
  if (total.value) {
    onClickSpecifyAddress()
  } else {
    router.push({
      name: 'address-book',
      query: {
        action: 'batch-add',
        addressType: 20,
      },
    })
  }
}

const ocrAdd = () => {
  router.push({
    path: '/address-batch-ocr',
  })
}

const addRecipient = (type: string) => {
  // 如果寄件地址命中取派管控，提醒且不能新增
  if (checkSenderAddressRestrict()) {
    return
  }
  if (type === 'ocr') {
    ocrAdd()
  } else {
    add()
  }
}

const onBatchReceiveConfirm = async (list: ConfigAddress[]) => {
  if (list && list.length > 0) {
    const selectedList = list
      ?.filter((item) => item.isSelectItem)
      ?.map((item) => ({
        receive: { ...item, person: item.userName, locationName: item.addrName, locationId: item.addressId },
      })) as unknown as OrderInfo[]

    try {
      batchReceiveLoading.value = true
      await addReceive(selectedList)
    } catch (error) {
      console.error(error)
    } finally {
      batchReceiveLoading.value = false
      specifyAddressRef.value?.close()
    }
  } else {
    specifyAddressRef.value?.close()
  }
}

let observer: MutationObserver

onMounted(() => {
  const divElement = document.querySelector('.btn-item-add')

  observer = new MutationObserver(() => {
    try {
      hasError.value = divElement?.classList?.contains('validate-error') || false
    } catch (error) {
      hasError.value = false
    }
  })
  nextTick(() => {
    if (!divElement) return
    observer.observe(divElement as Node, { attributes: true, attributeFilter: ['class'] })
  })
})

onUnmounted(() => {
  observer.disconnect()
})
</script>

<style lang="scss" scoped>
@import '@order-global-package-order-sub/styles/index.scss';
@import './index.scss';
</style>

<style lang="scss">
@import '@order-global-package-order-sub/styles/index.scss';
.batch-add-receive.validate-error {
  .batch-add-receive-btn,
  .batch-add-receive-icon {
    color: #ff706d;
  }
}
</style>
