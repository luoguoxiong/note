# 小程序工具方法文档

Taro Api 多端兼容（微信小程序、高德/支付宝小程序、微信 App）的常用方法

## 安装

```bash
yarn add @kye-netc/plateform -S
```

## `getWindowInfo

### 说明

获取当前设备的窗口信息。

- 优先使用 `Taro.getWindowInfo`（字段更完整、精度更高）
- 如果当前基础库版本不支持，则使用 `Taro.getSystemInfoSync` 回退方案

### 返回值

`Taro.getWindowInfo.Result`  
包含屏幕尺寸、状态栏高度、安全区域等信息。

### 示例

```ts
import plateform from '@kye-netc/plateform'

const info = plateform.getWindowInfo()
console.log(info.windowWidth, info.windowHeight)
```

## `getMenuButtonBoundingClientRect`

### 说明

获取小程序胶囊按钮（右上角菜单按钮）的位置与尺寸。

- 优先使用 `Taro.getMenuButtonBoundingClientRect`
- 如果是 **高德小程序** 且 **Android 平台**，会自动将物理像素转换为逻辑像素
- 如果 API 不可用，则返回预设的默认值

### 返回值

`Taro.getMenuButtonBoundingClientRect.Rect`  
包含 `top`、`left`、`width`、`height` 等信息。

### 示例

```ts
import plateform from '@kye-netc/plateform'

const rect = plateform.getMenuButtonBoundingClientRect()
console.log(rect.top, rect.height)
```

## `openMiniProgram`

### 说明

打开目标小程序，自动适配 **微信 App** 与 **小程序** 环境。

- 微信 App 内：使用 `wx.miniapp.launchMiniProgram`
- 小程序内：使用 `Taro.navigateToMiniProgram`
- 内部会自动校验必填参数，缺少参数时会提示 `请检查参数`

### 参数

`params: OpenMiniProgramParmas`

| 参数名            | 类型                                | 必填                | 说明                                   | 取值示例                      |
| ----------------- | ----------------------------------- | ------------------- | -------------------------------------- | ----------------------------- |
| `userName`        | `string`                            | 是（微信 App 环境） | 小程序原始 ID                          | `"gh_xxxxxxx"`                |
| `path`            | `string`                            | 是                  | 跳转路径，可携带参数                   | `"pages/index/index?foo=bar"` |
| `miniprogramType` | `number`                            | 是（微信 App 环境） | 版本类型：0 正式版、1 开发版、2 体验版 | `0`                           |
| `appId`           | `string`                            | 是（小程序环境）    | 小程序 AppId                           | `"wx1234567890abcdef"`        |
| `envVersion`      | `'develop' \| 'trial' \| 'release'` | 是（小程序环境）    | 版本类型                               | `"release"`                   |

### 使用示例

```ts
import plateform from '@kye-netc/plateform'

plateform.openMiniProgram({
  userName: 'gh_xxxxxxx',
  path: 'pages/home/index',
  miniprogramType: 0, // 正式版
  appId: 'wx1234567890abcdef', // 兼容小程序环境
  envVersion: 'release'
})
```

## `scanCode`

### 说明

调用扫码功能，支持二维码和条形码。  

- 返回统一字段：`path`（小程序路径）和 `result`（二维码/条形码内容）  
- 已内置相机权限异常处理：在微信/高德/支付宝小程序中，若用户拒绝授权，会自动弹窗提示并引导去设置  

### 返回值

`Promise<{ path?: string; result?: string }>`  
包含扫码结果或小程序路径。  

### 示例

```ts
import plateform from '@kye-netc/plateform'

async function handleScan() {
  try {
    const res = await plateform.scanCode()
    if (res.path) {
      console.log('小程序路径:', res.path)
    } else if (res.result) {
      console.log('扫描结果:', res.result)
    }
  } catch (err) {
    console.error('扫码失败:', err)
  }
}
```

## `saveImageToPhotosAlbum`

### 说明

将图片保存到系统相册。

- 在高德小程序中，直接调用 `my.saveImage` 方法。
- 在其他平台（如微信小程序、支付宝小程序等），先下载图片到本地临时文件，再调用 `Taro.saveImageToPhotosAlbum` 保存到相册。

### 参数

`imgUrl: string`  
需要保存的图片 URL。

### 返回值

`Promise<void>`  
保存成功时返回 `Promise.resolve`，失败时返回 `Promise.reject`。

### 示例

```ts
import plateform from '@kye-netc/plateform'

async function saveImage() {
  try {
    await plateform.saveImageToPhotosAlbum('https://example.com/image.jpg')
    console.log('图片保存成功')
  } catch (err) {
    console.error('图片保存失败:', err)
  }
}
```

## `chooseMedia(params)`

### 说明

选择媒体文件（图片或视频）。

- **高德小程序、支付宝小程序**：仅支持选择图片（调用 `Taro.chooseImage`），不支持视频。如果传入 `mediaType` 包含 `'video'`，会打印错误日志。
- **其他平台**（如微信小程等）：支持选择图片和视频（调用 `Taro.chooseMedia`）。

### 参数

`params: ChooseMediaParmas`

| 参数名         | 类型                          | 必填 | 说明                                                                 | 取值示例                     |
| -------------- | ----------------------------- | ---- | -------------------------------------------------------------------- | ---------------------------- |
| `count`        | `number`                      | 否   | 最多可以选择的文件数量，默认值为 `1`                                 | `1`                          |
| `sizeType`     | `string[]`                    | 否   | 文件类型，可选值为 `['original', 'compressed']`，默认值为两者        | `['original', 'compressed']` |
| `mediaType`    | `('image' \| 'video')[]`      | 否   | 媒体类型，可选值为 `['image', 'video']`，默认值为两者               | `['image', 'video']`         |
| `sourceType`   | `('album' \| 'camera')[]`     | 否   | 来源类型，可选值为 `['album', 'camera']`，默认值为两者               | `['album', 'camera']`         |
| `maxDuration`  | `number`                      | 否   | 视频的最大录制时长（单位：秒），默认值为 `30`                         | `30`                         |

### 返回值

`Promise<Taro.chooseMedia.SuccessCallbackResult>`  
返回选择的媒体文件信息，包含以下字段：
- `tempFiles`: 临时文件列表（路径、大小等）。
- `type`: 媒体类型（`'image'` 或 `'video'`）。
- `errMsg`: 调用结果信息。

### 示例

```ts
import plateform from '@kye-netc/plateform'

async function chooseMedia() {
  try {
    const result = await plateform.chooseMedia({
      count: 1,
      sizeType: ['original', 'compressed'],
      mediaType: ['image', 'video'],
      sourceType: ['album', 'camera'],
      maxDuration: 30,
    })
    console.log('选择的文件:', result.tempFiles)
  } catch (err) {
    console.error('选择失败:', err)
  }
}
    console.log('媒体选择成功')
  } catch (err) {
    console.error('媒体选择失败:', err)
  }
}
```

---


## `makePhoneCall(phoneNumber)`

### 说明

调用系统拨号功能，拨打电话号码。

### 参数

`phoneNumber: string`  
需要拨打的电话号码。

### 示例

```ts
import plateform from '@kye-netc/plateform'

async function callPhone() {
  try {
    await plateform.makePhoneCall({phoneNumber:'13232323232'})
    console.log('拨号成功')
  } catch (err) {
    console.error('拨号失败:', err)
  }
}
```

---


## 平台适配说明（可选参考）

| 方法                              | 微信小程序             | 微信 App | 高德小程序                     | 支付宝小程序         |
| --------------------------------- | ---------------------- | -------- | ------------------------------ | -------------------- |
| `getWindowInfo`                   | ✅ 支持                 | ✅ 支持   | ✅ 支持                         | ✅ 支持               |
| `getMenuButtonBoundingClientRect` | ✅ 支持                 | ✅ 支持   | ✅ 支持（Android 需像素比转换） | ✅ 支持               |
| `openMiniProgram`                 | ✅ 支持                 | ✅ 支持   | ⚠️ 不可用                       | ⚠️ 不可用             |
| `scanCode`                        | ✅ 支持                 | ✅ 支持   | ✅ 支持（含权限引导）           | ✅ 支持（含权限引导） |
| `saveImageToPhotosAlbum`          | ✅ 支持                 | ✅ 支持   | ✅ 支持                         | ✅ 支持               |
| `chooseMedia`                     | ✅ 支持                 | ✅ 支持   | ✅ 支持（不支持上传视频）       | ✅ 支持               |
| `makePhoneCall`                   | ✅ 支持（不支持企微PC） | ✅ 支持   | ✅ 支持（不支持上传视频）       | ✅ 支持               |

