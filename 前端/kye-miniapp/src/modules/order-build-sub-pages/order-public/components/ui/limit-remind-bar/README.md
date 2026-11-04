# 限取限派创可贴

## 基础使用

```vue
<LimitRemindBar
  :type="20"
  :reason="10"
  message="10 - 疫情影响疫情影响疫情影响疫情影响疫情影响疫情影响疫情影响疫情影响疫情影响疫情影响疫情影响疫情影响疫情影响疫情影响疫情影响疫情影响疫情影响"
/>
<limit-remind-bar :type="10" :reason="10" message="10 - 疫情影响" />
<limit-remind-bar :type="10" :reason="20" message="20 - 台风天气" />
<limit-remind-bar :type="10" :reason="30" message="30 - 雨雪天气" />
<limit-remind-bar :type="10" :reason="40" message="40 - 汛期影响" />
<limit-remind-bar :type="10" :reason="50" message="50 - 假期影响" />
<limit-remind-bar :type="10" :reason="60" message="60 - 春运期间" />
<limit-remind-bar :type="10" :reason="70" message="70 - 国际大型会议" />
<limit-remind-bar :type="10" :reason="80" message="80 - 其它" />
<limit-remind-bar :type="10" :reason="200" message="200 - 报关" />
```

## Props

| 参数      | 说明                                     |
| --------- | ---------------------------------------- |
| type      | 限制类型                                 |
| reason    | 限制原因                                 |
| message   | 限制文案                                 |
| closeable | 是否显示关闭图标，默认 type 为 20 时显示 |

## Events

| 参数  | 说明       |
| ----- | ---------- |
| close | 关闭时触发 |
