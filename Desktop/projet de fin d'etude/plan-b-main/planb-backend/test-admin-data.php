<?php
/**
 * Test direct des endpoints admin
 */

require __DIR__ . '/vendor/autoload.php';

use Symfony\Component\Dotenv\Dotenv;

// Charger les variables d'environnement
$dotenv = new Dotenv();
$dotenv->loadEnv(__DIR__ . '/.env');

// Connexion à la base de données
$dsn = $_ENV['DATABASE_URL'];
$matches = [];
preg_match('/postgresql:\/\/([^:]+):([^@]+)@([^:]+):([^\/]+)\/(.+)\?/', $dsn, $matches);

try {
    $pdo = new PDO(
        "pgsql:host={$matches[3]};port={$matches[4]};dbname={$matches[5]}",
        $matches[1],
        $matches[2]
    );
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    echo "=== Test Admin Controller Data ===\n\n";
    
    // Test 1: Lister les utilisateurs
    echo "1. Utilisateurs:\n";
    $stmt = $pdo->query("SELECT id, email, account_type, created_at FROM users ORDER BY created_at DESC LIMIT 10");
    $users = $stmt->fetchAll(PDO::FETCH_ASSOC);
    print_r($users);
    
    // Test 2: Lister les annonces
    echo "\n2. Annonces:\n";
    $stmt = $pdo->query("SELECT id, title, status, created_at FROM listings ORDER BY created_at DESC LIMIT 10");
    $listings = $stmt->fetchAll(PDO::FETCH_ASSOC);
    print_r($listings);
    
    // Test 3: Compter
    echo "\n3. Compteurs:\n";
    $stmt = $pdo->query("SELECT COUNT(*) as total FROM users");
    echo "Total utilisateurs: " . $stmt->fetchColumn() . "\n";
    
    $stmt = $pdo->query("SELECT COUNT(*) as total FROM listings");
    echo "Total annonces: " . $stmt->fetchColumn() . "\n";
    
    echo "\n=== OK - Pas d'erreur DB ===\n";
    
} catch (Exception $e) {
    echo "ERREUR: " . $e->getMessage() . "\n";
    echo $e->getTraceAsString() . "\n";
}
