<?php
require 'vendor/autoload.php';

use Symfony\Component\Mailer\Transport;
use Symfony\Component\Mailer\Mailer;
use Symfony\Component\Mime\Email;

$dsn = 'smtp://nepasrepondre510%40gmail.com:olathatieqzaakxm@smtp.gmail.com:587';
$transport = Transport::fromDsn($dsn);
$mailer = new Mailer($transport);

$email = (new Email())
    ->from('nepasrepondre510@gmail.com')
    ->to('dyasmine335@gmail.com')
    ->subject('Test PlanB - ' . date('H:i:s'))
    ->text('Ceci est un test email depuis PlanB. Si vous recevez ce message, l\'envoi fonctionne!');

try {
    $mailer->send($email);
    echo "✓ Email envoyé avec succès à dyasmine335@gmail.com!\n";
} catch (Exception $e) {
    echo "✗ Erreur: " . $e->getMessage() . "\n";
}
