<template>
  <view class="receipt-service-type" :class="className">
    <template v-for="item in props.btnList" :key="item.type">
      <view class="button-wrapper">
        <KyButtonRadio
          :class="`receipt-service-type-tag flex items-center justify-center column font-level3 ${
            chooseCheck(item) ? 'tag-selected' : 'tag-not-selected'
          } ${props.flexCenter ? 'flexCenter' : ''}`"
          :isChecked="chooseCheck(item)"
          needChecked
          plain
          @click="handle(item)"
        >
          <template #default>
            <view class="receipt-service-type-text">
              <text
                :class="`receipt-service-type-text__typeName ${chooseCheck(item) ? 'receipt-service-type-text__typeName-selected' : ''}`"
                >{{ item.typeName }}</text
              >
              <view class="flex items-center typeNameDes">
                {{ item.typeNameDes }}
              </view>
            </view>
          </template>
        </KyButtonRadio>
      </view>
    </template>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'

// import SvgIcon from '@order-public-sub-public/components/ui/svg-icon/index.vue'
import KyButtonRadio from '@order-public-sub-public/components/base/ky-button-radio/index.vue'
import { btnListType } from './hooks/type'

interface KyCheckboxProps {
  btnList: btnListType[]
  flexCenter?: boolean
  multiple?: boolean
  checked?: boolean
  modelValue?: btnListType[]
  className: string
}
const emit = defineEmits(['update:modelValue', 'change'])
const props = withDefaults(defineProps<KyCheckboxProps>(), {
  flexCenter: false,
  multiple: false,
  btnList: () => [
    {
      type: 'big',
      typeName: '大标签',
      typeNameDes: '(宽76mm*长130mm)',
    },
    {
      type: 'small',
      typeName: '小标签',
      typeNameDes: '(宽76mm*长130mm)',
    },
  ],
})
const choose = ref<btnListType[]>(props.modelValue || [])

const handle = (item: btnListType) => {
  const index = choose.value.findIndex((v) => v.type === item.type)
  if (props.multiple) {
    if (index !== -1) {
      choose.value.splice(index, 1)
    } else {
      choose.value.push(item)
    }
  } else if (props.checked) {
    if (index !== -1) {
      choose.value.splice(index, 1)
    } else {
      choose.value = [item]
    }
  } else {
    choose.value = [item]
  }
  emit('update:modelValue', choose.value)
  emit('change', choose.value, item)
}
const chooseCheck = (item: btnListType) => {
  const index = (props.modelValue || choose.value).findIndex((v) => v.type === item.type)
  return index !== -1
}

const syncChooseValue = (value: btnListType[]) => {
  choose.value = value || []
}

defineExpose({
  syncChooseValue,
})
</script>
<style lang="scss">
@import '@order-global-package-order-sub/styles/index.scss';

.receipt-service-type {
  flex-wrap: wrap;
  display: grid;
  grid-template-columns: repeat(2, 1fr);

  .ky-button__wrap {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
    padding: 16px;
    .ky-button-radio__check_icon {
      margin-right: 16px;
    }
  }
  .button-wrapper:nth-child(odd) {
    margin-right: 16px;
    // margin-bottom: 12px;
  }
  .receipt-service-type-tag {
    position: relative;
    height: 98px;

    border: 1.5px solid #cfd2de;
    border-radius: 12px;
    flex-shrink: 0;

    .typeNameDes {
      font-size: 22px;
      color: #888ea6;
    }
  }
  .receipt-service-type-text {
    display: flex;
    flex-direction: column;
    text-align: left;
    background: unset !important;

    // .receipt-service-type-text__typeName {
    //   margin-bottom: 4px;
    //   display: inline-block;
    // }
  }
  .flexCenter {
    height: 68px;
  }
  .tag-selected {
    border-radius: 12px;
    color: $primary;
    background-color: $selected;
    border: 2px solid $primary;

    .typeNameDes {
      font-size: 22px;
      color: #8365f6;
    }
  }
  .tag-not-selected {
    border-radius: 12px;
    color: #03050d;
    background-color: #fff;
  }
}
</style>
