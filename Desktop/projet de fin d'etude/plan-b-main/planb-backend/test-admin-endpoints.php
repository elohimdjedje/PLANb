<?php
// Test endpoint admin directement

$ch = curl_init('http://localhost:8000/api/v1/admin/listings');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, ['Accept: application/json']);
$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
echo "=== Test /api/v1/admin/listings ===\n";
echo "HTTP Code: " . $httpCode . "\n";
echo "Response: " . substr($response, 0, 2000) . "\n\n";
curl_close($ch);

$ch = curl_init('http://localhost:8000/api/v1/admin/users');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, ['Accept: application/json']);
$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
echo "=== Test /api/v1/admin/users ===\n";
echo "HTTP Code: " . $httpCode . "\n";
echo "Response: " . substr($response, 0, 2000) . "\n\n";
curl_close($ch);

$ch = curl_init('http://localhost:8000/api/v1/admin/dashboard');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, ['Accept: application/json']);
$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
echo "=== Test /api/v1/admin/dashboard ===\n";
echo "HTTP Code: " . $httpCode . "\n";
echo "Response: " . substr($response, 0, 2000) . "\n";
curl_close($ch);
