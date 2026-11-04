<template>
  <view class="swiper-demo demo-container">
    <view class="demo-header">
      <view class="header-title">Swiper 轮播</view>
      <view class="header-subtitle">支持横向/纵向滚动，可自定义分页指示器</view>
    </view>

    <view class="demo-content">
      <view class="card">
        <view class="card-header">
          <view class="card-icon">🎠</view>
          <view class="card-title">基本使用</view>
        </view>
        <view class="card-body">
          <view class="demo-item">
            <view class="demo-label">横向轮播（默认）</view>
            <ky-swiper :init-page="0" :auto-play="3000" pagination-visible>
              <ky-swiper-item v-for="(item, index) in imageList" :key="index">
                <img :src="item" style="width: 100%; height: 200px" draggable="false" />
              </ky-swiper-item>
            </ky-swiper>
          </view>
        </view>
      </view>

      <view class="card">
        <view class="card-header">
          <view class="card-icon">📐</view>
          <view class="card-title">滚动方向</view>
        </view>
        <view class="card-body">
          <view class="demo-item">
            <view class="demo-label">纵向滚动</view>
            <ky-swiper :init-page="0" :auto-play="3000" direction="vertical" pagination-visible style="height: 200px">
              <ky-swiper-item v-for="(item, index) in imageList" :key="index">
                <img :src="item" style="width: 100%; height: 200px" draggable="false" />
              </ky-swiper-item>
            </ky-swiper>
          </view>
        </view>
      </view>

      <view class="card">
        <view class="card-header">
          <view class="card-icon">🎨</view>
          <view class="card-title">自定义分页指示器</view>
        </view>
        <view class="card-body">
          <view class="demo-item">
            <view class="demo-label">自定义颜色</view>
            <ky-swiper
              :init-page="0"
              :auto-play="3000"
              pagination-visible
              pagination-color="#ff5500"
              pagination-unselected-color="#cccccc">
              <ky-swiper-item v-for="(item, index) in imageList" :key="index">
                <img :src="item" style="width: 100%; height: 200px" draggable="false" />
              </ky-swiper-item>
            </ky-swiper>
          </view>
          <view class="demo-item">
            <view class="demo-label">自定义偏移量</view>
            <ky-swiper
              :init-page="0"
              :auto-play="3000"
              pagination-visible
              :pagination-offset="24">
              <ky-swiper-item v-for="(item, index) in imageList" :key="index">
                <img :src="item" style="width: 100%; height: 200px" draggable="false" />
              </ky-swiper-item>
            </ky-swiper>
          </view>
        </view>
      </view>

      <view class="card">
        <view class="card-header">
          <view class="card-icon">⏸️</view>
          <view class="card-title">自动播放</view>
        </view>
        <view class="card-body">
          <view class="demo-item">
            <view class="demo-label">关闭自动播放</view>
            <ky-swiper :init-page="0" pagination-visible>
              <ky-swiper-item v-for="(item, index) in imageList" :key="index">
                <img :src="item" style="width: 100%; height: 200px" draggable="false" />
              </ky-swiper-item>
            </ky-swiper>
          </view>
          <view class="demo-item">
            <view class="demo-label">自定义动画时长（2000ms）</view>
            <ky-swiper :init-page="0" :auto-play="3000" :duration="2000" pagination-visible>
              <ky-swiper-item v-for="(item, index) in imageList" :key="index">
                <img :src="item" style="width: 100%; height: 200px" draggable="false" />
              </ky-swiper-item>
            </ky-swiper>
          </view>
        </view>
      </view>

      <view class="card">
        <view class="card-header">
          <view class="card-icon">🔄</view>
          <view class="card-title">循环播放</view>
        </view>
        <view class="card-body">
          <view class="demo-item">
            <view class="demo-label">关闭循环播放</view>
            <ky-swiper :init-page="0" :auto-play="3000" :loop="false" pagination-visible>
              <ky-swiper-item v-for="(item, index) in imageList" :key="index">
                <img :src="item" style="width: 100%; height: 200px" draggable="false" />
              </ky-swiper-item>
            </ky-swiper>
          </view>
        </view>
      </view>

      <view class="card">
        <view class="card-header">
          <view class="card-icon">👆</view>
          <view class="card-title">触摸交互</view>
        </view>
        <view class="card-body">
          <view class="demo-item">
            <view class="demo-label">禁用触摸滑动</view>
            <ky-swiper :init-page="0" :auto-play="3000" :touchable="false" pagination-visible>
              <ky-swiper-item v-for="(item, index) in imageList" :key="index">
                <img :src="item" style="width: 100%; height: 200px" draggable="false" />
              </ky-swiper-item>
            </ky-swiper>
          </view>
        </view>
      </view>

      <view class="card">
        <view class="card-header">
          <view class="card-icon">📱</view>
          <view class="card-title">初始页码</view>
        </view>
        <view class="card-body">
          <view class="demo-item">
            <view class="demo-label">从第二页开始</view>
            <ky-swiper :init-page="1" :auto-play="3000" pagination-visible>
              <ky-swiper-item v-for="(item, index) in imageList" :key="index">
                <img :src="item" style="width: 100%; height: 200px" draggable="false" />
              </ky-swiper-item>
            </ky-swiper>
          </view>
        </view>
      </view>

      <view class="card">
        <view class="card-header">
          <view class="card-icon">🎮</view>
          <view class="card-title">方法调用</view>
        </view>
        <view class="card-body">
          <view class="demo-item">
            <view class="demo-label">点击按钮控制</view>
            <ky-swiper ref="swiperRef" :init-page="0" :auto-play="0" pagination-visible>
              <ky-swiper-item v-for="(item, index) in imageList" :key="index">
                <img :src="item" style="width: 100%; height: 200px" draggable="false" />
              </ky-swiper-item>
            </ky-swiper>
            <view class="action-buttons">
              <ky-button type="primary" size="mini" @click="handlePrev">上一页</ky-button>
              <ky-button type="default" size="mini" @click="handleTo(0)">跳转到1</ky-button>
              <ky-button type="default" size="mini" @click="handleTo(1)">跳转到2</ky-button>
              <ky-button type="danger" size="mini" @click="handleNext">下一页</ky-button>
            </view>
          </view>
        </view>
      </view>

      <view class="card">
        <view class="card-header">
          <view class="card-icon">✨</view>
          <view class="card-title">自定义内容</view>
        </view>
        <view class="card-body">
          <view class="demo-item">
            <view class="demo-label">轮播卡片</view>
            <ky-swiper :init-page="0" :auto-play="3000" pagination-visible>
              <ky-swiper-item v-for="(item, index) in cardList" :key="index">
                <view class="swiper-card" :style="{ backgroundColor: item.color }">
                  <view class="card-text">{{ item.title }}</view>
                  <view class="card-desc">{{ item.desc }}</view>
                </view>
              </ky-swiper-item>
            </ky-swiper>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import '../index.scss'

const swiperRef = ref<any>(null)

const imageList = ref([
  'https://ic-img.ky-express.com/netc/20250116_60672831183_!!1737016408556_1372_544.png',
  'https://ic-img.ky-express.com/netc/20250116_1777283114_!!1737016408555_1738_868.png',
  'https://ic-img.ky-express.com/netc/20250116_72772831110_!!1737016326567_1500_660.png',
])

const cardList = ref([
  { title: '卡片一', desc: '这是第一张轮播卡片', color: '#667eea' },
  { title: '卡片二', desc: '这是第二张轮播卡片', color: '#764ba2' },
  { title: '卡片三', desc: '这是第三张轮播卡片', color: '#f093fb' },
])

const handlePrev = () => {
  swiperRef.value?.prev()
}

const handleNext = () => {
  swiperRef.value?.next()
}

const handleTo = (index: number) => {
  swiperRef.value?.to(index)
}
</script>

<style lang="scss">
.swiper-demo {
  .demo-item {
    margin-bottom: 24rpx;

    &:last-child {
      margin-bottom: 0;
    }
  }

  .demo-label {
    font-size: 24rpx;
    color: #666;
    margin-bottom: 12rpx;
    padding-left: 8rpx;
  }

  .action-buttons {
    display: flex;
    gap: 16rpx;
    margin-top: 20rpx;
    flex-wrap: wrap;
  }

  .swiper-card {
    width: 100%;
    height: 200px;
    border-radius: 12px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    padding: 20px;
    box-sizing: border-box;
  }

  .card-text {
    font-size: 32rpx;
    font-weight: 600;
    color: #fff;
    margin-bottom: 12rpx;
  }

  .card-desc {
    font-size: 24rpx;
    color: rgba(255, 255, 255, 0.8);
  }
}
</style>