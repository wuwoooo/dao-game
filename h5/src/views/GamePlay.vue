<template>
  <div class="game-play-container">
    <GameEmbed
      v-if="game && game.embedUrl"
      :gameUrl="game.embedUrl"
      :gameName="game.name"
    />

    <div v-else-if="loading" class="loading-state">
      <div class="spinner"></div>
      <p class="loading-text">加载游戏中...</p>
      <p class="loading-tip">请稍候，精彩游戏即将开始</p>
    </div>

    <div v-else-if="error" class="error-state">
      <i class="fas fa-exclamation-circle text-red-500 text-5xl mb-4"></i>
      <p class="text-lg mb-2">{{ error }}</p>
      <button @click="fetchGameDetail" class="retry-button">
        <i class="fas fa-redo mr-2"></i>重试
      </button>
      <router-link to="/" class="home-link">
        <i class="fas fa-home mr-2"></i>返回首页
      </router-link>
    </div>

    <div v-else-if="!game?.embedUrl" class="no-url-state">
      <i class="fas fa-ban text-gray-500 text-5xl mb-4"></i>
      <p class="text-lg mb-2">该游戏暂不可用</p>
      <router-link to="/" class="home-link">
        <i class="fas fa-home mr-2"></i>返回首页
      </router-link>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from "vue";
import { useRoute, useRouter } from "vue-router";
import { getGameDetailH5, recordClick } from "../api/game";
import GameEmbed from "../components/GameEmbed.vue";

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
const router = useRouter();
const game = ref<Game | null>(null);
const loading = ref(true);
const error = ref("");
let loadingTips = [
  "游戏加载中，马上就好...",
  "准备好开始冒险了吗？",
  "正在连接游戏服务器...",
  "游戏即将开始，请稍候...",
  "正在加载游戏资源，请耐心等待...",
];
let tipInterval: number | null = null;

async function fetchGameDetail() {
  const gameId = route.params.id as string;
  if (!gameId) {
    router.push("/");
    return;
  }

  loading.value = true;
  error.value = "";

  try {
    const res = await getGameDetailH5(gameId);
    if (res.data) {
      game.value = res.data;

      /*
      这里不记录点击，因为点击后会跳转到游戏详情页，游戏详情页会记录点击
      // 记录游戏点击
      if (game.value && game.value.embedUrl) {
        try {
          await recordClick({
            uid: localStorage.getItem("uid") || "anonymous",
            gameappId: parseInt(game.value.id),
          });
          console.log(`记录游戏点击: ${game.value.id}`);
        } catch (e) {
          console.error("记录游戏点击失败:", e);
        }
      }*/
    } else {
      error.value = res.data?.msg || "获取游戏详情失败";
    }
  } catch (e: any) {
    error.value = e?.response?.data?.msg || "获取游戏详情失败";
  } finally {
    loading.value = false;
  }
}

function startLoadingTips() {
  const loadingTipEl = document.querySelector(".loading-tip");
  if (!loadingTipEl) return;

  let tipIndex = 0;
  loadingTipEl.textContent = loadingTips[0];

  tipInterval = window.setInterval(() => {
    tipIndex = (tipIndex + 1) % loadingTips.length;
    if (loadingTipEl) {
      loadingTipEl.textContent = loadingTips[tipIndex];
    }
  }, 3000);
}

onMounted(() => {
  fetchGameDetail();
  startLoadingTips();

  // 设置页面标题
  document.title = "游戏加载中 - DaoGame";
});

onBeforeUnmount(() => {
  if (tipInterval) {
    clearInterval(tipInterval);
    tipInterval = null;
  }

  // 恢复页面标题
  document.title = "DaoGame";
});
</script>

<style scoped>
.game-play-container {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #000;
  z-index: 50;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.loading-state,
.error-state,
.no-url-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  height: 100%;
  color: #fff;
  padding: 20px;
}

.spinner {
  width: 60px;
  height: 60px;
  margin-bottom: 20px;
  border: 5px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: #6366f1;
  animation: spin 1s ease-in-out infinite;
}

.loading-text {
  font-size: 18px;
  font-weight: 500;
  margin-bottom: 8px;
}

.loading-tip {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.7);
  max-width: 280px;
  text-align: center;
}

.retry-button,
.home-link {
  display: inline-flex;
  align-items: center;
  margin-top: 16px;
  padding: 8px 16px;
  background-color: rgba(99, 102, 241, 0.8);
  color: white;
  border: none;
  border-radius: 20px;
  font-size: 14px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.retry-button:hover,
.home-link:hover {
  background-color: rgba(99, 102, 241, 1);
}

.home-link {
  text-decoration: none;
  margin-top: 12px;
  background-color: rgba(107, 114, 128, 0.8);
}

.home-link:hover {
  background-color: rgba(107, 114, 128, 1);
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 640px) {
  .spinner {
    width: 40px;
    height: 40px;
  }

  .loading-text {
    font-size: 16px;
  }

  .loading-tip {
    font-size: 12px;
  }
}
</style>
