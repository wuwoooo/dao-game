import { createRouter, createWebHistory } from "vue-router";
import BasicLayout from "@/components/BasicLayout.vue"; // Use @ to reference src directory
import DashboardView from "@/views/dashboard/Index.vue";

// Helper function to get auth token (consistent with LoginView.vue)
const getAuthToken = () => localStorage.getItem("authToken");

const routes = [
  {
    path: "/login",
    name: "Login",
    component: () => import("@/views/auth/LoginView.vue"),
    meta: { requiresGuest: true }, // Mark this route as for guests (unauthenticated users)
  },
  {
    path: "/",
    component: BasicLayout,
    meta: { requiresAuth: true }, // All routes under BasicLayout require authentication
    redirect: "/dashboard",
    children: [
      {
        path: "dashboard",
        name: "Dashboard",
        component: DashboardView,
        meta: { title: "仪表盘" },
      },
      // App Management
      {
        path: "app/list",
        name: "app-list",
        component: () => import("@/views/app/AppListView.vue"),
        meta: { title: "应用列表", parentName: "app-management" },
      },
      {
        path: "app/review",
        name: "app-review",
        component: () => import("@/views/app/AppReviewView.vue"),
        meta: { title: "上架审核", parentName: "app-management" },
      },
      // Promotion Management
      {
        path: "promotion/settings",
        name: "promotion-settings", // Matches a-menu-item key
        component: () => import("@/views/promotion/PromotionSettingsView.vue"), // Lazy load
        meta: { title: "推广设置", parentName: "promotion-management" }, // parentName matches a-sub-menu key
      },
      {
        path: "promotion/data",
        name: "promotion-data", // Matches a-menu-item key
        component: () => import("@/views/promotion/PromotionDataView.vue"), // Lazy load
        meta: { title: "推广数据", parentName: "promotion-management" },
      },
      // Owner Management
      {
        path: "owner/list",
        name: "owner-list", // Matches a-menu-item key
        component: () => import("@/views/owner/OwnerListView.vue"), // Lazy load
        meta: { title: "所有者列表", parentName: "owner-management" }, // parentName matches a-sub-menu key
      },
      // Finance Management
      {
        path: "finance/recharge",
        name: "recharge-records", // Matches a-menu-item key
        component: () => import("@/views/finance/RechargeRecordView.vue"), // Lazy load
        meta: { title: "充值记录", parentName: "finance-management" }, // parentName matches a-sub-menu key
      },
      {
        path: "finance/consumption",
        name: "consumption-records", // Matches a-menu-item key
        component: () => import("@/views/finance/ConsumptionRecordView.vue"), // Lazy load
        meta: { title: "消耗记录", parentName: "finance-management" },
      },
      // System Management
      {
        path: "system",
        name: "system-management",
        // Redirect to user management as the default/primary system page
        redirect: { name: "SystemUserManagement" },
        meta: { title: "系统管理" },
        children: [
          {
            path: "users", // Relative path: /system/users
            name: "SystemUserManagement",
            component: () => import("@/views/system/UserManagementView.vue"),
            meta: { title: "后台用户管理", parentName: "system-management" }, // Keep parentName for menu open state
          },
          {
            path: "roles",
            name: "SystemRoleManagement",
            component: () => import("@/views/system/RoleManagementView.vue"),
            meta: { title: "角色权限管理", parentName: "system-management" },
          },
        ],
      },
      // User Profile Page
      {
        path: "profile", // Will be /profile
        name: "UserProfile",
        component: () => import("@/views/profile/UserProfileView.vue"),
        meta: { title: "个人中心", requiresAuth: true }, // No parentName as it's usually accessed from user dropdown
      },
      // 抽奖活动管理
      {
        path: "lottery",
        name: "lottery-management",
        component: () => import("@/views/lottery/Index.vue"),
        meta: { title: "抽奖活动", parentName: "lottery-management" },
      },
      {
        path: "lottery/list",
        name: "lottery-list",
        component: () => import("@/views/lottery/LotteryListView.vue"),
        meta: { title: "抽奖活动列表", parentName: "lottery-management" },
      },
      {
        path: "lottery/detail/:id",
        name: "lottery-detail",
        component: () => import("@/views/lottery/LotteryDetailView.vue"),
        meta: { title: "活动详情", parentName: "lottery-management" },
      },
      {
        path: "lottery/winners",
        name: "lottery-winners",
        component: () => import("@/views/lottery/LotteryWinnersView.vue"),
        meta: { title: "中奖记录", parentName: "lottery-management" },
      },
    ],
  },
  // TODO: Add routes for login page and other non-layout pages
  // {
  //   path: '/login',
  //   name: 'Login',
  //   component: () => import('@/views/Login.vue')
  // }
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL), // Vite uses import.meta.env.BASE_URL
  routes,
});

// Navigation Guard
router.beforeEach((to, from, next) => {
  const isAuthenticated = !!getAuthToken(); // Check if token exists

  if (to.matched.some((record) => record.meta.requiresAuth)) {
    // This route requires auth, check if logged in
    // if not, redirect to login page.
    if (!isAuthenticated) {
      next({ name: "Login", query: { redirect: to.fullPath } }); // Pass current page as redirect query
    } else {
      next(); // Go to wherever I'm going
    }
  } else if (to.matched.some((record) => record.meta.requiresGuest)) {
    // This route is for guests (e.g., login page)
    // If logged in, redirect to home/dashboard.
    if (isAuthenticated) {
      next({ path: "/" });
    } else {
      next();
    }
  } else {
    // Does not require auth or guest, make sure to always call next()
    next();
  }
});

export default router;
