<template>
  <div>
    <a-page-header
      title="上架审核"
      sub-title="审核待上架的游戏和应用"
      @back="() => router.go(-1)"
    >
      <template v-if="currentReviewingApp" #extra>
        <a-tag color="blue"
          >当前审核: {{ currentReviewingApp.name }} (ID:
          {{ currentReviewingApp.id }})</a-tag
        >
      </template>
    </a-page-header>
    <div style="padding: 24px">
      <a-empty
        v-if="pendingApps.length === 0 && !loading"
        description="暂无待审核应用"
      />
      <a-list
        v-else
        :grid="{ gutter: 24, xs: 1, sm: 1, md: 2, lg: 3, xl: 3, xxl: 3 }"
        :data-source="pendingApps"
        :loading="loading"
        class="app-review-list"
      >
        <template #renderItem="{ item }">
          <a-list-item>
            <a-card :title="item.name" hoverable class="review-card">
              <template #extra>
                <a-tag :color="item.type === 'Game' ? 'geekblue' : 'purple'">
                  {{ item.type === "Game" ? "游戏" : "应用" }}
                </a-tag>
              </template>
              <div class="card-content">
                <div v-if="item.icon" class="app-icon-container">
                  <img
                    :src="item.icon"
                    alt="icon"
                    class="app-icon"
                    @error="onImageError"
                  />
                </div>
                <div class="app-details">
                  <p>
                    <strong>所有者:</strong> {{ item.ownerName || "N/A" }} (ID:
                    {{ item.ownerId }})
                  </p>
                  <p>
                    <strong>URL:</strong>
                    <a
                      :href="item.url"
                      target="_blank"
                      rel="noopener noreferrer"
                      :title="item.url"
                      class="app-url-link"
                      >{{ item.url }}</a
                    >
                  </p>
                  <p v-if="item.description" class="app-description">
                    <strong>简介:</strong> {{ item.description }}
                  </p>
                  <div v-if="item.tags" class="app-tags">
                    <strong>标签:</strong>
                    <a-tag
                      v-for="tag in item.tags
                        .split(',')
                        .map((t) => t.trim())
                        .filter((t) => t)"
                      :key="tag"
                      color="blue"
                      style="margin-right: 4px; margin-bottom: 4px"
                    >
                      {{ tag }}
                    </a-tag>
                  </div>
                  <p>
                    <small
                      >提交时间: {{ formatDateTime(item.createdAt) }}</small
                    >
                  </p>
                </div>
              </div>
              <template #actions>
                <a-popconfirm
                  title="确定要批准这个应用吗?"
                  ok-text="确定"
                  cancel-text="取消"
                  @confirm="handleReview(item, 'Approved')"
                >
                  <a-button
                    type="primary"
                    ghost
                    :loading="reviewLoadingStates[item.id]"
                  >
                    <template #icon><check-circle-outlined /></template>批准
                  </a-button>
                </a-popconfirm>
                <a-popconfirm
                  title="确定要驳回这个应用吗?"
                  ok-text="确定"
                  cancel-text="取消"
                  @confirm="handleReview(item, 'Rejected')"
                >
                  <a-button
                    danger
                    ghost
                    :loading="reviewLoadingStates[item.id]"
                  >
                    <template #icon><close-circle-outlined /></template>驳回
                  </a-button>
                </a-popconfirm>
              </template>
            </a-card>
          </a-list-item>
        </template>
      </a-list>
      <a-pagination
        v-if="pagination.total > 0"
        v-model:current="pagination.current"
        v-model:pageSize="pagination.pageSize"
        :total="pagination.total"
        show-size-changer
        show-quick-jumper
        :pageSizeOptions="['12', '24', '36', '48']"
        @change="handleTableChange"
        style="margin-top: 16px; text-align: right"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed, nextTick, onActivated } from "vue";
import { useRoute, useRouter } from "vue-router";
import { message } from "ant-design-vue";
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
} from "@ant-design/icons-vue";
import apiService from "@/services/apiService";
import dayjs from "dayjs";

const route = useRoute();
const router = useRouter();
const loading = ref(false);
const pendingApps = ref([]);
const currentReviewingAppId = ref(null);
const reviewLoadingStates = reactive({});

const pagination = reactive({
  current: 1,
  pageSize: 12,
  total: 0,
});

const formatDateTime = (dateTimeString) => {
  return dateTimeString
    ? dayjs(dateTimeString).format("YYYY-MM-DD HH:mm:ss")
    : "N/A";
};

const currentReviewingApp = computed(() => {
  if (currentReviewingAppId.value) {
    return pendingApps.value.find(
      (app) => app.id === parseInt(currentReviewingAppId.value)
    );
  }
  return null;
});

const onImageError = (event) => {
  // console.warn('Image failed to load:', event.target.src);
  event.target.style.display = "none"; // Hide broken image icon or replace with placeholder
};

const fetchPendingApps = async (
  page = pagination.current,
  pageSize = pagination.pageSize
) => {
  loading.value = true;
  try {
    const params = { current: page, size: pageSize };
    const responseData = await apiService.getPendingReviewApps(params);
    if (responseData && responseData.records) {
      pendingApps.value = responseData.records.map((app) => ({
        ...app,
        loading: reviewLoadingStates[app.id] || false, // Persist loading state for individual items on refresh
      }));
      pagination.current = responseData.current;
      pagination.pageSize = responseData.size;
      pagination.total = responseData.total;
    } else {
      pendingApps.value = [];
      pagination.total = 0;
    }

    const appIdFromQuery = route.query.appId;
    if (appIdFromQuery && page === 1) {
      currentReviewingAppId.value = appIdFromQuery;
      const appExists = pendingApps.value.some(
        (app) => app.id === parseInt(appIdFromQuery)
      );
      if (!appExists && pagination.total > 0) {
        message.warn(`应用 ID: ${appIdFromQuery} 不在当前页或已被处理。`);
      }
    }
  } catch (error) {
    message.error(`获取待审核列表失败: ${error.message}`);
    pendingApps.value = [];
    pagination.total = 0;
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchPendingApps();
});

// Reload data when component is activated (coming back from another route)
onActivated(() => {
  console.log(
    `%c[AppReviewView] Component Activated at ${new Date().toLocaleTimeString()}`,
    "color: green; font-weight: bold;"
  );
  fetchPendingApps(pagination.current, pagination.pageSize);
});

const handleTableChange = (page, pageSize) => {
  fetchPendingApps(page, pageSize);
};

const handleReview = async (app, newStatus) => {
  reviewLoadingStates[app.id] = true;
  try {
    const payload = {
      id: app.id,
      status: newStatus,
      remark:
        newStatus === "Rejected"
          ? "审核驳回 (示例，后续可添加输入框)"
          : "审核通过 (示例)",
    };
    await apiService.reviewApp(payload);
    message.success(
      `应用 "${app.name}" 已成功${newStatus === "Approved" ? "批准" : "驳回"}。`
    );

    fetchPendingApps(pagination.current, pagination.pageSize);

    if (
      currentReviewingAppId.value &&
      parseInt(currentReviewingAppId.value) === app.id
    ) {
      currentReviewingAppId.value = null;
    }
  } catch (error) {
    message.error(`审核操作失败: ${error.message}`);
  } finally {
    // If the item is removed from list, its loading state is gone with it.
    // If it might not be removed (e.g. error), explicitly set to false.
    if (reviewLoadingStates[app.id]) {
      reviewLoadingStates[app.id] = false;
    }
  }
};
</script>

<style scoped>
/* Styles for App Review page */
.app-review-list .review-card {
  min-height: 320px; /* Attempt to make card heights somewhat consistent */
  min-width: 320px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.card-content {
  flex-grow: 1;
  margin-bottom: 16px; /* Space before actions */
  display: flex; /* For icon and details side-by-side */
  gap: 16px;
}

.app-icon-container {
  flex-shrink: 0;
  width: 80px; /* Fixed width for icon container */
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  border: 1px solid #f0f0f0;
  border-radius: 8px;
  margin-bottom: 8px; /* Space below icon if details wrap */
}

.app-icon {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

.app-details p {
  margin-bottom: 8px;
  line-height: 1.4;
}

/* Styles for URL line */
.app-url-line {
  /* No longer forcing nowrap, allow wrapping within its container */
  /* overflow: hidden; */ /* Remove if you want full URL to be potentially scrollable if parent has overflow */
}

.app-url-link {
  /* Allow URL to break and wrap */
  word-break: break-all; /* Break long URLs anywhere */
  white-space: normal; /* Allow normal wrapping */
  /* Remove max-width, overflow, text-overflow if we want full wrapping */
  /* max-width: 100%; */
  /* overflow: hidden; */
  /* text-overflow: ellipsis; */
  display: inline; /* Keep it inline but allow breaking */
  vertical-align: baseline; /* Adjust as needed */
}

/* Styles for Description */
.app-description {
  font-size: 0.9em;
  color: #555;
  /* Allow normal wrapping for description */
  white-space: normal;
  word-break: break-word; /* Break words to prevent overflow */
  /* Remove line-clamp if full description wrapping is preferred over ellipsis */
  /* max-height: 60px; */
  /* overflow: hidden; */
  /* text-overflow: ellipsis; */
  /* display: -webkit-box; */
  /* -webkit-line-clamp: 3; */
  /* -webkit-box-orient: vertical; */
}

.app-tags strong {
  margin-right: 4px;
}

.ant-card-actions {
  background: #f7f9fa;
}
.ant-card-actions > li {
  margin: 8px 0;
}
/* Ensure loading icon aligns well in buttons */
:deep(.ant-btn-loading-icon) {
  vertical-align: middle;
}
</style>
