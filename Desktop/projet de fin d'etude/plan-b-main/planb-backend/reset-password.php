<?php
// Script pour réinitialiser le mot de passe admin
require __DIR__ . '/vendor/autoload.php';

use Doctrine\DBAL\DriverManager;

$connectionParams = [
    'dbname' => 'planb',
    'user' => 'postgres',
    'password' => 'postgres',
    'host' => 'database',
    'driver' => 'pdo_pgsql',
];

$conn = DriverManager::getConnection($connectionParams);

$hash = password_hash('Admin123!', PASSWORD_BCRYPT, ['cost' => 12]);
echo "New hash: " . $hash . "\n";

$sql = "UPDATE users SET password = ? WHERE email = ?";
$stmt = $conn->prepare($sql);
$result = $stmt->executeStatement([$hash, 'admin@planb.ci']);

echo "Updated rows: " . $result . "\n";

// Vérifier
$sql2 = "SELECT email, password FROM users WHERE email = 'admin@planb.ci'";
$user = $conn->fetchAssociative($sql2);
echo "Verification - Email: " . $user['email'] . "\n";
echo "Password starts with: " . substr($user['password'], 0, 20) . "...\n";
