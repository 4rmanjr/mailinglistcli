<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit;
}

$db_file = __DIR__ . '/database.sqlite';
try {
    $pdo = new PDO("sqlite:" . $db_file);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);

    // Create table if not exists with updated schema
    $pdo->exec("CREATE TABLE IF NOT EXISTS customers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        no_pelanggan TEXT,
        nama TEXT,
        alamat TEXT,
        kota TEXT,
        kode_pos TEXT,
        telepon TEXT,
        email TEXT,
        status TEXT DEFAULT 'active',
        tanggal_penindakan TEXT,
        alasan TEXT,
        total_tunggakan_bulan TEXT,
        total_tagihan TEXT,
        manager_name TEXT,
        cabang TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )");

    // Create letters table
    $pdo->exec("CREATE TABLE IF NOT EXISTS letters (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        customer_id INTEGER,
        customer_nama TEXT,
        nomor TEXT,
        tanggal TEXT,
        perihal TEXT,
        total_tunggakan TEXT,
        total_tagihan INTEGER,
        status TEXT DEFAULT 'sent',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (customer_id) REFERENCES customers(id)
    )");
} catch (PDOException $e) {
    echo json_encode(["success" => false, "error" => $e->getMessage()]);
    exit;
}

// Get request path
$request_uri = $_SERVER['REQUEST_URI'];
$path = parse_url($request_uri, PHP_URL_PATH);
$base_path = '/api';

// Remove base path and get segments
$path_segments = array_values(array_filter(explode('/', str_replace($base_path, '', $path))));
$resource = $path_segments[0] ?? '';
$id = isset($path_segments[1]) && is_numeric($path_segments[1]) ? (int)$path_segments[1] : null;

$method = $_SERVER['REQUEST_METHOD'];

try {
    switch ($resource) {
        case 'stats':
            handleStats($pdo);
            break;
        
        case 'customers':
            handleCustomers($pdo, $method, $id);
            break;
        
        case 'letters':
            handleLetters($pdo, $method, $id);
            break;
        
        default:
            sendResponse(["success" => false, "error" => "Resource not found"], 404);
    }
} catch (Exception $e) {
    sendResponse(["success" => false, "error" => $e->getMessage()], 500);
}

function handleStats($pdo) {
    // Total customers
    $stmt = $pdo->query("SELECT COUNT(*) as count FROM customers");
    $total = $stmt->fetch()['count'];
    
    // Active customers
    $stmt = $pdo->query("SELECT COUNT(*) as count FROM customers WHERE status = 'active'");
    $active = $stmt->fetch()['count'];
    
    // Inactive customers
    $inactive = $total - $active;
    
    // Total letters
    $stmt = $pdo->query("SELECT COUNT(*) as count FROM letters");
    $letters = $stmt->fetch()['count'];
    
    sendResponse([
        "success" => true,
        "data" => [
            "total_customers" => (int)$total,
            "active_customers" => (int)$active,
            "inactive_customers" => (int)$inactive,
            "total_letters" => (int)$letters
        ]
    ]);
}

function handleCustomers($pdo, $method, $id = null) {
    switch ($method) {
        case 'GET':
            if ($id) {
                $stmt = $pdo->prepare("SELECT * FROM customers WHERE id = ?");
                $stmt->execute([$id]);
                $customer = $stmt->fetch();
                if ($customer) {
                    sendResponse(["success" => true, "data" => $customer]);
                } else {
                    sendResponse(["success" => false, "error" => "Customer not found"], 404);
                }
            } else {
                $stmt = $pdo->query("SELECT * FROM customers ORDER BY created_at DESC");
                sendResponse(["success" => true, "data" => $stmt->fetchAll()]);
            }
            break;
        
        case 'POST':
            $data = json_decode(file_get_contents("php://input"), true);
            
            $stmt = $pdo->prepare("INSERT INTO customers 
                (nama, alamat, kota, kode_pos, telepon, email, status, no_pelanggan)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
            
            $no_pelanggan = generateNoPelanggan($pdo);
            
            $stmt->execute([
                $data['nama'],
                $data['alamat'] ?? '',
                $data['kota'] ?? '',
                $data['kode_pos'] ?? '',
                $data['telepon'] ?? '',
                $data['email'] ?? '',
                $data['status'] ?? 'active',
                $no_pelanggan
            ]);
            
            $new_id = $pdo->lastInsertId();
            $stmt = $pdo->prepare("SELECT * FROM customers WHERE id = ?");
            $stmt->execute([$new_id]);
            sendResponse(["success" => true, "data" => $stmt->fetch()], 201);
            break;
        
        case 'PUT':
            if (!$id) {
                sendResponse(["success" => false, "error" => "ID required"], 400);
                return;
            }
            
            $data = json_decode(file_get_contents("php://input"), true);
            $fields = [];
            $values = [];
            
            $allowed_fields = ['nama', 'alamat', 'kota', 'kode_pos', 'telepon', 'email', 'status'];
            foreach ($allowed_fields as $field) {
                if (isset($data[$field])) {
                    $fields[] = "$field = ?";
                    $values[] = $data[$field];
                }
            }
            
            if (empty($fields)) {
                sendResponse(["success" => false, "error" => "No fields to update"], 400);
                return;
            }
            
            $values[] = $id;
            $sql = "UPDATE customers SET " . implode(', ', $fields) . " WHERE id = ?";
            $stmt = $pdo->prepare($sql);
            $stmt->execute($values);
            
            $stmt = $pdo->prepare("SELECT * FROM customers WHERE id = ?");
            $stmt->execute([$id]);
            sendResponse(["success" => true, "data" => $stmt->fetch()]);
            break;
        
        case 'DELETE':
            if (!$id) {
                sendResponse(["success" => false, "error" => "ID required"], 400);
                return;
            }
            
            $stmt = $pdo->prepare("DELETE FROM customers WHERE id = ?");
            $stmt->execute([$id]);
            sendResponse(["success" => true, "message" => "Customer deleted"]);
            break;
        
        default:
            sendResponse(["success" => false, "error" => "Method not allowed"], 405);
    }
}

function handleLetters($pdo, $method, $id = null) {
    switch ($method) {
        case 'GET':
            if ($id) {
                $stmt = $pdo->prepare("SELECT * FROM letters WHERE id = ?");
                $stmt->execute([$id]);
                $letter = $stmt->fetch();
                if ($letter) {
                    sendResponse(["success" => true, "data" => $letter]);
                } else {
                    sendResponse(["success" => false, "error" => "Letter not found"], 404);
                }
            } else {
                $stmt = $pdo->query("SELECT * FROM letters ORDER BY created_at DESC");
                sendResponse(["success" => true, "data" => $stmt->fetchAll()]);
            }
            break;
        
        case 'POST':
            $data = json_decode(file_get_contents("php://input"), true);
            
            $stmt = $pdo->prepare("INSERT INTO letters 
                (customer_id, customer_nama, nomor, tanggal, perihal, total_tunggakan, total_tagihan, status)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
            
            $stmt->execute([
                $data['customer_id'],
                $data['customer_nama'] ?? '',
                $data['nomor'] ?? '',
                $data['tanggal'] ?? date('Y-m-d'),
                $data['perihal'] ?? 'Surat Penyegelan',
                $data['total_tunggakan'] ?? '',
                $data['total_tagihan'] ?? 0,
                $data['status'] ?? 'sent'
            ]);
            
            $new_id = $pdo->lastInsertId();
            sendResponse(["success" => true, "data" => ["id" => (string)$new_id]], 201);
            break;
        
        case 'DELETE':
            if (!$id) {
                sendResponse(["success" => false, "error" => "ID required"], 400);
                return;
            }
            
            $stmt = $pdo->prepare("DELETE FROM letters WHERE id = ?");
            $stmt->execute([$id]);
            sendResponse(["success" => true, "message" => "Letter deleted"]);
            break;
        
        default:
            sendResponse(["success" => false, "error" => "Method not allowed"], 405);
    }
}

function generateNoPelanggan($pdo) {
    $stmt = $pdo->query("SELECT no_pelanggan FROM customers ORDER BY id DESC LIMIT 1");
    $last = $stmt->fetch();
    
    if ($last && $last['no_pelanggan']) {
        $num = (int)substr($last['no_pelanggan'], -4) + 1;
    } else {
        $num = 1;
    }
    
    return 'CUST' . str_pad($num, 4, '0', STR_PAD_LEFT);
}

function sendResponse($data, $status_code = 200) {
    http_response_code($status_code);
    echo json_encode($data);
    exit;
}
