<template>
  <div class="hello-world">
    <h1>{{ msg }}</h1>
  </div>
</template>

<script setup lang="ts">
interface Props {
  msg?: string
}

withDefaults(defineProps<Props>(), {
  msg: 'Hello Vue 3 + TypeScript'
})
</script>

<style scoped>
.hello-world h1 {
  color: #409eff;
  text-align: center;
  padding: 20px 0;
}
</style>
