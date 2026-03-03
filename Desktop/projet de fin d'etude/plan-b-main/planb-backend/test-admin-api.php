<?php
/**
 * Test direct de l'API admin en utilisant curl
 */

// D'abord, se connecter pour obtenir un token JWT
$loginUrl = 'http://localhost:8000/api/v1/auth/login';
$loginData = [
    'email' => 'mickaeldjedje7@gmail.com',
    'password' => 'Admin123!'
];

echo "=== Test API Admin ===\n\n";

// Login
$ch = curl_init($loginUrl);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($loginData));
curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);

$loginResponse = curl_exec($ch);
$loginHttpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

echo "1. Login:\n";
echo "   HTTP Code: $loginHttpCode\n";
$loginResult = json_decode($loginResponse, true);

if ($loginHttpCode !== 200 || !isset($loginResult['token'])) {
    echo "   ERREUR: Impossible de se connecter\n";
    echo "   Response: $loginResponse\n";
    exit(1);
}

$token = $loginResult['token'];
echo "   Token obtenu: " . substr($token, 0, 50) . "...\n\n";

// Test /api/v1/admin/users
echo "2. GET /api/v1/admin/users:\n";
$ch = curl_init('http://localhost:8000/api/v1/admin/users');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type: application/json',
    'Authorization: Bearer ' . $token
]);

$usersResponse = curl_exec($ch);
$usersHttpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

echo "   HTTP Code: $usersHttpCode\n";
if ($usersHttpCode === 200) {
    $users = json_decode($usersResponse, true);
    echo "   Total users: " . ($users['total'] ?? 'N/A') . "\n";
    echo "   Response preview: " . substr($usersResponse, 0, 500) . "...\n";
} else {
    echo "   ERREUR!\n";
    echo "   Response: " . substr($usersResponse, 0, 2000) . "\n";
}

echo "\n";

// Test /api/v1/admin/listings
echo "3. GET /api/v1/admin/listings:\n";
$ch = curl_init('http://localhost:8000/api/v1/admin/listings');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type: application/json',
    'Authorization: Bearer ' . $token
]);

$listingsResponse = curl_exec($ch);
$listingsHttpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

echo "   HTTP Code: $listingsHttpCode\n";
if ($listingsHttpCode === 200) {
    $listings = json_decode($listingsResponse, true);
    echo "   Total listings: " . ($listings['total'] ?? 'N/A') . "\n";
    echo "   Response preview: " . substr($listingsResponse, 0, 500) . "\n";
} else {
    echo "   ERREUR!\n";
    echo "   Response: " . substr($listingsResponse, 0, 2000) . "\n";
}

echo "\n=== Fin du test ===\n";
