<template>
  <div
    v-if="visible"
    class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 backdrop-blur-sm"
  >
    <div
      class="bg-gradient-to-br from-indigo-900 to-purple-900 rounded-xl shadow-2xl w-full max-w-md p-8 relative border border-indigo-500/30"
    >
      <!-- 装饰特效 -->
      <div
        class="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(139,92,246,0.15),transparent_70%)] rounded-xl"
      ></div>
      <div
        class="absolute top-0 left-1/2 h-[1px] w-[40%] -translate-x-1/2 bg-gradient-to-r from-transparent via-indigo-400 to-transparent blur-[2px] animate-[shine_4s_ease-in-out_infinite]"
      ></div>
      <div
        class="absolute bottom-0 left-1/2 h-[1px] w-[40%] -translate-x-1/2 bg-gradient-to-r from-transparent via-purple-400 to-transparent blur-[2px] animate-[shine_4s_ease-in-out_infinite_1s]"
      ></div>

      <!-- 关闭按钮 -->
      <button
        class="absolute top-3 right-3 text-indigo-300 hover:text-white text-2xl transition-colors"
        @click="$emit('close')"
      >
        &times;
      </button>

      <!-- 标题 -->
      <h2
        class="text-2xl font-bold mb-6 text-center text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 to-purple-200 relative"
      >
        <svg
          class="w-6 h-6 text-indigo-400 inline-block mr-2"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
          />
        </svg>
        连接Web3钱包
      </h2>

      <form @submit.prevent="handleLogin" class="relative">
        <div class="mb-5">
          <label class="block text-indigo-200 mb-2 text-sm">邮箱地址</label>
          <div class="relative">
            <div class="absolute inset-y-0 left-0 flex items-center pl-3">
              <svg
                class="w-5 h-5 text-indigo-300"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
            </div>
            <input
              v-model="email"
              type="email"
              required
              class="w-full bg-indigo-900/50 border border-indigo-500/30 rounded-lg px-10 py-3 text-white placeholder-indigo-300/70 focus:outline-none focus:ring-2 focus:ring-indigo-400/70"
              placeholder="请输入邮箱"
            />
          </div>
        </div>

        <div class="mb-6">
          <label class="block text-indigo-200 mb-2 text-sm">密码</label>
          <div class="relative">
            <div class="absolute inset-y-0 left-0 flex items-center pl-3">
              <svg
                class="w-5 h-5 text-indigo-300"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
            </div>
            <input
              v-model="password"
              type="password"
              required
              class="w-full bg-indigo-900/50 border border-indigo-500/30 rounded-lg px-10 py-3 text-white placeholder-indigo-300/70 focus:outline-none focus:ring-2 focus:ring-indigo-400/70"
              placeholder="请输入密码"
            />
          </div>
        </div>

        <button
          type="submit"
          :disabled="loading"
          class="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold py-3 rounded-lg transition-all relative overflow-hidden shadow-lg shadow-indigo-900/30 group"
        >
          <span class="relative z-10">{{
            loading ? "登录中..." : "连接钱包"
          }}</span>
          <div
            class="absolute inset-0 scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-500 bg-gradient-to-r from-indigo-700/80 to-purple-700/80"
          ></div>
        </button>

        <p
          v-if="error"
          class="text-red-300 text-sm mt-4 text-center bg-red-900/20 py-2 px-3 rounded-lg border border-red-500/30"
        >
          {{ error }}
        </p>
      </form>

      <div class="mt-6 text-center text-indigo-300/70 text-xs">
        点击连接钱包, 使用Web3身份获取链上资产
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { userSignIn } from "../api/user";
import md5 from "md5";

const props = defineProps<{ visible: boolean }>();
const emit = defineEmits(["success", "close"]);

const email = ref("");
const password = ref("");
const loading = ref(false);
const error = ref("");

async function handleLogin() {
  error.value = "";
  loading.value = true;
  try {
    const salt = "dig?F*ckDang5PaSsWOrd&%(polarisex0160630).";
    const encryptedPassword = md5(password.value + salt);

    const res = await userSignIn({
      phone: email.value,
      password: encryptedPassword,
      source: "1",
    });

    if (res.data && res.data.status === 200 && res.data.attachment) {
      const { token, uuid, uid } = res.data.attachment;
      if (token && uuid && uid) {
        emit("success", {
          token,
          uuid,
          uid,
        });
      } else {
        error.value = "登录失败，返回数据不完整";
      }
    } else if (res.data && res.data.message) {
      error.value = res.data.message;
    } else {
      error.value = "登录失败，请检查邮箱和密码";
    }
  } catch (e: any) {
    error.value = e?.response?.data?.message || "登录失败";
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
@keyframes shine {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(100%);
  }
}
</style>
