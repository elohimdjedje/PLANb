<?php
// Test nombre de listings
$pdo = new PDO('pgsql:host=localhost;port=5432;dbname=planb', 'postgres', 'root');

$tables = [
    'users', 'listings', 'contracts', 'payments', 'notifications'
];

echo "=== État de la Base de Données ===\n";
foreach ($tables as $table) {
    try {
        $stmt = $pdo->query("SELECT COUNT(*) FROM $table");
        $count = $stmt->fetch()[0];
        echo "✅ $table: $count enregistrements\n";
    } catch (Exception $e) {
        echo "❌ $table: " . $e->getMessage() . "\n";
    }
}

echo "\n=== Essai API Listing ===\n";

// Récupère les listings avec Doctrine (comme l'API le fait)
require 'vendor/autoload.php';

$kernel = new \App\Kernel($_ENV['APP_ENV'] ?? 'prod', $_ENV['APP_DEBUG'] ?? false);
$kernel->boot();

$em = $kernel->getContainer()->get('doctrine.orm.entity_manager');
$repo = $em->getRepository('App\Entity\Listing');
$listings = $repo->findBy([], ['created_at' => 'DESC'], 5);

echo "Listings trouvés: " . count($listings) . "\n";
if (count($listings) > 0) {
    echo json_encode($listings[0], JSON_PRETTY_PRINT);
}
