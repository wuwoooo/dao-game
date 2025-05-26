<template>
  <div
    class="lottery-detail min-h-screen bg-gradient-to-b from-[#0f172a] via-[#1e293b] to-[#334155] relative overflow-hidden"
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
            {{ lottery?.name || "数字藏品抽奖" }}
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

    <!-- 错误提示 -->
    <div v-if="error" class="container mx-auto px-4 py-24 z-10 relative">
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
        <p class="text-indigo-300 mt-4 animate-pulse">星际定位中...</p>
      </div>
    </div>

    <!-- 活动不存在 -->
    <div
      v-else-if="!lottery"
      class="flex flex-col items-center justify-center min-h-[70vh] z-10 relative"
    >
      <div class="empty-state-illustration mb-6">
        <svg width="120" height="120" viewBox="0 0 24 24" fill="none">
          <path
            d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
            stroke="#8b5cf6"
            stroke-width="1.5"
          />
          <line
            x1="12"
            y1="9"
            x2="12"
            y2="13"
            stroke="#8b5cf6"
            stroke-width="1.5"
          />
          <line
            x1="12"
            y1="17"
            x2="12.01"
            y2="17"
            stroke="#8b5cf6"
            stroke-width="1.5"
          />
          <path
            opacity="0.2"
            d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
            fill="#8b5cf6"
          />
        </svg>
      </div>
      <div class="text-2xl text-indigo-200 mb-4">星域已坍缩</div>
      <p class="text-indigo-300/70 mb-6">该活动已消失于宇宙尘埃，或从未存在</p>
      <router-link
        to="/lottery"
        class="px-6 py-3 bg-gradient-to-r from-purple-600/30 to-indigo-600/30 hover:from-purple-600/50 hover:to-indigo-600/50 border border-indigo-500/30 rounded-lg text-indigo-100 transition-all flex items-center"
      >
        <svg
          class="w-5 h-5 mr-2"
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

    <div v-else class="container mx-auto px-4 py-8">
      <!-- 活动详情头部 -->
      <div class="relative mb-10 overflow-hidden rounded-xl">
        <!-- 背景图层（模糊） -->
        <div
          class="absolute inset-0"
          :style="{
            backgroundImage: lottery?.background
              ? `url(${lottery.background})`
              : `url(${randomBackground(lottery?.id || 0)})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            filter: 'blur(6px)',
            transform: 'scale(1.1)',
            zIndex: 0,
          }"
        ></div>

        <!-- 半透明遮罩层（让内容更清晰） -->
        <div class="absolute inset-0 bg-black/40 z-[1]"></div>

        <!-- Glassmorphism 内容容器 -->
        <div
          class="relative z-[2] p-6 md:p-8 flex flex-col md:flex-row items-center backdrop-blur-md bg-white/10 border border-white/20 rounded-xl shadow-lg ring-1 ring-white/10 transition-all"
        >
          <img
            :src="lottery?.icon || randomIcon(lottery?.id || 0)"
            alt="活动图标"
            class="w-24 h-24 md:w-32 md:h-32 rounded-xl object-cover shadow-xl mb-4 md:mb-0 md:mr-6"
          />

          <div class="flex-1 text-center md:text-left text-white">
            <h1 class="text-3xl md:text-4xl font-bold mb-2">
              {{ lottery.name }}
            </h1>
            <div
              class="mb-2 flex flex-wrap justify-center md:justify-start gap-2"
            >
              <span class="text-xs px-3 py-1 rounded-full bg-indigo-600">
                {{ lottery.lotteryType === "wheel" ? "大转盘" : "盲盒" }}
              </span>
              <span class="text-xs px-3 py-1 rounded-full bg-purple-600">
                主办方: {{ lottery.sponsor }}
              </span>
            </div>
            <p class="opacity-80 mb-4">{{ lottery.description }}</p>
            <div class="opacity-60 text-sm">
              <div>
                活动时间: {{ formatDate(lottery.startTime) }} 至
                {{ formatDate(lottery.endTime) }}
              </div>
              <div v-if="lottery.rule">
                <span
                  >每人总共 {{ lottery.rule.drawLimit }} 次机会，每天限
                  {{ lottery.rule.dailyLimit }} 次</span
                >
                <span v-if="lottery.rule.additionalInfo">
                  · {{ lottery.rule.additionalInfo }}</span
                >
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 大转盘抽奖 -->
      <div
        v-if="lottery?.lotteryType === 'wheel'"
        class="wheel-container mb-10"
      >
        <div class="max-w-lg mx-auto">
          <!-- 转盘装饰外圈 -->
          <div class="relative mx-auto max-w-md">
            <div
              class="absolute -top-2 -left-2 -right-2 -bottom-2 rounded-full bg-gradient-to-br from-indigo-600/60 to-purple-600/60 animate-[spin_10s_linear_infinite] blur-[2px]"
            ></div>
            <div
              class="absolute -top-2 -left-2 -right-2 -bottom-2 rounded-full bg-gradient-to-tl from-pink-500/30 to-indigo-500/30 animate-[spin_15s_linear_infinite_reverse] blur-[3px]"
            ></div>

            <div class="relative">
              <!-- 大转盘背景 -->
              <div
                class="w-full relative aspect-square overflow-hidden rounded-full bg-gradient-to-b from-slate-900 to-gray-900 p-3 border border-indigo-500/30 shadow-[0_0_15px_rgba(139,92,246,0.3)]"
              >
                <!-- 光效元素 -->
                <div
                  class="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(139,92,246,0.2)_0%,transparent_70%)] z-[1]"
                ></div>
                <div class="absolute inset-0 overflow-hidden">
                  <div
                    class="absolute top-0 left-1/2 h-[1px] w-[40%] -translate-x-1/2 bg-gradient-to-r from-transparent via-indigo-400 to-transparent blur-[2px] animate-[shine_4s_ease-in-out_infinite]"
                  ></div>
                  <div
                    class="absolute bottom-0 left-1/2 h-[1px] w-[40%] -translate-x-1/2 bg-gradient-to-r from-transparent via-purple-400 to-transparent blur-[2px] animate-[shine_4s_ease-in-out_infinite_1s]"
                  ></div>
                </div>

                <!-- SVG转盘实现 -->
                <div class="absolute inset-3 z-10">
                  <svg
                    ref="wheelRef"
                    class="w-full h-full transition-transform duration-5000 ease-out"
                    :style="{ transform: `rotate(${wheelRotation}deg)` }"
                    viewBox="0 0 100 100"
                  >
                    <!-- 转盘中心点 -->
                    <circle cx="50" cy="50" r="50" fill="none" />

                    <!-- 动态生成转盘扇形 -->
                    <g
                      v-for="(prize, index) in lottery?.prizes"
                      :key="prize.id"
                    >
                      <!-- 扇形背景 -->
                      <path
                        :d="getWheelSectorPath(index)"
                        :fill="getPrizeColor(index)"
                        class="hover:opacity-90 transition-opacity"
                      />

                      <!-- 扇形分隔线 -->
                      <line
                        :x1="50"
                        :y1="50"
                        :x2="
                          50 +
                          50 * Math.cos((index * sectorAngle * Math.PI) / 180)
                        "
                        :y2="
                          50 -
                          50 * Math.sin((index * sectorAngle * Math.PI) / 180)
                        "
                        stroke="#ffffff"
                        stroke-width="0.3"
                        stroke-opacity="0.5"
                      />

                      <!-- 奖品图片 (如果有) -->
                      <image
                        v-if="prize.image"
                        :href="prize.image"
                        :x="getImagePosition(index).x"
                        :y="getImagePosition(index).y"
                        height="15"
                        width="15"
                        preserveAspectRatio="xMidYMid meet"
                      />

                      <!-- 奖品名称 - 沿弧线显示 -->
                      <path
                        :id="`textPath-${prize.id}`"
                        :d="getTextArcPath(index)"
                        fill="none"
                      />
                      <text
                        fill="white"
                        font-size="4.5"
                        font-weight="bold"
                        class="wheel-prize-text"
                      >
                        <textPath
                          :href="`#textPath-${prize.id}`"
                          startOffset="50%"
                          text-anchor="middle"
                        >
                          {{ prize.name }}
                        </textPath>
                      </text>
                    </g>

                    <!-- 中心圆 -->
                    <circle cx="50" cy="50" r="8" fill="url(#centerGradient)" />

                    <!-- 中心渐变 -->
                    <defs>
                      <radialGradient
                        id="centerGradient"
                        cx="50%"
                        cy="50%"
                        r="50%"
                        fx="50%"
                        fy="50%"
                      >
                        <stop offset="0%" stop-color="#FFD700" />
                        <stop offset="100%" stop-color="#FFA500" />
                      </radialGradient>
                    </defs>
                  </svg>
                </div>

                <!-- 指针和中心按钮 -->
                <div
                  class="absolute inset-0 flex items-center justify-center z-20 pointer-events-none"
                >
                  <!-- 指针 -->
                  <div
                    class="absolute top-0 left-1/2 transform -translate-x-1/2 w-8 h-16"
                  >
                    <div
                      class="w-0 h-0 border-l-[15px] border-l-transparent border-r-[15px] border-r-transparent border-b-[30px] border-b-yellow-500 relative"
                    >
                      <div
                        class="absolute -inset-1 border-l-[15px] border-l-transparent border-r-[15px] border-r-transparent border-b-[30px] border-b-yellow-300 blur-[8px] opacity-70"
                      ></div>
                    </div>
                  </div>

                  <!-- 中心按钮 -->
                  <div
                    class="w-24 h-24 relative bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center shadow-[0_0_10px_rgba(234,179,8,0.5)]"
                  >
                    <div
                      class="absolute inset-1 bg-gradient-to-br from-yellow-300 to-yellow-500 rounded-full flex items-center justify-center shadow-inner"
                    >
                      <div
                        class="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-inner"
                      >
                        <div class="text-indigo-700 font-bold text-xl">
                          开始
                        </div>
                      </div>
                    </div>
                    <!-- 旋转光效 -->
                    <div
                      class="absolute inset-0 rounded-full border-2 border-yellow-300/50 animate-[spin_5s_linear_infinite]"
                    ></div>
                    <div
                      class="absolute inset-2 rounded-full border-2 border-dashed border-yellow-300/30 animate-[spin_8s_linear_infinite_reverse]"
                    ></div>
                  </div>
                </div>
              </div>

              <!-- 抽奖按钮 -->
              <button
                @click="handleDrawClick"
                class="absolute inset-0 m-auto w-24 h-24 rounded-full flex items-center justify-center text-indigo-900 font-bold text-xl transform hover:scale-105 transition-all z-30 focus:outline-none focus:ring focus:ring-yellow-300/50 cursor-pointer"
                :class="{
                  'opacity-50 cursor-not-allowed': !canDraw || isDrawing,
                }"
              >
                <span class="sr-only">抽奖按钮</span>
              </button>
            </div>
          </div>

          <!-- 抽奖信息 -->
          <div class="text-center mt-8 space-y-2">
            <div
              v-if="isLoggedIn()"
              class="bg-white/5 backdrop-blur-sm p-3 rounded-lg inline-block"
            >
              <div class="grid grid-cols-2 gap-4">
                <div class="flex flex-col items-center">
                  <div class="text-xs text-indigo-300 mb-1">今日剩余次数</div>
                  <div class="text-xl font-bold text-white">
                    {{ drawInfo.remainingDrawsToday || 0 }}
                  </div>
                </div>
                <div class="flex flex-col items-center">
                  <div class="text-xs text-indigo-300 mb-1">总剩余次数</div>
                  <div class="text-xl font-bold text-white">
                    {{ drawInfo.remainingDraws || 0 }}
                  </div>
                </div>
              </div>
            </div>

            <div v-else>
              <button
                @click="openLoginModal"
                class="px-5 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all flex mx-auto items-center shadow-lg shadow-indigo-900/30"
              >
                <svg
                  class="w-4 h-4 mr-2"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4"></path>
                  <polyline points="10 17 15 12 10 7"></polyline>
                  <line x1="15" y1="12" x2="3" y2="12"></line>
                </svg>
                连接Web3钱包
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- 盲盒抽奖 -->
      <div
        v-else-if="lottery?.lotteryType === 'box'"
        class="box-container mb-10"
      >
        <div class="max-w-lg mx-auto">
          <div class="text-center mb-6 text-indigo-200 text-lg">
            点击盲盒，开启链上奇遇
          </div>

          <div class="relative">
            <!-- 特效背景 -->
            <div
              class="absolute -inset-10 bg-[radial-gradient(ellipse_at_center,rgba(139,92,246,0.15),transparent_80%)] pointer-events-none"
            ></div>

            <div class="flex flex-wrap justify-center gap-6">
              <!-- 盲盒容器 -->
              <div
                class="relative w-64 h-64 perspective-1000"
                :class="{ 'pointer-events-none': isDrawing || !canDraw }"
              >
                <!-- 盲盒 -->
                <div
                  ref="boxRef"
                  class="relative w-full h-full transform-style-3d transition-transform duration-1000"
                  :class="{ 'box-open': boxOpened }"
                  @click="handleDrawClick"
                >
                  <!-- 盲盒正面 -->
                  <div
                    class="absolute inset-0 backface-hidden bg-gradient-to-br from-indigo-600 to-purple-700 rounded-lg shadow-2xl flex items-center justify-center border border-indigo-500/30"
                  >
                    <!-- 盒子内容 -->
                    <div class="text-center p-4 relative">
                      <!-- 光效 -->
                      <div
                        class="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.1),transparent_70%)]"
                      ></div>

                      <!-- 礼物图标 -->
                      <div
                        class="relative w-24 h-24 mx-auto mb-4 flex items-center justify-center"
                      >
                        <div
                          class="absolute inset-0 bg-indigo-500/20 rounded-full animate-ping opacity-70"
                        ></div>
                        <div
                          class="w-16 h-16 bg-gradient-to-br from-pink-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg"
                        >
                          <i class="fas fa-gift text-white text-3xl"></i>
                        </div>
                      </div>

                      <div
                        class="text-white font-bold text-2xl mb-2 drop-shadow-[0_1px_2px_rgba(0,0,0,0.3)]"
                      >
                        盲盒
                      </div>
                      <div class="text-white text-sm opacity-90">
                        链上奇遇 点击开启
                      </div>

                      <!-- 粒子效果 -->
                      <div class="particles">
                        <div
                          v-for="i in 12"
                          :key="`particle-${i}`"
                          class="particle absolute w-1 h-1 rounded-full bg-white"
                          :style="{
                            top: `${Math.random() * 100}%`,
                            left: `${Math.random() * 100}%`,
                            opacity: Math.random() * 0.5 + 0.3,
                            animationDelay: `${Math.random() * 2}s`,
                            animationDuration: `${Math.random() * 3 + 2}s`,
                          }"
                        ></div>
                      </div>
                    </div>

                    <!-- 装饰元素 -->
                    <div
                      class="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-yellow-400 to-pink-500 rounded-t-lg"
                    ></div>
                    <div
                      class="absolute w-20 h-6 bg-gradient-to-r from-purple-400 to-indigo-500 rounded-lg top-6 left-1/2 transform -translate-x-1/2"
                    ></div>

                    <!-- 丝带 -->
                    <div
                      class="absolute top-0 left-1/2 transform -translate-x-1/2 w-8 h-full pointer-events-none"
                    >
                      <div
                        class="absolute top-0 w-full h-full border-l-[12px] border-l-pink-500 border-r-[12px] border-r-pink-500"
                      ></div>
                    </div>
                    <div
                      class="absolute top-1/2 left-0 transform -translate-y-1/2 w-full h-8 pointer-events-none"
                    >
                      <div
                        class="absolute left-0 w-full h-full border-t-[12px] border-t-pink-500 border-b-[12px] border-b-pink-500"
                      ></div>
                    </div>
                    <div
                      class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-pink-500 rounded-full flex items-center justify-center shadow-md z-10 pointer-events-none"
                    >
                      <div
                        class="w-12 h-12 bg-gradient-to-br from-yellow-400 to-pink-500 rounded-full flex items-center justify-center"
                      >
                        <i class="fas fa-question text-white text-2xl"></i>
                      </div>
                    </div>
                  </div>

                  <!-- 盲盒背面 (打开后显示结果) -->
                  <div
                    class="absolute inset-0 backface-hidden rotateY-180 bg-gradient-to-br from-yellow-400 to-orange-600 rounded-lg shadow-2xl flex items-center justify-center border border-yellow-300/30"
                  >
                    <div v-if="drawResult" class="text-center p-6 relative">
                      <!-- 结果光效 -->
                      <div
                        class="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.2),transparent_70%)]"
                      ></div>

                      <!-- 中奖图标/未中图标 -->
                      <div class="relative w-24 h-24 mx-auto mb-6">
                        <div
                          v-if="drawResult.win"
                          class="absolute inset-0 bg-yellow-400/20 rounded-full animate-pulse"
                        ></div>
                        <div
                          v-if="drawResult.win"
                          class="w-full h-full bg-gradient-to-br from-yellow-300 to-yellow-500 rounded-full flex items-center justify-center shadow-lg"
                        >
                          <i class="fas fa-crown text-white text-4xl"></i>
                        </div>
                        <div
                          v-else
                          class="w-full h-full bg-gradient-to-br from-gray-500 to-gray-700 rounded-full flex items-center justify-center shadow-lg"
                        >
                          <i
                            class="fas fa-heart-broken text-white text-4xl"
                          ></i>
                        </div>
                      </div>

                      <div
                        class="text-white font-bold text-2xl mb-3 drop-shadow-[0_1px_2px_rgba(0,0,0,0.3)]"
                      >
                        {{ drawResult.win ? "恭喜获得NFT!" : "很遗憾未中奖" }}
                      </div>

                      <div
                        v-if="drawResult.win && drawResult.prize"
                        class="bg-white/20 backdrop-blur-sm rounded-lg p-3 shadow-xl border border-white/10"
                      >
                        <div class="font-bold text-white text-lg">
                          {{ drawResult.prize.name }}
                        </div>
                        <div class="text-white/80 text-sm">
                          {{ drawResult.prize.level }}
                        </div>
                      </div>
                      <div v-else class="text-white opacity-80 text-sm">
                        再接再厉，下次好运
                      </div>

                      <!-- 粒子效果 -->
                      <div v-if="drawResult.win" class="particles">
                        <div
                          v-for="i in 20"
                          :key="`win-particle-${i}`"
                          class="win-particle absolute w-2 h-2 rounded-full"
                          :style="{
                            top: `${Math.random() * 100}%`,
                            left: `${Math.random() * 100}%`,
                            backgroundColor: [
                              '#FCD34D',
                              '#F97316',
                              '#EC4899',
                              '#8B5CF6',
                            ][Math.floor(Math.random() * 4)],
                            opacity: Math.random() * 0.7 + 0.3,
                            animationDelay: `${Math.random() * 2}s`,
                            animationDuration: `${Math.random() * 3 + 2}s`,
                          }"
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- 抽奖信息 -->
            <div class="text-center mt-8 space-y-2">
              <div
                v-if="isLoggedIn()"
                class="bg-white/5 backdrop-blur-sm p-3 rounded-lg inline-block"
              >
                <div class="grid grid-cols-2 gap-4">
                  <div class="flex flex-col items-center">
                    <div class="text-xs text-indigo-300 mb-1">今日剩余次数</div>
                    <div class="text-xl font-bold text-white">
                      {{ drawInfo.remainingDrawsToday || 0 }}
                    </div>
                  </div>
                  <div class="flex flex-col items-center">
                    <div class="text-xs text-indigo-300 mb-1">总剩余次数</div>
                    <div class="text-xl font-bold text-white">
                      {{ drawInfo.remainingDraws || 0 }}
                    </div>
                  </div>
                </div>
              </div>

              <div v-else>
                <button
                  @click="openLoginModal"
                  class="px-5 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all flex mx-auto items-center shadow-lg shadow-indigo-900/30"
                >
                  <svg
                    class="w-4 h-4 mr-2"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                  >
                    <path d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4"></path>
                    <polyline points="10 17 15 12 10 7"></polyline>
                    <line x1="15" y1="12" x2="3" y2="12"></line>
                  </svg>
                  连接Web3钱包
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 抽奖结果展示 -->
      <div
        v-if="showResultModal"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70"
      >
        <div
          class="bg-gradient-to-br from-indigo-700 to-purple-800 rounded-xl p-6 w-full max-w-md mx-4 shadow-2xl transform transition-all animate-bounce-in border border-indigo-500/40"
        >
          <div class="text-center">
            <div
              class="rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4"
              :class="drawResult.win ? 'bg-yellow-500' : 'bg-gray-600'"
            >
              <i
                :class="[
                  drawResult.win
                    ? 'fas fa-trophy text-yellow-200'
                    : 'fas fa-heart-broken text-white',
                  'text-4xl',
                ]"
              ></i>
            </div>

            <h3 class="text-2xl font-bold text-white mb-3">
              {{ drawResult.win ? "恭喜中奖!获得NFT!" : "未中奖" }}
            </h3>

            <div
              v-if="drawResult.win && drawResult.prize"
              class="bg-white bg-opacity-10 rounded-lg p-4 mb-6 border border-indigo-500/30"
            >
              <div class="text-lg font-bold text-white">
                {{ drawResult.prize.name }}
              </div>
              <div class="text-sm text-white opacity-80">
                {{ drawResult.prize.level }}
              </div>
            </div>
            <div v-else-if="!drawResult.win" class="text-white opacity-80 mb-6">
              很遗憾，本次未中奖，再接再厉！
            </div>

            <div class="text-sm text-white opacity-80 mb-4">
              <div>
                今日剩余抽奖次数: {{ drawInfo.remainingDrawsToday || 0 }}
              </div>
              <div>总共剩余抽奖次数: {{ drawInfo.remainingDraws || 0 }}</div>
            </div>

            <div class="flex justify-center space-x-3">
              <button
                v-if="canDraw"
                @click="closeResultModal"
                class="px-5 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all"
              >
                继续抽奖
              </button>
              <button
                v-if="drawResult.win"
                @click="goToMyLottery"
                class="px-5 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all"
              >
                查看奖品
              </button>
              <button
                v-if="!canDraw"
                @click="closeResultModal"
                class="px-5 py-2 bg-gray-600 text-white rounded-lg"
              >
                明日再来
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- 奖品列表 -->
      <div
        class="prize-list bg-white bg-opacity-5 backdrop-blur-sm rounded-xl p-6 mb-10"
      >
        <h2 class="text-2xl font-bold text-white mb-6 flex items-center">
          <svg
            class="w-6 h-6 mr-2 text-indigo-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          奖品池详情
        </h2>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <div
            v-for="prize in displayPrizes"
            :key="prize.id"
            class="bg-gradient-to-br from-indigo-900/50 to-purple-900/50 backdrop-blur-sm rounded-lg overflow-hidden border border-indigo-500/20 transform transition-all hover:scale-[1.02] hover:shadow-[0_0_15px_rgba(139,92,246,0.2)]"
          >
            <!-- 奖品图片 -->
            <div class="relative h-36 overflow-hidden">
              <img
                :src="
                  prize.image ||
                  `https://source.unsplash.com/random/300x200/?${encodeURIComponent(
                    prize.name
                  )},nft&${prize.id}`
                "
                alt="奖品图片"
                class="w-full h-full object-cover"
              />
              <div
                class="absolute top-0 right-0 m-2 px-2 py-1 text-xs font-semibold rounded-full bg-purple-900/80 text-white"
              >
                {{ prize.level }}
              </div>
              <div
                class="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"
              ></div>
            </div>

            <div class="p-4">
              <div class="flex justify-between items-start mb-3">
                <h3 class="text-lg font-bold text-white">{{ prize.name }}</h3>
                <div
                  class="flex items-center bg-indigo-900/50 rounded px-2 py-1"
                >
                  <svg
                    class="w-4 h-4 text-indigo-300 mr-1"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                    />
                  </svg>
                  <span class="text-xs text-indigo-300">
                    {{ formatProbability(prize.probability) }}
                  </span>
                </div>
              </div>

              <div class="flex justify-between items-center mt-2 text-sm">
                <div class="flex items-center text-indigo-300">
                  <!-- 稀有度图标 -->
                  <div
                    :class="[
                      getRarityIconAndColor(prize.probability).color,
                      'mr-1 flex items-center',
                    ]"
                  >
                    <!-- 传说 - 皇冠图标 -->
                    <svg
                      v-if="prize.probability < 1"
                      class="w-4 h-4"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path
                        d="M11.9999 1L17.1962 7.6085L24.0005 8.2626L17.9951 13.3167L19.392 20L11.9999 16.8501L4.60787 20L6.0048 13.3167L-0.000488281 8.2626L6.8037 7.6085L11.9999 1Z"
                      ></path>
                    </svg>
                    <!-- 史诗 - 宝石图标 -->
                    <svg
                      v-else-if="prize.probability < 5"
                      class="w-4 h-4"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M12 2L6 7L12 22L18 7L12 2Z"></path>
                    </svg>
                    <!-- 稀有 - 星星图标 -->
                    <svg
                      v-else-if="prize.probability < 10"
                      class="w-4 h-4"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path
                        d="M12 17.27L18.18 21L16.54 13.97L22 9.24L14.81 8.63L12 2L9.19 8.63L2 9.24L7.46 13.97L5.82 21L12 17.27Z"
                      ></path>
                    </svg>
                    <!-- 高级 - 徽章图标 -->
                    <svg
                      v-else-if="prize.probability < 20"
                      class="w-4 h-4"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path
                        d="M12 2C6.47 2 2 6.47 2 12C2 17.53 6.47 22 12 22C17.53 22 22 17.53 22 12C22 6.47 17.53 2 12 2ZM12 20C7.59 20 4 16.41 4 12C4 7.59 7.59 4 12 4C16.41 4 20 7.59 20 12C20 16.41 16.41 20 12 20ZM12 15C13.66 15 15 13.66 15 12C15 10.34 13.66 9 12 9C10.34 9 9 10.34 9 12C9 13.66 10.34 15 12 15Z"
                      ></path>
                    </svg>
                    <!-- 普通 - 圆形图标 -->
                    <svg
                      v-else
                      class="w-4 h-4"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path
                        d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2Z"
                      ></path>
                    </svg>
                  </div>
                  <span>稀有度: {{ formatRarity(prize.probability) }}</span>
                </div>
                <div class="text-indigo-300">
                  {{
                    formatQuantity(prize.totalQuantity, prize.remainQuantity)
                  }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, watch, computed, inject } from "vue";
import { useRoute, useRouter } from "vue-router";
import {
  clearTempToken,
  getLotteryDetail,
  participateLottery,
} from "../../api/lottery";
import { getUserInfoFromCache } from "../../utils/auth";

const route = useRoute();
const router = useRouter();
const openLoginModal = inject("openLoginModal") as () => void;
const isLoggedIn = inject("isLoggedIn") as () => boolean;

const lottery = ref<any>(null);
const loading = ref(true);
const error = ref("");
const isDrawing = ref(false);
const wheelRef = ref<HTMLElement | null>(null);
const boxRef = ref<HTMLElement | null>(null);
const wheelRotation = ref(0);
const boxOpened = ref(false);
const showResultModal = ref(false);
const drawResult = ref<any>({
  win: false,
  prize: null,
  remainingDraws: 0,
  remainingDrawsToday: 0,
});

// 抽奖限制信息
const drawInfo = reactive({
  remainingDraws: 0,
  remainingDrawsToday: 0,
});

// 计算当前是否可以抽奖
const canDraw = computed(() => {
  return (
    isLoggedIn() &&
    drawInfo.remainingDraws > 0 &&
    drawInfo.remainingDrawsToday > 0
  );
});

// 计算每个扇形的角度
const sectorAngle = computed(() => {
  if (
    !lottery.value ||
    !lottery.value.prizes ||
    lottery.value.prizes.length === 0
  )
    return 0;
  return 360 / lottery.value.prizes.length;
});

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

// 获取抽奖活动详情
async function fetchLotteryDetail() {
  loading.value = true;
  error.value = "";

  try {
    const lotteryId = Number(route.params.id);
    if (isNaN(lotteryId)) {
      lottery.value = null;
      return;
    }

    // 获取用户信息，如果已登录则传递uid
    const userInfo = getUserInfoFromCache();
    const uid = userInfo?.uid || null;

    const res = await getLotteryDetail(lotteryId, uid);
    if (res.data && res.data.code === 0) {
      lottery.value = res.data.data;

      // 检查是否存在"谢谢参与"奖项
      const hasThanksItem =
        lottery.value.prizes &&
        lottery.value.prizes.some(
          (p: any) => p.name.includes("谢谢参与") || p.level.includes("未中奖")
        );

      // 如果没有"谢谢参与"奖项，添加一个到前端展示（不会保存到后端）
      if (
        !hasThanksItem &&
        lottery.value.prizes &&
        lottery.value.prizes.length > 0
      ) {
        console.warn("抽奖活动添加前端'谢谢参与'奖项，请在后台配置正式添加");

        // 为转盘添加"谢谢参与"奖项
        lottery.value.prizes.push({
          id: "thanks-item-" + Date.now(), // 生成一个临时ID
          lotteryId: lottery.value.id,
          level: "未中奖",
          name: "谢谢参与",
          probability: 50, // 设一个高概率值
          image: null,
        });
      }

      // 如果接口返回了剩余次数，则使用接口返回的值
      if (lottery.value.remainingDraws !== undefined) {
        drawInfo.remainingDraws = lottery.value.remainingDraws;
      } else if (lottery.value.rule) {
        // 否则使用规则中的默认值
        drawInfo.remainingDraws = lottery.value.rule.drawLimit;
      }

      if (lottery.value.remainingDrawsToday !== undefined) {
        drawInfo.remainingDrawsToday = lottery.value.remainingDrawsToday;
      } else if (lottery.value.rule) {
        // 否则使用规则中的默认值
        drawInfo.remainingDrawsToday = lottery.value.rule.dailyLimit;
      }
    } else {
      lottery.value = null;
      throw new Error(res.data?.msg || "获取抽奖活动详情失败");
    }
  } catch (err: any) {
    console.error("获取抽奖活动详情失败:", err);

    // 处理临时token错误
    if (err.message.includes("临时授权")) {
      error.value = "无法获取临时授权，请刷新页面重试";
      clearTempToken(); // 清除可能失效的token
    } else {
      error.value = err.message || "网络错误，请稍后再试";
    }

    lottery.value = null;
  } finally {
    loading.value = false;
  }
}

// 重试获取数据
function retryFetch() {
  clearTempToken(); // 清除可能失效的token
  fetchLotteryDetail();
}

// 日期格式化
function formatDate(dateStr: string) {
  const date = new Date(dateStr);
  return `${date.getFullYear()}-${(date.getMonth() + 1)
    .toString()
    .padStart(2, "0")}-${date.getDate().toString().padStart(2, "0")}`;
}

// 获取奖品颜色
function getPrizeColor(index: number) {
  const colors = [
    "#FF6B6B",
    "#4ECDC4",
    "#45B7D1",
    "#FFA5A5",
    "#845EC2",
    "#D65DB1",
    "#FF9671",
    "#FFC75F",
    "#F9F871",
    "#B39CD0",
    "#00C9A7",
    "#C34A36",
  ];
  return colors[index % colors.length];
}

// 格式化概率显示
function formatProbability(probability?: number): string {
  if (probability === undefined || probability === null) return "未知";
  // 概率已经是百分比，不需要再乘以100
  return `${Number(probability).toFixed(2)}%`;
}

// 格式化稀有度
function formatRarity(probability?: number): string {
  if (probability === undefined || probability === null) return "未知";

  // 概率已经是百分比，所以判断条件也需要调整
  if (probability < 1) return "传说";
  if (probability < 5) return "史诗";
  if (probability < 10) return "稀有";
  if (probability < 20) return "优秀";
  return "普通";
}

// 获取稀有度图标和颜色
function getRarityIconAndColor(probability?: number): {
  icon: string;
  color: string;
} {
  if (probability === undefined || probability === null) {
    return { icon: "question-circle", color: "text-gray-400" };
  }

  if (probability < 1) {
    return { icon: "crown", color: "text-yellow-500" }; // 传说 - 皇冠图标，金色
  }
  if (probability < 5) {
    return { icon: "gem", color: "text-purple-500" }; // 史诗 - 宝石图标，紫色
  }
  if (probability < 10) {
    return { icon: "star", color: "text-blue-500" }; // 稀有 - 星星图标，蓝色
  }
  if (probability < 20) {
    return { icon: "certificate", color: "text-green-500" }; // 优秀 - 证书图标，绿色
  }
  return { icon: "circle", color: "text-gray-400" }; // 普通 - 圆形图标，灰色
}

// 格式化数量信息
function formatQuantity(quantity?: number, remaining?: number): string {
  if (quantity === undefined || quantity === null) return "无限制";

  if (remaining !== undefined && remaining !== null) {
    return `${remaining}/${quantity}`;
  }

  return `总量: ${quantity}`;
}

// 计算属性：过滤后的奖品列表（不包括"谢谢参与"）
const displayPrizes = computed(() => {
  if (!lottery.value?.prizes) return [];
  return lottery.value.prizes.filter(
    (prize: any) =>
      !prize.name?.includes("谢谢参与") && !prize.level?.includes("未中奖")
  );
});

// 参与抽奖
async function startDraw() {
  console.log(
    "isDrawing.value",
    isDrawing.value,
    "canDraw.value",
    canDraw.value
  );
  if (isDrawing.value || !canDraw.value) return;

  isDrawing.value = true;

  try {
    const userInfo = getUserInfoFromCache();
    if (!userInfo || !userInfo.uid) {
      openLoginModal();
      isDrawing.value = false;
      return;
    }

    const lotteryId = Number(route.params.id);
    const res = await participateLottery(lotteryId, userInfo.uid);

    if (res.data && res.data.code === 0) {
      const result = res.data.data;

      // 更新剩余抽奖次数
      drawInfo.remainingDraws = result.remainingDraws;
      drawInfo.remainingDrawsToday = result.remainingDrawsToday;

      // 存储抽奖结果
      drawResult.value = {
        win: result.win,
        prize: result.prize,
        winnerId: result.winnerId,
        remainingDraws: result.remainingDraws,
        remainingDrawsToday: result.remainingDrawsToday,
      };

      // 根据抽奖形式展示不同动画
      if (lottery.value.lotteryType === "wheel") {
        // 如果未中奖，找到转盘上的"谢谢参与"奖项
        if (!result.win) {
          const thanksItem = lottery.value.prizes.find(
            (p: any) =>
              p.name.includes("谢谢参与") || p.level.includes("未中奖")
          );
          if (thanksItem) {
            spinWheel(thanksItem);
          } else {
            // 如果转盘上没有"谢谢参与"，随机指向一个位置
            const randomIndex = Math.floor(
              Math.random() * lottery.value.prizes.length
            );
            spinWheel(lottery.value.prizes[randomIndex]);
            console.warn('转盘上没有"谢谢参与"奖项，请在后台配置添加');
          }
        } else {
          spinWheel(result.prize);
        }
      } else if (lottery.value.lotteryType === "box") {
        openBox();
      }
    } else {
      alert("抽奖失败，请稍后再试");
      isDrawing.value = false;
    }
  } catch (error) {
    console.error("参与抽奖失败:", error);
    alert("网络错误，请稍后再试");
    isDrawing.value = false;
  }
}

// 旋转转盘
function spinWheel(prize: any) {
  if (!wheelRef.value || !lottery.value?.prizes) return;

  // 确定要旋转到的位置
  let targetIndex = 0;
  if (prize) {
    targetIndex = lottery.value.prizes.findIndex((p: any) => p.id === prize.id);
    if (targetIndex === -1) targetIndex = 0;
  }

  // 添加转盘音效
  const audio = new Audio();
  audio.src =
    "https://assets.mixkit.co/sfx/preview/mixkit-slot-machine-wheel-1932.mp3";
  audio.volume = 0.5;
  audio.play();

  // 计算目标角度（多转几圈再停在目标位置）
  const baseRotation = 3600; // 多转10圈
  const targetRotation = baseRotation + (360 - targetIndex * sectorAngle.value);

  // 设置旋转动画
  wheelRotation.value = targetRotation;

  // 动画结束后显示结果
  setTimeout(() => {
    // 播放结果音效
    const resultAudio = new Audio();
    resultAudio.src = drawResult.value.win
      ? "https://assets.mixkit.co/sfx/preview/mixkit-winning-chimes-2015.mp3"
      : "https://assets.mixkit.co/sfx/preview/mixkit-losing-bleeps-2026.mp3";
    resultAudio.volume = 0.6;
    resultAudio.play();

    showResultModal.value = true;
    isDrawing.value = false;

    // 不重置转盘角度，保持在中奖位置
  }, 5000); // 动画时长
}

// 打开盲盒
function openBox() {
  if (!boxRef.value) return;

  // 添加打开盒子的音效
  const audio = new Audio();
  audio.src =
    "https://assets.mixkit.co/sfx/preview/mixkit-magical-shine-chord-2846.mp3";
  audio.volume = 0.5;
  audio.play();

  boxOpened.value = true;

  // 打开动画结束后显示结果
  setTimeout(() => {
    // 播放结果音效
    const resultAudio = new Audio();
    resultAudio.src = drawResult.value.win
      ? "https://assets.mixkit.co/sfx/preview/mixkit-game-treasure-coin-2038.mp3"
      : "https://assets.mixkit.co/sfx/preview/mixkit-losing-bleeps-2026.mp3";
    resultAudio.volume = 0.6;
    resultAudio.play();

    showResultModal.value = true;
    isDrawing.value = false;

    // 重置盲盒状态（为下次抽奖做准备）
    setTimeout(() => {
      boxOpened.value = false;
    }, 500);
  }, 1500); // 动画时长
}

// 关闭结果弹窗
function closeResultModal() {
  showResultModal.value = false;
  // 不需要触发转盘继续转动
}

// 跳转到"我的抽奖"页面
function goToMyLottery() {
  showResultModal.value = false;
  router.push("/my-lottery");
}

// 参与抽奖按钮点击事件
function handleDrawClick() {
  console.log("点击抽奖按钮");
  if (!isLoggedIn()) {
    // 未登录时，打开登录窗口
    openLoginModal();
    return;
  }

  // 已登录，开始抽奖
  startDraw();
}

// 根据索引获取转盘扇区SVG路径
function getWheelSectorPath(index: number): string {
  const startAngle = index * sectorAngle.value;
  const endAngle = (index + 1) * sectorAngle.value;

  // SVG圆形中，0度在东方(3点钟方向)，顺时针旋转
  // 转换为数学角度，0度在北方(12点钟方向)，顺时针旋转
  const x1 = 50 + 50 * Math.sin((startAngle * Math.PI) / 180);
  const y1 = 50 - 50 * Math.cos((startAngle * Math.PI) / 180);
  const x2 = 50 + 50 * Math.sin((endAngle * Math.PI) / 180);
  const y2 = 50 - 50 * Math.cos((endAngle * Math.PI) / 180);

  // 使用大圆弧标志 (大于180度时为1，否则为0)
  const largeArcFlag = sectorAngle.value > 180 ? 1 : 0;

  // 构建路径: 从中心点到第一个角度，然后画弧到第二个角度，然后回到中心点
  return `M 50 50 L ${x1} ${y1} A 50 50 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;
}

// 获取奖品图片位置
function getImagePosition(index: number) {
  const angle =
    ((index * sectorAngle.value + sectorAngle.value / 2) * Math.PI) / 180;
  const r = 30; // 从中心点算起的半径距离

  return {
    x: 50 + r * Math.sin(angle) - 7.5, // 7.5是图片宽度的一半
    y: 50 - r * Math.cos(angle) - 7.5, // 7.5是图片高度的一半
  };
}

// 获取文字弧线路径
function getTextArcPath(index: number) {
  const startAngle = index * sectorAngle.value;
  const endAngle = (index + 1) * sectorAngle.value;

  // 计算弧线的中心角度
  const midAngle = (startAngle + endAngle) / 2;

  // 生成文字弧线半径（比扇区半径短一些）
  // 调整为38更靠近外缘，使文字位置更靠上
  const textRadius = 38;

  // 调整弧长，使其比扇区短一些，避免文字太贴近边缘
  const arcAngleSpan = sectorAngle.value * 0.7;
  const textStartAngle = midAngle - arcAngleSpan / 2;
  const textEndAngle = midAngle + arcAngleSpan / 2;

  // 转换为弧度
  const startRad = (textStartAngle * Math.PI) / 180;
  const endRad = (textEndAngle * Math.PI) / 180;

  // 计算弧线起点和终点
  const x1 = 50 + textRadius * Math.sin(startRad);
  const y1 = 50 - textRadius * Math.cos(startRad);
  const x2 = 50 + textRadius * Math.sin(endRad);
  const y2 = 50 - textRadius * Math.cos(endRad);

  // 判断是否需要反向绘制（确保文字方向正确）
  const needReverse = midAngle > 90 && midAngle < 270;

  // 生成路径
  return needReverse
    ? `M ${x2} ${y2} A ${textRadius} ${textRadius} 0 0 0 ${x1} ${y1}`
    : `M ${x1} ${y1} A ${textRadius} ${textRadius} 0 0 1 ${x2} ${y2}`;
}

onMounted(() => {
  fetchLotteryDetail();
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

.wheel-circle {
  border-radius: 50%;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.3);
}

/* 转盘文字效果增强 */
.wheel-prize-text {
  text-shadow: 0 0 3px rgba(0, 0, 0, 0.8), 0 1px 1px #000;
  letter-spacing: 0.1px;
  dominant-baseline: middle;
  filter: drop-shadow(0px 1px 1px rgba(0, 0, 0, 0.7));
}

.duration-5000 {
  transition-duration: 5000ms;
}

.transform-gpu {
  transform: translateZ(0);
}

.transform-style-3d {
  transform-style: preserve-3d;
}

.backface-hidden {
  backface-visibility: hidden;
}

.rotateY-180 {
  transform: rotateY(180deg);
}

.box-open {
  transform: rotateY(180deg);
}

.perspective-1000 {
  perspective: 1000px;
}

@keyframes bounce-in {
  0% {
    transform: scale(0.8);
    opacity: 0;
  }
  70% {
    transform: scale(1.05);
    opacity: 1;
  }
  100% {
    transform: scale(1);
  }
}

.animate-bounce-in {
  animation: bounce-in 0.5s;
}

/* 粒子动画效果 */
.particle {
  animation: floating ease-in-out infinite;
}

.win-particle {
  animation: winFloating ease-in-out infinite;
}

@keyframes floating {
  0%,
  100% {
    transform: translateY(0) translateX(0);
  }
  25% {
    transform: translateY(-10px) translateX(5px);
  }
  50% {
    transform: translateY(0) translateX(10px);
  }
  75% {
    transform: translateY(10px) translateX(5px);
  }
}

@keyframes winFloating {
  0% {
    transform: translateY(0) translateX(0) scale(1);
    opacity: 0.7;
  }
  50% {
    transform: translateY(-15px) translateX(10px) scale(1.2);
    opacity: 0.9;
  }
  100% {
    transform: translateY(-30px) translateX(20px) scale(0.5);
    opacity: 0;
  }
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
