import axios from "axios";

// Use environment variable for the full base URL including /v1
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL; // Directly use the env var

if (!API_BASE_URL) {
  console.error(
    "Error: VITE_API_BASE_URL is not defined in your .env file(s)!"
  );
  // Provide a fallback or throw an error depending on your needs
  // For now, let's log an error but proceed with a potentially incorrect relative path
}

const apiClient = axios.create({
  baseURL: API_BASE_URL, // Use the full base URL here
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor to add JWT token to requests
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("authToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor for responses
apiClient.interceptors.response.use(
  (response) => {
    if (
      response.data &&
      typeof response.data.code !== "undefined" &&
      response.data.code !== 0
    ) {
      console.error("API Business Error:", response.data);
      const error = new Error(response.data.msg || "操作失败");
      error.code = response.data.code;
      return Promise.reject(error);
    }
    if (
      response.data &&
      typeof response.data.code !== "undefined" &&
      response.data.code === 0
    ) {
      return response.data.data;
    }
    return response.data;
  },
  (error) => {
    if (error.response) {
      console.error("API Error Response:", error.response.data);
      console.error("Status:", error.response.status);
      if (error.response.status === 401) {
        localStorage.removeItem("authToken");
        localStorage.removeItem("adminInfo");
        localStorage.removeItem("permissions");
        if (window.location.pathname !== "/login") {
          window.location.href = "/login";
        }
      }
    } else if (error.request) {
      console.error("API No Response:", error.request);
    } else {
      console.error("API Request Setup Error:", error.message);
    }
    const errorMessage =
      error.response?.data?.msg || error.message || "发生未知错误";
    const finalError = new Error(errorMessage);
    if (error.response) {
      finalError.statusCode = error.response.status;
    }
    return Promise.reject(finalError);
  }
);

// Helper to clean undefined/null params for GET requests
const cleanParams = (params) => {
  const cleaned = {};
  for (const key in params) {
    if (
      params[key] !== null &&
      typeof params[key] !== "undefined" &&
      params[key] !== ""
    ) {
      // Also clean empty strings
      cleaned[key] = params[key];
    }
  }
  return cleaned;
};

// Helper to add admin user id for partner role
// 这个方法将从localStorage获取adminInfo并检查角色
// 在实际使用时，应该直接使用authStore的isPartnerRole和adminId
const addAdminIdIfPartner = (params = {}) => {
  try {
    const adminInfo = JSON.parse(localStorage.getItem("adminInfo") || "null");
    // 这里简单模拟，实际应该使用authStore
    if (adminInfo && adminInfo.roleCode === "partner") {
      return { ...params, adminUserId: adminInfo.id };
    }
  } catch (e) {
    console.error("Error checking admin role:", e);
  }
  return params;
};

export default {
  // Authentication
  adminLogin(credentials) {
    // POST /auth/admin/login
    return apiClient.post("/auth/admin/login", credentials);
  },
  getCurrentUserRoles() {
    // This endpoint might need to be specific for admin roles
    return apiClient.get("/auth/roles"); // Placeholder, confirm actual admin role/permission endpoint
  },

  // === Admin: Application Management ===
  getAdminApps(params) {
    // GET /v1/admin/apps
    // Params: { current?, size?, ownerId?, name?, status?, sortField?, sortOrder? }
    // Returns: Promise<{ records: GameAppExtended[], total, size, current, pages }>
    // GameAppExtended now includes isRecommend, clickCount, ownerName
    return apiClient.get("/admin/apps", { params: cleanParams(params) });
  },
  updateAdminApp(id, data) {
    // PUT /v1/admin/apps/{id}
    // Data: { id, name?, type?, url?, icon?, description?, tags?, status?, visible?, reviewRemark?, isRecommend?, embedUrl?, coverImage? }
    return apiClient.put(`/admin/apps/${id}`, data);
  },
  getPendingReviewApps(params) {
    // GET /v1/admin/review/pending
    // Params: { current?, size? }
    // Add a timestamp to try and bypass browser/network caching for this specific request
    const updatedParams = { ...cleanParams(params), _t: Date.now() };
    return apiClient.get("/admin/review/pending", { params: updatedParams });
  },
  reviewApp(payload) {
    // POST /admin/review/review
    // Payload: { id, status, remark? }
    return apiClient.post("/admin/review/review", payload);
  },
  toggleAppVisibility(id, visible) {
    // POST /admin/review/toggle
    // Params: id, visible (in query)
    return apiClient.post(`/admin/review/toggle?id=${id}&visible=${visible}`);
  },
  getAppDetail(id) {
    // GET /v1/apply/{id}
    // Returns: Promise<GameAppExtended> (includes isRecommend, clickCount)
    return apiClient.get(`/apply/${id}`);
  },

  // Promotion Management
  getPromotionPlans(params) {
    return apiClient.get("/promo/list", { params });
  },
  createPromotionPlan(data) {
    return apiClient.post("/promo/plan", data);
  },
  getPromotionData(planId, params) {
    return apiClient.get(`/promo/data`, {
      params: { plan_id: planId, ...params },
    });
  },

  // Owner Management (Admin)
  getOwners(params) {
    // GET /admin/owners
    // Params: { current?, size? }
    return apiClient.get("/admin/owners", { params: cleanParams(params) });
  },

  // Recharge Records (Admin)
  getRechargeRecords(params) {
    // GET /admin/finance/recharges
    // Params: { current?, size?, ownerId? }
    return apiClient.get("/admin/finance/recharges", {
      params: cleanParams(params),
    });
  },

  // Consumption Records (Admin)
  getConsumptionRecords(params) {
    // GET /admin/finance/consumptions
    // Params: { current?, size?, ownerId?, gameappId?, costType?, startDate?, endDate? }
    return apiClient.get("/admin/finance/consumptions", {
      params: cleanParams(params),
    });
  },

  // Admin User Management (Super Admin)
  getAdminUsers(params) {
    // GET /admin/users
    // Params: { current?, size? }
    return apiClient.get("/admin/users", { params: cleanParams(params) });
  },
  addAdminUser(data) {
    // POST /admin/users
    // Data: { username, password, realName?, roleId, status? }
    return apiClient.post("/admin/users", data);
  },
  updateAdminUser(id, data) {
    // PUT /admin/users/{id}
    // Data: { id, password?, realName?, roleId, status? }
    return apiClient.put(`/admin/users/${id}`, data);
  },
  deleteAdminUser(id) {
    // DELETE /admin/users/{id}
    return apiClient.delete(`/admin/users/${id}`);
  },
  getAdminUserPermissions(id) {
    // GET /admin/users/{id}/permissions
    // Returns: Promise<string[]>
    return apiClient.get(`/admin/users/${id}/permissions`);
  },
  getAllRoles() {
    // GET /admin/roles
    // Returns: Promise<Role[]>
    return apiClient.get("/admin/roles");
  },
  getRolePermissions(roleId) {
    // GET /admin/roles/{roleId}/permissions
    // Returns: Promise<number[]> 权限ID列表
    return apiClient.get(`/admin/roles/${roleId}/permissions`);
  },
  updateRolePermissions(roleId, permissionIds) {
    // PUT /admin/roles/{roleId}/permissions
    // Payload: number[] (permission IDs)
    return apiClient.put(`/admin/roles/${roleId}/permissions`, permissionIds);
  },
  getAllPermissions() {
    // GET /admin/permissions
    // Returns: Promise<Permission[]>
    return apiClient.get("/admin/permissions");
  },

  // === Promotion Management (Admin) ===
  createAdminPromotionBudget(data) {
    // POST /admin/promo/budgets
    // Data: { gameappId, dailyBudget, totalBudget, placements, startDate, endDate }
    return apiClient.post("/admin/promo/budgets", data);
  },
  getAdminPromotionBudgets(params) {
    // GET /admin/promo/budgets
    // Params: { current?, size?, ownerId? }
    return apiClient.get("/admin/promo/budgets", {
      params: cleanParams(params),
    });
  },
  getAdminPromotionBudgetDetail(id) {
    // GET /admin/promo/budgets/{id}
    return apiClient.get(`/admin/promo/budgets/${id}`);
  },
  updateAdminPromotionBudget(id, data) {
    // PUT /admin/promo/budgets/{id}
    // Data: { id, dailyBudget?, totalBudget?, placements?, startDate?, endDate?, status? }
    return apiClient.put(`/admin/promo/budgets/${id}`, data);
  },
  deleteAdminPromotionBudget(id) {
    // DELETE /admin/promo/budgets/{id}
    return apiClient.delete(`/admin/promo/budgets/${id}`);
  },

  // New Admin endpoint to create an app
  createAdminApp(data) {
    // POST /v1/admin/apps
    // Data: { ownerId, name, type, url, icon?, description?, tags?, status?, visible?, reviewRemark?, isRecommend?, embedUrl?, coverImage? }
    return apiClient.post("/admin/apps", data);
  },

  // === Admin: Current User Profile ===
  updateMyProfile(data) {
    // PUT /v1/admin/me/profile
    // Data: { password?, realName? }
    return apiClient.put("/admin/me/profile", data);
  },

  // === 抽奖活动管理 ===
  // 创建抽奖活动
  createLottery(data) {
    // POST /v1/admin/lottery/create
    return apiClient.post("/admin/lottery/create", data);
  },

  // 获取抽奖活动详情
  getLotteryDetail(id) {
    // GET /v1/admin/lottery/{id}
    return apiClient.get(`/admin/lottery/${id}`);
  },

  // 获取抽奖活动列表
  getLotteryList(params) {
    // GET /v1/admin/lottery/list
    return apiClient.get("/admin/lottery/list", {
      params: cleanParams(params),
    });
  },

  // 更新抽奖活动状态
  updateLotteryStatus(id, status) {
    // PUT /v1/admin/lottery/{id}/status
    return apiClient.put(`/admin/lottery/${id}/status?status=${status}`);
  },

  // 删除抽奖活动
  deleteLottery(id) {
    // DELETE /v1/admin/lottery/{id}
    return apiClient.delete(`/admin/lottery/${id}`);
  },

  // 添加奖项
  addLotteryPrize(data) {
    // POST /v1/admin/lottery/prize/add
    return apiClient.post("/admin/lottery/prize/add", data);
  },

  //
  getLotteryPrizes(id) {
    // v1 / admin / lottery / { id } / prizes;
    return apiClient.get(`/admin/lottery/${id}/prizes`);
  },

  // 删除奖项
  deleteLotteryPrize(id) {
    // DELETE /v1/admin/lottery/prize/{id}
    return apiClient.delete(`/admin/lottery/prize/${id}`);
  },

  // 更新奖项
  updateLotteryPrize(data) {
    // PUT1min/lo/prize/update
    return apiClient.put("/admin/lottery/prize/update", data);
  },

  // 更新抽奖规则
  updateLotteryRule(data) {
    // PUT /v1/admin/lottery/rule/update
    return apiClient.put("/admin/lottery/rule/update", data);
  },

  // 获取抽奖规则
  getLotteryRule(id) {
    // GET /v1/admin/lottery/{id}/rule
    return apiClient.get(`/admin/lottery/${id}/rule`);
  },

  // 获取中奖记录
  getLotteryWinners(params) {
    // GET /v1/admin/lottery/winners
    return apiClient.get("/admin/lottery/winners", {
      params: cleanParams(params),
    });
  },

  // 更新中奖记录状态
  updateWinnerStatus(id, status, contactInfo) {
    // PUT /v1/admin/lottery/winner/{id}/status
    const params = { status };
    if (contactInfo) {
      params.contactInfo = contactInfo;
    }
    return apiClient.put(`/admin/lottery/winner/${id}/status`, null, {
      params,
    });
  },

  // Add more API service calls here as needed
};
