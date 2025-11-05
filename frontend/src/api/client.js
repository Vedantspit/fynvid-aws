import { deletePlaylist } from "../../../backend/src/controllers/playlist.controller";

// Lightweight API client with auth and refresh handling
const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:8000/api/v1";

export class ApiClient {
  constructor(getAccessToken, setTokens) {
    this.getAccessToken = getAccessToken;
    this.setTokens = setTokens;
  }

  async request(
    path,
    { method = "GET", headers = {}, body, isForm = false } = {}
  ) {
    const url = `${API_BASE_URL}${path}`;
    const token = this.getAccessToken?.();

    const reqHeaders = new Headers(headers);
    if (!isForm) {
      reqHeaders.set("Content-Type", "application/json");
    }
    if (token) {
      reqHeaders.set("Authorization", `Bearer ${token}`);
    }

    let response = await fetch(url, {
      method,
      headers: reqHeaders,
      credentials: "include", // send/receive httpOnly cookies
      body: isForm ? body : body ? JSON.stringify(body) : undefined,
    });

    if (response.status === 401) {
      // try refresh
      const refreshed = await this.refresh();
      if (refreshed) {
        const retryHeaders = new Headers(headers);
        if (!isForm) retryHeaders.set("Content-Type", "application/json");
        const newToken = this.getAccessToken?.();
        if (newToken) retryHeaders.set("Authorization", `Bearer ${newToken}`);
        response = await fetch(url, {
          method,
          headers: retryHeaders,
          credentials: "include",
          body: isForm ? body : body ? JSON.stringify(body) : undefined,
        });
      }
    }

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      const message = data?.message || data?.error || response.statusText;
      throw new Error(message);
    }
    return data;
  }

  async refresh() {
    try {
      const res = await fetch(`${API_BASE_URL}/users/refresh-token`, {
        method: "POST",
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) return false;
      const accessToken = data?.data?.newAt || data?.data?.accessToken;
      const refreshToken = data?.data?.newRt || data?.data?.refreshToken;
      if (this.setTokens && accessToken)
        this.setTokens({ accessToken, refreshToken });
      return true;
    } catch {
      return false;
    }
  }
}

export const buildApi = (getAccessToken, setTokens) =>
  new ApiClient(getAccessToken, setTokens);

export const endpoints = {
  // auth
  register: () => `/users/register`,
  login: () => `/users/login`,
  logout: () => `/users/logout`,
  me: () => `/users/current-user`,
  changePassword: () => `/users/change-password`,
  // videos
  videos: () => `/videos`,
  videoById: (id) => `/videos/${id}`,
  togglePublish: (id) => `/videos/toggle/publish/${id}`,
  // likes
  toggleVideoLike: (id) => `/likes/toggle/v/${id}`,
  toggleCommentLike: (id) => `/likes/toggle/c/${id}`,
  videoLikeInfo: (id) => `/likes/info/v/${id}`,
  commentLikeInfo: (id) => `/likes/info/c/${id}`,
  likedVideos: () => `/likes/videos`,
  // comments
  comments: (videoId) => `/comments/${videoId}`,
  commentById: (id) => `/comments/c/${id}`,
  // playlists (note: backend mounts at '/playlist')
  playlistsByUser: (userId) => `/playlist/user/${userId}`,
  playlistById: (id) => `/playlist/${id}`,
  addToPlaylist: (videoId, playlistId) =>
    `/playlist/add/${videoId}/${playlistId}`,
  removeFromPlaylist: (videoId, playlistId) =>
    `/playlist/remove/${videoId}/${playlistId}`,
  deletePlaylist: (playlistId) => `/playlist/${playlistId}`,
  // subscriptions
  subscribedChannels: (channelId) => `/subscriptions/c/${channelId}`,
  channelSubscribers: (channelId) => `/subscriptions/u/${channelId}`,
  toggleSubscription: (channelId) => `/subscriptions/c/${channelId}`,
  // dashboard
  stats: () => `/dashboard/stats`,
  myVideos: () => `/dashboard/videos`,
};
