# AutoComplete

自动完成输入组件，根据输入内容提供相关的输入建议。

## 基本使用

<code-preview path="demos/auto-complete/auto-complete-1.vue" title="基本使用" description=" "></code-preview>

```html
<ky-auto-complete
  v-model="text"
  placeholder="请输入您的手机号"
  label="手机号"
  :maxlength="150"
  :fetch-suggestions="querySearchAsync">
</ky-auto-complete>
```

```js
const text = ref('')

const phoneList = ref([
  '17311111111',
  '17322222222',
  '17333333333',
  '17344444444',
])

const querySearchAsync = (queryString, cb) => {
  if(!queryString){
    cb([])
    return
  }
  const list = phoneList.value.filter(i=>i.indexOf(queryString)>-1)
  cb(list)
}
```

## 自定义模板

可以自定义建议项的内容。

```html
<ky-auto-complete
  v-model="text"
  placeholder="请输入您的手机号"
  label="手机号"
  :fetch-suggestions="querySearchAsync">
  <template #default="{ item }">
    <view class="item">{{item}}</view>
  </template>
</ky-auto-complete>
```

## 组件 API

### Attributes
| 参数 | 说明 | 类型 | 可选值 | 默认值 |
| ---- | ---- | ---- | ---- | ---- |
| modelValue / v-model | 绑定值 | string | - | '' |
| fetchSuggestions | 获取输入建议的方法，仅当你的输入建议数据 resolve 时，通过调用 callback(data:[]) 来返回它 | Function / Array | - | - |
| hideLoading | 是否隐藏远程加载时的加载图标 | boolean | - | false |
| debounce | 获取输入建议的防抖延时，单位为毫秒 | number | - | - |
| highlightFirstItem | 是否默认高亮远程搜索结果的第一项 | boolean | - | false |
| placement | 菜单弹出位置 | string | top / top-start / top-end / bottom / bottom-start / bottom-end | - |
| disabled | 是否禁用 | boolean | - | false |
| type | 输入框类型 | string | text / password / number / idcard / digit | text |
| clearable | 是否可清空 | boolean | - | true |
| readonly | 是否只读 | boolean | - | false |
| isError | 是否为错误状态 | boolean | - | false |
| size | 输入框大小 | string | normal / mini / small / large | normal |
| border | 边框样式 | string | all / bottom / none | all |

### Events
| 事件名 | 说明 | 参数 |
| ---- | ---- | ---- |
| change | 在 Input 值改变时触发 | (value: string) |
| update:modelValue | 在 Input 值改变时触发 | (value: string) |
| focus | 在 Input 获得焦点时触发 | - |
| blur | 在 Input 失去焦点时触发 | - |
| clear | 在点击清除按钮时触发 | - |
| input | 在输入值时触发 | (value: string, event: Event) |
| confirm | 点击完成按钮时触发 | (value: string, event: Event) |
| keyboardHeightChange | 键盘高度发生变化的时候触发 | (event: Event) |
| select | 点击选中建议项时触发 | (item: any) |

### Slots
| 名称 | 说明 |
| ---- | ---- |
| default | 自定义输入建议的内容，参数为 { item } |
| loading | 自定义加载中的内容 |
