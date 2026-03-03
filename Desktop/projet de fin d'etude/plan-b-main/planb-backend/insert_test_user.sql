-- Supprimer l'utilisateur s'il existe déjà
DELETE FROM users WHERE email = 'test@planb.local';

-- Insert un utilisateur de test avec email vérifié
INSERT INTO users(
    id,
    email, 
    password, 
    first_name, 
    last_name, 
    phone,
    roles, 
    account_type, 
    is_email_verified, 
    is_phone_verified, 
    is_lifetime_pro, 
    is_banned, 
    is_suspended, 
    account_category, 
    created_at, 
    updated_at
) VALUES (
    999,
    'test@planb.local',
    '$2y$10$QK4v.QRvMgZfqmAK9xQQRum8K6pGHbFrDH62pGGJv.b5QK1I4xHLe',  -- password: password123
    'Test',
    'User',
    '+225000000000',
    '["ROLE_USER"]'::jsonb,
    'particulier',
    true,
    true,
    false,
    false,
    false,
    'professionnel',
    NOW(),
    NOW()
);

SELECT 'Utilisateur de test créé avec succès' AS status;
SELECT id, email, is_email_verified FROM users WHERE email = 'test@planb.local';
