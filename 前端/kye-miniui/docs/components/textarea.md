# Textarea

Textarea 是一个多行文本输入组件，支持字数限制、清除按钮等功能，适用于表单输入、评论框等场景。

## 基础输入

基础的文本域用法。

```html
<ky-textarea v-model="value" placeholder="请输入内容" />
```

## 禁用状态

通过 disabled 属性禁用文本域。

```html
<ky-textarea v-model="value" disabled placeholder="禁用状态" />
```

## 字数限制

通过 maxlength 属性限制最大输入长度，支持显示字数统计。

```html
<!-- 带字数统计 -->
<ky-textarea v-model="value" :maxlength="100" :showWordLimit="true" placeholder="最多输入100个字符" />

<!-- 不带字数统计 -->
<ky-textarea v-model="value" :maxlength="50" :showWordLimit="false" placeholder="最多输入50个字符" />
```

## 清除按钮

通过 clearable 属性显示清除按钮。

```html
<ky-textarea v-model="value" :clearable="true" placeholder="输入后可点击清除" />
```

## 错误状态

通过 isError 属性展示错误样式。

```html
<ky-textarea v-model="value" :isError="true" placeholder="错误状态" />
```

## 输入防抖

通过 inputDebounce 属性设置输入防抖时间，适用于性能优化场景。

```html
<ky-textarea v-model="value" :inputDebounce="600" placeholder="输入内容会延迟更新" />
```

## 底部插槽

通过 bottom 插槽自定义底部区域，可添加操作按钮等内容。

```html
<ky-textarea ref="textareaRef" v-model="value" customPlaceholder>
  <template #bottom>
    <ky-button type="primary" size="mini" @click="textareaRef?.focus()">聚焦</ky-button>
    <ky-button type="default" size="mini">粘贴并识别</ky-button>
  </template>
</ky-textarea>
```

## 组件 API

### Attributes

| 参数              | 说明                                             | 类型                                                       | 可选值 | 默认值 |
| ----------------- | ------------------------------------------------ | ---------------------------------------------------------- | ------ | ------ |
| modelValue        | 绑定值                                           | string                                                     | -      | ''     |
| placeholder       | 占位提示                                         | string                                                     | -      | -      |
| placeholderStyle  | 占位样式（行内样式字符串）                       | string                                                     | -      | -      |
| disabled          | 是否禁用                                         | boolean                                                    | -      | false  |
| maxlength         | 最大输入长度                                     | number                                                     | -      | -      |
| maxLengthFitPc    | PC 环境下对 maxlength 的适配优化（微信 PC 场景） | boolean                                                    | -      | false  |
| confirmHold       | 保持键盘                                         | boolean                                                    | -      | -      |
| cursor            | 指定 focus 时的光标位置                          | number                                                     | -      | -      |
| adjustPosition    | 键盘弹起时，是否自动上推页面                     | boolean                                                    | -      | true   |
| holdKeyboard      | focus 时键盘不收起                               | boolean                                                    | -      | -      |
| confirmType       | 确认按钮样式                                     | 'send' \| 'search' \| 'next' \| 'go' \| 'done' \| 'return' | -      |
| isError           | 错误样式                                         | boolean                                                    | -      | false  |
| clearable         | 是否显示清空                                     | boolean                                                    | -      | true   |
| showWordLimit     | 显示字数统计                                     | boolean                                                    | -      | true   |
| formatter         | 格式化函数，入参为当前值，返回格式化后值         | (val: string) => string                                    | -      | -      |
| isTextLimit       | 达到上限时是否展示提示文本                       | boolean                                                    | -      | true   |
| customPlaceholder | Android 场景启用自定义 placeholder               | boolean                                                    | -      | false  |
| inputDebounce     | v-model 更新的节流时间（ms）                     | number                                                     | -      | 0      |

说明：组件内部通过 v-bind="attrs" 透传未声明的原生属性，请按 kebab-case 书写（如 cursor-spacing、hold-keyboard 等）。

### Methods

| 方法名 | 说明                                              | 参数 | 返回值 |
| ------ | ------------------------------------------------- | ---- | ------ |
| focus  | 主动聚焦                                          | -    | void   |
| blur   | 主动失焦                                          | -    | void   |
| clear  | 清空内容（会触发 input 与 update:modelValue('')） | -    | void   |

使用方式：通过 ref 获取组件实例后调用，例如 textareaRef.value.focus()。

### Events

| 事件名               | 说明                         | 回调参数        | 备注                          |
| -------------------- | ---------------------------- | --------------- | ----------------------------- |
| update:modelValue    | v-model 值更新               | (value: string) | 支持节流控制                  |
| input                | 输入时触发                   | (value: string) | H5/小程序统一回调值           |
| focus                | 聚焦时触发                   | ()              | -                             |
| blur                 | 失焦时触发                   | ()              | -                             |
| clear                | 点击清空时触发               | ()              | 清空按钮由 clearable 控制显示 |
| confirm              | 点击键盘确认时触发           | (value: string) | -                             |
| keyboardHeightChange | 键盘高度变化时触发（小程序） | (event: any)    | -                             |
| change               | 值变更（兼容占位）           | (value?: any)   | 如需可监听                    |

### Slots 插槽

| 插槽名 | 说明                                         | 参数 |
| ------ | -------------------------------------------- | ---- |
| bottom | 底部工具区域（计数、清空按钮等可自定义扩展） | -    |

#### 常见问题

#### Q1: inputDebounce 注意事项

| 注意事项     | 说明                                                                   |
| ------------ | ---------------------------------------------------------------------- |
| 默认值       | 默认值为 `0`，表示不启用防抖                                           |
| 单位         | 时间单位为毫秒（ms）                                                   |
| v-model 同步 | 启用防抖后，`v-model` 的更新会延迟                                     |
| 性能优化     | 页面节点多、性能较差设备可适当提高数值（如 `500-800ms`），减少更新频率 |
