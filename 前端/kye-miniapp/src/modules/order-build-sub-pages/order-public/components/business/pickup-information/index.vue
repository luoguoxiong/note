<template>
  <div v-if="visible" :visible="visible" :class="[styles['pickup-information-content']]">
    <KyCell
      v-if="visible"
      title="取货信息"
      :required="required || needRequired"
      :no-bg-disabled="disabled"
      data-validate="pickupInformation.pickupInformation"
      :value="dispatchName"
      @click="openDispatch"
      placeholder="添加取货联系人信息、取货资料"
      :visible="visible"
      class="pickup_information"
      :large-value="true"
    >
      <template #extra>
        <!-- 增加入仓提示 -->
        <div :class="[styles['cell_tip']]" v-if="pickupInformationDimension.blockTips">
          {{ pickupInformationDimension.blockTips }}
          <KyReport
            eventCode="exp_express_entrust_desc_v1"
            :otherParams="{ content: pickupInformationDimension.blockTips }"
          ></KyReport>
        </div>
        <KyReport
          event-code="exp_express_entrust_desc_v1"
          v-if="pickupInformationDimension.blockTips"
          :otherParams="{ content: pickupInformationDimension.blockTips }"
        ></KyReport>
      </template>
    </KyCell>
    <KyReport event-code="exp_express_entrust_v1"></KyReport>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { useRouter } from '@order-public-sub-public/vue-router/index'
import KyCell from '@order-public-sub-public/components/base/ky-cell/index.vue'
import { ModuleType } from '@order-public-sub-public/constants'
import { OrderPickupInfo, PickupInformationDimension } from '@order-public-sub-public/types'
import { PickupProps } from '@order-public-sub-public/components/business/pickup-information/types/types'
import { useStore } from '@order-public-sub-public/store'
import { clk_express_entrust_v1 } from './report'
import KyReport from '@order-public-sub-public/components/base/ky-report/index.vue'
import { getMessageToDriverText } from '@order-public-sub-public/components/business/message-to-driver/utils'
import styles from './index.module.scss'

const piniaStore = useStore()
const router = useRouter()

const props = defineProps<PickupProps>()

//外显值
const dispatchName = computed(() => {
  let { uploadNum, cargoImgUploadNum } = piniaStore.schema.moduleDimensionData(ModuleType['取货资料']) || {}
  const {
    person,
    mobile,
    telephone,
    extension,
    uploadNum: _uploadNum,
    cargoImgUploadNum: _cargoImgUploadNum,
  } = piniaStore.order.moduleFormData(ModuleType['取货资料']) || {}
  let valueList: string[] = []
  const num = uploadNum + cargoImgUploadNum || _uploadNum + cargoImgUploadNum
  let telephoneNew = telephone
  if (extension && telephone) {
    telephoneNew = `${telephoneNew}-${extension}`
  }
  if (num) {
    // 如果者三个都没有填写
    const str = `已上传${num}份文件`
    valueList.push(str)
  }
  valueList = valueList.concat([person, mobile, telephoneNew]).filter((i) => i)
  // 给取货司机捎句话已填写时，以“/捎句话段”追加到现有摘要末尾（无留言时输出与现状一致）
  valueList = valueList.concat([getMessageToDriverText()]).filter((i) => i)
  if (valueList.length === 0) {
    return ''
  }
  return valueList.join('/')
})

//过程中组件数据
const pickupInformationDimension = computed(() => {
  return piniaStore.schema.moduleDimensionData(ModuleType['取货资料']) || {}
})

//跳转派货资料
const openDispatch = () => {
  clk_express_entrust_v1()
  router.push({
    path: '/pickup-information',
  })
}

//只要有一个表单项必填，就显示必填
const needRequired = computed(() => {
  const configList = props.config.fieldsConfig
  return configList?.some((item) => {
    return item.required
  })
})
</script>

<style lang="scss">
@import '@order-global-package-order-sub/styles/index.scss';
</style>
