// 用户认证相关工具函数

// 解析 URL 查询参数
export function getQueryParams(): Record<string, string> {
  const params: Record<string, string> = {};
  const search = window.location.search;
  if (search) {
    const query = search.substring(1);
    query.split("&").forEach((item) => {
      const [key, value] = item.split("=");
      if (key) params[key] = decodeURIComponent(value || "");
    });
  }
  return params;
}

// 本地缓存操作
const USER_KEY = "daogame_user_info";

export function saveUserInfo(user: {
  uuid: string;
  token: string;
  uid: string;
  openName: string;
}) {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function getUserInfoFromCache(): {
  uuid: string;
  token: string;
  uid: string;
  openName: string;
} | null {
  const str = localStorage.getItem(USER_KEY);
  if (!str) return null;
  try {
    return JSON.parse(str);
  } catch {
    return null;
  }
}

export function clearUserInfo() {
  localStorage.removeItem(USER_KEY);
  localStorage.removeItem("token");
  localStorage.removeItem("uuid");
  localStorage.removeItem("uid");
}
