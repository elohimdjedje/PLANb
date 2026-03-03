-- Création du compte admin Mickael
INSERT INTO users (
    id,
    email, 
    phone, 
    password, 
    roles, 
    first_name, 
    last_name,
    account_type,
    is_email_verified,
    is_phone_verified,
    is_lifetime_pro,
    is_banned,
    is_suspended,
    is_verified, 
    account_category, 
    verification_status, 
    verified_at, 
    created_at, 
    updated_at
) VALUES (
    nextval('users_id_seq'),
    'mickaeldjedje7@gmail.com',
    '+2250705516267',
    '$2y$13$LmYvKz5xKz5xKz5xKz5xKuHj8vN9mL2kP4oQ6sT8wX0yB3dF5gI7k',
    '["ROLE_ADMIN", "ROLE_USER"]',
    'Mickael',
    'Djedje',
    'pro',
    true,
    true,
    true,
    false,
    false,
    true,
    'pro',
    'verified',
    NOW(),
    NOW(),
    NOW()
);

SELECT id, email, roles, account_type, account_category, verification_status, is_verified FROM users WHERE email = 'mickaeldjedje7@gmail.com';
