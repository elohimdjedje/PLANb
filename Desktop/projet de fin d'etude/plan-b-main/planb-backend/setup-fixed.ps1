# Script d'installation automatique Plan B Backend
# Executer avec: PowerShell -ExecutionPolicy Bypass -File setup-fixed.ps1

Write-Host "=======================================" -ForegroundColor Cyan
Write-Host "   PLAN B - Installation automatique   " -ForegroundColor Cyan
Write-Host "=======================================" -ForegroundColor Cyan
Write-Host ""

# Fonction pour verifier si une commande existe
function Test-Command {
    param($Command)
    try {
        if (Get-Command $Command -ErrorAction Stop) {
            return $true
        }
    }
    catch {
        return $false
    }
}

# 1. Verifier Docker
Write-Host "Verification de Docker..." -ForegroundColor Yellow
if (-not (Test-Command "docker")) {
    Write-Host "ERREUR: Docker n'est pas installe !" -ForegroundColor Red
    Write-Host "Telechargez Docker Desktop depuis: https://www.docker.com/products/docker-desktop" -ForegroundColor Yellow
    exit 1
}
Write-Host "OK: Docker installe!" -ForegroundColor Green

# 2. Verifier Composer
Write-Host "Verification de Composer..." -ForegroundColor Yellow
if (-not (Test-Command "composer")) {
    Write-Host "ERREUR: Composer n'est pas installe !" -ForegroundColor Red
    Write-Host "Telechargez Composer depuis: https://getcomposer.org/download/" -ForegroundColor Yellow
    exit 1
}
Write-Host "OK: Composer installe!" -ForegroundColor Green

# 3. Verifier PHP
Write-Host "Verification de PHP..." -ForegroundColor Yellow
if (-not (Test-Command "php")) {
    Write-Host "ATTENTION: PHP n'est pas installe ou pas dans le PATH!" -ForegroundColor Yellow
    Write-Host "Vous pouvez utiliser Docker uniquement ou installer XAMPP" -ForegroundColor Yellow
    $phpInstalled = $false
} else {
    $phpVersion = php -v
    Write-Host "OK: PHP installe" -ForegroundColor Green
    $phpInstalled = $true
}

Write-Host ""
Write-Host "=======================================" -ForegroundColor Cyan
Write-Host "   Configuration de l'environnement    " -ForegroundColor Cyan
Write-Host "=======================================" -ForegroundColor Cyan
Write-Host ""

# 4. Creer le fichier .env
Write-Host "Creation du fichier .env..." -ForegroundColor Yellow
if (Test-Path ".env") {
    Write-Host "ATTENTION: Le fichier .env existe deja. Voulez-vous le remplacer? (O/N)" -ForegroundColor Yellow
    $response = Read-Host
    if ($response -ne "O" -and $response -ne "o") {
        Write-Host "Conservation du fichier .env existant" -ForegroundColor Cyan
    } else {
        Copy-Item ".env.example" ".env" -Force
        Write-Host "OK: Fichier .env cree!" -ForegroundColor Green
    }
} else {
    Copy-Item ".env.example" ".env"
    Write-Host "OK: Fichier .env cree!" -ForegroundColor Green
}

# 5. Generer APP_SECRET aleatoire
Write-Host "Generation de APP_SECRET..." -ForegroundColor Yellow
$secret = -join ((65..90) + (97..122) + (48..57) | Get-Random -Count 32 | ForEach-Object {[char]$_})
(Get-Content .env) -replace 'APP_SECRET=.*', "APP_SECRET=$secret" | Set-Content .env
Write-Host "OK: APP_SECRET genere!" -ForegroundColor Green

Write-Host ""
Write-Host "=======================================" -ForegroundColor Cyan
Write-Host "   Demarrage de Docker                 " -ForegroundColor Cyan
Write-Host "=======================================" -ForegroundColor Cyan
Write-Host ""

# 6. Demarrer Docker Compose
Write-Host "Demarrage de la base de donnees PostgreSQL..." -ForegroundColor Yellow
docker-compose up -d database adminer

if ($LASTEXITCODE -eq 0) {
    Write-Host "OK: Base de donnees demarree!" -ForegroundColor Green
    Write-Host "Adminer disponible sur: http://localhost:8080" -ForegroundColor Cyan
} else {
    Write-Host "ERREUR: lors du demarrage de Docker!" -ForegroundColor Red
    Write-Host "Verifiez que Docker Desktop est lance" -ForegroundColor Yellow
    exit 1
}

# Attendre que PostgreSQL soit pret
Write-Host "Attente du demarrage complet de PostgreSQL..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

Write-Host ""
Write-Host "=======================================" -ForegroundColor Cyan
Write-Host "   Installation des dependances        " -ForegroundColor Cyan
Write-Host "=======================================" -ForegroundColor Cyan
Write-Host ""

if ($phpInstalled) {
    # 7. Installer les dependances Composer
    Write-Host "Installation des dependances PHP (cela peut prendre 2-3 minutes)..." -ForegroundColor Yellow
    composer install
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "OK: Dependances installees!" -ForegroundColor Green
    } else {
        Write-Host "ERREUR: lors de l'installation des dependances!" -ForegroundColor Red
        exit 1
    }
    
    Write-Host ""
    Write-Host "=======================================" -ForegroundColor Cyan
    Write-Host "   Configuration JWT                   " -ForegroundColor Cyan
    Write-Host "=======================================" -ForegroundColor Cyan
    Write-Host ""
    
    # 8. Generer les cles JWT
    Write-Host "Generation des cles JWT..." -ForegroundColor Yellow
    php bin/console lexik:jwt:generate-keypair --skip-if-exists
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "OK: Cles JWT generees!" -ForegroundColor Green
    }
    
    Write-Host ""
    Write-Host "=======================================" -ForegroundColor Cyan
    Write-Host "   Creation de la base de donnees     " -ForegroundColor Cyan
    Write-Host "=======================================" -ForegroundColor Cyan
    Write-Host ""
    
    # 9. Creer la base de donnees
    Write-Host "Creation de la base de donnees..." -ForegroundColor Yellow
    php bin/console doctrine:database:create --if-not-exists
    
    # 10. Executer les migrations
    Write-Host "Execution des migrations..." -ForegroundColor Yellow
    php bin/console doctrine:migrations:migrate --no-interaction
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "OK: Base de donnees creee et migrations appliquees!" -ForegroundColor Green
    }
    
    # 11. Vider le cache
    Write-Host "Nettoyage du cache..." -ForegroundColor Yellow
    php bin/console cache:clear
    Write-Host "OK: Cache vide!" -ForegroundColor Green
    
} else {
    Write-Host "ATTENTION: PHP n'est pas installe, utilisation de Docker pour les commandes..." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Executez ces commandes manuellement dans le conteneur:" -ForegroundColor Cyan
    Write-Host "docker exec -it planb_api composer install" -ForegroundColor White
    Write-Host "docker exec -it planb_api php bin/console lexik:jwt:generate-keypair" -ForegroundColor White
    Write-Host "docker exec -it planb_api php bin/console doctrine:migrations:migrate" -ForegroundColor White
}

Write-Host ""
Write-Host "=======================================" -ForegroundColor Cyan
Write-Host "   INSTALLATION TERMINEE !              " -ForegroundColor Cyan
Write-Host "=======================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Votre backend Plan B est pret !" -ForegroundColor Green
Write-Host ""
Write-Host "ACCES:" -ForegroundColor Cyan
if ($phpInstalled) {
    Write-Host "   API: Demarrez avec 'php -S localhost:8000 -t public'" -ForegroundColor White
}
Write-Host "   Base de donnees: http://localhost:8080 (Adminer)" -ForegroundColor White
Write-Host "     Serveur: database" -ForegroundColor Gray
Write-Host "     Utilisateur: postgres" -ForegroundColor Gray
Write-Host "     Mot de passe: root" -ForegroundColor Gray
Write-Host "     Base: planb" -ForegroundColor Gray
Write-Host ""
Write-Host "DOCUMENTATION:" -ForegroundColor Cyan
Write-Host "   Guide Docker: GUIDE_INSTALLATION_DOCKER.md" -ForegroundColor White
Write-Host "   WhatsApp vs Site: ANALYSE_WHATSAPP_VS_SITE.md" -ForegroundColor White
Write-Host "   README: README.md" -ForegroundColor White
Write-Host ""
Write-Host "TESTEZ L'API:" -ForegroundColor Cyan
if ($phpInstalled) {
    Write-Host "   php -S localhost:8000 -t public" -ForegroundColor White
    Write-Host "   Puis ouvrez: http://localhost:8000" -ForegroundColor White
}
Write-Host ""
Write-Host "Bon developpement !" -ForegroundColor Green