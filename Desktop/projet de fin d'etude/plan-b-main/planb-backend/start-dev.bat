@echo off
echo ======================================
echo    PLAN B - DEMARRAGE DEVELOPPEMENT
echo ======================================
echo.

echo [1/3] Verification Docker...
docker ps >nul 2>&1
if %errorlevel% neq 0 (
    echo ERREUR: Docker Desktop n'est pas demarre !
    echo Veuillez demarrer Docker Desktop et reessayer.
    pause
    exit /b 1
)
echo    Docker OK

echo.
echo [2/3] Demarrage PostgreSQL...
docker-compose up -d database
echo    PostgreSQL demarre

echo.
echo [3/3] Demarrage serveur Symfony...
echo.
echo ======================================
echo  Backend disponible sur:
echo  http://localhost:8000
echo.
echo  Adminer (DB) disponible sur:
echo  http://localhost:8080
echo.
echo  Appuyez sur Ctrl+C pour arreter
echo ======================================
echo.

php -S localhost:8000 -t public
