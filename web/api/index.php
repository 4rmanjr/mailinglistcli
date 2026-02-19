<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$dbPath = __DIR__ . '/../penyegelan_pencabutan.db';
$masterDbPath = __DIR__ . '/../db/master.db';
$spkInputDbPath = __DIR__ . '/../db/spk_input.db';

try {
    $pdo = new PDO('sqlite:' . $dbPath);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
    
    $masterPdo = new PDO('sqlite:' . $masterDbPath);
    $masterPdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $masterPdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
    
    $spkInputPdo = new PDO('sqlite:' . $spkInputDbPath);
    $spkInputPdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $spkInputPdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
    
    $spkInputPdo->exec("CREATE TABLE IF NOT EXISTS spk_penyegelan (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        no_pel TEXT NOT NULL,
        nama TEXT,
        alamat TEXT,
        jumlah_bln INTEGER DEFAULT 0,
        jumlah REAL DEFAULT 0,
        ket TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    )");
    
    $spkInputPdo->exec("CREATE TABLE IF NOT EXISTS spk_pencabutan (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        no_samb TEXT NOT NULL,
        nama TEXT,
        alamat TEXT,
        total_tunggakan INTEGER DEFAULT 0,
        jumlah_tunggakan REAL DEFAULT 0,
        ket TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    )");
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Database connection failed: ' . $e->getMessage()]);
    exit;
}

$requestUri = $_SERVER['REQUEST_URI'];
$path = parse_url($requestUri, PHP_URL_PATH);
$path = str_replace('/api/', '', $path);
$segments = explode('/', trim($path, '/'));
$endpoint = $segments[0] ?? '';
$id = $segments[1] ?? null;
$method = $_SERVER['REQUEST_METHOD'];

function sendResponse($data, $success = true, $statusCode = 200) {
    http_response_code($statusCode);
    echo json_encode(['success' => $success, 'data' => $data]);
    exit;
}

function sendError($message, $statusCode = 400) {
    http_response_code($statusCode);
    echo json_encode(['success' => false, 'error' => $message]);
    exit;
}

switch ($endpoint) {
    case 'stats':
        if ($method === 'GET') {
            // Get stats from penyegelan and pencabutan
            $penyegelanCount = $pdo->query("SELECT COUNT(*) as count FROM penyegelan")->fetch()['count'];
            $pencabutanCount = $pdo->query("SELECT COUNT(*) as count FROM pencabutan")->fetch()['count'];
            
            // Get stats by KET (keterangan)
            $penyegelanByKet = $pdo->query("SELECT KET, COUNT(*) as count FROM penyegelan GROUP BY KET")->fetchAll();
            $pencabutanByKet = $pdo->query("SELECT KET, COUNT(*) as count FROM pencabutan GROUP BY KET")->fetchAll();
            
            // Calculate total tunggakan
            $totalTunggakanPenyegelan = $pdo->query("SELECT SUM(JUMLAH) as total FROM penyegelan")->fetch()['total'] ?? 0;
            $totalTunggakanPencabutan = $pdo->query("SELECT SUM([JUMLAH TUNGGAKAN (Rp)]) as total FROM pencabutan")->fetch()['total'] ?? 0;
            
            sendResponse([
                'total_penyegelan' => (int)$penyegelanCount,
                'total_pencabutan' => (int)$pencabutanCount,
                'total_all' => (int)($penyegelanCount + $pencabutanCount),
                'penyegelan_by_ket' => $penyegelanByKet,
                'pencabutan_by_ket' => $pencabutanByKet,
                'total_tunggakan_penyegelan' => (float)$totalTunggakanPenyegelan,
                'total_tunggakan_pencabutan' => (float)$totalTunggakanPencabutan,
                'total_tunggakan_all' => (float)($totalTunggakanPenyegelan + $totalTunggakanPencabutan),
            ]);
        }
        break;
        
    case 'penyegelan':
        if ($method === 'GET') {
            if ($id) {
                $stmt = $pdo->prepare("SELECT * FROM penyegelan WHERE rowid = ?");
                $stmt->execute([$id]);
                $data = $stmt->fetch();
                if ($data) {
                    sendResponse($data);
                } else {
                    sendError('Data not found', 404);
                }
            } else {
                // Get all with optional search
                $search = $_GET['search'] ?? '';
                $ket = $_GET['ket'] ?? '';
                
                $sql = "SELECT * FROM penyegelan WHERE 1=1";
                $params = [];
                
                if ($search) {
                    $sql .= " AND (\"NOMOR PELANGGAN\" LIKE ? OR NAMA LIKE ?)";
                    $params[] = "%$search%";
                    $params[] = "%$search%";
                }
                
                if ($ket) {
                    $sql .= " AND KET = ?";
                    $params[] = $ket;
                }
                
                $sql .= " ORDER BY TANGGAL DESC";
                
                $stmt = $pdo->prepare($sql);
                $stmt->execute($params);
                $data = $stmt->fetchAll();
                sendResponse($data);
            }
        } elseif ($method === 'PUT' && $id) {
            $input = json_decode(file_get_contents('php://input'), true);
            $allowedFields = ['NO.', 'TANGGAL', 'NOMOR PELANGGAN', 'NAMA', 'JUMLAH BLN', 'TOTAL REK', 'DENDA', 'JUMLAH', 'KET'];
            
            $fields = [];
            $values = [];
            foreach ($input as $key => $value) {
                if (in_array($key, $allowedFields)) {
                    $fields[] = "\"$key\" = ?";
                    $values[] = $value;
                }
            }
            
            if (empty($fields)) {
                sendError('No valid fields to update');
            }
            
            $values[] = $id;
            $sql = "UPDATE penyegelan SET " . implode(', ', $fields) . " WHERE rowid = ?";
            $stmt = $pdo->prepare($sql);
            $stmt->execute($values);
            
            sendResponse(['updated' => true]);
        }
        break;
        
    case 'pencabutan':
        if ($method === 'GET') {
            if ($id) {
                $stmt = $pdo->prepare("SELECT * FROM pencabutan WHERE rowid = ?");
                $stmt->execute([$id]);
                $data = $stmt->fetch();
                if ($data) {
                    sendResponse($data);
                } else {
                    sendError('Data not found', 404);
                }
            } else {
                // Get all with optional search
                $search = $_GET['search'] ?? '';
                $ket = $_GET['ket'] ?? '';
                
                $sql = "SELECT * FROM pencabutan WHERE 1=1";
                $params = [];
                
                if ($search) {
                    $sql .= " AND (\"NO SAMB\" LIKE ? OR NAMA LIKE ?)";
                    $params[] = "%$search%";
                    $params[] = "%$search%";
                }
                
                if ($ket) {
                    $sql .= " AND KET = ?";
                    $params[] = $ket;
                }
                
                $sql .= " ORDER BY NO";
                
                $stmt = $pdo->prepare($sql);
                $stmt->execute($params);
                $data = $stmt->fetchAll();
                sendResponse($data);
            }
        } elseif ($method === 'PUT' && $id) {
            $input = json_decode(file_get_contents('php://input'), true);
            $allowedFields = ['NO', 'NO SAMB', 'NAMA', 'ALAMAT', 'TOTAL TUNGGAKAN', 'JUMLAH TUNGGAKAN (Rp)', 'KET'];
            
            $fields = [];
            $values = [];
            foreach ($input as $key => $value) {
                if (in_array($key, $allowedFields)) {
                    $fields[] = "\"$key\" = ?";
                    $values[] = $value;
                }
            }
            
            if (empty($fields)) {
                sendError('No valid fields to update');
            }
            
            $values[] = $id;
            $sql = "UPDATE pencabutan SET " . implode(', ', $fields) . " WHERE rowid = ?";
            $stmt = $pdo->prepare($sql);
            $stmt->execute($values);
            
            sendResponse(['updated' => true]);
        }
        break;
        
    case 'generate-spk':
        if ($method === 'POST') {
            $input = json_decode(file_get_contents('php://input'), true);
            $type = $input['type'] ?? '';
            $ids = $input['ids'] ?? [];
            
            if (!in_array($type, ['penyegelan', 'pencabutan'])) {
                sendError('Invalid type');
            }
            
            if (empty($ids)) {
                sendError('No IDs provided');
            }
            
            $table = $type;
            $placeholders = implode(',', array_fill(0, count($ids), '?'));
            $stmt = $pdo->prepare("SELECT * FROM $table WHERE rowid IN ($placeholders)");
            $stmt->execute($ids);
            $data = $stmt->fetchAll();
            
            $year = date('Y');
            $spkList = [];
            foreach ($data as $index => $item) {
                $spkNumber = sprintf("SPK/%s/%s/%04d", strtoupper($type), $year, $index + 1);
                $spkList[] = [
                    'spk_number' => $spkNumber,
                    'data' => $item,
                    'type' => $type,
                    'generated_at' => date('Y-m-d H:i:s')
                ];
            }
            
            sendResponse(['spk_list' => $spkList, 'total' => count($spkList)]);
        }
        break;
        
    case 'master-customer':
        if ($method === 'GET') {
            $search = $_GET['search'] ?? '';
            $noPel = $_GET['no_pel'] ?? '';
            
            if ($noPel) {
                $stmt = $masterPdo->prepare("SELECT * FROM lapdatabacameter WHERE \"No_Pel\" = ?");
                $stmt->execute([$noPel]);
                $data = $stmt->fetch();
                if ($data) {
                    sendResponse($data);
                } else {
                    sendError('Customer not found', 404);
                }
            } else if ($search) {
                $stmt = $masterPdo->prepare("SELECT * FROM lapdatabacameter WHERE \"No_Pel\" LIKE ? OR Nama LIKE ? LIMIT 50");
                $stmt->execute(["%$search%", "%$search%"]);
                $data = $stmt->fetchAll();
                sendResponse($data);
            } else {
                $stmt = $masterPdo->query("SELECT * FROM lapdatabacameter LIMIT 100");
                $data = $stmt->fetchAll();
                sendResponse($data);
            }
        }
        break;
        
    case 'spk-penyegelan':
        if ($method === 'GET') {
            $search = $_GET['search'] ?? '';
            $ket = $_GET['ket'] ?? '';
            
            $sql = "SELECT id, no_pel, nama, alamat, jumlah_bln, jumlah, ket, created_at, updated_at FROM spk_penyegelan WHERE 1=1";
            $params = [];
            
            if ($search) {
                $sql .= " AND (no_pel LIKE ? OR nama LIKE ?)";
                $params[] = "%$search%";
                $params[] = "%$search%";
            }
            
            if ($ket) {
                $sql .= " AND ket = ?";
                $params[] = $ket;
            }
            
            $sql .= " ORDER BY created_at DESC";
            
            $stmt = $spkInputPdo->prepare($sql);
            $stmt->execute($params);
            $data = $stmt->fetchAll();
            sendResponse($data);
        } elseif ($method === 'POST') {
            $input = json_decode(file_get_contents('php://input'), true);
            
            $stmt = $spkInputPdo->prepare("INSERT INTO spk_penyegelan (no_pel, nama, alamat, jumlah_bln, jumlah, ket) VALUES (?, ?, ?, ?, ?, ?)");
            $stmt->execute([
                $input['no_pel'] ?? '',
                $input['nama'] ?? '',
                $input['alamat'] ?? '',
                $input['jumlah_bln'] ?? 0,
                $input['jumlah'] ?? 0,
                $input['ket'] ?? ''
            ]);
            
            $id = $spkInputPdo->lastInsertId();
            $stmt = $spkInputPdo->prepare("SELECT * FROM spk_penyegelan WHERE id = ?");
            $stmt->execute([$id]);
            $data = $stmt->fetch();
            sendResponse($data);
        } elseif ($method === 'PUT' && $id) {
            $input = json_decode(file_get_contents('php://input'), true);
            
            $stmt = $spkInputPdo->prepare("UPDATE spk_penyegelan SET no_pel = ?, nama = ?, alamat = ?, jumlah_bln = ?, jumlah = ?, ket = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?");
            $stmt->execute([
                $input['no_pel'] ?? '',
                $input['nama'] ?? '',
                $input['alamat'] ?? '',
                $input['jumlah_bln'] ?? 0,
                $input['jumlah'] ?? 0,
                $input['ket'] ?? '',
                $id
            ]);
            
            $stmt = $spkInputPdo->prepare("SELECT * FROM spk_penyegelan WHERE id = ?");
            $stmt->execute([$id]);
            $data = $stmt->fetch();
            sendResponse($data);
        } elseif ($method === 'DELETE' && $id) {
            $stmt = $spkInputPdo->prepare("DELETE FROM spk_penyegelan WHERE id = ?");
            $stmt->execute([$id]);
            sendResponse(['deleted' => true]);
        }
        break;
        
    case 'spk-pencabutan':
        if ($method === 'GET') {
            $search = $_GET['search'] ?? '';
            $ket = $_GET['ket'] ?? '';
            
            $sql = "SELECT id, no_samb, nama, alamat, total_tunggakan, jumlah_tunggakan, ket, created_at, updated_at FROM spk_pencabutan WHERE 1=1";
            $params = [];
            
            if ($search) {
                $sql .= " AND (no_samb LIKE ? OR nama LIKE ?)";
                $params[] = "%$search%";
                $params[] = "%$search%";
            }
            
            if ($ket) {
                $sql .= " AND ket = ?";
                $params[] = $ket;
            }
            
            $sql .= " ORDER BY created_at DESC";
            
            $stmt = $spkInputPdo->prepare($sql);
            $stmt->execute($params);
            $data = $stmt->fetchAll();
            sendResponse($data);
        } elseif ($method === 'POST') {
            $input = json_decode(file_get_contents('php://input'), true);
            
            $stmt = $spkInputPdo->prepare("INSERT INTO spk_pencabutan (no_samb, nama, alamat, total_tunggakan, jumlah_tunggakan, ket) VALUES (?, ?, ?, ?, ?, ?)");
            $stmt->execute([
                $input['no_samb'] ?? '',
                $input['nama'] ?? '',
                $input['alamat'] ?? '',
                $input['total_tunggakan'] ?? 0,
                $input['jumlah_tunggakan'] ?? 0,
                $input['ket'] ?? ''
            ]);
            
            $id = $spkInputPdo->lastInsertId();
            $stmt = $spkInputPdo->prepare("SELECT * FROM spk_pencabutan WHERE id = ?");
            $stmt->execute([$id]);
            $data = $stmt->fetch();
            sendResponse($data);
        } elseif ($method === 'PUT' && $id) {
            $input = json_decode(file_get_contents('php://input'), true);
            
            $stmt = $spkInputPdo->prepare("UPDATE spk_pencabutan SET no_samb = ?, nama = ?, alamat = ?, total_tunggakan = ?, jumlah_tunggakan = ?, ket = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?");
            $stmt->execute([
                $input['no_samb'] ?? '',
                $input['nama'] ?? '',
                $input['alamat'] ?? '',
                $input['total_tunggakan'] ?? 0,
                $input['jumlah_tunggakan'] ?? 0,
                $input['ket'] ?? '',
                $id
            ]);
            
            $stmt = $spkInputPdo->prepare("SELECT * FROM spk_pencabutan WHERE id = ?");
            $stmt->execute([$id]);
            $data = $stmt->fetch();
            sendResponse($data);
        } elseif ($method === 'DELETE' && $id) {
            $stmt = $spkInputPdo->prepare("DELETE FROM spk_pencabutan WHERE id = ?");
            $stmt->execute([$id]);
            sendResponse(['deleted' => true]);
        }
        break;
        
    default:
        sendError('Endpoint not found', 404);
}

sendError('Method not allowed', 405);
