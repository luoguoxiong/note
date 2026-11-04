<template>
  <view class="image-preview-demo demo-container">
    <view class="demo-header">
      <view class="header-title">ImagePreview 图片预览</view>
      <view class="header-subtitle">图片预览组件的各种用法示例</view>
    </view>

    <view class="demo-content">
      <view class="card">
        <view class="card-header">
          <view class="card-icon">📷</view>
          <view class="card-title">组件式调用</view>
        </view>
        <view class="card-body">
          <view class="demo-item">
            <view class="demo-label">基础用法</view>
            <view class="preview-images">
              <image
                v-for="(item, index) in images1"
                :key="index"
                :src="item.src"
                class="preview-img"
                @click="openComponentPreview(index)"
              />
            </view>
            <ky-button type="primary" size="small" @click="showComponentPreview = true">打开预览</ky-button>
          </view>
          <view class="demo-item">
            <view class="demo-label">指定初始索引</view>
            <ky-button type="default" size="small" @click="openComponentPreviewWithIndex">从第2张开始</ky-button>
          </view>
        </view>
      </view>

      <view class="card">
        <view class="card-header">
          <view class="card-icon">⚡</view>
          <view class="card-title">函数式调用</view>
        </view>
        <view class="card-body">
          <view class="demo-item">
            <view class="demo-label">快捷预览</view>
            <view class="preview-images">
              <image
                v-for="(item, index) in images2"
                :key="index"
                :src="item.src"
                class="preview-img"
                @click="openFunctionPreview(index)"
              />
            </view>
            <ky-button type="primary" size="small" @click="openFunctionPreview(0)">打开预览</ky-button>
          </view>
          <view class="demo-item">
            <view class="demo-label">开启长按菜单</view>
            <ky-button type="default" size="small" @click="openFunctionPreviewWithMenu">支持长按菜单</ky-button>
          </view>
        </view>
      </view>

      <view class="card">
        <view class="card-header">
          <view class="card-icon">🔢</view>
          <view class="card-title">索引显示</view>
        </view>
        <view class="card-body">
          <view class="demo-item">
            <view class="demo-label">显示索引（默认）</view>
            <ky-button type="primary" size="small" @click="showIndexPreview = true">显示索引</ky-button>
          </view>
          <view class="demo-item">
            <view class="demo-label">隐藏索引</view>
            <ky-button type="default" size="small" @click="hideIndexPreview = true">隐藏索引</ky-button>
          </view>
        </view>
      </view>

      <view class="card">
        <view class="card-header">
          <view class="card-icon">◀️▶️</view>
          <view class="card-title">分页导航</view>
        </view>
        <view class="card-body">
          <view class="demo-item">
            <view class="demo-label">显示分页按钮（默认）</view>
            <ky-button type="primary" size="small" @click="showPaginationPreview = true">显示分页</ky-button>
          </view>
          <view class="demo-item">
            <view class="demo-label">隐藏分页按钮</view>
            <ky-button type="default" size="small" @click="hidePaginationPreview = true">隐藏分页</ky-button>
          </view>
        </view>
      </view>

      <view class="card">
        <view class="card-header">
          <view class="card-icon">✕</view>
          <view class="card-title">关闭按钮</view>
        </view>
        <view class="card-body">
          <view class="demo-item">
            <view class="demo-label">显示关闭按钮（默认）</view>
            <ky-button type="primary" size="small" @click="showClosePreview = true">显示关闭按钮</ky-button>
          </view>
          <view class="demo-item">
            <view class="demo-label">隐藏关闭按钮</view>
            <ky-button type="default" size="small" @click="hideClosePreview = true">隐藏关闭按钮</ky-button>
          </view>
        </view>
      </view>

      <view class="card">
        <view class="card-header">
          <view class="card-icon">👆</view>
          <view class="card-title">点击关闭</view>
        </view>
        <view class="card-body">
          <view class="demo-item">
            <view class="demo-label">点击遮罩关闭（默认）</view>
            <ky-button type="primary" size="small" @click="clickOverlayPreview = true">点击遮罩关闭</ky-button>
          </view>
          <view class="demo-item">
            <view class="demo-label">禁止点击关闭</view>
            <ky-button type="default" size="small" @click="disableClickClosePreview = true">禁止点击关闭</ky-button>
          </view>
        </view>
      </view>

      <view class="card">
        <view class="card-header">
          <view class="card-icon">🎨</view>
          <view class="card-title">自定义底部操作</view>
        </view>
        <view class="card-body">
          <view class="demo-item">
            <view class="demo-label">自定义操作按钮</view>
            <ky-button type="primary" size="small" @click="customCoverPreview = true">自定义操作</ky-button>
          </view>
        </view>
      </view>

      <view class="card">
        <view class="card-header">
          <view class="card-icon">🖼️</view>
          <view class="card-title">交互功能</view>
        </view>
        <view class="card-body">
          <view class="demo-item">
            <view class="demo-label">缩放与旋转</view>
            <view class="preview-images">
              <image
                v-for="(item, index) in images3"
                :key="index"
                :src="item.src"
                class="preview-img"
                @click="openInteractionPreview(index)"
              />
            </view>
            <ky-button type="primary" size="small" @click="openInteractionPreview(0)">体验交互</ky-button>
          </view>
        </view>
      </view>
    </view>

    <ky-image-preview
      v-model:show="showComponentPreview"
      :images="images1"
      :activeIndex="componentActiveIndex"
      @change="handleChange"
      @close="handleClose"
    />

    <ky-image-preview
      v-model:show="showIndexPreview"
      :images="images1"
      :showIndex="true"
    />

    <ky-image-preview
      v-model:show="hideIndexPreview"
      :images="images1"
      :showIndex="false"
    />

    <ky-image-preview
      v-model:show="showPaginationPreview"
      :images="images1"
      :showPagination="true"
    />

    <ky-image-preview
      v-model:show="hidePaginationPreview"
      :images="images1"
      :showPagination="false"
    />

    <ky-image-preview
      v-model:show="showClosePreview"
      :images="images1"
      :closeable="true"
    />

    <ky-image-preview
      v-model:show="hideClosePreview"
      :images="images1"
      :closeable="false"
    />

    <ky-image-preview
      v-model:show="clickOverlayPreview"
      :images="images1"
      :closeOnClickOverlay="true"
    />

    <ky-image-preview
      v-model:show="disableClickClosePreview"
      :images="images1"
      :closeOnClickOverlay="false"
      :contentClose="false"
    />

    <ky-image-preview
      v-model:show="customCoverPreview"
      :images="images1"
    >
      <template #cover>
        <view class="custom-cover">
          <view class="custom-btn" @click="handleFavorite">❤️ 收藏</view>
          <view class="custom-btn" @click="handleShare">📤 分享</view>
          <view class="custom-btn" @click="handleDownload">⬇️ 下载</view>
        </view>
      </template>
    </ky-image-preview>

    <ky-image-preview
      v-model:show="interactionPreview"
      :images="images3"
      :activeIndex="interactionActiveIndex"
    />
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { showImagePreview } from '@ky-miniui-lib/ky-miniui-lib'
import '../index.scss'

const showComponentPreview = ref(false)
const componentActiveIndex = ref(0)
const showIndexPreview = ref(false)
const hideIndexPreview = ref(false)
const showPaginationPreview = ref(false)
const hidePaginationPreview = ref(false)
const showClosePreview = ref(false)
const hideClosePreview = ref(false)
const clickOverlayPreview = ref(false)
const disableClickClosePreview = ref(false)
const customCoverPreview = ref(false)
const interactionPreview = ref(false)
const interactionActiveIndex = ref(0)

const images1 = [
  { src: 'https://ic-img.ky-express.com/netc/20231024_72521882342_!!1698130770203_1500_2728.png' },
  { src: 'https://ic-img.ky-express.com/netc/20231024_44121882373_!!1698130770197_1500_2728.png' },
  { src: 'https://ic-img.ky-express.com/netc/20250116_72772831110_!!1737016326567_1500_660.png' },
]

const images2 = [
  { src: 'https://ic-img.ky-express.com/netc/20230920_61121882377_!!1695201540869_1340_280.png' },
  { src: 'https://ic-img.ky-express.com/netc/20230425_80121882365_!!1682405524871_1101_661.png' },
  { src: 'https://ic-img.ky-express.com/netc/20250305_29521882329_!!1741146778352_2562_1229.png' },
]

const images3 = [
  { src: 'https://ic-img.ky-express.com/netc/20250722_90028_!!1753174065640_168_168.png' },
  { src: 'https://ic-img.ky-express.com/netc/20250619_78976_!!1750323119391_24_24.png' },
]

const openComponentPreview = (index: number) => {
  componentActiveIndex.value = index
  showComponentPreview.value = true
}

const openComponentPreviewWithIndex = () => {
  componentActiveIndex.value = 1
  showComponentPreview.value = true
}

const openFunctionPreview = (index: number) => {
  showImagePreview({
    parentClassName: 'image-preview-demo',
    images: images2,
    activeIndex: index,
  })
}

const openFunctionPreviewWithMenu = () => {
  showImagePreview({
    parentClassName: 'image-preview-demo',
    images: images2,
    activeIndex: 0,
    showMenuByLongpress: true,
  })
}

const openInteractionPreview = (index: number) => {
  interactionActiveIndex.value = index
  interactionPreview.value = true
}

const handleChange = (index: number) => {
  console.log('当前图片索引:', index)
}

const handleClose = () => {
  console.log('预览已关闭')
}

const handleFavorite = () => {
  console.log('收藏图片')
}

const handleShare = () => {
  console.log('分享图片')
}

const handleDownload = () => {
  console.log('下载图片')
}
</script>

<style lang="scss">
.image-preview-demo {
  .preview-images {
    display: flex;
    gap: 16rpx;
    margin-bottom: 16rpx;
  }

  .preview-img {
    width: 120rpx;
    height: 120rpx;
    border-radius: 8rpx;
    object-fit: cover;
    border: 2rpx solid #f0f0f0;
  }

  .custom-cover {
    display: flex;
    gap: 24rpx;
  }

  .custom-btn {
    font-size: 24rpx;
    color: #fff;
    padding: 12rpx 24rpx;
    background: rgba(0, 0, 0, 0.5);
    border-radius: 8rpx;
  }
}
</style>