<template>
  <div class="address-info"></div>
</template>
<script setup lang="ts">
import { EstimateFeeByTaskIdResponseResultItem } from '@order-public-sub-public/apis/waybill/estimated-cost'

interface IProps {
  index: number
  result: EstimateFeeByTaskIdResponseResultItem
}
defineProps<IProps>()
</script>
