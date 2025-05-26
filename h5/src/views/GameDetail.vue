<template>
  <div class="container mx-auto p-0 md:p-0 lg:p-0">
    <!-- 页眉 -->
    <header
      class="py-4 px-4 md:px-6 lg:px-8 sticky top-0 bg-white/90 backdrop-blur-md z-50 shadow-sm"
    >
      <div class="container mx-auto flex items-center justify-between">
        <!-- Logo -->
        <div class="text-2xl font-bold text-indigo-600">
          <i class="fas fa-rocket mr-1"></i>DaoGame
        </div>

        <!-- 用户链接/登录 -->
        <nav style="display: none">
          <div v-if="isLoggedIn()" class="flex items-center">
            <router-link
              to="/my-games"
              class="text-slate-600 hover:text-indigo-600 flex items-center mr-4"
            >
              <i class="fas fa-gamepad text-xl mr-1"></i>
              <span class="text-sm hidden sm:inline">我的游戏</span>
            </router-link>
            <button
              @click="logout"
              class="text-slate-600 hover:text-indigo-600 flex items-center"
            >
              <i class="fas fa-sign-out-alt text-xl mr-1"></i>
              <span class="text-sm hidden sm:inline">退出</span>
            </button>
          </div>
          <button
            v-else
            @click="openLoginModal"
            class="text-slate-600 hover:text-indigo-600 flex items-center"
          >
            <i class="fas fa-user-circle text-xl mr-1"></i>
            <span class="text-sm hidden sm:inline">登录</span>
          </button>
        </nav>
      </div>
    </header>

    <!-- 主内容区 -->
    <main class="pt-4">
      <div v-if="loading" class="text-center py-8">
        <div
          class="inline-block animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-500 mb-6"
        ></div>
        <p class="text-gray-600">加载中...</p>
      </div>

      <div v-else-if="error" class="text-center py-8">
        <i class="fas fa-exclamation-triangle text-5xl text-red-500 mb-4"></i>
        <p class="text-red-600">{{ error }}</p>
        <button
          @click="fetchGameDetail"
          class="mt-4 bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
        >
          重试
        </button>
      </div>

      <div v-else-if="game" class="px-4 md:px-6 lg:px-8">
        <!-- 返回按钮 -->
        <div class="mb-4">
          <router-link
            to="/"
            class="text-indigo-600 flex items-center hover:text-indigo-800 transition-colors"
          >
            <i class="fas fa-arrow-left mr-2"></i>
            返回首页
          </router-link>
        </div>

        <div class="bg-white rounded-xl shadow-lg overflow-hidden">
          <!-- 游戏封面图 -->
          <div class="w-full h-64 md:h-80 lg:h-96 relative overflow-hidden">
            <img
              :src="game.icon || game.coverImage"
              :alt="game.name"
              class="w-full h-full object-cover"
            />
            <div
              class="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-6"
            >
              <div class="flex items-center justify-between">
                <h1 class="text-3xl font-bold text-white">{{ game.name }}</h1>
                <span
                  class="px-4 py-2 bg-indigo-500 text-white rounded-full text-sm font-medium"
                >
                  {{ game.type === "Game" ? "游戏" : "应用" }}
                </span>
              </div>
            </div>
          </div>

          <div class="p-6 md:p-8">
            <!-- 游戏描述 -->
            <p class="text-gray-700 mb-6 leading-relaxed">
              {{ game.description }}
            </p>

            <!-- 标签 -->
            <div class="flex flex-wrap gap-2 mb-6">
              <span
                v-for="tag in game.tags?.split(',')"
                :key="tag"
                class="px-3 py-1 bg-indigo-100 text-indigo-600 text-sm rounded-full"
              >
                {{ tag }}
              </span>
            </div>

            <!-- 统计信息 -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <div class="bg-gray-50 p-4 rounded-lg text-center">
                <h3 class="text-sm text-gray-500 mb-1">点击量</h3>
                <p class="text-2xl font-semibold text-indigo-600">
                  {{ game.clickCount || 0 }}
                </p>
              </div>
              <div class="bg-gray-50 p-4 rounded-lg text-center">
                <h3 class="text-sm text-gray-500 mb-1">上架时间</h3>
                <p class="text-lg font-semibold text-gray-700">
                  {{ formatDate(game.createdAt) }}
                </p>
              </div>
              <div class="bg-gray-50 p-4 rounded-lg text-center">
                <h3 class="text-sm text-gray-500 mb-1">所有者</h3>
                <p class="text-lg font-semibold text-gray-700">
                  {{ game.ownerName }}
                </p>
              </div>
            </div>

            <!-- 操作按钮 -->
            <div class="flex justify-center md:justify-start">
              <router-link
                v-if="game.embedUrl"
                :to="`/game/${game.id}/play`"
                class="bg-indigo-600 text-white px-8 py-3 rounded-lg hover:bg-indigo-700 button-hover-scale flex items-center"
                @click="handleGameClick"
              >
                <i class="fas fa-play-circle mr-2"></i>
                开始体验
              </router-link>
              <button
                v-else
                class="bg-gray-600 text-white px-8 py-3 rounded-lg cursor-not-allowed flex items-center"
                disabled
              >
                <i class="fas fa-clock mr-2"></i>
                暂未开放
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, inject } from "vue";
import { useRoute } from "vue-router";
import { getGameDetailH5, recordClick, recordView } from "../api/game";

interface Game {
  id: string;
  name: string;
  type: string;
  description: string;
  icon: string;
  coverImage?: string;
  url: string;
  status: string;
  tags?: string;
  clickCount?: number;
  createdAt?: string;
  ownerName?: string;
  embedUrl?: string;
}

const route = useRoute();
const game = ref<Game | null>(null);
const loading = ref(true);
const error = ref("");

// 注入全局方法
const openLoginModal = inject("openLoginModal") as () => void;
const isLoggedIn = inject("isLoggedIn") as () => boolean;
const logout = inject("logout") as () => void;

function formatDate(dateString?: string) {
  if (!dateString) return "未知";
  const date = new Date(dateString);
  return date.toLocaleDateString("zh-CN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

async function fetchGameDetail() {
  const gameId = route.params.id as string;
  loading.value = true;
  error.value = "";
  try {
    const res = await getGameDetailH5(gameId);
    if (res.data) {
      game.value = res.data;

      // 记录用户浏览
      if (game.value) {
        await recordView({
          uid: localStorage.getItem("uid") || "anonymous",
          gameappId: parseInt(game.value.id),
        });
        console.log(`记录游戏浏览: ${game.value.id}`);
      }
    } else {
      error.value = res.data.msg || "获取游戏详情失败";
    }
  } catch (e: any) {
    error.value = e?.response?.data?.msg || "获取游戏详情失败";
  } finally {
    loading.value = false;
  }
}

async function handleGameClick() {
  if (!game.value) return;
  try {
    await recordClick({
      uid: localStorage.getItem("uid") || "anonymous",
      gameappId: parseInt(game.value.id),
    });
    console.log(`记录游戏点击: ${game.value.id}`);
  } catch (e) {
    console.error("记录游戏点击失败:", e);
  }
}

onMounted(fetchGameDetail);
</script>

<style scoped>
/* 按钮悬停放大 */
.button-hover-scale {
  transition: transform 0.2s ease-in-out;
}
.button-hover-scale:hover {
  transform: scale(1.05);
}

/* 卡片悬停阴影加深 */
.card-hover-shadow {
  transition: box-shadow 0.3s ease-in-out;
}
.card-hover-shadow:hover {
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.2),
    0 4px 6px -2px rgba(0, 0, 0, 0.1);
}
</style>
