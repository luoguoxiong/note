import { computed, reactive, ref, watch } from 'vue'
import { PickerFieldNames, PickerOption } from './types'
import { isSameValue } from './utils'

const DEFAULT_FILED_NAMES = {
  text: 'text',
  value: 'value',
  children: 'children',
  className: 'className',
}

function isOptionsEqual(
  a?: PickerOption[],
  b?: PickerOption[],
): boolean {
  if (a === b) return true
  if (!a || !b) return false
  if (a.length !== b.length) return false

  for (let i = 0; i < a.length; i++) {
    if (!isOptionEqual(a[i], b[i])) {
      return false
    }
  }

  return true
}
/* picker columns 数据是否一致对比 */
export const isOptionEqual = (a?: PickerOption, b?: PickerOption): boolean => {
  if (a === b) return true
  if (!a || !b) return false

  if (a.text !== b.text) return false
  if (a.value !== b.value) return false

  return isOptionsEqual(a.children, b.children)
}

const prevChildrenCache = ref<Record<number, PickerOption[]>>({})

export const usePicker = (props, emit) => {
  const state = reactive({
    formattedColumns: props.columns,
  })

  // 选中项
  const defaultValues = ref<(number | string)[]>([])

  // 选中项index
  const defaultIndexes = computed(() => {
    const fields = columnFieldNames.value

    return (columnsList.value as PickerOption[][]).map((column: PickerOption[], index: number) => {
      const targetIndex = column.findIndex((item) => item[fields.value] === defaultValues.value[index])
      return targetIndex === -1 ? 0 : targetIndex
    })
  })

  const pickerColumn = ref<any[]>([])
  const swipeRef = (el: any) => {
    if (el && pickerColumn.value.length < columnsList.value.length) {
      pickerColumn.value.push(el)
    }
  }

  /* 栏字段对象 */
  const columnFieldNames = computed(() => {
    return {
      ...DEFAULT_FILED_NAMES,
      ...(props.fieldNames as PickerFieldNames),
    }
  })

  // 当前类型['single':单个, 'multiple': 多个, 'cascade': 级联]
  const columnsType = computed(() => {
    const firstColumn: PickerOption | PickerOption[] = state.formattedColumns[0]
    const fields = columnFieldNames.value
    if (firstColumn) {
      if (Array.isArray(firstColumn)) {
        return 'multiple'
      }
      if (fields.children in firstColumn) {
        return 'cascade'
      }
    }
    return 'single'
  })

  // 将传入的 columns 格式化
  const columnsList = computed(() => {
    let result: PickerOption[][] = []
    // return [state.formattedColumns]
    switch (columnsType.value) {
      case 'multiple':
        result = state.formattedColumns as PickerOption[][]
        break
      case 'cascade':
        // 级联数据处理
        result = formatCascade(state.formattedColumns as PickerOption[], defaultValues.value ? defaultValues.value : [])
        break
      default:
        result = [state.formattedColumns] as PickerOption[][]
        break
    }
    return result
  })

  /* 当前选中栏对象 */
  const selectedOptions = computed(() => {
    const fields = columnFieldNames.value
    return (columnsList.value as PickerOption[][]).map((column: PickerOption[], index: number) => {
      return column.find((item) => item[fields.value] === defaultValues.value[index]) || column[0]
    })
  })

  // 级联数据格式化
  const formatCascade = (columns: PickerOption[], defaultValues: (number | string)[]) => {
    const formatted: PickerOption[][] = []
    const fields = columnFieldNames.value
    let cursor: PickerOption = {
      text: '',
      value: '',
      [fields.children]: columns,
    }

    let columnIndex = 0

    while (cursor && cursor[fields.children]) {
      const options: PickerOption[] = cursor[fields.children]
      const value = defaultValues[columnIndex]
      let index = options.findIndex((columnItem) => columnItem[fields.value] === value)
      if (index === -1) index = 0
      cursor = cursor[fields.children][index]

      columnIndex++
      formatted.push(options)
    }
    return formatted
  }
  /* 检测每个选项是否存在 */
  const selectedValueExistCheck = (arr) => {
    return Array.from(arr).every((val) => !!val)
  }
  /**
   * 兜底选中值：
   * - defaultValues 为空：用当前 selectedOptions 的值
   * - defaultValues 和 selectedOptions 不一致：修正为当前选中项
   */
  const normalizeSelectedValue = (
    defaultValues: (string | number)[] = [],
    selectedOptions: { value: string | number }[],
  ): (string | number)[] => {
    const hasValidDefaults = Array.isArray(defaultValues) && defaultValues.length === selectedOptions.length

    return selectedOptions.map((opt, index) => {
      const fallback = opt?.value ?? ''
      if (!hasValidDefaults) return fallback

      const val = defaultValues[index]
      return val === opt?.value ? val : fallback
    })
  }

  const cancel = () => {
    console.log('emit cancel')
    emit('cancel', {
      selectedValue: defaultValues.value,
      selectedOptions: selectedOptions.value,
    })
  }
  /* 选中值确认 */
  const confirm = () => {
    console.log('emit confirm')
    const selectedValue = normalizeSelectedValue(
      defaultValues?.value ?? [],
      selectedOptions.value as { value: string | number }[],
    )
    emit('confirm', {
      selectedValue: selectedValue,
      selectedOptions: selectedOptions.value,
    })
  }

  const onClose = () => {
    emit('close')
  }

  /**
   * 列改变回调
   * @param columnIndex 当前操作picker-view-column列
   * @param option 当前操作列对象及child
   */
  const changeHandler = (columnIndex: number, option: PickerOption) => {
    // console.log('changeHandler', columnIndex, option)
    const fields = (columnFieldNames.value || {}) as PickerFieldNames
    if (option && Object.keys(option).length) {
      defaultValues.value = defaultValues.value ? defaultValues.value : []
      /* 级联columns处理 */
      if (columnsType.value === 'cascade') {
        defaultValues.value[columnIndex] = option[fields.value] ?? ''
        let index = columnIndex
        let cursor = option

        while (cursor?.[fields.children]?.length) {
          const children = cursor[fields.children]
          // 下一列column
          const nextIndex = index + 1
          // 尝试复用旧值(当前多列选中值中,下一列存在已选)
          const oldValue = defaultValues.value[nextIndex]
          const matched =
            oldValue &&
            children.find((item) => item[fields?.value] === oldValue)
          const nextOption = matched || children[0]

          defaultValues.value[nextIndex] = nextOption[fields?.value]

          cursor = nextOption
          index = nextIndex

          const prevChildren = prevChildrenCache.value[nextIndex]
          // 检查column是否变化:不一致 → 重建 column
          if (!isOptionsEqual(prevChildren, children)) {
            columnKeys.value[nextIndex] = Date.now() + Math.random()
            prevChildrenCache.value[nextIndex] = children
            // 重置columns key - 避免滚轮错误
            updateColumnsKeys()
          }
        }

        // 当前改变列 的 下一列 children 值为空
        if (cursor && cursor[fields.children] && cursor[fields.children].length === 0) {
          defaultValues.value = defaultValues.value.slice(0, index + 1)
        }
      } else {
        defaultValues.value[columnIndex] = Object.prototype.hasOwnProperty.call(option, fields.value)
          ? option[fields.value]
          : ''
      }
      console.log('changeHandler end', defaultValues.value, +new Date())
      emit('change', {
        columnIndex: columnIndex,
        selectedValue: defaultValues.value,
        selectedOptions: selectedOptions.value,
      })
    }
  }

  watch(
    () => props.modelValue,
    (newValues) => {
      // 默认数据为空场景: 默认选中第一项
      if (newValues instanceof Array && newValues.length === 0) {
        defaultValues.value = normalizeSelectedValue(
          defaultValues?.value ?? [],
          selectedOptions.value as { value: string | number }[],
        )
        return
      }
      if (!isSameValue(newValues, defaultValues.value)) {
        defaultValues.value = newValues.slice(0)
      }
    },
    { deep: true, immediate: true },
  )

  /* 监听当前选中数据变化，是否同步最外层 */
  // watch(
  //   defaultValues,
  //   (newValues) => {
  //     if (!isSameValue(newValues, props.modelValue)) {
  //       emit('update:modelValue', newValues)
  //     }
  //   },
  //   { deep: true },
  // )

  watch(
    () => props.columns,
    (val) => {
      state.formattedColumns = val as PickerOption[]
    },
  )

  /* column keys 用于处理columns快速变化-关联列滚动异常 */
  const columnKeys = ref<number[]>([])

  /* 强制刷新columns key */
  const updateColumnsKeys = () => {
    columnsList.value?.forEach((item,index) => {
      columnKeys.value[index] = Date.now() + index
    })
  }

  watch(
    columnsList,
    (newColumns, oldColumns) => {
      if (!oldColumns) return

      newColumns.forEach((column, index) => {
        const oldLen = oldColumns[index]?.length
        const newLen = column.length

        // 长度变短，必须重建key
        if (oldLen && newLen < oldLen) {
          columnKeys.value[index] = Date.now() + index
        } else if (!columnKeys.value[index]) {
          columnKeys.value[index] = index
        }
      })
    },
    { flush: 'post' },
  )

  return {
    defaultValues,
    defaultIndexes,
    columnsList,
    columnFieldNames,
    columnKeys,
    swipeRef,
    cancel,
    confirm,
    changeHandler,
    onClose,
  }
}
