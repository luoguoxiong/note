## Props

| 参数        | 说明     | 类型    | 默认值 |
| ----------- | -------- | ------- | ------ |
| value       | 绑定值   | String  | ''     |
| required    | 是否必填 | boolean | false  |
| placeholder | 提示文案 | String  | ''     |

## slot

支持 vant 的所有插槽

## example

```javascript

  <KyCell title="单元格" is-link :value="undefined" :required="true"> </KyCell>
  <KyCell title="单元格" is-link :value="undefined" :required="true">
    <!-- 使用 title 插槽来自定义标题 -->
    <template #title>
      <span class="custom-title">单元格111</span>
      <van-tag type="primary">标签</van-tag>
    </template>
  </KyCell>

  <KyCell title="单元格" is-link value="内容">
    <!-- 使用 title 插槽来自定义标题 -->
    <template #title>
      <span class="custom-title">单元格111</span>
      <van-tag type="primary">标签</van-tag>
    </template>
  </KyCell>
```
