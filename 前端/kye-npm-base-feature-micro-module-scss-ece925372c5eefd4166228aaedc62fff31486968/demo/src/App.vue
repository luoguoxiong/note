<template>
  <FsTemplate></FsTemplate>
  <!-- <OtherTemplate v-else></OtherTemplate> -->
</template>
<script setup lang="ts">
import FsTemplate from "./fs.vue";
import OtherTemplate from "./other.vue";
import { isH5FSEnv } from "@kye-netc/utils";
</script>
