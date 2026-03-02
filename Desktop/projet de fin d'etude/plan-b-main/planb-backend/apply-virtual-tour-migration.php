<?php
/**
 * Script pour appliquer la migration de visite virtuelle
 * Usage: php apply-virtual-tour-migration.php
 */

// Charger les variables d'environnement depuis .env
$envFile = __DIR__ . '/.env';
if (file_exists($envFile)) {
    $lines = file($envFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        if (strpos(trim($line), '#') === 0) continue;
        if (strpos($line, '=') === false) continue;
        list($key, $value) = explode('=', $line, 2);
        $key = trim($key);
        $value = trim($value);
        if (!empty($key) && !empty($value)) {
            $_ENV[$key] = $value;
        }
    }
}

// Configuration par défaut
$dbHost = $_ENV['DB_HOST'] ?? '127.0.0.1';
$dbPort = $_ENV['DB_PORT'] ?? '5432';
$dbName = $_ENV['DB_NAME'] ?? 'planb';
$dbUser = $_ENV['DB_USER'] ?? 'postgres';
$dbPassword = $_ENV['DB_PASSWORD'] ?? 'root';

// Extraire les infos de DATABASE_URL si présent
if (isset($_ENV['DATABASE_URL'])) {
    $dbUrl = $_ENV['DATABASE_URL'];
    // Format: postgresql://user:password@host:port/dbname
    if (preg_match('/postgresql:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+)/', $dbUrl, $matches)) {
        $dbUser = $matches[1];
        $dbPassword = $matches[2];
        $dbHost = $matches[3];
        $dbPort = $matches[4];
        $dbName = $matches[5];
    } elseif (preg_match('/postgresql:\/\/([^:]+):([^@]+)@([^\/]+)\/(.+)/', $dbUrl, $matches)) {
        $dbUser = $matches[1];
        $dbPassword = $matches[2];
        $parts = explode(':', $matches[3]);
        $dbHost = $parts[0];
        $dbPort = $parts[1] ?? '5432';
        $dbName = $matches[4];
    }
}

echo "🔍 Application de la migration visite virtuelle...\n\n";
echo "Configuration:\n";
echo "  Host: $dbHost\n";
echo "  Port: $dbPort\n";
echo "  Database: $dbName\n";
echo "  User: $dbUser\n\n";

// Vérifier si l'extension PDO PostgreSQL est disponible
if (!extension_loaded('pdo_pgsql')) {
    echo "❌ Extension PDO PostgreSQL non disponible\n";
    echo "\n💡 Solutions:\n";
    echo "   1. Activez l'extension dans php.ini:\n";
    echo "      extension=pdo_pgsql\n";
    echo "      extension=pgsql\n";
    echo "\n   2. Ou utilisez pgAdmin pour exécuter manuellement:\n";
    echo "      Fichier: migrations/add_virtual_tour.sql\n";
    exit(1);
}

try {
    // Connexion à PostgreSQL
    $dsn = "pgsql:host=$dbHost;port=$dbPort;dbname=$dbName";
    $pdo = new PDO($dsn, $dbUser, $dbPassword);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    echo "✅ Connexion à PostgreSQL réussie\n\n";
    
    // Vérifier si les colonnes existent déjà
    echo "1. Vérification des colonnes existantes...\n";
    $stmt = $pdo->query("
        SELECT column_name, data_type, is_nullable 
        FROM information_schema.columns 
        WHERE table_name = 'listings' 
        AND column_name LIKE 'virtual_tour%'
        ORDER BY column_name;
    ");
    $existingColumns = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    if (count($existingColumns) > 0) {
        echo "⚠️  Les colonnes virtual_tour existent déjà:\n";
        foreach ($existingColumns as $col) {
            echo "   - {$col['column_name']} ({$col['data_type']})\n";
        }
        echo "\n✅ Migration déjà appliquée !\n";
        exit(0);
    }
    
    echo "   Aucune colonne virtual_tour trouvée\n\n";
    
    // Appliquer la migration
    echo "2. Application de la migration...\n";
    
    $pdo->beginTransaction();
    
    try {
        // Ajouter les colonnes
        $pdo->exec("ALTER TABLE listings ADD COLUMN IF NOT EXISTS virtual_tour_type VARCHAR(20) DEFAULT NULL");
        echo "   ✅ Colonne virtual_tour_type ajoutée\n";
        
        $pdo->exec("ALTER TABLE listings ADD COLUMN IF NOT EXISTS virtual_tour_url TEXT DEFAULT NULL");
        echo "   ✅ Colonne virtual_tour_url ajoutée\n";
        
        $pdo->exec("ALTER TABLE listings ADD COLUMN IF NOT EXISTS virtual_tour_thumbnail TEXT DEFAULT NULL");
        echo "   ✅ Colonne virtual_tour_thumbnail ajoutée\n";
        
        $pdo->exec("ALTER TABLE listings ADD COLUMN IF NOT EXISTS virtual_tour_data JSONB DEFAULT NULL");
        echo "   ✅ Colonne virtual_tour_data ajoutée\n";
        
        // Créer l'index
        $pdo->exec("CREATE INDEX IF NOT EXISTS idx_listing_virtual_tour ON listings(virtual_tour_type) WHERE virtual_tour_type IS NOT NULL");
        echo "   ✅ Index idx_listing_virtual_tour créé\n";
        
        $pdo->commit();
        
        echo "\n✅ Migration appliquée avec succès !\n\n";
        
        // Vérification finale
        echo "3. Vérification finale...\n";
        $stmt = $pdo->query("
            SELECT column_name, data_type, is_nullable 
            FROM information_schema.columns 
            WHERE table_name = 'listings' 
            AND column_name LIKE 'virtual_tour%'
            ORDER BY column_name;
        ");
        $columns = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        if (count($columns) === 4) {
            echo "   ✅ Toutes les colonnes sont présentes:\n";
            foreach ($columns as $col) {
                echo "      - {$col['column_name']} ({$col['data_type']})\n";
            }
        } else {
            echo "   ⚠️  Attention: Seulement " . count($columns) . " colonnes trouvées (attendu: 4)\n";
        }
        
        echo "\n🎉 Migration terminée avec succès !\n";
        echo "\n📝 Prochaines étapes:\n";
        echo "   1. Redémarrer le backend\n";
        echo "   2. Redémarrer le frontend\n";
        echo "   3. Tester avec un compte PRO\n";
        
    } catch (Exception $e) {
        $pdo->rollBack();
        throw $e;
    }
    
} catch (PDOException $e) {
    echo "\n❌ Erreur de connexion à PostgreSQL:\n";
    echo "   " . $e->getMessage() . "\n\n";
    echo "💡 Vérifiez:\n";
    echo "   - Que PostgreSQL est démarré\n";
    echo "   - Les identifiants dans le fichier .env\n";
    echo "   - Que la base de données 'planb' existe\n";
    exit(1);
} catch (Exception $e) {
    echo "\n❌ Erreur lors de la migration:\n";
    echo "   " . $e->getMessage() . "\n";
    exit(1);
}
