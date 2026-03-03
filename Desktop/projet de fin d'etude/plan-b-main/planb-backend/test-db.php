<?php
// Test connexion PostgreSQL
echo "=== Test Connexion PostgreSQL ===\n";
try {
    $pdo = new PDO('pgsql:host=localhost;port=5432;dbname=planb', 'postgres', 'root');
    echo "✅ Connexion PostgreSQL: OK\n\n";
    
    // Test requête listings
    echo "=== Test Requête Listings ===\n";
    $stmt = $pdo->query("SELECT id, title, description FROM listings LIMIT 2");
    $listings = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode($listings, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
    
} catch (Exception $e) {
    echo "❌ ERREUR: " . $e->getMessage() . "\n";
    echo "Code: " . $e->getCode() . "\n";
}
