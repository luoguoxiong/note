---
name: native-capability
description: 指导在小程序项目中使用原生能力，包括支付、导航、原生插件等功能的调用与封装。当需要调用小程序原生 API 时使用本技能。
---

# 原生能力

## 使用场景

当你需要：
- 调用小程序的 **原生 API**（支付、分享、定位等）
- 使用 **原生插件** 功能
- 进行 **页面导航** 和路由跳转
- 处理 **平台差异** 的原生能力

请使用本技能，并遵守项目的原生能力使用规范。

---

## 使用步骤

### 步骤 1：了解原生能力模块

项目在 `@public/utils/native/` 下封装了原生 API 桥接：

```
@public/utils/native/
├── index.ts              # 统一入口
├── navigate/             # 导航相关
├── wxNative.ts           # 微信原生桥接
├── aliPayNative.ts       # 支付宝原生桥接
└── webNative.ts          # H5 原生桥接
```

### 步骤 2：页面导航

使用 Taro API 进行页面跳转：

```typescript
import Taro from '@tarojs/taro'

const navigateToDetail = () => {
  Taro.navigateTo({
    url: '/modules/order/pages/order-detail/index?id=123'
  })
}

const switchToHome = () => {
  Taro.switchTab({
    url: '/layout/pages/home/index'
  })
}

const goBack = () => {
  Taro.navigateBack({
    delta: 1
  })
}

const redirectToLogin = () => {
  Taro.redirectTo({
    url: '/modules/user/pages/login/index'
  })
}

const reLaunch = () => {
  Taro.reLaunch({
    url: '/layout/pages/home/index'
  })
}
```

**导航 API 说明：**
- `navigateTo`：保留当前页面，跳转到新页面（可返回）
- `redirectTo`：关闭当前页面，跳转到新页面（不可返回）
- `switchTab`：跳转到 tabBar 页面，并关闭其他非 tabBar 页面
- `navigateBack`：返回上一页或多级页面
- `reLaunch`：关闭所有页面，打开到应用内的某个页面

### 步骤 3：支付功能

使用封装的支付函数：

```typescript
import { wxPay, aliPay } from '@public/utils/appPay'
import { isWxAppEnv, isAmapMiniApp } from '@public/utils'

const handlePay = async (orderId: string) => {
  try {
    if (isWxAppEnv) {
      await wxPay({ orderId })
      console.log('微信支付成功')
    } else if (isAmapMiniApp) {
      await aliPay({ orderId })
      console.log('支付宝支付成功')
    }
  } catch (error) {
    console.error('支付失败', error)
    Taro.showToast({
      title: '支付失败',
      icon: 'none',
    })
  }
}
```

### 步骤 4：其他原生能力

**获取位置信息：**

```typescript
import Taro from '@tarojs/taro'

const getLocation = async () => {
  try {
    const res = await Taro.getLocation({
      type: 'wgs84',
    })
    console.log('位置信息', res.latitude, res.longitude)
  } catch (error) {
    console.error('获取位置失败', error)
  }
}
```

**选择图片：**

```typescript
import Taro from '@tarojs/taro'

const chooseImage = async () => {
  try {
    const res = await Taro.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
    })
    console.log('选择的图片', res.tempFilePaths)
  } catch (error) {
    console.error('选择图片失败', error)
  }
}
```

**扫码：**

```typescript
import Taro from '@tarojs/taro'

const scanCode = async () => {
  try {
    const res = await Taro.scanCode({
      scanType: ['qrCode', 'barCode'],
    })
    console.log('扫码结果', res.result)
  } catch (error) {
    console.error('扫码失败', error)
  }
}
```

**分享：**

```typescript
import Taro from '@tarojs/taro'

const shareToFriend = () => {
  Taro.showShareMenu({
    withShareTicket: true,
  })
}

onShareAppMessage(() => {
  return {
    title: '分享标题',
    path: '/modules/order/pages/order-detail/index?id=123',
    imageUrl: 'https://example.com/share.jpg',
  }
})
```

### 步骤 5：使用原生插件

项目在 `@public/appPlugins/` 下管理原生插件：

```
@public/appPlugins/
├── pay/           # 支付插件（含 iOS 平台适配）
├── push/          # 推送插件（含 iOS 平台适配）
├── version/       # 版本管理
└── utils/         # 通用工具
```

使用示例：

```typescript
import { checkUpdate } from '@public/appPlugins/version'

const handleCheckUpdate = async () => {
  try {
    const hasUpdate = await checkUpdate()
    if (hasUpdate) {
      Taro.showModal({
        title: '发现新版本',
        content: '是否立即更新？',
        success: (res) => {
          if (res.confirm) {
            console.log('用户确认更新')
          }
        },
      })
    }
  } catch (error) {
    console.error('检查更新失败', error)
  }
}
```

---

## 注意事项

1. **使用 Taro API**
   - 优先使用 Taro 提供的跨平台 API
   - 避免直接使用 `wx.xxx` 或 `my.xxx`
   - Taro API 会自动处理平台差异

2. **导航路径**
   - 路径使用相对路径，不要以 `/` 开头
   - tabBar 页面必须使用 `switchTab` 跳转
   - 页面路径必须在配置文件中注册

3. **权限申请**
   - 涉及用户隐私的功能（位置、相册、相机）需先获取授权
   - 使用 `Taro.authorize` 或 `Taro.getSetting` 检查权限
   - 权限被拒绝时引导用户到设置页面

4. **错误处理**
   - 所有原生 API 调用必须使用 try-catch 包裹
   - 错误信息应友好地提示给用户
   - 关键功能失败时提供降级方案

5. **平台差异**
   - 不同平台的原生 API 可能有差异
   - 使用封装层统一处理平台差异
   - 平台特有功能需要做好降级处理

6. **真机测试**
   - 原生能力必须在真机上测试验证
   - 开发者工具的模拟可能与真机不一致
   - 关注 iOS 和 Android 的差异

---

## 快速检查清单

- [ ] 是否使用 Taro API 而非平台原生 API？
- [ ] 导航跳转是否使用了正确的 API（navigateTo/switchTab 等）？
- [ ] 是否为涉及隐私的功能申请了权限？
- [ ] 是否使用 try-catch 处理原生 API 调用的异常？
- [ ] 是否在真机上测试了原生功能？
- [ ] 平台特有功能是否做了降级处理？
- [ ] 是否避免使用浏览器专有 API（如 window.location）？
