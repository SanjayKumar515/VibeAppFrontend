import { API_URL } from "../constant/config";

class ApiService {
  private async request(endpoint: string, options: RequestInit = {}) {
    // Ensure no double slashes between API_URL and endpoint
    const cleanBase = API_URL.replace(/\/+$/, '');
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    const url = `${cleanBase}${cleanEndpoint}`;
    return this.fetchApi(url, options);
  }

  private async fetchApi(url: string, options: RequestInit = {}) {
    const headers = new Headers(options.headers);
    headers.set("Content-Type", "application/json");
    headers.set("Accept", "application/json");
    // TODO: Add auth token if needed
    // headers.set('Authorization', `Bearer ${token}`);

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      const text = await response.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch (e) {
        throw new Error(`Server returned invalid JSON. It might be crashing or you might need to reload the app. Response: ${text.substring(0, 100)}`);
      }

      if (!response.ok) {
        throw new Error(data.msg || data.message || "API Request Failed");
      }

      return data;
    } catch (error) {
      console.error("API Error:", error);
      throw error;
    }
  }

  public get(endpoint: string, options?: RequestInit) {
    return this.request(endpoint, { ...options, method: "GET" });
  }

  public post(endpoint: string, body: any, options?: RequestInit) {
    return this.request(endpoint, {
      ...options,
      method: "POST",
      body: JSON.stringify(body),
    });
  }

  public put(endpoint: string, body: any, options?: RequestInit) {
    return this.request(endpoint, {
      ...options,
      method: "PUT",
      body: JSON.stringify(body),
    });
  }

  public delete(endpoint: string, options?: RequestInit) {
    return this.request(endpoint, { ...options, method: "DELETE" });
  }
}

export const apiService = new ApiService();
