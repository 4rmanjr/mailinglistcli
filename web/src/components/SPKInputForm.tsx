import { useState, useEffect, useRef } from 'react';
import { X, Search, Loader2, CheckCircle } from 'lucide-react';
import { api } from '../api';
import type { MasterCustomer, SPKPenyegelanInput, SPKPencabutanInput } from '../types';

interface SPKInputFormProps {
  type: 'penyegelan' | 'pencabutan';
  onClose: () => void;
  onSave: () => void;
  editData?: SPKPenyegelanInput | SPKPencabutanInput | null;
}

export function SPKInputForm({ type, onClose, onSave, editData }: SPKInputFormProps) {
  const [noPel, setNoPel] = useState('');
  const [nama, setNama] = useState('');
  const [alamat, setAlamat] = useState('');
  const [jumlahBln, setJumlahBln] = useState(0);
  const [jumlah, setJumlah] = useState(0);
  const [jumlahDisplay, setJumlahDisplay] = useState('');
  const [totalTunggakan, setTotalTunggakan] = useState(0);
  const [jumlahTunggakan, setJumlahTunggakan] = useState(0);
  const [jumlahTunggakanDisplay, setJumlahTunggakanDisplay] = useState('');
  const [ket, setKet] = useState('');
  
  const [searchResults, setSearchResults] = useState<MasterCustomer[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [notFound, setNotFound] = useState(false);
  
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const formatNumberInput = (value: string): string => {
    const numericValue = value.replace(/\D/g, '');
    return numericValue.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  };

  const parseFormattedNumber = (value: string): number => {
    return parseInt(value.replace(/\D/g, '')) || 0;
  };

  const handleJumlahChange = (value: string) => {
    const formatted = formatNumberInput(value);
    setJumlahDisplay(formatted);
    setJumlah(parseFormattedNumber(value));
  };

  const handleJumlahTunggakanChange = (value: string) => {
    const formatted = formatNumberInput(value);
    setJumlahTunggakanDisplay(formatted);
    setJumlahTunggakan(parseFormattedNumber(value));
  };

  useEffect(() => {
    if (editData) {
      if (type === 'penyegelan') {
        const data = editData as SPKPenyegelanInput;
        setNoPel(data.no_pel);
        setNama(data.nama);
        setAlamat(data.alamat);
        setJumlahBln(data.jumlah_bln);
        setJumlah(data.jumlah);
        setJumlahDisplay(data.jumlah ? formatNumberInput(data.jumlah.toString()) : '');
        setKet(data.ket);
      } else {
        const data = editData as SPKPencabutanInput;
        setNoPel(data.no_samb);
        setNama(data.nama);
        setAlamat(data.alamat);
        setTotalTunggakan(data.total_tunggakan);
        setJumlahTunggakan(data.jumlah_tunggakan);
        setJumlahTunggakanDisplay(data.jumlah_tunggakan ? formatNumberInput(data.jumlah_tunggakan.toString()) : '');
        setKet(data.ket);
      }
    }
  }, [editData, type]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNoPelChange = async (value: string) => {
    setNoPel(value);
    setNotFound(false);
    
    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current);
    }
    
    if (value.length >= 3) {
      searchTimeout.current = setTimeout(async () => {
        setLoading(true);
        try {
          const results = await api.searchMasterCustomer(value);
          setSearchResults(results);
          setShowDropdown(results.length > 0);
        } catch (error) {
          console.error('Error searching:', error);
        } finally {
          setLoading(false);
        }
      }, 300);
    } else {
      setSearchResults([]);
      setShowDropdown(false);
    }
  };

  const handleSelectCustomer = (customer: MasterCustomer) => {
    setNoPel(customer.No_Pel);
    setNama(customer.Nama);
    setAlamat(customer.Alamat);
    setShowDropdown(false);
    setSearchResults([]);
  };

  const handleAutoFill = async () => {
    if (!noPel) return;
    
    setLoading(true);
    setNotFound(false);
    try {
      const customer = await api.getMasterCustomer(noPel);
      if (customer) {
        setNama(customer.Nama);
        setAlamat(customer.Alamat);
      } else {
        setNotFound(true);
      }
    } catch (error) {
      console.error('Error fetching customer:', error);
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      if (type === 'penyegelan') {
        const data: Omit<SPKPenyegelanInput, 'id' | 'created_at' | 'updated_at'> = {
          no_pel: noPel,
          nama,
          alamat,
          jumlah_bln: jumlahBln,
          jumlah,
          ket
        };
        
        if (editData?.id) {
          await api.updateSPKPenyegelanInput(editData.id, data);
        } else {
          await api.createSPKPenyegelanInput(data);
        }
      } else {
        const data: Omit<SPKPencabutanInput, 'id' | 'created_at' | 'updated_at'> = {
          no_samb: noPel,
          nama,
          alamat,
          total_tunggakan: totalTunggakan,
          jumlah_tunggakan: jumlahTunggakan,
          ket
        };
        
        if (editData?.id) {
          await api.updateSPKPencabutanInput(editData.id, data);
        } else {
          await api.createSPKPencabutanInput(data);
        }
      }
      
      onSave();
      onClose();
    } catch (error) {
      console.error('Error saving:', error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-content" style={{ maxWidth: '500px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 600 }}>
            {editData ? 'Edit' : 'Tambah'} {type === 'penyegelan' ? 'Penyegelan' : 'Pencabutan'}
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--text-secondary)'
            }}
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ position: 'relative' }} ref={dropdownRef}>
              <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.875rem', fontWeight: 500 }}>
                No. Pelanggan
              </label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <div style={{ flex: 1, position: 'relative' }}>
                  <input
                    type="text"
                    value={noPel}
                    onChange={(e) => handleNoPelChange(e.target.value)}
                    placeholder="Ketik No. Pelanggan..."
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: notFound ? '1px solid #ef4444' : '1px solid var(--border-color)',
                      borderRadius: '0.5rem',
                      background: 'var(--bg-primary)',
                      color: 'var(--text-primary)'
                    }}
                  />
                  {loading && (
                    <Loader2 
                      size={16} 
                      style={{ 
                        position: 'absolute', 
                        right: '0.75rem', 
                        top: '50%', 
                        transform: 'translateY(-50%)',
                        animation: 'spin 1s linear infinite'
                      }} 
                    />
                  )}
                  
                  {showDropdown && searchResults.length > 0 && (
                    <div style={{
                      position: 'absolute',
                      top: '100%',
                      left: 0,
                      right: 0,
                      background: 'var(--bg-primary)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '0.5rem',
                      marginTop: '0.25rem',
                      maxHeight: '200px',
                      overflowY: 'auto',
                      zIndex: 1000,
                      boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                    }}>
                      {searchResults.map((customer, index) => (
                        <div
                          key={index}
                          onClick={() => handleSelectCustomer(customer)}
                          style={{
                            padding: '0.75rem',
                            cursor: 'pointer',
                            borderBottom: index < searchResults.length - 1 ? '1px solid var(--border-color)' : 'none',
                            transition: 'background 0.2s'
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-secondary)'}
                          onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                        >
                          <div style={{ fontWeight: 500, fontSize: '0.875rem' }}>{customer.No_Pel}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{customer.Nama}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <button
                  type="button"
                  onClick={handleAutoFill}
                  disabled={loading || !noPel}
                  style={{
                    padding: '0.75rem',
                    border: '1px solid var(--border-color)',
                    borderRadius: '0.5rem',
                    background: 'var(--bg-secondary)',
                    cursor: loading || !noPel ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.25rem'
                  }}
                  title="Auto Fill"
                >
                  <Search size={16} />
                </button>
              </div>
              {notFound && (
                <div style={{ fontSize: '0.75rem', color: '#ef4444', marginTop: '0.25rem' }}>
                  Pelanggan tidak ditemukan
                </div>
              )}
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.875rem', fontWeight: 500 }}>
                Nama
              </label>
              <input
                type="text"
                value={nama}
                onChange={(e) => setNama(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid var(--border-color)',
                  borderRadius: '0.5rem',
                  background: 'var(--bg-primary)',
                  color: 'var(--text-primary)'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.875rem', fontWeight: 500 }}>
                Alamat
              </label>
              <textarea
                value={alamat}
                onChange={(e) => setAlamat(e.target.value)}
                rows={2}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid var(--border-color)',
                  borderRadius: '0.5rem',
                  background: 'var(--bg-primary)',
                  color: 'var(--text-primary)',
                  resize: 'vertical'
                }}
              />
            </div>

            {type === 'penyegelan' ? (
              <>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.875rem', fontWeight: 500 }}>
                      Jumlah Bulan
                    </label>
                    <input
                      type="number"
                      value={jumlahBln}
                      onChange={(e) => setJumlahBln(Number(e.target.value))}
                      min={0}
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        border: '1px solid var(--border-color)',
                        borderRadius: '0.5rem',
                        background: 'var(--bg-primary)',
                        color: 'var(--text-primary)'
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.875rem', fontWeight: 500 }}>
                      Jumlah Total (Rp)
                    </label>
                    <input
                      type="text"
                      value={jumlahDisplay}
                      onChange={(e) => handleJumlahChange(e.target.value)}
                      placeholder="0"
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        border: '1px solid var(--border-color)',
                        borderRadius: '0.5rem',
                        background: 'var(--bg-primary)',
                        color: 'var(--text-primary)'
                      }}
                    />
                  </div>
                </div>
              </>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.875rem', fontWeight: 500 }}>
                    Total Tunggakan
                  </label>
                  <input
                    type="number"
                    value={totalTunggakan}
                    onChange={(e) => setTotalTunggakan(Number(e.target.value))}
                    min={0}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1px solid var(--border-color)',
                      borderRadius: '0.5rem',
                      background: 'var(--bg-primary)',
                      color: 'var(--text-primary)'
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.875rem', fontWeight: 500 }}>
                    Jumlah Tunggakan (Rp)
                  </label>
                  <input
                    type="text"
                    value={jumlahTunggakanDisplay}
                    onChange={(e) => handleJumlahTunggakanChange(e.target.value)}
                    placeholder="0"
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1px solid var(--border-color)',
                      borderRadius: '0.5rem',
                      background: 'var(--bg-primary)',
                      color: 'var(--text-primary)'
                    }}
                  />
                </div>
              </div>
            )}

            <div>
              <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.875rem', fontWeight: 500 }}>
                Keterangan
              </label>
              <select
                value={ket}
                onChange={(e) => setKet(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid var(--border-color)',
                  borderRadius: '0.5rem',
                  background: 'var(--bg-primary)',
                  color: 'var(--text-primary)'
                }}
              >
                <option value="">Pilih Keterangan</option>
                <option value="LUNAS">LUNAS</option>
                <option value="BYR/LUNAS">BYR/LUNAS</option>
                <option value="CABUT">CABUT</option>
                <option value="PERMOHONAN">PERMOHONAN</option>
                <option value="BELUM LUNAS">BELUM LUNAS</option>
                <option value="PROSES">PROSES</option>
              </select>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
              <button
                type="button"
                onClick={onClose}
                style={{
                  padding: '0.75rem 1.5rem',
                  border: '1px solid var(--border-color)',
                  borderRadius: '0.5rem',
                  background: 'var(--bg-secondary)',
                  cursor: 'pointer'
                }}
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={saving || !noPel || !nama}
                style={{
                  padding: '0.75rem 1.5rem',
                  border: 'none',
                  borderRadius: '0.5rem',
                  background: saving || !noPel || !nama ? 'var(--bg-secondary)' : 'var(--primary)',
                  color: saving || !noPel || !nama ? 'var(--text-secondary)' : 'white',
                  cursor: saving || !noPel || !nama ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
              >
                {saving ? (
                  <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
                ) : (
                  <CheckCircle size={16} />
                )}
                {saving ? 'Menyimpan...' : 'Simpan'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
