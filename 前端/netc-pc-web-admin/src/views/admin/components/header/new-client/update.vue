<template>
  <section>
    <div class="client-update" v-if="modalShow">
      <div class="update-main download-error" v-if="downalMessageModal">
        <div class="bg">
          <img :src="bgImage" alt="" />
        </div>
        <div class="seize"></div>
        <div class="close-icon flex" v-if="closeIcon" @click="modalShow = false">
          <el-icon class="el-dialog__close el-icon el-icon-close"><Close /></el-icon>
        </div>
        <div class="title" v-if="status === 0">{{ versionInfo?.versionNo }}版本安装包下载失败，请重试</div>
        <div class="title" v-if="status === 1">
          <div class="title">正在下载，请您耐心等候</div>
          <p class="force-tip-minsize">您可最小化应用，下载完成后将提示您安装应用</p>
        </div>
        <div class="title" v-if="status === 3 || status === 6">{{ versionInfo?.versionNo }}版本安装包已下载完成</div>
        <div class="force-tip" v-if="status === 3 || status === 6">安装将重启应用</div>
        <div class="progress" v-if="status === 1">
          <el-progress :stroke-width="11" color="#8365F6" :percentage="percentage" :show-text="false"></el-progress>
          <div class="progress-intro" v-if="percentage">
            <div class="size">{{ currSize }}M/{{ totalSize }}M</div>
            <div>{{ percentage }}%</div>
          </div>
        </div>

        <div class="button-operation flex">
          <div class="button normal-button flex" v-if="status === 3 || status === 6" @click="onStartSetup">
            <el-icon class="el-icon-loading is-loading" v-if="setUpIng"><Loading /></el-icon>
            {{ setUpIng ? '安装中' : '立即安装' }}
          </div>
          <div class="button normal-button flex" v-if="status === 0" @click="submitUpdate">重新下载</div>
          <div class="button light-button flex" v-if="status === 1" @click="setClientMinimize">最小化应用</div>
        </div>
      </div>
      <div class="update-main update-normal" v-if="status === 2 || status === 5">
        <div class="bg">
          <img src="https://ic-img.ky-express.com/netc/20221017_8636318950_!!1665978735995_1000_374.png" alt="" />
        </div>
        <div class="seize"></div>
        <div class="close-icon flex" v-if="![1, 2, 3].includes(status) && sourceSelf" @click="modalShow = false">
          <el-icon class="el-dialog__close el-icon el-icon-close"><Close /></el-icon>
        </div>
        <div class="title">
          <img src="https://ic-img.ky-express.com/netc/20221017_81663189523_!!1665979668921_296_52.png" alt="" />
          <div class="version flex">{{ versionInfo?.versionNo }}</div>
        </div>
        <div class="intro">
          <div class="intro-title">更新内容：</div>
          <div class="list" v-html="(versionInfo?.modifyContent || '').replace(/\n/g, '<br/>')"></div>
        </div>
        <div class="button-operation flex">
          <div class="button light-button flex" @click="temporaryClose" v-if="status === 5">
            {{ sourceSelf ? '取消' : '稍后再说' }}
          </div>
          <div class="button light-button flex" v-if="status === 2" @click="setClientMinimize">最小化应用</div>
          <div class="button normal-button flex" v-if="status === 2 || status === 5" @click="submitUpdate">
            立即更新
          </div>
        </div>
        <div class="tip" v-if="status === 5 && !sourceSelf" @click="saveTodayNoTip">当天不再提示</div>
      </div>
      <!--    已经是最新版本弹框-->
      <update-last-modal v-if="status === 4" :client-version="clientVersion" @close="modalShow = false" />
      <!--中断二次确认-->
      <update-cancel-confirm v-if="cancelDialog" @quit="quitUpdate" @continue="continueUpdate" />
    </div>
    <update-float-bar
      v-if="status === 7 && percentage"
      :percentage="percentage"
      :curr-size="currSize"
      :total-size="totalSize"
      :version-no="versionInfo?.versionNo"
      @close="openCancelDialog"
    />
    <img
      class="preLoadImage"
      src="https://ic-img.ky-express.com/netc/20221018_91063189552_!!1666094410324_1000_372.png"
      alt=""
    />
  </section>
</template>

<script setup lang="ts">
/**
 * 来源: netc-pc-web/src/views/new-client/update.vue
 * 迁移说明:
 *  - Options API -> <script setup lang="ts">
 *  - vuex: mapState userInfo(root) -> usePcWebRootStore().userInfo(空对象时回退 getUserData);
 *    commit('common/setClientUpdateIng') -> usePcWebCommonStore().setClientUpdateIng
 *  - API: @/services/api/{admin,vts/index} -> ../api (clientCheckVersion/clientVersionReportData/getCache/saveOrUpdate)
 *  - 下载动画: @/components/create-download-task-animation/commonManager -> ../utils/download-animation
 *  - formatBytes/toDecimal2: @utils/commonUtil -> ../utils/format
 *  - this.$native.* -> @/native/electron (win.minimize -> minimize; 跨声壳下参数 JSON.stringify 传原生, as any 适配签名)
 *  - el-icon-close/el-icon-loading 字体图标 -> el-icon + @element-plus/icons-vue (class 名保留)
 *  - 老代码未使用的导入(DOWNLOAD_PRINT_APP_URL/VueDragResize)与 data 字段(errImageOffLine)未迁移
 *  - 重构拆分(行为不变): 下载状态机/进度 -> hooks/use-update-download; 版本检查/上报 -> hooks/use-update-version-check;
 *    已经是最新弹框/中断二次确认/弱升悬浮条 -> update-last-modal.vue / update-cancel-confirm.vue / update-float-bar.vue
 *    (window 壳回调的注册时机保持在本组件 onMounted 中)
 */
import { onMounted, ref } from 'vue'
import { Close, Loading } from '@element-plus/icons-vue'
import { isKuaShenClientMode } from '@/native/electron'
import { useUpdateDownload } from './hooks/use-update-download'
import { useUpdateVersionCheck } from './hooks/use-update-version-check'
import UpdateLastModal from './update-last-modal.vue'
import UpdateCancelConfirm from './update-cancel-confirm.vue'
import UpdateFloatBar from './update-float-bar.vue'

defineOptions({ name: 'update' })

const props = defineProps<{
  source?: string
}>()

const emit = defineEmits<{
  (e: 'updateLastVersion', version: string): void
  (e: 'submitUpdate'): void
}>()

const versionInfo = ref<Record<string, any> | null>(null)

// 下载状态机与进度处理(壳回调实现, 注册时机见 onMounted)
const {
  status,
  percentage,
  currSize,
  totalSize,
  modalShow,
  cancelDialog,
  setUpIng,
  bgImage,
  downalMessageModal,
  closeIcon,
  switchModal,
  getProgress,
  getProgressNew,
  getUpdateResult,
  progressError,
  openCancelDialog,
  quitUpdate,
  continueUpdate,
  submitUpdate,
  onStartSetup,
  setClientMinimize,
} = useUpdateDownload({ versionInfo, emit })

// 版本检查与数据上报
const {
  clientVersion,
  sourceSelf,
  getVersionUpdate,
  saveClientVersionReportData,
  setUpkYEPrinter,
  temporaryClose,
  saveTodayNoTip,
} = useUpdateVersionCheck({ props, versionInfo, modalShow, setUpIng, switchModal, emit })

onMounted(() => {
  window.getProgress = getProgress
  // 跨声壳子更新进度差异处理
  if (isKuaShenClientMode()) {
    window.getProgressNew = getProgressNew
    window.geDownloadResult = getUpdateResult
  }
  window.progressError = progressError
  // 定时去查有没有超出设定的时间，超出了就去请求
  // setInterval(async () => {
  //   const data = await getCacheInfo('lastVersionUpdateTime')
  //   if (new Date().getTime() > data) {
  //     getVersionUpdate()
  //   }
  // }, 1000 * 60 * 10)
  if (props.source === 'login') {
    saveClientVersionReportData()
  }
  if (localStorage.getItem('versionInfo')) {
    versionInfo.value = JSON.parse(localStorage.getItem('versionInfo') as string)
  }
  setUpkYEPrinter(true)
})

defineExpose({ getVersionUpdate, submitUpdate })
</script>

<style scoped lang="scss">
.flex {
  display: flex;
  align-items: center;
  justify-content: center;
}
.client-update {
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.4);
  position: fixed;
  left: 0;
  top: 0;
  z-index: 3000;
  display: flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  .close-icon {
    position: absolute;
    right: 0;
    top: 0;
    width: 36px;
    height: 36px;
    color: #666666;
    i {
      font-size: 20px;
      cursor: pointer;
    }
  }
  .bg {
    height: 207px;
  }
  .button-operation {
    margin-top: 36px;
    .el-icon-loading {
      margin-right: 6px;
    }
    .button {
      width: 124px;
      height: 44px;
      border-radius: 4px;
      font-size: 15px;
      font-weight: 500;
      color: #ffffff;
      line-height: 14px;
      font-family: PingFangSC, PingFangSC-Medium;
      cursor: pointer;
    }
    .normal-button {
      background: #8365f6;
    }
    .light-button {
      background: #ffffff;
      border: 1px solid #dfdfdf;
      font-weight: 500;
      color: #03050d;
      margin-right: 16px;
    }
  }
  .update-main {
    width: 500px;
    min-height: 344px;
    background: #ffffff;
    border-radius: 8px;
    box-shadow: 0px 9px 28px 8px rgba(0, 0, 0, 0.05), 0px 6px 16px 0px rgba(0, 0, 0, 0.08),
      0px 3px 6px -4px rgba(0, 0, 0, 0.12);
    padding: 0 35px 32px;
    box-sizing: border-box;
    position: relative;
    .seize {
      height: 186px;
    }
    .bg {
      position: absolute;
      left: 0;
      top: -26px;
      width: 500px;
      height: 194px;
      img {
        width: 100%;
      }
    }
    .title {
      font-size: 20px;
      font-weight: 600;
      color: #03050d;
      text-align: center;
    }
    .progress {
      margin-top: 41px;
      .progress-intro {
        margin-top: 8px;
        display: flex;
        justify-content: space-between;
        font-size: 12px;
        color: #999999;
      }
    }
    .force-tip {
      font-size: 12px;
      color: #666666;
      text-align: center;
      margin-top: 12px;
      margin-bottom: -10px;
    }
  }
  .download-error {
    .seize {
      height: 206px;
    }
    .button-operation {
      margin-top: 46px;
    }
  }
  .update-normal {
    .title {
      margin-bottom: 23px;
      display: flex;
      align-items: flex-end;
      justify-content: center;
      img {
        height: 26px;
        line-height: 0;
      }
      .version {
        width: 47px;
        height: 18px;
        background: url('https://ic-img.ky-express.com/netc/20221102_56963189593_!!1667376320077_94_38.png');
        background-size: cover;
        border-bottom-right-radius: 4px;
        color: #ffffff;
        margin-left: 11px;
        font-size: 13px;
        overflow: hidden;
      }
    }
    .intro {
      width: 430px;
      background: #f6f6fb;
      border-radius: 4px;
      padding: 16px 20px;
      box-sizing: border-box;
      margin: 0 auto;
      min-height: 130px;
    }
    .intro-title {
      font-size: 16px;
      font-weight: 600;
      color: #03050d;
      margin-bottom: 12px;
    }
    .list {
      overflow-y: auto;
      line-height: 20px;
      word-break: break-all;
      max-height: 110px;
      &::-webkit-scrollbar {
        /*滚动条整体样式*/
        width: 4px; /*高宽分别对应横竖滚动条的尺寸*/
        height: 4px;
      }
    }
    .tip {
      font-size: 13px;
      font-weight: 400;
      text-align: center;
      color: #8365f6;
      line-height: 18px;
      margin-top: 16px;
      cursor: pointer;
    }
  }
}
.preLoadImage {
  width: 1px;
  height: 1px;
  opacity: 0;
  position: fixed;
  left: -2px;
  top: -2px;
}
.force-tip-minsize {
  margin-top: 8px;
  color: #9598a7;
}
</style>
