# Input

<code-preview path="demos/input/input-1.vue" title="基本使用" description="各种输入框用法示例"></code-preview>

## 基本使用

## 输入类型

支持多种输入类型，满足不同场景需求。

```html
<!-- 文本输入 -->
<ky-input v-model="text" type="text" placeholder="请输入文本" />

<!-- 数字输入 -->
<ky-input v-model="number" type="number" maxlength="11" placeholder="请输入手机号" />

<!-- 身份证输入 -->
<ky-input v-model="idcard" type="idcard" maxlength="18" placeholder="请输入身份证号" />

<!-- 小数输入 -->
<ky-input v-model="digit" type="digit" placeholder="请输入小数" />

<!-- 密码输入 -->
<ky-input v-model="password" password placeholder="请输入密码" />
```

## 边框样式

支持三种边框样式：全边框、底部边框和无边框。

```html
<!-- 全边框（默认） -->
<ky-input v-model="value" placeholder="全边框样式" border="all" />

<!-- 底部边框 -->
<ky-input v-model="value" placeholder="底部边框样式" border="bottom" />

<!-- 无边框 -->
<ky-input v-model="value" placeholder="无边框样式" border="none" />
```

## 禁用状态

通过 disabled 属性禁用输入框。

```html
<!-- 禁用状态 -->
<ky-input v-model="value" placeholder="禁用状态" disabled />
```

## 清除按钮

通过 clearable 属性显示清除按钮，clear-trigger 控制显示时机。

```html
<!-- 默认聚焦时显示清除按钮 -->
<ky-input v-model="value" placeholder="聚焦显示清除按钮" clearable />

<!-- 始终显示清除按钮 -->
<ky-input v-model="value" placeholder="始终显示清除按钮" clearable clear-trigger="always" />
```

## 字数限制

通过 maxlength 属性限制最大输入长度。

```html
<ky-input v-model="value" maxlength="10" placeholder="最多输入10个字符" />
```

## 对齐方式

通过 `text-align` 属性设置文本对齐方式。

```html
<!-- 左对齐（默认） -->
<ky-input v-model="value" placeholder="左对齐文本" />

<!-- 右对齐 -->
<ky-input v-model="value" placeholder="右对齐文本" text-align="right" />
```

## 格式化输入

通过 formatter 属性自定义输入格式化函数。

```html
<ky-input v-model="phone" :formatter="formatPhone" placeholder="请输入手机号" maxlength="13" />
```

```javascript
const formatPhone = (value) => {
  const cleaned = value.replace(/[^\d]/g, '')
  if (cleaned.length >= 4 && cleaned.length < 8) {
    return `${cleaned.slice(0, 3)}-${cleaned.slice(3)}`
  } else if (cleaned.length >= 8) {
    return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 7)}-${cleaned.slice(7, 11)}`
  }
  return cleaned
}
```

## 错误状态

通过 is-error 属性标记错误状态。

```html
<!-- 错误状态 -->
<ky-input v-model="value" placeholder="错误状态" is-error />

<!-- 带校验的输入框 -->
<ky-input v-model="phone" placeholder="请输入手机号" :is-error="!isValidPhone" />
```

## 插槽使用

支持 left 和 right 两个插槽。

```html
<!-- 左侧插槽 -->
<ky-input v-model="value" placeholder="请输入内容">
  <template #left>
    <view class="icon">👤</view>
  </template>
</ky-input>

<!-- 右侧插槽 -->
<ky-input v-model="value" placeholder="请输入内容">
  <template #right>
    <view class="tip">可选</view>
  </template>
</ky-input>

<!-- 双侧插槽 -->
<ky-input v-model="value" placeholder="请输入金额">
  <template #left>💰</template>
  <template #right>元</template>
</ky-input>
```

## 方法调用

通过 ref 调用组件方法。

```html
<ky-input ref="inputRef" v-model="value" />
```

```javascript
const inputRef = ref()

// 聚焦
inputRef.value?.focus()

// 失焦
inputRef.value?.blur()

// 清空
inputRef.value?.clear()
```

## 组件 API

### Attributes

| 参数              | 说明                             | 类型                    | 可选值                                                    | 默认值 |
| ----------------- | -------------------------------- | ----------------------- | --------------------------------------------------------- | ------ |
| modelValue        | 绑定值                           | string                  | -                                                         | ''     |
| type              | 输入框类型                       | string                  | text / number / idcard / digit / safe-password / nickname | text   |
| password          | 是否密码类型                     | boolean                 | -                                                         | false  |
| placeholder       | 占位文本                         | string                  | -                                                         | -      |
| placeholderStyle  | 占位文本样式                     | string                  | -                                                         | -      |
| customPlaceholder | 是否自定义占位符（Android 适配） | boolean                 | -                                                         | false  |
| border            | 边框样式                         | string                  | all / bottom / none                                       | all    |
| disabled          | 是否禁用                         | boolean                 | -                                                         | false  |
| maxlength         | 最大输入长度                     | number                  | -                                                         | -      |
| focus             | 是否自动聚焦                     | boolean                 | -                                                         | false  |
| confirmHold       | 是否保持键盘不收起               | boolean                 | -                                                         | false  |
| cursor            | 指定光标位置                     | number                  | -                                                         | -1     |
| confirmType       | 键盘右下角按钮类型               | string                  | send / search / next / go / done                          | done   |
| isError           | 是否错误状态                     | boolean                 | -                                                         | false  |
| clearable         | 是否显示清除按钮                 | boolean                 | -                                                         | true   |
| clearTrigger      | 清除按钮触发方式                 | string                  | focus / always                                            | focus  |
| formatter         | 格式化函数                       | (val: string) => string | -                                                         | -      |
| inputDebounce     | 输入防抖时间（ms）               | number                  | -                                                         | 0      |
| textAlign         | 文本对齐方式                     | string                  | left / right                                              | left   |
| adjustPosition    | 键盘弹起时是否自动上推页面       | boolean                 | -                                                         | true   |
| holdKeyboard      | 是否保持键盘不收起               | boolean                 | -                                                         | false  |
| cursorSpacing     | 光标与键盘间距                   | number                  | -                                                         | 0      |
| alwaysSystem      | (支付宝)是否强制使用系统键盘     | boolean                 | -                                                         | false  |
| enableNative      | (支付宝)是否启用原生组件         | boolean                 | -                                                         | true   |
| clearDisplay      | 删除按钮显示空间预留             | boolean                 | -                                                         | false  |

### Methods

| 方法名 | 说明                                             | 参数 | 返回值 |
| ------ | ------------------------------------------------ | ---- | ------ |
| focus  | 主动聚焦                                         | -    | void   |
| blur   | 主动失焦                                         | -    | void   |
| clear  | 清空内容（触发 input 和 update:modelValue 事件） | -    | void   |

### Events

| 事件名               | 说明                         | 回调参数                      |
| -------------------- | ---------------------------- | ----------------------------- |
| input                | 输入时触发                   | (value: string, event: Event) |
| focus                | 聚焦时触发                   | (event: Event)                |
| blur                 | 失焦时触发                   | (event: Event)                |
| confirm              | 点击确认按钮时触发           | (value: string, event: Event) |
| clear                | 点击清空按钮时触发           | ()                            |
| change               | 值变更时触发                 | (event: Event)                |
| click                | 点击输入框时触发             | (event: Event)                |
| keyboardHeightChange | 键盘高度变化时触发（小程序） | (height: number)              |

### Slots

| 插槽名 | 说明           |
| ------ | -------------- |
| left   | 输入框左侧内容 |
| right  | 输入框右侧内容 |

#### 常见问题

#### Q1: 清除按钮不显示？

**检查项：**

- 确保设置了 `clearable="true"`（默认值）
- `clear-trigger` 属性控制显示时机：
  - `focus`：聚焦时显示（默认）
  - `always`：始终显示

```html
<!-- 始终显示清除按钮 -->
<ky-input v-model="value" clearable clear-trigger="always" />
```

#### Q2: 如何处理输入防抖？

**使用 `inputDebounce` 属性：**

```html
<ky-input v-model="value" :input-debounce="400" />
```

**inputDebounce 注意事项：**

| 注意事项   | 说明                                                                   |
| ---------- | ---------------------------------------------------------------------- |
| 默认值     | 默认值为 `0`，表示不启用防抖                                           |
| 单位       | 时间单位为毫秒（ms）                                                   |
| 推荐值     | 搜索场景推荐 `300-500ms`，普通输入场景可设为 `0`                       |
| 性能优化   | 页面节点多、性能较差设备可适当提高数值（如 `500-800ms`），减少更新频率 |
| 小程序兼容 | 在小程序端同样生效，但性能可能略有差异，做好不同端的配置               |

#### Q3: 小程序端键盘遮挡输入框？

**解决方案：**

```html
<ky-input v-model="value" cursor-spacing="100" adjust-position />
```

| 属性              | 说明                         |
| ----------------- | ---------------------------- |
| `cursor-spacing`  | 光标与键盘的间距（单位：px） |
| `adjust-position` | 键盘弹起时自动上推页面       |

#### Q4: 如何获取输入框焦点状态？

**通过事件监听：**

```html
<ky-input v-model="value" @focus="isFocused = true" @blur="isFocused = false" />
```

**通过方法调用：**

```javascript
const inputRef = ref()

// 主动聚焦
inputRef.value?.focus()

// 主动失焦
inputRef.value?.blur()
```
