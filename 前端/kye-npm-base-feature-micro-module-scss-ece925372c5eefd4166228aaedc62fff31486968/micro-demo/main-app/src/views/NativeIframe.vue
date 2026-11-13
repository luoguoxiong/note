<template>
  <div class="native-micro-page">
    <div class="native-micro-page__container">
      <iframe
        src="http://localhost:8001/#/admin/user/home"
        frameborder="0"
        class="native-micro-page__iframe"
        sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
      ></iframe>
    </div>
  </div>
</template>

<script setup></script>

<style scoped>
.native-micro-page {
  padding: 20px;
  height: calc(100vh - 120px);
  display: flex;
  flex-direction: column;
}

.native-micro-page__container {
  flex: 1;
  border: 1px solid #ddd;
  border-radius: 8px;
  overflow: hidden;
  background: #fff;
}

.native-micro-page__iframe {
  width: 100%;
  height: 100%;
}
</style>
