<?php
/**
 * Test de simulation de l'AdminController::getUsers()
 */

require __DIR__ . '/vendor/autoload.php';

use App\Kernel;
use Symfony\Component\HttpFoundation\Request;

// Boot Symfony
$kernel = new Kernel('dev', true);
$kernel->boot();
$container = $kernel->getContainer();

$entityManager = $container->get('doctrine.orm.entity_manager');
$userRepository = $entityManager->getRepository(\App\Entity\User::class);

echo "=== Simulation AdminController::getUsers ===\n\n";

try {
    // Simuler la requête du contrôleur
    $qb = $userRepository->createQueryBuilder('u')
        ->setMaxResults(50)
        ->setFirstResult(0)
        ->orderBy('u.createdAt', 'DESC');
    
    $users = $qb->getQuery()->getResult();
    echo "Nombre d'utilisateurs trouvés: " . count($users) . "\n\n";
    
    // Simuler le array_map
    $data = array_map(function($user) {
        echo "Processing user: " . $user->getEmail() . "\n";
        
        // Vérifier chaque champ
        echo "  - getId(): " . ($user->getId() ?? 'NULL') . "\n";
        echo "  - getPhone(): " . ($user->getPhone() ?? 'NULL') . "\n";
        echo "  - getFullName(): " . ($user->getFullName() ?? 'NULL') . "\n";
        echo "  - getAccountType(): " . ($user->getAccountType() ?? 'NULL') . "\n";
        echo "  - isLifetimePro(): " . ($user->isLifetimePro() ? 'true' : 'false') . "\n";
        echo "  - getCountry(): " . ($user->getCountry() ?? 'NULL') . "\n";
        echo "  - getCity(): " . ($user->getCity() ?? 'NULL') . "\n";
        echo "  - getSubscriptionExpiresAt(): " . ($user->getSubscriptionExpiresAt() ? $user->getSubscriptionExpiresAt()->format('c') : 'NULL') . "\n";
        
        $createdAt = $user->getCreatedAt();
        echo "  - getCreatedAt() type: " . gettype($createdAt) . " / class: " . (is_object($createdAt) ? get_class($createdAt) : 'N/A') . "\n";
        
        if ($createdAt === null) {
            echo "  - ERREUR: createdAt est NULL!\n";
            throw new \Exception("createdAt est NULL pour l'utilisateur " . $user->getEmail());
        }
        
        echo "  - getCreatedAt()->format('c'): " . $createdAt->format('c') . "\n";
        
        // Vérifier les collections
        $listings = $user->getListings();
        echo "  - getListings() type: " . gettype($listings) . " / class: " . (is_object($listings) ? get_class($listings) : 'N/A') . "\n";
        echo "  - getListings()->count(): " . $listings->count() . "\n";
        
        $payments = $user->getPayments();
        echo "  - getPayments() type: " . gettype($payments) . " / class: " . (is_object($payments) ? get_class($payments) : 'N/A') . "\n";
        echo "  - getPayments()->count(): " . $payments->count() . "\n";
        
        echo "\n";
        
        return [
            'id' => $user->getId(),
            'email' => $user->getEmail(),
            'phone' => $user->getPhone(),
            'fullName' => $user->getFullName(),
            'accountType' => $user->getAccountType(),
            'isLifetimePro' => $user->isLifetimePro(),
            'country' => $user->getCountry(),
            'city' => $user->getCity(),
            'subscriptionExpiresAt' => $user->getSubscriptionExpiresAt()?->format('c'),
            'createdAt' => $user->getCreatedAt()->format('c'),
            'totalListings' => $user->getListings()->count(),
            'totalPayments' => $user->getPayments()->count()
        ];
    }, $users);
    
    echo "=== Données formatées ===\n";
    print_r($data);
    
    echo "\n=== TEST OK - Pas d'erreur ===\n";
    
} catch (\Throwable $e) {
    echo "\n=== ERREUR CAPTUREE ===\n";
    echo "Type: " . get_class($e) . "\n";
    echo "Message: " . $e->getMessage() . "\n";
    echo "File: " . $e->getFile() . ":" . $e->getLine() . "\n";
    echo "Trace:\n" . $e->getTraceAsString() . "\n";
}
