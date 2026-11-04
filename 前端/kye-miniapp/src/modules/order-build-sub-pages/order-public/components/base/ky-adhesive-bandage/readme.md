# 创可贴

```vue
import AdhesiveBandage from '@order-public-sub-public/components/base/ky-adhesive-bandage/index.vue'

<template>
  <AdhesiveBandage text="测试文本"/>
</template>


// 传入的 props 定义
interface KYBandageProps {
  text?: string // 展示的文本
  isShowClose?: boolean // 是否显示关闭按钮；默认 false
  colorTheme?: string // 主题类型 waring，dark； 默认'warning'，
  isDirectivity?: boolean // 是否带箭头（带指示箭头的有固定色系，colorTheme将不生效）；默认 false，
}
```
