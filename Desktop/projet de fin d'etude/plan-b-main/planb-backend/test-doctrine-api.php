<?php
require 'vendor/autoload.php';

// Charger .env
(new \Symfony\Component\Dotenv\Dotenv())->bootEnv('.env');

try {
    $kernel = new \App\Kernel('prod', false);
    $kernel->boot();
    
    $em = $kernel->getContainer()->get('doctrine.orm.entity_manager');
    
    echo "=== Test Doctrine ORM ===\n";
    
    // Test listing repository
    $listingRepo = $em->getRepository('App\Entity\Listing');
    echo "✅ Repository chargé\n";
    
    $listings = $listingRepo->findAll();
    echo "✅ Requête exécutée\n";
    echo "Listings trouvés: " . count($listings) . "\n";
    
    if (count($listings) > 0) {
        echo "\nPremier listing:\n";
        echo json_encode([
            'id' => $listings[0]->getId(),
            'title' => $listings[0]->getTitle(),
            'price' => $listings[0]->getPrice(),
        ], JSON_PRETTY_PRINT);
    }
    
} catch (Exception $e) {
    echo "❌ ERREUR: " . $e->getMessage() . "\n";
    echo "Classe: " . get_class($e) . "\n";
    echo "File: " . $e->getFile() . ":" . $e->getLine() . "\n\n";
    echo "Stack:\n";
    echo $e->getTraceAsString();
}
