<template>
  <div
    class="lottery-cosmos min-h-screen bg-gradient-to-b from-[#0f172a] via-[#1e293b] to-[#334155] relative overflow-hidden"
  >
    <!-- 宇宙星空背景 -->
    <div class="stars-container absolute inset-0 z-0 overflow-hidden">
      <div
        v-for="i in 50"
        :key="`star-${i}`"
        class="star absolute rounded-full"
        :style="{
          width: `${Math.random() * 3 + 1}px`,
          height: `${Math.random() * 3 + 1}px`,
          top: `${Math.random() * 100}%`,
          left: `${Math.random() * 100}%`,
          animationDelay: `${Math.random() * 10}s`,
          animationDuration: `${Math.random() * 10 + 10}s`,
        }"
      ></div>
      <div
        v-for="i in 10"
        :key="`comet-${i}`"
        class="shooting-star absolute"
        :style="{
          top: `${Math.random() * 70}%`,
          left: `${Math.random() * 100}%`,
          width: `${Math.random() * 150 + 50}px`,
          height: '1px',
          transform: `rotate(${Math.random() * 180}deg)`,
          animationDelay: `${Math.random() * 20}s`,
          animationDuration: `${Math.random() * 5 + 5}s`,
        }"
      ></div>
    </div>

    <!-- 顶部导航 -->
    <header
      class="sticky top-0 z-10 backdrop-blur-md bg-[#0f172a]/70 border-b border-indigo-500/20"
    >
      <div
        class="container mx-auto px-4 py-4 flex justify-between items-center"
      >
        <div class="flex items-center">
          <svg class="w-8 h-8 mr-2" viewBox="0 0 24 24" fill="none">
            <circle
              cx="12"
              cy="12"
              r="10"
              stroke="#8b5cf6"
              stroke-width="2"
              stroke-dasharray="20,10"
              stroke-dashoffset="0"
            >
              <animate
                attributeName="stroke-dashoffset"
                dur="8s"
                repeatCount="indefinite"
                from="0"
                to="30"
              />
            </circle>
            <circle cx="12" cy="12" r="6" fill="#c4b5fd" opacity="0.8">
              <animate
                attributeName="r"
                dur="3s"
                repeatCount="indefinite"
                values="5;6;5"
              />
              <animate
                attributeName="opacity"
                dur="3s"
                repeatCount="indefinite"
                values="0.6;0.8;0.6"
              />
            </circle>
            <path
              d="M12 7v5l3 3"
              stroke="white"
              stroke-width="1.5"
              stroke-linecap="round"
            />
          </svg>
          <h1
            class="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-indigo-300"
          >
            DAO_Game抽奖
          </h1>
        </div>

        <div class="flex space-x-3">
          <button
            v-if="isLoggedIn()"
            @click="goToMyLottery"
            class="px-4 py-2 bg-gradient-to-r from-purple-500/20 to-indigo-500/20 backdrop-blur-sm rounded-lg text-indigo-100 hover:from-purple-500/30 hover:to-indigo-500/30 transition-all border border-indigo-400/20 flex items-center"
          >
            <svg
              class="w-4 h-4 mr-1"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <path
                d="M16 4h2a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h2"
              ></path>
              <rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect>
              <path d="M12 11v6"></path>
              <path d="M9 14h6"></path>
            </svg>
            我的记录
          </button>

          <button
            v-if="!isLoggedIn()"
            @click="openLoginModal"
            class="px-4 py-2 bg-gradient-to-r from-purple-500/20 to-indigo-500/20 backdrop-blur-sm rounded-lg text-indigo-100 hover:from-purple-500/30 hover:to-indigo-500/30 transition-all border border-indigo-400/20 flex items-center"
          >
            <svg
              class="w-4 h-4 mr-1"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <path d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4"></path>
              <polyline points="10 17 15 12 10 7"></polyline>
              <line x1="15" y1="12" x2="3" y2="12"></line>
            </svg>
            连接钱包
          </button>
        </div>
      </div>
    </header>

    <!-- 主内容区 -->
    <main class="container mx-auto px-4 py-8 z-10 relative">
      <!-- 头部标题 -->
      <div class="mb-14 text-center relative cosmic-portal">
        <div
          class="cosmic-ring absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2"
          :style="{
            transform: `translate(-50%, -50%) translateY(${
              parallaxOffset * 0.1
            }px)`,
          }"
        >
          <svg width="100%" height="100%" viewBox="0 0 200 200" fill="none">
            <circle
              cx="100"
              cy="100"
              r="80"
              stroke="url(#portal-gradient)"
              stroke-width="2"
              stroke-dasharray="10,5"
              stroke-linecap="round"
            >
              <animateTransform
                attributeName="transform"
                type="rotate"
                from="0 100 100"
                to="360 100 100"
                dur="30s"
                repeatCount="indefinite"
              />
            </circle>
            <circle
              cx="100"
              cy="100"
              r="60"
              stroke="url(#portal-gradient)"
              stroke-width="1.5"
              stroke-dasharray="5,5"
              stroke-linecap="round"
              opacity="0.7"
            >
              <animateTransform
                attributeName="transform"
                type="rotate"
                from="360 100 100"
                to="0 100 100"
                dur="20s"
                repeatCount="indefinite"
              />
            </circle>
            <circle
              cx="100"
              cy="100"
              r="40"
              stroke="url(#portal-gradient)"
              stroke-width="1"
              stroke-dasharray="3,3"
              stroke-linecap="round"
              opacity="0.5"
            >
              <animateTransform
                attributeName="transform"
                type="rotate"
                from="0 100 100"
                to="360 100 100"
                dur="15s"
                repeatCount="indefinite"
              />
            </circle>
            <defs>
              <linearGradient
                id="portal-gradient"
                x1="0%"
                y1="0%"
                x2="100%"
                y2="100%"
              >
                <stop offset="0%" stop-color="#c084fc">
                  <animate
                    attributeName="stop-color"
                    values="#c084fc;#8b5cf6;#c084fc"
                    dur="8s"
                    repeatCount="indefinite"
                  />
                </stop>
                <stop offset="100%" stop-color="#8b5cf6">
                  <animate
                    attributeName="stop-color"
                    values="#8b5cf6;#c084fc;#8b5cf6"
                    dur="8s"
                    repeatCount="indefinite"
                  />
                </stop>
              </linearGradient>
            </defs>
          </svg>
        </div>

        <div class="relative py-12 px-6">
          <h1
            class="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-300 via-indigo-200 to-purple-300 mb-4"
          >
            Web3幸运抽奖
          </h1>
          <p class="text-lg text-indigo-200 mb-1">触碰链上命运，赢取数字藏品</p>
          <p class="text-sm text-indigo-300/70">
            用你的NFT参与DAO社区抽奖，赢取稀有资产
          </p>
        </div>
      </div>

      <!-- 错误提示 -->
      <div
        v-if="error"
        class="mb-10 bg-red-900/20 backdrop-blur-sm border border-red-500/20 rounded-lg p-4 text-center"
      >
        <svg
          class="w-10 h-10 mx-auto mb-3 text-red-400"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.5"
        >
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
        <p class="text-red-200 mb-1">{{ error }}</p>
        <button
          @click="retryFetch"
          class="mt-3 px-5 py-2 bg-red-600/30 hover:bg-red-600/50 text-red-100 rounded-lg transition-all"
        >
          重试
        </button>
      </div>

      <!-- 加载中 -->
      <div v-else-if="loading" class="flex justify-center py-24">
        <div class="cosmos-loader">
          <svg width="60" height="60" viewBox="0 0 60 60" fill="none">
            <circle
              cx="30"
              cy="30"
              r="25"
              stroke="#8b5cf6"
              stroke-width="2"
              stroke-dasharray="70,50"
              stroke-linecap="round"
            >
              <animateTransform
                attributeName="transform"
                type="rotate"
                from="0 30 30"
                to="360 30 30"
                dur="1.5s"
                repeatCount="indefinite"
              />
            </circle>
            <circle
              cx="30"
              cy="30"
              r="15"
              stroke="#a78bfa"
              stroke-width="2"
              stroke-dasharray="40,30"
              stroke-linecap="round"
            >
              <animateTransform
                attributeName="transform"
                type="rotate"
                from="360 30 30"
                to="0 30 30"
                dur="1.2s"
                repeatCount="indefinite"
              />
            </circle>
          </svg>
          <p class="text-indigo-300 mt-4 animate-pulse">星际穿梭中...</p>
        </div>
      </div>

      <!-- 暂无活动 -->
      <div
        v-else-if="lotteryList.length === 0 && !loading"
        class="flex flex-col items-center justify-center py-24"
      >
        <div class="empty-state-illustration">
          <svg width="120" height="120" viewBox="0 0 24 24" fill="none">
            <path
              opacity="0.2"
              d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              fill="#8b5cf6"
            />
            <path
              d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              stroke="#8b5cf6"
              stroke-width="1.5"
            />
            <path
              d="M9 10h.01M15 10h.01M9.5 15a3.5 3.5 0 005.5 0"
              stroke="#8b5cf6"
              stroke-width="1.5"
              stroke-linecap="round"
            />
          </svg>
        </div>
        <div class="text-2xl text-indigo-200 mt-6 mb-2">虚空无活动</div>
        <p class="text-indigo-300/70 mb-8">
          银河系尚未发现活动信号，请稍后再来探索
        </p>
        <button
          @click="retryFetch"
          class="px-6 py-3 bg-gradient-to-r from-purple-600/30 to-indigo-600/30 hover:from-purple-600/50 hover:to-indigo-600/50 border border-indigo-500/30 rounded-lg text-indigo-100 transition-all flex items-center"
        >
          <svg
            class="w-5 h-5 mr-2"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <path d="M23 4v6h-6" />
            <path d="M1 20v-6h6" />
            <path
              d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"
            />
          </svg>
          刷新探索
        </button>
      </div>

      <!-- 活动卡片组 -->
      <div v-else class="relative">
        <!-- 漂浮光效 -->
        <div
          class="absolute -top-10 -right-20 w-60 h-60 bg-purple-600/10 rounded-full blur-3xl"
        ></div>
        <div
          class="absolute -bottom-10 -left-20 w-60 h-60 bg-indigo-600/10 rounded-full blur-3xl"
        ></div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div
            v-for="lottery in lotteryList"
            :key="lottery.id"
            class="lottery-card group relative bg-gradient-to-br from-indigo-900/50 to-purple-900/50 backdrop-blur-sm rounded-xl overflow-hidden border border-indigo-500/20 transition-all duration-500 hover:border-indigo-400/40 hover:shadow-[0_0_30px_rgba(139,92,246,0.15)]"
          >
            <!-- 卡片光效 -->
            <div
              class="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"
            >
              <div
                class="absolute top-0 left-1/2 h-[1px] w-[50%] bg-gradient-to-r from-transparent via-indigo-400 to-transparent blur-[2px]"
              >
                <div
                  class="absolute inset-0 animate-[shine_4s_ease-in-out_infinite]"
                ></div>
              </div>
              <div
                class="absolute bottom-0 left-0 h-[1px] w-[50%] bg-gradient-to-r from-transparent via-purple-400 to-transparent blur-[2px]"
              >
                <div
                  class="absolute inset-0 animate-[shine_4s_ease-in-out_infinite_1s]"
                ></div>
              </div>
            </div>

            <!-- 卡片内容 -->
            <div class="relative">
              <!-- 活动图片 -->
              <div class="relative h-48 overflow-hidden">
                <div
                  class="absolute inset-0 bg-gradient-to-t from-indigo-950 via-transparent to-transparent z-10"
                ></div>
                <img
                  :src="lottery.background || randomBackground(lottery.id)"
                  alt="抽奖活动背景"
                  class="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-2000"
                />

                <!-- 活动类型徽章 -->
                <div class="absolute top-4 right-4 z-10">
                  <div
                    class="rounded-full px-3 py-1 text-xs font-medium backdrop-blur-md border"
                    :class="
                      lottery.lotteryType === 'wheel'
                        ? 'border-fuchsia-400/30 bg-fuchsia-500/20 text-fuchsia-200'
                        : 'border-blue-400/30 bg-blue-500/20 text-blue-200'
                    "
                  >
                    <span class="flex items-center">
                      <svg
                        v-if="lottery.lotteryType === 'wheel'"
                        class="w-3 h-3 mr-1"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                      >
                        <circle cx="12" cy="12" r="10" />
                        <path
                          d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"
                        />
                        <path d="M2 12h20" />
                      </svg>
                      <svg
                        v-else
                        class="w-3 h-3 mr-1"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                      >
                        <path
                          d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"
                        />
                      </svg>
                      {{ lottery.lotteryType === "wheel" ? "大转盘" : "盲盒" }}
                    </span>
                  </div>
                </div>

                <!-- 主办方信息 -->
                <div class="absolute bottom-0 left-0 p-4 w-full z-10">
                  <div class="flex items-center">
                    <div class="relative">
                      <div
                        class="absolute inset-0 rounded-full bg-indigo-500/30 blur-sm"
                      ></div>
                      <img
                        :src="lottery.icon || randomIcon(lottery.id)"
                        alt="主办方"
                        class="relative w-10 h-10 rounded-full border border-indigo-500/30 object-cover"
                      />
                    </div>
                    <div class="ml-3">
                      <p class="text-xs text-indigo-300/70">星际主办</p>
                      <p class="text-sm font-medium text-indigo-200">
                        {{ lottery.sponsor }}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <!-- 活动信息 -->
              <div class="p-5">
                <h3
                  class="text-xl font-bold text-indigo-100 mb-2 group-hover:text-indigo-200 transition-colors"
                >
                  {{ lottery.name }}
                </h3>
                <p class="text-indigo-300/70 text-sm mb-4 line-clamp-2">
                  {{ lottery.description }}
                </p>

                <!-- 活动时间 -->
                <div class="flex justify-between items-end mb-5">
                  <div class="text-xs text-indigo-300/70 space-y-1">
                    <div class="flex items-center">
                      <svg
                        class="w-3 h-3 mr-1"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                      >
                        <circle cx="12" cy="12" r="10" />
                        <polyline points="12 6 12 12 16 14" />
                      </svg>
                      <span>始：{{ formatDate(lottery.startTime) }}</span>
                    </div>
                    <div class="flex items-center">
                      <svg
                        class="w-3 h-3 mr-1"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                      >
                        <circle cx="12" cy="12" r="10" />
                        <polyline points="12 6 12 12 8 14" />
                      </svg>
                      <span>终：{{ formatDate(lottery.endTime) }}</span>
                    </div>
                  </div>
                </div>

                <!-- 按钮 -->
                <router-link
                  :to="`/lottery/${lottery.id}`"
                  class="block w-full py-3 text-center bg-gradient-to-r from-purple-600/70 to-indigo-600/70 text-white rounded-lg group-hover:from-purple-600/90 group-hover:to-indigo-600/90 transition-all transform group-hover:translate-y-[-2px] relative overflow-hidden"
                >
                  <span class="relative z-10 flex items-center justify-center">
                    <svg
                      class="w-5 h-5 mr-1"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                    >
                      <circle cx="12" cy="12" r="10" />
                      <line x1="12" y1="8" x2="12" y2="16" />
                      <line x1="8" y1="12" x2="16" y2="12" />
                    </svg>
                    启程探索
                  </span>
                  <div
                    class="absolute inset-0 scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-500 bg-gradient-to-r from-indigo-700/80 to-purple-700/80"
                  ></div>
                </router-link>
              </div>
            </div>
          </div>
        </div>

        <!-- 分页指示器 -->
        <div class="flex justify-center mt-10 space-x-2">
          <button
            v-for="(_, index) in paginationDots"
            :key="index"
            :class="[
              'w-3 h-3 rounded-full transition-all relative',
              currentPage === index
                ? 'bg-indigo-400 scale-110'
                : 'bg-indigo-800 hover:bg-indigo-600',
            ]"
            @click="goToPage(index)"
          >
            <span
              v-if="currentPage === index"
              class="absolute inset-0 rounded-full bg-indigo-400 animate-ping opacity-75"
            ></span>
          </button>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed, inject } from "vue";
import { useRouter } from "vue-router";
import { getLotteryList, clearTempToken } from "../../api/lottery";
import { getUserInfoFromCache } from "../../utils/auth";

const router = useRouter();
const openLoginModal = inject("openLoginModal") as () => void;
const isLoggedIn = inject("isLoggedIn") as () => boolean;

const userInfo = ref(getUserInfoFromCache());
const lotteryList = ref<any[]>([]);
const loading = ref(true);
const error = ref("");
const currentPage = ref(0);
const itemsPerPage = 6;

// 视差效果
const parallaxOffset = ref(0);

// 跳转到我的抽奖记录页面
function goToMyLottery() {
  router.push("/my-lottery");
}

// 截取地址显示
function truncateAddress(address?: string): string {
  if (!address) return "";
  if (address.length <= 10) return address;
  return address.substring(address.length - 6);
}

// 初始化数据
async function fetchLotteryList() {
  loading.value = true;
  error.value = "";

  try {
    const res = await getLotteryList();
    if (res.data && res.data.code === 0) {
      lotteryList.value = res.data.data || [];
    } else {
      throw new Error(res.data?.msg || "获取抽奖活动失败");
    }
  } catch (err: any) {
    console.error("获取抽奖活动列表失败:", err);

    // 处理临时token错误
    if (err.message.includes("临时授权")) {
      error.value = "无法获取临时授权，请刷新页面重试";
      clearTempToken(); // 清除可能失效的token
    } else {
      error.value = err.message || "网络错误，请稍后再试";
    }
  } finally {
    loading.value = false;
  }
}

// 重试获取数据
function retryFetch() {
  clearTempToken(); // 清除可能失效的token
  fetchLotteryList();
}

// 分页逻辑
const paginationDots = computed(() => {
  return Math.ceil(lotteryList.value.length / itemsPerPage);
});

function goToPage(page: number) {
  currentPage.value = page;
}

// 日期格式化
function formatDate(dateStr: string) {
  const date = new Date(dateStr);
  return `${date.getFullYear()}-${(date.getMonth() + 1)
    .toString()
    .padStart(2, "0")}-${date.getDate().toString().padStart(2, "0")}`;
}

// 随机背景和图标（用于API没有返回图片时）
function randomBackground(id: number) {
  const themes = [
    "space,galaxy,nebula",
    "cosmic,stars,universe",
    "planet,astronomy,cosmos",
    "aurora,night,stellar",
  ];
  const theme = themes[id % themes.length];
  return `https://source.unsplash.com/featured/?${theme}&${id}`;
}

function randomIcon(id: number) {
  return `https://source.unsplash.com/random/100x100/?logo,emblem&${id}`;
}

// 监听滚动事件更新视差效果
function updateParallax() {
  parallaxOffset.value = window.scrollY;
}

onMounted(() => {
  fetchLotteryList();
  window.addEventListener("scroll", updateParallax);
});

// 组件卸载时移除事件监听
onUnmounted(() => {
  window.removeEventListener("scroll", updateParallax);
});
</script>

<style scoped>
/* 星空背景动画 */
.stars-container {
  background: radial-gradient(ellipse at bottom, #1b2735 0%, #090a0f 100%);
}

.star {
  background: white;
  animation: twinkle linear infinite;
}

.shooting-star {
  background: linear-gradient(
    90deg,
    rgba(255, 255, 255, 0) 0%,
    rgba(255, 255, 255, 1) 50%,
    rgba(255, 255, 255, 0) 100%
  );
  box-shadow: 0 0 10px 2px rgba(255, 255, 255, 0.4);
  opacity: 0;
  animation: shootingStar linear infinite;
}

@keyframes twinkle {
  0% {
    opacity: 0;
  }
  50% {
    opacity: 1;
  }
  100% {
    opacity: 0;
  }
}

@keyframes shootingStar {
  0% {
    transform: translateX(-200px) translateY(200px) rotate(45deg);
    opacity: 0;
  }
  20% {
    opacity: 1;
  }
  80% {
    opacity: 1;
  }
  100% {
    transform: translateX(200px) translateY(-200px) rotate(45deg);
    opacity: 0;
  }
}

.cosmic-portal {
  height: 220px;
}

.cosmic-ring {
  width: 200px;
  height: 200px;
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.cosmos-loader {
  display: flex;
  flex-direction: column;
  align-items: center;
}

@keyframes shine {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(100%);
  }
}
</style>
