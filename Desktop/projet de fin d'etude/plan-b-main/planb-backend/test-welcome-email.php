<?php
// Test de l'email de bienvenue comme dans le système

require 'vendor/autoload.php';

use Symfony\Component\Dotenv\Dotenv;

$dotenv = new Dotenv();
$dotenv->loadEnv(__DIR__ . '/.env');

echo "=== Test Email de Bienvenue ===\n\n";

// Vérifier la configuration
$mailerDsn = $_ENV['MAILER_DSN'] ?? 'NON DÉFINI';
$fromEmail = $_ENV['MAILER_FROM_EMAIL'] ?? 'NON DÉFINI';
$frontendUrl = $_ENV['FRONTEND_URL'] ?? 'NON DÉFINI';

echo "MAILER_DSN: $mailerDsn\n";
echo "FROM EMAIL: $fromEmail\n";
echo "FRONTEND_URL: $frontendUrl\n\n";

// Vérifier si configuré
$isConfigured = $mailerDsn && $mailerDsn !== 'null://null';
echo "Email configuré: " . ($isConfigured ? "OUI" : "NON") . "\n\n";

if (!$isConfigured) {
    echo "ERREUR: MAILER_DSN n'est pas configuré!\n";
    exit(1);
}

// Tester l'envoi avec le Kernel Symfony
use Symfony\Component\HttpKernel\KernelInterface;
use App\Kernel;

$kernel = new Kernel($_ENV['APP_ENV'] ?? 'dev', (bool) ($_ENV['APP_DEBUG'] ?? true));
$kernel->boot();
$container = $kernel->getContainer();

// Récupérer le service EmailService
$emailService = $container->get('App\Service\EmailService');

// Créer un faux utilisateur pour le test
class FakeUser {
    public function getId() { return 9999; }
    public function getEmail() { return 'dyasmine335@gmail.com'; }
    public function getFirstName() { return 'Yasmine'; }
    public function getLastName() { return 'Dupont'; }
}

$user = new FakeUser();
$verificationToken = bin2hex(random_bytes(32));

echo "Envoi de l'email de bienvenue à: " . $user->getEmail() . "\n";

try {
    $result = $emailService->sendWelcomeEmail($user, $verificationToken);
    echo $result ? "✓ Email envoyé avec succès!\n" : "✗ Échec de l'envoi\n";
} catch (Exception $e) {
    echo "✗ Erreur: " . $e->getMessage() . "\n";
    echo "Trace: " . $e->getTraceAsString() . "\n";
}
