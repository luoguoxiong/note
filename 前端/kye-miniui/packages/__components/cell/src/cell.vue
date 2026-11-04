<template>
  <view :class="classes" @click="handleClick">
    <slot>
      <view :class="`${prefixCls}__content`">
        <!--  左侧图标   -->
        <view v-if="$slots.icon" class="ky-cell__icon">
          <slot name="icon"></slot>
        </view>
        <img v-else-if="!$slots.icon && icon" src="" alt="" />
        <!--  左侧标题   -->
        <view
          v-if="title || label || $slots.title"
          :class="['ky-cell__title', requiredDirection && `ky-cell__title--require-${requiredDirection}`]"
        >
          <template v-if="label">
            <slot name="title">
              <view class="ky-cell__title-title"
                >{{ title }}<img v-show="required" class="ky-cell__required" :src="imgList.required"
              /></view>
            </slot>
            <view class="ky-cell__title-desc">{{ label }}</view>
          </template>
          <template v-else>
            <slot name="title">
              {{ title }}
            </slot>
            <!-- v-shows 处理ios app 重新渲染层级遮挡     -->
            <img v-show="required" class="ky-cell__required" :src="imgList.required" />
          </template>
        </view>
        <!--  右侧内容   -->
        <view
          v-if="value || $slots.value || placeholder"
          class="ky-cell__value"
          :class="{
            'ky-cell__value--alone': !title && !label && !$slots.title,
            'ky-cell__value--placeholder': !value && !$slots.value && placeholder,
          }"
          :style="descStyle"
          size="2"
        >
          <slot name="value">
            {{ value || placeholder }}
          </slot>
        </view>
        <!--  右侧图标区域(含箭头)   -->
        <slot name="right-icon" :class="'ky-cell__right-icon'" v-if="isLink">
          <img class="ky-cell__link" :src="imgList.rightIcon" />
          <!--        <ky-image v-if="isLink" class="ky-cell__link"></ky-image>-->
        </slot>
      </view>
    </slot>
    <slot name="extra"></slot>
  </view>
</template>

<script setup lang="ts">
import { computed, type CSSProperties } from 'vue'
import { CellProps } from '@packages/__components/cell/src/types'
import './index.scss'

defineOptions({
  name: 'KyCell',
})

const props = withDefaults(defineProps<CellProps>(), {
  title: '',
  label: '',
  value: '',
  placeholder: '',
  icon: '',
  descTextAlign: 'right',
  isLink: false,
  size: 'normal',
  center: true,
  required: false,
  inset: false,
  isError: false,
  requiredDirection: 'right',
  disabled: false,
})

const emit = defineEmits(['click'])
const prefixCls = 'ky-cell'
const classes = computed(() => {
  return {
    [prefixCls]: true,
    [`${prefixCls}--clickable`]: props.isLink || props.clickable,
    [`${prefixCls}--center`]: props.center,
    [`${prefixCls}--large`]: props.size === 'large',
    [`${prefixCls}--labelable`]: props.label,
    [`${prefixCls}--radius`]: props.inset,
    [`${prefixCls}--error`]: props.isError,
    [`${prefixCls}--disabled`]: props.disabled,
  }
})

// const baseStyle = computed(() => {
//   return {
//     borderRadius: props.roundRadius,
//   }
// })

const descStyle = computed(() => {
  return {
    textAlign: props.descTextAlign,
  } as CSSProperties
})

const imgList = {
  required:
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFAAAABQCAMAAAC5zwKfAAAAolBMVEUAAAD/h3H/h3D/h3D/h3L/hXL/h3L/hnT/h3L/iHL94OD/4uL/h3L/iHL/h3L/gGD/h3L/iHL/h3L/h3H/hnD94N/94eD/h3L94uD94eH94uD/h3L94OD/hnP/5OT/gGr/hnH/h3L/h3L/hnH/h3H/hXD/h3L/h3L/h3H/h3L/gHD+4eD+4eD/iHL/hnH/h3L/hnP/hnL/hXH/h3H94uH/h3Ktn1/aAAAANHRSTlMAvyBAn4BfFvnPMgjojsYIb++1Zx369dvZmZWVjCgmDFjz31NGMNethzkQ4MWmfHdQTCzjXNbewAAAArFJREFUWMPtl9l2qjAUhjcKkigzKI51HlunHv73f7WDDDZLoGW1ueS7IQH8zN47KyTU0NDQ0PBFdzTsR3+kPxx1M11vHEli3Et8H9Fg2u3RH+l1p4Po46EZR+9vJIW392gc5y8axD5JxkHUpVE0JWlMoxENY6k0utGQ+lFPnrAX9SmKSB6xrUzo61RBp6OLPVWtJTRh3CuEQFvoncFrCR0GTOy8Z5/XVUILk3ohf3KAf2YdDei8CpUUhjBrmd8LyZ4Ay1QTMFiFEeIV5UVYpLNEGo8KHAvCVoIPo5Wh/yikzzD58RFQq4qiCY9+FpKuXIjmIVw9vxGPBFi0WgHRRokxsBIyWC1sCVWYCG0VGas4IxBRKoX2i/AOnKlUKEi0b4TrpScKdQPhnKgQcn3hAVwQzi2w7UnbBa9FqR+ygokg3AMOBS68MuFKy1GqhXOGxZfQTGeMA9xehLVDvgH6U+gjG9oOK7soNNQcXi1UwZ9VdgArLcgGcIpCV8lZVQrtJS65MPbt9GdmXftXIfvALBOago/agFMQ8naOWinksCgV7gBLF9c94zfTZgGsMyGwT/InPHkK9euh5ggdl+dFgEk5J4oxsM+FnCGsm0N7RjFXBhzoiaHFsZv8nixpJmLCiapa4rR5tP2q1WZrAeKafwJu2TB9jhjvTm0UUcuFpwMDFFE4+1qwL4A7SaaB9sD0kounJpdbaciOAfxbt0ThBsjLHXB/LoQSskeij0t2rVqxO7GOHeakA76QcYNKsDUG9ngr2AN8Wy6cLbFPysLAN62UhYszFVmHgDVL2/Er7FJe5Xb2Tx4E2LGg23DAdZ7dwAK8glAk8BhyjA4VmBnM1EnAxPWnD734vS2yfb3dFkKWvp2TvuGUviWWvmmXfqyQffCRfjSTfXiUfbxtaGhoaHjyH3pRu/OA05k8AAAAAElFTkSuQmCC',
  rightIcon:
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADMAAAAzCAMAAAANf8AYAAAAM1BMVEUAAAAAAEAkJisjJisgJi0gICokJSskJSojIyokJSojJiokJSokJyskJCsgJCggICAkJit8ONRoAAAAEHRSTlMABNfnKBisqhLT4aRwVB8Ice05EAAAAFtJREFUSMftzTESgCAMRNEFRBMFzP1P62hPsalkJr9/8zErDbCJWt5I08yskKibA+0OlAIFCrQsOsWBLlDd5R1xn+P78CQLT2qQIEH+QuAgnSdoPIGoaQXbwKwHOs8O4wNWhbgAAAAASUVORK5CYII=',
}

const handleClick = (event: Event) => {
  emit('click', event)
}
</script>
