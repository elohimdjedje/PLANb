<?php
require_once 'vendor/autoload.php';

$dsn = 'pgsql:host=localhost;port=5432;dbname=planb';
$db = new PDO($dsn, 'postgres', 'root');
$db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

echo "Connected to PostgreSQL\n";

// Supprimer toutes les donnees
$db->exec('TRUNCATE TABLE listings CASCADE');
$db->exec('TRUNCATE TABLE users CASCADE');
echo "Tous les comptes supprimes\n";

// Creer un compte admin
$password = password_hash('admin123', PASSWORD_BCRYPT);
$db->exec("INSERT INTO users (
    id, email, first_name, last_name, phone, password, roles, account_type, 
    is_email_verified, is_phone_verified, is_banned, is_suspended, is_lifetime_pro, warnings_count,
    created_at, updated_at
) VALUES (
    1, 'admin@planb.ci', 'Admin', 'PlanB', '+2250700000001', '$password', '[\"ROLE_ADMIN\", \"ROLE_USER\"]', 'professionnel',
    true, true, false, false, true, 0,
    NOW(), NOW()
)");

// Reset sequence
$db->exec("SELECT setval('users_id_seq', 1)");

echo "\n=== ADMIN CREE ===\n";
echo "Email: admin@planb.ci\n";
echo "Mot de passe: admin123\n";
echo "Role: ROLE_ADMIN\n";
