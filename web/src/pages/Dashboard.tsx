import { useEffect, useState } from 'react';
import { Users, UserCheck, UserX, FileText } from 'lucide-react';
import { api } from '../api';
import type { DashboardStats } from '../types';

export function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getStats()
      .then(data => setStats(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const statCards = [
    {
      title: 'Total Pelanggan',
      value: stats?.total_customers ?? 0,
      icon: Users,
      variant: 'primary',
    },
    {
      title: 'Pelanggan Aktif',
      value: stats?.active_customers ?? 0,
      icon: UserCheck,
      variant: 'success',
    },
    {
      title: 'Pelanggan Nonaktif',
      value: stats?.inactive_customers ?? 0,
      icon: UserX,
      variant: 'danger',
    },
    {
      title: 'Surat Dibuat',
      value: stats?.total_letters ?? 0,
      icon: FileText,
      variant: 'warning',
    },
  ];

  if (loading) {
    return <div className="card">Loading...</div>;
  }

  return (
    <div>
      <div className="stats-grid">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.title} className="stat-card">
              <div className={`stat-icon ${stat.variant}`}>
                <Icon size={28} />
              </div>
              <div className="stat-content">
                <div className="stat-value">{stat.value}</div>
                <div className="stat-label">{stat.title}</div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Ringkasan</h2>
        </div>
        <div style={{ color: 'var(--text-secondary)' }}>
          <p>Selamat datang di Mailing List Management System.</p>
          <p style={{ marginTop: '0.5rem' }}>
            Sistem ini membantu Anda mengelola daftar pelanggan dan membuat surat penyegelan secara efisien.
          </p>
        </div>
      </div>
    </div>
  );
}
