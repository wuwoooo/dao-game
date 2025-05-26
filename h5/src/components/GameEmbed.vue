<template>
  <div
    ref="gameContainerRef"
    :class="['game-embed-container', { fullscreen: isFullscreen }]"
  >
    <!-- 加载动画 -->
    <div v-if="loading" class="loading-overlay">
      <div class="loading-spinner">
        <div class="spinner"></div>
        <div class="loading-text">游戏加载中...</div>
      </div>
    </div>

    <!-- 返回按钮 -->
    <div class="control-bar" :class="{ visible: controlBarVisible }">
      <button @click="handleBack" class="control-button back-button">
        <i class="fas fa-arrow-left"></i>
        <span>返回</span>
      </button>
      <button
        @click="toggleFullscreen"
        class="control-button fullscreen-button"
      >
        <i :class="isFullscreen ? 'fas fa-compress' : 'fas fa-expand'"></i>
        <span>{{ isFullscreen ? "退出全屏" : "全屏" }}</span>
      </button>
    </div>

    <!-- 游戏iframe -->
    <div class="responsive-iframe-container">
      <iframe
        v-show="!loading"
        ref="gameIframeRef"
        :src="gameUrl"
        sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-pointer-lock allow-fullscreen"
        class="game-iframe"
        frameborder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
        allowfullscreen
        webkitallowfullscreen="true"
        mozallowfullscreen="true"
        @load="handleIframeLoad"
      ></iframe>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, nextTick } from "vue";
import { useRouter } from "vue-router";

const props = defineProps<{
  gameUrl: string;
  gameName?: string;
}>();

const router = useRouter();
const gameContainerRef = ref<HTMLDivElement | null>(null);
const gameIframeRef = ref<HTMLIFrameElement | null>(null);
const loading = ref(true);
const isFullscreen = ref(false);
const controlBarVisible = ref(true);
let controlBarTimer: number | null = null;
let touchStartY = 0;
let touchMoveY = 0;

// 处理返回按钮点击
const handleBack = () => {
  if (isFullscreen.value) {
    exitFullscreen();
  } else {
    router.back();
  }
};

// 处理iframe加载完成
const handleIframeLoad = () => {
  // 设置一个最小加载时间，确保用户能看到加载动画
  setTimeout(() => {
    loading.value = false;

    // 在iframe加载完成后，等待下一个tick再尝试自动进入全屏
    // 这样可以确保DOM已经完全渲染
    nextTick(() => {
      // 如果是移动设备并且是横屏状态，自动进入全屏
      if (
        window.matchMedia("(orientation: landscape)").matches &&
        window.innerWidth < 1024
      ) {
        enterFullscreen();
      }
    });
  }, 1000);
};

// 进入全屏模式
const enterFullscreen = () => {
  const container = gameContainerRef.value;
  if (!container) return;

  if (container.requestFullscreen) {
    container.requestFullscreen();
  } else if ((container as any).mozRequestFullScreen) {
    (container as any).mozRequestFullScreen();
  } else if ((container as any).webkitRequestFullscreen) {
    (container as any).webkitRequestFullscreen();
  } else if ((container as any).msRequestFullscreen) {
    (container as any).msRequestFullscreen();
  }
};

// 退出全屏模式
const exitFullscreen = () => {
  if (document.exitFullscreen) {
    document.exitFullscreen();
  } else if ((document as any).mozCancelFullScreen) {
    (document as any).mozCancelFullScreen();
  } else if ((document as any).webkitExitFullscreen) {
    (document as any).webkitExitFullscreen();
  } else if ((document as any).msExitFullscreen) {
    (document as any).msExitFullscreen();
  }
};

// 切换全屏模式
const toggleFullscreen = () => {
  if (isFullscreen.value) {
    exitFullscreen();
  } else {
    enterFullscreen();
  }
};

// 全屏变化事件处理
const handleFullscreenChange = () => {
  isFullscreen.value = Boolean(
    document.fullscreenElement ||
      (document as any).mozFullScreenElement ||
      (document as any).webkitFullscreenElement ||
      (document as any).msFullscreenElement
  );

  // 如果不在全屏模式，确保控制栏可见
  if (!isFullscreen.value) {
    controlBarVisible.value = true;
    if (controlBarTimer) {
      clearTimeout(controlBarTimer);
      controlBarTimer = null;
    }
  }
};

// 处理鼠标移动显示/隐藏控制栏
const handleMouseMove = () => {
  controlBarVisible.value = true;

  if (controlBarTimer) {
    clearTimeout(controlBarTimer);
  }

  if (isFullscreen.value) {
    controlBarTimer = window.setTimeout(() => {
      controlBarVisible.value = false;
    }, 3000);
  }
};

// 处理触摸事件
const handleTouchStart = (e: TouchEvent) => {
  controlBarVisible.value = true;
  touchStartY = e.touches[0].clientY;

  if (controlBarTimer) {
    clearTimeout(controlBarTimer);
  }

  if (isFullscreen.value) {
    controlBarTimer = window.setTimeout(() => {
      controlBarVisible.value = false;
    }, 3000);
  }
};

// 处理触摸移动事件，实现下拉退出全屏
const handleTouchMove = (e: TouchEvent) => {
  if (!isFullscreen.value) return;

  touchMoveY = e.touches[0].clientY;

  // 如果是向下滑动超过100px，退出全屏
  if (touchMoveY - touchStartY > 100) {
    exitFullscreen();
    touchStartY = 0;
    touchMoveY = 0;
  }
};

// 监听屏幕方向变化，优化移动端体验
const handleOrientationChange = () => {
  // 移动端横屏时自动进入全屏模式
  if (
    window.matchMedia("(orientation: landscape)").matches &&
    window.innerWidth < 1024
  ) {
    if (!isFullscreen.value) {
      enterFullscreen();
    }
  }
};

// 设置页面标题
watch(
  () => props.gameName,
  (newName) => {
    if (newName) {
      document.title = `${newName} - DaoGame`;
    }
  }
);

onMounted(() => {
  // 添加全屏变化事件监听
  document.addEventListener("fullscreenchange", handleFullscreenChange);
  document.addEventListener("mozfullscreenchange", handleFullscreenChange);
  document.addEventListener("webkitfullscreenchange", handleFullscreenChange);
  document.addEventListener("MSFullscreenChange", handleFullscreenChange);

  // 添加鼠标移动事件监听
  const container = gameContainerRef.value;
  if (container) {
    container.addEventListener("mousemove", handleMouseMove);
    container.addEventListener("touchstart", handleTouchStart);
    container.addEventListener("touchmove", handleTouchMove);
  }

  // 添加屏幕方向变化监听
  window.addEventListener("orientationchange", handleOrientationChange);
  window.addEventListener("resize", handleOrientationChange);

  // 初始屏幕方向检测
  handleOrientationChange();
});

onUnmounted(() => {
  // 移除事件监听
  document.removeEventListener("fullscreenchange", handleFullscreenChange);
  document.removeEventListener("mozfullscreenchange", handleFullscreenChange);
  document.removeEventListener(
    "webkitfullscreenchange",
    handleFullscreenChange
  );
  document.removeEventListener("MSFullscreenChange", handleFullscreenChange);

  const container = gameContainerRef.value;
  if (container) {
    container.removeEventListener("mousemove", handleMouseMove);
    container.removeEventListener("touchstart", handleTouchStart);
    container.removeEventListener("touchmove", handleTouchMove);
  }

  window.removeEventListener("orientationchange", handleOrientationChange);
  window.removeEventListener("resize", handleOrientationChange);

  // 退出全屏模式
  if (isFullscreen.value) {
    exitFullscreen();
  }

  // 恢复页面标题
  document.title = "DaoGame";

  // 清除定时器
  if (controlBarTimer) {
    clearTimeout(controlBarTimer);
    controlBarTimer = null;
  }
});
</script>

<style scoped>
.game-embed-container {
  position: relative;
  width: 100%;
  height: 100vh;
  background-color: #000;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.game-embed-container.fullscreen {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 9999;
  width: 100vw;
  height: 100vh;
}

.responsive-iframe-container {
  position: relative;
  flex: 1;
  width: 100%;
  overflow: hidden;
}

.game-iframe {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border: none;
}

.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 10;
}

.loading-spinner {
  text-align: center;
}

.spinner {
  width: 60px;
  height: 60px;
  margin: 0 auto;
  border: 5px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: #6366f1;
  animation: spin 1s ease-in-out infinite;
}

.loading-text {
  margin-top: 16px;
  color: #fff;
  font-size: 16px;
}

.control-bar {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  padding: 12px;
  background: linear-gradient(
    to bottom,
    rgba(0, 0, 0, 0.7) 0%,
    rgba(0, 0, 0, 0) 100%
  );
  display: flex;
  justify-content: space-between;
  z-index: 5;
  transition: opacity 0.3s ease;
  opacity: 0;
}

.control-bar.visible {
  opacity: 1;
}

.control-button {
  background-color: rgba(99, 102, 241, 0.8);
  color: white;
  border: none;
  border-radius: 20px;
  padding: 8px 16px;
  font-size: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  transition: background-color 0.2s;
  backdrop-filter: blur(4px);
}

.control-button:hover {
  background-color: rgba(99, 102, 241, 1);
}

.control-button i {
  margin-right: 6px;
}

/* 适配移动端 */
@media (max-width: 640px) {
  .control-button {
    padding: 6px 12px;
    font-size: 12px;
  }

  .spinner {
    width: 40px;
    height: 40px;
  }

  .loading-text {
    font-size: 14px;
  }
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
