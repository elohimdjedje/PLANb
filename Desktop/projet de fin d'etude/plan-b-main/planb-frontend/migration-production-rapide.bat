@echo off
echo ========================================
echo   MIGRATION PRODUCTION - PLAN B
echo ========================================
echo.

echo [1/5] Sauvegarde des fichiers actuels...
cd src\utils
if exist auth.js copy /Y auth.js auth.js.backup
if exist listings.js copy /Y listings.js listings.js.backup
if exist subscription.js copy /Y subscription.js subscription.js.backup
echo ✅ Fichiers sauvegardés

echo.
echo [2/5] Copie des fichiers de production...
if exist auth.clean.js (
    copy /Y auth.clean.js auth.js
    echo ✅ auth.js mis à jour
) else (
    echo ❌ auth.clean.js introuvable !
)

if exist listings.clean.js (
    copy /Y listings.clean.js listings.js
    echo ✅ listings.js mis à jour
) else (
    echo ❌ listings.clean.js introuvable !
)

if exist subscription.clean.js (
    copy /Y subscription.clean.js subscription.js
    echo ✅ subscription.js mis à jour
) else (
    echo ❌ subscription.clean.js introuvable !
)

echo.
echo [3/5] Vérification du fichier .env...
cd ..\..
if exist .env (
    echo ✅ .env trouvé
    findstr /C:"VITE_APP_MODE=production" .env > nul
    if errorlevel 1 (
        echo ⚠️  VITE_APP_MODE n'est pas en production !
        echo    Veuillez modifier .env manuellement
    ) else (
        echo ✅ Mode production activé
    )
) else (
    echo ❌ .env introuvable !
    echo    Créez un fichier .env avec :
    echo    VITE_APP_MODE=production
    echo    VITE_API_URL=http://localhost:8000/api/v1
)

echo.
echo [4/5] Nettoyage du cache...
if exist node_modules\.vite (
    rmdir /S /Q node_modules\.vite
    echo ✅ Cache Vite supprimé
)

echo.
echo [5/5] Migration terminée !
echo.
echo ========================================
echo   PROCHAINES ÉTAPES
echo ========================================
echo.
echo 1. Vérifiez que Docker tourne (docker ps)
echo 2. Lancez le backend si nécessaire
echo 3. Lancez le frontend : npm run dev
echo 4. Allez sur http://localhost:5174/auth/register
echo 5. Créez un compte
echo 6. Vérifiez dans Adminer : http://localhost:8080
echo.
echo ========================================
pause
