<template>
  <div>
    <!-- 显示控制栏 -->
    <div
      v-if="!loading && !error && games && games.length > 0"
      class="flex justify-between items-center mb-4"
    >
      <div class="flex items-center space-x-2">
        <button
          @click="viewType = 'grid'"
          class="p-2 rounded-md"
          :class="
            viewType === 'grid'
              ? 'bg-indigo-100 text-indigo-600'
              : 'text-gray-600 hover:bg-gray-100'
          "
          title="网格视图"
        >
          <i class="fas fa-th-large"></i>
        </button>
        <button
          @click="viewType = 'list'"
          class="p-2 rounded-md"
          :class="
            viewType === 'list'
              ? 'bg-indigo-100 text-indigo-600'
              : 'text-gray-600 hover:bg-gray-100'
          "
          title="列表视图"
        >
          <i class="fas fa-list"></i>
        </button>
      </div>
      <div class="flex items-center">
        <select
          v-model="sortOrder"
          class="text-sm border rounded-md px-2 py-1 text-gray-700 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        >
          <option value="default">默认排序</option>
          <option value="name">按名称</option>
          <option value="views">按热度</option>
          <option value="newest">最新上线</option>
        </select>
      </div>
    </div>

    <!-- 加载状态 -->
    <div v-if="loading" class="text-center py-8">
      <p class="text-gray-600">加载中...</p>
      <!-- 可选: 添加骨架屏效果 -->
    </div>

    <!-- 错误状态 -->
    <div v-else-if="error" class="text-center py-8">
      <p class="text-red-500">{{ error }}</p>
      <button
        @click="$emit('refresh')"
        class="mt-4 bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
      >
        刷新重试
      </button>
    </div>

    <!-- 空状态 -->
    <div v-else-if="games && games.length === 0" class="text-center py-8">
      <p class="text-gray-500">暂无内容</p>
    </div>

    <!-- 网格视图 -->
    <div
      v-else-if="viewType === 'grid'"
      class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
    >
      <div
        v-for="game in sortedGames"
        :key="game.id"
        class="bg-white rounded-xl shadow-lg overflow-hidden card-hover-shadow transform hover:-translate-y-1 transition-all duration-300 ease-out"
      >
        <router-link :to="{ name: 'game-detail', params: { id: game.id } }">
          <div class="card-image-container relative">
            <img
              :src="
                game.icon || 'https://via.placeholder.com/400x300?text=No+Image'
              "
              :alt="game.name"
              class="absolute inset-0 h-full w-full object-cover"
            />
            <div
              class="absolute top-2 right-2 text-white text-xs font-semibold px-2 py-1 rounded"
              :class="
                game.type === 'Game'
                  ? 'bg-purple-600 breathing-gradient-bg'
                  : 'bg-sky-500'
              "
            >
              {{ game.type === "Game" ? "游戏" : "应用" }}
            </div>
          </div>
        </router-link>
        <div class="p-5">
          <router-link :to="{ name: 'game-detail', params: { id: game.id } }">
            <h3
              class="text-lg font-semibold text-slate-800 hover:text-indigo-600 transition-colors duration-200 leading-tight truncate mb-1"
              :title="game.name"
            >
              {{ game.name }}
            </h3>
          </router-link>
          <p class="text-slate-500 text-sm description-truncate mb-3">
            {{ game.description }}
          </p>
          <div class="flex flex-wrap gap-2 mb-4">
            <span
              v-for="tag in game.tags?.split(',').slice(0, 3)"
              :key="tag"
              class="px-2 py-0.5 bg-slate-100 text-slate-600 text-xs rounded-full"
            >
              {{ tag }}
            </span>
          </div>
          <div class="flex justify-between items-center">
            <span class="text-xs text-slate-400"
              ><i class="fas fa-eye mr-1"></i>{{ game.views || 0 }}</span
            >
            <router-link
              :to="{ name: 'game-detail', params: { id: game.id } }"
              class="bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-2 px-4 rounded-lg button-hover-scale text-sm transition-all duration-200"
              @click.stop="handleGameClick(game.id, game.type)"
            >
              <i
                :class="
                  game.type === 'Game'
                    ? 'fas fa-gamepad'
                    : 'fas fa-external-link-alt'
                "
                class="mr-1.5"
              ></i>
              {{ game.type === "Game" ? "开始体验" : "前往查看" }}
            </router-link>
          </div>
        </div>
      </div>
    </div>

    <!-- 列表视图 -->
    <div v-else class="space-y-4">
      <div
        v-for="game in sortedGames"
        :key="game.id"
        class="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-all duration-300"
      >
        <div class="flex flex-col md:flex-row">
          <div class="md:w-1/4 relative">
            <router-link :to="{ name: 'game-detail', params: { id: game.id } }">
              <div class="aspect-video md:h-full">
                <img
                  :src="
                    game.icon ||
                    'https://via.placeholder.com/400x300?text=No+Image'
                  "
                  :alt="game.name"
                  class="w-full h-full object-cover"
                />
              </div>
              <div
                class="absolute top-2 right-2 text-white text-xs font-semibold px-2 py-1 rounded"
                :class="
                  game.type === 'Game'
                    ? 'bg-purple-600 breathing-gradient-bg'
                    : 'bg-sky-500'
                "
              >
                {{ game.type === "Game" ? "游戏" : "应用" }}
              </div>
            </router-link>
          </div>
          <div class="p-4 md:w-3/4 flex flex-col justify-between">
            <div>
              <div class="flex justify-between items-start mb-2">
                <router-link
                  :to="{ name: 'game-detail', params: { id: game.id } }"
                >
                  <h3
                    class="text-xl font-semibold text-slate-800 hover:text-indigo-600"
                  >
                    {{ game.name }}
                  </h3>
                </router-link>
                <span class="text-xs text-slate-400 mt-1">
                  <i class="fas fa-eye mr-1"></i>{{ game.views || 0 }}
                </span>
              </div>
              <p class="text-slate-600 mb-4">{{ game.description }}</p>
              <div class="flex flex-wrap gap-2 mb-4">
                <span
                  v-for="tag in game.tags?.split(',')"
                  :key="tag"
                  class="px-2 py-0.5 bg-slate-100 text-slate-600 text-xs rounded-full"
                >
                  {{ tag }}
                </span>
              </div>
            </div>
            <div class="flex justify-end">
              <router-link
                :to="{ name: 'game-detail', params: { id: game.id } }"
                class="bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-2 px-4 rounded-lg button-hover-scale text-sm transition-all duration-200"
                @click.stop="handleGameClick(game.id, game.type)"
              >
                <i
                  :class="
                    game.type === 'Game'
                      ? 'fas fa-gamepad'
                      : 'fas fa-external-link-alt'
                  "
                  class="mr-1.5"
                ></i>
                {{ game.type === "Game" ? "开始体验" : "前往查看" }}
              </router-link>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { recordClick, recordView } from "../api/game";
import { useRouter } from "vue-router";
import { ref, computed } from "vue";

interface GameBase {
  id: string | number;
  name: string;
  type: string;
  description: string;
  icon?: string;
  url?: string;
  coverImage?: string;
  tags?: string;
  views?: string;
  ownerName?: string;
  isRecommend?: boolean;
  createdAt?: string;
}

const props = defineProps<{
  games: GameBase[] | null;
  loading: boolean;
  error: string;
}>();

const emit = defineEmits(["refresh"]);
const router = useRouter();
const viewType = ref("grid"); // 默认网格视图
const sortOrder = ref("default"); // 默认排序

// 根据排序选项排序游戏
const sortedGames = computed(() => {
  if (!props.games) return [];

  const games = [...props.games];

  switch (sortOrder.value) {
    case "name":
      return games.sort((a, b) => a.name.localeCompare(b.name));
    case "views":
      return games.sort((a, b) => {
        const viewsA = parseInt(a.views || "0");
        const viewsB = parseInt(b.views || "0");
        return viewsB - viewsA;
      });
    case "newest":
      return games.sort((a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return dateB - dateA;
      });
    default:
      return games;
  }
});

async function handleGameClick(gameId: string | number, gameType: string) {
  /*
  此时不记录点击，因为点击后会跳转到游戏详情页，游戏详情页会记录点击
  try {
    await recordClick({
      uid: localStorage.getItem("uid") || "anonymous",
      gameappId: gameId,
    });
    console.log(`记录游戏点击: ${gameId}`);
  } catch (e) {
    console.error(`记录游戏点击失败:`, e);
  }*/
}
</script>

<style scoped>
/* Styling is primarily from global main.css to maintain consistency */
.description-truncate {
  min-height: 2.5em; /* Ensure space for 2 lines even if text is shorter */
}

/* 列表视图中的描述文本 */
.description-truncate {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
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
</style>
