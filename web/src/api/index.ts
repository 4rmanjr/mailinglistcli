import type { Customer, DashboardStats, ApiResponse, Letter } from '../types';

const API_BASE_URL = '/api';

async function handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return response.json();
}

export const api = {
  async getStats(): Promise<DashboardStats> {
    const response = await fetch(`${API_BASE_URL}/stats`);
    const result = await handleResponse<DashboardStats>(response);
    return result.data!;
  },

  async getCustomers(): Promise<Customer[]> {
    const response = await fetch(`${API_BASE_URL}/customers`);
    const result = await handleResponse<Customer[]>(response);
    return result.data || [];
  },

  async getCustomer(id: number): Promise<Customer> {
    const response = await fetch(`${API_BASE_URL}/customers/${id}`);
    const result = await handleResponse<Customer>(response);
    return result.data!;
  },

  async createCustomer(customer: Omit<Customer, 'id' | 'created_at'>): Promise<Customer> {
    const response = await fetch(`${API_BASE_URL}/customers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(customer),
    });
    const result = await handleResponse<Customer>(response);
    return result.data!;
  },

  async updateCustomer(id: number, customer: Partial<Customer>): Promise<Customer> {
    const response = await fetch(`${API_BASE_URL}/customers/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(customer),
    });
    const result = await handleResponse<Customer>(response);
    return result.data!;
  },

  async deleteCustomer(id: number): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/customers/${id}`, {
      method: 'DELETE',
    });
    await handleResponse(response);
  },

  async getLetters(): Promise<Letter[]> {
    const response = await fetch(`${API_BASE_URL}/letters`);
    const result = await handleResponse<Letter[]>(response);
    return result.data || [];
  },

  async createLetter(letter: Omit<Letter, 'id' | 'created_at'>): Promise<Letter> {
    const response = await fetch(`${API_BASE_URL}/letters`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(letter),
    });
    const result = await handleResponse<Letter>(response);
    return result.data!;
  },
};
