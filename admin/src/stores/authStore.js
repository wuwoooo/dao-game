import { defineStore } from "pinia";
import { ref, computed } from "vue";
import apiService from "@/services/apiService";

export const useAuthStore = defineStore("auth", () => {
  // --- State ---
  const token = ref(localStorage.getItem("authToken") || null);
  const adminInfo = ref(
    JSON.parse(localStorage.getItem("adminInfo") || "null")
  );
  const permissions = ref(
    JSON.parse(localStorage.getItem("permissions") || "[]")
  );

  // --- Getters ---
  const isAuthenticated = computed(() => !!token.value);
  const adminId = computed(() => adminInfo.value?.id);
  const username = computed(() => adminInfo.value?.username || "用户");
  const roleId = computed(() => adminInfo.value?.roleId);

  // 当前用户的角色code
  const roleCode = ref("");

  // 检查是否是合作伙伴角色
  const isPartnerRole = computed(() => roleCode.value === "partner");

  // --- Actions ---

  // Action to set authentication data after login
  async function login(credentials) {
    try {
      console.log("[AuthStore] Attempting login..."); // Log entry
      const responseData = await apiService.adminLogin(credentials);
      console.log("[AuthStore] Login API response received:", responseData);

      // Explicitly check conditions
      const hasToken = !!responseData?.token;
      const hasAdminInfo = !!responseData?.admin;
      const hasAdminId = !!responseData?.admin?.id;
      console.log(
        `[AuthStore] Login response check: hasToken=${hasToken}, hasAdminInfo=${hasAdminInfo}, hasAdminId=${hasAdminId}`
      );

      if (hasToken && hasAdminInfo) {
        // Keep check simple first
        console.log("[AuthStore] Setting token and adminInfo...");
        token.value = responseData.token;
        adminInfo.value = responseData.admin;
        permissions.value = [];

        console.log("[AuthStore] Updating localStorage...");
        localStorage.setItem("authToken", responseData.token);
        localStorage.removeItem("permissions");

        // Log adminId value right before calling fetchPermissions
        console.log(
          `[AuthStore] adminId computed value before fetchPermissions: ${adminId.value}`
        );

        console.log("[AuthStore] Calling fetchPermissions...");
        await fetchPermissions();

        // 获取角色代码
        await fetchRoleCode();

        //将刚获取到的rolecode也加入admininfo
        adminInfo.value.roleCode = roleCode.value;
        localStorage.setItem("adminInfo", JSON.stringify(adminInfo.value));

        console.log("[AuthStore] fetchPermissions call finished.");
        return true;
      } else {
        console.error(
          "[AuthStore] Login response invalid structure or missing token/admin info."
        );
        throw new Error("登录响应无效或缺少Token。");
      }
    } catch (error) {
      console.error("[AuthStore] Login action failed:", error); // Log the error from login action
      throw error;
    }
  }

  // Action to fetch permissions for the logged-in user
  async function fetchPermissions() {
    console.log("[AuthStore] Attempting to fetch permissions...");
    if (adminId.value) {
      try {
        console.log(
          `[AuthStore] Fetching permissions for admin ID: ${adminId.value}`
        );
        const fetchedPermissions = await apiService.getAdminUserPermissions(
          adminId.value
        );
        console.log(
          "[AuthStore] API call getAdminUserPermissions returned.",
          fetchedPermissions
        );
        const validPermissions = Array.isArray(fetchedPermissions)
          ? fetchedPermissions
          : [];
        permissions.value = validPermissions;
        localStorage.setItem("permissions", JSON.stringify(validPermissions));
        console.log(
          "[AuthStore] Permissions fetched and stored:",
          permissions.value
        );
      } catch (error) {
        console.error("[AuthStore] Failed to fetch permissions:", error);
        permissions.value = [];
        localStorage.removeItem("permissions");
      }
    } else {
      console.warn(
        "[AuthStore] Cannot fetch permissions: adminId is not available."
      );
      permissions.value = [];
      localStorage.removeItem("permissions");
    }
  }

  // 获取当前用户的角色代码
  async function fetchRoleCode() {
    console.log("[AuthStore] Attempting to fetch role code...");
    if (roleId.value) {
      try {
        // 获取所有角色
        const roles = await apiService.getAllRoles();
        // 查找当前用户的角色
        const userRole = roles.find((role) => role.id === roleId.value);
        if (userRole) {
          roleCode.value = userRole.code;
          console.log(`[AuthStore] Role code set to: ${roleCode.value}`);
        } else {
          console.warn(
            "[AuthStore] Could not find matching role for user's roleId"
          );
          roleCode.value = "";
        }
      } catch (error) {
        console.error("[AuthStore] Failed to fetch role code:", error);
        roleCode.value = "";
      }
    } else {
      console.warn(
        "[AuthStore] Cannot fetch role code: roleId is not available."
      );
      roleCode.value = "";
    }
  }

  // Action to clear authentication data on logout
  function logout() {
    token.value = null;
    adminInfo.value = null;
    permissions.value = [];
    localStorage.removeItem("authToken");
    localStorage.removeItem("adminInfo");
    localStorage.removeItem("permissions");
    // No need to redirect here, let the component handle redirection
  }

  // Helper function to check for a specific permission
  function hasPermission(requiredPermission) {
    // Ensure permissions.value is always an array
    const currentPermissions = Array.isArray(permissions.value)
      ? permissions.value
      : [];
    return currentPermissions.includes(requiredPermission);
  }

  // Removed the immediate call to initializeAuth()
  // function initializeAuth() { ... }
  // initializeAuth();

  return {
    // State
    token,
    adminInfo,
    permissions,
    // Getters
    isAuthenticated,
    adminId,
    username,
    roleId,
    roleCode,
    isPartnerRole,
    // Actions
    login,
    logout,
    fetchPermissions, // Expose if needed externally
    hasPermission,
  };
});
