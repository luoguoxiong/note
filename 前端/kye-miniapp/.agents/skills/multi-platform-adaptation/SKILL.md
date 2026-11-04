---
name: multi-platform-adaptation
description: 指导在 Taro 项目中进行微信、支付宝、H5 多端适配开发，包括平台判断、API 差异处理与样式适配。当需要处理多端兼容性时使用本技能。
---

# 多端适配

## 使用场景

当你需要：
- 开发 **跨平台小程序**（微信/支付宝/H5）
- 处理 **平台差异** 的 API 或功能
- 进行 **条件编译** 或平台判断
- 适配不同平台的 **样式和交互**

请使用本技能，并遵守项目的多端适配规范。

---

## 使用步骤

### 步骤 1：平台判断

使用环境变量或工具函数判断当前运行平台：

```typescript
import { isWxAppEnv, isH5Env, isAmapMiniApp } from '@public/utils'

if (isWxAppEnv) {
  console.log('当前是微信小程序')
} else if (isAmapMiniApp) {
  console.log('当前是支付宝小程序')
} else if (isH5Env) {
  console.log('当前是 H5')
}
```

**条件编译（编译时判断）：**

```typescript
if (process.env.TARO_ENV === 'weapp') {
  // 微信小程序特有逻辑
} else if (process.env.TARO_ENV === 'alipay') {
  // 支付宝小程序特有逻辑
} else if (process.env.TARO_ENV === 'h5') {
  // H5 特有逻辑
}
```

**区别：**
- `process.env.TARO_ENV`：编译时判断，不同平台会打包不同的代码
- `isWxAppEnv` 等：运行时判断，所有平台代码都会打包

### 步骤 2：路由注册

**重要：新增页面必须同时在微信和支付宝配置文件中注册**

在 `wx.config.ts` 中注册：
```typescript
export default defineAppConfig({
  pages: [
    'layout/pages/home/index',
    'modules/order/pages/order-list/index',
  ],
})
```

在 `alipay.config.ts` 中注册：
```typescript
export default defineAppConfig({
  pages: [
    'layout/pages/home/index',
    'modules/order/pages/order-list/index',
  ],
})
```

### 步骤 3：处理 API 差异

不同平台的原生 API 存在差异，需要进行适配：

| 功能 | 微信 | 支付宝 | H5 |
|------|------|--------|-----|
| 登录 | wx.login | my.getAuthCode | 无 |
| 支付 | wx.requestPayment | my.tradePay | 跳转 |
| 位置 | wx.getLocation | my.getLocation | 浏览器 API |
| 扫码 | wx.scanCode | my.scan | 无 |

**使用 Taro API 统一处理：**

```typescript
import Taro from '@tarojs/taro'

const getLocation = async () => {
  try {
    const res = await Taro.getLocation({
      type: 'wgs84',
    })
    console.log('位置信息', res)
  } catch (error) {
    console.error('获取位置失败', error)
  }
}
```

**平台特有功能封装：**

```typescript
// @public/utils/native/
import { isWxAppEnv, isAmapMiniApp } from '@public/utils'

export const scanCode = async () => {
  if (isWxAppEnv) {
    return wx.scanCode()
  } else if (isAmapMiniApp) {
    return my.scan()
  } else {
    throw new Error('H5 不支持扫码')
  }
}
```

### 步骤 4：样式适配

**单位适配：**
- 小程序使用 `rpx` 单位（750 设计稿基准）
- H5 使用 `px` 单位
- Taro 会自动转换，统一使用 `rpx` 即可

```scss
.container {
  padding: 32rpx;
  font-size: 28rpx;
}
```

**平台特定样式：**

```scss
.button {
  padding: 20rpx 40rpx;
  
  // 微信小程序特定样式
  @media (--weapp) {
    border-radius: 8rpx;
  }
  
  // 支付宝小程序特定样式
  @media (--alipay) {
    border-radius: 12rpx;
  }
}
```

---

## 注意事项

1. **路由注册**
   - 新增页面必须同时在 `wx.config.ts` 和 `alipay.config.ts` 注册
   - 两个配置文件的页面路径必须保持一致
   - 忘记注册会导致某个平台无法访问该页面

2. **API 使用**
   - 优先使用 Taro 提供的跨平台 API
   - 避免直接使用 `wx.xxx` 或 `my.xxx`
   - 平台特有功能需要封装并做好降级处理

3. **导航跳转**
   - 禁止使用 `window.location` 等浏览器 API
   - 使用 Taro.navigateTo / Taro.redirectTo / Taro.switchTab
   - 路径使用相对路径，不要以 `/` 开头

4. **样式单位**
   - 统一使用 `rpx`，Taro 会自动转换为对应平台的单位
   - 固定尺寸（如 1px 边框）可以使用 `px`

5. **平台差异测试**
   - 开发时在微信开发者工具和支付宝开发者工具中都要测试
   - 关键功能需要在真机上验证
   - H5 需要在不同浏览器中测试

6. **条件编译优化**
   - 使用 `process.env.TARO_ENV` 进行条件编译可以减小包体积
   - 运行时判断会将所有平台代码都打包进去

---

## 快速检查清单

- [ ] 新增页面是否同时在 wx.config.ts 和 alipay.config.ts 中注册？
- [ ] 是否使用 Taro API 而非平台原生 API？
- [ ] 导航跳转是否使用 Taro.navigateTo 等方法？
- [ ] 样式是否统一使用 rpx 单位？
- [ ] 平台特有功能是否做了降级处理？
- [ ] 是否在多个平台的开发者工具中测试过？
- [ ] 是否避免使用浏览器专有 API（如 window.location）？
