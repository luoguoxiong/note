<template>
  <div :class="['product-name', { relative: isRelative }]" ref="vanFieldRef">
    <div :class="{ highLight: isHighLight }">
      <van-field
        :placeholder="placeholder"
        clearable
        :modelValue="modelValue"
        :class="['column-input', { 'full-column': isFull }]"
        :border="false"
        :type="type"
        :maxlength="maxlength"
        @blur="onBlur"
        @focus="onFocus"
        @update:model-value="onInput"
        autocomplete="off"
        @clear="handleClear"
      >
      </van-field>

      <div
        :class="['product-link', { bottom: isBottom }]"
        ref="productLikeRef"
        :style="`width:${windowWidth}`"
        v-show="isLikeGoods && !!productList.length"
      >
        <div class="product-link-box">
          <div
            class="product-link-item"
            :style="{ borderBottom: '1px solid #ebedf5' }"
            v-for="(item, index) in productList"
            :key="item.createDate + index"
            @click="handleCheckProductName(item)"
          >
            <div class="name" v-html="highlightText(item.keyword, modelValue)"></div>
          </div>
        </div>

        <div
          :style="{ borderTop: '1px solid #ebedf5' }"
          class="product-link-item close"
          @click="() => (isLikeGoods = false)"
        >
          关闭
        </div>
      </div>
    </div>
    <div class="product-link-mask" v-if="isLikeGoods" @click="() => (isLikeGoods = false)"></div>
  </div>
</template>
<script setup>
import { debounce } from 'lodash-es'
import { highlightText as originHighlightText } from './utlis'
import { getWaybillLink, linkDepartmentNameAndCode } from '@order-public-sub-public/apis/print'
import { ref, watch, onMounted, nextTick } from 'vue'

defineOptions({
  name: 'imagine-input',
})

const emit = defineEmits(['setAssociate', 'setCustomerCode', 'blur', 'update:modelValue', 'clear'])

const productLikeRef = ref(null)
const vanFieldRef = ref(null)

const isHighLight = ref(false)
const isLikeGoods = ref(false)
const productList = ref([])
const highlightText = ref(originHighlightText)
const windowWidth = ref(0)
const isBottom = ref(false)

onMounted(() => {
  windowWidth.value = `calc(${window.innerWidth}px - 0.85334rem)`
})

const props = defineProps({
  modelValue: {
    type: [String, Number],
    default: '',
  },
  isFull: {
    type: Boolean,
    default: false,
  },
  keywordType: {
    type: Number,
    default: 110,
  },
  placeholder: {
    type: String,
    default: '请输入托寄物名称',
  },
  maxlength: {
    type: Number,
    default: 30,
  },
  isRelative: {
    type: Boolean,
    default: true,
  },
  type: {
    type: String,
    default: '',
  },
  isDepartmen: {
    type: Boolean,
    default: false,
  },
  isCustomerCode: {
    type: Boolean,
    default: false,
  },
  extraImagineParams: {
    type: Object,
    default: () => ({}),
  },
})

const onInput = debounce(async (value) => {
  if (!props.isDepartmen && !props.isCustomerCode) {
    emit('update:modelValue', value)
  }

  if (!value) return

  await onGetWaybillLink(value)
}, 100)

const handleCheckProductName = (row) => {
  isLikeGoods.value = false
  emit('update:modelValue', row.keyword)

  if (props.isDepartmen) {
    emit('setAssociate', {
      departmentId: row.createDate,
    })
  }

  if (props.isCustomerCode) {
    emit('setCustomerCode', {
      id: row?.keywordType,
    })
  }
}

const onBlur = () => {
  emit('blur')

  setTimeout(() => {
    isHighLight.value = false
    isLikeGoods.value = false
    isBottom.value = false
  }, 200)
}

const onFocus = () => {
  isHighLight.value = true
}

const handleClear = () => {
  emit('clear')
}

const onGetWaybillLink = async (value) => {
  try {
    if (props.isDepartmen) {
      const res = await linkDepartmentNameAndCode({ keyword: value, departmentType: props.keywordType })
      productList.value =
        res.data.map((item) => ({
          keyword: item.departmentName,
          createDate: item.departmentId,
        })) || []
    } else {
      let params = {
        keyword: value,
        pageSize: 10,
        keywordType: props.keywordType,
      }
      if (props.extraImagineParams) {
        params = {
          ...params,
          ...props.extraImagineParams,
        }
      }
      const res = await getWaybillLink(params)
      productList.value = res.data || []
    }

    isLikeGoods.value = true
  } catch (error) {
    console.log('onGetWaybillLink', error)
  }
}

watch(
  () => isLikeGoods.value,
  (newVal) => {
    if (newVal) {
      setTimeout(() => {
        const top = 0
        isBottom.value = top < 250
        nextTick(() => {
          if (!productLikeRef.value) return
          productLikeRef.value.scrollIntoView({ behavior: 'smooth', block: 'center' })
        })
      }, 0)
    }
  },
)
</script>
<style lang="scss" scoped>
@import '@order-global-package-order-sub/styles/index.scss';
@import './index.scss';
</style>
