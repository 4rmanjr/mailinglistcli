export interface Customer {
  id: number;
  nama: string;
  alamat: string;
  kota: string;
  kode_pos: string;
  telepon: string;
  email: string;
  status: 'active' | 'inactive';
  created_at: string;
}

export interface DashboardStats {
  total_customers: number;
  active_customers: number;
  inactive_customers: number;
  total_letters: number;
}

export interface Letter {
  id: string;
  nomor: string;
  tanggal: string;
  perihal: string;
  customer_id: number;
  customer_nama: string;
  total_tunggakan?: string;
  total_tagihan?: number;
  status: 'draft' | 'sent';
  created_at: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}
