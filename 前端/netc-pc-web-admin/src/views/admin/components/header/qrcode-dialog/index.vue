<template>
  <k-dialog
    v-model="visible"
    title="下载入口"
    class="download-dialog"
    width="588px"
    height="638px"
    :has-footer="false"
    @close="emit('close')"
  >
    <div class="wrapper">
      <el-tabs style="width: 100%" v-model="activeName">
        <el-tab-pane label="下载产品" name="first" class="tab-item">
          <div class="item-wrapper" v-for="(item, index) in downloadConfig" :key="index">
            <div class="icon">
              <img :src="item.icon" />
            </div>
            <div class="info">
              <div v-if="item.type === 'link'" class="button-item">
                <k-button size="small" plain type="default" v-clipboard="item.url">复制链接</k-button>
                <k-button size="small" plain type="default" @click="linkClick(item)">
                  {{ item.button }}
                </k-button>
              </div>
              <k-button v-else-if="item.type === 'copy'" size="small" plain type="default" v-clipboard="item.url">
                {{ item.button }}
              </k-button>
              <div v-else class="desc">{{ item.desc }}</div>
              <div class="title">
                {{ item.title }}
                <!-- <el-tooltip
                  v-if="item.tip"
                  popper-class="tip-tooltip"
                  effect="light"
                  :content="item.tip"
                  placement="top"
                >
                  <img
                    @click="handleVideo(item)"
                    class="tip-icon"
                    src="https://ic-img.ky-express.com/netc/20230426_41151621418_!!1682492272948_24_24.png"
                    alt=""
                  />
                </el-tooltip> -->
              </div>
            </div>
            <div v-if="item.type === 'qrcode'" class="qrcode-wrapper">
              <div :class="['qrcode', isNotCopyImg ? 'm-tb-auto' : '']">
                <img :src="item.qrcodeImg" />
              </div>
              <k-button size="small" plain type="default" @click="copyImg(item.qrcodeImg!)" v-if="!isNotCopyImg">
                {{ item.button }}
              </k-button>
            </div>
          </div>
        </el-tab-pane>
        <el-tab-pane label="文件协议" name="second" class="tab-item">
          <div class="item-wrapper" v-for="(item, index) in fileConfig" :key="index">
            <div class="icon">
              <img :src="item.icon" />
            </div>
            <div class="info">
              <div v-if="item.type === 'link'">
                <k-button size="small" plain type="default" @click="linkClick(item)">
                  {{ item.button }}
                </k-button>
              </div>
              <k-button v-else-if="item.type === 'copy'" size="small" plain type="default" v-clipboard="item.url">
                {{ item.button }}
              </k-button>

              <!-- 下载电子运单契约协议 -->
              <a
                v-else-if="item.type === 'agreement'"
                :href="waybillAgreement"
                class="el-button el-button--default el-button--small is-plain k-button"
              >
                {{ item.button }}
              </a>

              <div v-else class="desc">{{ item.desc }}</div>
              <div class="title">
                {{ item.title }}
                <!-- <el-tooltip
                  v-if="item.tip"
                  popper-class="tip-tooltip"
                  effect="light"
                  :content="item.tip"
                  placement="top"
                >
                  <img
                    @click="handleVideo(item)"
                    class="tip-icon"
                    src="https://ic-img.ky-express.com/netc/20230426_41151621418_!!1682492272948_24_24.png"
                    alt=""
                  />
                </el-tooltip> -->
              </div>
            </div>
            <div v-if="item.type === 'qrcode'" class="qrcode-wrapper">
              <div class="qrcode">
                <img :src="item.qrcodeImg" />
              </div>
            </div>
          </div>
        </el-tab-pane>
      </el-tabs>
    </div>
    <ky-video-dialog ref="videoRef" :videoUrl="videoUrl" />
  </k-dialog>
</template>

<script setup lang="ts">
/**
 * 下载入口弹窗
 * 迁移自: netc-pc-web/src/views/layout/qrcode-dialog.vue
 * 迁移说明:
 *  - @vue/composition-api(root.$native / Message) -> @/native/electron + ElMessage
 *  - el-dialog :visible.sync -> v-model; el-button size="mini" -> size="small"
 *  - v-clipboard 全局指令 -> 本目录 directive/clipboard.ts 局部指令
 *  - @utils/compareVersions -> @/utils
 *  - 老文件首行错误的 <script src> 标签已删除
 */
import { onMounted, reactive, ref } from 'vue'
import { KButton, KDialog, KMessage } from '@netc-design-pc/ui'
import { getLastClientLink, downloadHelp } from '@/views/admin/components/header/api'
import { webConfig, clientConfig, fileAndAgreementConfig, type DownloadItem } from './config/download'
import KyVideoDialog from './ky-video-dialog.vue'
import { compareVersions } from '@/utils'
import { isClientMode, isKuaShenClientMode, getVersion } from '@/native/electron'
import clipboard from './directive/clipboard'

defineOptions({ name: 'qrcode-dialog' })

// 局部注册 v-clipboard 指令
const vClipboard = clipboard

const emit = defineEmits(['close'])

const activeName = ref('first')
const waybillAgreement = ref('')
const fileConfig = reactive(fileAndAgreementConfig)
const downloadConfig = ref<DownloadItem[]>(isClientMode() ? clientConfig : webConfig)
const videoRef = ref<InstanceType<typeof KyVideoDialog> | null>(null)
const videoUrl = ref('')
const isNotCopyImg = ref(false) // 不支持复制图片功能

const getNewClient = async () => {
  const version = navigator.userAgent
  if (version.indexOf('Windows NT 5') !== -1 || version.indexOf('Windows XP') !== -1) return
  const { data } = await getLastClientLink({
    packageType: 'pc',
  })
  let versionLink = 'https://kydl.kyslb.com/ic/KYEClientSetup/KYEClientSetup-V2.2.0.exe'
  if (data) {
    versionLink = data
  }
  downloadConfig.value = downloadConfig.value.map((item) => {
    return item.title === '跨越本地客户端'
      ? {
          ...item,
          url: versionLink,
        }
      : item
  })
}
onMounted(async () => {
  const clientVersion = await getVersion()

  isNotCopyImg.value = isClientMode() ? compareVersions(clientVersion, 'V3.1.1') === -1 : false

  waybillDownloadHelp()
  if (!isClientMode()) {
    getNewClient()
  }
})
const visible = ref(false)

const openDialog = () => {
  visible.value = true
}
const linkClick = (item: DownloadItem) => {
  if (item.type === 'link' && !isClientMode()) {
    window.location.href = item.url!
  }
}

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onloadend = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(blob)
  })
}

// 复制图片(只请求一次图片资源, 两条分支共用同一个 blob)
const copyImg = async (url?: string) => {
  if (!url) return
  try {
    const response = await fetch(url)
    const blob = await response.blob()
    if (isKuaShenClientMode()) {
      const base64 = await blobToBase64(blob)
      base64 && (window as any)['kuasheng_copyImageToClipBoard'](base64.replace('data:image/png;base64,', ''))
    } else {
      await navigator.clipboard.write([new ClipboardItem({ [blob.type]: blob })])
    }
    KMessage.success('复制成功')
  } catch (error) {
    KMessage.error('复制失败')
    console.error('复制图片失败: ', error)
  }
}

const handleVideo = (item: DownloadItem) => {
  if (!item.video) {
    return
  }
  videoUrl.value = item.video
  videoRef.value?.showDialog()
}

/** 电子运单下载 */
const waybillDownloadHelp = async () => {
  try {
    const res = await downloadHelp({ id: '137' })
    waybillAgreement.value = res.data.fileUrl
  } catch (error) {
    console.error(error)
  }
}

defineExpose({ openDialog, handleVideo })
</script>

<style scoped lang="scss">
.wrapper {
  :deep(.el-tabs__nav-wrap::after) {
    height: 1px !important;
  }
  :deep(.el-tabs__item) {
    padding-left: 16px !important;
    padding-right: 16px !important;
  }

  .tab-item,
  .button-item {
    display: flex;
    flex-wrap: wrap;
    // overflow-y: scroll;
    box-sizing: border-box;
  }

  :deep(.k-button) {
    width: 64px;
    height: 20px;
    border-radius: 2px;
    padding: 4px 4px;
  }

  .item-wrapper {
    width: 160px;
    height: 160px;
    border-radius: 4px;
    background: #ffffff;
    text-align: center;
    margin-bottom: 12px;
    position: relative;
    margin-right: 30px;
    border: 1px solid #e5e8ed;
    box-sizing: border-box;

    .icon {
      width: 88px;
      height: 88px;
      margin: 16px auto 0;

      img {
        width: 100%;
        height: 100%;
      }
    }

    .info {
      height: 37px;
      margin-bottom: 16px;
      display: flex;
      flex-direction: column;
      justify-content: space-around;
      align-items: center;

      .title {
        height: 14px;
        font-size: 13px;
        font-weight: bold;
        text-align: center;
        color: #03050d;
        line-height: 14px;
        margin-top: 4px;
        display: flex;
        align-items: center;

        .tip-icon {
          width: 12px;
          height: 12px;
          cursor: pointer;
          margin-left: 4px;
        }
      }

      .desc {
        height: 14px;
        font-size: 12px;
        text-align: center;
        color: #888ea6;
        line-height: 14px;
        margin-bottom: 4px;
      }
    }

    &:hover {
      border: 1px solid #bfbfbf;
      .qrcode-wrapper {
        display: block;
      }
    }

    &:nth-of-type(3n) {
      margin-right: 0;
    }

    .qrcode-wrapper {
      display: none;
      position: absolute;
      top: 0;
      right: 0;
      width: 100%;
      height: 100%;
      background: #fff;
      border-radius: 4px;
      // justify-content: space-around;
      // align-items: center;

      .qrcode {
        width: 100px;
        height: 100px;
        margin: 16px auto 8px;

        img {
          width: 100%;
          height: 100%;
        }
        &.m-tb-auto {
          margin: 30px auto;
        }
      }
    }
  }
}
</style>
<style lang="scss">
/* 老基座 el-dialog 根节点无 padding、header 由全局 element-override 提供 #f1f1f5 下边框，此处一并复刻 */
.download-dialog {
  --k-dialog-body-padding: 8px 24px 12px;
  .el-tabs__active-bar {
    width: 32px !important;
    height: 4px;
    left: 12px;
    border-radius: 9px;
  }
  .el-tabs__item {
    font-weight: 600;
    font-size: 16px;
  }
  .button-item {
    .k-button + .k-button {
      margin-left: 8px;
    }
  }
}

.tip-tooltip {
  height: 25px;
  box-sizing: border-box;
  padding: 6px 8px !important;
  line-height: inherit !important;
}
</style>
