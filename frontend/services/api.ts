import { AnalysisRequest, AnalysisResponse, MarketData, Portfolio, UserProfile } from '../types/api';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

class ApiService {
  private async fetch<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  async getHealth(): Promise<any> {
    return this.fetch('/health');
  }

  async getMarket(symbol: string): Promise<MarketData> {
    return this.fetch(`/api/market/${symbol}`);
  }

  async getProfile(userId: string): Promise<UserProfile> {
    return this.fetch(`/api/profile/${userId}`);
  }

  async getPortfolio(userId: string): Promise<Portfolio> {
    return this.fetch(`/api/portfolio/${userId}`);
  }

  async analyzeStock(userId: string, symbol: string): Promise<AnalysisResponse> {
    const request: AnalysisRequest = { user_id: userId, symbol };
    return this.fetch<AnalysisResponse>('/api/analyze', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  async getSession(sessionId: string): Promise<AnalysisResponse> {
    return this.fetch(`/api/session/${sessionId}`);
  }

  async toggleDegradedMode(enabled: boolean): Promise<{ degraded_mode: boolean; message: string }> {
    return this.fetch('/api/demo/degraded-data', {
      method: 'POST',
      body: JSON.stringify({ enabled }),
    });
  }

  async getDegradedModeStatus(): Promise<{ degraded_mode: boolean }> {
    return this.fetch('/api/demo/degraded-data');
  }
}

export const api = new ApiService();
