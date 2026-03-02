<?php
require_once 'vendor/autoload.php';

$dsn = 'pgsql:host=localhost;port=5432;dbname=planb';
$db = new PDO($dsn, 'postgres', 'root');
$db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

echo "Connected to PostgreSQL\n";

// Creer un utilisateur de test avec ID explicite
$password = password_hash('password123', PASSWORD_BCRYPT);
$db->exec("INSERT INTO users (
    id, email, first_name, last_name, phone, password, roles, account_type, 
    is_email_verified, is_phone_verified, is_banned, is_suspended, is_lifetime_pro, warnings_count,
    created_at, updated_at
) VALUES (
    1, 'test@planb.ci', 'Jean', 'Dupont', '+2250700000000', '$password', '[\"ROLE_USER\"]', 'particulier',
    true, true, false, false, false, 0,
    NOW(), NOW()
)");
echo "User created with ID: 1\n";

// Annonces avec IDs explicites
$listings = [
    [1, 'Appartement 3 pieces Cocody Riviera', 'Bel appartement renove, cuisine equipee, 2 chambres, salon spacieux. Quartier calme.', 150000, 'appartement', 'location', 'Cocody', 'Riviera'],
    [2, 'Villa duplex Riviera Golf', 'Magnifique villa avec piscine, 4 chambres climatisees, garage 2 voitures.', 450000, 'villa', 'location', 'Cocody', 'Riviera Golf'],
    [3, 'Terrain 500m2 Bingerville', 'Terrain bien situe avec ACD disponible, acces facile.', 25000000, 'terrain', 'vente', 'Bingerville', 'Centre'],
    [4, 'Studio meuble Plateau', 'Studio moderne climatise, wifi inclus. Proche bureaux.', 80000, 'studio', 'location', 'Plateau', 'Centre'],
    [5, 'Maison 4 pieces Yopougon', 'Maison familiale avec cour, 3 chambres. Quartier anime.', 75000, 'maison', 'location', 'Yopougon', 'Maroc'],
];

$stmt = $db->prepare("INSERT INTO listings (
    id, user_id, title, description, price, price_unit, currency, category, subcategory, type,
    country, city, commune, quartier, status, views_count, contacts_count, is_featured, 
    created_at, updated_at, expires_at
) VALUES (
    :id, 1, :title, :description, :price, 'mois', 'XOF', 'immobilier', :subcategory, :type,
    'CI', 'Abidjan', :commune, :quartier, 'active', 0, 0, false,
    NOW(), NOW(), NOW() + INTERVAL '30 days'
)");

foreach ($listings as $l) {
    $stmt->execute([
        ':id' => $l[0],
        ':title' => $l[1],
        ':description' => $l[2],
        ':price' => $l[3],
        ':subcategory' => $l[4],
        ':type' => $l[5],
        ':commune' => $l[6],
        ':quartier' => $l[7],
    ]);
    echo "Created: {$l[1]}\n";
}

// Reset sequences
$db->exec("SELECT setval('users_id_seq', 1)");
$db->exec("SELECT setval('listings_id_seq', 5)");

echo "\n=== DONE ===\n";
echo "5 annonces creees!\n";
echo "Compte: test@planb.ci / password123\n";
