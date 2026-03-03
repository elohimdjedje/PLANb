<?php
// Test direct de l'endpoint admin listings

require_once __DIR__ . '/vendor/autoload.php';

use Symfony\Component\Dotenv\Dotenv;

$dotenv = new Dotenv();
$dotenv->loadEnv(__DIR__ . '/.env');

// Connexion directe à la base
$dsn = $_ENV['DATABASE_URL'];

try {
    preg_match('/postgresql:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+)\?/', $dsn, $matches);
    $user = $matches[1] ?? 'postgres';
    $pass = $matches[2] ?? 'root';
    $host = $matches[3] ?? 'localhost';
    $port = $matches[4] ?? '5432';
    $dbname = $matches[5] ?? 'planb';

    $pdo = new PDO("pgsql:host=$host;port=$port;dbname=$dbname", $user, $pass);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    echo "=== Test connexion DB ===\n";
    echo "Connexion OK!\n\n";

    // Test listings
    echo "=== Test SELECT listings ===\n";
    $stmt = $pdo->query("SELECT id, title, status, category FROM listings LIMIT 5");
    $listings = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo "Listings count: " . count($listings) . "\n";
    print_r($listings);

    // Test users
    echo "\n=== Test SELECT users ===\n";
    $stmt = $pdo->query("SELECT id, email, account_type, roles FROM users LIMIT 5");
    $users = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo "Users count: " . count($users) . "\n";
    print_r($users);

    // Vérifier colonnes de la table listings
    echo "\n=== Structure table listings ===\n";
    $stmt = $pdo->query("SELECT column_name FROM information_schema.columns WHERE table_name = 'listings' ORDER BY ordinal_position");
    $columns = $stmt->fetchAll(PDO::FETCH_COLUMN);
    echo "Colonnes: " . implode(', ', $columns) . "\n";

} catch (Exception $e) {
    echo "ERREUR: " . $e->getMessage() . "\n";
}
