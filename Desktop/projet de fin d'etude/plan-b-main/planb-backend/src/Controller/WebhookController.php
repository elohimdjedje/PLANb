<?php

namespace App\Controller;

use App\Entity\Payment;
use App\Entity\WebhookLog;
use App\Service\PayTechService;
use App\Service\KKiaPayService;
use App\Service\WebhookProcessor;
use Doctrine\ORM\EntityManagerInterface;
use Psr\Log\LoggerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

/**
 * Contrôleur pour gérer les webhooks de paiement
 * Routes publiques mais sécurisées par signature
 * Utilise PayTech et KKiaPay comme agrégateurs
 */
#[Route('/api/v1/webhooks')]
class WebhookController extends AbstractController
{
    public function __construct(
        private EntityManagerInterface $entityManager,
        private PayTechService $payTechService,
        private KKiaPayService $kkiaPayService,
        private WebhookProcessor $webhookProcessor,
        private LoggerInterface $logger
    ) {
    }

    /**
     * @deprecated Utilisez PayTech ou KKiaPay à la place
     * Les webhooks Wave directs ne sont plus supportés
     */
    #[Route('/wave', name: 'app_webhook_wave', methods: ['POST'])]
    public function waveWebhook(Request $request): JsonResponse
    {
        $this->logger->info('Wave webhook deprecated - use PayTech instead');
        return $this->json([
            'error' => 'Deprecated: Utilisez PayTech (/api/webhook/paytech) ou KKiaPay (/api/webhook/kkiapay)',
            'redirect' => '/api/webhook/paytech'
        ], Response::HTTP_GONE);
    }

    /**
     * @deprecated Utilisez PayTech ou KKiaPay à la place
     * Les webhooks Orange Money directs ne sont plus supportés
     */
    #[Route('/orange-money', name: 'app_webhook_orange_money', methods: ['POST'])]
    public function orangeMoneyWebhook(Request $request): JsonResponse
    {
        $this->logger->info('Orange Money webhook deprecated - use PayTech instead');
        return $this->json([
            'error' => 'Deprecated: Utilisez PayTech (/api/webhook/paytech) ou KKiaPay (/api/webhook/kkiapay)',
            'redirect' => '/api/webhook/paytech'
        ], Response::HTTP_GONE);
    }

    /**
     * Endpoint de test pour les webhooks (développement uniquement)
     * 
     * POST /api/v1/webhooks/test
     */
    #[Route('/test', name: 'app_webhook_test', methods: ['POST'])]
    public function testWebhook(Request $request): JsonResponse
    {
        // Désactiver en production
        if ($this->getParameter('kernel.environment') === 'prod') {
            return $this->json(['error' => 'Non disponible en production'], Response::HTTP_FORBIDDEN);
        }

        $data = json_decode($request->getContent(), true);
        $provider = $data['provider'] ?? 'wave';

        $this->logger->info('Test webhook received', [
            'provider' => $provider,
            'data' => $data
        ]);

        return $this->json([
            'success' => true,
            'message' => 'Webhook de test reçu',
            'provider' => $provider,
            'data' => $data
        ]);
    }

    /**
     * Liste des webhooks reçus (admin uniquement)
     * 
     * GET /api/v1/webhooks/logs
     */
    #[Route('/logs', name: 'app_webhook_logs', methods: ['GET'])]
    #[\Symfony\Component\Security\Http\Attribute\IsGranted('ROLE_ADMIN')]
    public function getWebhookLogs(Request $request): JsonResponse
    {

        $limit = (int) ($request->query->get('limit') ?? 50);
        $offset = (int) ($request->query->get('offset') ?? 0);
        $provider = $request->query->get('provider');

        $repository = $this->entityManager->getRepository(WebhookLog::class);
        $queryBuilder = $repository->createQueryBuilder('w')
            ->orderBy('w.createdAt', 'DESC')
            ->setMaxResults($limit)
            ->setFirstResult($offset);

        if ($provider) {
            $queryBuilder->andWhere('w.provider = :provider')
                ->setParameter('provider', $provider);
        }

        $webhooks = $queryBuilder->getQuery()->getResult();

        $data = array_map(function($webhook) {
            return [
                'id' => $webhook->getId(),
                'provider' => $webhook->getProvider(),
                'transaction_id' => $webhook->getTransactionId(),
                'event_type' => $webhook->getEventType(),
                'status' => $webhook->getStatus(),
                'error_message' => $webhook->getErrorMessage(),
                'ip_address' => $webhook->getIpAddress(),
                'created_at' => $webhook->getCreatedAt()->format('c'),
                'processed_at' => $webhook->getProcessedAt()?->format('c')
            ];
        }, $webhooks);

        return $this->json([
            'webhooks' => $data,
            'total' => count($data)
        ]);
    }
}


