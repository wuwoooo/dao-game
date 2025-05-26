<script setup lang="ts">
import { ref, onMounted, provide, onUnmounted } from "vue";
import { useRouter } from "vue-router";
import { getUserInfo as getUserInfoApi } from "./api/user";
import LoginModal from "./components/LoginModal.vue";
import { getQueryParams } from "./utils/auth";
import {
  saveUserInfo,
  getUserInfoFromCache,
  clearUserInfo,
} from "./utils/auth";

const router = useRouter();
const showLoginModal = ref(false);
const userInfo = ref<any>(null);

// 提供给子组件的方法
provide("openLoginModal", () => {
  showLoginModal.value = true;
});
provide("closeLoginModal", () => {
  showLoginModal.value = false;
});
provide("isLoggedIn", () => checkLogin());
provide("userInfo", userInfo);
provide("logout", logout);

function logout() {
  clearUserInfo();
  userInfo.value = null;
  // 如果当前页面需要登录，则重定向到首页
  if (router.currentRoute.value.meta.requiresAuth) {
    router.push("/");
  }
}

function checkLogin() {
  const token = localStorage.getItem("token");
  const uuid = localStorage.getItem("uuid");
  const uid = localStorage.getItem("uid");
  if (!token || !uuid || !uid) {
    return false;
  }
  return true;
}

async function getUserInfo() {
  try {
    const token = localStorage.getItem("token");
    const uuid = localStorage.getItem("uuid");
    const uid = localStorage.getItem("uid");

    if (!token || !uuid || !uid) {
      return;
    }

    const res = await getUserInfoApi({ token, uuid, uid });
    if (res.data && res.data.status === 200 && res.data.attachment) {
      userInfo.value = res.data.attachment;
      saveUserInfo({
        uuid: userInfo.value.uuid,
        token: userInfo.value.token,
        uid: userInfo.value.uid,
        openName: userInfo.value.openName,
      });

      // 刷新页面
      window.location.reload();
    } else {
      console.error("获取用户信息失败:", res.data?.message || "未知错误");
      //此时表明token已过期，需要重新登录
      clearUserInfo();
      // 添加错误提示
      alert("获取用户信息失败，请重新登录");
    }
  } catch (e: any) {
    console.error("获取用户信息失败:", e?.response?.data?.message || e);
    //此时表明token已过期，需要重新登录
    clearUserInfo();
    // 添加错误提示
    alert("获取用户信息失败，请重新登录");
  }
}

// 打开登录模态框的处理函数
const handleOpenLoginModal = () => {
  showLoginModal.value = true;
};

onMounted(async () => {
  userInfo.value = getUserInfoFromCache();

  if (!userInfo.value) {
    if (checkLogin()) {
      await getUserInfo();
    }
  }

  // 监听全局事件，打开登录模态框
  window.addEventListener("open-login-modal", handleOpenLoginModal);
});

onUnmounted(() => {
  // 清理事件监听
  window.removeEventListener("open-login-modal", handleOpenLoginModal);
});

function handleLoginSuccess(data: {
  token: string;
  uuid: string;
  uid: string;
}) {
  localStorage.setItem("token", data.token);
  localStorage.setItem("uuid", data.uuid);
  localStorage.setItem("uid", data.uid);
  showLoginModal.value = false;
  getUserInfo();
}
</script>

<template>
  <div class="min-h-screen bg-slate-100">
    <!-- 全局登录模态框 -->
    <LoginModal
      :visible="showLoginModal"
      @close="showLoginModal = false"
      @success="handleLoginSuccess"
    />

    <router-view v-slot="{ Component }">
      <transition name="fade" mode="out-in">
        <component :is="Component" />
      </transition>
    </router-view>
  </div>
</template>

<style>
/* 页面切换动画 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
