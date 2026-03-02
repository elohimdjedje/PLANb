<?php
// Quick seed script for test data (MySQL/MariaDB compatible)
// Run: php seed_test_data.php

$dotenv_path = __DIR__ . '/.env';
if (file_exists($dotenv_path)) {
    foreach (file($dotenv_path) as $line) {
        $line = trim($line);
        if ($line && !str_starts_with($line, '#') && str_contains($line, '=')) {
            [$k, $v] = explode('=', $line, 2);
            $_ENV[trim($k)] = trim($v);
        }
    }
}

$url = $_ENV['DATABASE_URL'] ?? 'mysql://root:@127.0.0.1:3306/planb';
if (!preg_match('#mysql://([^:]*):([^@]*)@([^:]+):(\d+)/([^?]+)#', $url, $m)) {
    die("Cannot parse DATABASE_URL: $url\n");
}

$dsn = "mysql:host={$m[3]};port={$m[4]};dbname={$m[5]};charset=utf8mb4";
$pdo = new PDO($dsn, $m[1], $m[2], [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]);

echo "Connected to MySQL: {$m[5]}\n";

// Tenant user (password: Admin1234!)
$hash = password_hash('Admin1234!', PASSWORD_BCRYPT);
$stmt = $pdo->prepare("INSERT IGNORE INTO users (email, phone, roles, password, first_name, last_name, account_type, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())");

$stmt->execute(['tenant@planb.com', '+22500000002', '["ROLE_USER"]', $hash, 'Marie', 'Dupont', 'basic']);
echo "Tenant user (tenant@planb.com): " . ($stmt->rowCount() ? "CREATED" : "already exists") . "\n";

$stmt->execute(['owner@planb.com', '+22500000003', '["ROLE_USER"]', $hash, 'Jean', 'Proprietaire', 'PRO']);
echo "Owner user (owner@planb.com): " . ($stmt->rowCount() ? "CREATED" : "already exists") . "\n";

$ownerId = $pdo->query("SELECT id FROM users WHERE email='owner@planb.com'")->fetchColumn();
echo "Owner ID: $ownerId\n";

// Create a test listing
$stmt2 = $pdo->prepare("INSERT IGNORE INTO listings (user_id, title, description, price, currency, category, type, country, city, status, created_at, updated_at, expires_at, views_count, contacts_count) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW(), DATE_ADD(NOW(), INTERVAL 30 DAY), 0, 0)");
$check = $pdo->query("SELECT COUNT(*) FROM listings WHERE user_id=$ownerId")->fetchColumn();
if ($check == 0) {
    $stmt2->execute([$ownerId, 'Appartement 3 pièces - Cocody', 'Bel appartement meublé au coeur de Cocody.', 120000, 'XOF', 'immobilier', 'location', 'CI', 'Abidjan', 'active']);
    echo "Listing: CREATED (id=" . $pdo->lastInsertId() . ")\n";
} else {
    echo "Listing: already exists\n";
}

// Show summary
$users = $pdo->query("SELECT id, email, account_type FROM users")->fetchAll(PDO::FETCH_ASSOC);
echo "\nUsers in DB:\n";
foreach ($users as $u) echo "  [{$u['id']}] {$u['email']} ({$u['account_type']})\n";

$listings = $pdo->query("SELECT id, title, status FROM listings LIMIT 5")->fetchAll(PDO::FETCH_ASSOC);
echo "\nListings in DB:\n";
foreach ($listings as $l) echo "  [{$l['id']}] {$l['title']} ({$l['status']})\n";

echo "\nDone!\n";
