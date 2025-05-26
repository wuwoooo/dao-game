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

        <!-- 搜索框 -->
        <div class="flex-grow max-w-xl mx-4">
          <div class="relative">
            <input
              type="search"
              v-model="searchQuery"
              @keyup.enter="performSearch"
              placeholder="搜索精彩游戏..."
              style="color: wheat"
              class="w-full py-2.5 px-4 pr-10 text-sm text-slate-700 rounded-full border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none focus:border-indigo-500 transition-all"
            />
            <button
              @click="performSearch"
              class="absolute right-0 top-0 bottom-0 px-3 text-slate-500 hover:text-indigo-600"
            >
              <i class="fas fa-search text-sm"></i>
            </button>
          </div>
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
      <!-- Banner -->
      <section
        v-if="banners.length > 0"
        id="banner-section"
        class="mb-6 md:mb-8 shadow-md rounded-lg mx-4 md:mx-6 lg:mx-8 overflow-hidden"
      >
        <div class="banner-container">
          <div
            class="banner-slides-wrapper"
            :style="{ transform: `translateX(-${currentSlide * 100}%)` }"
          >
            <div
              v-for="(banner, index) in banners"
              :key="banner.id || index"
              class="banner-slide"
              :style="{
                backgroundImage: `url(${banner.coverImage || banner.icon})`,
              }"
            >
              <router-link
                :to="{ name: 'game-detail', params: { id: banner.id } }"
                class="parallax-content w-full h-full flex flex-col items-center justify-center"
              >
                <h2 class="text-2xl md:text-3xl font-bold mb-2">
                  {{ banner.name }}
                </h2>
                <p class="text-sm md:text-base">{{ banner.description }}</p>
              </router-link>
            </div>
          </div>
          <div class="banner-dots">
            <div
              v-for="(_, index) in banners"
              :key="index"
              class="banner-dot"
              :class="{ 'opacity-100': currentSlide === index }"
              @click="currentSlide = index"
            ></div>
          </div>
        </div>
      </section>

      <!-- 游戏分类/列表区 -->
      <div class="px-4 md:px-6 lg:px-8">
        <section id="new-releases-section" class="mb-12">
          <h2 class="text-xl md:text-2xl font-semibold mb-6 text-slate-800">
            <i class="fas fa-bullhorn mr-2 text-green-500"></i>首发上线
          </h2>
          <GameList
            :games="newGames"
            :loading="loadingNew"
            :error="errorNew"
            @refresh="fetchNewGames"
          />
        </section>

        <section id="hot-section" class="mb-12">
          <h2 class="text-xl md:text-2xl font-semibold mb-6 text-slate-800">
            <i class="fas fa-fire mr-2 text-red-500"></i>热门游戏/应用
          </h2>
          <GameList
            :games="hotGames"
            :loading="loadingHot"
            :error="errorHot"
            @refresh="fetchHotGames"
          />
        </section>

        <section id="recommend-section" class="mb-12">
          <h2 class="text-xl md:text-2xl font-semibold mb-6 text-slate-800">
            <i class="fas fa-star mr-2 text-yellow-500"></i>为你推荐
          </h2>
          <GameList
            :games="recommendGames"
            :loading="loadingRecommend"
            :error="errorRecommend"
            @refresh="fetchRecommendGames"
          />
        </section>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, inject } from "vue";
import { useRouter } from "vue-router";
import {
  getBanners,
  getHotGames as apiGetHotGames,
  getNewGames as apiGetNewGames,
  getRecommendGames as apiGetRecommendGames,
  searchGames as apiSearchGames,
  recordClick,
} from "../api/game";
import GameList from "../components/GameList.vue"; // 假设有一个GameList组件

interface GameBase {
  id: string | number;
  name: string;
  type: string;
  description: string;
  icon: string;
  url?: string; // H5 API 中的 embedUrl 或 externalUrl
  coverImage?: string; // H5 API
  tags?: string;
  views?: string;
  ownerName?: string;
  isRecommend?: boolean;
  createdAt?: string;
}

interface BannerGame extends GameBase {}

const router = useRouter();

const banners = ref<BannerGame[]>([]);
const hotGames = ref<GameBase[]>([]);
const newGames = ref<GameBase[]>([]);
const recommendGames = ref<GameBase[]>([]);

const loadingBanners = ref(true);
const loadingHot = ref(true);
const loadingNew = ref(true);
const loadingRecommend = ref(true);

const errorBanners = ref("");
const errorHot = ref("");
const errorNew = ref("");
const errorRecommend = ref("");

const searchQuery = ref("");
const currentSlide = ref(0);

let bannerInterval: number;

// 注入全局方法
const openLoginModal = inject("openLoginModal") as () => void;
const isLoggedIn = inject("isLoggedIn") as () => boolean;
const logout = inject("logout") as () => void;

async function fetchBanners() {
  loadingBanners.value = true;
  errorBanners.value = "";
  try {
    const res = await getBanners();
    if (Array.isArray(res.data)) {
      banners.value = res.data;
    } else {
      errorBanners.value = res.data.msg || "获取轮播图失败";
    }
  } catch (e: any) {
    errorBanners.value = e?.response?.data?.msg || "获取轮播图失败";
  } finally {
    loadingBanners.value = false;
  }
}

async function fetchHotGames() {
  loadingHot.value = true;
  errorHot.value = "";
  try {
    const res = await apiGetHotGames({ current: 1, size: 6 }); // 获取6个热门游戏
    if (res.data.records) {
      hotGames.value = res.data.records;
    } else {
      errorHot.value = res.data.msg || "获取热门游戏失败";
    }
  } catch (e: any) {
    console.log(e);
    errorHot.value = e?.response?.data?.msg || "获取热门游戏失败";
  } finally {
    loadingHot.value = false;
  }
}

async function fetchNewGames() {
  loadingNew.value = true;
  errorNew.value = "";
  try {
    const res = await apiGetNewGames({ current: 1, size: 3 });
    console.log(res.data);
    if (res.data.records) {
      newGames.value = res.data.records;
    } else {
      errorNew.value = res.data.msg || "获取首发游戏失败";
    }
  } catch (e: any) {
    console.log(e);
    errorNew.value = e?.response?.data?.msg || "获取首发游戏失败";
  } finally {
    loadingNew.value = false;
  }
}

async function fetchRecommendGames() {
  loadingRecommend.value = true;
  errorRecommend.value = "";
  try {
    const res = await apiGetRecommendGames({ current: 1, size: 3 });
    if (res.data.records) {
      recommendGames.value = res.data.records;
    } else {
      errorRecommend.value = res.data.msg || "获取推荐游戏失败";
    }
  } catch (e: any) {
    errorRecommend.value = e?.response?.data?.msg || "获取推荐游戏失败";
  } finally {
    loadingRecommend.value = false;
  }
}

async function performSearch() {
  if (!searchQuery.value.trim()) return;
  router.push({
    name: "search-results",
    query: { keyword: searchQuery.value },
  });
}

function startBannerAutoplay() {
  if (banners.value.length > 1) {
    bannerInterval = window.setInterval(() => {
      currentSlide.value = (currentSlide.value + 1) % banners.value.length;
    }, 5000);
  }
}

onMounted(() => {
  fetchBanners().then(() => {
    if (banners.value.length > 0) {
      startBannerAutoplay();
    }
  });
  fetchHotGames();
  fetchNewGames();
  fetchRecommendGames();
});

onUnmounted(() => {
  clearInterval(bannerInterval);
});
</script>

<style scoped>
/* 卡片呼吸/渐变背景示例 - 用于徽章 */
.breathing-gradient-bg {
  background: linear-gradient(-45deg, #ee7752, #e73c7e, #23a6d5, #23d5ab);
  background-size: 400% 400%;
  animation: gradientBG 15s ease infinite;
}

@keyframes gradientBG {
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
}

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

/* Banner 样式 */
.banner-container {
  height: 40vh;
  max-height: 300px;
  background-color: #d1d5db;
  overflow: hidden;
  position: relative;
}

.banner-slides-wrapper {
  display: flex;
  height: 100%;
  transition: transform 0.5s ease-in-out;
}

.banner-slide {
  min-width: 100%;
  height: 100%;
  background-size: cover;
  background-position: center;
  display: flex;
  align-items: center;
  justify-content: center;
}

.banner-dots {
  position: absolute;
  bottom: 10px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  justify-content: center;
  align-items: center;
}

.banner-dot {
  width: 8px;
  height: 8px;
  background-color: white;
  opacity: 0.5;
  border-radius: 50%;
  margin: 0 4px;
  transition: all 0.3s ease;
  cursor: pointer;
}

.banner-dot.opacity-100 {
  opacity: 1;
  width: 12px;
}

/* 卡片图片区域 */
.card-image-container {
  aspect-ratio: 16 / 9;
  background-color: #e5e7eb;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.card-image-container img {
  transition: transform 0.4s ease-out;
}

.card-hover-shadow:hover .card-image-container img {
  transform: scale(1.05);
}

/* 描述文本行数限制 */
.description-truncate {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  min-height: 2.5em;
}
</style>
