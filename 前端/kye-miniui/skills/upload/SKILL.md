---
name: "upload"
description: "上传组件，支持文件上传和预览。当需要文件上传带预览和验证时调用。"
---

# Upload 上传

上传组件，用于文件上传，支持 picture / list 两种展示样式，H5 与小程序多端适配。

## 何时使用

- 文件上传
- 图片上传
- 文档上传
- 多文件上传

## 组件路径

- 源码: `packages/__components/upload/src/uploader.vue`
- H5 钩子: `packages/__components/upload/src/useH5Upload.ts`
- 类型: `packages/__components/upload/src/types.ts`

## Props 入参

| 参数 | 类型 | 默认值 | 说明 |
| ---- | ---- | ------- | ----------- |
| name | string | 'file' | 上传字段名 |
| sourceType | Array<'album' \| 'camera'> | ['album', 'camera'] | 来源类型 |
| fileList | any[] | [] | 文件列表（已废弃，建议用 modelValue） |
| modelValue | any[] | [] | 绑定值 |
| listType | 'picture' \| 'list' | 'picture' | 列表类型 |
| accept | string | 'image/*' | 接受的文件类型（H5 用） |
| beforeRead | (files: File[]) => Promise<File[]> | - | 读取文件前拦截 |
| afterRead | () => void | - | 读取文件后回调 |
| beforeDelete | () => void | - | 删除前回调 |
| maxSize | number \| string | - | 单个文件最大尺寸（结合 maximize 内部使用） |
| maxCount | number | 1 | 最大文件数量 |
| multiple | boolean | false | 是否允许多选（安卓部分机型不支持） |
| disabled | boolean | false | 是否禁用 |
| deletable | boolean | true | 是否显示删除按钮 |
| capture | boolean | false | 是否允许使用摄像头 |
| mode | string | 'aspectFit' | 图片裁剪模式（仅小程序支持） |
| data | object | {} | 上传附加数据 |

> 注意：SKILL 早期文档中列出的 `isPreview`、`mediaType`、`sizeType`、`maxDuration`、`camera` 等属性未在 `UploadProps` 类型中声明，实际代码中虽然被引用，但属于内部透传给 `Taro.chooseMedia` 的参数，**不应作为对外 API 使用**。如需控制媒体类型等，请通过 `accept`、`sourceType`、`capture` 等已声明属性配置。

## FileItem 类型

```typescript
class FileItem {
  status: FileItemStatus         // 状态：ready/uploading/success/error
  message: string                // 提示信息
  uid: string                    // 唯一标识（默认时间戳）
  name?: string                  // 文件名
  url?: string                   // 文件 URL
  type?: string                  // 文件类型
  path?: string                  // 文件路径
  base64?: string                // Base64 数据
  originalFileObj?: any          // 原始文件对象
  percentage: string | number    // 上传进度
  formData: any                  // 表单数据
  content?: any                  // 文件内容（H5）
}

type FileItemStatus = 'ready' | 'uploading' | 'success' | 'error'
```

## Events 事件

| 事件名 | 说明 | 回调参数 |
| ---- | ---- | ---- |
| update:modelValue | 值变化时触发 | (fileList: FileItem[]) |
| update:fileList | 文件列表变化时触发（clearUploadQueue 调用） | (fileList: FileItem[]) |
| change | 文件变化时触发 | ({ fileList, event? }) |
| oversize | 文件超出大小限制时触发 | (files: File[]) |
| delete | 删除文件时触发 | ({ file, fileList, index }) |
| click-upload | 点击文件项时触发 | ({ fileItem }) |
| failure | 选择/上传失败时触发 | (res: any) |

## Slots 插槽

| 插槽名 | 说明 |
| ---- | ---- |
| default | 自定义上传区域（使用后会替换默认上传按钮） |
| preview | 自定义整个预览列表 |
| upload-icon | 自定义上传图标 |
| delete-icon | 自定义删除图标 |

## 使用示例

```vue
<template>
  <ky-upload
    v-model="fileList"
    :max-count="3"
    :max-size="5 * 1024 * 1024"
    multiple
    @oversize="onOversize"
    @delete="onDelete"
  />
</template>

<script setup>
const fileList = ref([])

const onOversize = (files) => {
  console.log('文件超出大小限制', files)
}

const onDelete = ({ file, index }) => {
  console.log('删除文件:', file.name)
}
</script>
```
