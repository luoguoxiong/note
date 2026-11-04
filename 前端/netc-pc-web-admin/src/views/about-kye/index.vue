<!-- 关于跨越（来源: netc-pc-web/src/views/about-kye/index.vue） -->
<template>
  <div class="container" v-if="viewerVisible">
    <div class="pTitle-container">
      <div class="pageTitle">
        {{ pageTitle }}
      </div>
    </div>

    <div class="page-border">
      <div class="text-container">
        <div class="itemTitle title">
          {{ pageTitle }}
        </div>
        <div class="itemContent">
          {{ itemContent }}
        </div>
        <div class="itemTitle title">
          {{ itemTitle }}
        </div>
      </div>
      <div class="image-container">
        <div class="image-item" v-for="item in picList" :key="item.picUrl">
          <img class="image" :src="item.picUrl" @click="imageAction(item.picUrl)" />
          <p class="imageText">
            {{ item.picTitle }}
          </p>
        </div>
      </div>
    </div>

    <el-image-viewer v-if="imgViewerVisible" :url-list="preview" :z-index="9999" @close="closeImgViewer" />
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { getCompanyIntroduction, CompanyIntroductionPic } from '@/apis/aboutKye'

const pageTitle = ref('')
const itemTitle = ref('')
const itemContent = ref('')
const preview = ref<string[]>([])
const imgViewerVisible = ref(false)
const viewerVisible = ref(false)
const picList = ref<CompanyIntroductionPic[]>([])

const imageAction = (picUrl: string) => {
  preview.value = [picUrl]
  imgViewerVisible.value = true
}

const closeImgViewer = () => {
  imgViewerVisible.value = false
}

const getCompanyIntro = async () => {
  try {
    const res = await getCompanyIntroduction()
    const { picList: pics, content, title1, title2 } = res.data
    pageTitle.value = title1
    itemTitle.value = title2
    itemContent.value = content
    picList.value = pics || []
    viewerVisible.value = true
  } catch (error) {
    console.log(error)
  }
}

onMounted(() => {
  getCompanyIntro()
})
</script>

<style lang="scss" scoped>
.container {
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: flex-start;
  background-color: #ffffff;
  width: 100%;
  height: 100%;
}

.pTitle-container {
  width: 100%;
  height: 40px;
  background-color: #ffffff;
  border-bottom-left-radius: 4px;
  border-bottom-right-radius: 4px;
  padding-bottom: 8px;
}

.page-border {
  width: 100%;
  height: 100%;
  box-sizing: border-box;
  background-color: #ffffff;
  margin-top: 10px;
  border-top-left-radius: 4px;
  border-top-right-radius: 4px;
  padding-top: 20px;
}

.text-container {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.title {
  position: relative;
}

.title::before {
  content: '';
  width: 4px;
  height: 14px;
  background-color: #8365f6;
  position: absolute;
  top: 0;
  left: 0;
}

.pageTitle {
  align-items: left;
  text-align: left;
  justify-content: left;
  color: #03050d;
  font-family: PingFang SC;
  font-weight: normal;
  font-size: 16px;
  font-weight: 600;
  line-height: 16px;
  padding-top: 16px;
  padding-bottom: 20px;
  padding-left: 20px;
}

.itemTitle {
  justify-content: left;
  text-align: left;
  color: #03050d;
  font-family: PingFang SC;
  font-weight: normal;
  font-size: 14px;
  font-weight: 600;
  line-height: 14px;
  letter-spacing: 0px;
  margin-left: 20px;
  padding-left: 12px;
  padding-bottom: 20px;
}

.itemContent {
  position: static;
  justify-content: left;
  text-align: left;
  font-size: 14px;
  color: #03050d;
  font-family: PingFang SC;
  font-weight: normal;
  line-height: 28px;
  letter-spacing: 0px;
  padding-bottom: 16px;
  padding-left: 20px;
  width: 100%;
  box-sizing: border-box;
}

.image-container {
  display: flex;
  justify-content: left;
  align-items: left;
  margin-left: 20px;
}

.image-item {
  align-items: center;
}

.image {
  max-width: 320px;
  height: auto;
  margin-right: 18px;
}

.imageText {
  text-align: center;
  font-size: 14px;
  color: #03050d;
  font-family: PingFang SC;
  font-weight: normal;
  padding-top: 8px;
}
</style>
