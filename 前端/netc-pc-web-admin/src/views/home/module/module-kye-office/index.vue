<template>
  <div
    id="kye-office"
    class="kye-office"
    v-exposure-report="{
      eventCode: 'exp_homepage_kye_office_v1',
      region_code: 'kye_office',
    }"
  >
    <div class="office-content">
      <div class="office-header">
        <span class="title-main">关注公众号</span>
        <span class="title-sub">实时接收物流消息</span>
      </div>

      <div class="office-body">
        <div class="feature-grid">
          <div
            v-for="item in featureList"
            :key="item.key"
            class="feature-item"
            v-click-report="{
              eventCode: 'clk_homepage_kye_office_subblock_v1',
              region_code: 'kye_office',
              subblock_name: item.title + (item.titleStrong ?? ''),
            }"
          >
            <span class="feature-arrow"></span>
            <span class="feature-text">
              <span class="feature-title" v-html="item.title"></span>
              <span class="feature-desc" v-html="item.desc"></span>
            </span>
          </div>
        </div>

        <div class="office-right">
          <div class="qrcode-wrapper">
            <img
              v-if="qrcodeUrl && !qrFailed"
              :src="qrcodeUrl"
              alt="跨越公众号二维码"
              class="qrcode-img"
              @error="qrFailed = true"
            />
            <div v-else class="qrcode-placeholder">
              <span class="kye-logo">KYE</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

interface FeatureItem {
  key: string
  title: string
  // 标题尾部加粗文案（如"享奖励"），无则标题整体常规字重
  titleStrong?: string
  desc: string
  // 描述前 N 个字加粗，无则描述整体常规字重
  descStrongCount?: number
}

const featureList = ref<FeatureItem[]>([
  {
    key: 'send',
    title: '寄件/查件/催件',
    desc: '<span class="feature-bold">自助下单</span>更便捷',
  },
  {
    key: 'coupon',
    title: '送券/预存/满减',
    desc: '<span class="feature-bold">寄递优惠</span>早知道',
  },
  {
    key: 'track',
    title: '揽件/派送/签收',
    desc: '<span class="feature-bold">订单动态</span>早接收',
  },
  {
    key: 'recommend',
    title: '介绍客户<span class="feature-bold">享奖励</span>',
    desc: '公众号直接录入',
  },
])

const qrcodeUrl = ref('https://ic-img.ky-express.com/netc/20260824_51241_!!1787558803227_240_240.png')
const qrFailed = ref(false)
</script>

<style lang="scss" scoped>
.kye-office {
  margin-top: 8px;
  padding: 16px 24px 24px 24px;
  border-radius: 8px;
  background: #ffffff;
  box-sizing: border-box;
}

.office-content {
  display: block;
  container-type: inline-size;
}

// 功能文字与二维码同一行内上下居中；放不下时二维码换行。
.office-body {
  display: flex;
  flex-wrap: nowrap;
  justify-content: center;
  align-items: center;
  gap: 20px;
}
/* 小于 380px 自动换行 */
@container (max-width: 320px) {
  .office-body {
    flex-wrap: wrap;
  }
}

.office-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;

  .title-main {
    font-size: 18px;
    font-weight: 600;
    color: #24262b;
    line-height: 26px;
  }

  .title-sub {
    font-size: 13px;
    color: var(---CG-Grey-08, rgba(104, 107, 117, 1));
    line-height: 18px;
  }
}

.feature-grid {
  // 先按文字的自然宽度参与布局，放不下二维码时让二维码换行。
  flex: 1 1 max-content;
  min-width: 0;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px 16px;
}

.feature-item {
  display: flex;
  align-items: flex-start;
  gap: 8px;
}

// 箭头 icon：20×40 素材整体缩放进 10×20 容器（上浅紫下深紫的两色三角）
.feature-arrow {
  flex-shrink: 0;
  width: 10px;
  height: 20px;
  // 与 18px 行高的 feature-title 垂直居中
  margin-top: -1px;
  background: url('https://ic-img.ky-express.com/netc/20261019_3553_!!1792390565636_20_40.png') no-repeat center / 100%
    100%;
}

.feature-text {
  display: inline;
  // max-width: 95px;
}

.feature-title {
  font-size: 13px;
  color: #686b75;
  line-height: 20px;
}

.feature-desc {
  font-size: 13px;
  color: #686b75;
  line-height: 20px;
}

:deep(.feature-bold) {
  font-weight: 600;
  color: #24262b;
}

.text-strong {
  font-weight: 600;
}

.office-right {
  flex-shrink: 0;
}

.qrcode-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.qrcode-img {
  width: 96px;
  height: 96px;
  border-radius: 0;
  object-fit: contain;
  background: #fff;
  border: 1px solid #e6e8ed;
}

.qrcode-placeholder {
  width: 96px;
  height: 96px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  background: linear-gradient(135deg, #f3efff 0%, #ebe4ff 100%);

  .kye-logo {
    font-size: 20px;
    font-weight: 700;
    color: #7143f0;
    letter-spacing: 1px;
  }
}
</style>
