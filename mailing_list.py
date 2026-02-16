import csv
import os
import sys
from reportlab.lib.pagesizes import A4, landscape
from reportlab.pdfgen import canvas
from reportlab.lib.units import cm

def draw_spk(c, data, x_offset, width_half, height):
    margin = 1.2 * cm
    line_y = height - 3.5 * cm
    
    # --- Header ---
    c.setFont("Helvetica", 10)
    c.drawCentredString(x_offset + width_half/2 + 1*cm, height - 1.5*cm, "PERUSAHAAN UMUM DAERAH AIR MINUM")
    c.setFont("Helvetica-Bold", 11)
    c.drawCentredString(x_offset + width_half/2 + 1*cm, height - 2.0*cm, "TIRTA TARUM KABUPATEN KARAWANG")
    c.setFont("Helvetica", 9)
    c.drawCentredString(x_offset + width_half/2 + 1*cm, height - 2.5*cm, "Jl. Surotokunto No.205 Karawang Timur")
    
    # Placeholder for Logo (Box on the left of header)
    c.rect(x_offset + margin, height - 2.8*cm, 1.5*cm, 1.5*cm)
    c.setFont("Helvetica-Bold", 6)
    c.drawCentredString(x_offset + margin + 0.75*cm, height - 2.2*cm, "LOGO")
    c.drawCentredString(x_offset + margin + 0.75*cm, height - 2.5*cm, "TIRTA TARUM")

    # Thick Line
    c.setLineWidth(1.5)
    c.line(x_offset + margin, line_y, x_offset + width_half - margin, line_y)

    # --- Title & Nomor ---
    c.setFont("Helvetica-Bold", 10)
    c.drawCentredString(x_offset + width_half/2, line_y - 1*cm, "SURAT PERINTAH KERJA PENYEGELAN")
    c.setFont("Helvetica", 10)
    c.drawCentredString(x_offset + width_half/2, line_y - 1.5*cm, "Nomor : …../…../SPK/2026")

    # --- Sender/Recipient ---
    c.setFont("Helvetica", 10)
    curr_y = line_y - 2.5*cm
    c.drawString(x_offset + margin, curr_y, f"Dari           : Manager {data['cabang']}")
    curr_y -= 0.5*cm
    c.drawString(x_offset + margin, curr_y, "Untuk        : Distribusi")
    
    curr_y -= 1*cm
    c.drawString(x_offset + margin, curr_y, "Untuk melaksanakan pekerjaan PENYEGELAN sambungan pelanggan")
    curr_y -= 0.45*cm
    c.drawString(x_offset + margin, curr_y, "sebagaimana data dibawah ini")

    # --- Data Pelanggan ---
    curr_y -= 1*cm
    c.drawString(x_offset + margin + 1*cm, curr_y, f"No pelanggan  : {data['no_pelanggan']}")
    curr_y -= 0.5*cm
    c.drawString(x_offset + margin + 1*cm, curr_y, f"Nama               : {data['nama']}")
    
    curr_y -= 1*cm
    c.drawString(x_offset + margin + 1*cm, curr_y, "Rincian tunggakan air / Non air")
    curr_y -= 0.8*cm
    c.drawString(x_offset + margin + 1*cm, curr_y, f"Total Tunggakan      : {data['total_tunggakan_bulan']} Bulan")
    curr_y -= 0.5*cm
    c.drawString(x_offset + margin + 1*cm, curr_y, f"Total tagihan             : Rp.{data['total_tagihan']}")

    curr_y -= 1.2*cm
    c.drawString(x_offset + margin, curr_y, "Demikian untuk dilaksanakan dengan penuh tanggung jawab dan dengan semestinya")

    # --- Signatures ---
    curr_y -= 1.5*cm
    c.drawCentredString(x_offset + margin + 3*cm, curr_y, "Tanda tangan Pelanggan")
    c.drawCentredString(x_offset + width_half - margin - 3*cm, curr_y, f"Manager Cabang {data['cabang']}")
    
    curr_y -= 2*cm
    c.drawCentredString(x_offset + margin + 3*cm, curr_y, "(…………………………..)")
    c.setFont("Helvetica-Bold", 10)
    c.drawCentredString(x_offset + width_half - margin - 3*cm, curr_y, data['manager_name'])

    # --- Technical Data (Bottom) ---
    c.setFont("Helvetica", 9)
    tech_y = curr_y - 1.5*cm
    c.drawString(x_offset + margin, tech_y, "Merk Meter")
    c.drawString(x_offset + margin + 3.5*cm, tech_y, ":")
    c.drawRightString(x_offset + width_half - margin, tech_y, "Tanda tangan Petugas")
    
    tech_y -= 0.45*cm
    c.drawString(x_offset + margin, tech_y, "No Meter")
    c.drawString(x_offset + margin + 3.5*cm, tech_y, ":")
    
    tech_y -= 0.45*cm
    c.drawString(x_offset + margin, tech_y, "Stand Meter Segel")
    c.drawString(x_offset + margin + 3.5*cm, tech_y, ":")
    
    tech_y -= 0.45*cm
    c.drawString(x_offset + margin, tech_y, "No Segel")
    c.drawString(x_offset + margin + 3.5*cm, tech_y, ":")
    
    tech_y -= 0.45*cm
    c.drawString(x_offset + margin, tech_y, "Digit Meter")
    c.drawString(x_offset + margin + 3.5*cm, tech_y, ":")
    c.drawRightString(x_offset + width_half - margin, tech_y - 0.5*cm, "(...................................)")

def create_pdf(data, output_path):
    c = canvas.Canvas(output_path, pagesize=landscape(A4))
    width, height = landscape(A4)
    width_half = width / 2

    # Draw Left Side
    draw_spk(c, data, 0, width_half, height)
    
    # Vertical Divider Line
    c.setDash(3, 3)
    c.setLineWidth(0.5)
    c.line(width_half, 0.5*cm, width_half, height - 0.5*cm)
    c.setDash(1, 0)
    
    # Draw Right Side
    draw_spk(c, data, width_half, width_half, height)

    c.save()



def load_data(csv_file):
    data = []
    try:
        with open(csv_file, mode='r', encoding='utf-8') as file:
            reader = csv.DictReader(file)
            for row in reader:
                data.append(row)
    except FileNotFoundError:
        print(f"Error: File '{csv_file}' not found.")
    return data

def save_data(csv_file, data):
    if not data:
        return
    fieldnames = data[0].keys()
    with open(csv_file, mode='w', encoding='utf-8', newline='') as file:
        writer = csv.DictWriter(file, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(data)

def generate_all(data, output_dir):
    if not os.path.exists(output_dir):
        os.makedirs(output_dir)
    
    count = 0
    for row in data:
        filename = f"Surat_Penyegelan_{row['no_pelanggan']}.pdf"
        output_path = os.path.join(output_dir, filename)
        create_pdf(row, output_path)
        print(f"Generated: {output_path}")
        count += 1
    return count

def interactive_mode():
    csv_file = "data_pelanggan.csv"
    output_dir = "output"
    data = load_data(csv_file)
    
    while True:
        print("\n--- Mailing List Interactive Mode ---")
        print("1. Lihat Daftar Pelanggan")
        print("2. Tambah Pelanggan Baru")
        print("3. Cetak PDF Semua Pelanggan")
        print("4. Cetak PDF Per Pelanggan")
        print("5. Simpan Perubahan ke CSV")
        print("q. Keluar")
        
        choice = input("\nPilih menu (1-5/q): ").strip().lower()
        
        if choice == '1':
            if not data:
                print("Data kosong.")
            else:
                print(f"{'No Pelanggan':<15} | {'Nama':<25} | {'Cabang':<15}")
                print("-" * 60)
                for i, row in enumerate(data):
                    print(f"{row['no_pelanggan']:<15} | {row['nama']:<25} | {row['cabang']:<15}")
        
        elif choice == '2':
            new_row = {}
            new_row['no_pelanggan'] = input("No Pelanggan: ")
            new_row['nama'] = input("Nama: ")
            new_row['alamat'] = input("Alamat: ")
            new_row['tanggal_penindakan'] = input("Tanggal Penindakan (YYYY-MM-DD): ")
            new_row['alasan'] = input("Alasan: ")
            new_row['total_tunggakan_bulan'] = input("Total Tunggakan (Bulan): ")
            new_row['total_tagihan'] = input("Total Tagihan (Rp): ")
            new_row['manager_name'] = input("Nama Manager: ")
            new_row['cabang'] = input("Cabang: ")
            data.append(new_row)
            print("Pelanggan ditambahkan (jangan lupa simpan ke CSV).")
            
        elif choice == '3':
            count = generate_all(data, output_dir)
            print(f"\nBerhasil mencetak {count} PDF.")
            
        elif choice == '4':
            no_pel = input("Masukkan No Pelanggan yang ingin dicetak: ")
            target = next((item for item in data if item["no_pelanggan"] == no_pel), None)
            if target:
                if not os.path.exists(output_dir):
                    os.makedirs(output_dir)
                filename = f"Surat_Penyegelan_{target['no_pelanggan']}.pdf"
                output_path = os.path.join(output_dir, filename)
                create_pdf(target, output_path)
                print(f"Generated: {output_path}")
            else:
                print("Pelanggan tidak ditemukan.")
                
        elif choice == '5':
            save_data(csv_file, data)
            print(f"Data disimpan ke {csv_file}")
            
        elif choice == 'q':
            break
        else:
            print("Pilihan tidak valid.")

def main():
    if len(sys.argv) > 1:
        csv_file = sys.argv[1]
        output_dir = "output"
        data = load_data(csv_file)
        if data:
            count = generate_all(data, output_dir)
            print(f"\nSuccessfully generated {count} PDF files in '{output_dir}/' folder.")
    else:
        interactive_mode()

if __name__ == "__main__":
    main()
