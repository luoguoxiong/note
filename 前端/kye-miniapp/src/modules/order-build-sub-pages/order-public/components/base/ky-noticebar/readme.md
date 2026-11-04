# 提示栏

```vue
import Noticebar from '@order-public-sub-public/components/base/ky-noticebar/index.vue'
<template>
  <Noticebar>这是文本</Noticebar>
</template>
```

- props对应功能
  - text?: string //  通知文本内容  string  ''
  - color?: string // 通知文本颜色  string  #ed6a0c
  - background?: string //  滚动条背景 string  #fffbe8
  - delay?: string | number //  动画延迟时间 (s)  number | string 1
  - speed?: string | number //  滚动速率 (px/s) number | string 60
  - scrollable?: boolean // 是否开启滚动播放，内容长度溢出时默认开启  boolean -
  - wrapable?: boolean // 是否开启文本换行，只在禁用滚动时生效  boolean false
  - handelText?: string //  是否开启文本换行，只在禁用滚动时生效  boolean false
  - isShowOperate?: boolean // 是否有操作项

- 插槽
  - default 默认文本
  - leftIcon 左边图标
  - operational 操作工具栏

