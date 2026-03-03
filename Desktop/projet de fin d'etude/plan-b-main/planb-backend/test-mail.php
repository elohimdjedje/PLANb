#!/usr/bin/env php
<?php
require dirname(__FILE__).'/vendor/autoload.php';

use App\Service\EmailService;
use App\Entity\User;
use Symfony\Component\Mailer\Mailer;
use Symfony\Component\Mailer\Transport;
use Symfony\Component\Mime\Email;
use Monolog\Logger;
use Monolog\Handler\StreamHandler;
use Twig\Environment;
use Twig\Loader\FilesystemLoader;

// Chargez les variables d'environnement
$dotenv = new \Symfony\Component\Dotenv\Dotenv();
$dotenv->loadEnv(dirname(__FILE__).'/.env.local');

// Afficher la configuration
echo "=== Configuration Email ===\n";
echo "FROM_EMAIL: " . ($_ENV['MAILER_FROM_EMAIL'] ?? 'non configuré') . "\n";
echo "MAILER_DSN: " . (isset($_ENV['MAILER_DSN']) ? '***CONFIGURÉ***' : 'NON CONFIGURÉ') . "\n";
echo "SUPPORT_EMAIL: " . ($_ENV['SUPPORT_EMAIL'] ?? 'non configuré') . "\n\n";

// Créer le transport
try {
    $dsn = $_ENV['MAILER_DSN'] ?? 'null://null';
    $transport = Transport::fromDsn($dsn);
    echo "✓ Transport SMTP créé avec succès\n";
    
    // Créer un mailer
    $mailer = new Mailer($transport);
    
    // Test d'envoi simple
    $email = (new Email())
        ->from($_ENV['MAILER_FROM_EMAIL'] ?? 'noreply@planb.ci')
        ->to('test@planb.local')
        ->subject('Test Email PLANb')
        ->text('Ceci est un email de test pour vérifier que le système d\'envoi fonctionne correctement.')
        ->html('<h1>Test Email PLANb</h1><p>Ceci est un email de test pour vérifier que le système d\'envoi fonctionne correctement.</p>');
    
    echo "\n=== Test d'envoi ===\n";
    $mailer->send($email);
    echo "✓ Email envoyé avec succès à: " . 'test@planb.local' . "\n";
    
} catch (\Exception $e) {
    echo "✗ Erreur: " . $e->getMessage() . "\n";
    echo "Stack: " . $e->getTraceAsString() . "\n";
    exit(1);
}
