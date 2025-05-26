<template>
  <a-layout style="min-height: 100vh" v-if="authStore.isAuthenticated">
    <a-layout-sider v-model:collapsed="collapsed" collapsible :trigger="null">
      <div class="logo">
        <img
          src="/vite.svg"
          alt="logo"
          style="height: 32px; margin-right: 8px"
        />
        <span
          v-if="!collapsed"
          style="color: white; font-size: 16px; font-weight: bold"
          >Aisky Admin</span
        >
      </div>
      <a-menu
        v-model:selectedKeys="selectedKeys"
        v-model:openKeys="openKeys"
        theme="dark"
        mode="inline"
      >
        <a-menu-item key="Dashboard">
          <router-link :to="{ name: 'Dashboard' }">
            <dashboard-outlined />
            <span>仪表盘</span>
          </router-link>
        </a-menu-item>

        <a-sub-menu
          key="app-management"
          v-if="authStore.hasPermission('app_review')"
        >
          <template #title>
            <span>
              <appstore-outlined />
              <span>应用管理</span>
            </span>
          </template>
          <a-menu-item key="app-list">
            <router-link :to="{ name: 'app-list' }">应用列表</router-link>
          </a-menu-item>
          <a-menu-item key="app-review">
            <router-link :to="{ name: 'app-review' }">上架审核</router-link>
          </a-menu-item>
        </a-sub-menu>

        <a-sub-menu
          key="promotion-management"
          v-if="authStore.hasPermission('budget_manage')"
        >
          <template #title>
            <span>
              <fund-projection-screen-outlined />
              <span>推广管理</span>
            </span>
          </template>
          <a-menu-item key="promotion-settings">
            <router-link :to="{ name: 'promotion-settings' }"
              >推广设置</router-link
            >
          </a-menu-item>
          <a-menu-item key="promotion-data">
            <router-link :to="{ name: 'promotion-data' }">推广数据</router-link>
          </a-menu-item>
        </a-sub-menu>

        <a-sub-menu
          key="owner-management"
          v-if="authStore.hasPermission('owner_manage')"
        >
          <template #title>
            <span>
              <solution-outlined />
              <span>所有者管理</span>
            </span>
          </template>
          <a-menu-item key="owner-list">
            <router-link :to="{ name: 'owner-list' }">所有者列表</router-link>
          </a-menu-item>
        </a-sub-menu>

        <a-sub-menu
          key="finance-management"
          v-if="authStore.hasPermission('finance_manage')"
        >
          <template #title>
            <span>
              <account-book-outlined />
              <span>财务管理</span>
            </span>
          </template>
          <a-menu-item key="recharge-records">
            <router-link :to="{ name: 'recharge-records' }"
              >充值记录</router-link
            >
          </a-menu-item>
          <a-menu-item key="consumption-records">
            <router-link :to="{ name: 'consumption-records' }"
              >消耗记录</router-link
            >
          </a-menu-item>
        </a-sub-menu>

        <a-sub-menu key="lottery-management">
          <template #title>
            <span>
              <gift-outlined />
              <span>抽奖活动</span>
            </span>
          </template>
          <a-menu-item key="lottery-list">
            <router-link :to="{ name: 'lottery-list' }">活动列表</router-link>
          </a-menu-item>
          <a-menu-item key="lottery-winners">
            <router-link :to="{ name: 'lottery-winners' }"
              >中奖记录</router-link
            >
          </a-menu-item>
        </a-sub-menu>

        <a-sub-menu
          key="system-management"
          v-if="authStore.hasPermission('user_manage')"
        >
          <template #title>
            <span>
              <setting-outlined />
              <span>系统管理</span>
            </span>
          </template>
          <a-menu-item key="SystemUserManagement">
            <router-link :to="{ name: 'SystemUserManagement' }">
              用户管理
            </router-link>
          </a-menu-item>
          <a-menu-item key="SystemRoleManagement">
            <router-link :to="{ name: 'SystemRoleManagement' }">
              角色权限管理
            </router-link>
          </a-menu-item>
        </a-sub-menu>
      </a-menu>
    </a-layout-sider>
    <a-layout style="background: #f0f2f5">
      <a-layout-header
        style="
          background: #fff;
          padding: 0 24px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        "
      >
        <div>
          <menu-unfold-outlined
            v-if="collapsed"
            class="trigger"
            @click="() => (collapsed = !collapsed)"
          />
          <menu-fold-outlined
            v-else
            class="trigger"
            @click="() => (collapsed = !collapsed)"
          />
        </div>
        <div>
          <a-space>
            <a-tooltip title="通知">
              <a-badge
                count="5"
                @click="handleNotificationClick"
                style="cursor: pointer"
              >
                <bell-outlined style="font-size: 18px" />
              </a-badge>
            </a-tooltip>
            <a-dropdown>
              <a
                class="ant-dropdown-link"
                @click.prevent
                style="
                  display: inline-flex;
                  align-items: center;
                  cursor: pointer;
                "
              >
                <a-avatar
                  src="https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX.png"
                  size="small"
                />
                <span style="margin-left: 8px">{{ authStore.username }}</span>
                <down-outlined style="margin-left: 4px" />
              </a>
              <template #overlay>
                <a-menu @click="handleUserMenuClick">
                  <a-menu-item key="profile">
                    <router-link :to="{ name: 'UserProfile' }">
                      <user-outlined /> 个人中心
                    </router-link>
                  </a-menu-item>
                  <a-menu-item key="logout">
                    <logout-outlined /> 退出登录
                  </a-menu-item>
                </a-menu>
              </template>
            </a-dropdown>
          </a-space>
        </div>
      </a-layout-header>
      <div style="margin: 16px 16px 0">
        <a-breadcrumb :routes="breadcrumbs">
          <template
            #itemRender="{
              route: breadcrumbRouteItem,
              paths,
              routes: breadcrumbRoutes,
            }"
          >
            <span
              v-if="
                breadcrumbRoutes.indexOf(breadcrumbRouteItem) ===
                breadcrumbRoutes.length - 1
              "
            >
              {{ breadcrumbRouteItem.breadcrumbName }}
            </span>
            <router-link v-else :to="breadcrumbRouteItem.path">
              {{ breadcrumbRouteItem.breadcrumbName }}
            </router-link>
          </template>
        </a-breadcrumb>
      </div>
      <a-layout-content
        style="margin: 16px; padding: 24px; background: #fff; min-height: 280px"
      >
        <router-view v-slot="{ Component }">
          <keep-alive>
            <component :is="Component" />
          </keep-alive>
        </router-view>
      </a-layout-content>
      <a-layout-footer
        style="text-align: center; padding: 12px 50px; background: transparent"
      >
        Aisky DaoGame Admin ©{{ new Date().getFullYear() }}
      </a-layout-footer>
    </a-layout>
  </a-layout>
</template>

<script setup>
import { ref, watch, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { message } from "ant-design-vue";
import { useAuthStore } from "@/stores/authStore";
import {
  DashboardOutlined,
  AppstoreOutlined,
  SettingOutlined,
  MenuUnfoldOutlined,
  MenuFoldOutlined,
  BellOutlined,
  DownOutlined,
  FundProjectionScreenOutlined,
  SolutionOutlined,
  AccountBookOutlined,
  UserOutlined,
  LogoutOutlined,
  GiftOutlined,
} from "@ant-design/icons-vue";

const collapsed = ref(false);
const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();

const selectedKeys = ref([]);
const openKeys = ref([]);
const breadcrumbs = ref([]);

watch(
  route,
  (newRoute) => {
    selectedKeys.value = newRoute.matched
      .map((item) => item.name)
      .filter(Boolean);
    openKeys.value = newRoute.matched
      .map((item) => item.meta?.parentName)
      .filter(Boolean);

    const matchedBreadcrumbs = newRoute.matched
      .map((item) => ({
        path: item.path,
        breadcrumbName: item.meta?.title || item.name,
      }))
      .filter((item) => item.breadcrumbName && item.path && item.name !== "/");

    if (newRoute.name && newRoute.matched.length > 1) {
      breadcrumbs.value = matchedBreadcrumbs;
    } else {
      breadcrumbs.value = [];
    }

    if (newRoute.meta.title) {
      document.title = `Aisky Admin - ${newRoute.meta.title}`;
    } else {
      document.title = "Aisky Admin";
    }
  },
  { immediate: true }
);

const handleUserMenuClick = (e) => {
  if (e.key === "logout") {
    authStore.logout();
    message.success("已成功退出登录！");
    router.push("/login");
  }
};

const handleNotificationClick = () => {
  message.info("通知列表功能待开发。");
};
</script>

<style scoped>
.logo {
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  background: #002140;
  overflow: hidden;
}

.trigger {
  font-size: 18px;
  line-height: 64px;
  padding: 0 24px;
  cursor: pointer;
  transition: color 0.3s;
}

.trigger:hover {
  color: #1890ff;
}

.ant-layout-sider {
  box-shadow: 2px 0 6px rgba(0, 21, 41, 0.35);
  z-index: 10;
}

.ant-layout-header {
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
  position: relative;
}

.ant-layout-footer {
  color: rgba(0, 0, 0, 0.65);
}

.ant-layout-content {
  overflow: auto;
}

/* Custom breadcrumb style if needed */
.ant-breadcrumb {
  /* margin-bottom: 16px; */
}
</style>
