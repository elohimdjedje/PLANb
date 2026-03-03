<?php
// Test du kernel Symfony pour diagnostiquer l'erreur 500

require_once __DIR__ . '/vendor/autoload.php';

use App\Kernel;
use Symfony\Component\HttpFoundation\Request;

$_SERVER['APP_ENV'] = 'dev';
$_SERVER['APP_DEBUG'] = true;

$kernel = new Kernel('dev', true);
$kernel->boot();

$container = $kernel->getContainer();
$entityManager = $container->get('doctrine.orm.entity_manager');
$userRepo = $entityManager->getRepository(\App\Entity\User::class);

echo "=== Test chargement User ===\n";

try {
    $users = $userRepo->findAll();
    echo "Users trouvés: " . count($users) . "\n\n";

    foreach ($users as $user) {
        echo "User ID: " . $user->getId() . "\n";
        echo "Email: " . $user->getEmail() . "\n";
        echo "AccountType: " . $user->getAccountType() . "\n";
        
        // Test des méthodes qui pourraient causer l'erreur
        try {
            $listings = $user->getListings();
            echo "Listings count: " . $listings->count() . "\n";
        } catch (Exception $e) {
            echo "ERREUR getListings: " . $e->getMessage() . "\n";
        }
        
        try {
            $payments = $user->getPayments();
            echo "Payments count: " . $payments->count() . "\n";
        } catch (Exception $e) {
            echo "ERREUR getPayments: " . $e->getMessage() . "\n";
        }
        
        echo "---\n";
    }
} catch (Exception $e) {
    echo "ERREUR: " . $e->getMessage() . "\n";
    echo "Stack: " . $e->getTraceAsString() . "\n";
}
