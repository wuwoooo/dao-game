import { createRouter, createWebHistory } from "vue-router";

const router = createRouter({
  history: createWebHistory("/daogame/"),
  routes: [
    {
      path: "/",
      name: "home",
      component: () => import("../views/Home.vue"),
      meta: {
        title: "首页",
      },
    },
    {
      path: "/game/:id",
      name: "game-detail",
      component: () => import("../views/GameDetail.vue"),
      meta: {
        title: "游戏详情",
      },
    },
    {
      path: "/game/:id/play",
      name: "game-play",
      component: () => import("../views/GamePlay.vue"),
      meta: {
        title: "游戏",
        hideNavigation: true,
      },
    },
    {
      path: "/my-games",
      name: "my-games",
      component: () => import("../views/MyGames.vue"),
      meta: {
        title: "我的游戏",
        requiresAuth: true,
      },
    },
    {
      path: "/search",
      name: "search-results",
      component: () => import("../views/SearchResults.vue"),
      meta: {
        title: "搜索结果",
      },
    },
    {
      path: "/lottery",
      name: "lottery-list",
      component: () => import("../views/lottery/LotteryList.vue"),
      meta: {
        title: "抽奖活动",
      },
    },
    {
      path: "/lottery/:id",
      name: "lottery-detail",
      component: () => import("../views/lottery/LotteryDetail.vue"),
      meta: {
        title: "抽奖详情",
      },
    },
    {
      path: "/my-lottery",
      name: "my-lottery",
      component: () => import("../views/lottery/MyLottery.vue"),
      meta: {
        title: "我的抽奖",
        requiresAuth: true,
      },
    },
  ],
});

// 声明全局事件总线，用于在路由守卫中触发登录模态框
export const eventBus = {
  // 触发登录模态框的方法
  triggerLogin: () => {
    window.dispatchEvent(new CustomEvent("open-login-modal"));
  },
};

// 路由守卫
router.beforeEach((to, from, next) => {
  // 设置页面标题
  document.title = to.meta.title
    ? `${to.meta.title} - Aisky DaoGame`
    : "Aisky DaoGame";

  // 检查是否需要登录
  if (to.meta.requiresAuth) {
    const token = localStorage.getItem("token");
    if (!token) {
      // 触发登录模态框并重定向到首页
      eventBus.triggerLogin();
      next({ name: "home" });
      return;
    }
  }
  next();
});

export default router;
