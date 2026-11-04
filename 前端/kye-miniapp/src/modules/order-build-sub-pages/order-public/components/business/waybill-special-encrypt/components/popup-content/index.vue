<template>
  <div class="waybill-special-encrypt-popup">
    <NoticeBar leftIcon :scrollable="false">开启后仅对收方客户生效</NoticeBar>
    <div class="encrypt-popup-block">
      <div class="encrypt-popup-block-setting">
        <div class="encrypt-popup-block-setting-title font-level3 flex space-between" @click="handleFieldCellUnfold">
          <div class="encrypt-popup-block-setting-title-content">
            <div class="text">寄件信息加密设置</div>
            <div class="rule-title" @click="handleEncryptDesc">
              运单加密规则
              <SvgIcon name="tip-desc" class="icon" />
            </div>
          </div>
        </div>
        <div class="encrypt-popup-block-setting-content">
          <template v-for="(item, index) in encryptSettingResponse?.fields" :key="item.key">
            <KyCell
              :class="index + 1 === encryptSettingResponse?.fields.length ? 'lastencrypt-popup-content-cell' : ''"
              :title="item.fieldName"
              :needRightIcon="true"
              placeholder="请选择"
              :value="getFieldCellValue(item).encryptTypeName"
              @click="() => handleFieldCell(item)"
            >
              <template #value v-if="Number(getFieldCellValue(item).encryptType) > 0">
                <span class="color-primary" :style="{ fontWeight: 600 }">{{
                  getFieldCellValue(item).encryptTypeName
                }}</span>
              </template>
            </KyCell>
          </template>
        </div>
      </div>
      <div class="encrypt-popup-block-type-checkbox font-level4">
        <KyRadio
          iconSize="14px"
          v-model="syncEncryptSetting"
          @click="handleRadio"
          :radio-props="[{ name: true, text: '后续下单使用本次加密规则' }]"
        >
        </KyRadio>
      </div>
      <div class="encrypt-popup-block-desc font-level4">
        <div>本次设置同步更新至【偏好设置 -运单加密】</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import SvgIcon from '@order-public-sub-public/components/ui/svg-icon/index.vue'
import KyCell from '@order-public-sub-public/components/base/ky-cell/index.vue'
import KyRadio from '@order-public-sub-public/components/base/ky-radio/index.vue'
import { useWaybillSpecialEncryptRules, useSyncEncryptSetting } from '../../hooks/useState'
import { encryptTypeMap } from '../../config/index'
import { EncryptSettingResponse } from '@order-public-sub-public/apis/waybill-special-encrypt/types'
import { WaybillSpecialEncryptRule } from '@order-public-sub-public/types'
import { useRouter } from '@order-public-sub-public/vue-router/index'
import { reportPerception } from '@order-public-sub-public/reportUmp/util/index'
import NoticeBar from '@order-public-sub-public/components/base/ky-noticebar/noticebar.vue'

defineProps<{ encryptSettingResponse: EncryptSettingResponse | undefined }>()

const { waybillSpecialEncryptRules } = useWaybillSpecialEncryptRules()

const fieldCellUnfold = ref(true)

const emit = defineEmits(['fieldCellClick'])

const router = useRouter()

const { syncEncryptSetting, setSyncEncryptSetting } = useSyncEncryptSetting()

const handleFieldCell = (type: WaybillSpecialEncryptRule) => {
  emit('fieldCellClick', { ...type, encryptType: getFieldCellValue(type).encryptType })
}

const handleFieldCellUnfold = () => {
  fieldCellUnfold.value = !fieldCellUnfold.value
}

const getFieldCellValue = (type: WaybillSpecialEncryptRule) => {
  let result: Record<string, string | number> = { encryptType: -1, encryptTypeName: '' }
  waybillSpecialEncryptRules.value?.forEach((item) => {
    if (item.fieldColumn === type.fieldColumn) {
      result = { encryptType: item.encryptType as number, encryptTypeName: encryptTypeMap[item.encryptType as number] }
    }
  })

  return result
}

const handleRadio = async () => {
  console.log('handleRadio', syncEncryptSetting.value)
  setSyncEncryptSetting(!syncEncryptSetting.value)
}

const handleEncryptDesc = () => {
  router.push({
    path: '/order-encrypt-desc',
  })
}
onMounted(() => {
  console.log('挂宅')
  reportPerception('other_express_waybillencryption_popup_perception_v1')
})
</script>

<style lang="scss">
@import '@order-global-package-order-sub/styles/index.scss';
@import './index.scss';
</style>
