<?php
require_once 'vendor/autoload.php';

$db = new PDO('sqlite:var/data.db');
$db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

// Vider les tables
$db->exec('DELETE FROM listings');
$db->exec('DELETE FROM users');
echo "Tables cleared\n";

// Creer un utilisateur de test
$password = password_hash('password123', PASSWORD_BCRYPT);
$db->exec("INSERT INTO users (
    email, first_name, last_name, phone, password, roles, account_type, 
    is_email_verified, is_phone_verified, is_banned, is_suspended, is_lifetime_pro, warnings_count,
    created_at, updated_at
) VALUES (
    'test@planb.ci', 'Jean', 'Dupont', '+2250700000000', '$password', '[\"ROLE_USER\"]', 'particulier',
    1, 1, 0, 0, 0, 0,
    datetime('now'), datetime('now')
)");

$userId = $db->lastInsertId();
echo "User created with ID: $userId\n";

// Annonces avec TOUTES les colonnes
$now = date('Y-m-d H:i:s');
$expires = date('Y-m-d H:i:s', strtotime('+30 days'));

$listings = [
    ['Appartement 3 pieces Cocody Riviera', 'Bel appartement renove, cuisine equipee, 2 chambres, salon spacieux. Quartier calme et securise pres des commodites.', 150000, 'appartement', 'location', 'Cocody', 'Riviera Palmeraie'],
    ['Villa duplex Riviera Golf', 'Magnifique villa duplex avec piscine, jardin arbore, 4 chambres climatisees, 3 salles de bain, garage 2 voitures.', 450000, 'villa', 'location', 'Cocody', 'Riviera Golf'],
    ['Terrain 500m2 Bingerville', 'Terrain bien situe avec ACD disponible, acces facile par route bitumee. Ideal pour construction villa.', 25000000, 'terrain', 'vente', 'Bingerville', 'Centre'],
    ['Studio meuble Plateau', 'Studio moderne entierement meuble et equipe, climatise, eau chaude, wifi inclus. Proche bureaux et commerces.', 80000, 'studio', 'location', 'Plateau', 'Centre-ville'],
    ['Maison 4 pieces Yopougon', 'Maison familiale avec grande cour, 3 chambres, salon, cuisine amenagee. Quartier anime et securise.', 75000, 'maison', 'location', 'Yopougon', 'Maroc'],
];

foreach ($listings as $l) {
    $stmt = $db->prepare("INSERT INTO listings (
        user_id, title, description, price, price_unit, currency, category, subcategory, type,
        country, city, commune, quartier, status, views_count, contacts_count, is_featured, 
        created_at, updated_at, expires_at
    ) VALUES (
        :user_id, :title, :description, :price, 'mois', 'XOF', 'immobilier', :subcategory, :type,
        'CI', 'Abidjan', :commune, :quartier, 'active', 0, 0, 0,
        :created_at, :updated_at, :expires_at
    )");
    
    $stmt->execute([
        ':user_id' => $userId,
        ':title' => $l[0],
        ':description' => $l[1],
        ':price' => $l[2],
        ':subcategory' => $l[3],
        ':type' => $l[4],
        ':commune' => $l[5],
        ':quartier' => $l[6],
        ':created_at' => $now,
        ':updated_at' => $now,
        ':expires_at' => $expires,
    ]);
    echo "Created: {$l[0]}\n";
}

echo "\n=== DONE ===\n";
echo "5 annonces creees!\n";
echo "Compte test: test@planb.ci / password123\n";
