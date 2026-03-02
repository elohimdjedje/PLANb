<?php

namespace App\Service;

use App\Entity\User;
use Psr\Log\LoggerInterface;
use Symfony\Component\Mailer\MailerInterface;
use Symfony\Component\Mime\Email;
use App\Service\EmailService;

/**
 * Service de gestion des notifications (email, push, etc.)
 */
class NotificationService
{
    public function __construct(
        private MailerInterface $mailer,
        private SMSService $smsService,
        private LoggerInterface $logger,
        private EmailService $emailService
    ) {
    }

    /**
     * Notifier un nouvel abonnement PRO
     */
    public function notifyNewSubscription(User $user): void
    {
        try {
            $email = (new Email())
                ->from('noreply@planb.ci')
                ->to($user->getEmail())
                ->subject('Bienvenue dans Plan B PRO ! 🎉')
                ->html($this->getSubscriptionEmailTemplate($user));

            $this->mailer->send($email);
            
            $this->logger->info('Subscription notification sent', [
                'userId' => $user->getId(),
                'email' => $user->getEmail()
            ]);
        } catch (\Exception $e) {
            $this->logger->error('Failed to send subscription notification', [
                'error' => $e->getMessage(),
                'userId' => $user->getId()
            ]);
        }
    }

    /**
     * Notifier l'expiration prochaine d'un abonnement
     */
    public function notifySubscriptionExpiringSoon(User $user, int $daysRemaining): void
    {
        try {
            $email = (new Email())
                ->from('noreply@planb.ci')
                ->to($user->getEmail())
                ->subject("Votre abonnement PRO expire dans {$daysRemaining} jours")
                ->html($this->getExpirationWarningTemplate($user, $daysRemaining));

            $this->mailer->send($email);
            
            // Envoyer aussi un SMS
            $message = "Plan B : Votre abonnement PRO expire dans {$daysRemaining} jours. Renouvelez maintenant sur app.planb.ci";
            $this->smsService->send($user->getPhone(), $message);
            
        } catch (\Exception $e) {
            $this->logger->error('Failed to send expiration warning', [
                'error' => $e->getMessage(),
                'userId' => $user->getId()
            ]);
        }
    }

    /**
     * Notifier un nouveau message
     */
    public function notifyNewMessage(User $recipient, User $sender, string $listingTitle): void
    {
        try {
            // Email
            $email = (new Email())
                ->from('noreply@planb.ci')
                ->to($recipient->getEmail())
                ->subject("Nouveau message concernant : {$listingTitle}")
                ->html($this->getNewMessageTemplate($recipient, $sender, $listingTitle));

            $this->mailer->send($email);
            
            // Push notification (à implémenter avec Firebase Cloud Messaging)
            // $this->sendPushNotification($recipient, ...);
            
        } catch (\Exception $e) {
            $this->logger->error('Failed to send message notification', [
                'error' => $e->getMessage(),
                'recipientId' => $recipient->getId()
            ]);
        }
    }

    /**
     * Notifier la publication d'une annonce
     */
    public function notifyListingPublished(User $user, string $listingTitle): void
    {
        try {
            $email = (new Email())
                ->from('noreply@planb.ci')
                ->to($user->getEmail())
                ->subject('Votre annonce est en ligne ! 🚀')
                ->html($this->getListingPublishedTemplate($user, $listingTitle));

            $this->mailer->send($email);
            
        } catch (\Exception $e) {
            $this->logger->error('Failed to send listing published notification', [
                'error' => $e->getMessage(),
                'userId' => $user->getId()
            ]);
        }
    }

    /**
     * Notifier l'expiration prochaine d'une annonce
     */
    public function notifyListingExpiringSoon(User $user, string $listingTitle, int $daysRemaining): void
    {
        try {
            $message = "Plan B : Votre annonce \"{$listingTitle}\" expire dans {$daysRemaining} jours.";
            $this->smsService->send($user->getPhone(), $message);
            
        } catch (\Exception $e) {
            $this->logger->error('Failed to send listing expiration warning', [
                'error' => $e->getMessage(),
                'userId' => $user->getId()
            ]);
        }
    }

    /**
     * Templates HTML des emails
     */
    private function getSubscriptionEmailTemplate(User $user): string
    {
        return "
            <h2>Bienvenue dans Plan B PRO, {$user->getFirstName()} ! 🎉</h2>
            <p>Votre abonnement PRO est maintenant actif.</p>
            <p><strong>Vos avantages :</strong></p>
            <ul>
                <li>✅ Annonces illimitées</li>
                <li>✅ Badge PRO visible</li>
                <li>✅ Statistiques avancées</li>
                <li>✅ Mise en avant de vos annonces</li>
                <li>✅ Durée de publication : 60 jours</li>
            </ul>
            <p>Commencez dès maintenant à publier vos annonces !</p>
            <a href='https://app.planb.ci/publish' style='background-color: #FF6B35; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;'>Publier une annonce</a>
        ";
    }

    private function getExpirationWarningTemplate(User $user, int $daysRemaining): string
    {
        return "
            <h2>Bonjour {$user->getFirstName()},</h2>
            <p>Votre abonnement Plan B PRO expire dans <strong>{$daysRemaining} jours</strong>.</p>
            <p>Renouvelez maintenant pour continuer à profiter de tous les avantages PRO !</p>
            <a href='https://app.planb.ci/my-subscription' style='background-color: #FF6B35; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;'>Renouveler mon abonnement</a>
        ";
    }

    private function getNewMessageTemplate(User $recipient, User $sender, string $listingTitle): string
    {
        return "
            <h2>Bonjour {$recipient->getFirstName()},</h2>
            <p><strong>{$sender->getFullName()}</strong> vous a envoyé un message concernant votre annonce :</p>
            <p><em>\"{$listingTitle}\"</em></p>
            <a href='https://app.planb.ci/conversations' style='background-color: #FF6B35; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;'>Voir le message</a>
        ";
    }

    private function getListingPublishedTemplate(User $user, string $listingTitle): string
    {
        return "
            <h2>Félicitations {$user->getFirstName()} ! 🚀</h2>
            <p>Votre annonce <strong>\"{$listingTitle}\"</strong> est maintenant en ligne.</p>
            <p>Partagez-la pour augmenter votre visibilité !</p>
            <a href='https://app.planb.ci/profile' style='background-color: #FF6B35; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;'>Voir mes annonces</a>
        ";
    }

    /**
     * Notifier un vendeur d'un nouvel avis
     */
    public function notifyNewReview(User $seller, User $reviewer, string $listingTitle, int $rating): void
    {
        try {
            $stars = str_repeat('⭐', $rating);
            $email = (new Email())
                ->from('noreply@planb.ci')
                ->to($seller->getEmail())
                ->subject("Nouvel avis sur votre annonce : {$listingTitle}")
                ->html($this->getNewReviewTemplate($seller, $reviewer, $listingTitle, $rating, $stars));

            $this->mailer->send($email);
            
            $this->logger->info('Review notification sent', [
                'sellerId' => $seller->getId(),
                'reviewerId' => $reviewer->getId(),
                'rating' => $rating
            ]);
        } catch (\Exception $e) {
            $this->logger->error('Failed to send review notification', [
                'error' => $e->getMessage(),
                'sellerId' => $seller->getId()
            ]);
        }
    }

    /**
     * Notifier un vendeur d'une nouvelle offre
     */
    public function notifyNewOffer(User $seller, User $buyer, string $listingTitle, float $amount): void
    {
        try {
            $email = (new Email())
                ->from('noreply@planb.ci')
                ->to($seller->getEmail())
                ->subject("Nouvelle offre reçue : {$listingTitle}")
                ->html($this->getNewOfferTemplate($seller, $buyer, $listingTitle, $amount));

            $this->mailer->send($email);
            
            $this->logger->info('New offer notification sent', [
                'sellerId' => $seller->getId(),
                'buyerId' => $buyer->getId(),
                'amount' => $amount
            ]);
        } catch (\Exception $e) {
            $this->logger->error('Failed to send new offer notification', [
                'error' => $e->getMessage(),
                'sellerId' => $seller->getId()
            ]);
        }
    }

    /**
     * Notifier un acheteur que son offre a été acceptée
     */
    public function notifyOfferAccepted(User $buyer, User $seller, string $listingTitle, float $amount): void
    {
        try {
            $email = (new Email())
                ->from('noreply@planb.ci')
                ->to($buyer->getEmail())
                ->subject("🎉 Votre offre a été acceptée : {$listingTitle}")
                ->html($this->getOfferAcceptedTemplate($buyer, $seller, $listingTitle, $amount));

            $this->mailer->send($email);
            
            // SMS pour les offres acceptées
            $message = "Plan B : Bonne nouvelle ! Votre offre de " . number_format($amount, 0, ',', ' ') . " FCFA pour \"{$listingTitle}\" a été acceptée.";
            $this->smsService->send($buyer->getPhone(), $message);
            
        } catch (\Exception $e) {
            $this->logger->error('Failed to send offer accepted notification', [
                'error' => $e->getMessage(),
                'buyerId' => $buyer->getId()
            ]);
        }
    }

    /**
     * Notifier un acheteur que son offre a été refusée
     */
    public function notifyOfferRejected(User $buyer, User $seller, string $listingTitle): void
    {
        try {
            $email = (new Email())
                ->from('noreply@planb.ci')
                ->to($buyer->getEmail())
                ->subject("Offre refusée : {$listingTitle}")
                ->html($this->getOfferRejectedTemplate($buyer, $seller, $listingTitle));

            $this->mailer->send($email);
            
        } catch (\Exception $e) {
            $this->logger->error('Failed to send offer rejected notification', [
                'error' => $e->getMessage(),
                'buyerId' => $buyer->getId()
            ]);
        }
    }

    /**
     * Notifier un acheteur d'une contre-offre
     */
    public function notifyCounterOffer(User $buyer, User $seller, string $listingTitle, float $counterAmount): void
    {
        try {
            $email = (new Email())
                ->from('noreply@planb.ci')
                ->to($buyer->getEmail())
                ->subject("Contre-offre reçue : {$listingTitle}")
                ->html($this->getCounterOfferTemplate($buyer, $seller, $listingTitle, $counterAmount));

            $this->mailer->send($email);
            
            // SMS pour les contre-offres
            $message = "Plan B : Contre-offre de " . number_format($counterAmount, 0, ',', ' ') . " FCFA pour \"{$listingTitle}\". Consultez l'app.";
            $this->smsService->send($buyer->getPhone(), $message);
            
        } catch (\Exception $e) {
            $this->logger->error('Failed to send counter offer notification', [
                'error' => $e->getMessage(),
                'buyerId' => $buyer->getId()
            ]);
        }
    }

    private function getNewReviewTemplate(User $seller, User $reviewer, string $listingTitle, int $rating, string $stars): string
    {
        return "
            <h2>Bonjour {$seller->getFirstName()},</h2>
            <p><strong>{$reviewer->getFullName()}</strong> a laissé un avis sur votre annonce :</p>
            <p><em>\"{$listingTitle}\"</em></p>
            <p>Note : {$stars} ({$rating}/5)</p>
            <a href='https://app.planb.ci/profile' style='background-color: #FF6B35; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;'>Voir l'avis</a>
        ";
    }

    private function getNewOfferTemplate(User $seller, User $buyer, string $listingTitle, float $amount): string
    {
        $formattedAmount = number_format($amount, 0, ',', ' ');
        return "
            <h2>Nouvelle offre reçue ! 💰</h2>
            <p>Bonjour {$seller->getFirstName()},</p>
            <p><strong>{$buyer->getFullName()}</strong> a fait une offre sur votre annonce :</p>
            <p><em>\"{$listingTitle}\"</em></p>
            <p>Montant proposé : <strong>{$formattedAmount} FCFA</strong></p>
            <a href='https://app.planb.ci/offers' style='background-color: #FF6B35; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;'>Voir l'offre</a>
        ";
    }

    private function getOfferAcceptedTemplate(User $buyer, User $seller, string $listingTitle, float $amount): string
    {
        $formattedAmount = number_format($amount, 0, ',', ' ');
        return "
            <h2>🎉 Félicitations {$buyer->getFirstName()} !</h2>
            <p>Votre offre de <strong>{$formattedAmount} FCFA</strong> a été acceptée !</p>
            <p>Annonce : <em>\"{$listingTitle}\"</em></p>
            <p>Vendeur : {$seller->getFullName()}</p>
            <p>Contactez le vendeur pour finaliser la transaction.</p>
            <a href='https://app.planb.ci/conversations' style='background-color: #28a745; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;'>Contacter le vendeur</a>
        ";
    }

    private function getOfferRejectedTemplate(User $buyer, User $seller, string $listingTitle): string
    {
        return "
            <h2>Bonjour {$buyer->getFirstName()},</h2>
            <p>Malheureusement, votre offre pour l'annonce suivante a été refusée :</p>
            <p><em>\"{$listingTitle}\"</em></p>
            <p>N'hésitez pas à faire une nouvelle offre ou à explorer d'autres annonces similaires.</p>
            <a href='https://app.planb.ci/search' style='background-color: #FF6B35; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;'>Voir d'autres annonces</a>
        ";
    }

    private function getCounterOfferTemplate(User $buyer, User $seller, string $listingTitle, float $counterAmount): string
    {
        $formattedAmount = number_format($counterAmount, 0, ',', ' ');
        return "
            <h2>Contre-offre reçue ! 🔄</h2>
            <p>Bonjour {$buyer->getFirstName()},</p>
            <p><strong>{$seller->getFullName()}</strong> vous a envoyé une contre-offre pour :</p>
            <p><em>\"{$listingTitle}\"</em></p>
            <p>Nouveau montant proposé : <strong>{$formattedAmount} FCFA</strong></p>
            <a href='https://app.planb.ci/offers' style='background-color: #FF6B35; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;'>Répondre à la contre-offre</a>
        ";
    }
}
