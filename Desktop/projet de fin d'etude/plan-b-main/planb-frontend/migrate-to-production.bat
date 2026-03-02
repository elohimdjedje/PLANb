@echo off
echo ========================================
echo   MIGRATION VERS MODE PRODUCTION
echo   Plan B Frontend
echo ========================================
echo.

:: Confirmation
set /p confirm="Voulez-vous migrer vers le mode production ? (O/N): "
if /i not "%confirm%"=="O" (
    echo Migration annulee.
    exit /b
)

echo.
echo [1/5] Sauvegarde des fichiers actuels...
if not exist backup mkdir backup
copy src\utils\listings.js backup\listings.backup.js >nul 2>&1
copy src\utils\auth.js backup\auth.backup.js >nul 2>&1
copy src\utils\subscription.js backup\subscription.backup.js >nul 2>&1
echo ✅ Sauvegarde terminee

echo.
echo [2/5] Remplacement par les versions production...
copy /Y src\utils\listings.clean.js src\utils\listings.js >nul
copy /Y src\utils\auth.clean.js src\utils\auth.js >nul
copy /Y src\utils\subscription.clean.js src\utils\subscription.js >nul
echo ✅ Fichiers remplaces

echo.
echo [3/5] Configuration de l'environnement...
(
echo VITE_APP_MODE=production
echo VITE_API_URL=http://localhost:8000/api/v1
) > .env
echo ✅ Fichier .env cree

echo.
echo [4/5] Verification du backend...
curl -s http://localhost:8000/api/v1/listings >nul 2>&1
if errorlevel 1 (
    echo ⚠️  Le backend ne repond pas !
    echo    Assurez-vous que le backend est lance :
    echo    cd ..\planb-backend
    echo    symfony server:start
    echo.
) else (
    echo ✅ Backend accessible
)

echo.
echo [5/5] Migration terminee !
echo.
echo ========================================
echo   PROCHAINES ETAPES
echo ========================================
echo.
echo 1. Verifier que le backend est lance
echo 2. Redemarrer le frontend : npm run dev
echo 3. Tester l'inscription et la connexion
echo 4. Creer une annonce de test
echo.
echo Documentation : MIGRATION_PRODUCTION.md
echo.
pause
