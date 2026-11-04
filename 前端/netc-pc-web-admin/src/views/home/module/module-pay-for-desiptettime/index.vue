<template>
  <div
    id="pay-for-desiptettime"
    class="pay-for-desiptettime"
    role="link"
    tabindex="0"
    aria-label="预存运费，立即充值"
    @click="handleRecharge"
    @keydown.enter.prevent="handleRecharge"
    v-click-report="{
      eventCode: 'clk_homepage_pay_for_desiptettime_recharge_v1',
      region_code: 'pay_for_desiptettime',
      button_name: '立即充值',
    }"
    v-exposure-report="{
      eventCode: 'exp_homepage_pay_for_desiptettime_v1',
      region_code: 'pay_for_desiptettime',
    }"
  >
    <div class="banner-bg">
      <div class="banner-left">
        <div class="banner-title-row">
          <span class="title-main">预存运费</span>
          <img :src="recommendTagImg" alt="推荐" class="title-tag" />
        </div>
        <div class="banner-subtitle">
          <span class="subtitle-main">提前充值即有机会享超值折扣，</span>
          <span class="subtitle-highlight">充多送更多</span>
        </div>

        <div class="banner-footer">
          <div class="feature-list">
            <span v-for="item in featureList" :key="item" class="feature-tag">
              <img :src="checkImg" alt="" class="tag-icon" />
              {{ item }}
            </span>
          </div>

          <div class="action-btn">
            立即充值
            <img :src="arrowImg" alt="" class="btn-arrow" />
          </div>
        </div>
      </div>

      <div class="banner-right">
        <img :src="decorImg" alt="预存运费" class="banner-decor" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import checkImg from './images/check.svg'
import arrowImg from './images/arrow.svg'

// 设计稿切图（前端写死）
const decorImg = 'https://ic-img.ky-express.com/netc/20260904_1194_!!1788508329917_960_264.png'
const recommendTagImg = 'https://ic-img.ky-express.com/netc/20260904_3636_!!1788492015779_74_36.png'

const router = useRouter()

const featureList = ref<string[]>(['安全省心', '快捷便利', '余额灵活用'])

const handleRecharge = () => {
  router.push({
    path: '/admin/deposit-freight',
  })
}
</script>

<style lang="scss" scoped>
.pay-for-desiptettime {
  cursor: pointer;
  margin-top: 8px;
  border-radius: 8px;
  overflow: hidden;
}

.banner-bg {
  position: relative;
  display: flex;
  align-items: center;
  min-height: 136px;
  padding: 16px 0 16px 24px;
  box-sizing: border-box;
  background: linear-gradient(117deg, #d8cbff 0%, #efeafc 25.65%, #f3effc 100%);
  border: 1px solid #ffffff;
  border-radius: 8px;
  overflow: hidden;
}

.banner-left {
  position: relative;
  z-index: 1;
  flex: 1;
  min-width: 0;
}

.banner-title-row {
  display: flex;
  align-items: center;
  gap: 2px;

  .title-main {
    font-size: 18px;
    font-weight: 600;
    line-height: 26px;
    color: #4c378b;
  }
}

.title-tag {
  width: 37px;
  height: 18px;
}

.banner-subtitle {
  font-family: 'Alimama ShuHeiTi', 'PingFang SC', 'Microsoft YaHei', sans-serif;
  font-size: 26px;
  // font-weight: 700;
  line-height: 34px;
}

.subtitle-main {
  color: #4c378b;
  font-weight: 700;
}

.subtitle-highlight {
  color: #7244f0;
  font-weight: 700;
  background: linear-gradient(90deg, #8155f6 0%, #7244f0 100%);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.banner-footer {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 12px;
  width: fit-content;
  box-sizing: border-box;
  height: 32px;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 0.5) 100%);
  border: 1px solid #f0ecfd;
  border-radius: 99px;
}

.feature-list {
  display: flex;
  align-items: center;
}

.feature-tag {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 12px;
  border-radius: 99px;
  font-size: 12px;
  line-height: 18px;
  color: #4c378b;
}

.tag-icon {
  width: 12px;
  height: 12px;
}

.action-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 2px;
  box-sizing: border-box;
  flex-shrink: 0;
  width: 120px;
  height: 32px;
  background: linear-gradient(90deg, #e4a664 0%, #ffe9c5 40.1%, #f5ce9d 100%);
  border: 1px solid #ffffff;
  border-radius: 54px;
  color: #8a4709;
  font-size: 15px;
  font-weight: 600;
  line-height: 22px;

  .btn-arrow {
    width: 14px;
    height: 14px;
  }
}

.banner-right {
  position: absolute;
  top: 0;
  right: 0;
  width: 480px;
  height: 100%;
  pointer-events: none;

  .banner-decor {
    position: absolute;
    top: 2px;
    right: 0;
    width: 480px;
    height: 132px;
  }
}

// 响应式
@container home-left (max-width: 768px) {
  .banner-bg {
    padding: 16px 0 16px 16px;
  }

  .banner-subtitle {
    font-size: 20px;
    line-height: 28px;
  }

  .banner-right {
    width: 300px;
    overflow: hidden;
  }
}

@container home-left (max-width: 480px) {
  .banner-right {
    display: none;
  }
}
</style>
