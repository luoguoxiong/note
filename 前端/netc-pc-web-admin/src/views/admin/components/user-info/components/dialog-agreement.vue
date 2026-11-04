<template>
  <!-- 协议弹窗 -->
  <KDialog
    v-model="dialogVisible"
    class="dialog-agreement__container"
    width="736"
    append-to-body
    :close-on-click-modal="false"
    :is-show-cancel="false"
    :title="agreementTitle"
    confirm-text="我知道了"
    @confirm="handleClose"
  >
    <div v-loading="loading" class="dialog-content">
      <div v-html="agreementContentDoc"></div>
      <div v-if="isHasHistory" class="btn-item">
        <div class="btn" @mouseenter="isHovered = true" @mouseleave="isHovered = false" @click="handleShowDrawer">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            xmlns:xlink="http://www.w3.org/1999/xlink"
            :fill="isHovered ? '#7143F0' : '#24262B'"
            version="1.1"
            width="12.20000171661377"
            height="13.199999809265137"
            viewBox="0 0 12.20000171661377 13.199999809265137"
          >
            <g>
              <path
                d="M12.2,1.6L12.2,8.6857901C12.2,9.1276197,12.043799,9.5047398,11.7314,9.8171597L8.8171597,12.7314C8.5047398,13.043799,8.1276197,13.2,7.6857896,13.2L7.5997396,13.2L1.5999994,13.2C1.1581694,13.2,0.78104943,13.043799,0.46862948,12.7314C0.15620947,12.418929,-5.0663948e-7,12.0418,-5.0663948e-7,11.599999L-5.0663948e-7,1.5999994C-5.0663948e-7,1.1581694,0.1562095,0.78104943,0.46862948,0.46862948C0.78104949,0.15620947,1.1581695,-5.0663948e-7,1.5999994,-5.0663948e-7L10.599999,-5.0663948e-7C11.0418,-5.0663948e-7,11.418929,0.1562095,11.7314,0.46862948C12.043799,0.78104949,12.2,1.1581695,12.2,1.6ZM10.6,1.2L1.6000004,1.2C1.3333304,1.2,1.2000004,1.33333,1.2000004,1.6L1.2000004,11.6C1.2000004,11.866671,1.3333304,12,1.6000004,12L7.0000005,12L7.0000005,9.1000004C7.0000005,8.7962503,7.1073904,8.5369701,7.3221803,8.3221807C7.5369701,8.1073904,7.7962503,8.000001,8.1000004,8.000001L11,8.000001L11,1.6000009C11,1.3333309,10.86667,1.2000009,10.6,1.2ZM8.0999498,4.2000599L3.5999498,4.2000599C3.26858,4.2000599,2.9999499,3.9314299,2.9999499,3.60006C2.9999499,3.2686901,3.26858,3.0000601,3.5999498,3.0000601L8.0999498,3.0000601C8.4313202,3.0000601,8.6999502,3.2686901,8.6999502,3.60006C8.6999502,3.9314299,8.4313202,4.2000599,8.0999498,4.2000599ZM5.5999498,7.2000599L3.5999498,7.2000599C3.26858,7.2000599,2.9999499,6.9314299,2.9999499,6.60006C2.9999499,6.2686901,3.26858,6.0000601,3.5999498,6.0000601L5.5999498,6.0000601C5.9313197,6.0000601,6.1999497,6.2686901,6.1999497,6.60006C6.1999497,6.9314299,5.9313197,7.2000599,5.5999498,7.2000599ZM8.1999998,9.1999998L8.1999998,11.6515L10.6515,9.1999998L8.1999998,9.1999998Z"
                fill-opacity="1"
              />
            </g>
          </svg>
          查看历史版本
        </div>
      </div>
    </div>
  </KDialog>
</template>

<script setup lang="ts">
/**
 * 协议弹窗
 * 来源: netc-pc-web/src/views/layout/switch-login-mobile/components/dialog-agreement.vue
 */
import { computed, ref, watch } from 'vue'
import { KDialog } from '@netc-design-pc/ui'
import { agreementListApi } from '../api'
import { AgreementId, AgreementLabel } from '../constants'
import { isPROD } from '@/utils/env'

defineOptions({ name: 'DialogAgreement' })

const props = defineProps<{
  visible: boolean
  agreementId: number
}>()

const emit = defineEmits<{
  (e: 'update:visible', value: boolean): void
  (e: 'showDrawer', isUser: boolean, code: string): void
}>()

const dialogVisible = computed({
  get: () => props.visible,
  set: (val) => emit('update:visible', val),
})

const agreementContentDoc = ref('')
const isHasHistory = ref(false)
const loading = ref(false)
const isHovered = ref(false)

const agreementTitle = computed(() => {
  return props.agreementId === AgreementId.USER_AGREEMENT_ID
    ? AgreementLabel.USER_AGREEMENT
    : AgreementLabel.PRIVACY_AGREEMENT
})

const agreeCode = computed(() => {
  return isPROD ? 'KY_2507090003' : 'KY_2507040001'
})
const privacyCode = computed(() => {
  return isPROD ? 'KY_2507090002' : 'KY_2507040002'
})

const handleClose = () => {
  dialogVisible.value = false
}

const handleShowDrawer = () => {
  const isUser = props.agreementId === AgreementId.USER_AGREEMENT_ID
  emit('showDrawer', isUser, isUser ? agreeCode.value : privacyCode.value)
}

const fetchAgreementDoc = async () => {
  try {
    loading.value = true
    const pageCode = isPROD ? 'KY01_0003' : 'KY35_0003'
    const agreementCode = props.agreementId === AgreementId.USER_AGREEMENT_ID ? agreeCode.value : privacyCode.value
    const res = await agreementListApi({ pageCode, agreementCode })
    loading.value = false
    if (res.code === 0) {
      agreementContentDoc.value = res.data[0]?.agreementContent || ''
      isHasHistory.value = res.data[0]?.historyShowFlag === '10'
    } else {
      agreementContentDoc.value = ''
      isHasHistory.value = false
    }
  } catch (e) {
    console.log(e, ':>>> e')
    agreementContentDoc.value = ''
    loading.value = false
  }
}

watch(
  () => dialogVisible.value,
  (val) => {
    if (val) fetchAgreementDoc()
  },
  { immediate: true }
)
</script>

<style lang="scss" scoped>
.dialog-agreement__container {
  .dialog-content {
    height: 250px;
    padding: 30px 10px;
    line-height: 26px;
  }

  .btn-item {
    width: 100%;
    display: flex;
    justify-content: right;
  }
}
</style>
