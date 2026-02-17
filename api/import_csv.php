<?php
$db_file = __DIR__ . '/database.sqlite';
$csv_file = __DIR__ . '/../data_pelanggan.csv';

if (!file_exists($csv_file)) {
    die("File CSV tidak ditemukan.
");
}

try {
    $pdo = new PDO("sqlite:" . $db_file);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // Create table if not exists
    $pdo->exec("CREATE TABLE IF NOT EXISTS customers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        no_pelanggan TEXT UNIQUE,
        nama TEXT,
        alamat TEXT,
        tanggal_penindakan TEXT,
        alasan TEXT,
        total_tunggakan_bulan TEXT,
        total_tagihan TEXT,
        manager_name TEXT,
        cabang TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )");

    $file = fopen($csv_file, 'r');
    $header = fgetcsv($file); // Skip header

    $stmt = $pdo->prepare("INSERT OR REPLACE INTO customers 
        (no_pelanggan, nama, alamat, tanggal_penindakan, alasan, total_tunggakan_bulan, total_tagihan, manager_name, cabang) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)");

    $count = 0;
    while (($row = fgetcsv($file)) !== FALSE) {
        $stmt->execute($row);
        $count++;
    }

    fclose($file);
    echo "Berhasil mengimpor $count data ke SQLite.
";

} catch (PDOException $e) {
    echo "Error: " . $e->getMessage() . "
";
}
