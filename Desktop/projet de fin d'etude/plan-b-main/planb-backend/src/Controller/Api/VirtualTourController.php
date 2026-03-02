<?php

namespace App\Controller\Api;

use App\Entity\Listing;
use App\Repository\ListingRepository;
use App\Service\ImageUploadService;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;
use Psr\Log\LoggerInterface;

#[Route('/api/v1/listings')]
class VirtualTourController extends AbstractController
{
    public function __construct(
        private ListingRepository $listingRepository,
        private EntityManagerInterface $entityManager,
        private ImageUploadService $imageUploadService,
        private LoggerInterface $logger
    ) {}

    /**
     * Upload une visite virtuelle 360°
     * 
     * POST /api/v1/listings/{id}/virtual-tour
     */
    #[Route('/{id}/virtual-tour', name: 'app_listing_virtual_tour_upload', methods: ['POST'])]
    #[IsGranted('ROLE_USER')]
    public function uploadVirtualTour(int $id, Request $request): JsonResponse
    {
        $user = $this->getUser();
        $listing = $this->listingRepository->find($id);

        if (!$listing) {
            return $this->json(['error' => 'Annonce introuvable'], Response::HTTP_NOT_FOUND);
        }

        // Vérifier que l'utilisateur est propriétaire
        if ($listing->getUser()->getId() !== $user->getId()) {
            return $this->json(['error' => 'Accès non autorisé'], Response::HTTP_FORBIDDEN);
        }

        // Vérifier que c'est un compte PRO (ou payer)
        if ($user->getAccountType() !== 'PRO' && !$user->isLifetimePro()) {
            return $this->json([
                'error' => 'Visite virtuelle disponible uniquement pour les comptes PRO',
                'upgrade_required' => true
            ], Response::HTTP_FORBIDDEN);
        }

        // Récupérer le fichier
        $file = $request->files->get('virtual_tour');
        
        if (!$file) {
            return $this->json(['error' => 'Fichier manquant'], Response::HTTP_BAD_REQUEST);
        }

        // Valider le type de fichier
        $allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
        if (!in_array($file->getMimeType(), $allowedTypes)) {
            return $this->json([
                'error' => 'Format non supporté. Utilisez JPG ou PNG (format équirectangulaire)'
            ], Response::HTTP_BAD_REQUEST);
        }

        // Valider la taille (max 15 MB)
        if ($file->getSize() > 15 * 1024 * 1024) {
            return $this->json([
                'error' => 'Fichier trop volumineux. Maximum 15 MB'
            ], Response::HTTP_BAD_REQUEST);
        }

        try {
            // Upload l'image
            $uploadResult = $this->imageUploadService->uploadImage(
                $file,
                'virtual-tours'
            );

            // Sauvegarder dans la base
            $listing->setVirtualTourType('360_photo');
            $listing->setVirtualTourUrl($uploadResult['url']);
            $listing->setVirtualTourThumbnail($uploadResult['thumbnail_url'] ?? $uploadResult['url']);
            $listing->setVirtualTourData([
                'uploaded_at' => (new \DateTime())->format('c'),
                'file_size' => $file->getSize(),
                'dimensions' => [
                    'width' => $uploadResult['width'] ?? null,
                    'height' => $uploadResult['height'] ?? null
                ]
            ]);

            $this->entityManager->flush();

            $this->logger->info('Visite virtuelle uploadée', [
                'listing_id' => $listing->getId(),
                'user_id' => $user->getId()
            ]);

            return $this->json([
                'success' => true,
                'message' => 'Visite virtuelle ajoutée avec succès',
                'data' => [
                    'type' => $listing->getVirtualTourType(),
                    'url' => $listing->getVirtualTourUrl(),
                    'thumbnail' => $listing->getVirtualTourThumbnail()
                ]
            ], Response::HTTP_CREATED);

        } catch (\Exception $e) {
            $this->logger->error('Erreur upload visite virtuelle', [
                'listing_id' => $id,
                'error' => $e->getMessage()
            ]);

            return $this->json([
                'error' => 'Erreur lors de l\'upload',
                'message' => $e->getMessage()
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Récupérer la visite virtuelle d'une annonce
     * 
     * GET /api/v1/listings/{id}/virtual-tour
     */
    #[Route('/{id}/virtual-tour', name: 'app_listing_virtual_tour_get', methods: ['GET'])]
    public function getVirtualTour(int $id): JsonResponse
    {
        $listing = $this->listingRepository->find($id);

        if (!$listing || !$listing->hasVirtualTour()) {
            return $this->json(['error' => 'Visite virtuelle non disponible'], Response::HTTP_NOT_FOUND);
        }

        return $this->json([
            'type' => $listing->getVirtualTourType(),
            'url' => $listing->getVirtualTourUrl(),
            'thumbnail' => $listing->getVirtualTourThumbnail(),
            'data' => $listing->getVirtualTourData()
        ]);
    }

    /**
     * Supprimer la visite virtuelle
     * 
     * DELETE /api/v1/listings/{id}/virtual-tour
     */
    #[Route('/{id}/virtual-tour', name: 'app_listing_virtual_tour_delete', methods: ['DELETE'])]
    #[IsGranted('ROLE_USER')]
    public function deleteVirtualTour(int $id): JsonResponse
    {
        $user = $this->getUser();
        $listing = $this->listingRepository->find($id);

        if (!$listing) {
            return $this->json(['error' => 'Annonce introuvable'], Response::HTTP_NOT_FOUND);
        }

        if ($listing->getUser()->getId() !== $user->getId()) {
            return $this->json(['error' => 'Accès non autorisé'], Response::HTTP_FORBIDDEN);
        }

        // Supprimer le fichier
        if ($listing->getVirtualTourUrl()) {
            try {
                $this->imageUploadService->deleteImage($listing->getVirtualTourUrl());
            } catch (\Exception $e) {
                $this->logger->warning('Erreur suppression fichier visite virtuelle', [
                    'listing_id' => $id,
                    'error' => $e->getMessage()
                ]);
                // Continue même si la suppression du fichier échoue
            }
        }

        // Supprimer de la base
        $listing->setVirtualTourType(null);
        $listing->setVirtualTourUrl(null);
        $listing->setVirtualTourThumbnail(null);
        $listing->setVirtualTourData(null);

        $this->entityManager->flush();

        return $this->json([
            'success' => true,
            'message' => 'Visite virtuelle supprimée'
        ]);
    }

    /**
     * Définir une URL externe pour la visite virtuelle
     * (Matterport, YouTube 360, etc.)
     * 
     * PUT /api/v1/listings/{id}/virtual-tour-url
     */
    #[Route('/{id}/virtual-tour-url', name: 'app_listing_virtual_tour_url', methods: ['PUT'])]
    #[IsGranted('ROLE_USER')]
    public function setVirtualTourUrl(int $id, Request $request): JsonResponse
    {
        $user = $this->getUser();
        $listing = $this->listingRepository->find($id);

        if (!$listing) {
            return $this->json(['error' => 'Annonce introuvable'], Response::HTTP_NOT_FOUND);
        }

        if ($listing->getUser()->getId() !== $user->getId()) {
            return $this->json(['error' => 'Accès non autorisé'], Response::HTTP_FORBIDDEN);
        }

        $data = json_decode($request->getContent(), true);
        $url = $data['url'] ?? null;
        $type = $data['type'] ?? 'external';

        if (!$url) {
            return $this->json(['error' => 'URL requise'], Response::HTTP_BAD_REQUEST);
        }

        // Valider l'URL
        if (!filter_var($url, FILTER_VALIDATE_URL)) {
            return $this->json(['error' => 'URL invalide'], Response::HTTP_BAD_REQUEST);
        }

        // Détecter le type automatiquement si non fourni
        if ($type === 'external') {
            if (str_contains($url, 'matterport.com')) {
                $type = 'matterport';
            } elseif (str_contains($url, 'youtube.com') || str_contains($url, 'youtu.be')) {
                $type = '360_video';
            } elseif (str_contains($url, 'kuula.co') || str_contains($url, 'panoraven.com')) {
                $type = '360_photo';
            }
        }

        $listing->setVirtualTourType($type);
        $listing->setVirtualTourUrl($url);
        $listing->setVirtualTourData([
            'source' => 'external',
            'added_at' => (new \DateTime())->format('c'),
        ]);

        $this->entityManager->flush();

        $this->logger->info('Visite virtuelle externe ajoutée', [
            'listing_id' => $listing->getId(),
            'user_id' => $user->getId(),
            'type' => $type
        ]);

        return $this->json([
            'success' => true,
            'message' => 'Visite virtuelle ajoutée avec succès',
            'data' => [
                'type' => $listing->getVirtualTourType(),
                'url' => $listing->getVirtualTourUrl(),
            ]
        ]);
    }
}


