<template>
  <div
    class="my-lottery min-h-screen bg-gradient-to-b from-[#0f172a] via-[#1e293b] to-[#334155] relative overflow-hidden"
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
    </div>

    <!-- 顶部导航 -->
    <header
      class="sticky top-0 z-30 backdrop-blur-md bg-[#0f172a]/70 border-b border-indigo-500/20"
    >
      <div
        class="container mx-auto px-4 py-4 flex justify-between items-center"
      >
        <div class="flex items-center">
          <div
            @click="$router.back()"
            class="text-indigo-300 mr-3 hover:text-indigo-200 transition-colors flex items-center cursor-pointer"
          >
            <svg
              class="w-5 h-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
          </div>
          <h1
            class="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-300 to-indigo-300"
          >
            我的记录
          </h1>
        </div>
        <div class="flex items-center space-x-3">
          <div
            class="px-4 py-2 bg-gradient-to-r from-purple-500/20 to-indigo-500/20 backdrop-blur-sm rounded-lg text-indigo-100 border border-indigo-400/20 flex items-center"
          >
            <svg
              class="w-4 h-4 mr-1"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
            <span class="text-indigo-200">{{
              userInfo?.openName || "未连接钱包"
            }}</span>
          </div>
        </div>
      </div>
    </header>

    <!-- 需要登录提示 -->
    <div
      v-if="!isLoggedIn()"
      class="container mx-auto px-4 py-24 z-10 relative"
    >
      <div
        class="max-w-md mx-auto bg-gradient-to-br from-indigo-900/30 to-purple-900/30 backdrop-blur-sm p-8 rounded-xl text-center border border-indigo-500/20"
      >
        <svg
          class="w-20 h-20 mx-auto mb-6 text-indigo-400"
          viewBox="0 0 24 24"
          fill="none"
        >
          <circle
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            stroke-width="1.5"
          />
          <path
            d="M15 9L9 15"
            stroke="currentColor"
            stroke-width="1.5"
            stroke-linecap="round"
          />
          <path
            d="M9 9L15 15"
            stroke="currentColor"
            stroke-width="1.5"
            stroke-linecap="round"
          />
          <path
            d="M12 2v20"
            stroke="currentColor"
            stroke-width="1.5"
            stroke-linecap="round"
            stroke-dasharray="1,3"
            opacity="0.3"
          />
          <path
            d="M2 12h20"
            stroke="currentColor"
            stroke-width="1.5"
            stroke-linecap="round"
            stroke-dasharray="1,3"
            opacity="0.3"
          />
        </svg>
        <h2 class="text-2xl font-bold text-indigo-100 mb-4">请先连接钱包</h2>
        <p class="text-indigo-300 mb-6">连接Web3钱包后方可查看您的NFT资产</p>
        <button
          @click="openLoginModal"
          class="px-6 py-3 bg-gradient-to-r from-purple-600/50 to-indigo-600/50 hover:from-purple-600/70 hover:to-indigo-600/70 text-white rounded-lg transition-all transform hover:scale-105 border border-indigo-500/30 group overflow-hidden relative"
        >
          <span class="relative z-10 flex items-center justify-center">
            <svg
              class="w-5 h-5 mr-2"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0110 0v4" />
            </svg>
            连接钱包
          </span>
          <div
            class="absolute inset-0 scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-500 bg-gradient-to-r from-indigo-700/80 to-purple-700/80"
          ></div>
        </button>
      </div>
    </div>

    <!-- 错误提示 -->
    <div v-else-if="error" class="container mx-auto px-4 py-24 z-10 relative">
      <div
        class="bg-red-900/20 backdrop-blur-sm border border-red-500/20 rounded-lg p-6 text-center max-w-md mx-auto"
      >
        <svg
          class="w-16 h-16 mx-auto mb-4 text-red-400"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.5"
        >
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
        <h2 class="text-xl font-bold text-red-200 mb-2">星际通讯受阻</h2>
        <p class="text-red-300 mb-4">{{ error }}</p>
        <div class="flex justify-center space-x-4">
          <button
            @click="retryFetch"
            class="px-5 py-2 bg-red-600/30 hover:bg-red-600/50 text-red-100 rounded-lg transition-all flex items-center"
          >
            <svg
              class="w-4 h-4 mr-2"
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
            重新连接
          </button>
          <router-link
            to="/lottery"
            class="px-5 py-2 bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-100 rounded-lg transition-all flex items-center"
          >
            <svg
              class="w-4 h-4 mr-2"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
            返回星际港
          </router-link>
        </div>
      </div>
    </div>

    <!-- 加载中 -->
    <div
      v-else-if="loading"
      class="flex justify-center items-center min-h-[70vh] z-10 relative"
    >
      <div class="cosmos-loader text-center">
        <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
          <circle
            cx="40"
            cy="40"
            r="32"
            stroke="#8b5cf6"
            stroke-width="2"
            stroke-dasharray="80,60"
            stroke-linecap="round"
          >
            <animateTransform
              attributeName="transform"
              type="rotate"
              from="0 40 40"
              to="360 40 40"
              dur="1.5s"
              repeatCount="indefinite"
            />
          </circle>
          <circle
            cx="40"
            cy="40"
            r="20"
            stroke="#a78bfa"
            stroke-width="2"
            stroke-dasharray="50,40"
            stroke-linecap="round"
          >
            <animateTransform
              attributeName="transform"
              type="rotate"
              from="360 40 40"
              to="0 40 40"
              dur="1.2s"
              repeatCount="indefinite"
            />
          </circle>
        </svg>
        <p class="text-indigo-300 mt-4 animate-pulse">星际记忆检索中...</p>
      </div>
    </div>

    <!-- 中奖记录列表 -->
    <div v-else class="container mx-auto px-4 py-8">
      <!-- 动画标题 -->
      <div
        class="mb-10 text-center relative overflow-hidden rounded-xl bg-gradient-to-r from-purple-800 to-indigo-800"
      >
        <div
          class="absolute inset-0 bg-gradient-to-r from-pink-600 to-purple-600 opacity-20"
        ></div>

        <div
          class="absolute top-0 left-0 w-full h-full opacity-10"
          :style="{
            backgroundImage: `url(https://source.unsplash.com/random/800x400/?crypto,nft)`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            filter: 'blur(8px)',
          }"
        ></div>

        <div class="relative p-6">
          <div class="text-5xl text-white mb-3">
            <i class="fas fa-trophy animate-pulse text-yellow-400"></i>
          </div>
          <h2 class="text-3xl font-bold text-white mb-2">Web3数字资产</h2>
          <p class="text-white opacity-80">探索您的链上奇遇与数字藏品</p>
        </div>
      </div>

      <!-- 标签页导航 -->
      <div class="flex justify-center mb-10">
        <div
          class="bg-indigo-900/30 backdrop-blur-sm rounded-xl p-1 inline-flex"
        >
          <button
            @click="activeTab = 'wins'"
            class="px-4 py-2 rounded-lg transition-all flex items-center"
            :class="
              activeTab === 'wins'
                ? 'bg-gradient-to-r from-purple-600/70 to-indigo-600/70 text-white'
                : 'text-indigo-300 hover:text-white'
            "
          >
            <svg
              class="w-4 h-4 mr-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            我的奖品
          </button>
          <button
            @click="activeTab = 'participations'"
            class="px-4 py-2 rounded-lg transition-all flex items-center"
            :class="
              activeTab === 'participations'
                ? 'bg-gradient-to-r from-purple-600/70 to-indigo-600/70 text-white'
                : 'text-indigo-300 hover:text-white'
            "
          >
            <svg
              class="w-4 h-4 mr-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            参与记录
          </button>
        </div>
      </div>

      <!-- 中奖记录列表 -->
      <div v-if="activeTab === 'wins'" class="animate-fade-in">
        <div v-if="winRecords.length == 0" class="text-center py-10">
          <div
            class="w-20 h-20 mx-auto mb-4 rounded-full bg-indigo-900/50 flex items-center justify-center"
          >
            <svg
              class="w-10 h-10 text-indigo-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="1.5"
                d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
              />
            </svg>
          </div>
          <h3 class="text-xl font-bold text-indigo-200 mb-2">暂无中奖记录</h3>
          <p class="text-indigo-400">参与更多抽奖活动，赢取稀有数字藏品</p>
          <button
            @click="router.push('/lottery')"
            class="mt-4 px-5 py-2 bg-gradient-to-r from-purple-600/50 to-indigo-600/50 rounded-lg text-white hover:from-purple-600/70 hover:to-indigo-600/70 transition-all"
          >
            浏览抽奖活动
          </button>
        </div>

        <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div
            v-for="record in winRecords"
            :key="record.id"
            class="record-card bg-white bg-opacity-10 backdrop-blur-sm rounded-xl overflow-hidden transform transition-all duration-300 hover:scale-[1.02] hover:shadow-xl border border-indigo-500/20"
          >
            <div class="p-6 relative">
              <!-- 状态标签 -->
              <div
                class="absolute top-2 right-2 px-3 py-1 rounded-full text-xs font-medium"
                :class="
                  record.status === 'unclaimed'
                    ? 'bg-yellow-500 text-yellow-900'
                    : 'bg-green-500 text-green-900'
                "
              >
                {{ record.status === "unclaimed" ? "待领取" : "已领取" }}
              </div>

              <div class="flex flex-col md:flex-row md:items-center">
                <div
                  class="flex-shrink-0 w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center mb-4 md:mr-4 md:mb-0"
                >
                  <i class="fas fa-gift text-white text-2xl"></i>
                </div>

                <div class="flex-1">
                  <h3 class="text-xl font-bold text-white mb-1">
                    {{ record.prizeName }}
                  </h3>
                  <p class="text-white opacity-70 text-sm">
                    {{ record.prizeLevel }}
                  </p>

                  <div class="mt-3 space-y-1">
                    <router-link
                      class="text-white opacity-70 text-sm"
                      :to="`/lottery/${record.lotteryId}`"
                    >
                      抽奖活动：{{ record.lotteryName }}
                    </router-link>
                    <div class="text-white opacity-70 text-sm">
                      中奖时间：{{ formatDate(record.winTime) }}
                    </div>
                    <div
                      v-if="record.claimTime"
                      class="text-white opacity-70 text-sm"
                    >
                      领取时间：{{ formatDate(record.claimTime) }}
                    </div>
                  </div>
                </div>
              </div>

              <!-- 领奖按钮 -->
              <div class="mt-5" v-if="record.status === 'unclaimed'">
                <button
                  @click="openClaimModal(record)"
                  class="w-full py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all"
                >
                  立即领取
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 参与记录列表 -->
      <div v-if="activeTab === 'participations'" class="animate-fade-in">
        <div v-if="participationRecords.length === 0" class="text-center py-10">
          <div
            class="w-20 h-20 mx-auto mb-4 rounded-full bg-indigo-900/50 flex items-center justify-center"
          >
            <svg
              class="w-10 h-10 text-indigo-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="1.5"
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h3 class="text-xl font-bold text-indigo-200 mb-2">暂无参与记录</h3>
          <p class="text-indigo-400">参与抽奖活动，探索Web3数字藏品</p>
          <button
            @click="router.push('/lottery')"
            class="mt-4 px-5 py-2 bg-gradient-to-r from-purple-600/50 to-indigo-600/50 rounded-lg text-white hover:from-purple-600/70 hover:to-indigo-600/70 transition-all"
          >
            浏览抽奖活动
          </button>
        </div>

        <div v-else>
          <!-- 手机屏幕显示卡片列表 -->
          <div class="md:hidden space-y-4">
            <div
              v-for="record in participationRecords"
              :key="record.id"
              class="bg-white bg-opacity-5 backdrop-blur-sm border border-indigo-500/20 rounded-xl p-4"
            >
              <div class="flex justify-between items-start">
                <router-link
                  class="text-white font-medium"
                  :to="`/lottery/${record.lotteryId}`"
                >
                  {{ record.lotteryName }}
                </router-link>
                <span
                  class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full"
                  :class="
                    record.lotteryType === 'wheel'
                      ? 'bg-purple-900 text-purple-200'
                      : 'bg-indigo-900 text-indigo-200'
                  "
                >
                  {{ record.lotteryType === "wheel" ? "大转盘" : "盲盒" }}
                </span>
              </div>

              <div class="mt-2 text-sm text-indigo-300">
                {{ formatDate(record.participationTime) }}
              </div>

              <div class="mt-2 flex justify-end">
                <span
                  class="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full"
                  :class="
                    record.isWin
                      ? 'bg-green-900 text-green-200'
                      : 'bg-gray-800 text-gray-300'
                  "
                >
                  {{ record.isWin ? `中奖 (${record.prizeName})` : "未中奖" }}
                </span>
              </div>
            </div>
          </div>

          <!-- 桌面屏幕显示表格 -->
          <div
            class="hidden md:block bg-white bg-opacity-5 backdrop-blur-sm border border-indigo-500/20 rounded-xl overflow-hidden"
          >
            <div class="overflow-x-auto">
              <table class="w-full">
                <thead>
                  <tr class="border-b border-indigo-500/20">
                    <th
                      class="px-6 py-3 text-left text-xs font-medium text-indigo-300 uppercase tracking-wider"
                    >
                      活动名称
                    </th>
                    <th
                      class="px-6 py-3 text-left text-xs font-medium text-indigo-300 uppercase tracking-wider"
                    >
                      参与时间
                    </th>
                    <th
                      class="px-6 py-3 text-center text-xs font-medium text-indigo-300 uppercase tracking-wider"
                    >
                      类型
                    </th>
                    <th
                      class="px-6 py-3 text-center text-xs font-medium text-indigo-300 uppercase tracking-wider"
                    >
                      结果
                    </th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-indigo-500/10">
                  <tr
                    v-for="record in participationRecords"
                    :key="record.id"
                    class="hover:bg-indigo-900/20 transition-colors"
                  >
                    <td class="px-6 py-4 whitespace-nowrap">
                      <router-link
                        class="text-sm font-medium text-white"
                        :to="`/lottery/${record.lotteryId}`"
                      >
                        {{ record.lotteryName }}
                      </router-link>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <div class="text-sm text-indigo-300">
                        {{ formatDate(record.participateTime) }}
                      </div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-center">
                      <span
                        class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full"
                        :class="
                          record.lotteryType === 'wheel'
                            ? 'bg-purple-900 text-purple-200'
                            : 'bg-indigo-900 text-indigo-200'
                        "
                      >
                        {{ record.lotteryType === "wheel" ? "大转盘" : "盲盒" }}
                      </span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-center">
                      <span
                        class="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full"
                        :class="
                          record.isWin
                            ? 'bg-green-900 text-green-200'
                            : 'bg-gray-800 text-gray-300'
                        "
                      >
                        {{
                          record.isWin ? `中奖 (${record.prizeName})` : "未中奖"
                        }}
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 领奖信息弹窗 -->
    <div
      v-if="showClaimModal"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70"
    >
      <div
        class="bg-gradient-to-br from-indigo-700 to-purple-800 rounded-xl p-6 w-full max-w-md mx-4 shadow-2xl"
      >
        <div class="text-right mb-2">
          <button
            @click="closeClaimModal"
            class="text-white text-xl opacity-70 hover:opacity-100"
          >
            <i class="fas fa-times"></i>
          </button>
        </div>

        <div class="text-center mb-6">
          <h3 class="text-2xl font-bold text-white mb-1">填写领奖信息</h3>
          <p class="text-white opacity-70">
            请提供您的联系方式，我们将尽快与您联系
          </p>
        </div>

        <form @submit.prevent="submitClaimInfo">
          <div class="mb-5">
            <label class="block text-white mb-2">联系信息</label>
            <textarea
              v-model="contactInfo"
              rows="4"
              class="w-full px-4 py-3 bg-white bg-opacity-20 text-white placeholder-white placeholder-opacity-60 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
              placeholder="请输入您的姓名、电话、地址等联系方式"
              required
            ></textarea>
          </div>

          <button
            type="submit"
            :disabled="submitting"
            class="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all disabled:opacity-50"
          >
            {{ submitting ? "提交中..." : "提交信息" }}
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, inject, watch, watchEffect } from "vue";
import { useRouter } from "vue-router";
import {
  checkTempToken,
  getTempToken,
  saveTempToken,
  getUserWinRecords,
  getUserParticipations,
  updateWinnerContact,
  clearTempToken,
} from "../../api/lottery";
import { getUserInfoFromCache } from "../../utils/auth";

const router = useRouter();
const openLoginModal = inject("openLoginModal") as () => void;
const isLoggedIn = inject("isLoggedIn") as () => boolean;

const userInfo = ref(getUserInfoFromCache());
const winRecords = ref<any[]>([]);
const participationRecords = ref<any[]>([]);
const loading = ref(true);
const error = ref("");
const activeTab = ref("wins"); // wins or participations

// 领奖相关状态
const showClaimModal = ref(false);
const contactInfo = ref("");
const currentRecord = ref<any>(null);
const submitting = ref(false);

//监控winRecords
watch(winRecords, (newVal) => {
  console.log("winRecords", newVal);
  console.log(newVal.length);
});

watchEffect(() => {
  console.log(
    `时间: ${Date.now()}, loading: ${loading.value}, error: "${
      error.value
    }", isLoggedIn: ${isLoggedIn()}, activeTab: ${
      activeTab.value
    }, winRecords长度: ${winRecords.value.length}`
  );
});

// 打开领奖弹窗
function openClaimModal(record: any) {
  currentRecord.value = record;
  contactInfo.value = "";
  showClaimModal.value = true;
}

// 关闭领奖弹窗
function closeClaimModal() {
  showClaimModal.value = false;
  currentRecord.value = null;
}

// 提交领奖信息
async function submitClaimInfo() {
  if (!currentRecord.value || !contactInfo.value.trim()) return;

  submitting.value = true;
  try {
    await initTempToken();

    const res = await updateWinnerContact(
      currentRecord.value.id,
      contactInfo.value
    );
    if (res.data && res.data.code === 0) {
      alert("领奖信息提交成功，我们将尽快与您联系！");

      // 更新列表中的状态
      const index = winRecords.value.findIndex(
        (record) => record.id === currentRecord.value.id
      );
      if (index !== -1) {
        winRecords.value[index].status = "claimed";
        winRecords.value[index].claimTime = new Date().toISOString();
      }

      closeClaimModal();
    } else {
      alert("提交失败，请稍后再试");
    }
  } catch (error) {
    console.error("提交领奖信息失败:", error);
    alert("网络错误，请稍后再试");
  } finally {
    submitting.value = false;
  }
}

// 截取地址
function truncateAddress(address: string): string {
  if (!address) return "";
  if (address.length <= 10) return address;
  return address.substring(address.length - 6);
}

// 初始化临时token
async function initTempToken() {
  if (!checkTempToken()) {
    try {
      // 生成随机设备ID
      const deviceId = "web_" + Math.random().toString(36).substring(2, 15);
      const res = await getTempToken(deviceId);
      if (res.data && res.data.code === 0) {
        saveTempToken(res.data.data);
      }
    } catch (error) {
      console.error("获取临时token失败:", error);
    }
  }
}

// 初始化数据
async function fetchData() {
  if (!isLoggedIn()) {
    loading.value = false;
    return;
  }

  loading.value = true;
  error.value = "";

  try {
    await initTempToken();

    const userInfo = getUserInfoFromCache();
    if (!userInfo || !userInfo.uid) {
      throw new Error("用户信息不存在");
    }

    // 并行请求获取中奖记录和参与记录
    const [winRes, participationRes] = await Promise.all([
      getUserWinRecords(userInfo.uid),
      getUserParticipations(userInfo.uid, { size: 20 }),
    ]);

    if (winRes.data && winRes.data.code === 0) {
      winRecords.value = winRes.data.data || [];
    } else {
      throw new Error(winRes.data?.msg || "获取中奖记录失败");
    }

    if (participationRes.data && participationRes.data.code === 0) {
      participationRecords.value = participationRes.data.data?.records || [];
    } else {
      console.error("获取参与记录失败:", participationRes.data?.msg);
    }

    //console.log(participationRecords);
  } catch (err: any) {
    console.error("获取数据失败:", err);

    // 处理临时token错误
    if (err.message.includes("临时授权")) {
      error.value = "无法获取临时授权，请刷新页面重试";
      clearTempToken(); // 清除可能失效的token
    } else {
      error.value = err.message || "网络错误，请稍后再试";
    }
  } finally {
    //console.log("finally");
    loading.value = false;
  }
}

// 重试获取数据
function retryFetch() {
  clearTempToken(); // 清除可能失效的token
  fetchData();
}

// 日期格式化
function formatDate(dateStr: string) {
  const date = new Date(dateStr);
  return `${date.getFullYear()}-${(date.getMonth() + 1)
    .toString()
    .padStart(2, "0")}-${date.getDate().toString().padStart(2, "0")} ${date
    .getHours()
    .toString()
    .padStart(2, "0")}:${date.getMinutes().toString().padStart(2, "0")}`;
}

onMounted(() => {
  fetchData();
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

.cosmos-loader {
  display: flex;
  flex-direction: column;
  align-items: center;
}

/* 添加页面切换动画 */
.animate-fade-in {
  animation: fadeIn 0.3s ease-in-out forwards; /* 注意这里添加了 forwards */
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
