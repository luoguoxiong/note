<template>
  <ContactBusiness v-model:show="visible" :phone="phone" :roleName="roleName" :customerCode="customerCode" />
</template>
<script setup lang="ts">
import ContactBusiness from '@/public/components/business/contact-business/index.vue'
import { useContactBusiness } from '@order-public-sub-public/components/business/contact-business/hooks/useState'

const { visible, phone, roleName, customerCode } = useContactBusiness()
</script>
