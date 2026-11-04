<template>
  <div id="module-loading">
    <img
      src="https://ic-img.ky-express.com/netc/20240424_7227039519_!!1713947528011_23_23.png"
      class="spinner"
      alt=""
    />
  </div>
</template>
<style lang="scss" scoped>
#module-loading {
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
  background-color: white;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 10;
}
.spinner {
  width: 23px;
  height: 23px;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>
