<?php

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api/v1')]
class UploadController extends AbstractController
{
    /**
     * Upload d'images (temporaire - stockage local)
     * TODO: Intégrer Cloudinary ou AWS S3 en production
     */
    #[Route('/upload', name: 'upload_images', methods: ['POST'])]
    public function uploadImages(Request $request): JsonResponse
    {
        // ✅ Vérifier que l'utilisateur est authentifié
        $user = $this->getUser();
        if (!$user) {
            return $this->json([
                'error' => 'Non authentifié',
                'message' => 'Vous devez être connecté pour uploader des images'
            ], Response::HTTP_UNAUTHORIZED);
        }
        
        try {
            // Récupérer tous les fichiers - gérer images[] ou fichiers directs
            $uploadedFiles = $request->files->all();
            
            // Si les fichiers sont dans un tableau 'images'
            if (isset($uploadedFiles['images']) && is_array($uploadedFiles['images'])) {
                $uploadedFiles = $uploadedFiles['images'];
            }
            
            if (empty($uploadedFiles)) {
                return $this->json([
                    'error' => 'Aucun fichier uploadé'
                ], Response::HTTP_BAD_REQUEST);
            }

            $uploadedUrls = [];
            $uploadDir = $this->getParameter('kernel.project_dir') . '/public/uploads/listings';
            
            // Créer le dossier s'il n'existe pas
            if (!is_dir($uploadDir)) {
                mkdir($uploadDir, 0777, true);
            }

            foreach ($uploadedFiles as $key => $file) {
                if (!$file || !is_object($file)) {
                    error_log("Upload: Fichier invalide à l'index $key");
                    continue;
                }

                // Valider le type de fichier (tous les formats image courants)
                $allowedMimes = [
                    'image/jpeg', 
                    'image/jpg',
                    'image/png', 
                    'image/webp', 
                    'image/gif',
                    'image/svg+xml',
                    'image/bmp',
                    'image/x-icon'
                ];
                
                $mimeType = $file->getMimeType();
                if (!in_array($mimeType, $allowedMimes)) {
                    error_log("Upload: Type MIME non autorisé: $mimeType");
                    continue;
                }

                // Valider la taille (max 10MB au lieu de 5MB)
                if ($file->getSize() > 10 * 1024 * 1024) {
                    error_log("Upload: Fichier trop grand: " . $file->getSize() . " bytes");
                    continue;
                }

                // Générer un nom unique
                $fileName = uniqid() . '_' . time() . '.' . $file->guessExtension();
                
                // Déplacer le fichier
                $file->move($uploadDir, $fileName);
                
                // Ajouter l'URL publique
                $uploadedUrls[] = '/uploads/listings/' . $fileName;
                error_log("Upload: Image uploadée avec succès: $fileName");
            }

            if (empty($uploadedUrls)) {
                return $this->json([
                    'error' => 'Aucune image valide uploadée'
                ], Response::HTTP_BAD_REQUEST);
            }

            return $this->json([
                'success' => true,
                'urls' => $uploadedUrls,
                'images' => $uploadedUrls, // Compatibilité
                'count' => count($uploadedUrls)
            ]);

        } catch (\Exception $e) {
            return $this->json([
                'error' => 'Erreur lors de l\'upload',
                'message' => $e->getMessage()
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Supprimer une image
     */
    #[Route('/upload/{filename}', name: 'delete_image', methods: ['DELETE'])]
    public function deleteImage(string $filename): JsonResponse
    {
        // ✅ Vérifier que l'utilisateur est authentifié
        $user = $this->getUser();
        if (!$user) {
            return $this->json([
                'error' => 'Non authentifié',
                'message' => 'Vous devez être connecté pour supprimer des images'
            ], Response::HTTP_UNAUTHORIZED);
        }
        
        try {
            $uploadDir = $this->getParameter('kernel.project_dir') . '/public/uploads/listings';

            // ✅ SECURITY: Sanitize filename to prevent path traversal attacks
            $safeFilename = basename($filename);
            if ($safeFilename !== $filename || str_contains($filename, '..') || str_contains($filename, '/') || str_contains($filename, '\\')) {
                return $this->json([
                    'error' => 'Nom de fichier invalide'
                ], Response::HTTP_BAD_REQUEST);
            }

            $filePath = $uploadDir . '/' . $safeFilename;

            // ✅ SECURITY: Verify resolved path is within upload directory
            $realPath = realpath($filePath);
            $realUploadDir = realpath($uploadDir);
            if ($realPath === false || $realUploadDir === false || !str_starts_with($realPath, $realUploadDir)) {
                return $this->json([
                    'error' => 'Image non trouvée'
                ], Response::HTTP_NOT_FOUND);
            }

            if (file_exists($realPath)) {
                unlink($realPath);
                return $this->json([
                    'success' => true,
                    'message' => 'Image supprimée'
                ]);
            }

            return $this->json([
                'error' => 'Image non trouvée'
            ], Response::HTTP_NOT_FOUND);

        } catch (\Exception $e) {
            return $this->json([
                'error' => 'Erreur lors de la suppression',
                'message' => $e->getMessage()
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }
}
