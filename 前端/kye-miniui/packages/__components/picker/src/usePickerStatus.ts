import { computed } from 'vue'

const usePickerStatus = (props) => {
  // 是否展示empty(当数据为空时)
  const showEmpty = computed(() => {
    return !props.columns | (props.columns?.length === 0)
  })

  const showLoading = computed(() => {
    return props.loading
  })

  const showColumns = computed(() => {
    return !showEmpty.value && !showLoading.value
  })

  return {
    showEmpty,
    showLoading,
    showColumns,
  }
}

export default usePickerStatus
