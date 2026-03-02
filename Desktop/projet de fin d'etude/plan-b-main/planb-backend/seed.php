<?php
require_once 'vendor/autoload.php';

$db = new PDO('sqlite:var/data.db');
$db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

// Creer un utilisateur de test avec toutes les colonnes NOT NULL
$password = password_hash('password123', PASSWORD_BCRYPT);
$db->exec("INSERT INTO users (
    email, first_name, last_name, phone, password, roles, account_type, 
    is_email_verified, is_phone_verified, is_banned, is_suspended, is_lifetime_pro, warnings_count,
    created_at, updated_at
) VALUES (
    'test@planb.ci', 'Jean', 'Dupont', '+2250700000000', '$password', '[\"ROLE_USER\"]', 'particulier',
    1, 0, 0, 0, 0, 0,
    datetime('now'), datetime('now')
)");

$userId = $db->lastInsertId();
echo "User created with ID: $userId\n";

// Creer des annonces
$listings = [
    ['Appartement 3 pieces Cocody Riviera', 'Bel appartement renove, cuisine equipee, 2 chambres.', 150000, 'immobilier', 'appartement', 'location', 'Abidjan', 'Cocody Riviera'],
    ['Villa duplex Riviera Golf', 'Magnifique villa avec piscine, 4 chambres.', 450000, 'immobilier', 'villa', 'location', 'Abidjan', 'Riviera Golf'],
    ['Terrain 500m2 Bingerville', 'Terrain bien situe, ACD disponible.', 25000000, 'immobilier', 'terrain', 'vente', 'Abidjan', 'Bingerville'],
    ['Studio meuble Plateau', 'Studio moderne climatise, internet inclus.', 80000, 'immobilier', 'studio', 'location', 'Abidjan', 'Plateau'],
    ['Maison 4 pieces Yopougon', 'Maison familiale avec cour, 3 chambres.', 75000, 'immobilier', 'maison', 'location', 'Abidjan', 'Yopougon'],
];

$stmt = $db->prepare("INSERT INTO listings (
    user_id, title, description, price, price_unit, currency, category, subcategory, type, 
    country, city, quartier, status, views_count, contacts_count, is_featured, created_at, updated_at
) VALUES (?, ?, ?, ?, 'mois', 'XOF', ?, ?, ?, 'CI', ?, ?, 'active', 0, 0, 0, datetime('now'), datetime('now'))");

foreach ($listings as $l) {
    $stmt->execute([$userId, $l[0], $l[1], $l[2], $l[3], $l[4], $l[5], $l[6], $l[7]]);
    echo "Listing created: {$l[0]}\n";
}

echo "\nDone! 5 listings created.\n";
echo "Login: test@planb.ci / password123\n";
