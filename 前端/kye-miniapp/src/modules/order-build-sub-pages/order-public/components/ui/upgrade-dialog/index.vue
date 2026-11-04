<template>
  <Overlay :show="value" z-index="10000">
    <div class="upgrade-dialog flex-column flex-items-center">
      <img
        class="img-version"
        src="https://ic-img.ky-express.com/netc/20240929_26263189524_!!1727602027710_992_608.png"
      />
      <div class="mt-40 font-level1">浏览器版本过低</div>
      <div class="mt-40 font-level3 content">
        您使用的浏览器版本过低{{ versionText }}<br />
        如需下单请升级您的手机系统
      </div>
      <KyButton class="mt-40 button-upgrade" type="primary" @click="onClick" :text="text"></KyButton>
    </div>
  </Overlay>
</template>
<script setup lang="ts">
import KyButton from '@order-public-sub-public/components/base/ky-button/index.vue'
import { getBrowserVersion, isAppAndroid, isAppiOS } from '@order-public-sub-public/utils/device'
import { computed, onMounted, ref } from 'vue'
import { $native } from '@order-public-sub-public/utils'
import apm from '@order-public-sub-public/utils/apm-sdk'
// import { Overlay } from 'vant'
import { useRouter } from '@order-public-sub-public/vue-router/index'
import { NativeJumpParams } from '@order-public-sub-public/utils/types'

const router = useRouter()

const pageCode = computed(() => router.currentRoute.value.meta.pageCode)

const props = defineProps<{ value: boolean; close: () => void }>()

const isApp = isAppAndroid || isAppiOS

const text = ref(isApp ? '马上升级' : '我知道了')

const version = getBrowserVersion()

const versionText = ref(version ? `(V${version})` : '')

const onClick = () => {
  window.$umpOtherReport(
    'CLK',
    {
      eventCode: 'page_express_browser_upgrade_button_v1',
    },
    {
      button_name: text.value,
      page_name: pageCode.value,
      pageCode: pageCode.value,
    },
  )
  if (isApp) {
    let target: NativeJumpParams['target'] = 'appSetting'
    if (window?.kye?.jumpSystemSetting) {
      target = 'systemSetting'
    }
    $native.jumpNative({ target }).catch((error) => apm.reportError(error))
  } else {
    props.close()
  }
}

onMounted(() => {
  setTimeout(() => {
    window.$umpOtherReport(
      'EXP',
      {
        eventCode: 'page_express_browser_upgrade_v1',
        regionCode: 'pop',
      },
      { page_name: pageCode.value, pageCode: pageCode.value },
    )
  }, 300)
})
</script>
<style lang="scss" scoped>
@import '@order-global-package-order-sub/styles/index.scss';
@import './index.scss';
</style>
