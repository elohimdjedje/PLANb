@echo off
echo ================================================
echo   PLAN B - INSTALLATION AUTOMATIQUE
echo ================================================
echo.

echo [1/6] Installation des dependances PHP...
call composer install
if %errorlevel% neq 0 (
    echo ERREUR: Installation composer echouee
    pause
    exit /b %errorlevel%
)
echo.

echo [2/6] Copie du fichier .env...
if not exist .env (
    copy .env.example .env
    echo Fichier .env cree. IMPORTANT: Editez .env avec vos parametres de BDD!
    pause
) else (
    echo Fichier .env existe deja
)
echo.

echo [3/6] Generation des cles JWT...
php bin/console lexik:jwt:generate-keypair --skip-if-exists
echo.

echo [4/6] Creation de la base de donnees...
php bin/console doctrine:database:create --if-not-exists
echo.

echo [5/6] Execution des migrations...
php bin/console doctrine:migrations:migrate --no-interaction
echo.

echo [6/6] Nettoyage du cache...
php bin/console cache:clear
echo.

echo ================================================
echo   INSTALLATION TERMINEE AVEC SUCCES !
echo ================================================
echo.
echo Lancement du serveur...
echo API disponible sur: http://localhost:8000
echo.
echo Appuyez sur Ctrl+C pour arreter le serveur
echo.
php -S localhost:8000 -t public

pause
