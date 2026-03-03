<?php
// Test complet de l'inscription avec debug

$data = [
    'email' => 'testdebug' . time() . '@test.com',
    'password' => 'Test123!@',
    'firstName' => 'Debug',
    'lastName' => 'Test', 
    'phone' => '+22501234567',
    'captchaToken' => 'test'
];

echo "=== Test Inscription avec Debug ===\n";
echo "Email: " . $data['email'] . "\n\n";

$ch = curl_init('http://localhost:8000/api/v1/auth/register');
curl_setopt($ch, CURLOPT_POST, 1);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_VERBOSE, true);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

echo "\nHTTP Code: $httpCode\n";
$json = json_decode($response, true);
echo "Response:\n";
print_r($json);

// Vérifier si verificationUrl est présent (= email NON envoyé)
if (isset($json['verificationUrl'])) {
    echo "\n⚠️ EMAIL NON ENVOYÉ - URL de vérification fournie en fallback\n";
    echo "URL: " . $json['verificationUrl'] . "\n";
} else {
    echo "\n✓ Inscription OK (email censé être envoyé)\n";
}
