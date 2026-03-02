# 🚀 Script d'installation automatique Plan B Backend
# Exécuter avec: PowerShell -ExecutionPolicy Bypass -File setup.ps1

Write-Host "═══════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "   🚀 PLAN B - Installation automatique   " -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

# Fonction pour vérifier si une commande existe
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

# 1. Vérifier Docker
Write-Host "📦 Vérification de Docker..." -ForegroundColor Yellow
if (-not (Test-Command "docker")) {
    Write-Host "❌ Docker n'est pas installé !" -ForegroundColor Red
    Write-Host "Téléchargez Docker Desktop depuis: https://www.docker.com/products/docker-desktop" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Instructions:" -ForegroundColor Cyan
    Write-Host "1. Vérifiez votre système: systeminfo | findstr /C:'Type du système'" -ForegroundColor White
    Write-Host "2. Si x64: téléchargez https://desktop.docker.com/win/main/amd64/Docker Desktop Installer.exe" -ForegroundColor White
    Write-Host "3. Si ARM: téléchargez https://desktop.docker.com/win/main/arm64/Docker Desktop Installer.exe" -ForegroundColor White
    exit 1
}
Write-Host "✅ Docker installé!" -ForegroundColor Green

# 2. Vérifier Composer
Write-Host "📦 Vérification de Composer..." -ForegroundColor Yellow
if (-not (Test-Command "composer")) {
    Write-Host "❌ Composer n'est pas installé !" -ForegroundColor Red
    Write-Host "Téléchargez Composer depuis: https://getcomposer.org/download/" -ForegroundColor Yellow
    exit 1
}
Write-Host "✅ Composer installé!" -ForegroundColor Green

# 3. Vérifier PHP
Write-Host "📦 Vérification de PHP..." -ForegroundColor Yellow
if (-not (Test-Command "php")) {
    Write-Host "⚠️  PHP n'est pas installé ou pas dans le PATH!" -ForegroundColor Yellow
    Write-Host "Vous pouvez utiliser Docker uniquement ou installer XAMPP" -ForegroundColor Yellow
    $phpInstalled = $false
} else {
    $phpVersion = php -v
    Write-Host "✅ PHP installé: $($phpVersion -split "`n" | Select-Object -First 1)" -ForegroundColor Green
    $phpInstalled = $true
}

Write-Host ""
Write-Host "═══════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "   📝 Configuration de l'environnement    " -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

# 4. Créer le fichier .env
Write-Host "📝 Création du fichier .env..." -ForegroundColor Yellow
if (Test-Path ".env") {
    Write-Host "⚠️  Le fichier .env existe déjà. Voulez-vous le remplacer? (O/N)" -ForegroundColor Yellow
    $response = Read-Host
    if ($response -ne "O" -and $response -ne "o") {
        Write-Host "➡️  Conservation du fichier .env existant" -ForegroundColor Cyan
    } else {
        Copy-Item ".env.example" ".env" -Force
        Write-Host "✅ Fichier .env créé!" -ForegroundColor Green
    }
} else {
    Copy-Item ".env.example" ".env"
    Write-Host "✅ Fichier .env créé!" -ForegroundColor Green
}

# 5. Générer APP_SECRET aléatoire
Write-Host "🔐 Génération de APP_SECRET..." -ForegroundColor Yellow
$secret = -join ((65..90) + (97..122) + (48..57) | Get-Random -Count 32 | ForEach-Object {[char]$_})
(Get-Content .env) -replace 'APP_SECRET=.*', "APP_SECRET=$secret" | Set-Content .env
Write-Host "✅ APP_SECRET généré!" -ForegroundColor Green

Write-Host ""
Write-Host "═══════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "   🐳 Démarrage de Docker                 " -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

# 6. Démarrer Docker Compose
Write-Host "🐳 Démarrage de la base de données PostgreSQL..." -ForegroundColor Yellow
docker-compose up -d database adminer

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Base de données démarrée!" -ForegroundColor Green
    Write-Host "📊 Adminer disponible sur: http://localhost:8080" -ForegroundColor Cyan
} else {
    Write-Host "❌ Erreur lors du démarrage de Docker!" -ForegroundColor Red
    Write-Host "Vérifiez que Docker Desktop est lancé" -ForegroundColor Yellow
    exit 1
}

# Attendre que PostgreSQL soit prêt
Write-Host "⏳ Attente du démarrage complet de PostgreSQL..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

Write-Host ""
Write-Host "═══════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "   📦 Installation des dépendances        " -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

if ($phpInstalled) {
    # 7. Installer les dépendances Composer
    Write-Host "📦 Installation des dépendances PHP..." -ForegroundColor Yellow
    composer install
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Dépendances installées!" -ForegroundColor Green
    } else {
        Write-Host "❌ Erreur lors de l'installation des dépendances!" -ForegroundColor Red
        exit 1
    }
    
    Write-Host ""
    Write-Host "═══════════════════════════════════════════" -ForegroundColor Cyan
    Write-Host "   🔐 Configuration JWT                   " -ForegroundColor Cyan
    Write-Host "═══════════════════════════════════════════" -ForegroundColor Cyan
    Write-Host ""
    
    # 8. Générer les clés JWT
    Write-Host "🔐 Génération des clés JWT..." -ForegroundColor Yellow
    php bin/console lexik:jwt:generate-keypair --skip-if-exists
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Clés JWT générées!" -ForegroundColor Green
    }
    
    Write-Host ""
    Write-Host "═══════════════════════════════════════════" -ForegroundColor Cyan
    Write-Host "   🗄️  Création de la base de données     " -ForegroundColor Cyan
    Write-Host "═══════════════════════════════════════════" -ForegroundColor Cyan
    Write-Host ""
    
    # 9. Créer la base de données
    Write-Host "🗄️  Création de la base de données..." -ForegroundColor Yellow
    php bin/console doctrine:database:create --if-not-exists
    
    # 10. Exécuter les migrations
    Write-Host "📋 Exécution des migrations..." -ForegroundColor Yellow
    php bin/console doctrine:migrations:migrate --no-interaction
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Base de données créée et migrations appliquées!" -ForegroundColor Green
    }
    
    # 11. Vider le cache
    Write-Host "🧹 Nettoyage du cache..." -ForegroundColor Yellow
    php bin/console cache:clear
    Write-Host "✅ Cache vidé!" -ForegroundColor Green
    
} else {
    Write-Host "⚠️  PHP n'est pas installé, utilisation de Docker pour les commandes..." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Exécutez ces commandes manuellement dans le conteneur:" -ForegroundColor Cyan
    Write-Host "docker exec -it planb_api composer install" -ForegroundColor White
    Write-Host "docker exec -it planb_api php bin/console lexik:jwt:generate-keypair" -ForegroundColor White
    Write-Host "docker exec -it planb_api php bin/console doctrine:migrations:migrate" -ForegroundColor White
}

Write-Host ""
Write-Host "═══════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "   🎉 INSTALLATION TERMINÉE !              " -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

Write-Host "✅ Votre backend Plan B est prêt !" -ForegroundColor Green
Write-Host ""
Write-Host "🌐 Accès:" -ForegroundColor Cyan
if ($phpInstalled) {
    Write-Host "   API: Démarrez avec 'php -S localhost:8000 -t public'" -ForegroundColor White
}
Write-Host "   Base de données: http://localhost:8080 (Adminer)" -ForegroundColor White
Write-Host "     Serveur: database" -ForegroundColor Gray
Write-Host "     Utilisateur: postgres" -ForegroundColor Gray
Write-Host "     Mot de passe: root" -ForegroundColor Gray
Write-Host "     Base: planb" -ForegroundColor Gray
Write-Host ""
Write-Host "📚 Documentation:" -ForegroundColor Cyan
Write-Host "   Guide Docker: GUIDE_INSTALLATION_DOCKER.md" -ForegroundColor White
Write-Host "   WhatsApp vs Site: ANALYSE_WHATSAPP_VS_SITE.md" -ForegroundColor White
Write-Host "   README: README.md" -ForegroundColor White
Write-Host ""
Write-Host "🧪 Testez l'API:" -ForegroundColor Cyan
if ($phpInstalled) {
    Write-Host "   php -S localhost:8000 -t public" -ForegroundColor White
    Write-Host "   Puis ouvrez: http://localhost:8000" -ForegroundColor White
}
Write-Host ""
Write-Host "🎓 Bon développement ! 🚀" -ForegroundColor Green
