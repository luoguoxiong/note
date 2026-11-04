<template>
  <view class="rules-dialog" :style="{ display: show ? 'block' : 'none' }">
    <view class="cover" @click="$emit('hide')"></view>
    <view class="rules-dialog__content">
      <view class="header">
        <image :src="IMG_BASE_URL + '/marketing-lottery/rules_header.png'" />
      </view>
      <view class="rules">
        <view class="rules-item">
          <view class="rules-item-title">活动说明</view>
          <view class="rules-item-content">
            <text>1、本活动仅现场摇奖生效，未扫码参与者视为放弃参与抽奖；\n</text>
            <text>2、本活动领取奖励有效期为活动当天有效；\n</text>
            <text>3、本活动一个手机号码仅能兑换一个奖项，不兑现，不找零；\n</text>
            <text>4、中奖者凭兑奖编码领取奖励，如出现兑奖编码报错等突发状况，可寻找现场工作人员及时沟通；\n</text>
            <text>5、活动奖品下发情况视现场而定，数量有限，发完为止；\n</text>
            <text
              >6、活动开启，即系统随机匹配中奖者，在参与活动过程中，如用户出现作弊等违法违规行为，我司有权撤销用户参与活动及奖励资格，并有权收回用户已获得的权益；\n</text
            >
          </view>
        </view>
      </view>
      <button class="footer" @click="$emit('hide')">我知道了</button>
    </view>
  </view>
</template>

<script setup lang="ts">
import './index.scss'

defineOptions({ name: 'RulesDialog' })

defineProps<{ show: boolean }>()

const IMG_BASE_URL = 'https://ic-h5.kye-erp.com/intro/miniprogram'
</script>

