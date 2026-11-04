<template>
  <div class="empty_container">
    <KyEmpty class="order-empty" :type="EmptyTypeEnum.CUSTOM" :custom-config="customConfig[businessEmptyStatus]">
      <div class="event_ends empty_word" v-if="businessEmptyStatus === EmptyStatusType.扫码活动结束">
        <p>抱歉，活动已结束～</p>
        <p>感谢您对本次活动的支持！</p>
      </div>
    </KyEmpty>
  </div>
</template>

<script lang="ts" setup>
import KyEmpty from '@order-public-sub-public/components/ui/ky-empty/index.vue'
import { EmptyTypeEnum, EmptyStatusType } from '@order-public-sub-public/constants'
import { EMPTY_CONFIGS } from '@order-public-sub-public/components/ui/ky-empty/config'
import { ref, onBeforeMount } from 'vue'
import { getQueryObject } from '@order-public-sub-public/utils'
import { EmptyConfig } from '@order-public-sub-public/components/ui/ky-empty/types'

const businessEmptyStatus = ref('')
const customConfig: Record<EmptyStatusType, EmptyConfig> = {
  '10': {
    //活动结束
    image: EMPTY_CONFIGS.data.image,
    description: '',
  },
  '99999': {
    //默认的
    image: EMPTY_CONFIGS.data.image,
    description: '暂无数据',
  },
}
onBeforeMount(() => {
  initStatus()
})
const initStatus = () => {
  const { emptyStatus = EmptyStatusType.默认 } = getQueryObject()
  businessEmptyStatus.value = emptyStatus
}
</script>

<style lang="scss">
@import '@order-global-package-order-sub/styles/index.scss';

.empty_container {
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  image {
    width: 280px;
    height: 280px;
  }
}
.van-empty__image {
  width: 280px;
  height: 280px;
}
.empty_word {
  font-family: PingFang SC;
  font-size: 30px;
  text-align: center;
  letter-spacing: 0px;
  color: #55596c;
  line-height: 48px;
  p {
    margin: 0;
    padding: 0;
  }
}
</style>
