<template>
  <k-dialog
    v-model="dialogVisible"
    title="切换客户手机号"
    width="400px"
    append-to-body
    :loading="submitLoading"
    @confirm="submitEvent"
    @closed="handleClosed"
  >
    <div class="content">
      <k-form ref="formRef" class="form" :model="formData" :rules="rules" label-position="top" @submit.prevent>
        <k-form-item label="填写手机号" prop="userAccount">
          <k-input v-model="formData.userAccount" :maxlength="11" @input="inputHandler" />
        </k-form-item>
      </k-form>
      <div class="history-wrapper">
        <span>上次填写手机号</span>
        <div class="history" v-if="history.length">
          <k-tooltip
            v-for="(item, index) in history"
            :key="index"
            color-type="white"
            placement="top-start"
            :show-after="1000"
            :content="`${formatMobile(item.account)} ${item.company || ''}`"
          >
            <div class="item" :class="historySelect === index ? 'selected' : ''" @click="historyClick(index)">
              <span class="number">{{ formatMobile(item.account) }}</span>
              <span class="company">{{ item.company || '' }}</span>
            </div>
          </k-tooltip>
        </div>
      </div>
    </div>
  </k-dialog>
</template>

<script setup lang="ts">
/**
 * 切换客户手机号(白名单)弹窗
 * 来源: netc-pc-web/src/views/layout/white-list.vue
 * 迁移说明:
 *  - ky-dialog/el-form/el-input/el-tooltip -> k-dialog/k-form/k-input/k-tooltip(k-dialog 默认 footer 取消/确定)
 *  - login().loginSucess(isWhiteListChange) -> useSwitchLoginSuccess.switchLoginSuccess
 *    (老基座 isWhiteListChange 用于跳过 /guide 引导页, 新基座无引导页, 直接复用切换登录手机号成功链路)
 *  - 老 $emit('getUserInfo') 刷新公众号关注 flag(vuex UPDATE_SHOW_WX_FLAG), 新基座无该体系, 略
 *  - 表单区背景装饰图: 老本地 asset switch-header-bg.png -> CDN 链接
 *  - 白名单历史: localStorage WHITE_LIST_HISTORY(键名与老基座一致, 满 12 条淘汰末位)
 */
import { computed, ref, watch } from 'vue'
import { KMessage, type KFormInstance, KDialog, KForm, KFormItem, KInput, KTooltip } from '@netc-design-pc/ui'
import { changeAccountApi } from '../api'
import { useSwitchLoginSuccess } from '../hooks/useSwitchLoginSuccess'

defineOptions({ name: 'WhiteListDialog' })

const props = defineProps<{ modelValue: boolean }>()
const emit = defineEmits<{ (e: 'update:modelValue', value: boolean): void }>()

const dialogVisible = computed({
  get: () => props.modelValue,
  set: (value: boolean) => emit('update:modelValue', value),
})

/** 手机号校验正则(老 utils/regular mobileNumber) */
const MOBILE_REG = /^1[3456789]\d{9}$/

/** 手机号 3-4-4 分组展示(老 utils/format formatMobliePhone) */
const formatMobile = (mobile = '') => {
  if (!mobile || String(mobile).trim().length !== 11) return mobile || ''
  return String(mobile)
    .replace(/^(\d{3})(\d{0,4})(\d+)?/, '$1 $2 $3')
    .trim()
}

// ==================== 白名单历史记录(localStorage WHITE_LIST_HISTORY) ====================

interface WhiteListHistoryItem {
  account: string
  company?: string
}

const HISTORY_KEY = 'WHITE_LIST_HISTORY'
const HISTORY_LIMIT = 12

const getWhiteListHistory = (): WhiteListHistoryItem[] => {
  try {
    return JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]') || []
  } catch (e) {
    return []
  }
}

/** 登录过的账号优先级提升: 同账号置顶去重, 满 12 条先淘汰末位(对齐老 utils/storage setWhiteListHistory) */
const setWhiteListHistory = (data: WhiteListHistoryItem) => {
  let list = getWhiteListHistory()
  const index = list.findIndex((val) => val.account === data.account)
  if (index > -1) {
    list = [data, ...list.filter((val) => val.account !== data.account)]
  } else {
    if (list.length >= HISTORY_LIMIT) list.pop()
    list.unshift(data)
  }
  localStorage.setItem(HISTORY_KEY, JSON.stringify(list))
}

// ==================== 表单 ====================

const formRef = ref<KFormInstance | null>(null)
const submitLoading = ref(false)
const historySelect = ref(-1)
const history = ref<WhiteListHistoryItem[]>([])

const formData = ref({ userAccount: '' })

const checkMobile = (_rule: unknown, value: string, callback: (error?: Error) => void) => {
  if (!MOBILE_REG.test(value || '') || (value || '').length !== 11) {
    return callback(new Error('请输入正确的手机号'))
  }
  callback()
}

const rules = {
  userAccount: [
    { validator: checkMobile, trigger: 'blur' },
    { validator: checkMobile, trigger: 'change' },
  ],
}

const { switchLoginSuccess } = useSwitchLoginSuccess()

// 每次打开刷新历史记录
watch(
  () => props.modelValue,
  (val) => {
    if (val) {
      history.value = getWhiteListHistory()
    }
  }
)

/** 历史项点击回填 */
const historyClick = (index: number) => {
  historySelect.value = index
  formData.value.userAccount = history.value[index].account
}

/** 手动输入后取消历史选中态 */
const inputHandler = () => {
  if (historySelect.value !== -1) {
    historySelect.value = -1
  }
}

/** 提交切换(对齐老 white-list submitEvent; 成功后 switchLoginSuccess 整页刷新, 失败保持弹窗) */
const submitEvent = async () => {
  if (submitLoading.value) return
  let valid = false
  try {
    valid = (await formRef.value?.elFormRef.validate()) ?? false
  } catch (e) {
    valid = false
  }
  if (!valid) return
  submitLoading.value = true
  try {
    const res = await changeAccountApi(formData.value.userAccount)
    if (res.code === 0) {
      // 切换成功后本地写入历史记录
      setWhiteListHistory({ account: formData.value.userAccount, company: res.data?.customerShortName })
      KMessage.success('切换成功')
      // 清会话写入新登录态后整页刷新重建
      switchLoginSuccess(res.data)
    }
  } catch (e: any) {
    if (e?.msg) KMessage.error(e.msg)
  } finally {
    submitLoading.value = false
    inputHandler()
  }
}

/** 关闭后重置表单与选中态(对齐老 watch dialogVisible resetFields) */
const handleClosed = () => {
  formRef.value?.elFormRef.resetFields()
  historySelect.value = -1
}
</script>

<style lang="scss" scoped>
.content {
  .form {
    width: 360px;
    height: 100px;
    border-radius: 4px;
    box-sizing: border-box;
    padding: 20px 16px;
    margin: 0 auto 13px;
    background-color: #f4f7fe;
    // 背景装饰图(老本地 asset switch-header-bg.png -> CDN)
    background-image: url('https://ic-img.ky-express.com/netc/20261102_64372_!!1793611310076_110_110.png');
    background-repeat: no-repeat;
    background-size: 55px;
    background-position: right top;

    :deep(.el-form-item) {
      .el-form-item__label {
        height: 20px;
        font-size: 14px;
        font-weight: bold;
        text-align: left;
        color: #333333;
        line-height: 20px;
      }
    }
  }

  .history-wrapper {
    height: 252px;

    > span {
      font-size: 14px;
      text-align: left;
      color: #8f8fa8;
      line-height: 20px;
    }

    .history {
      margin-top: 12px;
      margin-left: -10px;
      display: flex;
      flex-wrap: wrap;

      .item {
        width: 175px;
        height: 30px;
        margin-left: 10px;
        margin-bottom: 8px;
        background: #ffffff;
        border: 1px solid #e5e5e5;
        border-radius: 4px;
        box-sizing: border-box;
        padding: 0 8px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        line-height: 30px;
        cursor: pointer;

        .number {
          font-size: 14px;
          color: #333333;
          margin-right: 8px;
        }

        .company {
          margin-top: -3px;
          font-size: 13px;
          color: #8f8fa8;
        }

        &.selected {
          border-color: var(--k-color-purple-05);

          .number,
          .company {
            color: var(--k-color-purple-05);
          }
        }
      }
    }
  }
}
</style>
