import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

/**
 * Axios instance initialized with VITE_API_URL environment variable.
 */
export const axiosInstance: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '',
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface ApiRequestConfig extends Omit<AxiosRequestConfig, 'url' | 'method'> {
  headers?: Record<string, string>;
  params?: Record<string, unknown>;
  [key: string]: unknown;
}

/**
 * Simple API Client Handler wrapper around Axios
 */
export const apiClient = {
  /**
   * GET Request
   * @param endpoint API endpoint path (e.g., '/users' or '/posts/1')
   * @param config Optional Axios request configuration (headers, params, etc.)
   */
  async get<T = unknown>(endpoint: string, config?: ApiRequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await axiosInstance.get(endpoint, config);
    return response.data;
  },

  /**
   * POST Request
   * @param endpoint API endpoint path
   * @param body Optional request payload/body
   * @param config Optional Axios request configuration (headers, params, etc.)
   */
  async post<T = unknown>(endpoint: string, body?: unknown, config?: ApiRequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await axiosInstance.post(endpoint, body, config);
    return response.data;
  },

  /**
   * PUT Request
   * @param endpoint API endpoint path
   * @param body Optional request payload/body
   * @param config Optional Axios request configuration (headers, params, etc.)
   */
  async put<T = unknown>(endpoint: string, body?: unknown, config?: ApiRequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await axiosInstance.put(endpoint, body, config);
    return response.data;
  },

  /**
   * DELETE Request
   * Supports both calling with config directly: delete('/users/1', { headers: ... })
   * or passing body and config: delete('/users/1', { id: 1 }, { headers: ... })
   * @param endpoint API endpoint path
   * @param bodyOrConfig Optional body or request configuration
   * @param config Optional Axios request configuration if body was provided as 2nd parameter
   */
  async delete<T = unknown>(
    endpoint: string,
    bodyOrConfig?: unknown,
    config?: ApiRequestConfig
  ): Promise<T> {
    let finalConfig: ApiRequestConfig = {};

    if (config) {
      finalConfig = { ...config, data: bodyOrConfig };
    } else if (bodyOrConfig) {
      const isConfig =
        typeof bodyOrConfig === 'object' &&
        bodyOrConfig !== null &&
        ('headers' in bodyOrConfig ||
          'params' in bodyOrConfig ||
          'data' in bodyOrConfig ||
          'signal' in bodyOrConfig ||
          'timeout' in bodyOrConfig ||
          'auth' in bodyOrConfig);

      if (isConfig) {
        finalConfig = bodyOrConfig as ApiRequestConfig;
      } else {
        finalConfig = { data: bodyOrConfig };
      }
    }

    const response: AxiosResponse<T> = await axiosInstance.delete(endpoint, finalConfig);
    return response.data;
  },
};

export default apiClient;
