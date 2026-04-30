<template>
  <div class="user-form-page">
    <el-empty description="正在跳转..." />
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

onMounted(() => {
  router.push('/users')
})
</script>

<style scoped>
.user-form-page {
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
}
</style>
