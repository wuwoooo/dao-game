import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

// 获取临时token
export async function getTempToken(deviceId: string) {
  try {
    return await axios.post(
      `${BASE_URL}/h5/auth/temp-token?deviceId=${deviceId}`,
      "",
      {
        headers: {
          accept: "*/*",
        },
      }
    );
  } catch (error) {
    console.error("获取临时token失败:", error);
    throw error;
  }
}

// 设置临时token
export function setupTempToken(tempToken: string) {
  axios.defaults.headers.common["Authorization"] = `Bearer ${tempToken}`;
}

// 检查临时token是否存在或者过期
export function checkTempToken(): boolean {
  const token = localStorage.getItem("temp_token");
  const expiry = localStorage.getItem("temp_token_expiry");

  if (!token || !expiry) return false;

  // 检查token是否过期（默认1小时）
  if (new Date().getTime() > parseInt(expiry)) {
    // 清除过期的token
    clearTempToken();
    return false;
  }

  // 设置axios默认请求头
  setupTempToken(token);
  return true;
}

// 清除临时token
export function clearTempToken() {
  localStorage.removeItem("temp_token");
  localStorage.removeItem("temp_token_expiry");
  delete axios.defaults.headers.common["Authorization"];
}

// 保存临时token
export function saveTempToken(token: string) {
  // 设置token过期时间为1小时后
  const expiry = new Date().getTime() + 60 * 60 * 1000;
  localStorage.setItem("temp_token", token);
  localStorage.setItem("temp_token_expiry", expiry.toString());
  setupTempToken(token);
}

// 封装API请求方法，确保有临时token
export async function withTempToken<T>(apiCall: () => Promise<T>): Promise<T> {
  // 如果没有有效的临时token，先获取
  if (!checkTempToken()) {
    // 生成随机设备ID
    const deviceId = "web_" + Math.random().toString(36).substring(2, 15);
    try {
      const res = await getTempToken(deviceId);
      if (res.data && res.data.code === 0) {
        saveTempToken(res.data.data);
      } else {
        throw new Error("获取临时token响应异常");
      }
    } catch (error) {
      throw new Error("无法获取临时授权，请稍后再试");
    }
  }

  // 有效token后调用API
  return apiCall();
}

// 获取活动列表
export async function getLotteryList() {
  return withTempToken(() => axios.get(`${BASE_URL}/v1/lottery/active`));
}

// 获取活动详情
export async function getLotteryDetail(id: number, uid?: string | null) {
  return withTempToken(() => {
    const url = `${BASE_URL}/v1/lottery/${id}`;
    // 如果uid存在，添加到查询参数
    if (uid) {
      return axios.get(url, { params: { uid } });
    }
    return axios.get(url);
  });
}

// 参与抽奖
export async function participateLottery(lotteryId: number, uid: string) {
  return withTempToken(() =>
    axios.post(`${BASE_URL}/v1/lottery/participate`, { lotteryId, uid })
  );
}

// 获取用户中奖记录
export async function getUserWinRecords(uid: string) {
  return withTempToken(() =>
    axios.get(`${BASE_URL}/v1/lottery/user/${uid}/wins`)
  );
}

// 获取用户参与抽奖记录
export async function getUserParticipations(
  uid: string,
  params?: {
    current?: number;
    size?: number;
    lotteryId?: number;
  }
) {
  return withTempToken(() =>
    axios.get(`${BASE_URL}/v1/lottery/user/${uid}/participations`, { params })
  );
}

// 更新中奖联系信息
export async function updateWinnerContact(id: number, contactInfo: string) {
  return withTempToken(() =>
    axios.put(`${BASE_URL}/v1/lottery/winner/${id}/claim`, null, {
      params: { contactInfo },
    })
  );
}
