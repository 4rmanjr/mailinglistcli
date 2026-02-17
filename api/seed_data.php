<?php
$db_file = __DIR__ . '/database.sqlite';

try {
    $pdo = new PDO("sqlite:" . $db_file);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    $stmt = $pdo->prepare("INSERT OR REPLACE INTO customers 
        (no_pelanggan, nama, alamat, tanggal_penindakan, alasan, total_tunggakan_bulan, total_tagihan, manager_name, cabang) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)");

    $cabang_list = ['Kotabaru', 'Cikampek', 'Karawang Barat', 'Telukjambe', 'Klari'];
    $alasan_list = ['Tunggakan Air', 'Pelanggaran Segel', 'Non Aktif'];
    $manager_list = ['Endang Komara', 'Budi Santoso', 'Siti Aminah'];

    $pdo->beginTransaction();
    
    for ($i = 1; $i <= 100; $i++) {
        $no_pelanggan = "0611" . str_pad($i, 6, "0", STR_PAD_LEFT);
        $nama = "Pelanggan Dummy #" . $i;
        $alamat = "Jl. Contoh No. " . $i . ", Karawang";
        $tgl = date('Y-m-d');
        $alasan = $alasan_list[array_rand($alasan_list)];
        $tunggakan = rand(2, 12);
        $tagihan = $tunggakan * rand(50000, 150000);
        $manager = $manager_list[array_rand($manager_list)];
        $cabang = $cabang_list[array_rand($cabang_list)];

        $stmt->execute([
            $no_pelanggan, $nama, $alamat, $tgl, $alasan, 
            (string)$tunggakan, (string)$tagihan, $manager, $cabang
        ]);
    }

    $pdo->commit();
    echo "Berhasil menambahkan 100 data pelanggan dummy (0611xxxxxx).
";

} catch (PDOException $e) {
    echo "Error: " . $e->getMessage() . "
";
}
