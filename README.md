# CLI Mailing List PDF Generator - Perumdam Tirtatarum Karawang

Aplikasi CLI sederhana berbasis Python untuk membuat surat pemberitahuan penyegelan pelanggan secara massal dalam format PDF profesional.

## Persyaratan
- Python 3.x
- Library `reportlab` (sudah terinstall di lingkungan ini)

## Cara Penggunaan
1.  Siapkan data pelanggan dalam format CSV (contoh: `data_pelanggan.csv`).
2.  Pastikan kolom-kolom berikut ada di CSV:
    - `no_pelanggan`
    - `nama`
    - `alamat`
    - `tanggal_penindakan`
    - `alasan`
3.  Jalankan perintah berikut:
    ```bash
    python3 mailing_list.py data_pelanggan.csv
    ```
4.  Hasil PDF akan muncul di folder `output/`.

## Fitur
- Kop Surat resmi Perumdam Tirtatarum Karawang.
- Format surat profesional.
- Penamaan file otomatis berdasarkan nomor pelanggan.
