<template>
  <div
    class="main"
    v-exposure-report="{
      pageCode: 'page_native_client_v1',
      eventCode: 'exp_page_native_client_version_updating',

      page_code: 'page_native_client_v1',
      page_name: 'page_native_client_v1',
      event_type_id: 2201,
      region_code: 'version_updating',
    }"
  >
    <div class="top">
      <img src="https://ic-img.ky-express.com/netc/20230203_29663189579_!!1675411506756_84_84.jpeg" />
      <div class="intro">
        <p class="client_name">{{ title }}</p>
        <p>当前版本：{{ clientVersion }}</p>
      </div>
    </div>
    <div class="new_client_intro" v-if="newClientVersion">
      <p class="title">更新说明：</p>
      <div class="content" v-html="newClientVersion.modifyContent.replace(/\n/g, '<br/>')"></div>
    </div>
    <el-button
      :disabled="commonStore.clientUpdateIng"
      v-if="newClientVersion"
      class="button"
      type="primary"
      @click="checkUpdate"
      v-click-report="{
        pageCode: 'page_native_client_v1',
        eventCode: 'clk_page_native_client_version_updating',

        page_code: 'page_native_client_v1',
        page_name: 'page_native_client_v1',
        region_code: 'version_updating',
        event_type_id: 2101,
        button_name: '立即更新',
      }"
    >
      {{ buttonText }}
    </el-button>
  </div>
</template>

<script setup lang="ts">
/**
 * 来源: netc-pc-web/src/views/new-client/setting/update-tab.vue
 * 迁移说明:
 *  - Options API -> <script setup lang="ts">
 *  - mapGetters(['getClientUpdateIng']) -> usePcWebCommonStore().clientUpdateIng
 *    (旧 root getter getClientUpdateIng = state.common.clientUpdateIng)
 *  - this.$native.getVersion -> @/native/electron
 *  - v-ump-exposure/v-ump-click -> v-exposure-report/v-click-report
 */
import { computed, onMounted, ref } from 'vue'
import { getVersion } from '@/native/electron'
import { usePcWebCommonStore } from '@/stores/pc-web/common'

defineOptions({ name: 'UpdateTab' })

const props = defineProps<{
  newClientVersion?: Record<string, any> | null
}>()

const emit = defineEmits<{
  (e: 'checkUpdate'): void
}>()

const commonStore = usePcWebCommonStore()

const clientVersion = ref('')

const title = computed(() => {
  return props.newClientVersion ? `检测到新版本${props.newClientVersion.versionNo}，是否更新？` : '当前已是最新版本'
})

const buttonText = computed(() => {
  return commonStore.clientUpdateIng ? '正在更新' : '立即更新'
})

const fetchVersion = async () => {
  const version = await getVersion()
  clientVersion.value = version
}

const checkUpdate = () => {
  emit('checkUpdate')
}

onMounted(() => {
  fetchVersion()
})
</script>

<style scoped lang="scss">
.main {
  padding: 14px 14px 10px 14px;
  background: #f5f7fa;
  border-radius: 4px;
}
.top {
  display: flex;
  align-items: center;
}
.intro {
  margin: 0 50px 0 16px;
}
img {
  width: 42px;
  height: 42px;
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
  text-align: left;
  color: #8f8fa8;
  margin-right: 16px;
}
.new_client_intro {
  padding: 12px 4px 12px 12px;
  background: #ffffff;
  color: #999999;
  border-radius: 4px;
  margin: 12px 0 12px 58px;
  .title {
    margin-bottom: 8px;
  }
  .content {
    height: 80px;
    overflow-y: auto;
    font-size: 12px;
    line-height: 20px;
    letter-spacing: 0px;
    color: #999999;
    padding-right: 8px;
  }
}
.button {
  margin-left: 58px;
}
</style>
