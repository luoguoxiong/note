# 退出活动弹窗

根据下单配置第三步 exitEntry 字段决定显示隐藏

```ts
const exitVisible = computed(() => {
  return exitEntry === YesOrNoString.YES
})
```
