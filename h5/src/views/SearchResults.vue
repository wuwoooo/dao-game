<template>
  <div class="container mx-auto p-0 md:p-0 lg:p-0">
    <!-- 页眉 -->
    <header
      class="py-4 px-4 md:px-6 lg:px-8 sticky top-0 bg-white/90 backdrop-blur-md z-50 shadow-sm"
    >
      <div class="container mx-auto flex items-center justify-between">
        <!-- Logo -->
        <router-link to="/" class="text-2xl font-bold text-indigo-600">
          <i class="fas fa-rocket mr-1"></i>DaoGame
        </router-link>

        <!-- 搜索框 -->
        <div class="flex-grow max-w-xl mx-4">
          <div class="relative">
            <input
              type="search"
              v-model="searchQuery"
              @keyup.enter="performSearch"
              :placeholder="'搜索: ' + $route.query.keyword"
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

        <!-- 用户链接 -->
        <nav style="display: none">
          <router-link
            to="/my-games"
            class="text-slate-600 hover:text-indigo-600 flex items-center"
          >
            <i class="fas fa-user-circle text-xl mr-1"></i>
            <span class="text-sm hidden sm:inline">我的</span>
          </router-link>
        </nav>
      </div>
    </header>

    <!-- 主内容区 -->
    <main class="pt-4 px-4 md:px-6 lg:px-8">
      <div class="flex items-center justify-between mb-6">
        <h1 class="text-2xl font-bold text-slate-800">
          <i class="fas fa-search mr-2 text-indigo-500"></i>搜索结果:
          <span class="text-indigo-600">{{ $route.query.keyword }}</span>
        </h1>
        <router-link
          to="/"
          class="text-indigo-600 hover:text-indigo-800 flex items-center button-hover-scale"
        >
          <i class="fas fa-arrow-left mr-1"></i> 返回首页
        </router-link>
      </div>

      <div
        v-if="loading"
        class="text-center py-16 bg-white rounded-xl shadow-md"
      >
        <div
          class="inline-block animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-500 mb-6"
        ></div>
        <p class="text-gray-600 text-lg">搜索中...</p>
        <div class="flex justify-center mt-6 space-x-1">
          <div
            class="h-2 w-2 bg-indigo-400 rounded-full animate-bounce"
            style="animation-delay: 0s"
          ></div>
          <div
            class="h-2 w-2 bg-indigo-500 rounded-full animate-bounce"
            style="animation-delay: 0.2s"
          ></div>
          <div
            class="h-2 w-2 bg-indigo-600 rounded-full animate-bounce"
            style="animation-delay: 0.4s"
          ></div>
        </div>
      </div>

      <div
        v-else-if="error"
        class="text-center py-12 bg-white rounded-xl shadow-md"
      >
        <i class="fas fa-exclamation-triangle text-5xl text-red-500 mb-4"></i>
        <p class="text-red-600 text-lg mb-4">{{ error }}</p>
        <button
          @click="performSearch"
          class="mt-4 bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 button-hover-scale transition-all duration-300"
        >
          <i class="fas fa-sync-alt mr-2"></i>重试
        </button>
      </div>

      <div
        v-else-if="results.length === 0"
        class="text-center py-16 bg-white rounded-xl shadow-md"
      >
        <i class="fas fa-search text-6xl text-gray-400 mb-6"></i>
        <p class="text-gray-600 text-xl mb-6">没有找到相关游戏或应用</p>
        <router-link
          to="/"
          class="inline-block bg-indigo-600 text-white px-8 py-3 rounded-lg hover:bg-indigo-700 button-hover-scale text-lg transition-all duration-300"
        >
          <i class="fas fa-th-large mr-2"></i>浏览全部游戏
        </router-link>
      </div>

      <div v-else>
        <div
          class="mb-6 bg-gray-50 rounded-lg p-4 text-sm text-gray-600 flex items-center shadow-sm"
        >
          <i class="fas fa-info-circle text-indigo-500 mr-2"></i>
          找到
          <span class="font-semibold mx-1 text-indigo-600">{{
            totalCount
          }}</span>
          个结果
        </div>

        <GameList
          :games="results"
          :loading="loading"
          :error="error"
          @refresh="performSearch"
        />

        <!-- 分页控件 -->
        <div v-if="totalCount > pageSize" class="flex justify-center mt-8 mb-8">
          <div
            class="flex items-center space-x-2 bg-white px-4 py-3 rounded-xl shadow-sm"
          >
            <button
              @click="changePage(currentPage - 1)"
              :disabled="currentPage <= 1"
              class="px-4 py-2 rounded-lg border hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              :class="currentPage <= 1 ? 'text-gray-400' : 'text-indigo-600'"
            >
              <i class="fas fa-chevron-left"></i>
            </button>

            <div v-for="page in displayedPages" :key="page" class="flex">
              <button
                v-if="page !== '...'"
                @click="changePage(page)"
                :class="[
                  'px-4 py-2 rounded-lg transition-all duration-200',
                  currentPage === page
                    ? 'bg-indigo-600 text-white button-hover-scale'
                    : 'border hover:bg-gray-100 text-slate-700',
                ]"
              >
                {{ page }}
              </button>
              <span v-else class="px-4 py-2 text-gray-500">...</span>
            </div>

            <button
              @click="changePage(currentPage + 1)"
              :disabled="currentPage >= totalPages"
              class="px-4 py-2 rounded-lg border hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              :class="
                currentPage >= totalPages ? 'text-gray-400' : 'text-indigo-600'
              "
            >
              <i class="fas fa-chevron-right"></i>
            </button>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { searchGames } from "../api/game";
import GameList from "../components/GameList.vue";

const route = useRoute();
const router = useRouter();
const searchQuery = ref("");
const loading = ref(true);
const error = ref("");
const results = ref<any[]>([]);
const totalCount = ref(0);
const currentPage = ref(1);
const pageSize = 12;

// 计算总页数
const totalPages = computed(() => {
  return Math.ceil(totalCount.value / pageSize);
});

// 计算要显示的页码
const displayedPages = computed(() => {
  const pages = [];
  const maxVisiblePages = 5;

  if (totalPages.value <= maxVisiblePages) {
    // 显示所有页码
    for (let i = 1; i <= totalPages.value; i++) {
      pages.push(i);
    }
  } else {
    // 显示部分页码
    pages.push(1);

    let startPage = Math.max(2, currentPage.value - 1);
    let endPage = Math.min(totalPages.value - 1, currentPage.value + 1);

    if (startPage > 2) {
      pages.push("...");
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    if (endPage < totalPages.value - 1) {
      pages.push("...");
    }

    pages.push(totalPages.value);
  }

  return pages;
});

// 初始化搜索关键词
onMounted(() => {
  searchQuery.value = (route.query.keyword as string) || "";
  currentPage.value = Number(route.query.page) || 1;
  if (searchQuery.value) {
    performSearch();
  }
});

// 监听路由变化，当关键词或页码变化时重新搜索
watch(
  () => [route.query.keyword, route.query.page],
  ([newKeyword, newPage]) => {
    const shouldRefresh =
      (newKeyword && newKeyword !== searchQuery.value) ||
      (newPage && Number(newPage) !== currentPage.value);

    if (shouldRefresh) {
      searchQuery.value = (newKeyword as string) || searchQuery.value;
      currentPage.value = Number(newPage) || 1;
      performSearch();
    }
  }
);

// 切换页码
function changePage(page: number | string) {
  // 确保page是数字类型
  const pageNum = typeof page === "string" ? parseInt(page) : page;

  if (pageNum < 1 || pageNum > totalPages.value) return;

  // 更新URL，保留当前搜索关键词
  router.push({
    name: "search-results",
    query: {
      keyword: searchQuery.value,
      page: pageNum.toString(), // 转换为字符串，确保URL参数兼容性
    },
  });

  // 此处不需要手动调用performSearch，由路由变化的watch触发
}

async function performSearch() {
  // 如果搜索框中的关键词与当前路由中的不同，则更新路由
  if (searchQuery.value !== route.query.keyword) {
    router.push({
      name: "search-results",
      query: {
        keyword: searchQuery.value,
        page: 1, // 重置为第一页
      },
    });
    return; // 路由更新后会触发 watch，重新执行搜索
  }

  if (!searchQuery.value.trim()) {
    return;
  }

  loading.value = true;
  error.value = "";
  results.value = []; // 清空当前结果

  try {
    const res = await searchGames({
      keyword: searchQuery.value,
      current: currentPage.value,
      size: pageSize,
    });

    // 只要返回包含 records 字段即视为正常响应
    if (res.data && res.data.records) {
      results.value = res.data.records;
      totalCount.value = res.data.total || 0;
    } else if (res.data && res.data.data && res.data.data.records) {
      // 兼容嵌套在 data 字段中的情况
      results.value = res.data.data.records;
      totalCount.value = res.data.data.total || 0;
    } else {
      // 没有找到 records 字段
      results.value = [];
      totalCount.value = 0;
      error.value = "未找到相关游戏或应用";
    }
  } catch (e: any) {
    console.error("搜索出错:", e);
    error.value = e?.response?.data?.msg || "搜索失败，请稍后重试";
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
/* 输入框渐变边框效果 */
.input-focus-gradient:focus {
  border-image-slice: 1;
  border-image-source: linear-gradient(to right, #6366f1, #a855f7, #ec4899);
  border-width: 2px;
  outline: none;
}

/* 按钮悬停放大 */
.button-hover-scale {
  transition: transform 0.2s ease-in-out;
}
.button-hover-scale:hover {
  transform: scale(1.05);
}

/* 呼吸渐变背景效果 */
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
</style>
