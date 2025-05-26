import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

// --- H5 Game/App Endpoints ---

// 获取轮播图列表
export function getBanners() {
  return axios.get(`${BASE_URL}/h5/games/banners`);
}

// 获取热门游戏/应用
export function getHotGames(params?: { current?: number; size?: number }) {
  return axios.get(`${BASE_URL}/h5/games/hot`, { params });
}

// 获取首发游戏/应用
export function getNewGames(params?: { current?: number; size?: number }) {
  return axios.get(`${BASE_URL}/h5/games/new`, { params });
}

// 获取推荐游戏/应用
export function getRecommendGames(params?: {
  current?: number;
  size?: number;
}) {
  return axios.get(`${BASE_URL}/h5/games/recommend`, { params });
}

// 搜索游戏/应用
export function searchGames(params: {
  keyword: string;
  current?: number;
  size?: number;
}) {
  return axios.get(`${BASE_URL}/h5/games/search`, { params });
}

// 获取游戏/应用详情 (H5 version)
export function getGameDetailH5(id: string | number) {
  return axios.get(`${BASE_URL}/h5/games/${id}`);
}

// 获取分类游戏/应用
export function getCategoryGames(
  category: string,
  params?: { current?: number; size?: number }
) {
  return axios.get(`${BASE_URL}/h5/games/category/${category}`, { params });
}

// --- 用户行为追踪 API ---

// 记录用户点击 - 当用户点击游戏/应用链接进入游戏时调用
export function recordClick(data: {
  uid: string;
  gameappId: number | string; // gameappId can be string from route.params
  ip?: string;
  userAgent?: string;
  referer?: string;
}) {
  return axios.post(`${BASE_URL}/h5/track/click`, data);
}

// 记录用户浏览 - 当用户查看游戏/应用详情页时调用
export function recordView(data: {
  uid: string;
  gameappId: number | string;
  ip?: string;
  userAgent?: string;
  referer?: string;
}) {
  return axios.post(`${BASE_URL}/h5/track/view`, data);
}

// 查询用户点击记录
export function getClickRecords(params: {
  current?: number;
  size?: number;
  uid?: string;
  gameappId?: number | string;
}) {
  return axios.get(`${BASE_URL}/h5/track/clicks`, { params });
}

// 查询用户浏览记录
export function getViewRecords(params: {
  current?: number;
  size?: number;
  uid?: string;
  gameappId?: number | string;
}) {
  return axios.get(`${BASE_URL}/h5/track/views`, { params });
}

// --- Old/Removed Endpoints (commenting out or removing) ---
/*
// 获取游戏/应用列表 (Old - replaced by getHotGames, getNewGames etc.)
export function getGameList() {
  return axios.get(`${BASE_URL}/v1/apply/list`);
}

// 获取游戏/应用详情 (Old - replaced by getGameDetailH5)
export function getGameDetail(id: string) {
 return axios.get(`${BASE_URL}/v1/apply/${id}`);
}
*/
