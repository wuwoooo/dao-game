<template>
  <div>
    <a-spin tip="跳转中..."></a-spin>
  </div>
</template>

<script setup>
import { onMounted } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();

onMounted(() => {
  // 页面加载时自动重定向到列表页面
  router.replace({ name: "lottery-list" });
});
</script>

<style scoped>
div {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 300px;
}
</style>
