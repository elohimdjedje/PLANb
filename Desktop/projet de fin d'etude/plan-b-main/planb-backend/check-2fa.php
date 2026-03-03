#!/usr/bin/env php
<?php
// Script pour monitorer les codes 2FA envoyés
require dirname(__FILE__).'/vendor/autoload.php';

use Symfony\Component\Dotenv\Dotenv;

$dotenv = new Dotenv();
$dotenv->loadEnv(dirname(__FILE__).'/.env.local');

// Connexion PostgreSQL
$host = 'localhost';
$port = 5432;
$db = 'planb';
$user = 'postgres';
$password = 'root';

try {
    $conn = new PDO("pgsql:host=$host;port=$port;dbname=$db", $user, $password);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    echo "=== VÉRIFICATION DES CODES 2FA RÉCENTS ===\n\n";
    
    // Rechercher les codes 2FA récents pour test@planb.local
    $stmt = $conn->prepare("
        SELECT 
            tfc.id,
            tfc.code,
            tfc.user_id,
            tfc.created_at,
            tfc.expires_at,
            tfc.is_used,
            u.email,
            u.first_name
        FROM two_factor_codes tfc
        JOIN users u ON tfc.user_id = u.id
        WHERE u.email = :email
        ORDER BY tfc.created_at DESC
        LIMIT 5
    ");
    
    $stmt->execute([':email' => 'test@planb.local']);
    $codes = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    if (count($codes) > 0) {
        echo "✓ Codes 2FA trouvés pour test@planb.local:\n\n";
        foreach ($codes as $code) {
            $isExpired = strtotime($code['expires_at']) < time() ? '❌ EXPIRÉ' : '✓ VALIDE';
            $used = $code['is_used'] ? '(UTILISÉ)' : '';
            echo "Code: " . $code['code'] . " {$isExpired} {$used}\n";
            echo "  Créé: " . $code['created_at'] . "\n";
            echo "  Expire: " . $code['expires_at'] . "\n";
            echo "\n";
        }
    } else {
        echo "❌ Aucun code 2FA trouvé pour test@planb.local\n";
        echo "\nTip: Essayer un login d'abord avec email/password\n";
    }
    
} catch (Exception $e) {
    echo "❌ Erreur: " . $e->getMessage() . "\n";
    exit(1);
}
