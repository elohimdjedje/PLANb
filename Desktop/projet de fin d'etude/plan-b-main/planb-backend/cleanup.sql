-- Voir tous les utilisateurs
SELECT id, email, first_name, last_name, created_at FROM "user" ORDER BY created_at DESC;

-- Compter les utilisateurs
SELECT COUNT(*) as total_users FROM "user";
