-- Corriger le mot de passe de test@planb.local
UPDATE users 
SET password = '$2y$10$/S5Gf55saKIoHNjqV2WXle5aRzM0ScyoczCFa5fSTdk8pjLyGvX1m'
WHERE email = 'test@planb.local';

-- Vérifier
SELECT id, email, password FROM users WHERE email='test@planb.local';
