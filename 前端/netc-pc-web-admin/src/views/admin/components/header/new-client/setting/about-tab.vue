<template>
  <div
    class="container"
    v-exposure-report="{
      pageCode: 'page_native_client_v1',
      eventCode: 'exp_page_native_client_about_us',

      page_code: 'page_native_client_v1',
      page_name: 'page_native_client_v1',
      region_code: 'about_us',
      event_type_id: 2201,
    }"
  >
    <img src="https://ic-img.ky-express.com/netc/20230203_29663189579_!!1675411506756_84_84.jpeg" />
    <div class="intro">
      <p class="client_name">跨越速运客户端{{ clientVersion }}</p>
      <p>
        设备ID:{{ printId }}
        <span
          class="copy"
          @click="onCopy"
          v-click-report="{
            pageCode: 'page_native_client_v1',
            page_code: 'page_native_client_v1',
            page_name: 'page_native_client_v1',

            eventCode: 'clk_page_native_client_about_us_copy',
            region_code: 'about_us',
            event_type_id: 2101,
          }"
        >
          复制
        </span>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * 来源: netc-pc-web/src/views/new-client/setting/about-tab.vue
 * 迁移说明:
 *  - Options API -> <script setup lang="ts">
 *  - this.$native.getMachineId/getVersion/isKuaShenClientMode -> @/native/electron 同名方法
 *  - this.$copyText + this.$message.success -> useCopyText(内部已带复制成功/失败 toast)
 *  - v-ump-exposure/v-ump-click -> v-exposure-report/v-click-report
 */
import { onMounted, ref } from 'vue'
import { getMachineId, getVersion, isKuaShenClientMode } from '@/native/electron'
import { useCopyText } from '@/hooks/useCopyText'

defineOptions({ name: 'AboutTab' })

const { copyText } = useCopyText()

const clientVersion = ref('')
const printId = ref('')

const getPrintId = async () => {
  if (isKuaShenClientMode()) {
    const id = await getMachineId()
    printId.value = id
  }
}

const fetchVersion = async () => {
  const version = await getVersion()
  clientVersion.value = version
}

const onCopy = () => {
  copyText(printId.value)
}

onMounted(() => {
  fetchVersion()
  getPrintId()
})
</script>

<style scoped lang="scss">
.container {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  padding: 55px 0;
  box-sizing: border-box;
}
.intro {
  width: 100%;
}
img {
  width: 42px;
  height: 42px;
  margin: 12px auto 10px;
}
.client_name {
  height: 20px;
  font-size: 14px;
  font-weight: 600;
  color: #03050d;
  line-height: 20px;
  margin-bottom: 3px;
}
p {
  font-size: 12px;
  text-align: center;
  color: #666666;
}
.copy {
  color: #8365f6;
  margin-left: 4px;
  cursor: pointer;
}
</style>
