# SPK Management - Perumdam Tirtatarum Karawang

Aplikasi CLI sederhana berbasis Python untuk membuat surat perintah kerja (SPK) penyegelan dan pencabutan pelanggan secara massal dalam format PDF profesional.

## Persyaratan
- Python 3.x
- Library `reportlab` (sudah terinstall di lingkungan ini)

## Cara Penggunaan
1.  Siapkan data pelanggan dalam format Excel (`.xlsx`) dengan dua sheet: `PENYEGELAN` dan `PENCABUTAN`.
2.  Pastikan kolom-kolom berikut ada di setiap sheet:
    - `no_pelanggan`
    - `nama`
    - `cabang`
    - `total_tunggakan_bulan`
    - `total_tagihan`
    - `manager_name`
3.  Jalankan perintah berikut:
    ```bash
    python3 spk_management.py "PENYEGELAN & PENCABUTAN JAN 26.xlsx"
    ```
4.  Hasil PDF akan muncul di folder `output/` sebagai `Laporan_PENYEGELAN.pdf` dan `Laporan_PENCABUTAN.pdf`.

## Fitur Baru
- **Grouped PDF**: Menghasilkan satu PDF per kategori (Penyegelan/Pencabutan) yang berisi semua pelanggan terkait.
- **Excel Support**: Mendukung pembacaan data langsung dari file Excel.
- **Dynamic Title**: Judul surat menyesuaikan secara otomatis berdasarkan nama sheet.
