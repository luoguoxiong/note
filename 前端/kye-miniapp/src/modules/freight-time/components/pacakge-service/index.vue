<template>
  <div class="package-service-wrap">
    <ky-cell placeholder="请选择" @click="() => handlePopupVisible(true)" :large-value="true" :is-link="true">
      <template #title>
        <div class="font-level3 flex items-center">包装服务</div>
      </template>
      <template #value v-if="packageCellValue">
        <div class="pa-sev-unf-value">
          {{ packageCellValue }}
        </div>
      </template>
    </ky-cell>
    <BottomPopup
      v-model:show="unfoldPackageVisible"
      class="add-ser-bo-unf-package-popup"
      title="包装服务"
      show-tips
      tip-icon="desc"
      @on-click-tips="() => handleClickTips('waterproof-packing')"
      @onClose="() => handlePopupVisible(false)"
      @open="onOpen"
      @onConfirm="onConfirm"
      tipText="(如已包装货物，无需选择)"
    >
      <div class="add-ser-bo-unf-package">
        <div>
          <PackageServiceBus
            :hasFrightFeeAuth="hasFrightFeeAuth"
            :source="'freightTime'"
            :visible="true"
            :moduleStyle="'unfold'"
            class="freight-time-package-service"
            :isShowTitle="false"
            :showSizeTips="false"
            :packageServiceList="packageServiceList"
            :packageServiceFee="packageServiceFeeValue"
            :otherWoodList="[]"
            :woodenFrame="woodenFrame"
            :extraTip="extraTip"
            @selectNormal="handlePackageService"
          ></PackageServiceBus>
        </div>
      </div>
    </BottomPopup>
  </div>
</template>

<script setup lang="ts">
import Taro from '@tarojs/taro'
import { ref } from 'vue'
import PackageServiceBus from '@order-global-package-freight-time/components/business/package-service-bus/index.vue'
import BottomPopup from '@order-global-package-freight-time/components/ui/bottom-popup-ui/index.vue'
import { woodenFrameInfoListType } from '@order-global-package-freight-time/types'
import { unfoldPackageVisible, setUnfoldPackageVisible, packageCellValue } from './useState'
import { useFreightTimeStore } from '@freight-time/store'
import { getAddedServiceFee } from '@freight-time/api/index'
import { reportOther } from '@freight-time/report'

const props = defineProps<{
  hasFrightFeeAuth?: boolean
}>()

const store = useFreightTimeStore()

const packageServiceList = ref<woodenFrameInfoListType[]>([
  {
    desc: '按体积收费',
    h5Name: '打木架',
    img: 'https://ic-img.ky-express.com/netc/20250619_56839_!!1750305292257_404_404.png',
    name: '打木架',
    value: '20',
  },
  {
    desc: '按体积收费',
    h5Name: '打木箱',
    img: 'https://ic-img.ky-express.com/netc/20250619_38741_!!1750305296743_404_404.png',
    name: '打木箱',
    value: '30',
  },
  {
    desc: '按个收费',
    h5Name: '打卡板',
    img: 'https://ic-img.ky-express.com/netc/20250619_973_!!1750305299976_404_404.png',
    name: '打卡板',
    value: '10',
  },
  {
    desc: '按体积收费',
    h5Name: '打木箱(国际)',
    img: 'https://ic-img.ky-express.com/netc/20250619_16055_!!1750305303259_376_376.png',
    name: '打木箱(国际)',
    value: '100',
  },
  {
    desc: '按个收费',
    h5Name: '打木托(国际)',
    img: 'https://ic-img.ky-express.com/netc/20250619_3926_!!1750305307673_400_400.png',
    name: '打木托(国际)',
    value: '110',
  },
])

const handlePopupVisible = (visible: boolean) => {
  setUnfoldPackageVisible(visible)
}

const woodenFrame = ref('')

const extraTip = ref('')

const packageServiceFeeValue = ref([])

const handleClickTips = (type: string) => {
  Taro.navigateTo({
    url: `/modules/order-build-sub-pages/pages/order-service-introduction/index?type=${type}`,
  })
}

const handlePackageService = (item: woodenFrameInfoListType) => {
  const value = item.value as string
  if (woodenFrame.value + '' === value) {
    // 反选
    woodenFrame.value = ''
  } else {
    woodenFrame.value = value
  }
}

const onOpen = async () => {
  woodenFrame.value = store.getWoodenFrame || ''

  const orderInfo = store.getOrderInfo
  const {
    data: { packageServiceFee },
  } = await getAddedServiceFee({
    orderInfo,
    waybillSource: '10',
  })

  extraTip.value = packageServiceFee?.feeTips || ''
  packageServiceFeeValue.value = packageServiceFee?.woodenFrameFeeList || []
}

const onConfirm = () => {
  if (!woodenFrame.value) {
    // 取消选择：清空已选的包装服务
    store.setWoodenFrame('')
    packageCellValue.value = ''
    setUnfoldPackageVisible(false)
    return
  }

  store.setWoodenFrame(woodenFrame.value)

  const current = packageServiceList.value.find((item) => item.value === woodenFrame.value)
  packageCellValue.value = current?.name || ''

  setUnfoldPackageVisible(false)

  reportOther('other_express_addedservice_woodenframe', {
    packaging_services: woodenFrame.value,
  })
}
</script>

<style lang="scss">
.package-service-wrap {
  .ky-cell {
    border-bottom-left-radius: 24rpx;
    border-bottom-right-radius: 24rpx;
  }
}
</style>
