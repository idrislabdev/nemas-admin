import axios, {
  type AxiosError,
  type AxiosInstance,
  type InternalAxiosRequestConfig,
} from 'axios';

type RetryableRequestConfig = InternalAxiosRequestConfig & {
  _retry?: boolean;
};

const axiosInstance: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
  timeout: 200000,
});

const getAccessToken = () => {
  if (typeof window === 'undefined') {
    return null;
  }

  return localStorage.getItem('access_token');
};

const getRefreshToken = () => {
  if (typeof window === 'undefined') {
    return null;
  }

  return localStorage.getItem('refresh_token');
};

const setAccessToken = (token: string) => {
  if (typeof window === 'undefined') {
    return;
  }

  localStorage.setItem('access_token', token);
};

const clearAuth = () => {
  if (typeof window === 'undefined') {
    return;
  }

  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
  localStorage.removeItem('user');
};

/**
 * Request refresh yang sedang berjalan.
 *
 * Kalau ada banyak request mendapatkan 401 bersamaan,
 * semuanya akan menunggu Promise yang sama.
 */
let refreshPromise: Promise<string> | null = null;

const refreshAccessToken = async (): Promise<string> => {
  const refreshToken = getRefreshToken();

  if (!refreshToken) {
    throw new Error('Refresh token tidak tersedia');
  }

  const response = await axios.post(
    '/users/token/refresh/',
    {
      refresh: refreshToken,
    },
    {
      baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
      timeout: 200000,
    }
  );

  const newAccessToken = response.data?.access;

  if (!newAccessToken) {
    throw new Error('Access token baru tidak tersedia');
  }

  setAccessToken(newAccessToken);

  /**
   * Jika backend menggunakan refresh token rotation
   * dan mengembalikan refresh token baru,
   * simpan juga.
   */
  if (response.data?.refresh) {
    localStorage.setItem('refresh_token', response.data.refresh);
  }

  return newAccessToken;
};

/**
 * REQUEST INTERCEPTOR
 *
 * Setiap request akan otomatis menggunakan access token terbaru.
 */
axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const accessToken = getAccessToken();

    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * RESPONSE INTERCEPTOR
 *
 * Flow:
 *
 * 200
 *   ↓
 * return response
 *
 * 401
 *   ↓
 * refresh access token
 *   ↓
 * retry request sebelumnya
 *
 * refresh gagal
 *   ↓
 * clear auth
 *   ↓
 * redirect login
 */
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },

  async (error: AxiosError) => {
    const originalRequest = error.config as RetryableRequestConfig | undefined;

    if (!originalRequest) {
      return Promise.reject(error);
    }

    /**
     * Jangan melakukan refresh untuk endpoint refresh itu sendiri.
     */
    const isRefreshRequest = originalRequest.url?.includes(
      '/users/token/refresh/'
    );

    /**
     * Hanya handle 401.
     */
    if (error.response?.status !== 401) {
      return Promise.reject(error);
    }

    /**
     * Jangan retry request yang sama berkali-kali.
     */
    if (originalRequest._retry) {
      return Promise.reject(error);
    }

    /**
     * Jangan sampai refresh endpoint memanggil refresh lagi.
     */
    if (isRefreshRequest) {
      clearAuth();

      if (typeof window !== 'undefined') {
        window.location.replace('/login');
      }

      return Promise.reject(error);
    }

    originalRequest._retry = true;

    try {
      /**
       * Kalau belum ada proses refresh,
       * buat proses refresh baru.
       */
      if (!refreshPromise) {
        refreshPromise = refreshAccessToken().finally(() => {
          refreshPromise = null;
        });
      }

      /**
       * Request lain yang mendapatkan 401 bersamaan
       * akan menunggu Promise refresh yang sama.
       */
      const newAccessToken = await refreshPromise;

      /**
       * Pasang token baru ke request sebelumnya.
       */
      originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

      /**
       * Jalankan ulang request sebelumnya.
       */
      return axiosInstance(originalRequest);
    } catch (refreshError) {
      clearAuth();

      if (typeof window !== 'undefined') {
        window.location.replace('/login');
      }

      return Promise.reject(refreshError);
    }
  }
);

export default axiosInstance;
