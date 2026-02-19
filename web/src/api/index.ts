import type { Customer, DashboardStats, ApiResponse, Letter, Penyegelan, Pencabutan, SPKStats, GenerateSPKResponse, MasterCustomer, SPKPenyegelanInput, SPKPencabutanInput } from '../types';

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

  // SPK Management APIs
  async getSPKStats(): Promise<SPKStats> {
    const response = await fetch(`${API_BASE_URL}/stats`);
    const result = await handleResponse<SPKStats>(response);
    return result.data!;
  },

  async getPenyegelan(search?: string, ket?: string): Promise<Penyegelan[]> {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (ket) params.append('ket', ket);
    const response = await fetch(`${API_BASE_URL}/penyegelan?${params}`);
    const result = await handleResponse<Penyegelan[]>(response);
    return result.data || [];
  },

  async getPenyegelanById(id: number): Promise<Penyegelan> {
    const response = await fetch(`${API_BASE_URL}/penyegelan/${id}`);
    const result = await handleResponse<Penyegelan>(response);
    return result.data!;
  },

  async updatePenyegelan(id: number, data: Partial<Penyegelan>): Promise<void> {
    await fetch(`${API_BASE_URL}/penyegelan/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
  },

  async getPencabutan(search?: string, ket?: string): Promise<Pencabutan[]> {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (ket) params.append('ket', ket);
    const response = await fetch(`${API_BASE_URL}/pencabutan?${params}`);
    const result = await handleResponse<Pencabutan[]>(response);
    return result.data || [];
  },

  async getPencabutanById(id: number): Promise<Pencabutan> {
    const response = await fetch(`${API_BASE_URL}/pencabutan/${id}`);
    const result = await handleResponse<Pencabutan>(response);
    return result.data!;
  },

  async updatePencabutan(id: number, data: Partial<Pencabutan>): Promise<void> {
    await fetch(`${API_BASE_URL}/pencabutan/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
  },

  async generateSPK(type: 'penyegelan' | 'pencabutan', ids: number[]): Promise<GenerateSPKResponse> {
    const response = await fetch(`${API_BASE_URL}/generate-spk`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type, ids }),
    });
    const result = await handleResponse<GenerateSPKResponse>(response);
    return result.data!;
  },

  async getMasterCustomer(noPel: string): Promise<MasterCustomer | null> {
    const params = new URLSearchParams();
    params.append('no_pel', noPel);
    const response = await fetch(`${API_BASE_URL}/master-customer?${params}`);
    const result = await handleResponse<MasterCustomer>(response);
    return result.data || null;
  },

  async searchMasterCustomer(search: string): Promise<MasterCustomer[]> {
    const params = new URLSearchParams();
    params.append('search', search);
    const response = await fetch(`${API_BASE_URL}/master-customer?${params}`);
    const result = await handleResponse<MasterCustomer[]>(response);
    return result.data || [];
  },

  async getSPKPenyegelanInput(search?: string, ket?: string): Promise<SPKPenyegelanInput[]> {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (ket) params.append('ket', ket);
    const response = await fetch(`${API_BASE_URL}/spk-penyegelan?${params}`);
    const result = await handleResponse<SPKPenyegelanInput[]>(response);
    return result.data || [];
  },

  async createSPKPenyegelanInput(data: Omit<SPKPenyegelanInput, 'id' | 'created_at' | 'updated_at'>): Promise<SPKPenyegelanInput> {
    const response = await fetch(`${API_BASE_URL}/spk-penyegelan`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const result = await handleResponse<SPKPenyegelanInput>(response);
    return result.data!;
  },

  async updateSPKPenyegelanInput(id: number, data: Partial<SPKPenyegelanInput>): Promise<SPKPenyegelanInput> {
    const response = await fetch(`${API_BASE_URL}/spk-penyegelan/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const result = await handleResponse<SPKPenyegelanInput>(response);
    return result.data!;
  },

  async deleteSPKPenyegelanInput(id: number): Promise<void> {
    await fetch(`${API_BASE_URL}/spk-penyegelan/${id}`, {
      method: 'DELETE',
    });
  },

  async getSPKPencabutanInput(search?: string, ket?: string): Promise<SPKPencabutanInput[]> {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (ket) params.append('ket', ket);
    const response = await fetch(`${API_BASE_URL}/spk-pencabutan?${params}`);
    const result = await handleResponse<SPKPencabutanInput[]>(response);
    return result.data || [];
  },

  async createSPKPencabutanInput(data: Omit<SPKPencabutanInput, 'id' | 'created_at' | 'updated_at'>): Promise<SPKPencabutanInput> {
    const response = await fetch(`${API_BASE_URL}/spk-pencabutan`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const result = await handleResponse<SPKPencabutanInput>(response);
    return result.data!;
  },

  async updateSPKPencabutanInput(id: number, data: Partial<SPKPencabutanInput>): Promise<SPKPencabutanInput> {
    const response = await fetch(`${API_BASE_URL}/spk-pencabutan/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const result = await handleResponse<SPKPencabutanInput>(response);
    return result.data!;
  },

  async deleteSPKPencabutanInput(id: number): Promise<void> {
    await fetch(`${API_BASE_URL}/spk-pencabutan/${id}`, {
      method: 'DELETE',
    });
  },
};