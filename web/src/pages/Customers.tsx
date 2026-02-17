import { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, Search, FileText } from 'lucide-react';
import { api } from '../api';
import type { Customer } from '../types';

export function Customers() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [formData, setFormData] = useState({
    nama: '',
    alamat: '',
    kota: '',
    kode_pos: '',
    telepon: '',
    email: '',
    status: 'active' as 'active' | 'inactive',
  });

  const [selectedCustomerIds, setSelectedCustomerIds] = useState<number[]>([]);
  const [showLetterModal, setShowLetterModal] = useState(false);
  const [letterData, setLetterData] = useState({
    total_tunggakan: '',
    total_tagihan: 0,
  });

  useEffect(() => {
    loadCustomers();
  }, []);

  const toggleSelectAll = () => {
    if (selectedCustomerIds.length === filteredCustomers.length) {
      setSelectedCustomerIds([]);
    } else {
      setSelectedCustomerIds(filteredCustomers.map(c => c.id));
    }
  };

  const toggleSelectCustomer = (id: number) => {
    setSelectedCustomerIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleCreateLetter = (customer: Customer | null = null) => {
    if (customer) {
      setSelectedCustomerIds([customer.id]);
    }
    setLetterData({ total_tunggakan: '2 Bulan', total_tagihan: 0 }); // Default values
    setShowLetterModal(true);
  };

  const submitLetters = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      for (const id of selectedCustomerIds) {
        const customer = customers.find(c => c.id === id);
        if (customer) {
          await api.createLetter({
            nomor: `06${Math.floor(Math.random() * 90000000 + 10000000)}`,
            tanggal: new Date().toISOString().split('T')[0],
            perihal: 'Surat Penyegelan',
            customer_id: customer.id,
            customer_nama: customer.nama,
            total_tunggakan: letterData.total_tunggakan,
            total_tagihan: letterData.total_tagihan,
            status: 'sent',
          });
        }
      }
      setShowLetterModal(false);
      setSelectedCustomerIds([]);
      alert('Surat berhasil dibuat!');
    } catch (error) {
      console.error('Error creating letters:', error);
      alert('Gagal membuat surat.');
    }
  };

  const loadCustomers = async () => {
    try {
      const data = await api.getCustomers();
      setCustomers(data);
    } catch (error) {
      console.error('Error loading customers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingCustomer(null);
    setFormData({
      nama: '',
      alamat: '',
      kota: '',
      kode_pos: '',
      telepon: '',
      email: '',
      status: 'active',
    });
    setShowModal(true);
  };

  const handleEdit = (customer: Customer) => {
    setEditingCustomer(customer);
    setFormData({
      nama: customer.nama,
      alamat: customer.alamat,
      kota: customer.kota,
      kode_pos: customer.kode_pos,
      telepon: customer.telepon,
      email: customer.email,
      status: customer.status,
    });
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm('Apakah Anda yakin ingin menghapus pelanggan ini?')) {
      try {
        await api.deleteCustomer(id);
        loadCustomers();
      } catch (error) {
        console.error('Error deleting customer:', error);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingCustomer) {
        await api.updateCustomer(editingCustomer.id, formData);
      } else {
        await api.createCustomer(formData);
      }
      setShowModal(false);
      loadCustomers();
    } catch (error) {
      console.error('Error saving customer:', error);
    }
  };

  const filteredCustomers = customers.filter(customer =>
    customer.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Daftar Pelanggan</h2>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {selectedCustomerIds.length > 0 && (
              <button className="btn btn-secondary" onClick={() => handleCreateLetter()}>
                <FileText size={18} />
                Buat Surat Massal ({selectedCustomerIds.length})
              </button>
            )}
            <button className="btn btn-primary" onClick={handleAdd}>
              <Plus size={18} />
              Tambah Pelanggan
            </button>
          </div>
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <div style={{ position: 'relative', maxWidth: '300px' }}>
            <Search
              size={20}
              style={{
                position: 'absolute',
                left: '0.75rem',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-secondary)',
              }}
            />
            <input
              type="text"
              placeholder="Cari pelanggan..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="form-input"
              style={{ paddingLeft: '2.5rem' }}
            />
          </div>
        </div>

        {loading ? (
          <div>Loading...</div>
        ) : (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>
                    <input
                      type="checkbox"
                      checked={selectedCustomerIds.length === filteredCustomers.length && filteredCustomers.length > 0}
                      onChange={toggleSelectAll}
                    />
                  </th>
                  <th>Nama</th>
                  <th>Email</th>
                  <th>Kota</th>
                  <th>Telepon</th>
                  <th>Status</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filteredCustomers.map((customer) => (
                  <tr key={customer.id}>
                    <td>
                      <input
                        type="checkbox"
                        checked={selectedCustomerIds.includes(customer.id)}
                        onChange={() => toggleSelectCustomer(customer.id)}
                      />
                    </td>
                    <td>{customer.nama}</td>
                    <td>{customer.email || '-'}</td>
                    <td>{customer.kota}</td>
                    <td>{customer.telepon || '-'}</td>
                    <td>
                      <span className={`badge ${customer.status === 'active' ? 'badge-success' : 'badge-danger'}`}>
                        {customer.status === 'active' ? 'Aktif' : 'Nonaktif'}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button
                          className="btn btn-secondary btn-sm"
                          title="Buat Surat"
                          onClick={() => handleCreateLetter(customer)}
                        >
                          <FileText size={16} />
                        </button>
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => handleEdit(customer)}
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => handleDelete(customer.id)}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showLetterModal && (
        <div className="modal-overlay" onClick={() => setShowLetterModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Buat Surat Penyegelan</h3>
              <button className="modal-close" onClick={() => setShowLetterModal(false)}>✕</button>
            </div>
            <form onSubmit={submitLetters}>
              <div className="modal-body">
                <p style={{ marginBottom: '1rem', color: 'var(--text-secondary)' }}>
                  Membuat surat untuk {selectedCustomerIds.length} pelanggan terpilih.
                </p>
                <div className="form-group">
                  <label className="form-label">Total Tunggakan</label>
                  <input
                    type="text"
                    className="form-input"
                    value={letterData.total_tunggakan}
                    onChange={(e) => setLetterData({ ...letterData, total_tunggakan: e.target.value })}
                    placeholder="Contoh: 3 Bulan"
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Total Tagihan (Rp)</label>
                  <input
                    type="number"
                    className="form-input"
                    value={letterData.total_tagihan}
                    onChange={(e) => setLetterData({ ...letterData, total_tagihan: parseInt(e.target.value) || 0 })}
                    required
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowLetterModal(false)}>Batal</button>
                <button type="submit" className="btn btn-primary">Konfirmasi & Buat Surat</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">
                {editingCustomer ? 'Edit Pelanggan' : 'Tambah Pelanggan'}
              </h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>
                ✕
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Nama</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.nama}
                    onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Alamat</label>
                  <textarea
                    className="form-textarea"
                    value={formData.alamat}
                    onChange={(e) => setFormData({ ...formData, alamat: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Kota</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.kota}
                    onChange={(e) => setFormData({ ...formData, kota: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Kode Pos</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.kode_pos}
                    onChange={(e) => setFormData({ ...formData, kode_pos: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Telepon</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.telepon}
                    onChange={(e) => setFormData({ ...formData, telepon: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Email</label>
                  <input
                    type="email"
                    className="form-input"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Status</label>
                  <select
                    className="form-select"
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as 'active' | 'inactive' })}
                  >
                    <option value="active">Aktif</option>
                    <option value="inactive">Nonaktif</option>
                  </select>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                  Batal
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingCustomer ? 'Update' : 'Simpan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
