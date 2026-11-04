<template>
  <div class="waybill-special-encrypt row-item" :type="type" :visible="encryptCisible" v-if="encryptCisible">
    <KyCell
      title="运单加密"
      :placeholder="!hasSetData ? '去设置' : ''"
      :isLink="!hasSetData ? true : false"
      :no-bg-disabled="disabled"
      :value="encryptTypeTips"
      class="waybill-encrypt-kycell"
      data-validate="waybillSpecialEncrypt.waybillSpecialEncryptType"
      v-click-report="clk_waybillencryption_setup_tips_v1(waybillSpecialEncryptType, waybillNumber)"
      @click="() => handlePopupContentVisible(true)"
    >
      <template #title>
        <div class="flex">
          <div>运单加密</div>
          <div
            class="flex items-center"
            :style="{ marginLeft: '8px' }"
            @click.stop="() => handlePopupContentVisible(true)"
            v-click-report="clk_waybillencryption_check_tips_v1(waybillNumber)"
            v-if="hasSetData"
          >
            <SvgIcon name="set-purple-line" />
            <span class="font-level4" :style="{ marginTop: '1px', paddingLeft: '3px', color: '#8365f6' }">设置</span>
          </div>
        </div>
      </template>
      <template #value v-if="hasSetData">
        <div class="switch-box">
          <!-- 已设置 加密、半加密的项 -->
          <div class="encrypt-type-tips">
            {{ encryptTypeTips || ' ' }}
          </div>
          <KySwitch v-model="checked" @change="handleSwtichChange" @click.stop="handleSwitchClick" />
        </div>
      </template>
    </KyCell>
    <BottomPopup
      v-model:show="popupContentVisible"
      title="运单加密"
      :style="{ height: '92%', ...popupStyles }"
      class="encrypt-bottom-popup"
      :footerText="'保存'"
      @closed="closed"
      :loading="btnLoading"
      @onClose="() => handlePopupContentVisible(false)"
      @open="onPopupContentOpen"
      @onConfirm="handlePopupContentConfirm"
      :safeAreaInsetBottom="safeAreaBottom"
    >
      <div v-if="contentVisible">
        <PopupContent :encryptSettingResponse="encryptSettingResponse" @fieldCellClick="handlePopupContentField" />
      </div>
    </BottomPopup>
    <BottomPopup
      v-model:show="popupFieldVisible"
      :title="`设置${popupFieldValue?.fieldName}`"
      footerText="确定"
      :loading="btnLoading"
      :showFooter="false"
      @onClose="() => handlePopupFieldVisible(false)"
      :safeAreaInsetBottom="safeAreaBottom"
    >
      <PopupField :popupFieldValue="popupFieldValue" @onClickField="handlePopupClickField" />
    </BottomPopup>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import KyCell from '@order-public-sub-public/components/base/ky-cell/index.vue'
import KySwitch from '@order-public-sub-public/components/base/ky-switch/index.vue'
import BottomPopup from '@order-public-sub-public/components/ui/bottom-popup/index.vue'
import PopupContent from './components/popup-content/index.vue'
import PopupField from './components/popup-field/index.vue'
import { useKeyboardPopupStyles } from '@order-public-sub-public/hooks/useKeyboardPopupStyles'
import { useStore } from '@order-public-sub-public/store'
import { WaybillSpecialEncrypt, Module, WaybillSpecialEncryptRule, any } from '@order-public-sub-public/types'
import { ModuleType, OrderPageType } from '@order-public-sub-public/constants'
import { EncryptFieldType, WaybillSpecialEncryptEnum } from './types'
import {
  usePopupContentVisible,
  usePopupFieldVisible,
  useWaybillSpecialEncryptType,
  useWaybillSpecialEncryptRules,
  useSyncEncryptSetting,
  useIsEncryptEdit,
} from './hooks/useState'
import { cloneDeep, isNull } from 'lodash-es'
import { useUpdateStore } from './hooks/useModuleStore'
import { updateEncryptSetting } from '@order-public-sub-public/apis/waybill-special-encrypt/index'
import { EncryptSettingResponse } from '@order-public-sub-public/apis/waybill-special-encrypt/types'
import SvgIcon from '@order-public-sub-public/components/ui/svg-icon/index.vue'
import { showToast } from '@order-public-sub-public/hooks/useShowToast'
import { showKyDialog } from '@order-public-sub-public/validate/effect/effectDialog'
import {
  clk_waybillencryption_setup_tips_v1,
  clk_waybillencryption_check_tips_v1,
  clk_waybillencryption_switch_tips_v1,
  waybillEncryptPopupClosedReport,
} from './report/index'
import { getUserSettingInfoByKey } from '@order-public-sub-root-pages/order-single/hooks/useInit'
import useEffect from '@order-public-sub-public/validate'
import { EncryptFieldColumn } from './hooks/state'
import { isAliPayClient } from '@order-public-sub-public/utils/device'
const piniaStore = useStore()

defineProps<Module>()

const { popupContentVisible, setPopupContentVisible } = usePopupContentVisible()
const { popupFieldVisible, setPopupFieldVisible } = usePopupFieldVisible()
const { waybillSpecialEncryptType, setWaybillSpecialEncryptType } = useWaybillSpecialEncryptType()
const { waybillSpecialEncryptRules, setWaybillSpecialEncryptRules } = useWaybillSpecialEncryptRules()
const { syncEncryptSetting, setSyncEncryptSetting } = useSyncEncryptSetting()
const { isEncryptEdit, setIsEncryptEdit } = useIsEncryptEdit()

const popupFieldValue = ref<WaybillSpecialEncryptRule | null>(null)

const isUpdatePopupContent = ref(true)

const btnLoading = ref(false)

const encryptSettingResponse = ref<EncryptSettingResponse>()

const { popupStyles, safeAreaBottom } = useKeyboardPopupStyles()

const contentVisible = ref(false)

const dyamincData = computed(() => piniaStore.globalData.dynamicConfig('waybillSpecialEncrypt') || {})

const encryptCisible = computed(() => {
  return dyamincData.value?.visible
})
const defaultModuleFormData = computed(() => {
  return piniaStore.order.moduleFormData(ModuleType['运单加密'])
})
const waybillNumber = computed(() => piniaStore.order.waybillNumber)

// 只拼全加密、半加密， 没有则不显示
const encryptTypeTips = computed(() => {
  let fildsList = []
  if (defaultModuleFormData.value?.waybillSpecialEncryptRules?.length) {
    fildsList = defaultModuleFormData.value?.waybillSpecialEncryptRules
  } else {
    fildsList = encryptSettingResponse.value?.fields || []
  }
  let tips = ''
  fildsList.forEach((item) => {
    if (item.encryptType === EncryptFieldType.全加密 || item.encryptType === EncryptFieldType.半加密) {
      tips && (tips += '/')
      tips += `${EncryptFieldColumn[item.fieldColumn as keyof typeof EncryptFieldColumn]}`
    }
  })

  if (tips) {
    tips = `加密寄件${tips}`
  }
  return tips
})

const initStateData = () => {
  defaultModuleFormData.value?.waybillSpecialEncryptType &&
    setWaybillSpecialEncryptType(defaultModuleFormData.value?.waybillSpecialEncryptType)
  if (
    defaultModuleFormData.value?.waybillSpecialEncryptRules &&
    defaultModuleFormData.value?.waybillSpecialEncryptRules.length > 0
  ) {
    let encryptRules = cloneDeep(defaultModuleFormData.value?.waybillSpecialEncryptRules)
    let encryptRulesKeys = encryptRules?.map((item) => item.fieldColumn)

    const resultEncryptRules = encryptSettingResponse.value?.fields?.map((item) => {
      if (encryptRulesKeys.includes(item.fieldColumn)) {
        return encryptRules?.filter((subItem) => subItem.fieldColumn === item.fieldColumn)[0]
      } else {
        return item
      }
    })
    setWaybillSpecialEncryptRules(resultEncryptRules as WaybillSpecialEncryptRule[])
  } else {
    setWaybillSpecialEncryptRules(cloneDeep(encryptSettingResponse.value?.fields) as WaybillSpecialEncryptRule[])
  }
}

// 判断是否有值（运单 > 默认）
const hasSetData = computed(() => {
  const { fields } = encryptSettingResponse.value || { fields: [] }
  let encryptData = []
  if (defaultModuleFormData.value?.waybillSpecialEncryptRules?.length) {
    encryptData = defaultModuleFormData.value?.waybillSpecialEncryptRules
  } else {
    encryptData = fields || []
  }

  return encryptData ? !encryptData.every((item) => item.encryptType === EncryptFieldType.请选择) : true
})

const handlePopupContentVisible = (value: boolean) => {
  setPopupContentVisible(value)

  if (value) {
    contentVisible.value = true
  }

  // 关闭弹窗时需要重置所有状态
  if (!value) {
    setPopupContentVisible(false)

    isUpdatePopupContent.value = true

    popupFieldValue.value = null
    setSyncEncryptSetting(false)

    // 如果是编辑状态的话需求二次提示框
    if (isEncryptEdit.value) {
      showKyDialog({
        zIndex: 1000,
        title: '温馨提示',
        message: '您有更改信息，是否需要保存？',
        cancelButtonText: '不保存',
        showCancelButton: true,
        confirmButtonText: '保存',
      })
        .then(async () => {
          closeAndSaveData()
        })
        .catch((err) => {
          console.log(err)
        })
    }
  }
}

const onPopupContentOpen = () => {
  if (isUpdatePopupContent.value) {
    initStateData()
  }

  isUpdatePopupContent.value = false
}

let closed = () => {
  waybillEncryptPopupClosedReport()
}

const handlePopupContentConfirm = async () => {
  if (syncEncryptSetting.value) {
    btnLoading.value = true
    const params = waybillSpecialEncryptRules.value?.map((item) => {
      return { fieldColumn: item.fieldColumn, encryptType: item.encryptType }
    })
    await updateEncryptSetting({ fields: params, clientType: 20 })

    closeAndSaveData()
  } else {
    closeAndSaveData()
  }
}

const closeAndSaveData = () => {
  // 是否需要打开按钮
  const isNeedChecked = waybillSpecialEncryptRules.value?.filter((item) => item.encryptType !== -1) || []
  const waybillSpecialEncryptType =
    isNeedChecked?.length > 0 ? WaybillSpecialEncryptEnum.加密 : WaybillSpecialEncryptEnum.不加密

  useUpdateStore({
    waybillSpecialEncryptRules: waybillSpecialEncryptRules.value,
    waybillSpecialEncryptType,
  })

  setWaybillSpecialEncryptType(waybillSpecialEncryptType)
  btnLoading.value = false

  setPopupContentVisible(false)
  popupFieldValue.value = null
  setSyncEncryptSetting(false)
  setIsEncryptEdit(false)
  const { remoteCheck } = useEffect()
  remoteCheck('waybillSpecialEncrypt')
  showToast('设置成功')
}

const handlePopupContentField = (type: WaybillSpecialEncryptRule) => {
  popupFieldValue.value = type

  // setPopupContentVisible(false)
  setPopupFieldVisible(true)
}

const handlePopupFieldVisible = (value: boolean) => {
  setPopupFieldVisible(value)
  // 重新打开运单加密弹窗
  // setPopupContentVisible(true)
}

const handlePopupClickField = (value: EncryptFieldType) => {
  //反选
  if (popupFieldValue.value?.encryptType === value) {
    popupFieldValue.value = { ...popupFieldValue.value, encryptType: -1 } as WaybillSpecialEncryptRule
  } else {
    popupFieldValue.value = { ...popupFieldValue.value, encryptType: value } as WaybillSpecialEncryptRule
  }
  handlePopupFieldConfirm()
}

const handlePopupFieldConfirm = () => {
  let resultList: WaybillSpecialEncryptRule[] = []

  const keys = waybillSpecialEncryptRules.value?.map((item) => item.fieldColumn) || []

  if (keys?.includes(popupFieldValue.value?.fieldColumn as string)) {
    resultList = waybillSpecialEncryptRules.value?.map((item) => {
      if (item.fieldColumn === popupFieldValue.value?.fieldColumn) {
        return { ...item, encryptType: popupFieldValue.value?.encryptType }
      }
      return item
    })
  } else {
    resultList = [...waybillSpecialEncryptRules.value, popupFieldValue.value as WaybillSpecialEncryptRule]
  }
  setWaybillSpecialEncryptRules(resultList)
  // 编辑过
  setIsEncryptEdit(true)
  setPopupFieldVisible(false)
  setPopupContentVisible(true)
}

watch(
  () => piniaStore.globalData.initDataPromise,
  async (promise) => {
    if (!isNull(promise)) {
      await promise

      if (dyamincData.value?.visible) {
        const data = (await getUserSettingInfoByKey('encryptSettingInfo')) as EncryptSettingResponse
        encryptSettingResponse.value = cloneDeep(data || {})

        if (defaultModuleFormData.value?.waybillSpecialEncryptType) {
          if (defaultModuleFormData.value?.waybillSpecialEncryptType === WaybillSpecialEncryptEnum.加密) {
            setWaybillSpecialEncryptType(WaybillSpecialEncryptEnum.加密)
          } else {
            setWaybillSpecialEncryptType(WaybillSpecialEncryptEnum.不加密)
          }
        }
      }
      //第一次初始化，有默认配置的需要更新到store，bug445530
      initStateData()
    }
  },
  { immediate: true },
)

const checked = computed(() => {
  if (waybillSpecialEncryptType.value === WaybillSpecialEncryptEnum.加密) {
    return true
  }
  return false
})

const handleSwitchClick = (value: any) => {
  console.log(value)
}

const handleSwtichChange = (value: any) => {
  useUpdateStore({
    waybillSpecialEncryptType: value ? WaybillSpecialEncryptEnum.加密 : WaybillSpecialEncryptEnum.不加密,
  })
  setWaybillSpecialEncryptType(value ? WaybillSpecialEncryptEnum.加密 : WaybillSpecialEncryptEnum.不加密)

  // 是否自动开启弹窗
  // const isNeedChecked = waybillSpecialEncryptRules.value?.filter((item) => item.encryptType) || []
  // if (isNeedChecked?.length <= 0) {
  //   setPopupContentVisible(value)
  // }

  if (value) {
    useUpdateStore({
      waybillSpecialEncryptRules: waybillSpecialEncryptRules.value,
    })
    showToast('运单加密开启成功')
  } else {
    showToast('运单加密关闭成功')
  }
  const { remoteCheck } = useEffect()
  remoteCheck('waybillSpecialEncrypt')
  clk_waybillencryption_switch_tips_v1(value)
}

onMounted(() => {
  // 兼容批量寄
  setWaybillSpecialEncryptType(false)
  setWaybillSpecialEncryptRules([])
  const orderPageType = piniaStore.root.getOrderPageType
  if (orderPageType === OrderPageType.批量寄单票) {
    initStateData()
  }
})
</script>

<style lang="scss">
@import '@order-global-package-order-sub/styles/index.scss';
@import './index.scss';
</style>
<style lang="scss">
@import '@order-global-package-order-sub/styles/index.scss';
.encrypt-bottom-popup {
  .container {
    .container__body {
      position: relative;
      padding: 0;
    }
  }
}
</style>
