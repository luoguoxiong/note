<template>
  <div class="native">
    <Button class="button" type="primary" @click="reload">刷新</Button>

    <Button class="button" type="primary" @click="saveImageToPhotosAlbum"
      >saveImageToPhotosAlbum</Button
    >

    <Button class="button" type="primary" @click="shareApp">shareApp</Button>

    <Button class="button" type="primary" @click="chooseImage">chooseImage</Button>

    <Button class="button" type="primary" @click="scanQRCode">scanQRCode</Button>

    <Button class="button" type="primary" @click="navigateTo">navigateTo</Button>

    <Button class="button" type="primary" @click="navigateBack">navigateBack</Button>

    <Button class="button" type="primary" @click="share" v-if="isWxApplet"
      >小程序share</Button
    >

    <Button class="button" type="primary" @click="aliShare" v-if="isAliPayClient"
      >支付宝share</Button
    >

    <Button class="button" type="primary" @click="shareLink" v-if="isAppBrowse"
      >App分享链接share</Button
    >

    <Button class="button" type="primary" @click="shareImage" v-if="isAppBrowse"
      >App分享图片share</Button
    >

    <Button class="button" type="primary" @click="shareMini" v-if="isAppBrowse"
      >App分享小程序share</Button
    >

    <Button class="button" type="primary" @click="previewImage">previewImage</Button>

    <Button class="button" type="primary" @click="login">login</Button>

    <Button class="button" type="primary" @click="postMessage">postMessage</Button>

    <Button class="button" type="primary" @click="getLocation">getLocation</Button>

    <Button class="button" type="primary" @click="openLocation">openLocation</Button>

    <Button class="button" type="primary" @click="openWebview">openWebview</Button>

    <Button class="button" type="primary" @click="openPreloadCacheWebView"
      >App openPreloadCacheWebView</Button
    >

    <Button class="button" type="primary" @click="chooseFile">App chooseFile</Button>

    <Button class="button" type="primary" @click="checkApi">App checkApi</Button>

    <Button class="button" type="primary" @click="showSoftKeyboard"
      >App showSoftKeyboard</Button
    >

    <Button class="button" type="primary" @click="refreshSearch">refreshSearch</Button>

    <Button class="button" type="primary" @click="getClipboardData"
      >App getClipboardData</Button
    >

    <Button class="button" type="primary" @click="setNavigationBar"
      >App setNavigationBar</Button
    >

    <Button class="button" type="primary" @click="openMiniProgram"
      >App openMiniProgram</Button
    >

    <Button class="button" type="primary" @click="checkBluetoothAuth"
      >App checkBluetoothAuth</Button
    >

    <Button class="button" type="primary" @click="getBluetoothDevice"
      >App getBluetoothDevice</Button
    >

    <Button class="button" type="primary" @click="sendBluetoothData"
      >App sendBluetoothData</Button
    >

    <Button class="button" type="primary" @click="jumpBluetoothDeviceList"
      >App jumpBluetoothDeviceList</Button
    >

    <Button class="button" type="primary" @click="jumpPrintPage"
      >App jumpPrintPage</Button
    >

    <Button class="button" type="primary" @click="openBluetoothSet"
      >App openBluetoothSet</Button
    >

    <Button class="button" type="primary" @click="downloadImage"
      >App/Ali downloadImage</Button
    >

    <Button class="button" type="primary" @click="downloadFile"
      >App/Ali downloadFile</Button
    >

    <Button class="button" type="primary" @click="openFile">App openFile</Button>

    <Button class="button" type="primary" @click="toast">App toast</Button>

    <Button class="button" type="primary" @click="logout">App logout</Button>

    <Button class="button" type="primary" @click="disableOnBack"
      >App disableOnBack</Button
    >

    <Button class="button" type="primary" @click="openCamera">App openCamera</Button>

    <Button class="button" type="primary" @click="selectPhotosFromSD"
      >App selectPhotosFromSD</Button
    >

    <Button class="button" type="primary" @click="closeWindow">App closeWindow</Button>

    <Button class="button" type="primary" @click="jumpToNativePage"
      >App jumpToNativePage</Button
    >

    <Button class="button" type="primary" @click="hasPrivacyAuth"
      >App hasPrivacyAuth
    </Button>

    <Button class="button" type="primary" @click="recallPrivacyAuth"
      >App recallPrivacyAuth
    </Button>

    <Button class="button" type="primary" @click="jumpNative">App jumpNative </Button>
  </div>
</template>

<script setup lang="ts">
import { Button } from "vant";
import { isAppBrowse, isWxApplet, isAliPayClient } from "@kye-netc/utils";
import { native } from "./native";

const reload = () => {
  location.reload();
};

const saveImageToPhotosAlbum = async () => {
  try {
    await native.saveImageToPhotosAlbum(
      "https://ic-h5.kye-erp.com/intro/miniprogram/share_router.png"
    );
  } catch (error) {
    console.error("error", error.code);
  }
};

const chooseImage = async () => {
  try {
    const result = await native.chooseImage({
      count: 4,
      sizeType: ["original", "compressed"],
      sourceType: ["album", "camera"],
    });
    console.error(result);
  } catch (error) {
    console.error("error", error.code);
  }
};

const scanQRCode = async () => {
  try {
    const result = await native.scanQRCode({ needResult: 1 });
    console.log(result);
  } catch (error) {
    console.error("error", error);
  }
};

const navigateTo = async () => {
  try {
    let url = "";
    if (isWxApplet) {
      url = "/packages/webview/openWebview";
    } else if (isAliPayClient) {
      url = "/modules/webview/pages/webview/index";
    } else if (isAppBrowse) {
      url = "login";
    }
    await native.navigateTo({
      url,
      params: { url: location.href },
    });
  } catch (error) {
    console.error("error", error);
  }
};

const navigateBack = async () => {
  await native.navigateBack();
};

const aliShare = async () => {
  await native.share({
    title: "小程序示例",
    desc: "小程序官方示例Demo，展示已支持的接口能力及组件。",
    path: "page/index/index?key1=value1&key2=value2", //在path路径后直接拼接参数，参数传递遵循 http get 的传参规则
    searchTip: "**小程序",
    content: "我是自定义分享测试吱口令文案",
    imageUrl:
      "https://gw.alipayobjects.com/mdn/rms_eb2664/afts/img/A*bFuBQZuNErMAAAAAAAAAAABkARQnAQ",
    bgImgUrl:
      "https://gw.alipayobjects.com/mdn/rms_eb2664/afts/img/A*bFuBQZuNErMAAAAAAAAAAABkARQnAQ",
  });
};

const share = async () => {
  await native.share({
    title: "分享标题",
    imageUrl: "https://ic-h5.kye-erp.com/intro/miniprogram/share_router.png",
    programPath: "pages/index/index",
    contentType: "miniprogram",
  });
};

const shareLink = async () => {
  await native.share({
    platform: "weixin",
    title: "分享标题",
    desc: "分享描述",
    imgUrl: "https://ic-h5.kye-erp.com/intro/miniprogram/share_router.png",
    link: "https://www.baidu.com/",
    contentType: "url",
  });
};

const shareImage = async () => {
  await native.share({
    platform: "weixin",
    imgUrl:
      "https://ic-img.ky-express.com/netc/20250308_66270395148_!!1741419273649_112_112.png",
    contentType: "image",
  });
};

const shareApp = async () => {
  await native.shareApp(2);
};

const shareMini = async () => {
  await native.share({
    platform: "weixin",
    programUserName: "gh_d79c049b27d0",
    programPath: "/pages/home/home",
    imgUrl:
      "https://ic-img.ky-express.com/netc/20250308_66270395148_!!1741419273649_112_112.png",
    programType: 2,
    contentType: "miniprogram",
  });
};

const previewImage = async () => {
  await native.previewImage({
    urls: [
      "https://ic-h5.kye-erp.com/intro/miniprogram/share_router.png",
      "https://ic-img.ky-express.com/netc/20250308_66270395148_!!1741419273649_112_112.png",
    ],
    current:
      "https://ic-img.ky-express.com/netc/20250308_66270395148_!!1741419273649_112_112.png",
  });
};

const login = () => {
  native.login();
};

const postMessage = () => {
  native.postMessage({
    title: "分享标题",
    imageUrl: "https://ic-h5.kye-erp.com/intro/miniprogram/share_router.png",
    contentType: 1,
  });
};

const getLocation = async () => {
  try {
    const res = await native.getLocation({
      type: "wgs84",
    });
    console.log(JSON.stringify(res));
  } catch (error) {
    console.error(error.code);
  }
};

const openLocation = async () => {
  // 假设深圳市的经纬度是：经度 114.057865，纬度 22.543993
  const latitude = 22.543993;
  const longitude = 114.057865;
  await native.openLocation({
    latitude,
    longitude,
    scale: 14, // 缩放比例，范围5~18，默认为14
    name: "深圳市", // 位置名
    address: "深圳市", // 地址的详细说明
  });
};

const openWebview = async () => {
  await native.openWebview({ needLogin: false, url: location.href });
};

const openPreloadCacheWebView = async () => {
  await native.openPreloadCacheWebView({ page: "singleOrder" });
};

const chooseFile = async () => {
  try {
    const res = await native.chooseFile({
      fileType: ["xls", "xlsx", "doc", "docx", "pdf"],
    });
    console.log(res);
  } catch (error) {
    console.log(error.code);
  }
};

const checkApi = async () => {
  try {
    const res = await native.checkApi({
      api: "chooseFile2",
    });
    console.log(res);
  } catch (error) {
    console.log(error.code);
  }
};

const showSoftKeyboard = async () => {
  try {
    const res = await native.showSoftKeyboard({});
    console.log(res);
  } catch (error) {
    console.log(error.code);
  }
};

const refreshSearch = async () => {
  try {
    await native.refreshSearch();
  } catch (error) {
    console.log(error.code);
  }
};

const getClipboardData = async () => {
  try {
    const res = await native.getClipboardData({ necessary: true });
    console.log(res);
  } catch (error) {
    console.log(error.code);
  }
};

const setNavigationBar = async () => {
  try {
    const res = await native.setNavigationBar({ isHidden: Math.random() > 0.5 });
    console.log(res);
  } catch (error) {
    console.log(error.code);
  }
};

const openMiniProgram = async () => {
  try {
    const res = await native.openMiniProgram({
      appid: "wxb3c0dc14850a5358", // 无效appid
      userName: "gh_8446123ed7a1",
      miniprogramType: 0,
      miniProgramName: "跨越个人介绍",
    });
    console.log(res);
  } catch (error) {
    console.log(error.code);
  }
};

const checkBluetoothAuth = async () => {
  try {
    const res = await native.checkBluetoothAuth();
    console.log(res);
  } catch (error) {
    console.log(error.code);
  }
};

const getBluetoothDevice = async () => {
  try {
    const res = await native.getBluetoothDevice();
    console.log(res);
  } catch (error) {
    console.log(error.code);
  }
};

const sendBluetoothData = async () => {
  try {
    const res = await native.sendBluetoothData({});
    console.log(res);
  } catch (error) {
    console.log(error.code);
  }
};

const jumpBluetoothDeviceList = async () => {
  try {
    const res = await native.jumpBluetoothDeviceList();
    console.log(res);
  } catch (error) {
    console.log(error.code);
  }
};

const jumpPrintPage = async () => {
  try {
    const res = await native.jumpPrintPage();
    console.log(res);
  } catch (error) {
    console.log(error.code);
  }
};

const openBluetoothSet = async () => {
  try {
    const res = await native.openBluetoothSet();
    console.log(res);
  } catch (error) {
    console.log(error.code);
  }
};

const downloadImage = async () => {
  try {
    const res = await native.downloadImage({
      imageData: "https://ic-h5.kye-erp.com/intro/miniprogram/share_router.png",
    });
    console.log(res);
  } catch (error) {
    console.log(error.code);
  }
};

const downloadFile = async () => {
  try {
    const res = await native.downloadFile({
      url: "https://ic-h5.kye-erp.com/intro/miniprogram/share_router.png",
    });
    console.log(res);
  } catch (error) {
    console.log(error.code);
  }
};

const openFile = async () => {
  try {
    const res = await native.openFile({
      url: "https://ic-h5.kye-erp.com/intro/miniprogram/share_router.png",
    });
    console.error("openFile", res);
  } catch (error) {
    console.log(error.code);
  }
};

const toast = async () => {
  try {
    const res = await native.toast({
      message: "弹窗提示",
    });
    console.log(res);
  } catch (error) {
    console.error(error);
  }
};
const logout = async () => {
  try {
    const res = await native.logout();
    console.log(res);
  } catch (error) {
    console.error(error);
  }
};

const disableOnBack = async () => {
  try {
    await native.disableOnBack();
  } catch (error) {
    console.error(error);
  }
};

const openCamera = async () => {
  try {
    const res = await native.openCamera();
    console.log(res);
  } catch (error) {
    console.error(error);
  }
};

const selectPhotosFromSD = async () => {
  try {
    const res = await native.selectPhotosFromSD({ count: 2 });
    console.log(res);
  } catch (error) {
    console.error(error);
  }
};

const closeWindow = async () => {
  try {
    await native.closeWindow();
  } catch (error) {
    console.error(error);
  }
};

const jumpToNativePage = async () => {
  try {
    await native.jumpToNativePage({ pageCode: 5 });
  } catch (error) {
    console.error(error);
  }
};

const hasPrivacyAuth = async () => {
  try {
    const res = await native.hasPrivacyAuth();
  } catch (error) {
    console.error(error);
  }
};

const recallPrivacyAuth = async () => {
  try {
    const res = await native.recallPrivacyAuth();
  } catch (error) {
    console.error(error);
  }
};

const jumpNative = async () => {
  await native.jumpNative({ target: "locationSetting" });
};
</script>
<style scoped>
.button {
  width: 100%;
  margin-bottom: 20px;
}
.native {
  padding: 20px;
}
</style>
