<?php

require_once __DIR__.'/vendor/autoload.php';

use App\Kernel;
use App\Entity\Listing;
use Symfony\Component\Dotenv\Dotenv;

// Charger l'environnement
(new Dotenv())->bootEnv(__DIR__.'/.env');

$kernel = new Kernel($_SERVER['APP_ENV'], (bool) $_SERVER['APP_DEBUG']);
$kernel->boot();

$container = $kernel->getContainer();
$em = $container->get('doctrine')->getManager();
$userRepo = $em->getRepository(\App\Entity\User::class);

// Trouver l'admin
$admin = $userRepo->findOneBy(['email' => 'admin@planb.ci']);

if (!$admin) {
    die("Admin non trouvé!\n");
}

echo "Admin trouvé: " . $admin->getEmail() . "\n";

// Créer les annonces de test
$listings = [
    [
        'title' => 'Villa moderne Cocody',
        'description' => 'Belle villa de 4 chambres avec piscine et jardin paysager. Quartier résidentiel calme.',
        'price' => 150000000,
        'category' => 'immobilier',
        'subcategory' => 'villa',
        'type' => 'vente',
        'city' => 'Abidjan',
        'commune' => 'Cocody',
    ],
    [
        'title' => 'Appartement F3 Plateau',
        'description' => 'Bel appartement 3 pièces au centre-ville, vue sur la lagune.',
        'price' => 250000,
        'category' => 'immobilier',
        'subcategory' => 'appartement',
        'type' => 'location',
        'city' => 'Abidjan',
        'commune' => 'Plateau',
    ],
    [
        'title' => 'Toyota Corolla 2022',
        'description' => 'Toyota Corolla en excellent état, faible kilométrage, climatisation.',
        'price' => 12000000,
        'category' => 'vehicule',
        'subcategory' => 'voiture',
        'type' => 'vente',
        'city' => 'Abidjan',
        'commune' => 'Marcory',
    ],
    [
        'title' => 'Villa vacances bord de mer',
        'description' => 'Magnifique villa en bord de mer pour vos vacances. 3 chambres climatisées.',
        'price' => 75000,
        'category' => 'vacance',
        'subcategory' => 'villa',
        'type' => 'location',
        'city' => 'Grand-Bassam',
        'commune' => 'Grand-Bassam',
    ],
    [
        'title' => 'Studio meublé Riviera',
        'description' => 'Studio moderne entièrement meublé et équipé. Idéal pour professionnel.',
        'price' => 150000,
        'category' => 'immobilier',
        'subcategory' => 'studio',
        'type' => 'location',
        'city' => 'Abidjan',
        'commune' => 'Cocody',
    ],
    [
        'title' => 'Terrain constructible Bingerville',
        'description' => 'Terrain de 500m² avec ACD, prêt à construire. Quartier calme.',
        'price' => 25000000,
        'category' => 'immobilier',
        'subcategory' => 'terrain',
        'type' => 'vente',
        'city' => 'Bingerville',
        'commune' => 'Bingerville',
    ],
];

foreach ($listings as $data) {
    $listing = new Listing();
    $listing->setTitle($data['title']);
    $listing->setDescription($data['description']);
    $listing->setPrice($data['price']);
    $listing->setCategory($data['category']);
    $listing->setSubcategory($data['subcategory']);
    $listing->setType($data['type']);
    $listing->setCity($data['city']);
    $listing->setCommune($data['commune']);
    $listing->setCountry('CI');
    $listing->setStatus('active');
    $listing->setUser($admin);
    $listing->setViewsCount(rand(5, 50));
    $listing->setContactsCount(rand(0, 10));
    
    $em->persist($listing);
    echo "✅ Annonce créée: " . $data['title'] . "\n";
}

$em->flush();
echo "\n🎉 " . count($listings) . " annonces créées avec succès!\n";
