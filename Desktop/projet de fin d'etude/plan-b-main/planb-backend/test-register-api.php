<?php
// Test direct de l'API register

$ch = curl_init('http://localhost:8000/api/v1/auth/register');
curl_setopt($ch, CURLOPT_POST, 1);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode([
    'email' => 'testAPI' . time() . '@test.com',
    'password' => 'Test123!@',
    'firstName' => 'Test',
    'lastName' => 'User',
    'phone' => '+22501234567',
    'captchaToken' => 'test'
]));
curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

echo "HTTP Code: $httpCode\n";
echo "Response:\n$response\n";
