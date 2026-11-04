<template>
  <ky-popup
    safe-area-inset-bottom
    position="bottom"
    :show="jobsPopupShow"
    is-border-radius
    @tap-overlay="handleClosePopup"
  >
    <view class="id-card-page-edit__popup-content">
      <scroll-view scroll-y="true" :show-scrollbar="false" enhanced enable-flex class="jobs_scroll-view">
        <view>
          <view
            v-for="jobName in jobsList"
            :key="jobName"
            :class="['value', { active: currentJob === jobName }]"
            @tap="() => selectJobName(jobName)"
          >
            {{ jobName }}
          </view>
        </view>
      </scroll-view>
      <view class="cancel-btn" @tap="handleClosePopup">取消</view>
    </view>
  </ky-popup>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted } from 'vue'
import { trackEvent } from '../../edit-report'
import { jobList } from '@/packages/idcard/api/index'
import { lastModifyWorkOrderStatusMap } from '@/packages/idcard/const/index'

const props = defineProps({
  detail: {
    type: Object,
    default: () => {},
  },
  currentJob: {
    type: String,
    default: '',
  },
})

const emit = defineEmits(['selectJobName'])

const jobsPopupShow = ref(false)
const jobsList = ref(false)

const reportHrUserId = computed(() => props.detail.baseInfo?.hrUserId)

const isPadding = computed(() => {
  return +props.detail?.lastModifyWorkOrderStatus === lastModifyWorkOrderStatusMap.padding
})

const getJobList = async () => {
  try {
    const { data: res } = await jobList()
    jobsList.value = res
  } catch (error) {
    console.error('获取岗位错误', error)
  }
}

const handleClosePopup = () => {
  jobsPopupShow.value = false
}

const handleOpenJobsPopup = () => {
  if (isPadding.value) return

  trackEvent('clk_sharing_information_edit_post', '岗位名称', {
    employee_id: reportHrUserId.value,
    sales_id: reportHrUserId.value,
  })
  jobsPopupShow.value = true
}

const selectJobName = (val: string) => {
  console.log('🚀 ~ selectJobName ~ val:', val)
  emit('selectJobName', val)
  handleClosePopup()
}

defineExpose({
  handleOpenJobsPopup,
  handleClosePopup,
})

onMounted(() => {
  getJobList()
})
</script>

<style lang="scss">
@import './index.scss';
</style>
