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
        <nav>
          <div v-if="isLoggedIn()" class="flex items-center">
            <router-link
              to="/"
              class="text-slate-600 hover:text-indigo-600 flex items-center mr-4"
            >
              <i class="fas fa-home text-xl mr-1"></i>
              <span class="text-sm hidden sm:inline">首页</span>
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
      <div class="px-4 md:px-6 lg:px-8">
        <div class="flex items-center justify-between mb-8">
          <h1 class="text-3xl font-bold">我的游戏</h1>
          <router-link
            to="/"
            class="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 button-hover-scale flex items-center"
          >
            <i class="fas fa-plus mr-2"></i>
            浏览更多
          </router-link>
        </div>

        <!-- 选项卡导航 -->
        <div class="mb-6 border-b border-gray-200">
          <ul class="flex flex-wrap -mb-px">
            <li class="mr-2">
              <button
                class="inline-block py-4 px-4 text-sm font-medium"
                :class="
                  activeTab === 'clicks'
                    ? 'text-indigo-600 border-b-2 border-indigo-600'
                    : 'text-gray-500 hover:text-gray-700 border-b-2 border-transparent hover:border-gray-300'
                "
                @click="setActiveTab('clicks')"
              >
                <i class="fas fa-mouse-pointer mr-2"></i>我的点击记录
              </button>
            </li>
            <li class="mr-2">
              <button
                class="inline-block py-4 px-4 text-sm font-medium"
                :class="
                  activeTab === 'views'
                    ? 'text-indigo-600 border-b-2 border-indigo-600'
                    : 'text-gray-500 hover:text-gray-700 border-b-2 border-transparent hover:border-gray-300'
                "
                @click="setActiveTab('views')"
              >
                <i class="fas fa-eye mr-2"></i>我的浏览记录
              </button>
            </li>
          </ul>
        </div>

        <div v-if="loading" class="text-center py-8">
          <p class="text-gray-600">加载中...</p>
        </div>

        <div v-else-if="error" class="text-center py-8">
          <p class="text-red-600">{{ error }}</p>
          <button
            @click="fetchRecords"
            class="mt-4 bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
          >
            重试
          </button>
        </div>

        <div
          v-else-if="records.length === 0"
          class="text-center py-12 bg-white rounded-lg shadow-md"
        >
          <i class="fas fa-gamepad text-5xl text-gray-400 mb-4"></i>
          <p class="text-gray-600 text-lg mb-4">
            {{
              activeTab === "clicks"
                ? "您还没有点击过任何游戏"
                : "您还没有浏览过任何游戏"
            }}
          </p>
          <router-link
            to="/"
            class="inline-block bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 button-hover-scale"
          >
            开始探索
          </router-link>
        </div>

        <div
          v-else
          class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          <div
            v-for="record in records"
            :key="record.id"
            class="bg-white rounded-lg shadow-md overflow-hidden card-hover-shadow"
          >
            <div class="card-image-container">
              <img
                :src="record.gameappIcon"
                :alt="record.gameappName"
                class="w-full h-full object-cover"
              />
            </div>
            <div class="p-4">
              <h3 class="text-xl font-semibold mb-2">
                {{ record.gameappName }}
              </h3>
              <p class="text-gray-600 mb-4 description-truncate">
                {{ record.gameappDescription }}
              </p>

              <!-- 标签和类型 -->
              <div class="flex flex-wrap gap-2 mb-4">
                <span
                  class="px-3 py-1 bg-indigo-100 text-indigo-600 text-sm rounded-full"
                >
                  {{ record.gameappType === "Game" ? "游戏" : "应用" }}
                </span>
                <span
                  class="px-3 py-1 bg-green-100 text-green-600 text-sm rounded-full"
                >
                  {{ record.ownerName }}
                </span>
              </div>

              <div class="flex justify-between items-center">
                <span class="text-sm text-gray-500">
                  <i class="fas fa-clock mr-1"></i>
                  {{
                    formatDate(
                      activeTab === "clicks"
                        ? record.clickTime
                        : record.viewTime
                    )
                  }}
                </span>
                <router-link
                  :to="{
                    name: 'game-detail',
                    params: { id: record.gameappId },
                  }"
                  class="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 button-hover-scale flex items-center"
                >
                  <i class="fas fa-info-circle mr-2"></i>
                  查看详情
                </router-link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, inject, watch } from "vue";
import { getClickRecords, getViewRecords, recordClick } from "../api/game";

interface Record {
  id: string;
  uid: string;
  gameappId: number;
  clickTime?: string; // 点击记录中存在
  viewTime?: string; // 浏览记录中存在
  ip?: string;
  userAgent?: string;
  referer?: string;
  gameappName: string;
  gameappType: string;
  gameappIcon: string;
  ownerName: string;
  gameappDescription: string;
  gameappCoverImage?: string;
  gameappEmbedUrl?: string;
  gameappExternalUrl?: string;
  views?: string;
}

const loading = ref(true);
const error = ref("");
const records = ref<Record[]>([]);
const activeTab = ref("clicks"); // 默认显示点击记录

// 注入全局方法
const openLoginModal = inject("openLoginModal") as () => void;
const isLoggedIn = inject("isLoggedIn") as () => boolean;
const logout = inject("logout") as () => void;

// 当切换选项卡时重新加载数据
watch(activeTab, () => {
  fetchRecords();
});

function setActiveTab(tab: "clicks" | "views") {
  activeTab.value = tab;
}

function formatDate(dateString?: string) {
  if (!dateString) return "未知";
  const date = new Date(dateString);
  return date.toLocaleDateString("zh-CN", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

async function fetchRecords() {
  loading.value = true;
  error.value = "";
  records.value = [];

  try {
    const uid = localStorage.getItem("uid");
    if (!uid) {
      error.value = "请先登录";
      loading.value = false;
      return;
    }

    const params = {
      uid,
      current: 1,
      size: 100,
    };

    // 根据活动选项卡选择API
    const res =
      activeTab.value === "clicks"
        ? await getClickRecords(params)
        : await getViewRecords(params);

    if (res.data.code === 0 && res.data.data) {
      records.value = res.data.data.records;
    } else {
      error.value =
        res.data.msg ||
        `获取我的${activeTab.value === "clicks" ? "点击" : "浏览"}记录失败`;
    }
  } catch (e: any) {
    error.value =
      e?.response?.data?.msg ||
      `获取我的${activeTab.value === "clicks" ? "点击" : "浏览"}记录失败`;
  } finally {
    loading.value = false;
  }
}

onMounted(fetchRecords);
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
