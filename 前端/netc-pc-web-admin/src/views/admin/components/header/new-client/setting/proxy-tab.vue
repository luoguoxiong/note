<template>
  <div
    class="main"
    v-exposure-report="{
      pageCode: 'page_native_client_v1',
      eventCode: 'exp_page_native_client_network_setting',

      page_code: 'page_native_client_v1',
      page_name: 'page_native_client_v1',
      region_code: 'network_setting',
      event_type_id: 2201,
    }"
  >
    <el-form :model="queryForm" ref="queryForm" label-width="70px">
      <el-row :gutter="24">
        <el-col :span="12">
          <el-form-item label="类型">
            <el-select v-model="proxyType" @change="changeProxyType" placeholder="请选择">
              <el-option
                v-for="item in proxyTypeList"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              ></el-option>
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="24">
        <el-col :span="12">
          <el-form-item label="地址" :rules="[{ required: true, message: '', trigger: 'blur' }]">
            <el-input v-model="requestUrl" :disabled="!proxyType.length"></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="端口" :rules="[{ required: true, message: '', trigger: 'blur' }]">
            <el-input v-model="port" :disabled="!proxyType.length"></el-input>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="24">
        <el-col :span="12">
          <el-form-item label="用户名">
            <el-input v-model="userName" :disabled="!proxyType.length"></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="密码">
            <el-input v-model="passWord" :disabled="!proxyType.length"></el-input>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="24">
        <el-col :span="24" style="margin-left: 15px; margin-top: 20px">
          <el-button
            @click="testProxyFn"
            :loading="proxyLoading"
            :disabled="proxyType === ''"
            v-click-report="{
              pageCode: 'page_native_client_v1',
              page_code: 'page_native_client_v1',
              page_name: 'page_native_client_v1',

              eventCode: 'clk_page_native_client_network_setting',
              region_code: 'network_setting',
              event_type_id: 2101,
              button_name: '测试',
            }"
          >
            测试
          </el-button>

          <el-button
            type="primary"
            @click="setProxyFn"
            v-click-report="{
              pageCode: 'page_native_client_v1',
              page_code: 'page_native_client_v1',
              page_name: 'page_native_client_v1',
              eventCode: 'clk_page_native_client_network_setting',
              region_code: 'network_setting',
              event_type_id: 2101,
              button_name: '应用',
            }"
          >
            应用
          </el-button>
          <!--          <span class="tip">页面需要重启跨越客户端才会使用新的代理</span>-->
        </el-col>
      </el-row>
    </el-form>
  </div>
</template>

<script setup lang="ts">
/**
 * 来源: netc-pc-web/src/views/new-client/setting/proxy-tab.vue
 * 迁移说明:
 *  - Options API -> <script setup lang="ts">
 *  - parseJson: @utils/commonUtil -> ../utils/format
 *  - saveProxyInfo: @api/common -> ../api
 *  - Message(element-ui) / this.$message -> ElMessage(element-plus)
 *  - this.$native.* -> @/native/electron 同名方法; this.isClientMode(全局 mixin) -> isClientMode()
 *  - 跨声壳下参数需 JSON.stringify 后传给原生(与老项目一致)
 *  - v-ump-exposure/v-ump-click -> v-exposure-report/v-click-report
 *  - /deep/ -> :deep()
 */
import { onMounted, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { parseJson } from '../utils/format'
import { saveProxyInfo } from '../api'
import {
  existsNativeFunc,
  getProxyInfo,
  isClientMode,
  isKuaShenClientMode,
  setProxy,
  testProxy,
} from '@/native/electron'

defineOptions({ name: 'ProxyTab' })

const requestUrl = ref('')
const userName = ref('')
const passWord = ref('')
const port = ref('')
const proxyPop = ref(false)
const queryForm = ref<Record<string, any>>({})
const proxyType = ref('http')
const proxyTypeList = ref([
  {
    value: 'http',
    label: 'HTTP代理',
  },
  {
    value: '',
    label: '不使用代理',
  },
])
const proxyLoading = ref(false)

const testProxyFn = () => {
  if (!judgeProxy()) return
  proxyLoading.value = true
  let params: Record<string, any> | string = {
    requestUrl: requestUrl.value,
    port: port.value,
    userName: userName.value,
    passWord: passWord.value,
  }
  if (isKuaShenClientMode()) {
    params = JSON.stringify(params)
  }
  testProxy(params as any)
    .then(() => {
      ElMessage.success('测试成功')
    })
    .catch(() => {
      ElMessage.error('测试失败，请重试')
    })
    .finally(() => {
      proxyLoading.value = false
    })
}

const initProxy = async () => {
  const proxyInfo = parseJson<Record<string, any>>(await getProxyInfo())
  if (!proxyInfo?.ProxyUrl) return
  requestUrl.value = proxyInfo.ProxyUrl
  userName.value = proxyInfo.ProxyUsername
  port.value = proxyInfo.ProxyPort
  passWord.value = proxyInfo.ProxyPassword
}

const changeProxyType = (e: string) => {
  if (e) return
  port.value = ''
  requestUrl.value = ''
  userName.value = ''
  passWord.value = ''
}

const setProxyFn = async () => {
  if (proxyType.value.length && !judgeProxy()) return
  const proxyInfo = parseJson<Record<string, any>>(await getProxyInfo())
  if (!proxyInfo?.ProxyUrl && !proxyType.value) {
    proxyPop.value = false
    return
  }
  let params: Record<string, any> | string = {
    requestUrl: requestUrl.value,
    port: port.value,
    userName: userName.value,
    passWord: passWord.value,
    proxyType: proxyType.value,
  }
  if (isKuaShenClientMode()) {
    params = JSON.stringify(params)
  }
  setProxy(params as any)
    .then(() => {
      ElMessage.success('设置代理成功')
      proxyPop.value = false
      handleProxyInfo()
    })
    .catch(() => {
      ElMessage.success('应用失败')
    })
}

const judgeProxy = () => {
  if (!requestUrl.value) {
    ElMessage.error('代理地址不能为空')
    return false
  }
  if (!port.value) {
    ElMessage.error('端口号不能为空')
    return false
  }
  return true
}

// 处理网络代理信息
const handleProxyInfo = async () => {
  try {
    if (isClientMode() && existsNativeFunc('getProxyInfo')) {
      const proxyInfo = parseJson<Record<string, any>>(await getProxyInfo())
      if (proxyInfo) {
        await saveProxyInfo(proxyInfo)
      }
    }
  } catch (e) {
    console.log('e :>> ', e)
  }
}

onMounted(() => {
  initProxy()
})
</script>

<style scoped lang="scss">
.tip {
  font-size: 12px;
  color: #c1c1c1;
  margin-left: 10px;
}
:deep(.el-row) {
  margin-right: 0 !important;
}
:deep(.el-input__inner) {
  width: 168px;
  height: 32px;
}
.el-form {
  margin-left: -12px;
  margin-top: -2px;
}
.el-form-item {
  margin-bottom: 12px;
}
:deep(.el-form-item__label) {
  font-size: 14px;
  font-weight: 500;
  font-family: PingFangSC, PingFangSC-Medium;
  color: #03050d !important;
  text-align: left;
  padding-left: 16px;
  box-sizing: border-box;
  white-space: nowrap;
}
.el-button {
  width: 90px;
  height: 32px;
}

:deep(.el-dialog__body) {
  padding: 0 20px;
}
:deep(.el-tabs--left .el-tabs__header .el-tabs__nav) {
  padding-top: 8px;
  margin-right: 20px;
}
:deep(.el-tabs__active-bar) {
  background: none;
}
:deep(.el-tabs__item) {
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: left !important;
  width: 127px;
  box-sizing: border-box;
  &:hover {
    color: inherit;
  }
}
:deep(.el-tabs__item.is-active) {
  border-left: 3px solid #7556ed;
  background: linear-gradient(270deg, #f9f7ff, #e3deff);
}
</style>
