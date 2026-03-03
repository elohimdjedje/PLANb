<?php
$pdo = new PDO('pgsql:host=localhost;port=5432;dbname=planb', 'postgres', 'root');

echo "=== État de la Base de Données ===\n";
$tables = ['users', 'listings', 'contracts', 'payments'];

foreach ($tables as $table) {
    try {
        $stmt = $pdo->query("SELECT COUNT(*) as cnt FROM \"$table\"");
        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        $count = $result['cnt'] ?? 0;
        echo "📊 $table: $count enregistrements\n";
    } catch (Exception $e) {
        echo "❌ $table: Erreur - " . $e->getMessage() . "\n";
    }
}

echo "\n=== Structures des Tables ===\n";
$tables_info = $pdo->query("
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public'
    ORDER BY table_name
")->fetchAll(PDO::FETCH_COLUMN);

echo "Tables disponibles: " . implode(', ', $tables_info) . "\n";
