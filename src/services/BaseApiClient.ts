import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

export interface ApiRequestConfig extends Omit<AxiosRequestConfig, 'url' | 'method'> {
  headers?: Record<string, string>;
  params?: Record<string, unknown>;
  [key: string]: unknown;
}

/**
 * A common API handler class that can be initialized with a base URL.
 */
export class BaseApiClient {
  protected axiosInstance: AxiosInstance;

  constructor(baseURL: string, config?: AxiosRequestConfig) {
    this.axiosInstance = axios.create({
      baseURL,
      headers: {
        'Content-Type': 'application/json',
      },
      ...config,
    });
  }

  async get<T = unknown>(endpoint: string, config?: ApiRequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await this.axiosInstance.get(endpoint, config);
    return response.data;
  }

  async post<T = unknown>(endpoint: string, body?: unknown, config?: ApiRequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await this.axiosInstance.post(endpoint, body, config);
    return response.data;
  }

  async put<T = unknown>(endpoint: string, body?: unknown, config?: ApiRequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await this.axiosInstance.put(endpoint, body, config);
    return response.data;
  }

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

    const response: AxiosResponse<T> = await this.axiosInstance.delete(endpoint, finalConfig);
    return response.data;
  }
}
